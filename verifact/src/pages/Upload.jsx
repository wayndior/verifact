import React, { useState, useRef, useEffect } from 'react'
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
  info:   ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 16v-4', 'M12 8h.01'],
  layers: ['M12 2l10 6-10 6-10-6 10-6z', 'M2 14l10 6 10-6', 'M2 18l10 6 10-6'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
}

const ACCEPTED = '.pdf,.docx,.doc,.pptx,.ppt,.txt'

const clayCard = {
  background: 'white', borderRadius: '18px',
  border: '3px solid var(--clay-border)',
  boxShadow: '4px 4px 0 var(--clay-border)',
}

const clayBtn = (active) => ({
  padding: '13px 36px',
  background: active ? '#22C55E' : '#E2E8F0',
  color: active ? 'white' : '#94A3B8',
  borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem',
  border: active ? '2.5px solid var(--clay-border)' : '2.5px solid transparent',
  boxShadow: active ? '3px 3px 0 var(--clay-border)' : 'none',
  cursor: active ? 'pointer' : 'default',
})

// ── Quota hook ───────────────────────────────────────────────────────────────
function useQuota() {
  const { authFetch } = useAuth()
  const [quota, setQuota] = useState(null)
  const refresh = async () => {
    try {
      const res = await authFetch('/api/documents/quota')
      if (res.ok) setQuota(await res.json())
    } catch { /* soft-fail */ }
  }
  useEffect(() => { refresh() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return { quota, refresh }
}

// ── Shared small components ──────────────────────────────────────────────────
const QuotaBadge = ({ quota }) => {
  if (!quota) return null
  const { remaining, limit, plan } = quota
  if (limit == null) {
    return (
      <span style={{ padding: '6px 14px', background: '#F0FDF4', color: '#16A34A', borderRadius: '100px', fontSize: '0.78rem', fontWeight: '700', border: '2px solid var(--green-dark)' }}>
        {plan.label} · Unlimited today
      </span>
    )
  }
  const low = remaining === 0
  return (
    <span style={{
      padding: '6px 14px',
      background: low ? '#FEF2F2' : '#F8FAFC',
      color: low ? '#DC2626' : '#475569',
      border: `2px solid ${low ? '#DC2626' : 'var(--clay-border)'}`,
      borderRadius: '100px', fontSize: '0.78rem', fontWeight: '700',
    }}>
      {plan.label} · {remaining}/{limit} uploads left today
    </span>
  )
}

const TruncationBanner = ({ meta }) => {
  if (!meta?.truncated) return null
  const chars = meta.originalLength?.toLocaleString() ?? '?'
  const used = meta.usedLength?.toLocaleString() ?? '?'
  return (
    <div style={{
      background: '#FFFBEB', border: '2.5px solid #EAB308', borderRadius: '16px',
      padding: '14px 18px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start',
      boxShadow: '3px 3px 0 #EAB308',
    }}>
      <div style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }}>
        <Icon paths={icons.info} size={18} strokeWidth={2} />
      </div>
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#92400E', fontSize: '0.9rem' }}>
          Only part of your document was analyzed
        </p>
        <p style={{ margin: 0, color: '#78350F', fontSize: '0.82rem', lineHeight: 1.55 }}>
          We verified the first {used} of {chars} characters to fit our AI model's context window.
          For longer documents, split them into sections for full coverage.
        </p>
      </div>
    </div>
  )
}

