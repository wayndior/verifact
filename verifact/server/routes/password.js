// password.js — async version for Turso
// Changes from original: db.prepare(…).get/run  →  await query.get/run

import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { sendPasswordReset } from '../email.js';

const router = Router();

// Generic message — same for existing and non-existing emails (no enumeration)
const FORGOT_RESPONSE = { message: 'If that email exists, a reset link has been sent.' };

// ── POST /api/password/forgot ─────────────────────────────────────────────────
router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const normalizedEmail = email.toLowerCase().trim();
  const user = await query.get('SELECT user_id, full_name FROM users WHERE email = ?', [normalizedEmail]);

  if (!user) return res.json(FORGOT_RESPONSE); // silent — no enumeration

  // Invalidate any existing tokens for this user before issuing a new one
  await query.run('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.user_id]);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await query.run(
    'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    [token, user.user_id, expiresAt]
  );

  // Fire-and-forget — don't expose email failures to the client
  sendPasswordReset(normalizedEmail, user.full_name, token).catch(console.error);

  res.json(FORGOT_RESPONSE);
});

// ── GET /api/password/validate/:token ────────────────────────────────────────
router.get('/validate/:token', async (req, res) => {
  const row = await query.get(
    `SELECT t.*, u.email
     FROM password_reset_tokens t
     JOIN users u ON t.user_id = u.user_id
     WHERE t.token = ?`,
    [req.params.token]
  );

  if (!row || row.used || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }

  res.json({ valid: true, email: row.email });
});

// ── POST /api/password/reset ──────────────────────────────────────────────────
router.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const row = await query.get(
    'SELECT * FROM password_reset_tokens WHERE token = ?',
    [token]
  );

  if (!row || row.used || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }

  // Mark token as used FIRST — prevents reuse even if the password update fails
  await query.run('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);
  const passwordHash = await bcrypt.hash(password, 12);
  await query.run('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, row.user_id]);

  res.json({ message: 'Password reset successfully.' });
});

export default router;
