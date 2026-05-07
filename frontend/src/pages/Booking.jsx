import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { vehicles as staticVehicles } from '../data/vehicles'
import { apiPost, apiPut, apiGet } from '../utils/api'

const GARAGES = [
  'Rajpur Road Garage',
  'Prem Nagar Garage',
  'Sahastradhara Road Garage',
  'Clock Tower Garage',
]


function getErrorMessage(data, fallback) {
  if (data && typeof data.error === 'string') return data.error
  return fallback
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    const fail = () => reject(new Error('Unable to load Razorpay checkout. Please check your internet connection.'))
    const done = () => (window.Razorpay ? resolve() : fail())

    const timeout = window.setTimeout(fail, 10000)
    const cleanupAndResolve = () => {
      window.clearTimeout(timeout)
      done()
    }
    const cleanupAndReject = () => {
      window.clearTimeout(timeout)
      fail()
    }

    if (script && document.readyState === 'complete' && !window.Razorpay) {
      script.remove()
      script = null
    }

    if (!script) {
      script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }

    script.addEventListener('load', cleanupAndResolve, { once: true })
    script.addEventListener('error', cleanupAndReject, { once: true })
  })
}

function calcPrice(vehicle, pickup, dropoff) {
  if (!vehicle || !pickup || !dropoff) return { hours: 0, price: 0 }
  const diffMs = new Date(dropoff) - new Date(pickup)
  const diffHours = diffMs / (1000 * 60 * 60)
  if (diffHours <= 0) return { hours: 0, price: 0 }
  let price = 0
  if (diffHours < 24) {
    price = diffHours * vehicle.pricePerHour
  } else {
    const days = Math.ceil(diffHours / 24)
    price = days * vehicle.pricePerDay
  }
  return { hours: diffHours, price: Math.round(price) }
}

