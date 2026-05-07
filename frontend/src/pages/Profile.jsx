import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiGet } from '../utils/api'

function formatDateTime(value) {
  if (!value) return 'Not available'
  const normalized = Array.isArray(value)
    ? new Date(value[0], (value[1] || 1) - 1, value[2] || 1, value[3] || 0, value[4] || 0, value[5] || 0)
    : new Date(value)
  if (Number.isNaN(normalized.getTime())) return String(value)
  return normalized.toLocaleString()
}

function getVehicleName(booking) {
  if (booking.vehicle?.name) return booking.vehicle.name
  return 'Vehicle details unavailable'
}

export default function Profile() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const fullName = localStorage.getItem('fullName') || 'Customer'
  const email = localStorage.getItem('email') || 'Email not available'
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setError('Please login again to view your profile.')
      return
    }

    async function loadBookings() {
      try {
        const res = await apiGet(`/booking/user/${userId}`)
        if (!res.ok) throw new Error('Unable to load booking history.')
        const data = await res.json()
        setBookings(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load booking history.')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [userId])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase mb-1">My Account</p>
            <h1 className="text-2xl font-bold">Profile & Booking History</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View your personal details, booking references, and Razorpay payment IDs.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-fit px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:border-primary hover:text-primary"
          >
            Back to Home
          </button>
        </div>

        <section className="grid md:grid-cols-[320px_1fr] gap-5">
          <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-fit">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold">{fullName}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">User ID: {userId || 'Not available'}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Full Name</p>
                <p className="font-medium">{fullName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium break-all">{email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Bookings</p>
                <p className="font-medium">{bookings.length}</p>
              </div>
            </div>
          </aside>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold">Booking History</h2>
              <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {loading ? 'Loading…' : `${bookings.length} bookings`}
              </span>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2 mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading your bookings…</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🛵</div>
                <p className="text-sm font-medium mb-1">No bookings yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Your completed bookings will appear here after you pay the 50% advance.</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
                >
                  Browse Vehicles
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <article key={booking.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-sm">{getVehicleName(booking)}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Booking Ref: {booking.bookingRef || `BR-${booking.id}`}</p>
                      </div>
                      <span className="w-fit text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {booking.paymentStatus || 'PENDING'}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Booking ID</p>
                        <p className="font-medium">{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Payment Booking ID</p>
                        <p className="font-medium break-all">{booking.razorpayOrderId || 'Not paid yet'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Razorpay Payment ID</p>
                        <p className="font-medium break-all">{booking.razorpayPaymentId || 'Not paid yet'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Garage</p>
                        <p className="font-medium">{booking.garage || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Pickup</p>
                        <p className="font-medium">{formatDateTime(booking.pickupTime)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Dropoff</p>
                        <p className="font-medium">{formatDateTime(booking.dropoffTime)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Total Amount</p>
                        <p className="font-medium">₹{booking.totalAmount || 0}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">50% Advance</p>
                        <p className="font-medium">₹{booking.halfAmount || 0}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}
