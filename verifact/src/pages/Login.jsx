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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Left brand panel ── */}
      <div style={{
        width: '45%', minHeight: '100vh', flexShrink: 0,
        background: 'var(--clay-border)',
        display: 'flex', flexDirection: 'column',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }} className="auth-panel-left">
        {/* Decorative shapes */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '3px solid rgba(34,197,94,0.3)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '24px', border: '3px solid rgba(139,92,246,0.2)', transform: 'rotate(15deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)', pointerEvents: 'none' }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', zIndex: 1 }} onClick={() => navigate('/')}>
          <div style={{
            width: '38px', height: '38px', background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '1.1rem', fontFamily: 'Nunito, sans-serif',
            border: '2.5px solid rgba(255,255,255,0.2)',
          }}>V</div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em', fontFamily: 'Nunito, sans-serif' }}>Verifact</span>
        </div>

        {/* Middle content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
          <h2 style={{
            fontSize: '2.2rem', fontWeight: '900', color: 'white',
            lineHeight: 1.15, marginBottom: '16px', fontFamily: 'Nunito, sans-serif',
          }}>
            Verify facts.<br /><span style={{ color: '#4ADE80', fontStyle: 'italic' }}>Certify truth.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: '1.7', maxWidth: '340px', marginBottom: '40px' }}>
            AI-powered document verification with cryptographic certificates for students and educators.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🔍', text: 'AI claim verification' },
              { icon: '🏆', text: 'Tamper-proof certificates' },
              { icon: '📊', text: 'Real-time progress tracking' },
            ].map(item => (
              <div key={item.text} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px', background: 'rgba(255,255,255,0.06)',
                borderRadius: '14px', border: '2px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', fontWeight: '600' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', zIndex: 1 }}>
          © 2026 Verifact · Academic integrity platform
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', minHeight: '100vh', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Card */}
          <div style={{
            background: 'white', borderRadius: '24px', padding: '40px 36px',
            border: '3px solid var(--clay-border)',
            boxShadow: '8px 8px 0 var(--clay-border)',
          }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '6px', fontFamily: 'Nunito, sans-serif' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '28px' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--green)', fontWeight: '700', textDecoration: 'none' }}>Sign up free</Link>
            </p>

            {error && (
              <div style={{
                background: '#FFF1F2', border: '2px solid #F43F5E', borderRadius: '14px',
                padding: '12px 16px', marginBottom: '20px', color: '#BE123C', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontWeight: '700' }}>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" required autoFocus
                  value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--clay-border)'}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-1)' }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: '700', textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password" required
                  value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--clay-border)'}
                />
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  padding: '14px', marginTop: '4px',
                  background: loading ? '#86EFAC' : 'var(--green)',
                  color: 'white', borderRadius: '14px',
                  fontWeight: '800', fontSize: '0.95rem',
                  border: '2.5px solid var(--clay-border)',
                  boxShadow: loading ? 'none' : '4px 4px 0 var(--clay-border)',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translate(2px, 2px)'; e.target.style.boxShadow = '2px 2px 0 var(--clay-border)' } }}
                onMouseLeave={e => { e.target.style.transform = 'translate(0, 0)'; e.target.style.boxShadow = loading ? 'none' : '4px 4px 0 var(--clay-border)' }}
              >
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-3)', fontSize: '0.82rem' }}>
            By signing in you agree to our{' '}
            <a href="/terms" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Responsive: hide left panel on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .auth-panel-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: '600',
  color: 'var(--text-1)', marginBottom: '7px',
}
const inputStyle = {
  width: '100%', padding: '13px 16px',
  border: '2.5px solid var(--clay-border)',
  borderRadius: '14px', fontSize: '0.9rem', color: 'var(--text-1)',
  background: 'white', boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.15s',
}

export default Login
