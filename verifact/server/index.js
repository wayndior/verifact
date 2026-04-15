import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'

// Load environment variables specifically for Sentry initialization if needed here
// In this minimal setup, we assume start.js has loaded them.
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
// Using config here again to ensure .env is loaded if somehow missed by start.js
config({ path: envPath })

const app = express()
app.set('trust proxy', 1) // Trust proxy for rate limiting

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
})
app.use(generalLimiter)

// Body Parsing
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// --- Auth Routes ---
import authRouter from './routes/auth.js'
app.use('/api/auth', authRouter)

// --- Document Routes ---
import documentsRouter from './routes/documents.js'
app.use('/api/documents', documentsRouter)

// --- Certificate Routes ---
import certificatesRouter from './routes/certificates.js'
app.use('/api/certificates', certificatesRouter)

// --- Password Reset Routes ---
import passwordRouter from './routes/password.js'
app.use('/api/password', passwordRouter)

// --- Error Handling Middleware ---
// This should be the last middleware.
app.use((err, req, res, next) => {
  console.error('Unhandled error stack:', err.stack)

  // Attempt to capture error with Sentry if DSN is configured
  // Dynamically import Sentry to avoid errors if not fully set up
  if (process.env.SENTRY_BACKEND_DSN) {
    import('@sentry/node').then(({ captureException }) => {
      try {
        // Use Sentry.captureException if available
        if (typeof captureException === 'function') {
          captureException(err)
        } else {
          console.warn("Sentry captureException function not found. Cannot log to Sentry.")
        }
      } catch (e) {
        console.error('Error during Sentry capture:', e)
      }
    }).catch(e => console.error('Failed to import Sentry:', e))
  }

  if (res.headersSent) {
    return next(err) // If headers are already sent, pass error to default Express handler
  }

  const statusCode = err.status || 500
  const errorMessage = err.message || 'An unexpected server error occurred.'
  res.status(statusCode).json({ error: errorMessage })
})

export default app
