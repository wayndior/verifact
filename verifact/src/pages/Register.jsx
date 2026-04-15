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
  const needsInstitution = form.role === 'student' || form.role === 'educator'

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

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '6px' }}>Create your account</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '32px' }}>
            Already have an account? <Link to="/login" style={{ color: '#22C55E', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" required value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" style={inputStyle} />
            </div>

            {/* DOB */}
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} style={inputStyle} />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password <span style={{ color: '#94A3B8', fontWeight: '400' }}>(min. 8 characters)</span></label>
              <input type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>

            {/* Country */}
            <div>
              <label style={labelStyle}>Country</label>
              <select required value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle}>
                <option value="">Select your country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Role */}
            <div>
              <label style={labelStyle}>I am a…</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[{ value: 'student', label: 'Student' }, { value: 'educator', label: 'Educator' }].map(opt => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => set('role', opt.value)}
                    style={{
                      padding: '12px', borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem',
                      border: form.role === opt.value ? '2px solid #0F172A' : '1px solid #E2E8F0',
                      background: form.role === opt.value ? '#0F172A' : 'white',
                      color: form.role === opt.value ? 'white' : '#475569',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Institution fields — shown for both students and educators */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '14px' }}>
                Institution (optional)
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>School / University name</label>
                  <input type="text" value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="e.g. University of Lisbon" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>School / Student ID</label>
                  <input type="text" value={form.school_id} onChange={e => set('school_id', e.target.value)} placeholder="e.g. STU-2024-001" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City, Postal Code" style={inputStyle} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '13px', background: '#22C55E', color: 'white',
              borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem',
              marginTop: '8px', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <p style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center' }}>
              By signing up, you agree to our{' '}
              <a href="/pricing" style={{ color: '#64748B', textDecoration: 'underline' }}>Terms of Service</a>{' '}
              and{' '}
              <a href="/pricing" style={{ color: '#64748B', textDecoration: 'underline' }}>Privacy Policy</a>.
            </p>
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
  background: 'white', boxSizing: 'border-box', outline: 'none',
}

export default Register
