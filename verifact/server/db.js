import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const dbPath = path.resolve(__dirname, 'verifact.db')

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token       TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    used        INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS certificates (
    cert_id       TEXT PRIMARY KEY,
    document_id   TEXT NOT NULL UNIQUE,
    user_id       TEXT NOT NULL,
    file_name     TEXT NOT NULL,
    file_hash     TEXT NOT NULL,
    score         INTEGER NOT NULL,
    plagiarism    REAL NOT NULL,
    status        TEXT DEFAULT 'auto_issued',
    issued_at     TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    user_id       TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     TEXT,
    date_of_birth TEXT,
    country       TEXT,
    role          TEXT NOT NULL CHECK(role IN ('student', 'educator')),
    institution   TEXT,
    school_id     TEXT,
    address       TEXT,
    email_verified INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    document_id        TEXT PRIMARY KEY,
    user_id            TEXT NOT NULL,
    file_name          TEXT NOT NULL,
    file_path          TEXT NOT NULL,
    mime_type          TEXT,
    upload_status      TEXT DEFAULT 'pending',
    verification_score REAL,
    plagiarism_score   REAL,
    certificate_id     TEXT,
    uploaded_at        TEXT DEFAULT CURRENT_TIMESTAMP,
    processed_at       TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS classes (
    class_id     TEXT PRIMARY KEY,
    educator_id  TEXT NOT NULL,
    class_name   TEXT NOT NULL,
    join_code    TEXT UNIQUE,
    created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (educator_id) REFERENCES users(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS class_members (
    membership_id TEXT PRIMARY KEY,
    class_id      TEXT NOT NULL,
    student_id    TEXT NOT NULL,
    joined_at     TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(class_id, student_id)
  );
`)

// Run migrations to add any missing columns to existing DBs
const runMigrations = () => {
  const userCols = db.pragma('table_info(users)').map(c => c.name)
  if (!userCols.includes('date_of_birth')) db.exec(`ALTER TABLE users ADD COLUMN date_of_birth TEXT`)
  if (!userCols.includes('institution'))   db.exec(`ALTER TABLE users ADD COLUMN institution TEXT`)
  if (!userCols.includes('address'))       db.exec(`ALTER TABLE users ADD COLUMN address TEXT`)

  const docCols = db.pragma('table_info(documents)').map(c => c.name)
  if (!docCols.includes('results'))          db.exec(`ALTER TABLE documents ADD COLUMN results TEXT`)
  if (!docCols.includes('processing_error')) db.exec(`ALTER TABLE documents ADD COLUMN processing_error TEXT`)
  if (!docCols.includes('file_hash'))        db.exec(`ALTER TABLE documents ADD COLUMN file_hash TEXT`)
}
runMigrations()

export default db
