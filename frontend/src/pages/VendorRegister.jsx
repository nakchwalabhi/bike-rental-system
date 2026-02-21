import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'

export default function VendorRegister() {
  const [form, setForm] = useState({
    ownerName: '', vendorName: '', location: '', contact: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function setField(field) {
    return e => setForm(f => ({...f, [field]: e.target.value}))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      const res = await apiPost('/vendor/auth/register', payload)
      if (res.ok) {
        navigate('/vendor-login')
      } else {
        const text = await res.text()
        setError(text || 'Registration failed. Try again.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'ownerName', label: 'Owner Name', placeholder: 'Ramesh Kumar', type: 'text' },
    { key: 'vendorName', label: 'Garage / Business Name', placeholder: 'My Bike Garage', type: 'text' },
    { key: 'location', label: 'Location', placeholder: 'Rajpur Road, Dehradun', type: 'text' },
    { key: 'contact', label: 'Contact Number', placeholder: '+91 98765 43210', type: 'tel' },
    { key: 'email', label: 'Email', placeholder: 'garage@example.com', type: 'email' },
    { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
    { key: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-xl">DR</span>
          <h1 className="mt-3 text-xl font-bold dark:text-white">Register Garage</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">List your vehicles on Dehradun Rides</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {fields.map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{f.label}</label>
              <input
                type={f.type}
                required
                value={form[f.key]}
                onChange={setField(f.key)}
                placeholder={f.placeholder}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Registering…' : 'Register Garage'}
          </button>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/vendor-login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