const ScoreBar = ({ label, value, color }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-1)' }}>{value}%</span>
    </div>
    <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden', border: '1.5px solid rgba(30,41,59,0.08)' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '100px', transition: 'width 0.8s ease' }} />
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const map = {
    verified:     { bg: '#F0FDF4', color: '#16A34A', text: 'Verified', border: '#16A34A' },
    unverified:   { bg: '#FFFBEB', color: '#D97706', text: 'Unverified', border: '#D97706' },
    contradicted: { bg: '#FEF2F2', color: '#DC2626', text: 'Contradicted', border: '#DC2626' },
  }
  const s = map[status] || map.unverified
  return (
    <span style={{ padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700', border: `1.5px solid ${s.border}` }}>
      {s.text}
    </span>
  )
}

const LimitState = ({ quota, onBack, message }) => {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)
  const hours = Math.ceil((tomorrow - new Date()) / (1000 * 60 * 60))
  const planLabel = quota?.plan?.label ?? 'your plan'
  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '28px', fontFamily: 'Nunito, sans-serif' }}>Daily Limit Reached</h1>
      <div style={{ ...clayCard, background: '#FFFBEB', borderColor: '#EAB308', padding: '28px', marginBottom: '20px', boxShadow: '4px 4px 0 #EAB308' }}>
        <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>⏳</p>
        <h3 style={{ color: '#92400E', margin: '0 0 8px', fontWeight: '700' }}>You've reached your daily verification limit</h3>
        <p style={{ color: '#78350F', fontSize: '0.9rem', margin: '0 0 16px', lineHeight: '1.6' }}>
          {message || `${planLabel} includes a daily upload quota. Your limit resets in ~${hours} hour${hours !== 1 ? 's' : ''}.`}
        </p>
        <p style={{ color: '#78350F', fontSize: '0.875rem', margin: 0 }}>
          Need more? Paid plans are coming soon — in the meantime, feel free to <a href="/contact" style={{ color: '#92400E', fontWeight: '700' }}>contact us</a> about early access.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onBack} style={{ padding: '12px 24px', background: '#F1F5F9', color: 'var(--text-1)', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', border: '2.5px solid var(--clay-border)', boxShadow: '3px 3px 0 var(--clay-border)' }}>Back</button>
        <a href='/pricing' style={{ padding: '12px 24px', background: '#22C55E', color: 'white', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none', border: '2.5px solid var(--clay-border)', boxShadow: '3px 3px 0 var(--clay-border)' }}>View Pricing</a>
      </div>
    </div>
  )
}

// ── Student Upload ────────────────────────────────────────────────────────────
const StudentUpload = () => {
  const { authFetch } = useAuth()
  const { quota, refresh: refreshQuota } = useQuota()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [limitInfo, setLimitInfo] = useState(null)
  const inputRef = useRef()

  const handleFile = (f) => { if (f) setFile(f) }

  const handleSubmit = async () => {
    if (!file) return
    setPhase('uploading')
    setErrorMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await authFetch('/api/documents/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.status === 429) {
        setLimitInfo(data)
        setErrorMsg(data.error)
        setPhase('limit')
        return
      }
      if (!res.ok) { setErrorMsg(data.error || 'Upload failed.'); setPhase('error'); return }
      setResult({ ...data, file_name: file.name })
      setPhase('done')
      refreshQuota()
    } catch (e) {
      setErrorMsg('Something went wrong. Please try again.')
      setPhase('error')
    }
  }

  const reset = () => { setFile(null); setPhase('idle'); setResult(null); setErrorMsg(''); setLimitInfo(null) }

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
        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>Verifying Your Document</h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '32px' }}>This usually takes 15–30 seconds. Please don't close this page.</p>
        <div style={{ ...clayCard, padding: '32px', maxWidth: '520px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < steps.length - 1 ? '2px solid rgba(30,41,59,0.06)' : 'none' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: step.done ? '#F0FDF4' : '#F8FAFC',
                border: `2px solid ${step.done ? '#16A34A' : 'rgba(30,41,59,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step.done ? '#16A34A' : '#94A3B8',
              }}>
                {step.done
                  ? <Icon paths={icons.check} size={14} strokeWidth={2.5} />
                  : i === (phase === 'uploading' ? 0 : 1)
                    ? <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s infinite' }} />
                    : <span style={{ fontSize: '0.7rem', color: '#CBD5E0', fontWeight: '700' }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: '0.9rem', color: step.done ? '#16A34A' : '#64748B', fontWeight: step.done ? '600' : '400' }}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'done' && result) {
    const { results } = result
    const score = results.summary.overallScore
    const scoreColor = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
    const verdictMap = { pass: { label: 'Passed', bg: '#F0FDF4', color: '#16A34A', border: '#16A34A' }, review: { label: 'Needs Review', bg: '#FFFBEB', color: '#D97706', border: '#D97706' }, fail: { label: 'Failed', bg: '#FEF2F2', color: '#DC2626', border: '#DC2626' } }
    const verdict = verdictMap[results.summary.verdict] || verdictMap.review

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>Verification Complete</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{result.file_name}</p>
          </div>
          <button onClick={reset} style={{ padding: '9px 20px', background: '#F1F5F9', color: 'var(--text-1)', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem', border: '2px solid var(--clay-border)' }}>
            Verify Another
          </button>
        </div>

        <TruncationBanner meta={results._meta} />

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', ...clayCard, padding: '28px', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: 'Nunito, sans-serif' }}>{score}</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>/ 100</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ padding: '4px 14px', background: verdict.bg, color: verdict.color, borderRadius: '100px', fontSize: '0.82rem', fontWeight: '700', border: `1.5px solid ${verdict.border}` }}>{verdict.label}</span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{results.summary.recommendation}</p>
          </div>
        </div>

        {result.certificateId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#F0FDF4', border: '2.5px solid #16A34A', borderRadius: '16px', padding: '16px 22px', marginBottom: '20px', boxShadow: '3px 3px 0 #16A34A' }}>
            <div style={{ color: '#16A34A', flexShrink: 0 }}><Icon paths={icons.shield} size={22} strokeWidth={2} /></div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '700', color: '#15803D', fontSize: '0.9rem' }}>Certificate issued</p>
              <p style={{ margin: '2px 0 0', color: '#16A34A', fontSize: '0.8rem' }}>ID: {result.certificateId}</p>
            </div>
            <a href="/certificates" style={{ padding: '7px 16px', background: '#16A34A', color: 'white', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', textDecoration: 'none', border: '2px solid #15803D', whiteSpace: 'nowrap' }}>View Certificate</a>
          </div>
        ) : score >= 80 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#FFFBEB', border: '2.5px solid #D97706', borderRadius: '16px', padding: '16px 22px', marginBottom: '20px', boxShadow: '3px 3px 0 #D97706' }}>
            <div style={{ color: '#D97706', flexShrink: 0 }}><Icon paths={icons.shield} size={22} strokeWidth={2} /></div>
            <div>
              <p style={{ margin: 0, fontWeight: '700', color: '#92400E', fontSize: '0.9rem' }}>Certificate not issued</p>
              <p style={{ margin: '2px 0 0', color: '#78350F', fontSize: '0.8rem' }}>
                Plagiarism score was {Math.round(result.plagiarism)}% — must be under 10% to qualify.
              </p>
            </div>
          </div>
        ) : null}

        <div style={{ ...clayCard, padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-1)' }}>Accuracy Breakdown</h3>
          <ScoreBar label={`Verified claims (${results.summary.verifiedCount})`} value={Math.round(results.summary.verifiedCount / results.claims.length * 100) || 0} color="#22C55E" />
          <ScoreBar label={`Unverified claims (${results.summary.unverifiedCount})`} value={Math.round(results.summary.unverifiedCount / results.claims.length * 100) || 0} color="#F59E0B" />
          <ScoreBar label={`Contradicted claims (${results.summary.contradictedCount})`} value={Math.round(results.summary.contradictedCount / results.claims.length * 100) || 0} color="#EF4444" />
          <ScoreBar label="Plagiarism score" value={Math.round(results.plagiarism.score * 100)} color={results.plagiarism.score > 0.3 ? '#EF4444' : '#22C55E'} />
        </div>

        <div style={{ ...clayCard, padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-1)' }}>Factual Claims ({results.claims.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#F8FAFC', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid rgba(30,41,59,0.08)' }}>
            {results.claims.map((claim, i) => (
              <div key={i} style={{ background: 'white', padding: '16px 20px', borderBottom: i < results.claims.length - 1 ? '1.5px solid rgba(30,41,59,0.06)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                  <p style={{ margin: 0, color: 'var(--text-1)', fontSize: '0.875rem', lineHeight: '1.5', flex: 1 }}>"{claim.text}"</p>
                  <StatusBadge status={claim.status} />
                </div>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{claim.explanation}</p>
                {claim.source && <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.75rem' }}>Source: {claim.source}</p>}
              </div>
            ))}
          </div>
        </div>

        {results.plagiarism.flaggedPassages?.length > 0 && (
          <div style={{ background: '#FEF2F2', border: '2.5px solid #DC2626', padding: '24px', borderRadius: '18px', marginBottom: '20px', boxShadow: '3px 3px 0 #DC2626' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: '700', color: '#DC2626' }}>Flagged Passages</h3>
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

  if (phase === 'limit') {
    return <LimitState quota={quota} onBack={reset} message={limitInfo?.error} />
  }

  if (phase === 'error') {
    return (
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '28px', fontFamily: 'Nunito, sans-serif' }}>Verification Failed</h1>
        <div style={{ background: '#FEF2F2', border: '2.5px solid #DC2626', borderRadius: '18px', padding: '24px', marginBottom: '20px', boxShadow: '3px 3px 0 #DC2626' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Icon paths={icons.alert} size={20} strokeWidth={2} />
            <div>
              <p style={{ fontWeight: '700', color: '#DC2626', margin: '0 0 4px' }}>Something went wrong</p>
              <p style={{ color: '#7F1D1D', fontSize: '0.875rem', margin: 0 }}>{errorMsg}</p>
            </div>
          </div>
        </div>
        <button onClick={reset} style={{ padding: '12px 28px', background: 'var(--clay-border)', color: 'white', borderRadius: '12px', fontWeight: '700', border: '2.5px solid var(--clay-border)', boxShadow: '3px 3px 0 var(--clay-border)' }}>Try Again</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>Submit Your Work</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
            Upload your essay, report, or presentation for AI-powered fact verification and plagiarism detection.
          </p>
        </div>
        <QuotaBadge quota={quota} />
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current.click()}
        style={{ ...clayCard, background: dragging ? '#F0FDF4' : 'white', padding: '56px 40px', border: `3px dashed ${dragging ? '#22C55E' : 'var(--clay-border)'}`, textAlign: 'center', cursor: 'pointer', marginTop: '20px', marginBottom: '20px', boxShadow: dragging ? '4px 4px 0 #22C55E' : '4px 4px 0 var(--clay-border)' }}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#16A34A', border: '2.5px solid var(--green-dark)' }}>
          <Icon paths={icons.upload} size={28} />
        </div>
        <h3 style={{ color: 'var(--text-1)', margin: '0 0 8px', fontWeight: '700' }}>{file ? 'File ready' : 'Drag & drop your file here'}</h3>
        <p style={{ color: '#94A3B8', margin: '0 0 20px', fontSize: '0.875rem' }}>PDF, DOCX, PPTX, PPT, TXT — max 4 MB per file</p>
        {!file && <button type="button" style={{ padding: '10px 28px', background: 'var(--clay-border)', color: 'white', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', border: '2.5px solid var(--clay-border)', boxShadow: '3px 3px 0 var(--clay-border)' }}>Choose File</button>}
      </div>

      {file && (
        <div style={{ ...clayCard, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', border: '2px solid var(--green-dark)' }}>
              <Icon paths={icons.doc} size={18} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-1)', fontSize: '0.9rem' }}>{file.name}</p>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ background: 'none', color: '#94A3B8', padding: '4px' }}>
            <Icon paths={icons.x} size={18} />
          </button>
        </div>
      )}

      <button onClick={handleSubmit} disabled={!file} style={clayBtn(!!file)}>
        {file ? 'Verify My Document' : 'Select a file to continue'}
      </button>
    </div>
  )
}

// ── Educator Upload (single + bulk) ──────────────────────────────────────────
const EducatorUpload = () => {
  const { authFetch } = useAuth()
  const { quota, refresh: refreshQuota } = useQuota()
  const [mode, setMode] = useState('single')
  const [file, setFile] = useState(null)
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [bulkResult, setBulkResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [limitInfo, setLimitInfo] = useState(null)
  const inputRef = useRef()
  const bulkInputRef = useRef()

  const handleFile = (f) => { if (f) setFile(f) }
  const addFiles = (list) => {
    const arr = Array.from(list ?? [])
    if (!arr.length) return
    setFiles(prev => [...prev, ...arr].slice(0, quota?.plan?.bulkMaxFiles ?? 20))
  }
  const removeFileAt = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const reset = () => {
    setFile(null); setFiles([]); setPhase('idle'); setResult(null); setBulkResult(null)
    setErrorMsg(''); setStudentName(''); setLimitInfo(null)
  }

  const handleSingleSubmit = async () => {
    if (!file) return
    setPhase('processing')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await authFetch('/api/documents/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.status === 429) { setLimitInfo(data); setErrorMsg(data.error); setPhase('limit'); return }
      if (!res.ok) { setErrorMsg(data.error || 'Upload failed.'); setPhase('error'); return }
      setResult({ ...data, file_name: file.name })
      setPhase('done')
      refreshQuota()
    } catch { setErrorMsg('Something went wrong.'); setPhase('error') }
  }

  const handleBulkSubmit = async () => {
    if (!files.length) return
    setPhase('processing')
    try {
      const form = new FormData()
      for (const f of files) form.append('files', f)
      const res = await authFetch('/api/documents/bulk-upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.status === 429) { setLimitInfo(data); setErrorMsg(data.error); setPhase('limit'); return }
      if (!res.ok) { setErrorMsg(data.error || 'Bulk upload failed.'); setPhase('error'); return }
      setBulkResult(data)
      setPhase('bulkDone')
      refreshQuota()
    } catch { setErrorMsg('Something went wrong.'); setPhase('error') }
  }

  if (phase === 'processing') {
    return (
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '24px', fontFamily: 'Nunito, sans-serif' }}>
          {mode === 'bulk' ? `Verifying ${files.length} documents…` : 'Verifying Document…'}
        </h1>
        <div style={{ ...clayCard, padding: '48px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#22C55E', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-1)', fontWeight: '700', marginBottom: '6px' }}>AI is analysing {mode === 'bulk' ? 'each document' : 'the document'}</p>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            {mode === 'bulk'
              ? `~15–30 seconds per file · this batch may take ${Math.max(1, Math.ceil(files.length * 0.4))}+ minutes`
              : 'This usually takes 15–30 seconds.'}
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'done' && result) {
    const { results } = result
    const score = results.summary.overallScore
    const scoreColor = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
    const verdictMap = { pass: { label: 'Passed', bg: '#F0FDF4', color: '#16A34A', border: '#16A34A' }, review: { label: 'Needs Review', bg: '#FFFBEB', color: '#D97706', border: '#D97706' }, fail: { label: 'Failed', bg: '#FEF2F2', color: '#DC2626', border: '#DC2626' } }
    const verdict = verdictMap[results.summary.verdict] || verdictMap.review
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>Verification Report</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{studentName ? `Student: ${studentName} · ` : ''}{result.file_name}</p>
          </div>
          <button onClick={reset} style={{ padding: '9px 20px', background: '#F1F5F9', color: 'var(--text-1)', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem', border: '2px solid var(--clay-border)' }}>New Verification</button>
        </div>

        <TruncationBanner meta={results._meta} />

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', ...clayCard, padding: '28px', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: 'Nunito, sans-serif' }}>{score}</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>/ 100</div>
          </div>
          <div>
            <span style={{ padding: '4px 14px', background: verdict.bg, color: verdict.color, borderRadius: '100px', fontSize: '0.82rem', fontWeight: '700', display: 'inline-block', marginBottom: '10px', border: `1.5px solid ${verdict.border}` }}>{verdict.label}</span>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{results.summary.recommendation}</p>
          </div>
        </div>
        <div style={{ ...clayCard, padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-1)' }}>Claims ({results.claims.length})</h3>
          {results.claims.map((claim, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < results.claims.length - 1 ? '1.5px solid rgba(30,41,59,0.06)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
                <p style={{ margin: 0, color: 'var(--text-1)', fontSize: '0.875rem', lineHeight: '1.5', flex: 1 }}>"{claim.text}"</p>
                <StatusBadge status={claim.status} />
              </div>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{claim.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'bulkDone' && bulkResult) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>Batch Verification Complete</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              {bulkResult.successCount} of {bulkResult.batchSize} documents verified · {bulkResult.errorCount} failed
            </p>
          </div>
          <button onClick={reset} style={{ padding: '9px 20px', background: '#F1F5F9', color: 'var(--text-1)', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem', border: '2px solid var(--clay-border)' }}>New Batch</button>
        </div>

        <div style={{ ...clayCard, overflow: 'hidden', padding: 0 }}>
          {bulkResult.results.map((r, i) => {
            const scoreColor = r.status === 'error' ? '#EF4444' : r.score >= 80 ? '#22C55E' : r.score >= 50 ? '#F59E0B' : '#EF4444'
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 20px',
                borderBottom: i < bulkResult.results.length - 1 ? '2px solid rgba(30,41,59,0.06)' : 'none',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: r.status === 'error' ? '#FEF2F2' : '#F0FDF4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: r.status === 'error' ? '#DC2626' : '#16A34A', flexShrink: 0,
                  border: `2px solid ${r.status === 'error' ? '#DC2626' : '#16A34A'}`,
                }}>
                  <Icon paths={r.status === 'error' ? icons.alert : icons.doc} size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: 'var(--text-1)', fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.fileName}</p>
                  <p style={{ margin: '2px 0 0', color: r.status === 'error' ? '#DC2626' : '#64748B', fontSize: '0.8rem' }}>
                    {r.status === 'error'
                      ? r.error
                      : `Score ${Math.round(r.score)}/100 · Plagiarism ${Math.round(r.plagiarism)}%${r.certificateId ? ' · Certificate issued' : ''}`}
                  </p>
                </div>
                {r.status !== 'error' && (
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: scoreColor, letterSpacing: '-0.03em', fontFamily: 'Nunito, sans-serif' }}>
                    {Math.round(r.score)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (phase === 'limit') return <LimitState quota={quota} onBack={reset} message={limitInfo?.error} />

  if (phase === 'error') {
    return (
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '24px', fontFamily: 'Nunito, sans-serif' }}>Verification Failed</h1>
        <div style={{ background: '#FEF2F2', border: '2.5px solid #DC2626', borderRadius: '18px', padding: '20px', marginBottom: '20px', boxShadow: '3px 3px 0 #DC2626' }}>
          <p style={{ color: '#DC2626', fontWeight: '700', margin: '0 0 4px' }}>Error</p>
          <p style={{ color: '#7F1D1D', fontSize: '0.875rem', margin: 0 }}>{errorMsg}</p>
        </div>
        <button onClick={reset} style={{ padding: '12px 28px', background: 'var(--clay-border)', color: 'white', borderRadius: '12px', fontWeight: '700', border: '2.5px solid var(--clay-border)', boxShadow: '3px 3px 0 var(--clay-border)' }}>Try Again</button>
      </div>
    )
  }

  const tabBtn = (active) => ({
    padding: '9px 18px', background: active ? 'white' : 'transparent',
    color: active ? 'var(--text-1)' : '#64748B', border: active ? '2px solid var(--clay-border)' : '2px solid transparent',
    borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem',
    boxShadow: active ? '2px 2px 0 var(--clay-border)' : 'none',
    cursor: 'pointer',
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>Verify Student Submissions</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
            Upload a single document or a whole batch for AI verification and plagiarism detection.
          </p>
        </div>
        <QuotaBadge quota={quota} />
      </div>

      <div style={{ display: 'inline-flex', gap: '4px', background: '#F1F5F9', padding: '5px', borderRadius: '12px', margin: '20px 0 20px', border: '2px solid rgba(30,41,59,0.08)' }}>
        <button onClick={() => setMode('single')} style={tabBtn(mode === 'single')}>Single file</button>
        <button onClick={() => setMode('bulk')} style={tabBtn(mode === 'bulk')}>
          Bulk upload {quota?.plan?.bulkMaxFiles ? `(up to ${quota.plan.bulkMaxFiles})` : ''}
        </button>
      </div>

      {mode === 'single' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          <div>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => inputRef.current.click()}
              style={{ ...clayCard, background: dragging ? '#F0FDF4' : 'white', padding: '48px', border: `3px dashed ${dragging ? '#22C55E' : 'var(--clay-border)'}`, textAlign: 'center', cursor: 'pointer', marginBottom: '16px', boxShadow: dragging ? '4px 4px 0 #22C55E' : '4px 4px 0 var(--clay-border)' }}
            >
              <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#16A34A', border: '2px solid var(--green-dark)' }}>
                <Icon paths={icons.upload} size={24} />
              </div>
              <h3 style={{ color: 'var(--text-1)', margin: '0 0 6px', fontWeight: '700', fontSize: '0.95rem' }}>{file ? file.name : 'Drop student document here'}</h3>
              <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.8rem' }}>PDF, DOCX, PPTX, PPT, TXT — max 4 MB per file</p>
            </div>
            {file && (
              <div style={{ ...clayCard, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', border: '2px solid var(--green-dark)' }}>
                    <Icon paths={icons.doc} size={16} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-1)', fontSize: '0.875rem' }}>{file.name}</p>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} style={{ background: 'none', color: '#94A3B8' }}>
                  <Icon paths={icons.x} size={16} />
                </button>
              </div>
            )}
          </div>
          <div style={{ ...clayCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontWeight: '700', color: 'var(--text-1)', margin: 0, fontSize: '0.95rem' }}>Submission Details</p>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Student Name <span style={{ color: '#94A3B8', fontWeight: '400' }}>(optional)</span></label>
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Jane Smith" style={{ width: '100%', padding: '10px 12px', border: '2.5px solid var(--clay-border)', borderRadius: '10px', fontSize: '0.875rem', color: 'var(--text-1)', background: 'white', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <button onClick={handleSingleSubmit} disabled={!file} style={clayBtn(!!file)}>
              {file ? 'Run Verification' : 'Select a file first'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
            onClick={() => bulkInputRef.current.click()}
            style={{ ...clayCard, background: dragging ? '#F0FDF4' : 'white', padding: '48px', border: `3px dashed ${dragging ? '#22C55E' : 'var(--clay-border)'}`, textAlign: 'center', cursor: 'pointer', marginBottom: '16px', boxShadow: dragging ? '4px 4px 0 #22C55E' : '4px 4px 0 var(--clay-border)' }}
          >
            <input ref={bulkInputRef} type="file" accept={ACCEPTED} multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#16A34A', border: '2px solid var(--green-dark)' }}>
              <Icon paths={icons.layers} size={24} />
            </div>
            <h3 style={{ color: 'var(--text-1)', margin: '0 0 6px', fontWeight: '700', fontSize: '0.95rem' }}>
              {files.length ? `${files.length} file${files.length !== 1 ? 's' : ''} selected` : 'Drop multiple documents here'}
            </h3>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.8rem' }}>
              PDF, DOCX, PPTX, PPT, TXT · 4 MB per file · up to {quota?.plan?.bulkMaxFiles ?? 20} files
            </p>
          </div>

          {files.length > 0 && (
            <div style={{ ...clayCard, marginBottom: '16px', overflow: 'hidden', padding: 0 }}>
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px',
                  borderBottom: i < files.length - 1 ? '2px solid rgba(30,41,59,0.06)' : 'none',
                }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid var(--green-dark)' }}>
                    <Icon paths={icons.doc} size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-1)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</p>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.72rem' }}>{(f.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => removeFileAt(i)} style={{ background: 'none', color: '#94A3B8', padding: '4px' }}>
                    <Icon paths={icons.x} size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleBulkSubmit} disabled={!files.length} style={clayBtn(files.length > 0)}>
            {files.length ? `Verify ${files.length} document${files.length !== 1 ? 's' : ''}` : 'Add files to continue'}
          </button>
        </div>
      )}
    </div>
  )
}

const Upload = () => {
  const { user } = useAuth()
  if (!user) return null
  return user.role === 'educator' ? <EducatorUpload /> : <StudentUpload />
}

export default Upload
