// Vercel serverless entry point — wraps the Express app.
// Every cold start initialises the DB schema (idempotent CREATE IF NOT EXISTS).

import { initDb } from '../server/db.js';
import app from '../server/index.js';

// Module-level promise: runs once per Lambda instance, not once per request.
const ready = initDb().catch((err) => {
  console.error('[db] Schema init failed:', err);
});

export default async function handler(req, res) {
  await ready;
  return app(req, res);
}
