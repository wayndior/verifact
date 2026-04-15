import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ paths, size = 18, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

const icons = {
  shield:  ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  link:    ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
  copy:    ['M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1'],
  upload:  ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  check:   ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
}

const CertCard = ({ cert }) => {
  const [qr, setQr] = useState(null)
  const [copied, setCopied] = useState(false)
  const verifyUrl = `${window.location.origin}/verify/${cert.cert_id}`

  useEffect(() => {
    fetch(`/api/certificates/${cert.cert_id}/qr`)
      .then(r => r.json())
      .then(d => setQr(d.qr))
      .catch(() => {})
  }, [cert.cert_id])

  const copyLink = () => {
    navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#0F172A', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Icon paths={icons.shield} size={16} strokeWidth={2} />
            <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verified Certificate</span>
          </div>
          <h3 style={{ color: 'white', margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{cert.file_name}</h3>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.82rem' }}>
            Issued {new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {qr && <img src={qr} alt="QR Code" style={{ width: '72px', height: '72px', borderRadius: '8px', background: 'white', padding: '4px' }} />}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Score</p>
            <p style={{ color: '#22C55E', fontSize: '1.5rem', fontWeight: '700', margin: 0, letterSpacing: '-0.03em' }}>{cert.score}<span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '400' }}>/100</span></p>
          </div>
          <div>
            <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Plagiarism</p>
            <p style={{ color: '#0F172A', fontSize: '1.5rem', fontWeight: '700', margin: 0, letterSpacing: '-0.03em' }}>{Math.round(cert.plagiarism * 100)}<span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '400' }}>%</span></p>
          </div>
          <div>
            <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Status</p>
            <span style={{ padding: '3px 10px', background: '#F0FDF4', color: '#16A34A', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' }}>Auto-Issued</span>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificate ID</p>
          <p style={{ color: '#0F172A', fontWeight: '600', margin: 0, fontSize: '0.9rem', fontFamily: 'monospace' }}>{cert.cert_id}</p>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: '600', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Hash (SHA-256)</p>
          <p style={{ color: '#475569', margin: 0, fontSize: '0.72rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{cert.file_hash}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={copyLink} style={{ flex: 1, padding: '10px', background: copied ? '#F0FDF4' : '#F1F5F9', color: copied ? '#16A34A' : '#0F172A', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Icon paths={copied ? icons.check : icons.copy} size={15} strokeWidth={2} />
            {copied ? 'Copied!' : 'Copy verification link'}
          </button>
          <a href={verifyUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '10px', background: '#0F172A', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
            <Icon paths={icons.link} size={15} strokeWidth={2} />
            View public page
          </a>
        </div>
      </div>
    </div>
  )
}

const Certificates = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/certificates', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setCerts(data.certificates || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Certificates</h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          Auto-issued for documents scoring <strong>80+</strong> with plagiarism under <strong>10%</strong>. Each certificate is cryptographically linked to the original file.
        </p>
      </div>

      {loading ? (
        <div style={{ background: 'white', padding: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8' }}>Loading…</div>
      ) : certs.length === 0 ? (
        <div style={{ background: 'white', padding: '56px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94A3B8' }}>
            <Icon paths={icons.shield} size={24} />
          </div>
          <h3 style={{ color: '#0F172A', margin: '0 0 8px', fontWeight: '600' }}>No certificates yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 6px' }}>Certificates are auto-issued when your document scores 90+ with less than 10% plagiarism.</p>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 24px' }}>Keep submitting and improving your work.</p>
          <button onClick={() => navigate('/upload')} style={{ padding: '10px 24px', background: '#22C55E', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>
            Upload a document
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '20px' }}>
          {certs.map(cert => <CertCard key={cert.cert_id} cert={cert} />)}
        </div>
      )}
    </div>
  )
}

export default Certificates
