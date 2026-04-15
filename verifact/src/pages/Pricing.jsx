import React from 'react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Students',
    price: 'Free',
    period: null,
    desc: 'Everything you need to verify your own academic work.',
    cta: 'Get Started Free',
    ctaStyle: 'light',
    features: [
      '5 document verifications / month',
      'AI claim extraction',
      'Plagiarism detection',
      'Verification certificate',
      'Email support',
    ],
  },
  {
    name: 'Educators',
    price: '$19',
    period: '/month',
    desc: 'Full control over your classes and student submissions.',
    cta: 'Start Free Trial',
    ctaStyle: 'dark',
    popular: true,
    features: [
      'Unlimited verifications',
      'Class & student management',
      'Bulk submission review',
      'Detailed analytics dashboard',
      'Priority support',
    ],
  },
  {
    name: 'Institutions',
    price: 'Custom',
    period: null,
    desc: 'Campus-wide licensing for schools and universities.',
    cta: 'Contact Sales',
    ctaStyle: 'light',
    features: [
      'Unlimited users & verifications',
      'SSO & LMS integration',
      'Dedicated account manager',
      'Custom branding',
      'SLA & compliance support',
    ],
  },
];

const Pricing = () => {
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
          <a href="/features" style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>Features</a>
          <a href="/pricing" style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: '600' }}>Pricing</a>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 20px', background: '#0F172A', color: 'white', borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Get Started</button>
        </nav>
      </header>

      <section style={{ padding: '96px 56px', maxWidth: '1040px', margin: '0 auto' }}>
        <p style={{ color: '#22C55E', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '12px' }}>Pricing</p>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '12px' }}>Simple, transparent pricing</h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem', lineHeight: '1.75', textAlign: 'center', marginBottom: '72px' }}>
          No hidden fees. No surprises. Pick the plan that fits.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              padding: '40px 36px',
              borderRadius: '14px',
              border: plan.popular ? '2px solid #0F172A' : '1px solid #E2E8F0',
              background: plan.popular ? '#0F172A' : 'white',
              position: 'relative',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  background: '#22C55E', color: 'white', fontSize: '0.72rem', fontWeight: '700',
                  padding: '4px 14px', borderRadius: '100px', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                }}>MOST POPULAR</div>
              )}
              <p style={{ fontSize: '0.8rem', fontWeight: '600', color: plan.popular ? '#94A3B8' : '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: '700', letterSpacing: '-0.03em', color: plan.popular ? 'white' : '#0F172A' }}>{plan.price}</span>
                {plan.period && <span style={{ color: plan.popular ? '#64748B' : '#94A3B8', fontSize: '0.9rem' }}>{plan.period}</span>}
              </div>
              <p style={{ color: plan.popular ? '#94A3B8' : '#64748B', fontSize: '0.9rem', marginBottom: '32px', lineHeight: '1.6' }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plan.features.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: plan.popular ? '#CBD5E0' : '#475569', fontSize: '0.9rem' }}>
                    <span style={{ color: '#22C55E', fontWeight: '700', fontSize: '1rem', flexShrink: 0 }}>&#10003;</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/dashboard')} style={{
                width: '100%', padding: '13px',
                background: plan.popular ? '#22C55E' : '#F1F5F9',
                color: plan.popular ? 'white' : '#0F172A',
                borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
              }}>{plan.cta}</button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: '96px', maxWidth: '600px', margin: '96px auto 0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: '40px', letterSpacing: '-0.02em' }}>Common questions</h2>
          {[
            { q: 'Can I upgrade or downgrade anytime?', a: 'Yes — you can change your plan at any time. Changes take effect on your next billing cycle.' },
            { q: 'Is there a free trial for Educators?', a: 'Yes, educators get a 14-day free trial with full access. No credit card required.' },
            { q: 'What counts as a "verification"?', a: 'One uploaded document processed through the full AI pipeline counts as one verification.' },
            { q: 'How does institutional pricing work?', a: 'We offer campus-wide annual licensing. Contact us for a custom quote based on your institution\'s size.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ padding: '24px 0', borderBottom: '1px solid #F1F5F9' }}>
              <p style={{ fontWeight: '600', color: '#0F172A', marginBottom: '8px', fontSize: '0.95rem' }}>{q}</p>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.65' }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: '#0F172A', borderTop: '1px solid #1E293B', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '96px' }}>
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

export default Pricing;
