import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const Icon = ({ paths, size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);

const icons = {
  arrowRight:  ['M5 12h14', 'M12 5l7 7-7 7'],
  shield:      ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  doc:         ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  search:      ['M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z', 'M16 16l4.5 4.5'],
  check:       ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  brain:       ['M9.5 2a2.5 2.5 0 0 1 5 0v.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1-2.5-2.5V2z','M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z'],
  book:        ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  lock:        ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  graduation:  ['M22 10l-10-5-10 5 10 5 10-5z', 'M6 12v5c0 0 3 3 6 3s6-3 6-3v-5'],
  zap:         ['M13 2L3 14h9l-1 8 10-12h-9l1-8'],
  eye:         ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  star:        ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  checkCircle: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  x:           ['M18 6L6 18', 'M6 6l12 12'],
  menu:        ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  sparkle:     ['M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z'],
  code:        ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
  palette:     ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1-.01-.83.67-1.5 1.49-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z'],
  cpu:         ['M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z', 'M9 9h6v6H9z'],
  phone:       ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72'],
  chart:       ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  layers:      ['M12 2l10 6-10 6-10-6 10-6z', 'M2 14l10 6 10-6', 'M2 18l10 6 10-6'],
};

const trustPoints = [
  { value: 'SHA-256', label: 'Cryptographic certificates' },
  { value: 'GPT-4o',  label: 'Claim verification engine' },
  { value: 'PDF / DOCX / PPTX', label: 'Supported formats' },
  { value: 'Tamper-proof', label: 'QR-verified results' },
];

const steps = [
  {
    step: '01', title: 'Upload your document',
    desc: 'PDF, DOCX, PPTX, or TXT — just drag and drop your file.',
    icon: icons.doc, bg: '#EFF6FF', color: '#3B82F6',
  },
  {
    step: '02', title: 'AI verifies every claim',
    desc: 'Each fact is cross-referenced against trusted academic sources.',
    icon: icons.search, bg: '#F5F3FF', color: '#8B5CF6',
  },
  {
    step: '03', title: 'Receive your certificate',
    desc: 'A tamper-proof SHA-256 certificate with QR code is issued instantly.',
    icon: icons.shield, bg: '#F0FDF4', color: '#22C55E',
  },
];

const features = [
  { title: 'Claim Extraction',          desc: 'AI identifies every factual claim in your document.',          icon: icons.brain,      bg: '#FFF7ED', color: '#F97316' },
  { title: 'Source Alignment',           desc: 'Claims are cross-referenced against academic sources.',         icon: icons.book,       bg: '#F5F3FF', color: '#8B5CF6' },
  { title: 'Plagiarism Detection',       desc: 'Originality checking flags copied content instantly.',          icon: icons.eye,        bg: '#FFF1F2', color: '#F43F5E' },
  { title: 'Cryptographic Certificates', desc: 'SHA-256 hashed, QR-coded, tamper-proof certificates.',         icon: icons.lock,       bg: '#F0FDF4', color: '#22C55E' },
  { title: 'Educator Portal',            desc: 'Manage classes, students, and bulk submissions.',               icon: icons.graduation, bg: '#EFF6FF', color: '#3B82F6' },
  { title: 'Real-time Processing',       desc: 'Live step-by-step progress as your document is verified.',      icon: icons.zap,        bg: '#FEFCE8', color: '#EAB308' },
];

const catalogItems = [
  { name: 'Essay Verification',      by: 'AI-powered',     icon: icons.code,     bg: '#FFF7ED', color: '#F97316', rating: '4.9', lessons: 48, duration: '24h', students: '12.5K' },
  { name: 'Plagiarism Detection',    by: 'Deep analysis',  icon: icons.palette,  bg: '#EFF6FF', color: '#3B82F6', rating: '4.8', lessons: 36, duration: '18h', students: '8.2K' },
  { name: 'Source Verification',     by: 'Academic sources',icon: icons.chart,    bg: '#F5F3FF', color: '#8B5CF6', rating: '4.9', lessons: 52, duration: '30h', students: '15.3K' },
  { name: 'Certificate Issuing',     by: 'SHA-256 secured', icon: icons.phone,   bg: '#F0FDF4', color: '#22C55E', rating: '4.7', lessons: 42, duration: '22h', students: '9.8K' },
];

const testimonials = [
  {
    text: 'Verifact helped me catch factual inconsistencies in my thesis before submission. The AI picked up three claims I couldn\'t back up with sources. Incredible tool.',
    name: 'Emily Rodriguez',
    role: 'Computer Science Student, UCL',
    avatar: 'E',
    avatarBg: '#8B5CF6',
    rating: 5,
  },
  {
    text: 'As an educator, I now use Verifact to screen every batch of essays. The certificate system makes it easy to show students exactly where their verification stands.',
    name: 'Dr. James Kim',
    role: 'Professor of Research Methods',
    avatar: 'J',
    avatarBg: '#3B82F6',
    rating: 5,
  },
  {
    text: 'I went from a 64% accuracy score to 91% after learning how to properly cite sources. Verifact gives you actionable feedback, not just a pass/fail.',
    name: 'Sofia Andrade',
    role: 'Biology Student, University of Lisbon',
    avatar: 'S',
    avatarBg: '#F43F5E',
    rating: 5,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Nav ── */}
      <header className="lp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: '36px', height: '36px', background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '1.05rem', fontFamily: 'Nunito, sans-serif',
            border: '2.5px solid var(--clay-border)',
          }}>V</div>
          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-1)', letterSpacing: '-0.02em', fontFamily: 'Nunito, sans-serif' }}>Verifact</span>
        </div>

        <nav className="lp-nav">
          <div className="lp-nav-links">
            <a href="/how-it-works" className="lp-nav-link">How it works</a>
            <a href="/features"     className="lp-nav-link">Features</a>
            <a href="/pricing"      className="lp-nav-link">Pricing</a>
          </div>
          <button onClick={() => navigate('/login')} className="lp-btn-nav-login">Log In</button>
          <button onClick={() => navigate('/register')} className="lp-btn-nav-cta">Start Free</button>
          <button className="lp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <Icon paths={menuOpen ? icons.x : icons.menu} size={22} strokeWidth={2.5} />
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

      {/* ── Hero (split layout like LearnHub) ── */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <div className="lp-badge">
            <Icon paths={icons.sparkle} size={12} strokeWidth={2.5} /> AI-Powered Verification
          </div>
          <h1>
            Verify Facts,<br /><span className="accent">Anytime,</span><br />Anywhere!
          </h1>
          <p className="lp-hero-sub">
            Join thousands of learners worldwide. AI-powered verification for student essays and academic work with cryptographic proof.
          </p>
          <div className="lp-hero-btns">
            <button className="lp-btn-primary" onClick={() => navigate('/register')}>
              Start Verifying Free <Icon paths={icons.arrowRight} size={16} strokeWidth={2.5} />
            </button>
            <a href="/how-it-works" className="lp-btn-secondary">
              Browse Features
            </a>
          </div>

          {/* Stats bar */}
          <div className="lp-stats-bar">
            <div className="lp-stat-item">
              <div className="lp-stat-value">10K+</div>
              <div className="lp-stat-label">Documents</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">2M+</div>
              <div className="lp-stat-label">Claims Verified</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">500+</div>
              <div className="lp-stat-label">Educators</div>
            </div>
          </div>
        </div>

        {/* Hero card — progress tracking demo */}
        <div className="lp-hero-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--clay-border)' }}>
                <Icon paths={icons.doc} size={20} strokeWidth={1.75} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-1)' }}>Research Essay</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>12 claims · 4h 30m</div>
              </div>
            </div>
            {/* Small decorative icons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--clay-border)' }}>
                <Icon paths={icons.star} size={14} strokeWidth={2} style={{ color: '#F43F5E' }} />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-2)' }}>Progress</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#22C55E' }}>87%</span>
            </div>
            <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden', border: '2px solid var(--clay-border)' }}>
              <div style={{ height: '100%', width: '87%', background: 'linear-gradient(90deg, #22C55E, #16A34A)', borderRadius: '100px' }} />
            </div>
          </div>

          {/* Continue button */}
          <button style={{
            width: '100%', padding: '12px', background: 'var(--green)', color: 'white',
            borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem',
            border: '2.5px solid var(--clay-border)', boxShadow: '3px 3px 0 var(--clay-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }} onClick={() => navigate('/register')}>
            Continue Verification
          </button>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
            {['Claim verified', 'Source found', 'Plagiarism: 3%', 'Certificate ready'].map((tag, i) => (
              <span key={i} style={{
                padding: '5px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600',
                background: ['#F0FDF4','#EFF6FF','#F5F3FF','#FFF8F2'][i],
                color: ['#16A34A','#2563EB','#7C3AED','#F97316'][i],
                border: `1.5px solid ${['#16A34A','#2563EB','#7C3AED','#F97316'][i]}20`,
              }}>{tag}</span>
            ))}
          </div>

          {/* Decorative floating icons */}
          <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '40px', height: '40px', borderRadius: '12px', background: '#FFF1F2', border: '2.5px solid var(--clay-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 var(--clay-border)' }}>
            <Icon paths={icons.star} size={18} strokeWidth={2} style={{ color: '#F43F5E' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDF4', border: '2.5px solid var(--clay-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 var(--clay-border)' }}>
            <Icon paths={icons.check} size={16} strokeWidth={2.5} style={{ color: '#22C55E' }} />
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="lp-trust-bar">
        <div className="lp-stats">
          {trustPoints.map(s => (
            <div key={s.label} className="lp-stat">
              <div className="lp-stat-value">{s.value}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <p className="lp-section-label">Process</p>
          <h2 className="lp-section-title">Three steps to certified truth</h2>
          <p className="lp-section-subtitle">Upload your work, let AI verify every claim, and receive a tamper-proof certificate.</p>
          <div className="lp-steps-grid">
            {steps.map(s => (
              <div key={s.step} className="lp-step-card">
                <div className="lp-step-num">{s.step}</div>
                <div className="lp-step-icon" style={{ background: s.bg, color: s.color }}>
                  <Icon paths={s.icon} size={24} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a href="/how-it-works" style={{ color: 'var(--green)', fontWeight: '700', fontSize: '0.9rem' }}>
              See the full process →
            </a>
          </div>
        </div>
      </section>

      {/* ── Explore Top-Rated Courses (Verification Features as Catalog) ── */}
      <section className="lp-section-alt">
        <div className="lp-section-inner">
          <p className="lp-section-label">Explore</p>
          <h2 className="lp-section-title">Explore Top-Rated Features</h2>
          <p className="lp-section-subtitle">Learn from industry experts and gain real-world verification skills.</p>
          <div className="lp-catalog-grid">
            {catalogItems.map((item, i) => (
              <div key={i} className="lp-catalog-card">
                <div className="lp-catalog-icon" style={{ background: item.bg, color: item.color }}>
                  <Icon paths={item.icon} size={22} />
                </div>
                <div className="lp-catalog-info">
                  <h4>{item.name}</h4>
                  <p className="lp-catalog-by">by {item.by}</p>
                  <div className="lp-catalog-meta">
                    <span>{item.lessons} checks</span>
                    <span>{item.duration}</span>
                    <span>{item.students}</span>
                  </div>
                </div>
                <div className="lp-catalog-rating">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {item.rating}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button className="lp-btn-secondary" onClick={() => navigate('/features')} style={{ padding: '12px 28px' }}>
              View All Features <Icon paths={icons.arrowRight} size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <p className="lp-section-label">Features</p>
          <h2 className="lp-section-title">Everything you need</h2>
          <p className="lp-section-subtitle">Comprehensive verification tools for students and educators.</p>
          <div className="lp-features-grid">
            {features.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ background: f.bg, color: f.color }}>
                  <Icon paths={f.icon} size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a href="/features" style={{ color: 'var(--green)', fontWeight: '700', fontSize: '0.9rem' }}>
              See all features →
            </a>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-section-alt">
        <div className="lp-section-inner">
          <p className="lp-section-label">Testimonials</p>
          <h2 className="lp-section-title">Loved by students & educators</h2>
          <p className="lp-section-subtitle">See what our community says about Verifact.</p>
          <div className="lp-testimonials-grid">
            {testimonials.map(t => (
              <div key={t.name} className="lp-testimonial-card">
                <div className="lp-testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="lp-testimonial-text">"{t.text}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar" style={{ background: t.avatarBg }}>{t.avatar}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta-section">
        <div className="lp-cta-card">
          <h2>Ready to Start Verifying?</h2>
          <p>Join thousands of students and educators. Start your verification journey today. First 7 days are completely free!</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="lp-btn-primary" onClick={() => navigate('/register')} style={{ fontSize: '1rem', padding: '16px 36px' }}>
              Start Free Trial <Icon paths={icons.arrowRight} size={16} strokeWidth={2.5} />
            </button>
            <a href="/pricing" className="lp-btn-secondary" style={{ fontSize: '1rem', padding: '16px 36px' }}>
              View Pricing
            </a>
          </div>
          <div className="lp-cta-checks">
            <div className="lp-cta-check">
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              No credit card required
            </div>
            <div className="lp-cta-check">
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <span className="lp-footer-brand">Verifact</span>
        <span className="lp-footer-copy">© 2026 Verifact. All rights reserved.</span>
        <div className="lp-footer-links">
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, path]) => (
            <span key={label} onClick={() => navigate(path)} className="lp-footer-link">{label}</span>
          ))}
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
