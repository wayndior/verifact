import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdvisoryBanner from '../components/AdvisoryBanner'

const Icon = ({ paths, size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

const icons = {
  shield:  ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  check:   ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  x:       ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M15 9l-6 6', 'M9 9l6 6'],
  doc:     ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
}

const Verify = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cert, setCert] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/certificates/${id}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(data => { setCert(data); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })

    fetch(`/api/certificates/${id}/qr`)
      .then(r => r.json())
      .then(d => setQr(d.qr))
      .catch(() => {})
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <p style={{ color: '#94A3B8' }}>Verifying certificate…</p>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
        <Icon paths={icons.x} size={32} />
      </div>
      <h2 style={{ color: '#0F172A', margin: 0 }}>Certificate not found</h2>
      <p style={{ color: '#64748B' }}>This certificate ID doesn't exist or may have been revoked.</p>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: '#0F172A', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Go to Verifact</button>
    </div>
  )

  const scoreColor = cert.score >= 90 ? '#22C55E' : '#F59E0B'
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  // DB stores plagiarism as 0–100; older rows might still be 0–1
  const plagiarismPct =
    cert.plagiarism != null && cert.plagiarism <= 1 ? Math.round(cert.plagiarism * 100) : Math.round(cert.plagiarism ?? 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <header style={{ padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', cursor: 'pointer', letterSpacing: '-0.02em' }}>Verifact</span>
        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Certificate Verification</span>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px' }}>
        <AdvisoryBanner />

        {/* Verified banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '24px 28px', marginBottom: '28px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Icon paths={icons.check} size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', color: '#166534', fontSize: '1.15rem', fontWeight: '700' }}>Certificate on file</h2>
            <p style={{ margin: 0, color: '#16A34A', fontSize: '0.875rem' }}>
              This certificate ID matches Verifact records. Scores reflect an AI-assisted review at the time of issuance.
            </p>
          </div>
        </div>

        {/* Main card */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: '20px' }}>
          {/* Dark header */}
          <div style={{ background: '#0F172A', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Icon paths={icons.shield} size={14} strokeWidth={2} />
                <span style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verifact Certificate of Verification</span>
              </div>
              <h1 style={{ color: 'white', margin: '0 0 6px', fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{cert.file_name}</h1>
              <p style={{ color: '#64748B', margin: 0, fontSize: '0.85rem' }}>Issued on {issuedDate}</p>
            </div>
            {qr && <img src={qr} alt="QR Code" style={{ width: '80px', height: '80px', background: 'white', borderRadius: '8px', padding: '4px', flexShrink: 0 }} />}
          </div>

          {/* Details */}
          <div style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '28px' }}>
              <div>
                <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Accuracy Score</p>
                <p style={{ color: scoreColor, fontSize: '2rem', fontWeight: '700', margin: 0, letterSpacing: '-0.03em' }}>{cert.score}<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: '400' }}>/100</span></p>
              </div>
              <div>
                <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Plagiarism</p>
                <p style={{ color: '#0F172A', fontSize: '2rem', fontWeight: '700', margin: 0, letterSpacing: '-0.03em' }}>{plagiarismPct}<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: '400' }}>%</span></p>
              </div>
              <div>
                <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Status</p>
                <span style={{ padding: '4px 12px', background: '#F0FDF4', color: '#16A34A', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700' }}>Valid</span>
              </div>
            </div>

            {/* Who */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Submitted by</p>
                  <p style={{ color: '#0F172A', fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>{cert.full_name}</p>
                </div>
                {cert.institution && (
                  <div>
                    <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Institution</p>
                    <p style={{ color: '#0F172A', fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>{cert.institution}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Technical */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Certificate ID</p>
                <p style={{ color: '#0F172A', fontWeight: '700', margin: 0, fontFamily: 'monospace', fontSize: '1rem' }}>{cert.cert_id}</p>
              </div>
              <div>
                <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Document SHA-256 Hash</p>
                <p style={{ color: '#475569', margin: 0, fontSize: '0.72rem', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: '1.6' }}>{cert.file_hash}</p>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
          Verified by <strong style={{ color: '#0F172A' }}>Verifact</strong> · verifact.work · The SHA-256 hash above can be used to confirm the document has not been altered since verification.
        </p>
      </div>
    </div>
  )
}

export default Verify
