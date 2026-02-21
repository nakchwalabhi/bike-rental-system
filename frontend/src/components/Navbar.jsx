import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  function handleLogout() {
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('userId')
    localStorage.removeItem('fullName')
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold">DR</span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">Dehradun Rides</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Bike & Scooty Rentals</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-primary">Home</Link>
          <button onClick={() => document.getElementById('vendors')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary">Vendors</button>
          <button onClick={() => document.getElementById('vehicles')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary">Vehicles</button>
          <Link to="/admin" className="hover:text-primary">Admin</Link>
          <button
            onClick={() => setDark(d => !d)}
            className="ml-2 text-xs px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary hover:text-white transition"
          >
            Logout
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-slate-700 dark:bg-slate-200 mb-1"></span>
          <span className="block w-5 h-0.5 bg-slate-700 dark:bg-slate-200 mb-1"></span>
          <span className="block w-5 h-0.5 bg-slate-700 dark:bg-slate-200"></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-col gap-3 text-sm">
          <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-primary">Home</Link>
          <button onClick={() => { setMenuOpen(false); document.getElementById('vendors')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary">Vendors</button>
          <button onClick={() => { setMenuOpen(false); document.getElementById('vehicles')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary">Vehicles</button>
          <Link to="/admin" onClick={() => setMenuOpen(false)} className="hover:text-primary">Admin</Link>
          <button onClick={() => setDark(d => !d)} className="text-xs px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600 w-fit">
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary hover:text-white transition w-fit"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  )
}
