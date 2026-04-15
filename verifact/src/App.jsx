import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import HowItWorks from './pages/HowItWorks'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Verify from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/Register'
import AppLayout from './components/AppLayout'
import Classes from './pages/Classes'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Reports from './pages/Reports'
import Certificates from './pages/Certificates'
import Profile from './pages/Profile'

// Protects app routes — redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/"             element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/features"     element={<Features />} />
        <Route path="/pricing"      element={<Pricing />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/verify/:id"          element={<Verify />} />
        <Route path="/forgot-password"      element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/privacy"  element={<Privacy />} />
        <Route path="/terms"    element={<Terms />} />
        <Route path="/contact"  element={<Contact />} />

        {/* Protected app routes */}
        <Route element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/upload"       element={<Upload />} />
          <Route path="/reports"      element={<Reports />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/classes"      element={<Classes />} />
          <Route path="/profile"      element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
