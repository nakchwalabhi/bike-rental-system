import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Booking from './pages/Booking'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import VendorLogin from './pages/VendorLogin'
import VendorRegister from './pages/VendorRegister'
import Profile from './pages/Profile'

function PrivateRoute({ children, showLoginPrompt = false }) {
  const loggedIn = localStorage.getItem('loggedIn')
  return loggedIn ? children : showLoginPrompt ? <Home initialLoginPrompt /> : <Navigate to="/login" replace />
}

function VendorRoute({ children }) {
  const loggedIn = localStorage.getItem('vendorLoggedIn')
  return loggedIn === 'true' ? children : <Navigate to="/vendor-login" replace />
}

function AdminRoute({ children }) {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('adminLoggedIn') === 'true')
  return loggedIn ? children : <AdminLogin onSuccess={() => setLoggedIn(true)} />
}

function AuthRoute({ children }) {
  const loggedIn = localStorage.getItem('loggedIn')
  return !loggedIn ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/booking" element={<PrivateRoute showLoginPrompt><Booking /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/vendor-dashboard" element={<VendorRoute><AdminDashboard /></VendorRoute>} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-register" element={<VendorRegister />} />
      </Routes>
    </HashRouter>
  )
}
