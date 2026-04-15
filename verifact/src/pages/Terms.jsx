import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#0F172A', padding: '0 56px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => navigate('/')} style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', letterSpacing: '-0.02em' }}>Verifact</span>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #334155', color: '#94A3B8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#64748B', marginBottom: '40px' }}>Last updated: April 2026</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: `By accessing or using Verifact, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.`,
          },
          {
            title: '2. Description of Service',
            body: `Verifact provides AI-powered document verification and certificate issuance services for academic and professional use. The service analyses submitted documents for factual accuracy and plagiarism, and issues cryptographic certificates to documents that meet the required thresholds.`,
          },
          {
            title: '3. User Accounts',
            body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account. You must be at least 13 years of age to use this service.`,
          },
          {
            title: '4. Acceptable Use',
            body: `You agree not to submit documents you do not have the right to share, use the service for any unlawful purpose, attempt to reverse-engineer or scrape our systems, submit malicious files, or misrepresent certificates issued by Verifact. We reserve the right to suspend accounts that violate these terms.`,
          },
          {
            title: '5. Verification Results',
            body: `Verifact's AI-powered verification provides scores and assessments as a tool to assist users — not as a definitive determination of factual accuracy or plagiarism. Results should be used as a guide alongside human review. Verifact makes no warranty that verification results are error-free.`,
          },
          {
            title: '6. Certificates',
            body: `Certificates issued by Verifact represent a score achieved at the time of verification. They are not a guarantee of absolute factual accuracy or zero plagiarism. Certificates are publicly verifiable and the associated metadata (holder name, institution, scores) is intentionally public.`,
          },
          {
            title: '7. Free Tier Limitations',
            body: `Free accounts are limited to 1 document verification per day. We reserve the right to change free tier limits at any time with reasonable notice.`,
          },
          {
            title: '8. Intellectual Property',
            body: `Verifact retains ownership of the platform, its AI models, and all associated technology. Users retain ownership of the documents they submit. By submitting a document, you grant Verifact a temporary licence to process it for verification purposes only.`,
          },
          {
            title: '9. Limitation of Liability',
            body: `To the maximum extent permitted by law, Verifact shall not be liable for any indirect, incidental, special, or consequential damages arising from use of the service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.`,
          },
          {
            title: '10. Changes to Terms',
            body: `We may update these Terms at any time. We will notify users of significant changes via email. Continued use of the service after changes constitutes acceptance of the updated Terms.`,
          },
          {
            title: '11. Contact',
            body: `For questions about these Terms, contact us at legal@verifact.work.`,
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

export default Terms;
