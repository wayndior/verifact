import React from 'react';
import { useNavigate } from 'react-router-dom';

const Icon = ({ paths, size = 24, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);

const icons = {
  brain:      ['M9.5 2a2.5 2.5 0 0 1 5 0v.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1-2.5-2.5V2z','M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z'],
  book:       ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  eye:        ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  lock:       ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  graduation: ['M22 10l-10-5-10 5 10 5 10-5z', 'M6 12v5c0 0 3 3 6 3s6-3 6-3v-5'],
  zap:        ['M13 2L3 14h9l-1 8 10-12h-9l1-8'],
  shield:     ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  chart:      ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
};

const features = [
  { title: 'Claim Extraction', desc: 'AI reads your entire document and identifies every factual statement. No claim gets missed — from statistics to named events.', icon: icons.brain, tag: 'AI' },
  { title: 'Source Alignment', desc: 'Every extracted claim is cross-referenced against trusted academic and scientific databases, with confidence scores attached.', icon: icons.book, tag: 'Verification' },
  { title: 'Plagiarism Detection', desc: 'Your document is scanned for originality. Copied passages are flagged with source attribution and a similarity percentage.', icon: icons.eye, tag: 'Integrity' },
  { title: 'Cryptographic Certificates', desc: 'Passing documents receive a SHA-256 hashed certificate with a unique ID and QR code — impossible to fake or tamper with.', icon: icons.lock, tag: 'Security' },
  { title: 'Educator Portal', desc: 'Create classes, generate join codes, review student submissions in bulk, and track each student\'s progress over time.', icon: icons.graduation, tag: 'Education' },
  { title: 'Real-time Processing', desc: 'Watch each verification step happen live. No waiting on a spinner — you see exactly what the AI is doing at every moment.', icon: icons.zap, tag: 'UX' },
  { title: 'Detailed Analytics', desc: 'Get a full breakdown of your verification score, claim-by-claim results, source URLs, and suggested improvements.', icon: icons.chart, tag: 'Reports' },
  { title: 'Public Verification', desc: 'Anyone can scan the QR code on your certificate to instantly verify your document\'s authenticity — no account needed.', icon: icons.shield, tag: 'Trust' },
];

const Features = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 56px', height: '64px',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F1F5F9',
      }}>
        <span onClick={() => navigate('/')} style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em', cursor: 'pointer' }}>Verifact</span>
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/how-it-works" style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>How it works</a>
          <a href="/features" style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: '600' }}>Features</a>
          <a href="/pricing" style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>Pricing</a>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 20px', background: '#0F172A', color: 'white', borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Get Started</button>
        </nav>
      </header>

      <section style={{ padding: '96px 56px', maxWidth: '1040px', margin: '0 auto' }}>
        <p style={{ color: '#22C55E', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Features</p>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '16px' }}>Everything you need</h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem', lineHeight: '1.75', marginBottom: '72px', maxWidth: '520px' }}>
          Verifact gives students, educators, and institutions a complete toolkit for academic integrity.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {features.map((f) => (
            <div key={f.title} style={{ padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '9px', background: '#F8FAFC',
                  border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                }}><Icon paths={f.icon} size={20} /></div>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.04em' }}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: '1.65' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '72px', textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 36px', background: '#22C55E', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem' }}>
            Get started free
          </button>
        </div>
      </section>

      <footer style={{ background: '#0F172A', borderTop: '1px solid #1E293B', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#475569', fontSize: '0.85rem' }}>© 2026 Verifact. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '28px' }}>
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <a key={link} href="#" style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '500' }}>{link}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Features;
