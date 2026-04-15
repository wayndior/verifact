import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ paths, size = 20, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

const icons = {
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  doc:    ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  x:      ['M18 6L6 18', 'M6 6l12 12'],
  check:  ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  alert:  ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  spin:   ['M12 2v4', 'M12 18v4', 'M4.93 4.93l2.83 2.83', 'M16.24 16.24l2.83 2.83', 'M2 12h4', 'M18 12h4', 'M4.93 19.07l2.83-2.83', 'M16.24 7.76l2.83-2.83'],
}

const ACCEPTED = '.pdf,.docx,.doc,.pptx,.ppt,.txt'

const ScoreBar = ({ label, value, color }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F172A' }}>{value}%</span>
    </div>
    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '100px', transition: 'width 0.8s ease' }} />
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const map = {
    verified:     { bg: '#F0FDF4', color: '#16A34A', text: 'Verified' },
    unverified:   { bg: '#FFFBEB', color: '#D97706', text: 'Unverified' },
    contradicted: { bg: '#FEF2F2', color: '#DC2626', text: 'Contradicted' },
  }
  const s = map[status] || map.unverified
  return (
    <span style={{ padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600' }}>
      {s.text}
    </span>
  )
}

// ── Student Upload ────────────────────────────────────────────────────────────
const StudentUpload = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | uploading | processing | done | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef()

  const handleFile = (f) => { if (f) setFile(f) }

  const pollStatus = async (document_id) => {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const res = await fetch(`/api/documents/status/${document_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.upload_status === 'completed') { setResult(data); setPhase('done'); return }
      if (data.upload_status === 'error') { setErrorMsg(data.processing_error || 'Processing failed.'); setPhase('error'); return }
    }
    setErrorMsg('Processing timed out. Please try again.'); setPhase('error')
  }

  const handleSubmit = async () => {
    if (!file) return
    setPhase('uploading')
    setErrorMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      if (res.status === 429) { setErrorMsg(data.error); setPhase('limit'); return }
      if (!res.ok) { setErrorMsg(data.error || 'Upload failed.'); setPhase('error'); return }
      // Backend processes synchronously — full results are already in the response
      setResult({ ...data, file_name: file.name })
      setPhase('done')
    } catch (e) {
      setErrorMsg('Something went wrong. Please try again.')
      setPhase('error')
    }
  }

  const reset = () => { setFile(null); setPhase('idle'); setResult(null); setErrorMsg('') }

  // ── Processing state ───────────────────────────────────────────────────────
  if (phase === 'uploading' || phase === 'processing') {
    const steps = [
      { label: 'Uploading file', done: phase === 'processing' },
      { label: 'Extracting document text', done: phase === 'processing' },
      { label: 'AI extracting factual claims', done: false },
      { label: 'Verifying claims against sources', done: false },
      { label: 'Running plagiarism detection', done: false },
      { label: 'Generating verification report', done: false },
    ]
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Verifying Your Document</h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '32px' }}>This usually takes 15–30 seconds. Please don't close this page.</p>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '32px', maxWidth: '520px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < steps.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: step.done ? '#F0FDF4' : '#F8FAFC',
                border: `1px solid ${step.done ? '#BBF7D0' : '#E2E8F0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step.done ? '#16A34A' : '#94A3B8',
              }}>
                {step.done
                  ? <Icon paths={icons.check} size={14} strokeWidth={2.5} />
                  : i === (phase === 'uploading' ? 0 : 1)
                    ? <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s infinite' }} />
                    : <span style={{ fontSize: '0.7rem', color: '#CBD5E0', fontWeight: '600' }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: '0.9rem', color: step.done ? '#16A34A' : '#64748B', fontWeight: step.done ? '500' : '400' }}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Result state ───────────────────────────────────────────────────────────
  if (phase === 'done' && result) {
    const { results } = result
    const score = results.summary.overallScore
    const scoreColor = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
    const verdictMap = { pass: { label: 'Passed', bg: '#F0FDF4', color: '#16A34A' }, review: { label: 'Needs Review', bg: '#FFFBEB', color: '#D97706' }, fail: { label: 'Failed', bg: '#FEF2F2', color: '#DC2626' } }
    const verdict = verdictMap[results.summary.verdict] || verdictMap.review

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Verification Complete</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{result.file_name}</p>
          </div>
          <button onClick={reset} style={{ padding: '9px 20px', background: '#F1F5F9', color: '#0F172A', borderRadius: '8px', fontWeight: '500', fontSize: '0.875rem' }}>
            Verify Another
          </button>
        </div>

        {/* Score header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '700', color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>/ 100</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ padding: '4px 14px', background: verdict.bg, color: verdict.color, borderRadius: '100px', fontSize: '0.82rem', fontWeight: '700' }}>{verdict.label}</span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{results.summary.recommendation}</p>
          </div>
        </div>

        {/* Stats bars */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: '600', color: '#0F172A' }}>Accuracy Breakdown</h3>
          <ScoreBar label={`Verified claims (${results.summary.verifiedCount})`} value={Math.round(results.summary.verifiedCount / results.claims.length * 100) || 0} color="#22C55E" />
          <ScoreBar label={`Unverified claims (${results.summary.unverifiedCount})`} value={Math.round(results.summary.unverifiedCount / results.claims.length * 100) || 0} color="#F59E0B" />
          <ScoreBar label={`Contradicted claims (${results.summary.contradictedCount})`} value={Math.round(results.summary.contradictedCount / results.claims.length * 100) || 0} color="#EF4444" />
          <ScoreBar label="Plagiarism score" value={Math.round(results.plagiarism.score * 100)} color={results.plagiarism.score > 0.3 ? '#EF4444' : '#22C55E'} />
        </div>

        {/* Claims list */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: '600', color: '#0F172A' }}>Factual Claims ({results.claims.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#F8FAFC', borderRadius: '8px', overflow: 'hidden' }}>
            {results.claims.map((claim, i) => (
              <div key={i} style={{ background: 'white', padding: '16px 20px', borderBottom: i < results.claims.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                  <p style={{ margin: 0, color: '#0F172A', fontSize: '0.875rem', lineHeight: '1.5', flex: 1 }}>"{claim.text}"</p>
                  <StatusBadge status={claim.status} />
                </div>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{claim.explanation}</p>
                {claim.source && <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.75rem' }}>Source: {claim.source}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Plagiarism */}
        {results.plagiarism.flaggedPassages?.length > 0 && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: '600', color: '#DC2626' }}>Flagged Passages</h3>
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

  // ── Rate limit state ─────────────────────────────────────────────────────────────
  if (phase === 'limit') {
    const tomorrow = new Date()
    tomorrow.setHours(24, 0, 0, 0)
    const hours = Math.ceil((tomorrow - new Date()) / (1000 * 60 * 60))
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '28px' }}>Daily Limit Reached</h1>
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
          <p style={{ fontSize: '2rem' , margin: '0 0 12px' }}>⏳</p>
          <h3 style={{ color: '#92400E', margin: '0 0 8px', fontWeight: '600' }}>You've used your free verification for today</h3>
          <p style={{ color: '#78350F', fontSize: '0.9rem', margin: '0 0 16px', lineHeight: '1.6' }}>
            Free accounts get <strong>1 document verification per day</strong>. Your limit resets in ~{hours} hour{hours !== 1 ? 's' : ''}.
          </p>
          <p style={{ color: '#78350F', fontSize: '0.875rem', margin: 0 }}>
            Need more? Upgrade to <strong>Educator or Institution</strong> for unlimited verifications.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={reset} style={{ padding: '12px 24px', background: '#F1F5F9', color: '#0F172A', borderRadius: '9px', fontWeight: '600', fontSize: '0.9rem' }}>Back</button>
          <a href='/pricing' style={{ padding: '12px 24px', background: '#22C55E', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>View Pricing</a>
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '28px' }}>Verification Failed</h1>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Icon paths={icons.alert} size={20} strokeWidth={2} />
            <div>
              <p style={{ fontWeight: '600', color: '#DC2626', margin: '0 0 4px' }}>Something went wrong</p>
              <p style={{ color: '#7F1D1D', fontSize: '0.875rem', margin: 0 }}>{errorMsg}</p>
            </div>
          </div>
        </div>
        <button onClick={reset} style={{ padding: '12px 28px', background: '#0F172A', color: 'white', borderRadius: '9px', fontWeight: '600' }}>Try Again</button>
      </div>
    )
  }

  // ── Idle / file picker ─────────────────────────────────────────────────────
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Submit Your Work</h1>
      <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '28px' }}>
        Upload your essay, report, or presentation for AI-powered fact verification and plagiarism detection.
      </p>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current.click()}
        style={{ background: dragging ? '#F0FDF4' : 'white', padding: '56px 40px', borderRadius: '12px', border: `2px dashed ${dragging ? '#22C55E' : '#CBD5E0'}`, textAlign: 'center', cursor: 'pointer', marginBottom: '20px' }}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#16A34A' }}>
          <Icon paths={icons.upload} size={28} />
        </div>
        <h3 style={{ color: '#0F172A', margin: '0 0 8px', fontWeight: '600' }}>{file ? 'File ready' : 'Drag & drop your file here'}</h3>
        <p style={{ color: '#94A3B8', margin: '0 0 20px', fontSize: '0.875rem' }}>PDF, DOCX, PPTX, PPT, TXT — Max 10MB</p>
        {!file && <button type="button" style={{ padding: '10px 28px', background: '#0F172A', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>Choose File</button>}
      </div>

      {file && (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <Icon paths={icons.doc} size={18} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: '500', color: '#0F172A', fontSize: '0.9rem' }}>{file.name}</p>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ background: 'none', color: '#94A3B8', padding: '4px' }}>
            <Icon paths={icons.x} size={18} />
          </button>
        </div>
      )}

      <button onClick={handleSubmit} disabled={!file} style={{ padding: '13px 36px', background: file ? '#22C55E' : '#E2E8F0', color: file ? 'white' : '#94A3B8', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem' }}>
        {file ? 'Verify My Document' : 'Select a file to continue'}
      </button>
    </div>
  )
}

