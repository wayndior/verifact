// Replaces better-sqlite3 (synchronous, file-based) with @libsql/client (async, Turso-hosted).
//
// Usage in routes stays the same shape — just add `await`:
//   before:  db.prepare('SELECT …').get(x)        →  await query.get('SELECT …', [x])
//   before:  db.prepare('SELECT …').all(x)        →  await query.all('SELECT …', [x])
//   before:  db.prepare('INSERT …').run(a, b)     →  await query.run('INSERT …', [a, b])

import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not set');
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not set');
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ── Thin query helpers ────────────────────────────────────────────────────────

// Convert a libsql Row object into a plain JS object.
// Uses index-based access (row[i]) which is reliable across all libsql versions.
function toPlain(row, columns) {
  if (!row) return null;
  const obj = {};
  columns.forEach((col, i) => {
    const name = typeof col === 'string' ? col : col.name;
    obj[name] = row[i];
  });
  return obj;
}

export const query = {
  /** Returns the first row as a plain object, or null. */
  async get(sql, args = []) {
    const result = await db.execute({ sql, args });
    if (!result.rows[0]) return null;
    return toPlain(result.rows[0], result.columns);
  },
  /** Returns all rows as plain objects. */
  async all(sql, args = []) {
    const result = await db.execute({ sql, args });
    return result.rows.map(row => toPlain(row, result.columns));
  },
  /** Executes an INSERT / UPDATE / DELETE. */
  async run(sql, args = []) {
    return db.execute({ sql, args });
  },
};

// ── Schema init (idempotent — safe to call on every cold start) ───────────────

export async function initDb() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      user_id      TEXT PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name    TEXT NOT NULL,
      date_of_birth TEXT,
      country      TEXT,
      role         TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','educator')),
      institution  TEXT,
      school_id    TEXT,
      address      TEXT,
      email_verified INTEGER NOT NULL DEFAULT 0,
      is_admin     INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_verification_tokens (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS documents (
      document_id        TEXT PRIMARY KEY,
      user_id            TEXT NOT NULL,
      file_name          TEXT NOT NULL,
      mime_type          TEXT,
      upload_status      TEXT NOT NULL DEFAULT 'pending',
      verification_score REAL,
      plagiarism_score   REAL,
      certificate_id     TEXT,
      uploaded_at        TEXT NOT NULL DEFAULT (datetime('now')),
      processed_at       TEXT,
      results            TEXT,
      processing_error   TEXT,
      file_hash          TEXT,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS certificates (
      cert_id     TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id     TEXT NOT NULL,
      file_name   TEXT NOT NULL,
      file_hash   TEXT,
      score       REAL,
      plagiarism  REAL,
      status      TEXT NOT NULL DEFAULT 'auto_issued',
      issued_at   TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id)     REFERENCES users(user_id)         ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS classes (
      class_id    TEXT PRIMARY KEY,
      educator_id TEXT NOT NULL,
      name        TEXT NOT NULL,
      join_code   TEXT UNIQUE NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (educator_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS class_members (
      class_id   TEXT NOT NULL,
      student_id TEXT NOT NULL,
      joined_at  TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (class_id, student_id),
      FOREIGN KEY (class_id)   REFERENCES classes(class_id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(user_id)    ON DELETE CASCADE
    )`,
    // Indexes — also idempotent
    `CREATE INDEX IF NOT EXISTS idx_documents_user_id     ON documents(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_certificates_user_id  ON certificates(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_password_tokens_token ON password_reset_tokens(token)`,
    `CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id)`,
  ];

  for (const sql of statements) {
    await db.execute(sql);
  }

  // ── Additive migrations for databases created before a column existed ──────
  // ALTER TABLE ADD COLUMN is idempotent-by-catch: if the column already
  // exists the statement errors, which we swallow. Never remove or reorder
  // these — they document the schema's history.
  const migrations = [
    `ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0`,
  ];
  for (const sql of migrations) {
    try {
      await db.execute(sql);
    } catch (err) {
      // "duplicate column name" is expected once the migration has run;
      // anything else should surface.
      if (!/duplicate column/i.test(err?.message ?? '')) throw err;
    }
  }
}

export default db;
