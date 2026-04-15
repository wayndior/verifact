import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const Icon = ({ paths, size = 24, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);

const icons = {
  arrowRight: ['M5 12h14', 'M12 5l7 7-7 7'],
  shield:     ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  doc:        ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  search:     ['M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z', 'M16 16l4.5 4.5'],
  check:      ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  brain:      ['M9.5 2a2.5 2.5 0 0 1 5 0v.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1-2.5-2.5V2z','M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z'],
  book:       ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  lock:       ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  graduation: ['M22 10l-10-5-10 5 10 5 10-5z', 'M6 12v5c0 0 3 3 6 3s6-3 6-3v-5'],
  zap:        ['M13 2L3 14h9l-1 8 10-12h-9l1-8'],
  eye:        ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
};

// Honest trust indicators — no fabricated metrics.
const trustPoints = [
  { value: 'SHA-256', label: 'Cryptographic certificates' },
  { value: 'GPT-4o', label: 'Claim verification engine' },
  { value: 'PDF · DOCX · PPTX', label: 'Supported formats' },
  { value: 'Tamper-proof', label: 'QR-verified results' },
];

const features = [
  { title: 'Claim Extraction',          desc: 'AI identifies every factual claim in your document.',         icon: icons.brain },
  { title: 'Source Alignment',           desc: 'Claims are cross-referenced against academic sources.',        icon: icons.book },
  { title: 'Plagiarism Detection',       desc: 'Originality checking flags copied content instantly.',         icon: icons.eye },
  { title: 'Cryptographic Certificates', desc: 'SHA-256 hashed, QR-coded, tamper-proof certificates.',        icon: icons.lock },
  { title: 'Educator Portal',            desc: 'Manage classes, students, and bulk submissions.',              icon: icons.graduation },
  { title: 'Real-time Processing',       desc: 'Live step-by-step progress as your document is verified.',     icon: icons.zap },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>

      {/* ── Nav ── */}
      <header className="lp-header">
        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em' }}>Verifact</span>
        <nav className="lp-nav">
          <div className="lp-nav-links">
            <a href="/how-it-works" style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none' }}>How it works</a>
            <a href="/features"     style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none' }}>Features</a>
            <a href="/pricing"      style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none' }}>Pricing</a>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '8px 20px', background: '#0F172A', color: 'white',
            borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem',
          }}>Get Started</button>
          <button className="lp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
            )}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div className={`lp-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <a href="/how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="/features"     onClick={() => setMenuOpen(false)}>Features</a>
        <a href="/pricing"      onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="/login"        onClick={() => setMenuOpen(false)}>Sign in</a>
        <button className="mobile-cta" onClick={() => { setMenuOpen(false); navigate('/register'); }}>Get Started Free</button>
      </div>

      {/* ── Hero ── */}
      <section className="lp-hero" style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', background: '#F0FDF4', borderRadius: '100px',
          color: '#16A34A', fontSize: '0.8rem', fontWeight: '600',
          marginBottom: '28px', letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>
          <Icon paths={icons.shield} size={13} strokeWidth={2.5} /> Academic Integrity Platform
        </div>
        <h1>
          Verify facts.<br />Certify truth.
        </h1>
        <p style={{
          fontSize: '1.1rem', color: '#64748B', lineHeight: '1.75',
          maxWidth: '500px', margin: '0 auto 40px',
        }}>
          AI-powered verification for student essays and presentations. Get cryptographic proof your work is factually sound.
        </p>
        <div className="lp-hero-btns">
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '13px 28px', background: '#22C55E', color: 'white',
            borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            Start Verifying Free <Icon paths={icons.arrowRight} size={16} strokeWidth={2.5} />
          </button>
          <a href="/how-it-works" style={{
            padding: '13px 28px', background: '#F8FAFC', color: '#0F172A',
            borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem',
            border: '1px solid #E2E8F0', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center',
          }}>
            See How It Works
          </a>
        </div>
      </section>

      {/* ── Trust bar (honest capabilities, not vanity metrics) ── */}
      <div style={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
        <div className="lp-stats">
          {trustPoints.map((s) => (
            <div key={s.label} className="lp-stat">
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works preview ── */}
      <section className="lp-section">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: '#22C55E', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '12px' }}>Process</p>
          <h2 style={{ textAlign: 'center', fontSize: '2.25rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '64px' }}>
            Three steps to certified truth
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px', background: '#F1F5F9', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              { step: '01', title: 'Upload your document', desc: 'PDF, DOCX, PPTX, or TXT — just drag and drop.', icon: icons.doc },
              { step: '02', title: 'AI verifies claims',   desc: 'Every fact is checked against trusted academic sources.', icon: icons.search },
              { step: '03', title: 'Receive certificate',  desc: 'A tamper-proof certificate with QR code is issued instantly.', icon: icons.shield },
            ].map((item) => (
              <div key={item.step} style={{ background: 'white', padding: '40px 32px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', background: '#F8FAFC',
                  border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px', color: '#475569',
                }}><Icon paths={item.icon} size={22} /></div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E0', letterSpacing: '0.08em', marginBottom: '10px' }}>{item.step}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.65' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="/how-it-works" style={{ color: '#22C55E', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
              See the full process →
            </a>
          </div>
        </div>
      </section>

      {/* ── Features preview ── */}
      <section className="lp-section-narrow">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ color: '#22C55E', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '12px' }}>Features</p>
          <h2 style={{ textAlign: 'center', fontSize: '2.25rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '64px' }}>
            Everything you need
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
            {features.map((f) => (
              <div key={f.title} style={{ padding: '28px', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '9px', background: '#F8FAFC',
                  border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', color: '#475569',
                }}><Icon paths={f.icon} size={19} /></div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0F172A', marginBottom: '6px' }}>{f.title}</h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: '1.65' }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="/features" style={{ color: '#22C55E', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
              See all features →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 56px', background: '#0F172A', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', letterSpacing: '-0.03em', marginBottom: '16px' }}>
          Ready to verify your work?
        </h2>
        <p style={{ color: '#64748B', marginBottom: '36px', fontSize: '1rem', maxWidth: '460px', margin: '0 auto 36px' }}>
          A modern verification toolkit for students and educators. Free to start — no credit card required.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '14px 36px', background: '#22C55E', color: 'white',
            borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem',
          }}>Get Started Free</button>
          <a href="/pricing" style={{
            padding: '14px 36px', background: 'transparent', color: '#94A3B8',
            borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem',
            border: '1px solid #1E293B', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center',
          }}>View Pricing</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer" style={{
        background: '#0F172A', borderTop: '1px solid #1E293B',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 56px',
      }}>
        <span style={{ color: '#475569', fontSize: '0.85rem' }}>© 2026 Verifact. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '28px' }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, path]) => (
            <span key={label} onClick={() => navigate(path)} style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}>{label}</span>
          ))}
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
