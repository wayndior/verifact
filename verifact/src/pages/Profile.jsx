import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #CBD5E0',
  borderRadius: '8px',
  fontSize: '1rem',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block',
  color: '#0F172A',
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
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill form when user data is available
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
        // Update auth context with new user data so header/name reflects change
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
      <h1 style={{ marginBottom: '8px', color: '#0F172A' }}>Profile</h1>
      <p style={{ color: '#64748B', marginBottom: '30px' }}>Manage your account settings.</p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          maxWidth: '600px',
        }}
      >
        {/* Read-only email */}
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
          />
        </div>

        {status === 'success' && (
          <p style={{ color: '#16A34A', fontWeight: '600', marginBottom: '16px', fontSize: '0.875rem' }}>
            Changes saved successfully.
          </p>
        )}
        {status === 'error' && (
          <p style={{ color: '#DC2626', fontWeight: '600', marginBottom: '16px', fontSize: '0.875rem' }}>
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ padding: '12px 30px', fontSize: '1rem', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
