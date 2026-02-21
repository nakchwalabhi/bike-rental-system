import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vehicles as staticVehicles } from '../data/vehicles'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'

const EMPTY_FORM = { name: '', type: 'scooty', pricePerHour: '', pricePerDay: '', status: 'Available' }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const vendorId = localStorage.getItem('vendorId')
  const vendorName = localStorage.getItem('vendorName') || 'Vendor'

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function loadVehicles() {
    setLoading(true)
    let list = []
    try {
      const res = await apiGet(`/vendor/vehicle/all/${vendorId}`)
      if (res.ok) list = await res.json()
    } catch (_) {}
    // Combine with static vehicles for demo
    const combined = [...list, ...staticVehicles.filter(sv => !list.find(v => v.id === sv.id))]
    setVehicles(combined)
    setLoading(false)
  }

  useEffect(() => { loadVehicles() }, [])

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  async function openEdit(v) {
    setEditId(v.id)
    setForm({ name: v.name, type: v.type, pricePerHour: v.pricePerHour, pricePerDay: v.pricePerDay, status: v.status || 'Available' })
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this vehicle?')) return
    try {
      await apiDelete(`/vendor/vehicle/delete/${id}`)
    } catch (_) {}
    loadVehicles()
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      name: form.name,
      type: form.type,
      pricePerHour: parseInt(form.pricePerHour),
      pricePerDay: parseInt(form.pricePerDay),
      status: form.status,
      vendorId: parseInt(vendorId),
    }
    try {
      if (editId) {
        await apiPut(`/vendor/vehicle/update/${editId}`, payload)
      } else {
        await apiPost('/vendor/vehicle/add', payload)
      }
    } catch (_) {}
    setSaving(false)
    setShowModal(false)
    loadVehicles()
  }

  function handleLogout() {
    localStorage.removeItem('vendorLoggedIn')
    localStorage.removeItem('vendorId')
    localStorage.removeItem('vendorName')
    navigate('/vendor-login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm">DR</span>
            <div>
              <span className="font-semibold text-sm">Admin Dashboard</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{vendorName}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs px-3 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Vehicles', value: vehicles.length },
            { label: 'Active Bookings', value: 4 },
            { label: "Today's Pickups", value: 2 },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="text-2xl font-bold mt-1 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Vehicles Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Vehicles</h2>
            <button onClick={openAdd} className="text-xs px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90">
              + Add Vehicle
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-4 text-center">Loading vehicles…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">₹/hr</th>
                    <th className="pb-2 pr-4">₹/day</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, i) => (
                    <tr key={v.id || i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-2 pr-4 font-medium">{v.name}</td>
                      <td className="py-2 pr-4 capitalize">{v.type}</td>
                      <td className="py-2 pr-4">₹{v.pricePerHour}</td>
                      <td className="py-2 pr-4">₹{v.pricePerDay}</td>
                      <td className="py-2 pr-4">{v.status || 'Available'}</td>
                      <td className="py-2 space-x-1">
                        <button onClick={() => openEdit(v)} className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600">Edit</button>
                        <button onClick={() => handleDelete(v.id)} className="px-2 py-1 rounded-lg border border-red-300 text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-4 dark:text-white">{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <div className="flex flex-col gap-3 text-sm">
              <input
                placeholder="Vehicle Name"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={form.type}
                onChange={e => setForm(f => ({...f, type: e.target.value}))}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="scooty">Scooty</option>
                <option value="bike">Bike</option>
              </select>
              <input
                type="number"
                placeholder="Price per hour (₹)"
                value={form.pricePerHour}
                onChange={e => setForm(f => ({...f, pricePerHour: e.target.value}))}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Price per day (₹)"
                value={form.pricePerDay}
                onChange={e => setForm(f => ({...f, pricePerDay: e.target.value}))}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={form.status}
                onChange={e => setForm(f => ({...f, status: e.target.value}))}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
