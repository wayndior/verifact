import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '2.5px solid var(--clay-border)',
  borderRadius: '14px',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block',
  color: 'var(--text-1)',
  fontWeight: '600',
  marginBottom: '6px',
  fontSize: '0.875rem',
};

const Profile = () => {
  const { user, token, login } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    country: '',
    institution: '',
    school_id: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        full_name:   user.full_name   || '',
        country:     user.country     || '',
        institution: user.institution || '',
        school_id:   user.school_id   || '',
        address:     user.address     || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save changes.');
        setStatus('error');
      } else {
        login(token, data.user);
        setStatus('success');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '8px', color: 'var(--text-1)', fontFamily: 'Nunito, sans-serif', fontWeight: '900', fontSize: '1.6rem' }}>Profile</h1>
      <p style={{ color: '#64748B', marginBottom: '30px' }}>Manage your account settings.</p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '32px',
          borderRadius: '18px',
          border: '3px solid var(--clay-border)',
          boxShadow: '6px 6px 0 var(--clay-border)',
          maxWidth: '600px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            style={{ ...inputStyle, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }}
          />
          <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.78rem' }}>Email cannot be changed.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--clay-border)'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Role</label>
          <input
            type="text"
            value={user?.role === 'educator' ? 'Educator' : 'Student'}
            readOnly
            style={{ ...inputStyle, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="Your country"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--clay-border)'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Institution</label>
          <input
            type="text"
            name="institution"
            value={form.institution}
            onChange={handleChange}
            placeholder="School or university"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--clay-border)'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>School ID</label>
          <input
            type="text"
            name="school_id"
            value={form.school_id}
            onChange={handleChange}
            placeholder="Student / staff ID"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--clay-border)'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Your address"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--clay-border)'}
          />
        </div>

        {status === 'success' && (
          <div style={{ background: '#F0FDF4', border: '2px solid #16A34A', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
            <p style={{ color: '#16A34A', fontWeight: '700', fontSize: '0.875rem', margin: 0 }}>
              Changes saved successfully.
            </p>
          </div>
        )}
        {status === 'error' && (
          <div style={{ background: '#FEF2F2', border: '2px solid #DC2626', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
            <p style={{ color: '#DC2626', fontWeight: '700', fontSize: '0.875rem', margin: 0 }}>
              {errorMsg}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '13px 30px', fontSize: '0.95rem',
            background: saving ? '#86EFAC' : 'var(--green)',
            color: 'white', borderRadius: '14px',
            fontWeight: '800',
            border: '2.5px solid var(--clay-border)',
            boxShadow: saving ? 'none' : '4px 4px 0 var(--clay-border)',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => { if (!saving) { e.target.style.transform = 'translate(2px, 2px)'; e.target.style.boxShadow = '2px 2px 0 var(--clay-border)' } }}
          onMouseLeave={e => { e.target.style.transform = 'translate(0, 0)'; e.target.style.boxShadow = saving ? 'none' : '4px 4px 0 var(--clay-border)' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
