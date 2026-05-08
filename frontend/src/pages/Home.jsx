import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { vehicles as staticVehicles } from '../data/vehicles'
import { apiGet } from '../utils/api'

const vendors = [
  {
    name: 'Himalayan Wheels Garage',
    location: 'Rajpur Road, Dehradun',
    desc: 'Popular for city rides: Activa, NTorq, Splendor, FZ and more.',
    badge: '~10 vehicles • Scooty + Bikes',
  },
  {
    name: 'Doon Riders Hub',
    location: 'Prem Nagar, Dehradun',
    desc: 'Touring focused: Classic 350, Bullet, Apache, MT-15, Jupiter, Burgman.',
    badge: '~10 vehicles • More bikes',
  },
  {
    name: 'Mussoorie Highway Rentals',
    location: 'Sahastradhara Road, Dehradun',
    desc: 'Mountain ready: Duke, Himalayan, R15, NS200, Apache 200, Activa 125.',
    badge: '~10 vehicles • Mixed',
  },
]

export default function Home({ initialLoginPrompt = false }) {
  const [filterType, setFilterType] = useState('all')
  const [filterVendor, setFilterVendor] = useState('all')
  const [vehicles, setVehicles] = useState(staticVehicles)
  const [showLoginPrompt, setShowLoginPrompt] = useState(initialLoginPrompt)
  const isLoggedIn = !!localStorage.getItem('loggedIn')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await apiGet('/vehicle/all')
        if (res.ok) {
          const list = await res.json()
          const normalized = list.map(v => ({
            ...v,
            vendor: v.vendor ? v.vendor.vendorName : 'Unknown Vendor',
            location: v.vendor ? v.vendor.location : '',
          }))
          const normalizedIds = new Set(normalized.map(v => String(v.id)))
          setVehicles([...normalized, ...staticVehicles.filter(sv => !normalizedIds.has(String(sv.id)))])
        }
      } catch (_) {}
    }
    loadVehicles()
  }, [])

  const filtered = vehicles.filter(v => {
    const typeMatch = filterType === 'all' || v.type === filterType
    const vendorMatch = filterVendor === 'all' || v.vendor === filterVendor
    return typeMatch && vendorMatch
  })

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col dark:bg-darkbg dark:text-slate-100">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase mb-2">
              Dehradun • Rajpur • Prem Nagar • Sahastradhara
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Rent bikes & scooties in Dehradun{' '}
              <span className="text-primary">instantly.</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              Choose from trusted local garages, verify with your driving license, and ride across the valley with transparent pricing.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <button
                onClick={() => document.getElementById('vehicles')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90"
              >
                Browse Vehicles
              </button>
              <button
                onClick={() => document.getElementById('vendors')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary"
              >
                View Garages
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-tr from-primary to-sky-500 h-52 md:h-64 flex items-center justify-center text-white text-lg font-semibold shadow-xl">
              Ride the valley. Hassle free.
            </div>
            <div className="absolute -bottom-5 -right-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg px-4 py-3 text-xs w-52">
              <div className="font-semibold mb-1">Live Availability</div>
              <p className="text-slate-500 dark:text-slate-400">
                30+ vehicles online • Same day pickup • Hourly & daily plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors */}
      <section id="vendors" className="max-w-6xl mx-auto px-4 py-4 w-full">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Garages in Dehradun
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">3 listed</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {vendors.map(v => (
            <article key={v.name} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-sm">{v.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{v.location}</p>
              <p className="text-xs">{v.desc}</p>
              <span className="mt-1 inline-flex w-fit items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                {v.badge}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Vehicles + Filters */}
      <section id="vehicles" className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Available Bikes & Scooties</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Filter by type or garage. Pricing is in INR.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {['all', 'scooty', 'bike'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 capitalize transition ${
                  filterType === f ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : ''
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <select
              value={filterVendor}
              onChange={e => setFilterVendor(e.target.value)}
              className="text-xs px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="all">All Garages</option>
              <option value="Himalayan Wheels Garage">Himalayan Wheels Garage</option>
              <option value="Doon Riders Hub">Doon Riders Hub</option>
              <option value="Mussoorie Highway Rentals">Mussoorie Highway Rentals</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 col-span-full">No vehicles match this filter.</p>
          ) : (
            filtered.map(v => (
              <article key={v.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{v.name}</h3>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{v.type}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${
                    v.type === 'scooty'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200'
                  }`}>
                    {v.vendor.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">Pickup: {v.location}, Dehradun</p>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">₹{v.pricePerHour}/hr</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">₹{v.pricePerDay}/day</p>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                    <p>Free helmet</p>
                    <p>Security deposit offline</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={() => {
                      if (isLoggedIn) {
                        navigate(`/booking?id=${encodeURIComponent(v.id)}`)
                      } else {
                        setShowLoginPrompt(true)
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90"
                  >
                    Rent Now
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 mt-4">
        <div className="max-w-6xl mx-auto px-4 py-3 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>© 2026 All Rights Reserved.</span>
          
        </div>
      </footer>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-xs w-full text-center shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-3xl mb-3">🔒</div>
            <h2 className="text-base font-semibold dark:text-white mb-1">Login Required</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Please log in or create an account to book a vehicle.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                Login / Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
