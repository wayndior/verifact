import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Icon = ({ paths, size = 20, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

const icons = {
  plus:    ['M12 5v14', 'M5 12h14'],
  users:   ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  copy:    ['M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866', 'M18 6H10c-1.105 0-2 .911-2 2.036v10.857C8 20.09 8.895 21 10 21h8c1.105 0 2-.911 2-2.036V8.036C20 6.91 19.105 6 18 6z'],
  trash:   ['M3 6h18', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6', 'M14 11v6', 'M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'],
  logout:  ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  chevron: ['M9 18l6-6-6-6'],
  check:   ['M20 6L9 17l-5-5'],
  class:   ['M22 10l-10-5-10 5 10 5 10-5z', 'M6 12v5c0 0 3 3 6 3s6-3 6-3v-5'],
  score:   ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  doc:     ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  x:       ['M18 6L6 18', 'M6 6l12 12'],
}

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #CBD5E0',
  borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box',
  fontFamily: 'inherit', outline: 'none',
}

// ── Educator view ─────────────────────────────────────────────────────────────
const EducatorClasses = ({ token }) => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)      // { class, members }
  const [detailLoading, setDetailLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  const loadClasses = () => {
    setLoading(true)
    fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setClasses(d.classes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadClasses() }, [token])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true); setError('')
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setNewName(''); setCreating(false)
    loadClasses()
  }

  const handleDelete = async (classId) => {
    if (!window.confirm('Delete this class? This cannot be undone.')) return
    await fetch(`/api/classes/${classId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    if (selected?.class?.class_id === classId) setSelected(null)
    loadClasses()
  }

  const handleSelect = async (cls) => {
    if (selected?.class?.class_id === cls.class_id) { setSelected(null); return }
    setDetailLoading(true)
    const res = await fetch(`/api/classes/${cls.class_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setDetailLoading(false)
    if (res.ok) setSelected(data)
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Classes</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Create classes and share join codes with your students.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setError('') }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <Icon paths={icons.plus} size={16} /> New Class
        </button>
      </div>

      {/* Create class modal */}
      {creating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '420px', margin: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#0F172A', fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>Create a class</h2>
              <button onClick={() => setCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><Icon paths={icons.x} size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontWeight: '600', color: '#0F172A', fontSize: '0.875rem', marginBottom: '6px' }}>Class name</label>
              <input
                type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Biology 101 — Spring 2026"
                autoFocus required style={{ ...inputStyle, marginBottom: '16px' }}
              />
              {error && <p style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: '12px' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCreating(false)} style={{ padding: '10px 20px', background: 'none', border: '1px solid #CBD5E0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748B' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Loading…</div>
      ) : classes.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94A3B8' }}>
            <Icon paths={icons.class} size={24} />
          </div>
          <h3 style={{ color: '#0F172A', fontWeight: '600', marginBottom: '8px' }}>No classes yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '20px' }}>Create your first class and share the join code with students.</p>
          <button onClick={() => setCreating(true)} style={{ padding: '10px 24px', background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Create a class</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {classes.map(cls => (
            <div key={cls.class_id}>
              {/* Class card */}
              <div style={{ background: 'white', border: `1px solid ${selected?.class?.class_id === cls.class_id ? '#22C55E' : '#E2E8F0'}`, borderRadius: '12px', padding: '20px 24px', cursor: 'pointer' }}
                onClick={() => handleSelect(cls)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ color: '#0F172A', fontWeight: '600', fontSize: '1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cls.name}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '0.82rem' }}>
                        <Icon paths={icons.users} size={13} /> {cls.member_count} student{cls.member_count !== 1 ? 's' : ''}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#64748B', fontSize: '0.82rem' }}>Join code:</span>
                        <code style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '5px', fontFamily: 'monospace', fontWeight: '700', fontSize: '0.9rem', color: '#0F172A', letterSpacing: '0.08em' }}>{cls.join_code}</code>
                        <button
                          onClick={e => { e.stopPropagation(); copy(cls.join_code, cls.class_id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === cls.class_id ? '#22C55E' : '#94A3B8', padding: '0', display: 'flex' }}
                          title="Copy join code"
                        >
                          <Icon paths={copied === cls.class_id ? icons.check : icons.copy} size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(cls.class_id) }}
                      style={{ background: 'none', border: '1px solid #FEE2E2', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', color: '#EF4444', display: 'flex' }}
                      title="Delete class"
                    >
                      <Icon paths={icons.trash} size={15} />
                    </button>
                    <span style={{ color: '#94A3B8', transform: selected?.class?.class_id === cls.class_id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
                      <Icon paths={icons.chevron} size={18} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded member list */}
              {selected?.class?.class_id === cls.class_id && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px 24px' }}>
                  {detailLoading ? (
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading members…</p>
                  ) : selected.members.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                      No students yet. Share the join code <strong>{cls.join_code}</strong> with your class.
                    </p>
                  ) : (
                    <>
                      <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                        {selected.members.length} Student{selected.members.length !== 1 ? 's' : ''}
                      </p>
                      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        {selected.members.map((m, i) => {
                          const scoreColor = m.avg_score == null ? '#94A3B8' : m.avg_score >= 80 ? '#16A34A' : m.avg_score >= 50 ? '#D97706' : '#DC2626'
                          return (
                            <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', borderBottom: i < selected.members.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0 }}>
                                {m.full_name?.[0]?.toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: '500', color: '#0F172A', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.full_name}</p>
                                {m.institution && <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>{m.institution}</p>}
                              </div>
                              <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                                <div style={{ textAlign: 'center' }}>
                                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Docs</p>
                                  <p style={{ margin: 0, fontWeight: '700', color: '#0F172A', fontSize: '0.9rem' }}>{m.doc_count ?? 0}</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Score</p>
                                  <p style={{ margin: 0, fontWeight: '700', color: scoreColor, fontSize: '0.9rem' }}>{m.avg_score != null ? `${m.avg_score}` : '—'}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Student view ──────────────────────────────────────────────────────────────
const StudentClasses = ({ token }) => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadClasses = () => {
    setLoading(true)
    fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setClasses(d.classes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadClasses() }, [token])

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true); setJoinError(''); setJoinSuccess('')
    const res = await fetch('/api/classes/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ join_code: joinCode.trim() }),
    })
    const data = await res.json()
    setJoining(false)
    if (!res.ok) { setJoinError(data.error); return }
    setJoinCode('')
    setJoinSuccess(`Joined "${data.class.name}" successfully!`)
    setTimeout(() => setJoinSuccess(''), 3000)
    loadClasses()
  }

  const handleLeave = async (classId, className) => {
    if (!window.confirm(`Leave "${className}"?`)) return
    await fetch(`/api/classes/${classId}/leave`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    if (selected?.class?.class_id === classId) setSelected(null)
    loadClasses()
  }

  const handleSelect = async (cls) => {
    if (selected?.class?.class_id === cls.class_id) { setSelected(null); return }
    setDetailLoading(true)
    const res = await fetch(`/api/classes/${cls.class_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setDetailLoading(false)
    if (res.ok) setSelected(data)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Classes</h1>
      <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '28px' }}>Join a class using your educator's join code.</p>

      {/* Join class form */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px', maxWidth: '480px' }}>
        <h2 style={{ color: '#0F172A', fontWeight: '600', fontSize: '1rem', marginBottom: '14px' }}>Join a class</h2>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text" value={joinCode}
            onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
            placeholder="Enter join code (e.g. AB12CD)"
            maxLength={6} style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: '600' }}
          />
          <button type="submit" disabled={joining || joinCode.length < 4} style={{ padding: '10px 20px', background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', opacity: joining || joinCode.length < 4 ? 0.6 : 1 }}>
            {joining ? 'Joining…' : 'Join'}
          </button>
        </form>
        {joinError && <p style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '8px', marginBottom: 0 }}>{joinError}</p>}
        {joinSuccess && <p style={{ color: '#16A34A', fontWeight: '600', fontSize: '0.875rem', marginTop: '8px', marginBottom: 0 }}>{joinSuccess}</p>}
      </div>

      {/* Joined classes list */}
      {loading ? (
        <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Loading…</div>
      ) : classes.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>You haven't joined any classes yet. Enter a join code above to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Your classes ({classes.length})</p>
          {classes.map(cls => (
            <div key={cls.class_id}>
              <div style={{ background: 'white', border: `1px solid ${selected?.class?.class_id === cls.class_id ? '#22C55E' : '#E2E8F0'}`, borderRadius: '12px', padding: '18px 24px', cursor: 'pointer' }}
                onClick={() => handleSelect(cls)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <h3 style={{ color: '#0F172A', fontWeight: '600', fontSize: '0.95rem', margin: '0 0 4px' }}>{cls.name}</h3>
                    <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>Educator: {cls.educator_name} · {cls.member_count} student{cls.member_count !== 1 ? 's' : ''}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleLeave(cls.class_id, cls.name) }}
                      style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', color: '#94A3B8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Icon paths={icons.logout} size={13} /> Leave
                    </button>
                    <span style={{ color: '#94A3B8', transform: selected?.class?.class_id === cls.class_id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
                      <Icon paths={icons.chevron} size={18} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded classmates list */}
              {selected?.class?.class_id === cls.class_id && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px 24px' }}>
                  {detailLoading ? (
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading…</p>
                  ) : (
                    <>
                      <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                        Classmates ({selected.members.length})
                      </p>
                      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        {selected.members.map((m, i) => (
                          <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderBottom: i < selected.members.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.78rem', flexShrink: 0 }}>
                              {m.full_name?.[0]?.toUpperCase()}
                            </div>
                            <p style={{ margin: 0, fontWeight: '500', color: '#0F172A', fontSize: '0.875rem' }}>{m.full_name}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Route ─────────────────────────────────────────────────────────────────────
const Classes = () => {
  const { user, token } = useAuth()
  if (!user) return null
  return user.role === 'educator'
    ? <EducatorClasses token={token} />
    : <StudentClasses token={token} />
}

export default Classes
