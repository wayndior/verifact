import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import db from '../db.js'
import { extractText, verifyDocument } from '../ai.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret'
const UPLOADS_DIR = process.env.UPLOADS_PATH || path.resolve(__dirname, '../uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// ── Per-user upload rate limiter ──────────────────────────────────────────────
// Free tier: 1 upload per day per user
const DAILY_LIMIT = 1

const checkUploadLimit = (req, res, next) => {
  const since = new Date()
  since.setHours(0, 0, 0, 0) // start of today UTC
  const count = db.prepare(`
    SELECT COUNT(*) as cnt FROM documents
    WHERE user_id = ? AND uploaded_at >= ?
  `).get(req.user.user_id, since.toISOString())

  if (count.cnt >= DAILY_LIMIT) {
    return res.status(429).json({
      error: `Daily limit reached. Free accounts can verify ${DAILY_LIMIT} document per day. Upgrade to Pro for unlimited verifications.`,
      limit: DAILY_LIMIT,
      used: count.cnt,
      resetsAt: new Date(since.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }
  next()
}

// ── Auth middleware ───────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated.' })
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

// ── Multer config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const ALLOWED_TYPES = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt']

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_TYPES.includes(ext)) cb(null, true)
    else cb(new Error(`Unsupported file type. Allowed: ${ALLOWED_TYPES.join(', ')}`))
  },
})

// ── POST /api/documents/upload ────────────────────────────────────────────────
router.post('/upload', requireAuth, checkUploadLimit, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })

  const document_id = uuidv4()
  const { originalname, filename, mimetype, path: filePath } = req.file

  // Insert document as 'processing'
  db.prepare(`
    INSERT INTO documents (document_id, user_id, file_name, file_path, mime_type, upload_status)
    VALUES (?, ?, ?, ?, ?, 'processing')
  `).run(document_id, req.user.user_id, originalname, filePath, mimetype)

  // Return immediately with document_id so frontend can poll
  res.status(202).json({ document_id, message: 'Processing started.' })

  // Process async (don't await in request)
  processDocument(document_id, filePath, req.user.user_id).catch(err => {
    console.error('Processing error:', err)
    db.prepare(`UPDATE documents SET upload_status='error', processing_error=? WHERE document_id=?`)
      .run(err.message, document_id)
  })
})

async function processDocument(document_id, filePath, user_id) {
  try {
    // Hash the file
    const fileBuffer = fs.readFileSync(filePath)
    const file_hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    // Check if this exact file was already verified — reuse results
    const existing = db.prepare(`
      SELECT * FROM documents
      WHERE file_hash = ? AND upload_status = 'completed' AND document_id != ?
      ORDER BY processed_at DESC LIMIT 1
    `).get(file_hash, document_id)

    if (existing) {
      const score = existing.verification_score * 100
      const plagiarism = existing.plagiarism_score
      db.prepare(`
        UPDATE documents
        SET upload_status='completed', verification_score=?, plagiarism_score=?,
            file_hash=?, processed_at=CURRENT_TIMESTAMP, results=?
        WHERE document_id=?
      `).run(existing.verification_score, plagiarism, file_hash, existing.results, document_id)

      if (score >= 80 && plagiarism < 0.1) {
        const doc = db.prepare('SELECT file_name FROM documents WHERE document_id=?').get(document_id)
        const cert_id = 'VF-' + Date.now().toString(36).toUpperCase().slice(-4) + '-' + uuidv4().split('-')[0].toUpperCase()
        db.prepare(`INSERT OR IGNORE INTO certificates (cert_id, document_id, user_id, file_name, file_hash, score, plagiarism, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'auto_issued')`)
          .run(cert_id, document_id, user_id, doc.file_name, file_hash, Math.round(score), plagiarism)
        db.prepare(`UPDATE documents SET certificate_id=? WHERE document_id=?`).run(cert_id, document_id)
      }
      return
    }

    // Extract text
    const text = await extractText(filePath)
    if (!text || text.trim().length < 50) {
      db.prepare(`UPDATE documents SET upload_status='error', processing_error=? WHERE document_id=?`)
        .run('Could not extract enough text from the document. Please check the file.', document_id)
      return
    }

    // Run AI verification
    const result = await verifyDocument(text)
    const score = result.summary.overallScore
    const plagiarism = result.plagiarism.score

    // Save results
    db.prepare(`
      UPDATE documents
      SET upload_status='completed',
          verification_score=?,
          plagiarism_score=?,
          file_hash=?,
          processed_at=CURRENT_TIMESTAMP,
          results=?
      WHERE document_id=?
    `).run(score / 100, plagiarism, file_hash, JSON.stringify(result), document_id)

    // Delete file from disk — results are in DB, no need to keep the file
    try { fs.unlinkSync(filePath) } catch (e) { console.warn('Could not delete file:', e.message) }

    // Auto-issue certificate if score >= 80 AND plagiarism < 10%
    if (score >= 80 && plagiarism < 0.1) {
      const doc = db.prepare('SELECT file_name FROM documents WHERE document_id=?').get(document_id)
      const cert_id = 'VF-' + Date.now().toString(36).toUpperCase().slice(-4) + '-' + uuidv4().split('-')[0].toUpperCase()
      db.prepare(`
        INSERT OR IGNORE INTO certificates (cert_id, document_id, user_id, file_name, file_hash, score, plagiarism, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'auto_issued')
      `).run(cert_id, document_id, user_id, doc.file_name, file_hash, score, plagiarism)
      // Also update document with cert_id
      db.prepare(`UPDATE documents SET certificate_id=? WHERE document_id=?`).run(cert_id, document_id)
    }
  } catch (err) {
    console.error('processDocument error:', err)
    db.prepare(`UPDATE documents SET upload_status='error', processing_error=? WHERE document_id=?`)
      .run(err.message, document_id)
  }
}

// ── GET /api/documents/status/:id ─────────────────────────────────────────────
router.get('/status/:id', requireAuth, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE document_id=? AND user_id=?')
    .get(req.params.id, req.user.user_id)
  if (!doc) return res.status(404).json({ error: 'Document not found.' })

  const response = {
    document_id: doc.document_id,
    file_name: doc.file_name,
    upload_status: doc.upload_status,
    verification_score: doc.verification_score,
    plagiarism_score: doc.plagiarism_score,
    uploaded_at: doc.uploaded_at,
    processed_at: doc.processed_at,
    processing_error: doc.processing_error,
  }

  if (doc.upload_status === 'completed' && doc.results) {
    response.results = JSON.parse(doc.results)
  }

  res.json(response)
})

// ── GET /api/documents ────────────────────────────────────────────────────────
router.get('/', requireAuth, (req, res) => {
  const docs = db.prepare(`
    SELECT document_id, file_name, upload_status, verification_score, plagiarism_score, uploaded_at, processed_at
    FROM documents WHERE user_id=? ORDER BY uploaded_at DESC
  `).all(req.user.user_id)
  res.json({ documents: docs })
})

// ── GET /api/documents/:id ────────────────────────────────────────────────────
router.get('/:id', requireAuth, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE document_id=? AND user_id=?')
    .get(req.params.id, req.user.user_id)
  if (!doc) return res.status(404).json({ error: 'Document not found.' })
  if (doc.results) doc.results = JSON.parse(doc.results)
  res.json(doc)
})

export default router
