import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * First-run onboarding modal. Shows a short 3-step walkthrough the first
 * time a user lands inside the app after registering. Dismissal state
 * persists in localStorage keyed by user_id, so switching accounts shows
 * the tour again for the new user.
 *
 * Triggering: the Register page sets `vf_onboarding_pending = <user_id>`
 * on successful signup; this component checks that flag AND that the user
 * hasn't already completed the tour.
 */

const STEPS = {
  student: [
    {
      title: 'Welcome to Verifact',
      body: 'Upload your essays, reports, or presentations and get a cryptographic proof that your facts check out and your work is original.',
      cta: 'Show me how →',
    },
    {
      title: 'Step 1 — Upload a document',
      body: 'Go to the Upload tab and drag in a PDF, DOCX, PPTX, or TXT file. We extract the text and run it through GPT-4o-mini for fact and plagiarism analysis.',
      cta: 'Next',
    },
    {
      title: 'Step 2 — Get your certificate',
      body: 'If your document scores 80+ with less than 10% plagiarism, we auto-issue a tamper-proof certificate with a QR code anyone can scan to verify authenticity.',
      cta: 'Got it — take me to Upload',
      action: 'upload',
    },
  ],
  educator: [
    {
      title: 'Welcome to Verifact',
      body: 'Verify student submissions, manage your classes, and issue cryptographic certificates of integrity — all in one place.',
      cta: 'Show me how →',
    },
    {
      title: 'Step 1 — Create a class',
      body: 'Head to the Classes tab to create your first class. Each class gets a join code you can share with students so they can link their submissions to you.',
      cta: 'Next',
    },
    {
      title: 'Step 2 — Verify in bulk',
      body: 'The Upload tab has a Bulk mode — drop in up to 20 student documents at once and get per-file scores, plagiarism flags, and auto-issued certificates.',
      cta: 'Take me to Classes',
      action: 'classes',
    },
  ],
};

export default function OnboardingTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    const completedKey = `vf_onboarding_done_${user.user_id}`;
    if (localStorage.getItem(completedKey)) return;

    const pending = localStorage.getItem('vf_onboarding_pending');
    // Show the tour if the Register page just flagged this user, OR if
    // this is a legacy user who never saw it (first-time login detection).
    if (pending === user.user_id) {
      setVisible(true);
      localStorage.removeItem('vf_onboarding_pending');
    }
  }, [user]);

  if (!visible || !user) return null;

  const steps = STEPS[user.role] ?? STEPS.student;
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const complete = () => {
    localStorage.setItem(`vf_onboarding_done_${user.user_id}`, '1');
    setVisible(false);
    if (current.action === 'upload') navigate('/upload');
    else if (current.action === 'classes') navigate('/classes');
  };

  const skip = () => {
    localStorage.setItem(`vf_onboarding_done_${user.user_id}`, '1');
    setVisible(false);
  };

  const next = () => {
    if (isLast) complete();
    else setStep((s) => s + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '100px',
                background: i <= step ? '#22C55E' : '#E2E8F0',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        <h2 style={{ margin: '0 0 10px', fontSize: '1.4rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em' }}>
          {current.title}
        </h2>
        <p style={{ margin: '0 0 28px', color: '#475569', fontSize: '0.92rem', lineHeight: '1.65' }}>
          {current.body}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={skip}
            style={{
              padding: '9px 14px',
              background: 'transparent',
              color: '#94A3B8',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Skip tour
          </button>
          <button
            onClick={next}
            style={{
              padding: '11px 22px',
              background: '#22C55E',
              color: 'white',
              borderRadius: '9px',
              fontWeight: '600',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {current.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
