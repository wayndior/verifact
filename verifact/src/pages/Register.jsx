import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil',
  'Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chile','China','Colombia','Congo',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Dominican Republic','Ecuador','Egypt',
  'El Salvador','Estonia','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala',
  'Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica',
  'Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Latvia','Lebanon','Libya','Lithuania',
  'Luxembourg','Malaysia','Mali','Malta','Mexico','Moldova','Mongolia','Morocco','Mozambique','Myanmar',
  'Nepal','Netherlands','New Zealand','Nicaragua','Nigeria','Norway','Oman','Pakistan','Palestine','Panama',
  'Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia',
  'Senegal','Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','Spain',
  'Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Tunisia',
  'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
]

const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', email: '', password: '',
    country: '', role: 'student',
    institution: '', school_id: '', address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed.'); return }
      if (data.user?.user_id) {
        localStorage.setItem('vf_onboarding_pending', data.user.user_id)
      }
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
        width: '40%', minHeight: '100vh', flexShrink: 0,
        background: 'var(--clay-border)',
        display: 'flex', flexDirection: 'column',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }} className="auth-panel-left">
        {/* Decorative shapes */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '3px solid rgba(34,197,94,0.3)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '24px', border: '3px solid rgba(139,92,246,0.2)', transform: 'rotate(15deg)', pointerEvents: 'none' }} />

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
            fontSize: '2rem', fontWeight: '900', color: 'white',
            lineHeight: 1.15, marginBottom: '16px', fontFamily: 'Nunito, sans-serif',
          }}>
            Join thousands of<br /><span style={{ color: '#4ADE80', fontStyle: 'italic' }}>verified learners.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', lineHeight: '1.7', maxWidth: '320px', marginBottom: '36px' }}>
            Get AI-powered verification, tamper-proof certificates, and real-time accuracy feedback.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { value: 'GPT-4o', label: 'AI engine' },
              { value: 'SHA-256', label: 'Certificates' },
              { value: 'PDF/DOCX', label: 'File support' },
              { value: 'Free', label: 'To start' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '16px', background: 'rgba(255,255,255,0.06)',
                borderRadius: '14px', border: '2px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: '800', fontSize: '1rem', color: 'white', marginBottom: '3px' }}>{item.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', zIndex: 1 }}>
          © 2026 Verifact · Academic integrity platform
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          {/* Card */}
          <div style={{
            background: 'white', borderRadius: '24px', padding: '36px 32px',
            border: '3px solid var(--clay-border)',
            boxShadow: '8px 8px 0 var(--clay-border)',
          }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '6px', fontFamily: 'Nunito, sans-serif' }}>
              Create your account
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '28px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--green)', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" required value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Email address</label>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>
                  Password{' '}
                  <span style={{ color: 'var(--text-3)', fontWeight: '400' }}>(min. 8 characters)</span>
                </label>
                <input type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Country</label>
                <select required value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">Select your country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Role selector */}
              <div>
                <label style={labelStyle}>I am a…</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[{ value: 'student', label: '🎓 Student', }, { value: 'educator', label: '📚 Educator' }].map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => set('role', opt.value)}
                      style={{
                        padding: '13px', borderRadius: '14px', fontWeight: '700', fontSize: '0.9rem',
                        border: form.role === opt.value ? '2.5px solid var(--green)' : '2.5px solid var(--clay-border)',
                        background: form.role === opt.value ? 'var(--green-light)' : 'white',
                        color: form.role === opt.value ? 'var(--green-dark)' : 'var(--text-2)',
                        transition: 'all 0.15s',
                        boxShadow: form.role === opt.value ? '3px 3px 0 var(--green-dark)' : '3px 3px 0 var(--clay-border)',
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Institution fields */}
              <div style={{ borderTop: '2px solid rgba(30,41,59,0.08)', paddingTop: '16px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Institution (optional)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>School / University name</label>
                    <input type="text" value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="e.g. University of Lisbon" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>School / Student ID</label>
                    <input type="text" value={form.school_id} onChange={e => set('school_id', e.target.value)} placeholder="e.g. STU-2024-001" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City, Postal Code" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>
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
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center' }}>
                By signing up, you agree to our{' '}
                <a href="/terms" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>

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
const focusStyle = e => { e.target.style.borderColor = 'var(--green)' }
const blurStyle  = e => { e.target.style.borderColor = 'var(--clay-border)' }

export default Register