// ── Educator Upload ───────────────────────────────────────────────────────────
const EducatorUpload = () => {
  const { token } = useAuth()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef()

  const handleFile = (f) => { if (f) setFile(f) }
  const reset = () => { setFile(null); setPhase('idle'); setResult(null); setErrorMsg(''); setStudentName('') }

  const pollStatus = async (document_id) => {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const res = await fetch(`/api/documents/status/${document_id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.upload_status === 'completed') { setResult(data); setPhase('done'); return }
      if (data.upload_status === 'error') { setErrorMsg(data.processing_error || 'Processing failed.'); setPhase('error'); return }
    }
    setErrorMsg('Processing timed out.'); setPhase('error')
  }

  const handleSubmit = async () => {
    if (!file) return
    setPhase('processing')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/documents/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
      const data = await res.json()
      if (res.status === 429) { setErrorMsg(data.error); setPhase('limit'); return }
      if (!res.ok) { setErrorMsg(data.error || 'Upload failed.'); setPhase('error'); return }
      await pollStatus(data.document_id)
    } catch { setErrorMsg('Something went wrong.'); setPhase('error') }
  }

  if (phase === 'processing') {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '24px' }}>Verifying Document…</h1>
        <div style={{ background: 'white', padding: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#22C55E', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#0F172A', fontWeight: '600', marginBottom: '6px' }}>AI is analysing the document</p>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>This usually takes 15–30 seconds.</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (phase === 'done' && result) {
    const { results } = result
    const score = results.summary.overallScore
    const scoreColor = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
    const verdictMap = { pass: { label: 'Passed', bg: '#F0FDF4', color: '#16A34A' }, review: { label: 'Needs Review', bg: '#FFFBEB', color: '#D97706' }, fail: { label: 'Failed', bg: '#FEF2F2', color: '#DC2626' } }
    const verdict = verdictMap[results.summary.verdict] || verdictMap.review
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Verification Report</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{studentName ? `Student: ${studentName} · ` : ''}{result.file_name}</p>
          </div>
          <button onClick={reset} style={{ padding: '9px 20px', background: '#F1F5F9', color: '#0F172A', borderRadius: '8px', fontWeight: '500', fontSize: '0.875rem' }}>New Verification</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '700', color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>/ 100</div>
          </div>
          <div>
            <span style={{ padding: '4px 14px', background: verdict.bg, color: verdict.color, borderRadius: '100px', fontSize: '0.82rem', fontWeight: '700', display: 'inline-block', marginBottom: '10px' }}>{verdict.label}</span>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{results.summary.recommendation}</p>
          </div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: '600', color: '#0F172A' }}>Claims ({results.claims.length})</h3>
          {results.claims.map((claim, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < results.claims.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
                <p style={{ margin: 0, color: '#0F172A', fontSize: '0.875rem', lineHeight: '1.5', flex: 1 }}>"{claim.text}"</p>
                <span style={{ padding: '3px 10px', background: claim.status === 'verified' ? '#F0FDF4' : claim.status === 'contradicted' ? '#FEF2F2' : '#FFFBEB', color: claim.status === 'verified' ? '#16A34A' : claim.status === 'contradicted' ? '#DC2626' : '#D97706', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600', flexShrink: 0 }}>{claim.status}</span>
              </div>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{claim.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'limit') {
    const tomorrow = new Date(); tomorrow.setHours(24,0,0,0)
    const hours = Math.ceil((tomorrow - new Date()) / (1000*60*60))
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '24px' }}>Daily Limit Reached</h1>
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ color: '#92400E', margin: '0 0 8px', fontWeight: '600' }}>Free accounts get 1 verification per day</h3>
          <p style={{ color: '#78350F', fontSize: '0.9rem', margin: '0 0 12px' }}>Resets in ~{hours} hour{hours !== 1 ? 's' : ''}.</p>
          <p style={{ color: '#78350F', fontSize: '0.875rem', margin: 0 }}>Upgrade to Educator or Institution for unlimited verifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={reset} style={{ padding: '12px 24px', background: '#F1F5F9', color: '#0F172A', borderRadius: '9px', fontWeight: '600' }}>Back</button>
          <a href='/pricing' style={{ padding: '12px 24px', background: '#22C55E', color: 'white', borderRadius: '9px', fontWeight: '600', textDecoration: 'none' }}>View Pricing</a>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '24px' }}>Verification Failed</h1>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: '#DC2626', fontWeight: '600', margin: '0 0 4px' }}>Error</p>
          <p style={{ color: '#7F1D1D', fontSize: '0.875rem', margin: 0 }}>{errorMsg}</p>
        </div>
        <button onClick={reset} style={{ padding: '12px 28px', background: '#0F172A', color: 'white', borderRadius: '9px', fontWeight: '600' }}>Try Again</button>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Verify a Student Submission</h1>
      <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '28px' }}>Upload a student document to run AI verification and plagiarism detection.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => inputRef.current.click()}
            style={{ background: dragging ? '#F0FDF4' : 'white', padding: '48px', borderRadius: '12px', border: `2px dashed ${dragging ? '#22C55E' : '#CBD5E0'}`, textAlign: 'center', cursor: 'pointer', marginBottom: '16px' }}
          >
            <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#16A34A' }}>
              <Icon paths={icons.upload} size={24} />
            </div>
            <h3 style={{ color: '#0F172A', margin: '0 0 6px', fontWeight: '600', fontSize: '0.95rem' }}>{file ? file.name : 'Drop student document here'}</h3>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.8rem' }}>PDF, DOCX, PPTX, PPT, TXT — Max 10MB</p>
          </div>
          {file && (
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                  <Icon paths={icons.doc} size={16} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '500', color: '#0F172A', fontSize: '0.875rem' }}>{file.name}</p>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} style={{ background: 'none', color: '#94A3B8' }}>
                <Icon paths={icons.x} size={16} />
              </button>
            </div>
          )}
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontWeight: '600', color: '#0F172A', margin: 0, fontSize: '0.95rem' }}>Submission Details</p>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Student Name <span style={{ color: '#94A3B8', fontWeight: '400' }}>(optional)</span></label>
            <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Jane Smith" style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '0.875rem', color: '#0F172A', background: 'white', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <button onClick={handleSubmit} disabled={!file} style={{ padding: '12px', background: file ? '#22C55E' : '#E2E8F0', color: file ? 'white' : '#94A3B8', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>
            {file ? 'Run Verification' : 'Select a file first'}
          </button>
        </div>
      </div>
    </div>
  )
}

const Upload = () => {
  const { user } = useAuth()
  if (!user) return null
  return user.role === 'educator' ? <EducatorUpload /> : <StudentUpload />
}

export default Upload
