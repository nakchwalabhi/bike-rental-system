import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    setLoading(true)
    try {
      const res = await apiPost('/vendor/auth/login', { email: username, password })
      if (!res.ok) {
        setError('Admin login failed.')
        return
      }
      const admin = await res.json()
      if (!admin || admin.email !== 'admin' || !admin.id) {
        setError('Admin login failed.')
        return
      }

      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('vendorId', admin.id)
      localStorage.setItem('vendorName', admin.vendorName || 'Admin')
      localStorage.removeItem('vendorLoggedIn')
      navigate('/admin')
    } catch (_) {
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
          <h1 className="mt-3 text-xl font-bold dark:text-white">Admin Login</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access admin dashboard via /admin only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
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
            {loading ? 'Signing in…' : 'Sign In as Admin'}
          </button>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            User? <Link to="/login" className="text-primary hover:underline">User Login</Link>
          </p>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Vendor? <Link to="/vendor-login" className="text-primary hover:underline">Vendor Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
