import 'dotenv/config';
import app from './index.js';
import { initDb } from './db.js';

// ── Startup validation ────────────────────────────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'OPENAI_API_KEY', 'RESEND_API_KEY', 'TURSO_DATABASE_URL'];
const missing = REQUIRED_ENV.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`[startup] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET === 'changeme_secret') {
  console.error('[startup] JWT_SECRET is set to the insecure default. Set a real secret in .env');
  process.exit(1);
}

// ── DB schema init ────────────────────────────────────────────────────────────
await initDb();
console.log('[db] Schema ready');

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '3001', 10);

const server = app.listen(PORT, () => {
  console.log(
    `[server] Verifact API running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`
  );
});

server.on('error', (err) => {
  console.error('[server] Fatal error:', err);
  process.exit(1);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('[server] All connections closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[server] Forced exit after 10 s timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
});
