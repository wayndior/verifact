import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import db from '../db.js'
import { sendPasswordReset } from '../email.js'

const router = Router()

// ── POST /api/password/forgot ─────────────────────────────────────────────────
router.post('/forgot', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  // Always return 200 so we don't reveal whether an email exists
  const user = db.prepare('SELECT user_id, full_name FROM users WHERE email = ?').get(email.toLowerCase().trim())
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })

  // Invalidate any existing tokens for this user
  db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.user_id)

  // Generate secure token — expires in 1 hour
  const token = crypto.randomBytes(32).toString('hex')
  const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  db.prepare('INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, user.user_id, expires_at)

  try {
    await sendPasswordReset(email.toLowerCase().trim(), user.full_name || 'there', token)
  } catch (err) {
    console.error('Failed to send reset email:', err.message)
    // Don't expose the error to the client
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' })
})

// ── GET /api/password/validate/:token ─────────────────────────────────────────
router.get('/validate/:token', (req, res) => {
  const row = db.prepare(`
    SELECT t.*, u.email FROM password_reset_tokens t
    JOIN users u ON t.user_id = u.user_id
    WHERE t.token = ? AND t.used = 0 AND t.expires_at > ?
  `).get(req.params.token, new Date().toISOString())

  if (!row) return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
  res.json({ valid: true, email: row.email })
})

// ── POST /api/password/reset ──────────────────────────────────────────────────
router.post('/reset', async (req, res) => {
  const { token, password } = req.body

  if (!token || !password) return res.status(400).json({ error: 'Token and password are required.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  const row = db.prepare(`
    SELECT * FROM password_reset_tokens
    WHERE token = ? AND used = 0 AND expires_at > ?
  `).get(token, new Date().toISOString())

  if (!row) return res.status(400).json({ error: 'This reset link is invalid or has expired.' })

  const password_hash = await bcrypt.hash(password, 12)

  db.prepare('UPDATE users SET password_hash = ? WHERE user_id = ?').run(password_hash, row.user_id)
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token)

  res.json({ message: 'Password updated successfully.' })
})

export default router
