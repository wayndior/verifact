import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Validate token on mount
  useEffect(() => {
    fetch(`/api/password/validate/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) { setTokenValid(true); setEmail(data.email) }
        else setError(data.error || 'Invalid or expired link.')
      })
      .catch(() => setError('Something went wrong.'))
      .finally(() => setValidating(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94A3B8' }}>Validating reset link…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em', cursor: 'pointer' }}>Verifact</span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                </svg>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Password updated</h1>
              <p style={{ color: '#64748B', marginBottom: '28px', lineHeight: '1.7' }}>Your password has been reset successfully. You can now sign in with your new password.</p>
              <button onClick={() => navigate('/login')} style={{ padding: '13px 28px', background: '#0F172A', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem' }}>
                Sign in
              </button>
            </div>

          ) : !tokenValid ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/>
                </svg>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Link expired</h1>
              <p style={{ color: '#64748B', marginBottom: '28px' }}>{error}</p>
              <Link to="/forgot-password" style={{ padding: '13px 28px', background: '#0F172A', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block' }}>
                Request a new link
              </Link>
            </div>

          ) : (
            <>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '8px' }}>Set new password</h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '32px' }}>For <strong>{email}</strong></p>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>New password <span style={{ color: '#94A3B8', fontWeight: '400' }}>(min. 8 characters)</span></label>
                  <input
                    type="password" required autoFocus
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', color: '#0F172A', background: 'white', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Confirm password</label>
                  <input
                    type="password" required
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '10px 14px', border: `1px solid ${confirm && confirm !== password ? '#FECACA' : '#D1D5DB'}`, borderRadius: '8px', fontSize: '0.9rem', color: '#0F172A', background: 'white', boxSizing: 'border-box', outline: 'none' }}
                  />
                  {confirm && confirm !== password && <p style={{ color: '#DC2626', fontSize: '0.8rem', margin: '4px 0 0' }}>Passwords don't match</p>}
                </div>
                <button type="submit" disabled={loading || (confirm && confirm !== password)} style={{ padding: '13px', background: '#22C55E', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
