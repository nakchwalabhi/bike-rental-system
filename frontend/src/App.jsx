import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Booking from './pages/Booking'
import AdminDashboard from './pages/AdminDashboard'
import VendorLogin from './pages/VendorLogin'
import VendorRegister from './pages/VendorRegister'

function PrivateRoute({ children }) {
  const loggedIn = localStorage.getItem('loggedIn')
  return loggedIn ? children : <Navigate to="/login" replace />
}

function VendorRoute({ children }) {
  const loggedIn = localStorage.getItem('vendorLoggedIn')
  return loggedIn === 'true' ? children : <Navigate to="/vendor-login" replace />
}

function AuthRoute({ children }) {
  const loggedIn = localStorage.getItem('loggedIn')
  return !loggedIn ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
        <Route path="/admin" element={<VendorRoute><AdminDashboard /></VendorRoute>} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-register" element={<VendorRegister />} />
      </Routes>
    </HashRouter>
  )
}
