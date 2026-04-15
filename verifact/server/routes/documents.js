// documents.js — document upload + AI verification
//
// Changes from VPS version:
//  1. multer switched to memoryStorage() — no files written to disk.
//     Vercel has an ephemeral /tmp but writing files there is fragile and
//     unnecessary now that extractText() accepts a Buffer.
//  2. Processing is now synchronous — the endpoint awaits the full
//     extract+verify pipeline and returns 200 with results, instead of
//     returning 202 and running a background job that would be killed
//     when the Vercel function returns.
//  3. All DB calls use `await query.*` (Turso async API).
//  4. Max file size reduced to 4 MB to stay within Vercel's 4.5 MB
//     request-body limit. (On a VPS the old 10 MB limit is fine.)

import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { extractText, verifyDocument } from '../ai.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ── Upload rate limiter: 5 requests / hour per user ──────────────────────────
// Sits on top of the per-user daily quota below.
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.user_id ?? req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many upload attempts. Please wait before trying again.' },
});

// ── Free tier: 1 upload per day per user ─────────────────────────────────────
async function checkUploadLimit(req, res, next) {
  const midnight = new Date();
  midnight.setUTCHours(0, 0, 0, 0);

  const row = await query.get(
    `SELECT COUNT(*) AS cnt FROM documents
     WHERE user_id = ? AND uploaded_at >= ?`,
    [req.user.user_id, midnight.toISOString()]
  );

  if ((row?.cnt ?? 0) >= 1) {
    return res.status(429).json({ error: 'Free tier allows 1 upload per day.' });
  }
  next();
}

// ── Multer — memory storage (no disk writes) ──────────────────────────────────
// 4 MB cap keeps us inside Vercel's 4.5 MB request-body limit.
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'text/plain',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME_TYPES.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Unsupported file type. Allowed: PDF, DOCX, PPTX, TXT'));
  },
});

// ── POST /api/documents/upload ────────────────────────────────────────────────
router.post(
  '/upload',
  requireAuth,
  checkUploadLimit,
  uploadLimiter,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const documentId = uuidv4();
    const { user_id: userId } = req.user;
    const { originalname: fileName, mimetype: mimeType, buffer: fileBuffer } = req.file;

    // SHA-256 hash for duplicate detection
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Create the record in "processing" state before doing any heavy work
    await query.run(
      `INSERT INTO documents
         (document_id, user_id, file_name, mime_type, upload_status, file_hash, uploaded_at)
       VALUES (?, ?, ?, ?, 'processing', ?, datetime('now'))`,
      [documentId, userId, fileName, mimeType, fileHash]
    );

    try {
      // ── Duplicate detection ──────────────────────────────────────────────────
      // If we have already verified an identical file, reuse those results.
      const existing = await query.get(
        `SELECT document_id, verification_score, plagiarism_score, results, certificate_id
         FROM documents
         WHERE file_hash = ? AND upload_status = 'complete' AND document_id != ?
         LIMIT 1`,
        [fileHash, documentId]
      );

      let score, plagiarism, resultsJson, certId;

      if (existing) {
        score = existing.verification_score;
        plagiarism = existing.plagiarism_score;
        resultsJson = existing.results;
        certId = existing.certificate_id;
      } else {
        // ── Extract text + AI verification ───────────────────────────────────
        const text = await extractText(fileBuffer, mimeType);

        if (text.length < 50) {
          await query.run(
            `UPDATE documents
             SET upload_status = 'error', processing_error = ?
             WHERE document_id = ?`,
            ['Document contains too little text to verify.', documentId]
          );
          return res.status(422).json({ error: 'Document contains too little text to verify.' });
        }

        const verification = await verifyDocument(text);
        score = verification.summary.overallScore;
        plagiarism = verification.plagiarism.score * 100; // store as 0-100
        resultsJson = JSON.stringify(verification);
      }

      // ── Auto-issue certificate ────────────────────────────────────────────
      if (score >= 80 && plagiarism < 10 && !certId) {
        certId = `VF-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
        await query.run(
          `INSERT INTO certificates
             (cert_id, document_id, user_id, file_name, file_hash, score, plagiarism, status, issued_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'auto_issued', datetime('now'))`,
          [certId, documentId, userId, fileName, fileHash, score, plagiarism]
        );
      }

      await query.run(
        `UPDATE documents
         SET upload_status      = 'complete',
             verification_score = ?,
             plagiarism_score   = ?,
             results            = ?,
             certificate_id     = ?,
             processed_at       = datetime('now')
         WHERE document_id = ?`,
        [score, plagiarism, resultsJson, certId ?? null, documentId]
      );

      return res.status(200).json({
        documentId,
        status: 'complete',
        score,
        plagiarism,
        certificateId: certId ?? null,
        results: resultsJson ? JSON.parse(resultsJson) : null,
      });
    } catch (err) {
      await query.run(
        `UPDATE documents SET upload_status = 'error', processing_error = ? WHERE document_id = ?`,
        [err.message, documentId]
      );
      throw err; // propagate to Express error handler
    }
  }
);

// ── GET /api/documents/status/:id ────────────────────────────────────────────
// Processing is now synchronous so status is always final by the time the
// upload responds. This endpoint is kept for frontend compatibility.
router.get('/status/:id', requireAuth, async (req, res) => {
  const doc = await query.get(
    `SELECT document_id, upload_status, verification_score, plagiarism_score,
            certificate_id, processing_error
     FROM documents WHERE document_id = ? AND user_id = ?`,
    [req.params.id, req.user.user_id]
  );
  if (!doc) return res.status(404).json({ error: 'Document not found.' });
  res.json(doc);
});

// ── GET /api/documents ────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  const docs = await query.all(
    `SELECT document_id, file_name, mime_type, upload_status, verification_score,
            plagiarism_score, certificate_id, uploaded_at, processed_at
     FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC`,
    [req.user.user_id]
  );
  res.json(docs);
});

// ── GET /api/documents/:id ────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  const doc = await query.get(
    `SELECT * FROM documents WHERE document_id = ? AND user_id = ?`,
    [req.params.id, req.user.user_id]
  );
  if (!doc) return res.status(404).json({ error: 'Document not found.' });
  res.json({ ...doc, results: doc.results ? JSON.parse(doc.results) : null });
});

export default router;
