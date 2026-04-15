import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

// ── Auth middleware ───────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireEducator = (req, res, next) => {
  if (req.user.role !== 'educator') return res.status(403).json({ error: 'Educators only.' });
  next();
};

// Generate a cryptographically secure unique 6-char alphanumeric join code
async function generateJoinCode() {
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  for (let i = 0; i < 20; i++) {
    const bytes = crypto.randomBytes(6);
    const code = Array.from(bytes).map(b => CHARS[b % CHARS.length]).join('');
    const existing = await query.get('SELECT class_id FROM classes WHERE join_code = ?', [code]);
    if (!existing) return code;
  }
  throw new Error('Failed to generate a unique join code.');
}

// Validate join code format
const JOIN_CODE_RE = /^[A-Z2-9]{6}$/;

// ── GET /api/classes ──────────────────────────────────────────────────────────
// Educator: list own classes. Student: list joined classes.
router.get('/', requireAuth, async (req, res) => {
  if (req.user.role === 'educator') {
    const classes = await query.all(
      `SELECT c.*,
         (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.class_id) AS member_count
       FROM classes c
       WHERE c.educator_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.user_id]
    );
    return res.json({ classes });
  }

  // Student — show classes they have joined
  const classes = await query.all(
    `SELECT c.*, u.full_name AS educator_name,
       (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.class_id) AS member_count
     FROM classes c
     JOIN class_members cm ON c.class_id = cm.class_id
     JOIN users u ON c.educator_id = u.user_id
     WHERE cm.student_id = ?
     ORDER BY cm.joined_at DESC`,
    [req.user.user_id]
  );
  res.json({ classes });
});

// ── POST /api/classes ─────────────────────────────────────────────────────────
// Educator creates a new class
router.post('/', requireAuth, requireEducator, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Class name is required.' });
  if (name.trim().length > 200) return res.status(400).json({ error: 'Class name must be 200 characters or fewer.' });

  const classId = uuidv4();
  const joinCode = await generateJoinCode();

  await query.run(
    'INSERT INTO classes (class_id, educator_id, name, join_code) VALUES (?, ?, ?, ?)',
    [classId, req.user.user_id, name.trim(), joinCode]
  );

  const created = await query.get(
    `SELECT *, 0 AS member_count FROM classes WHERE class_id = ?`,
    [classId]
  );
  res.status(201).json({ class: created });
});

// ── POST /api/classes/join ────────────────────────────────────────────────────
// Student joins via join code
router.post('/join', requireAuth, async (req, res) => {
  if (req.user.role === 'educator') {
    return res.status(403).json({ error: 'Educators cannot join classes as students.' });
  }

  const { join_code } = req.body;
  if (!join_code?.trim()) return res.status(400).json({ error: 'Join code is required.' });

  const normalized = join_code.trim().toUpperCase();
  if (!JOIN_CODE_RE.test(normalized)) {
    return res.status(400).json({ error: 'Invalid join code format.' });
  }

  const cls = await query.get(
    'SELECT * FROM classes WHERE join_code = ?',
    [normalized]
  );
  if (!cls) return res.status(404).json({ error: 'Invalid join code. Please check and try again.' });

  const already = await query.get(
    'SELECT * FROM class_members WHERE class_id = ? AND student_id = ?',
    [cls.class_id, req.user.user_id]
  );
  if (already) return res.status(409).json({ error: 'You are already in this class.' });

  await query.run(
    'INSERT INTO class_members (class_id, student_id) VALUES (?, ?)',
    [cls.class_id, req.user.user_id]
  );

  res.json({ class: cls });
});

// ── GET /api/classes/:id ──────────────────────────────────────────────────────
// Get class details + member list with stats
router.get('/:id', requireAuth, async (req, res) => {
  const cls = await query.get('SELECT * FROM classes WHERE class_id = ?', [req.params.id]);
  if (!cls) return res.status(404).json({ error: 'Class not found.' });

  if (req.user.role === 'educator') {
    if (cls.educator_id !== req.user.user_id) return res.status(403).json({ error: 'Not your class.' });
  } else {
    const membership = await query.get(
      'SELECT * FROM class_members WHERE class_id = ? AND student_id = ?',
      [req.params.id, req.user.user_id]
    );
    if (!membership) return res.status(403).json({ error: 'Not a member of this class.' });
  }

  const members = await query.all(
    `SELECT
       u.user_id, u.full_name, u.email, u.institution, cm.joined_at,
       (SELECT COUNT(*) FROM documents d WHERE d.user_id = u.user_id) AS doc_count,
       CAST(ROUND(
         (SELECT AVG(d.verification_score) FROM documents d
          WHERE d.user_id = u.user_id AND d.upload_status = 'complete')
       ) AS INTEGER) AS avg_score
     FROM class_members cm
     JOIN users u ON cm.student_id = u.user_id
     WHERE cm.class_id = ?
     ORDER BY cm.joined_at ASC
     LIMIT 200`,
    [req.params.id]
  );

  res.json({ class: cls, members });
});

// ── DELETE /api/classes/:id ───────────────────────────────────────────────────
// Educator deletes a class
router.delete('/:id', requireAuth, requireEducator, async (req, res) => {
  const cls = await query.get('SELECT * FROM classes WHERE class_id = ?', [req.params.id]);
  if (!cls) return res.status(404).json({ error: 'Class not found.' });
  if (cls.educator_id !== req.user.user_id) return res.status(403).json({ error: 'Not your class.' });

  await query.run('DELETE FROM classes WHERE class_id = ?', [req.params.id]);
  res.json({ message: 'Class deleted.' });
});

// ── DELETE /api/classes/:id/leave ─────────────────────────────────────────────
// Student leaves a class
router.delete('/:id/leave', requireAuth, async (req, res) => {
  if (req.user.role === 'educator') return res.status(403).json({ error: 'Educators cannot leave classes.' });

  await query.run(
    'DELETE FROM class_members WHERE class_id = ? AND student_id = ?',
    [req.params.id, req.user.user_id]
  );
  res.json({ message: 'Left class.' });
});

export default router;
