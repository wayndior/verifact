import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ paths, size = 20, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

const icons = {
  doc:     ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  cert:    ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  score:   ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  upload:  ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  users:   ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  class:   ['M22 10l-10-5-10 5 10 5 10-5z', 'M6 12v5c0 0 3 3 6 3s6-3 6-3v-5'],
  flag:    ['M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', 'M4 22v-7'],
  chart:   ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  clock:   ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2'],
  check:   ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  alert:   ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  eye:     ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  star:    ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  info:    ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 8h.01', 'M12 12v4'],
  arrow:   ['M5 12h14', 'M12 5l7 7-7 7'],
}

const StatCard = ({ label, value, sub, icon, accent }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: '600', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <h2 style={{ margin: 0, color: accent || '#0F172A', fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.03em' }}>{value}</h2>
        {sub && <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.8rem' }}>{sub}</p>}
      </div>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
        <Icon paths={icon} size={19} />
      </div>
    </div>
  </div>
)

const StatusDot = ({ status }) => {
  const color = { completed: '#22C55E', processing: '#3B82F6', error: '#EF4444', pending: '#94A3B8' }[status] || '#94A3B8'
  return <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const StudentDashboard = ({ user, navigate, token }) => {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user.full_name?.split(' ')[0] || 'Student'

  useEffect(() => {
    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setDocs(data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const completed = docs.filter(d => d.upload_status === 'completed')
  const avgScore = completed.length ? Math.round(completed.reduce((s, d) => s + (d.verification_score || 0), 0) / completed.length * 100) : null
  const avgPlagiarism = completed.length ? Math.round(completed.reduce((s, d) => s + (d.plagiarism_score || 0), 0) / completed.length * 100) : null
  const bestScore = completed.length ? Math.round(Math.max(...completed.map(d => d.verification_score || 0)) * 100) : null
  const certs = completed.filter(d => d.verification_score >= 0.8).length
  const pending = docs.filter(d => d.upload_status === 'processing' || d.upload_status === 'pending').length

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>{greeting}, {firstName}</h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Here's a summary of your academic verification activity.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Documents Submitted" value={docs.length} icon={icons.doc} sub="All time" />
        <StatCard label="Avg. Accuracy Score" value={avgScore != null ? `${avgScore}` : '—'} accent={avgScore >= 80 ? '#22C55E' : avgScore >= 50 ? '#F59E0B' : '#0F172A'} icon={icons.score} sub={avgScore != null ? `${completed.length} verified` : 'No data yet'} />
        <StatCard label="Plagiarism Rate" value={avgPlagiarism != null ? `${avgPlagiarism}%` : '—'} icon={icons.eye} sub="Lower is better" />
        <StatCard label="Pending Review" value={pending} icon={icons.clock} sub="Currently processing" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Certificates Earned" value={certs} accent={certs > 0 ? '#16A34A' : '#0F172A'} icon={icons.cert} sub="Docs that passed (80+)" />
        <StatCard label="Best Score" value={bestScore != null ? `${bestScore}` : '—'} icon={icons.star} sub="Your top document" />
        <StatCard label="Failed Verifications" value={completed.filter(d => d.verification_score < 0.5).length} accent={completed.filter(d => d.verification_score < 0.5).length > 0 ? '#EF4444' : '#0F172A'} icon={icons.alert} sub="Score below 50" />
        <StatCard label="Needs Review" value={completed.filter(d => d.verification_score >= 0.5 && d.verification_score < 0.8).length} icon={icons.flag} sub="Score 50–79" />
      </div>

      {/* Accuracy breakdown + tip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0F172A', margin: '0 0 20px' }}>Score Distribution</h3>
          {completed.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Submit a document to see your score breakdown.</p>
          ) : (
            [
              { label: 'Passed (80–100)', count: completed.filter(d => d.verification_score >= 0.8).length, color: '#22C55E' },
              { label: 'Needs Review (50–79)', count: completed.filter(d => d.verification_score >= 0.5 && d.verification_score < 0.8).length, color: '#F59E0B' },
              { label: 'Failed (0–49)', count: completed.filter(d => d.verification_score < 0.5).length, color: '#EF4444' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F172A' }}>{item.count}</span>
                </div>
                <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${completed.length ? item.count / completed.length * 100 : 0}%`, background: item.color, borderRadius: '100px' }} />
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Icon paths={icons.info} size={15} strokeWidth={2} />
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tip</span>
            </div>
            <p style={{ color: '#166534', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
              Documents with proper citations typically score <strong>30% higher</strong>. Always reference your sources.
            </p>
          </div>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', flex: 1 }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Integrity Score Goal</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.03em' }}>{avgScore ?? '—'}</span>
              <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>/ 100</span>
            </div>
            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', width: `${avgScore ?? 0}%`, background: 'linear-gradient(90deg, #22C55E, #16A34A)', borderRadius: '100px' }} />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: 0 }}>Target: 80+ with &lt;10% plagiarism for a certificate</p>
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>Recent Submissions</h2>
          {docs.length > 0 && <button onClick={() => navigate('/reports')} style={{ background: 'none', color: '#22C55E', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>View all <Icon paths={icons.arrow} size={14} /></button>}
        </div>
        {loading ? (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#94A3B8', fontSize: '0.875rem' }}>Loading…</div>
        ) : docs.length === 0 ? (
          <div style={{ background: 'white', padding: '36px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 14px' }}>No submissions yet. Upload your first document to get started.</p>
            <button onClick={() => navigate('/upload')} style={{ padding: '10px 24px', background: '#22C55E', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>Upload a document</button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {docs.slice(0, 5).map((doc, i) => {
              const score = doc.verification_score != null ? Math.round(doc.verification_score * 100) : null
              const scoreColor = score == null ? '#94A3B8' : score >= 80 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626'
              return (
                <div key={doc.document_id} onClick={() => navigate('/reports')} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < Math.min(docs.length, 5) - 1 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer' }}>
                  <StatusDot status={doc.upload_status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '500', color: '#0F172A', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</p>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>{new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: scoreColor }}>{score != null ? `${score}/100` : doc.upload_status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// EDUCATOR DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const EducatorDashboard = ({ user, navigate, token }) => {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setDocs(data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const completed = docs.filter(d => d.upload_status === 'completed')
  const avgScore = completed.length ? Math.round(completed.reduce((s, d) => s + (d.verification_score || 0), 0) / completed.length * 100) : null
  const flagged = completed.filter(d => d.verification_score < 0.5).length
  const plagiarismCases = completed.filter(d => d.plagiarism_score > 0.3).length

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Welcome back, {user.full_name?.split(' ')[0] || 'Educator'}</h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Overview of your verification activity and student submissions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Total Submissions" value={docs.length} icon={icons.doc} />
        <StatCard label="Avg. Accuracy Score" value={avgScore != null ? avgScore : '—'} accent="#22C55E" icon={icons.score} sub={completed.length ? `${completed.length} completed` : 'No data yet'} />
        <StatCard label="Flagged (Score < 50)" value={flagged} accent={flagged > 0 ? '#EF4444' : '#0F172A'} icon={icons.flag} sub="Needs attention" />
        <StatCard label="Plagiarism Cases" value={plagiarismCases} accent={plagiarismCases > 0 ? '#EF4444' : '#0F172A'} icon={icons.eye} sub="Score > 30%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Review submissions', desc: 'Check all verified documents', icon: icons.doc, path: '/reports' },
          { label: 'Verify a document', desc: 'Upload a student submission', icon: icons.upload, dark: true, path: '/upload' },
          { label: 'Analytics', desc: 'Score trends and breakdown', icon: icons.chart, path: '/reports' },
          { label: 'Certificates', desc: 'Documents that passed', icon: icons.cert, path: '/certificates' },
        ].map(action => (
          <div key={action.label} onClick={() => navigate(action.path)} style={{ background: action.dark ? '#0F172A' : 'white', padding: '22px', borderRadius: '12px', cursor: 'pointer', border: action.dark ? 'none' : '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: action.dark ? 'rgba(255,255,255,0.08)' : '#F8FAFC', border: action.dark ? 'none' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.dark ? 'white' : '#475569' }}>
              <Icon paths={action.icon} size={19} />
            </div>
            <div>
              <p style={{ color: action.dark ? 'white' : '#0F172A', fontWeight: '600', margin: '0 0 3px', fontSize: '0.9rem' }}>{action.label}</p>
              <p style={{ color: action.dark ? '#64748B' : '#94A3B8', margin: 0, fontSize: '0.8rem' }}>{action.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>Recent Verifications</h2>
          {docs.length > 0 && <button onClick={() => navigate('/reports')} style={{ background: 'none', color: '#22C55E', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>View all <Icon paths={icons.arrow} size={14} /></button>}
        </div>
        {loading ? (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#94A3B8', fontSize: '0.875rem' }}>Loading…</div>
        ) : docs.length === 0 ? (
          <div style={{ background: 'white', padding: '36px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 14px' }}>No verifications yet. Upload a student document to get started.</p>
            <button onClick={() => navigate('/upload')} style={{ padding: '10px 24px', background: '#22C55E', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>Verify a document</button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {docs.slice(0, 5).map((doc, i) => {
              const score = doc.verification_score != null ? Math.round(doc.verification_score * 100) : null
              const scoreColor = score == null ? '#94A3B8' : score >= 80 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626'
              return (
                <div key={doc.document_id} onClick={() => navigate('/reports')} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < Math.min(docs.length, 5) - 1 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer' }}>
                  <StatusDot status={doc.upload_status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '500', color: '#0F172A', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</p>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>{new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: scoreColor, flexShrink: 0 }}>{score != null ? `${score}/100` : doc.upload_status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Route ─────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  return user.role === 'educator'
    ? <EducatorDashboard user={user} navigate={navigate} token={token} />
    : <StudentDashboard user={user} navigate={navigate} token={token} />
}

export default Dashboard
