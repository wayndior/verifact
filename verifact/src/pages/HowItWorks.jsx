import React from 'react';
import { useNavigate } from 'react-router-dom';

const Icon = ({ paths, size = 24, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);

const icons = {
  doc:    ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  search: ['M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z', 'M16 16l4.5 4.5'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  check:  ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  zap:    ['M13 2L3 14h9l-1 8 10-12h-9l1-8'],
  lock:   ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
};

const steps = [
  { step: '01', title: 'Upload your document', desc: 'Drag and drop or browse for a PDF, DOCX, PPTX, or TXT file. Max 10MB. Our system accepts any standard academic or presentation format.', icon: icons.doc },
  { step: '02', title: 'AI extracts all claims', desc: 'Our AI reads through your entire document and identifies every factual statement that can be verified — from statistics to historical claims.', icon: icons.search },
  { step: '03', title: 'Sources are cross-referenced', desc: 'Each claim is checked against trusted academic databases and scientific sources. Confidence scores are assigned to every finding.', icon: icons.check },
  { step: '04', title: 'Plagiarism is detected', desc: 'The document is scanned for originality against common sources. Any suspicious passages are flagged with detail and context.', icon: icons.shield },
  { step: '05', title: 'You receive your report', desc: 'A full verification report is generated, showing each claim, its verification status, source links, and your overall integrity score.', icon: icons.zap },
  { step: '06', title: 'Certificate issued', desc: 'If your document passes, a cryptographic certificate is issued — SHA-256 hashed with a QR code for instant public verification.', icon: icons.lock },
];

const HowItWorks = () => {
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
          <a href="/how-it-works" style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: '600' }}>How it works</a>
          <a href="/features" style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>Features</a>
          <a href="/pricing" style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>Pricing</a>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 20px', background: '#0F172A', color: 'white', borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Get Started</button>
        </nav>
      </header>

      <section style={{ padding: '96px 56px', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{ color: '#22C55E', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Process</p>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '16px' }}>How it works</h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem', lineHeight: '1.75', marginBottom: '72px', maxWidth: '520px' }}>
          From upload to certified — here is exactly what happens to your document.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#F1F5F9', borderRadius: '16px', overflow: 'hidden' }}>
          {steps.map((item) => (
            <div key={item.step} style={{ background: 'white', padding: '36px 40px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px', background: '#F8FAFC',
                border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569', flexShrink: 0,
              }}><Icon paths={item.icon} size={22} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E0', letterSpacing: '0.08em', marginBottom: '6px' }}>STEP {item.step}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.7' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '64px', textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 36px', background: '#22C55E', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem' }}>
            Try it now — it's free
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

export default HowItWorks;
