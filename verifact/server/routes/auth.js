// auth.js — async version for Turso
// Changes from original:
//  - db.prepare(…).get/run  →  await query.get/run
//  - JWT_SECRET no longer has a fallback default (fails fast if not set)

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { sendWelcome, sendEmailVerification } from '../email.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

// ── Email verification token helpers ─────────────────────────────────────────
// Tokens live in email_verification_tokens. Expire after 24h. One unused
// token per user at a time — issuing a new one deletes the old.
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

async function issueEmailVerificationToken(userId) {
  await query.run('DELETE FROM email_verification_tokens WHERE user_id = ?', [userId]);
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS).toISOString();
  await query.run(
    'INSERT INTO email_verification_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expiresAt]
  );
  return token;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { full_name, email, password, country, role } = req.body;
  const { date_of_birth, institution, school_id, address } = req.body;

  if (!full_name || !email || !password || !country || !role) {
    return res.status(400).json({ error: 'full_name, email, password, country, and role are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (!['student', 'educator'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or educator.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await query.get('SELECT user_id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 12);

  await query.run(
    `INSERT INTO users
       (user_id, email, password_hash, full_name, country, role,
        date_of_birth, institution, school_id, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      normalizedEmail,
      passwordHash,
      full_name.trim(),
      country,
      role,
      date_of_birth ?? null,
      institution ?? null,
      school_id ?? null,
      address ?? null,
    ]
  );

  const token = jwt.sign(
    { user_id: userId, email: normalizedEmail, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Fire-and-forget — don't let an email failure block registration.
  // Welcome goes out immediately; verification is a separate email so the
  // recipient sees the "Confirm" CTA front-and-center.
  sendWelcome(normalizedEmail, full_name.trim()).catch(console.error);
  issueEmailVerificationToken(userId)
    .then((verifyToken) => sendEmailVerification(normalizedEmail, full_name.trim(), verifyToken))
    .catch(console.error);

  res.status(201).json({
    token,
    user: {
      user_id: userId,
      email: normalizedEmail,
      full_name: full_name.trim(),
      role,
      email_verified: 0,
    },
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await query.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

  // Use a constant-time comparison path so timing doesn't leak whether the email exists
  const hashToCompare = user?.password_hash ?? '$2b$12$invalidhashpadding000000000000000000000000000000000000000';
  const valid = await bcrypt.compare(password, hashToCompare);

  if (!user || !valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// ── Shared auth middleware ────────────────────────────────────────────────────
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

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const user = await query.get(
    `SELECT user_id, email, full_name, country, role, institution,
            school_id, address, email_verified, is_admin, created_at
     FROM users WHERE user_id = ?`,
    [req.user.user_id]
  );
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
  const { full_name, country, institution, school_id, address } = req.body;
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (full_name.trim().length > 200) return res.status(400).json({ error: 'Full name must be 200 characters or fewer.' });
  if (country && country.length > 100) return res.status(400).json({ error: 'Country must be 100 characters or fewer.' });
  if (institution && institution.length > 300) return res.status(400).json({ error: 'Institution must be 300 characters or fewer.' });
  if (school_id && school_id.length > 100) return res.status(400).json({ error: 'School ID must be 100 characters or fewer.' });
  if (address && address.length > 500) return res.status(400).json({ error: 'Address must be 500 characters or fewer.' });
  await query.run(
    `UPDATE users SET full_name = ?, country = ?, institution = ?, school_id = ?, address = ?
     WHERE user_id = ?`,
    [
      full_name.trim(),
      country ?? null,
      institution ?? null,
      school_id ?? null,
      address ?? null,
      req.user.user_id,
    ]
  );
  const updated = await query.get(
    `SELECT user_id, email, full_name, country, role, institution,
            school_id, address, email_verified, is_admin, created_at
     FROM users WHERE user_id = ?`,
    [req.user.user_id]
  );
  res.json({ user: updated });
});

// ── POST /api/auth/verify-email/resend ───────────────────────────────────────
// Issues a fresh token and re-sends the verification email. No-op (but still
// returns 200) if the user is already verified — no user enumeration.
router.post('/verify-email/resend', requireAuth, async (req, res) => {
  const user = await query.get(
    'SELECT user_id, email, full_name, email_verified FROM users WHERE user_id = ?',
    [req.user.user_id]
  );
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.email_verified) {
    return res.json({ message: 'Email already verified.', already: true });
  }

  const token = await issueEmailVerificationToken(user.user_id);
  try {
    await sendEmailVerification(user.email, user.full_name, token);
    res.json({ message: 'Verification email sent.' });
  } catch (err) {
    console.error('[verify-email/resend]', err);
    // Don't leak internal Resend errors verbatim; give a user-friendly message
    // while still returning a 500 so the frontend can show the real failure.
    res.status(500).json({
      error: 'Failed to send the verification email. Please try again in a moment.',
    });
  }
});

// ── GET /api/auth/verify-email/:token ────────────────────────────────────────
// Consumes a verification token. Idempotent: re-clicking a used-but-valid
// link returns success so users don't see scary error pages.
router.get('/verify-email/:token', async (req, res) => {
  const row = await query.get(
    `SELECT t.*, u.email_verified
     FROM email_verification_tokens t
     JOIN users u ON t.user_id = u.user_id
     WHERE t.token = ?`,
    [req.params.token]
  );

  if (!row) {
    return res.status(400).json({ error: 'Invalid or expired verification link.' });
  }
  if (new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: 'This verification link has expired. Request a new one.' });
  }
  // Already used AND already verified → treat as success (idempotent).
  if (row.used && row.email_verified) {
    return res.json({ message: 'Email already verified.', verified: true });
  }

  await query.run('UPDATE email_verification_tokens SET used = 1 WHERE token = ?', [req.params.token]);
  await query.run('UPDATE users SET email_verified = 1 WHERE user_id = ?', [row.user_id]);
  res.json({ message: 'Email verified successfully.', verified: true });
});

export default router;
