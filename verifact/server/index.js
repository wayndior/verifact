import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import documentsRouter from './routes/documents.js';
import certificatesRouter from './routes/certificates.js';
import passwordRouter from './routes/password.js';
import classesRouter from './routes/classes.js';
import adminRouter from './routes/admin.js';

const app = express();

// Nginx sits in front — trust its forwarded headers for accurate rate limiting
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────────
// Build CSP directives dynamically so `upgrade-insecure-requests` can be
// omitted entirely in dev — helmet rejects `false` as a directive value.
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  // React renders inline styles; keep 'unsafe-inline' only for style-src
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'blob:'],
  connectSrc: ["'self'"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],
};
if (process.env.NODE_ENV === 'production') {
  cspDirectives.upgradeInsecureRequests = [];
}

app.use(
  helmet({
    contentSecurityPolicy: { directives: cspDirectives },
    // Keep COEP off — QR code data-URLs and cross-origin assets need it disabled
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// Set CORS_ORIGIN in .env to your domain (e.g. https://verifact.work)
// Multiple origins: comma-separated list
// CORS_ORIGIN takes priority; falls back to BASE_URL for single-domain deployments
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : process.env.BASE_URL
    ? [process.env.BASE_URL]
    : [];

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
  })
);

// ── Request logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General: 100 req / 15 min per IP (halved from 200 — still generous for legit use)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Auth + password: 20 req / 15 min — prevents brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});

app.use(generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/password', authLimiter, passwordRouter);
app.use('/api/classes', generalLimiter, classesRouter);
app.use('/api/admin', generalLimiter, adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handler ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use(async (err, _req, res, _next) => {
  console.error('[error]', err);

  if (process.env.SENTRY_BACKEND_DSN) {
    try {
      const Sentry = await import('@sentry/node');
      Sentry.captureException(err);
    } catch {
      // Sentry unavailable — continue
    }
  }

  const status = err.status ?? err.statusCode ?? 500;
  // Never leak internal details in production
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : (err.message ?? 'Internal server error');

  res.status(status).json({ error: message });
});

export default app;
