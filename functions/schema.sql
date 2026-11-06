-- =======================================================
-- Cloudflare D1 Database Schema for English-Kid
-- =======================================================
-- Cách dùng:
-- 1. Vào Cloudflare Dashboard -> Storage & Databases -> D1 SQL Database -> english-kid-db
-- 2. Chọn tab "Console"
-- 3. Dán toàn bộ lệnh SQL bên dưới vào và bấm "Execute"
-- =======================================================

CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  score REAL NOT NULL,
  stars INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  unit_ids TEXT NOT NULL,
  wrong_words TEXT,
  answers_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_student_class ON test_results(student_class);
CREATE INDEX IF NOT EXISTS idx_created_at ON test_results(created_at);

