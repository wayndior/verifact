// auth.js — async version for Turso
// Changes from original:
//  - db.prepare(…).get/run  →  await query.get/run
//  - JWT_SECRET no longer has a fallback default (fails fast if not set)

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { sendWelcome } from '../email.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

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

  // Fire-and-forget — don't let an email failure block registration
  sendWelcome(normalizedEmail, full_name.trim()).catch(console.error);

  res.status(201).json({
    token,
    user: { user_id: userId, email: normalizedEmail, full_name: full_name.trim(), role },
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
            school_id, address, email_verified, created_at
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
            school_id, address, email_verified, created_at
     FROM users WHERE user_id = ?`,
    [req.user.user_id]
  );
  res.json({ user: updated });
});

export default router;
