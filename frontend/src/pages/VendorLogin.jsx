import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'

export default function VendorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiPost('/vendor/auth/login', { email, password })
      if (!res.ok) {
        setError('Login failed. Please check your credentials.')
        setLoading(false)
        return
      }
      const vendor = await res.json()
      if (!vendor || !vendor.id) {
        setError('Invalid login credentials.')
        setLoading(false)
        return
      }
      localStorage.setItem('vendorId', vendor.id)
      localStorage.setItem('vendorName', vendor.vendorName)
      localStorage.setItem('vendorLocation', vendor.location)
      localStorage.setItem('vendorLoggedIn', 'true')
      navigate('/admin')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-xl">DR</span>
          <h1 className="mt-3 text-xl font-bold dark:text-white">Vendor Login</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access your garage dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Username / Email</label>
            <input
              type="text"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin or vendor@example.com"
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            New vendor?{' '}
            <Link to="/vendor-register" className="text-primary hover:underline">Register your garage</Link>
          </p>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Customer?{' '}
            <Link to="/login" className="text-primary hover:underline">User Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
