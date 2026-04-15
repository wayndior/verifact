import React from 'react';

const Profile = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '8px', color: '#0F172A' }}>Profile</h1>
      <p style={{ color: '#64748B', marginBottom: '30px' }}>Manage your account settings.</p>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', marginBottom: '6px' }}>Full Name</label>
          <input type="text" placeholder="Your name" style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E0', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', marginBottom: '6px' }}>Email</label>
          <input type="email" placeholder="you@example.com" style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E0', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', marginBottom: '6px' }}>Role</label>
          <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E0', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}>
            <option value="student">Student</option>
            <option value="educator">Educator</option>
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F172A', fontWeight: '600', marginBottom: '6px' }}>Country</label>
          <input type="text" placeholder="Your country" style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E0', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
        </div>
        <button className="btn-primary" style={{ padding: '12px 30px', fontSize: '1rem' }}>Save Changes</button>
      </div>
    </div>
  );
};

export default Profile;
