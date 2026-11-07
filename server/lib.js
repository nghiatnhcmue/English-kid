// Tiện ích dùng chung cho các API (Cloudflare Worker + D1).
// Bảo mật: mật khẩu/PIN băm PBKDF2-SHA256; phiên đăng nhập là token ngẫu nhiên, chỉ lưu bản băm SHA-256.

export const MAX_BODY = 64 * 1024; // 64KB mỗi request ghi thông thường
export const MAX_CONTENT_BODY = 900 * 1024; // nội dung giáo viên (dưới giới hạn 1MB/ô của D1)
const PBKDF2_ITERATIONS = 100000;
const TEACHER_TTL_MS = 7 * 24 * 3600 * 1000;
const STUDENT_TTL_MS = 180 * 24 * 3600 * 1000;

const baseHeaders = {
  'Content-Type': 'application/json;charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...baseHeaders, ...extra } });
}

export const fail = (status, error, extra = {}) => json({ success: false, error, ...extra }, status);

/** Lỗi có mã HTTP – ném ra trong handler, router sẽ trả về JSON gọn (không lộ chi tiết nội bộ). */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function readJson(request, limit = MAX_BODY) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > limit) throw new HttpError(413, 'Dữ liệu gửi lên quá lớn.');
  const text = await request.text();
  if (text.length > limit) throw new HttpError(413, 'Dữ liệu gửi lên quá lớn.');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Dữ liệu không hợp lệ.');
  }
}

export const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);

/** Chỉ chấp nhận request cùng nguồn (chống trang web lạ gửi lệnh ghi thay giáo viên). */
export function checkOrigin(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return;
  const origin = request.headers.get('origin');
  if (!origin) return; // app cài đặt / curl
  const host = new URL(request.url).host;
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, 'Không cho phép gửi từ trang khác.');
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(403, 'Không cho phép gửi từ trang khác.');
  }
}

// ---------- Mã hóa ----------
const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export function randomHex(bytes = 16) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return toHex(a);
}

export async function sha256(text) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

export async function hashSecret(secret, salt = randomHex(16), iterations = PBKDF2_ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', enc.encode(String(secret)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations }, key, 256);
  return { hash: toHex(bits), salt };
}

/** So sánh thời gian hằng (không lộ độ dài khớp qua thời gian phản hồi). */
export function safeEqual(a, b) {
  const x = String(a);
  const y = String(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return diff === 0;
}

export async function verifySecret(secret, hash, salt) {
  if (!hash || !salt) return false;
  const r = await hashSecret(secret, salt);
  return safeEqual(r.hash, hash);
}

// ---------- Schema ----------
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS test_results (id TEXT PRIMARY KEY, student_name TEXT NOT NULL, student_class TEXT NOT NULL,
    score REAL NOT NULL, stars INTEGER NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL, unit_ids TEXT NOT NULL,
    wrong_words TEXT, answers_json TEXT, created_at TEXT NOT NULL, student_id TEXT, kind TEXT DEFAULT 'test')`,
  `CREATE INDEX IF NOT EXISTS idx_student_class ON test_results(student_class)`,
  `CREATE INDEX IF NOT EXISTS idx_created_at ON test_results(created_at)`,
  `CREATE TABLE IF NOT EXISTS teachers (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT,
    pass_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, role TEXT NOT NULL, subject_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject_id)`,
  `CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
    class TEXT NOT NULL, avatar TEXT, pin_hash TEXT, salt TEXT, created_at TEXT NOT NULL, updated_at TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_students_class ON students(class)`,
  `CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, json TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL, student_id TEXT NOT NULL,
    student_name TEXT, student_class TEXT, score REAL, json TEXT, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL)`,
];

// Bảng cũ (trước đợt này) thiếu 2 cột: thêm nếu chưa có.
const ALTERS = [`ALTER TABLE test_results ADD COLUMN student_id TEXT`, `ALTER TABLE test_results ADD COLUMN kind TEXT DEFAULT 'test'`];

const schemaReady = new WeakMap();
/** Chạy schema một lần cho mỗi phiên Worker / mỗi cơ sở dữ liệu (thay cho CREATE TABLE ở mỗi request). */
export function ensureSchema(db) {
  if (!schemaReady.has(db)) {
    const p = (async () => {
      await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
      for (const sql of ALTERS) {
        try {
          await db.prepare(sql).run();
        } catch {
          /* cột đã có */
        }
      }
    })().catch((e) => {
      schemaReady.delete(db);
      throw e;
    });
    schemaReady.set(db, p);
  }
  return schemaReady.get(db);
}

export function requireDb(env) {
  if (!env.DB) throw new HttpError(503, 'Chưa liên kết cơ sở dữ liệu Cloudflare D1 (binding DB).');
  return env.DB;
}

// ---------- Phiên đăng nhập ----------
export async function createSession(db, role, subjectId) {
  const token = randomHex(32);
  const ttl = role === 'teacher' ? TEACHER_TTL_MS : STUDENT_TTL_MS;
  await db
    .prepare('INSERT INTO sessions (token_hash, role, subject_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(await sha256(token), role, subjectId, Date.now() + ttl, new Date().toISOString())
    .run();
  return token;
}

export function bearer(request) {
  const h = request.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+([a-f0-9]{64})$/i);
  return m ? m[1].toLowerCase() : null;
}

export async function getSession(db, request) {
  const token = bearer(request);
  if (!token) return null;
  const row = await db.prepare('SELECT * FROM sessions WHERE token_hash = ?').bind(await sha256(token)).first();
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(row.token_hash).run();
    return null;
  }
  return { role: row.role, subjectId: row.subject_id, tokenHash: row.token_hash };
}

export async function requireRole(db, request, role) {
  const s = await getSession(db, request);
  if (!s) throw new HttpError(401, 'Cần đăng nhập lại.');
  if (role && s.role !== role) throw new HttpError(403, 'Không có quyền thực hiện thao tác này.');
  return s;
}

// ---------- Giới hạn số lần thử đăng nhập ----------
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(db, key) {
  const row = await db.prepare('SELECT count, window_start FROM login_attempts WHERE key = ?').bind(key).first();
  if (row && Date.now() - row.window_start < WINDOW_MS && row.count >= MAX_ATTEMPTS) {
    const wait = Math.ceil((WINDOW_MS - (Date.now() - row.window_start)) / 60000);
    throw new HttpError(429, `Nhập sai quá nhiều lần. Thử lại sau ${wait} phút.`);
  }
}

export async function recordFailure(db, key) {
  const now = Date.now();
  const row = await db.prepare('SELECT count, window_start FROM login_attempts WHERE key = ?').bind(key).first();
  if (!row || now - row.window_start >= WINDOW_MS) {
    await db.prepare('INSERT OR REPLACE INTO login_attempts (key, count, window_start) VALUES (?, 1, ?)').bind(key, now).run();
  } else {
    await db.prepare('UPDATE login_attempts SET count = count + 1 WHERE key = ?').bind(key).run();
  }
}

export const clearFailures = (db, key) => db.prepare('DELETE FROM login_attempts WHERE key = ?').bind(key).run();

export const clientIp = (request) => request.headers.get('cf-connecting-ip') || 'local';
