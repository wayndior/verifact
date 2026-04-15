import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Soft-enforcement banner: reminds unverified users to confirm their email.
 * Non-blocking — users can keep using the app — but it is visible on every
 * page until they click the link in the email and hit /verify-email/:token.
 *
 * Dismiss state lives in sessionStorage so the banner reappears on the next
 * session if the user is still unverified.
 */
export default function EmailVerificationBanner() {
  const { user, authFetch } = useAuth();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('vf_verify_dismissed') === '1');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!user || user.email_verified || dismissed) return null;

  const resend = async () => {
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await authFetch('/api/auth/verify-email/resend', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email.');
      setStatus('sent');
    } catch (e) {
      setStatus('error');
      setErrorMsg(e.message ?? 'Failed to send email.');
    }
  };

  const dismiss = () => {
    sessionStorage.setItem('vf_verify_dismissed', '1');
    setDismissed(true);
  };

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.82rem',
        lineHeight: 1.45,
        color: '#92400E',
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '14px',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ flex: '1 1 280px' }}>
        <strong style={{ color: '#78350F' }}>Confirm your email.</strong>{' '}
        We sent a verification link to <strong>{user.email}</strong>. Confirming helps us recover your account if you lose access.
        {status === 'sent' && <span style={{ color: '#16A34A', marginLeft: '8px', fontWeight: '600' }}> · Sent!</span>}
        {status === 'error' && <span style={{ color: '#DC2626', marginLeft: '8px', fontWeight: '600' }}> · {errorMsg}</span>}
      </span>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={resend}
          disabled={status === 'sending' || status === 'sent'}
          style={{
            padding: '6px 14px',
            background: status === 'sent' ? '#BBF7D0' : '#FDE68A',
            color: status === 'sent' ? '#166534' : '#78350F',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.78rem',
            border: 'none',
            cursor: status === 'sending' ? 'wait' : 'pointer',
          }}
        >
          {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Resend email'}
        </button>
        <button
          onClick={dismiss}
          style={{
            padding: '6px 10px',
            background: 'transparent',
            color: '#92400E',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.78rem',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