export default function Booking() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = params.get('id')
  const [vehicle, setVehicle] = useState(() => staticVehicles.find(v => String(v.id) === String(id)) || null)

  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [garage, setGarage] = useState(GARAGES[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!vehicle && id) {
      apiGet(`/vehicle/get/${id}`)
        .then(res => { if (res.ok) return res.json() })
        .then(data => {
          if (data) setVehicle({
            ...data,
            vendor: data.vendor ? data.vendor.vendorName : 'Unknown Vendor',
            location: data.vendor ? data.vendor.location : '',
          })
        })
        .catch(() => {})
    }
  }, [id, vehicle])

  const { hours, price } = calcPrice(vehicle, pickup, dropoff)
  const halfAmount = Math.round(price / 2)

  async function handleBook(e) {
    e.preventDefault()
    if (!vehicle) return
    if (!pickup || !dropoff) { setError('Please fill in pickup and dropoff times.'); return }
    if (hours <= 0) { setError('Dropoff must be after pickup.'); return }
    if (halfAmount <= 0) { setError('Payable amount must be greater than zero.'); return }
    setError('')
    setLoading(true)

    try {
      await loadRazorpayCheckout()

      // Step 1: Create booking in PENDING state.
      const userId = localStorage.getItem('userId') || 1
      const bookingRes = await apiPost('/booking/create', {
        vehicleId: vehicle.id,
        userId: parseInt(userId) || 1,
        pickupTime: pickup,
        dropoffTime: dropoff,
        garage,
        notes,
        totalAmount: price,
      })
      const bookingData = await bookingRes.json().catch(() => null)
      if (!bookingRes.ok) {
        throw new Error(getErrorMessage(bookingData, 'Unable to create booking. Please try again.'))
      }

      const bookingId = bookingData.bookingId || bookingData.id
      const bookingRef = bookingData.bookingRef || null
      const serverHalfAmount = Math.round(Number(bookingData.halfAmount || halfAmount))
      if (!bookingId || serverHalfAmount <= 0) {
        throw new Error('Booking was created, but payment details are invalid. Please contact support.')
      }

      // Step 2: Create Razorpay order for exactly 50% advance.
      const orderRes = await apiPost('/payment/create-order', {
        amount: serverHalfAmount,
        currency: 'INR',
        receipt: bookingRef || `booking-${bookingId}`,
      })
      const orderData = await orderRes.json().catch(() => null)
      if (!orderRes.ok || !orderData?.configured || !(orderData.orderId || orderData.id)) {
        throw new Error(getErrorMessage(orderData, 'Razorpay order could not be created. Please check Razorpay keys and try again.'))
      }

      const razorpayOrderId = orderData.orderId || orderData.id
      const razorpayKeyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY
      if (!razorpayKeyId) {
        throw new Error('Razorpay key is missing. Please configure the Razorpay key before accepting online payments.')
      }

      // Step 3: Open Razorpay checkout. Booking is confirmed only after payment succeeds.
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: razorpayKeyId,
          amount: orderData.amount || serverHalfAmount * 100,
          currency: orderData.currency || 'INR',
          name: 'Dehradun Rides',
          description: `50% advance for ${vehicle.name}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const confirmRes = await apiPut(`/booking/payment/${bookingId}`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              const confirmData = await confirmRes.json().catch(() => null)
              if (!confirmRes.ok) {
                throw new Error(getErrorMessage(confirmData, 'Payment verification failed. Please contact support with your Razorpay Payment ID.'))
              }
              const ref = confirmData?.bookingRef || bookingRef || `BR-${bookingId}`
              setSuccess({ ref, razorpayPaymentId: response.razorpay_payment_id })
              resolve()
            } catch (confirmationError) {
              reject(confirmationError instanceof Error
                ? confirmationError
                : new Error('Payment was captured, but booking confirmation failed. Please contact support with your Razorpay Payment ID.'))
            }
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment was cancelled. Your booking is still pending and is not confirmed until the 50% advance is paid.'))
            },
          },
          prefill: {
            name: localStorage.getItem('fullName') || '',
          },
          theme: { color: '#1d4ed8' },
        })
        rzp.on('payment.failed', function (response) {
          reject(new Error(response?.error?.description || 'Razorpay payment failed. Please try again.'))
        })
        rzp.open()
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Vehicle not found.</p>
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-primary text-white text-sm">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold dark:text-white mb-2">Booking Confirmed!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Your Booking ID:</p>
            <p className="text-lg font-mono font-bold text-primary mb-3">{success.ref}</p>
            {success.razorpayPaymentId && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Payment ID: {success.razorpayPaymentId}</p>
            )}
            {success.note && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{success.note}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Please save your booking ID for reference.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 w-full">
        <h1 className="text-xl font-bold dark:text-white mb-1">Book Your Ride</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Fill in details and pay 50% advance online.</p>

        {/* Vehicle Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold dark:text-white">{vehicle.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.vendor} • {vehicle.location}</p>
            <p className="text-xs mt-1">
              <span className="font-medium">₹{vehicle.pricePerHour}/hr</span>
              <span className="text-slate-500 dark:text-slate-400"> · ₹{vehicle.pricePerDay}/day</span>
            </p>
          </div>
          <span className={`text-[11px] px-3 py-1 rounded-full ${
            vehicle.type === 'scooty'
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200'
          }`}>
            {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
          </span>
        </div>

        <form onSubmit={handleBook} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Pickup Date & Time</label>
              <input
                type="datetime-local"
                required
                value={pickup}
                onChange={e => setPickup(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Dropoff Date & Time</label>
              <input
                type="datetime-local"
                required
                value={dropoff}
                onChange={e => setDropoff(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Pickup Garage</label>
            <select
              value={garage}
              onChange={e => setGarage(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {GARAGES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Driving License (upload)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any special requests..."
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Price Summary */}
          {hours > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-300">Duration</span>
                <span className="font-medium dark:text-white">{hours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-300">Total Price</span>
                <span className="font-medium dark:text-white">₹{price}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Pay Now (50%)</span>
                <span className="font-bold text-primary">₹{halfAmount}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Processing…' : `Book & Pay 50% (₹${halfAmount || 0})`}
          </button>
        </form>
      </div>
    </div>
  )
}
