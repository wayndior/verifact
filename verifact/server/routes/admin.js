// admin.js — admin-only endpoints for the internal dashboard.
//
// Access control: every endpoint runs through `requireAdmin`, which verifies
// the JWT, loads the full user row from the DB, and 403s if `is_admin != 1`.
// Never trust the JWT's role/is_admin claim alone — the DB is the source of
// truth, so a demoted user can't keep using an old token to access this API.

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

// ── Auth middleware ──────────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  const user = await query.get(
    `SELECT user_id, email, full_name, is_admin FROM users WHERE user_id = ?`,
    [decoded.user_id]
  );
  if (!user) return res.status(401).json({ error: 'User no longer exists.' });
  if (!user.is_admin) return res.status(403).json({ error: 'Admin access required.' });
  req.user = user;
  next();
}

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
// High-level metrics for the dashboard cards. All counts run in parallel.
router.get('/stats', requireAdmin, async (_req, res) => {
  const [
    totalUsers, students, educators, admins, verified,
    totalDocs, completeDocs, errorDocs,
    totalCerts,
    totalClasses,
    docsLast7d, usersLast7d,
  ] = await Promise.all([
    query.get('SELECT COUNT(*) AS cnt FROM users'),
    query.get("SELECT COUNT(*) AS cnt FROM users WHERE role = 'student'"),
    query.get("SELECT COUNT(*) AS cnt FROM users WHERE role = 'educator'"),
    query.get('SELECT COUNT(*) AS cnt FROM users WHERE is_admin = 1'),
    query.get('SELECT COUNT(*) AS cnt FROM users WHERE email_verified = 1'),
    query.get('SELECT COUNT(*) AS cnt FROM documents'),
    query.get("SELECT COUNT(*) AS cnt FROM documents WHERE upload_status = 'complete'"),
    query.get("SELECT COUNT(*) AS cnt FROM documents WHERE upload_status = 'error'"),
    query.get('SELECT COUNT(*) AS cnt FROM certificates'),
    query.get('SELECT COUNT(*) AS cnt FROM classes'),
    query.get("SELECT COUNT(*) AS cnt FROM documents WHERE uploaded_at >= datetime('now', '-7 days')"),
    query.get("SELECT COUNT(*) AS cnt FROM users WHERE created_at >= datetime('now', '-7 days')"),
  ]);

  res.json({
    users: {
      total: totalUsers.cnt,
      students: students.cnt,
      educators: educators.cnt,
      admins: admins.cnt,
      verified: verified.cnt,
      newLast7d: usersLast7d.cnt,
    },
    documents: {
      total: totalDocs.cnt,
      complete: completeDocs.cnt,
      error: errorDocs.cnt,
      uploadsLast7d: docsLast7d.cnt,
    },
    certificates: { total: totalCerts.cnt },
    classes: { total: totalClasses.cnt },
  });
});

// ── GET /api/admin/users ─────────────────────────────────────────────────────
// Paginated + searchable user list. Default page size 50, max 200.
router.get('/users', requireAdmin, async (req, res) => {
  const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 50, 200);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const offset = (page - 1) * pageSize;
  const search = (req.query.q ?? '').trim().toLowerCase();

  const whereClause = search ? `WHERE LOWER(email) LIKE ? OR LOWER(full_name) LIKE ?` : '';
  const searchArgs = search ? [`%${search}%`, `%${search}%`] : [];

  const [users, totalRow] = await Promise.all([
    query.all(
      `SELECT user_id, email, full_name, role, is_admin, email_verified, country,
              institution, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...searchArgs, pageSize, offset]
    ),
    query.get(`SELECT COUNT(*) AS cnt FROM users ${whereClause}`, searchArgs),
  ]);

  res.json({
    users,
    page,
    pageSize,
    total: totalRow.cnt,
    totalPages: Math.max(1, Math.ceil(totalRow.cnt / pageSize)),
  });
});

// ── GET /api/admin/documents ─────────────────────────────────────────────────
// Recent uploads across all users (for the activity feed).
router.get('/documents', requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const docs = await query.all(
    `SELECT d.document_id, d.file_name, d.upload_status, d.verification_score,
            d.plagiarism_score, d.certificate_id, d.uploaded_at, d.processed_at,
            u.email, u.full_name
     FROM documents d
     JOIN users u ON d.user_id = u.user_id
     ORDER BY d.uploaded_at DESC
     LIMIT ?`,
    [limit]
  );
  res.json({ documents: docs });
});

// ── POST /api/admin/users/:id/promote  (make admin) ──────────────────────────
router.post('/users/:id/promote', requireAdmin, async (req, res) => {
  const target = await query.get('SELECT user_id FROM users WHERE user_id = ?', [req.params.id]);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  await query.run('UPDATE users SET is_admin = 1 WHERE user_id = ?', [req.params.id]);
  res.json({ message: 'User promoted to admin.' });
});

// ── POST /api/admin/users/:id/demote ─────────────────────────────────────────
// Admins can demote other admins but NOT themselves — prevents the last
// admin from locking everyone out of the dashboard.
router.post('/users/:id/demote', requireAdmin, async (req, res) => {
  if (req.params.id === req.user.user_id) {
    return res.status(400).json({ error: "You can't demote yourself." });
  }
  const target = await query.get('SELECT user_id FROM users WHERE user_id = ?', [req.params.id]);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  await query.run('UPDATE users SET is_admin = 0 WHERE user_id = ?', [req.params.id]);
  res.json({ message: 'User demoted.' });
});

// ── DELETE /api/admin/users/:id ──────────────────────────────────────────────
// CASCADE handles documents, certificates, classes, class_members,
// password tokens, and email verification tokens.
router.delete('/users/:id', requireAdmin, async (req, res) => {
  if (req.params.id === req.user.user_id) {
    return res.status(400).json({ error: "You can't delete your own account from the admin panel." });
  }
  const target = await query.get('SELECT user_id FROM users WHERE user_id = ?', [req.params.id]);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  await query.run('DELETE FROM users WHERE user_id = ?', [req.params.id]);
  res.json({ message: 'User deleted.' });
});

export default router;
