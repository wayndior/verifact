import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    // Opens native mail client as a fallback — replace with a backend endpoint or Resend if needed
    const mailto = `mailto:hello@verifact.work?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #CBD5E0',
    borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box',
    fontFamily: 'inherit', outline: 'none', background: 'white',
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#0F172A', padding: '0 56px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => navigate('/')} style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', letterSpacing: '-0.02em' }}>Verifact</span>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #334155', color: '#94A3B8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '56px 24px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Contact Us</h1>
        <p style={{ color: '#64748B', marginBottom: '40px', lineHeight: '1.6' }}>
          Have a question, issue, or partnership enquiry? We'd love to hear from you.
        </p>

        {/* Contact info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'General enquiries', email: 'hello@verifact.work' },
            { label: 'Support', email: 'support@verifact.work' },
            { label: 'Privacy', email: 'privacy@verifact.work' },
            { label: 'Institutional sales', email: 'sales@verifact.work' },
          ].map(item => (
            <div key={item.label} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px' }}>
              <p style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{item.label}</p>
              <a href={`mailto:${item.email}`} style={{ color: '#0F172A', fontWeight: '500', fontSize: '0.875rem', textDecoration: 'none' }}>{item.email}</a>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ color: '#0F172A', fontSize: '1.1rem', fontWeight: '600', marginBottom: '24px' }}>Send a message</h2>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: '#16A34A', fontWeight: '600', fontSize: '1rem', marginBottom: '8px' }}>Message opened in your mail app!</p>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>If it didn't open, email us directly at <a href="mailto:hello@verifact.work" style={{ color: '#22C55E' }}>hello@verifact.work</a></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', fontSize: '0.875rem', marginBottom: '6px' }}>Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', fontSize: '0.875rem', marginBottom: '6px' }}>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', fontSize: '0.875rem', marginBottom: '6px' }}>Subject</label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange} required placeholder="How can we help?" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', fontSize: '0.875rem', marginBottom: '6px' }}>Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Tell us more..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <button type="submit" style={{ padding: '12px 28px', background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      <footer style={{ background: '#0F172A', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 56px' }}>
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

export default Contact;
