import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Admin dashboard — three panels:
 *   1. Stats cards (users, documents, certificates, classes)
 *   2. User list — searchable, paginated, promote/demote/delete actions
 *   3. Recent uploads feed
 *
 * Route is `/admin` and is protected client-side by `is_admin`. Server-side
 * enforcement happens in `server/routes/admin.js`, which is the real gate —
 * the client check is just a UX convenience.
 */

const StatCard = ({ label, value, sub }) => (
  <div style={{
    background: 'white',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '20px 24px',
  }}>
    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ margin: '6px 0 0', color: '#0F172A', fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.03em' }}>{value}</p>
    {sub && <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.78rem' }}>{sub}</p>}
  </div>
);

const Section = ({ title, right, children }) => (
  <section style={{ marginBottom: '28px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
      <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

export default function Admin() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userMeta, setUserMeta] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // ── Loaders ──────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    const res = await authFetch('/api/admin/stats');
    if (res.ok) setStats(await res.json());
  }, [authFetch]);

  const loadUsers = useCallback(async (page = 1, q = '') => {
    const params = new URLSearchParams({ page: String(page), pageSize: '25' });
    if (q) params.set('q', q);
    const res = await authFetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setUserMeta({ page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages });
    }
  }, [authFetch]);

  const loadDocs = useCallback(async () => {
    const res = await authFetch('/api/admin/documents?limit=20');
    if (res.ok) {
      const data = await res.json();
      setDocs(data.documents);
    }
  }, [authFetch]);

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (!user.is_admin) { navigate('/dashboard'); return; }
    (async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadUsers(1, ''), loadDocs()]);
      setLoading(false);
    })();
  }, [user, navigate, loadStats, loadUsers, loadDocs]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const runAction = async (url, method = 'POST', confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setActionError('');
    const res = await authFetch(url, { method });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionError(data.error || 'Action failed.');
      return;
    }
    await Promise.all([loadStats(), loadUsers(userMeta.page, search)]);
  };

  const onSearch = (e) => {
    e.preventDefault();
    loadUsers(1, search.trim());
  };

  if (!user || !user.is_admin) return null;

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '4px' }}>Admin Dashboard</h1>
      <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 24px' }}>Operational overview, user management, and recent activity.</p>

      {loading && <p style={{ color: '#64748B' }}>Loading…</p>}

      {actionError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '0.85rem' }}>
          {actionError}
        </div>
      )}

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      {stats && (
        <Section title="Overview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <StatCard label="Users" value={stats.users.total} sub={`${stats.users.newLast7d} new in 7d`} />
            <StatCard label="Students" value={stats.users.students} />
            <StatCard label="Educators" value={stats.users.educators} />
            <StatCard label="Admins" value={stats.users.admins} />
            <StatCard label="Verified emails" value={stats.users.verified} sub={`${stats.users.total > 0 ? Math.round((stats.users.verified / stats.users.total) * 100) : 0}% of users`} />
            <StatCard label="Documents" value={stats.documents.total} sub={`${stats.documents.uploadsLast7d} in 7d`} />
            <StatCard label="Completed docs" value={stats.documents.complete} />
            <StatCard label="Failed docs" value={stats.documents.error} />
            <StatCard label="Certificates" value={stats.certificates.total} />
            <StatCard label="Classes" value={stats.classes.total} />
          </div>
        </Section>
      )}

      {/* ── Users ───────────────────────────────────────────────────────────── */}
      <Section
        title="Users"
        right={
          <form onSubmit={onSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '7px', fontSize: '0.82rem', minWidth: '220px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '8px 14px', background: '#0F172A', color: 'white', borderRadius: '7px', fontWeight: '600', fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        }
      >
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Joined</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '500' }}>{u.full_name}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', background: '#F1F5F9', color: '#475569', borderRadius: '100px', fontSize: '0.72rem', fontWeight: '600', textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                      {u.is_admin ? (
                        <span style={{ marginLeft: '6px', padding: '3px 10px', background: '#EFF6FF', color: '#2563EB', borderRadius: '100px', fontSize: '0.72rem', fontWeight: '600' }}>
                          Admin
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.email_verified ? (
                        <span style={{ color: '#16A34A', fontSize: '0.78rem', fontWeight: '600' }}>Verified</span>
                      ) : (
                        <span style={{ color: '#D97706', fontSize: '0.78rem', fontWeight: '600' }}>Unverified</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '0.8rem' }}>
                      {u.created_at ? new Date(u.created_at.replace(' ', 'T') + 'Z').toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {u.user_id !== user.user_id && (
                        <>
                          {u.is_admin ? (
                            <button
                              onClick={() => runAction(`/api/admin/users/${u.user_id}/demote`, 'POST')}
                              style={{ padding: '6px 10px', marginRight: '6px', background: '#F1F5F9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                            >
                              Demote
                            </button>
                          ) : (
                            <button
                              onClick={() => runAction(`/api/admin/users/${u.user_id}/promote`, 'POST')}
                              style={{ padding: '6px 10px', marginRight: '6px', background: '#EFF6FF', color: '#2563EB', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                            >
                              Make admin
                            </button>
                          )}
                          <button
                            onClick={() => runAction(`/api/admin/users/${u.user_id}`, 'DELETE', `Delete ${u.email}? This cascades to all their documents, certificates, and classes.`)}
                            style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.88rem' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {userMeta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', fontSize: '0.82rem', color: '#64748B' }}>
              <span>Page {userMeta.page} of {userMeta.totalPages} · {userMeta.total} total</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  disabled={userMeta.page <= 1}
                  onClick={() => loadUsers(userMeta.page - 1, search)}
                  style={{ padding: '6px 14px', background: userMeta.page <= 1 ? '#F1F5F9' : 'white', color: userMeta.page <= 1 ? '#CBD5E0' : '#475569', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: userMeta.page <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  Prev
                </button>
                <button
                  disabled={userMeta.page >= userMeta.totalPages}
                  onClick={() => loadUsers(userMeta.page + 1, search)}
                  style={{ padding: '6px 14px', background: userMeta.page >= userMeta.totalPages ? '#F1F5F9' : 'white', color: userMeta.page >= userMeta.totalPages ? '#CBD5E0' : '#475569', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: userMeta.page >= userMeta.totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── Recent docs ─────────────────────────────────────────────────────── */}
      <Section title="Recent uploads">
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          {docs.map((d, i) => (
            <div key={d.document_id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 18px',
              borderBottom: i < docs.length - 1 ? '1px solid #F1F5F9' : 'none',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: d.upload_status === 'error' ? '#FEF2F2' : d.upload_status === 'complete' ? '#F0FDF4' : '#F8FAFC',
                color: d.upload_status === 'error' ? '#DC2626' : d.upload_status === 'complete' ? '#16A34A' : '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.72rem', fontWeight: '700',
              }}>
                {d.upload_status === 'complete' ? Math.round(d.verification_score ?? 0) : d.upload_status === 'error' ? '!' : '…'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: '#0F172A', fontWeight: '500', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.file_name}
                </p>
                <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '0.75rem' }}>
                  {d.full_name} · {d.email}
                </p>
              </div>
              <span style={{ color: '#94A3B8', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                {d.uploaded_at ? new Date(d.uploaded_at.replace(' ', 'T') + 'Z').toLocaleString() : ''}
              </span>
            </div>
          ))}
          {docs.length === 0 && !loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.88rem' }}>
              No documents yet.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
