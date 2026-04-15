import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em', cursor: 'pointer' }}>Verifact</span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem' }}>
                ✉️
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Check your email</h1>
              <p style={{ color: '#64748B', lineHeight: '1.7', marginBottom: '28px' }}>
                If <strong>{email}</strong> has an account, we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '20px' }}>The link expires in 1 hour.</p>
              <Link to="/login" style={{ color: '#22C55E', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to sign in</Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '8px' }}>Forgot password?</h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '32px' }}>
                Enter your email and we'll send you a reset link.{' '}
                <Link to="/login" style={{ color: '#22C55E', fontWeight: '600', textDecoration: 'none' }}>Back to sign in</Link>
              </p>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
                  <input
                    type="email" required autoFocus
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', color: '#0F172A', background: 'white', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '13px', background: '#0F172A', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
