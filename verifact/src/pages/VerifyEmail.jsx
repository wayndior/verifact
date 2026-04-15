import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * /verify-email/:token — lands here from the email link. Hits the verify
 * endpoint and surfaces the result. If the currently-logged-in user is the
 * one being verified, we refresh their auth state so email_verified becomes
 * true across the app without requiring a logout/login cycle.
 */
export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, token: authToken } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/auth/verify-email/${token}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email verified.');

        // Refresh the cached user record so the banner disappears immediately.
        if (authToken) {
          try {
            const me = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            if (me.ok) {
              const body = await me.json();
              // AuthContext's `user` is updated via its own useEffect on token
              // change, so the simplest way to pick up email_verified is a
              // full reload of the SPA. Keeps the auth state consistent.
              // (Avoid storing directly — AuthContext owns user state.)
              if (body?.user && !cancelled) {
                // Soft-reload from the dashboard so the banner reflects the
                // new verified state.
                setTimeout(() => window.location.replace('/dashboard'), 1500);
                return;
              }
            }
          } catch { /* non-fatal */ }
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setMessage('Something went wrong. Please try again.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [token, authToken]);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em', cursor: 'pointer' }}>Verifact</span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '40px', textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#22C55E', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', margin: '0 0 8px' }}>Verifying your email…</h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>This will only take a second.</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0F172A', margin: '0 0 10px' }}>Email verified</h1>
              <p style={{ color: '#64748B', fontSize: '0.92rem', margin: '0 0 26px', lineHeight: 1.6 }}>
                {message} {user ? "We're taking you back to your dashboard…" : "You can now sign in."}
              </p>
              {!user && (
                <Link to="/login" style={{ display: 'inline-block', padding: '11px 28px', background: '#22C55E', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
                  Sign in
                </Link>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0F172A', margin: '0 0 10px' }}>Verification failed</h1>
              <p style={{ color: '#64748B', fontSize: '0.92rem', margin: '0 0 26px', lineHeight: 1.6 }}>
                {message}
              </p>
              <Link to="/dashboard" style={{ display: 'inline-block', padding: '11px 28px', background: '#0F172A', color: 'white', borderRadius: '9px', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>
                Go to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
