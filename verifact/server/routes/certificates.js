// certificates.js — async version for Turso
// Only change from original: db.prepare(…).all/get  →  await query.all/get

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { query } from '../db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) throw new Error('BASE_URL is not set');

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// ── GET /api/certificates — list for logged-in user ───────────────────────────
router.get('/', requireAuth, async (req, res) => {
  const certs = await query.all(
    `SELECT c.*, u.full_name, u.institution
     FROM certificates c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.user_id = ?
     ORDER BY c.issued_at DESC`,
    [req.user.user_id]
  );
  res.json({ certificates: certs });
});

// ── GET /api/certificates/:id — public verification (no auth needed) ──────────
router.get('/:id', async (req, res) => {
  const cert = await query.get(
    `SELECT c.*, u.full_name, u.institution, u.country
     FROM certificates c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.cert_id = ?`,
    [req.params.id]
  );
  if (!cert) return res.status(404).json({ error: 'Certificate not found.' });
  res.json(cert);
});

// ── GET /api/certificates/:id/qr — generate QR code ──────────────────────────
router.get('/:id/qr', async (req, res) => {
  const cert = await query.get(
    'SELECT cert_id FROM certificates WHERE cert_id = ?',
    [req.params.id]
  );
  if (!cert) return res.status(404).json({ error: 'Certificate not found.' });

  const url = `${BASE_URL}/verify/${cert.cert_id}`;
  const qr = await QRCode.toDataURL(url, { width: 200, margin: 2 });
  res.json({ qr, url });
});

export default router;
