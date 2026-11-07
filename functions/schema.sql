-- Schema D1 cho English-Kid (tạo bảng nếu chưa có; chạy lại an toàn).
-- Chạy trên máy chủ: npx wrangler d1 execute english-kid-db --remote --file=functions/schema.sql
-- Worker cũng tự tạo các bảng này ở request đầu tiên.
-- Nếu bảng test_results đã có từ trước, chạy thêm 2 lệnh cuối (lỗi "duplicate column" thì bỏ qua).

CREATE TABLE IF NOT EXISTS test_results (id TEXT PRIMARY KEY, student_name TEXT NOT NULL, student_class TEXT NOT NULL, score REAL NOT NULL, stars INTEGER NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL, unit_ids TEXT NOT NULL, wrong_words TEXT, answers_json TEXT, created_at TEXT NOT NULL, student_id TEXT, kind TEXT DEFAULT 'test');
CREATE INDEX IF NOT EXISTS idx_student_class ON test_results(student_class);
CREATE INDEX IF NOT EXISTS idx_created_at ON test_results(created_at);
CREATE TABLE IF NOT EXISTS teachers (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT, pass_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, role TEXT NOT NULL, subject_id TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject_id);
CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL, class TEXT NOT NULL, avatar TEXT, pin_hash TEXT, salt TEXT, created_at TEXT NOT NULL, updated_at TEXT);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, json TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL, student_id TEXT NOT NULL, student_name TEXT, student_class TEXT, score REAL, json TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL);

-- ALTER TABLE test_results ADD COLUMN student_id TEXT;
-- ALTER TABLE test_results ADD COLUMN kind TEXT DEFAULT 'test';
