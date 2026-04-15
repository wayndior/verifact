import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'
import { sendWelcome } from '../email.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret'
const TOKEN_EXPIRY = '7d'

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      date_of_birth,
      email,
      password,
      country,
      role,
      institution,
      school_id,
      address,
    } = req.body

    // Validate required fields
    if (!full_name || !email || !password || !country || !role) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }
    if (!['student', 'educator'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or educator.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    // Check email already exists
    const existing = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email.toLowerCase().trim())
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user_id = uuidv4()

    db.prepare(`
      INSERT INTO users (user_id, email, password_hash, full_name, date_of_birth, country, role, institution, school_id, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user_id,
      email.toLowerCase().trim(),
      password_hash,
      full_name.trim(),
      date_of_birth || null,
      country.trim(),
      role,
      institution || null,
      school_id || null,
      address || null,
    )

    const token = jwt.sign({ user_id, email, role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })

    // Send welcome email (non-blocking)
    sendWelcome(email.toLowerCase().trim(), full_name.trim()).catch(e => console.error('Welcome email failed:', e.message))

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { user_id, email, full_name: full_name.trim(), role, country },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim())
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })

    res.json({
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        country: user.country,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// ── Me (get current user) ─────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated.' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT user_id, email, full_name, role, country, institution, date_of_birth, address FROM users WHERE user_id = ?').get(decoded.user_id)
    if (!user) return res.status(404).json({ error: 'User not found.' })
    res.json({ user })
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
})

export default router
