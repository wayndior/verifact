import React from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#0F172A', padding: '0 56px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => navigate('/')} style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', letterSpacing: '-0.02em' }}>Verifact</span>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #334155', color: '#94A3B8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: '#64748B', marginBottom: '40px' }}>Last updated: April 2026</p>

        {[
          {
            title: '1. Information We Collect',
            body: `We collect information you provide directly to us, such as when you create an account, upload documents, or contact us for support. This includes your name, email address, country, institution, and any documents you submit for verification. We also collect usage data such as pages visited, features used, and verification history.`,
          },
          {
            title: '2. How We Use Your Information',
            body: `We use your information to provide and improve our services, including document verification, certificate issuance, and account management. We may use your email to send transactional messages (welcome emails, password resets) and important service updates. We do not sell your personal data to third parties.`,
          },
          {
            title: '3. Document Storage',
            body: `Documents you upload are processed in memory and are not permanently stored on our servers. Only metadata (file name, hash, scores, and verification results) is retained in our database. Original file content is discarded after processing.`,
          },
          {
            title: '4. Certificates & Public Verification',
            body: `Certificates issued by Verifact are publicly verifiable by design. The public verification page for a certificate displays the document holder's name, institution, verification scores, and document hash. This information is intentionally public to allow third parties to verify certificate authenticity.`,
          },
          {
            title: '5. Data Sharing',
            body: `We may share your information with trusted third-party service providers (such as database hosting and email delivery) solely to operate our services. These providers are contractually obligated to keep your data secure and confidential. We do not share your data with advertisers.`,
          },
          {
            title: '6. Data Retention',
            body: `We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us at privacy@verifact.work. Certificates associated with your account may be retained for verification purposes even after account deletion.`,
          },
          {
            title: '7. Security',
            body: `We use industry-standard security practices including HTTPS encryption, hashed passwords (bcrypt), and JWT-based authentication. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
          },
          {
            title: '8. Contact',
            body: `If you have questions about this Privacy Policy, please contact us at privacy@verifact.work.`,
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#0F172A', fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>{section.title}</h2>
            <p style={{ color: '#475569', lineHeight: '1.8', margin: 0 }}>{section.body}</p>
          </div>
        ))}
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

export default Privacy;
