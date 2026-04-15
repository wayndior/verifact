import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed.'); return }
      login(data.token, data.user)
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <header style={{ padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em', cursor: 'pointer' }}>Verifact</span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '32px' }}>
            Don't have an account? <Link to="/register" style={{ color: '#22C55E', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" required autoFocus
                value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#22C55E', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <input
                type="password" required
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '13px', background: '#0F172A', color: 'white',
              borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem',
              marginTop: '8px', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }
const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
  borderRadius: '8px', fontSize: '0.9rem', color: '#0F172A',
  background: 'white', boxSizing: 'border-box',
  outline: 'none',
}

export default Login
