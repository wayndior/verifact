import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ paths, size = 18, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

const icons = {
  doc:    ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  check:  ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  clock:  ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2'],
  alert:  ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  eye:    ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  arrow:  ['M5 12h14', 'M12 5l7 7-7 7'],
}

const StatusBadge = ({ status }) => {
  const map = {
    completed:  { bg: '#F0FDF4', color: '#16A34A', text: 'Completed' },
    processing: { bg: '#EFF6FF', color: '#2563EB', text: 'Processing' },
    pending:    { bg: '#F8FAFC', color: '#64748B', text: 'Pending' },
    error:      { bg: '#FEF2F2', color: '#DC2626', text: 'Error' },
  }
  const s = map[status] || map.pending
  return <span style={{ padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600' }}>{s.text}</span>
}

const VerdictBadge = ({ score }) => {
  if (score == null) return null
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#16A34A' : pct >= 50 ? '#D97706' : '#DC2626'
  const bg    = pct >= 80 ? '#F0FDF4'  : pct >= 50 ? '#FFFBEB'  : '#FEF2F2'
  return <span style={{ padding: '3px 10px', background: bg, color, borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' }}>{pct}/100</span>
}

const ReportDetail = ({ doc, onBack }) => {
  if (!doc.results) return (
    <div>
      <button onClick={onBack} style={{ background: 'none', color: '#64748B', fontWeight: '500', fontSize: '0.875rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ← Back to Reports
      </button>
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <p style={{ color: '#94A3B8' }}>{doc.processing_error || 'No results available for this document.'}</p>
      </div>
    </div>
  )

  const { results } = doc
  const score = results.summary.overallScore
  const scoreColor = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
  const verdictMap = { pass: { label: 'Passed', bg: '#F0FDF4', color: '#16A34A' }, review: { label: 'Needs Review', bg: '#FFFBEB', color: '#D97706' }, fail: { label: 'Failed', bg: '#FEF2F2', color: '#DC2626' } }
  const verdict = verdictMap[results.summary.verdict] || verdictMap.review

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', color: '#64748B', fontWeight: '500', fontSize: '0.875rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ← Back to Reports
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>{doc.file_name}</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {doc.processed_at && ` · Processed ${new Date(doc.processed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        </div>
        <span style={{ padding: '4px 14px', background: verdict.bg, color: verdict.color, borderRadius: '100px', fontSize: '0.82rem', fontWeight: '700' }}>{verdict.label}</span>
      </div>

      {/* Score + summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', minWidth: '90px' }}>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>/ 100</div>
        </div>
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: '600' }}>✓ {results.summary.verifiedCount} verified</span>
            <span style={{ fontSize: '0.82rem', color: '#D97706', fontWeight: '600' }}>⚠ {results.summary.unverifiedCount} unverified</span>
            <span style={{ fontSize: '0.82rem', color: '#DC2626', fontWeight: '600' }}>✕ {results.summary.contradictedCount} contradicted</span>
            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Plagiarism: {Math.round(results.plagiarism.score * 100)}%</span>
          </div>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>{results.summary.recommendation}</p>
        </div>
      </div>

      {/* Claims */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: '600', color: '#0F172A' }}>Factual Claims ({results.claims.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#F8FAFC', borderRadius: '8px', overflow: 'hidden' }}>
          {results.claims.map((claim, i) => (
            <div key={i} style={{ background: 'white', padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
                <p style={{ margin: 0, color: '#0F172A', fontSize: '0.875rem', lineHeight: '1.5', flex: 1 }}>"{claim.text}"</p>
                <span style={{
                  padding: '3px 10px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: '600', flexShrink: 0,
                  background: claim.status === 'verified' ? '#F0FDF4' : claim.status === 'contradicted' ? '#FEF2F2' : '#FFFBEB',
                  color: claim.status === 'verified' ? '#16A34A' : claim.status === 'contradicted' ? '#DC2626' : '#D97706',
                }}>{claim.status}</span>
              </div>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{claim.explanation}</p>
              {claim.source && <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.75rem' }}>Source: {claim.source}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Plagiarism */}
      {results.plagiarism.flaggedPassages?.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '20px 24px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: '600', color: '#DC2626' }}>Flagged Passages ({results.plagiarism.flaggedPassages.length})</h3>
          {results.plagiarism.flaggedPassages.map((p, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <p style={{ margin: '0 0 4px', color: '#7F1D1D', fontSize: '0.875rem', fontStyle: 'italic' }}>"{p.text}"</p>
              <p style={{ margin: 0, color: '#DC2626', fontSize: '0.8rem' }}>{p.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Reports = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setDocs(data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (selected) return <ReportDetail doc={selected} onBack={() => setSelected(null)} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Reports</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>All your verified documents and their results.</p>
        </div>
        <button onClick={() => navigate('/upload')} style={{ padding: '10px 20px', background: '#0F172A', color: 'white', borderRadius: '8px', fontWeight: '500', fontSize: '0.875rem' }}>
          + New Verification
        </button>
      </div>

      {loading ? (
        <div style={{ background: 'white', padding: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8' }}>Loading…</div>
      ) : docs.length === 0 ? (
        <div style={{ background: 'white', padding: '56px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94A3B8' }}>
            <Icon paths={icons.doc} size={24} />
          </div>
          <h3 style={{ color: '#0F172A', margin: '0 0 6px', fontWeight: '600' }}>No reports yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 20px' }}>Upload a document to see your verification report here.</p>
          <button onClick={() => navigate('/upload')} style={{ padding: '10px 24px', background: '#22C55E', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>Upload a document</button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px 100px', padding: '12px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            {['Document', 'Status', 'Score', 'Plagiarism', ''].map(h => (
              <span key={h} style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          {/* Rows */}
          {docs.map((doc, i) => {
            const score = doc.verification_score != null ? Math.round(doc.verification_score * 100) : null
            const plagiarism = doc.plagiarism_score != null ? Math.round(doc.plagiarism_score * 100) : null
            return (
              <div key={doc.document_id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px 100px', padding: '14px 20px', borderBottom: i < docs.length - 1 ? '1px solid #F8FAFC' : 'none', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexShrink: 0 }}>
                    <Icon paths={icons.doc} size={16} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '500', color: '#0F172A', fontSize: '0.875rem' }}>{doc.file_name}</p>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>{new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <StatusBadge status={doc.upload_status} />
                <VerdictBadge score={doc.verification_score} />
                <span style={{ fontSize: '0.875rem', color: plagiarism != null ? (plagiarism > 30 ? '#DC2626' : '#16A34A') : '#94A3B8', fontWeight: '600' }}>
                  {plagiarism != null ? `${plagiarism}%` : '—'}
                </span>
                {doc.upload_status === 'completed' ? (
                  <button onClick={() => {
                    // Fetch full doc with results
                    fetch(`/api/documents/${doc.document_id}`, { headers: { Authorization: `Bearer ${token}` } })
                      .then(r => r.json())
                      .then(d => setSelected(d))
                  }} style={{ background: 'none', color: '#22C55E', fontWeight: '600', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View <Icon paths={icons.arrow} size={14} />
                  </button>
                ) : <span />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Reports
