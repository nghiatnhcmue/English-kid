// /api/students, /api/content, /api/submissions, /api/scores
import { HttpError, json, readJson, str, hashSecret, requireRole, randomHex, MAX_CONTENT_BODY } from './lib.js';
import { studentPublic } from './auth.js';

const CONTENT_KEYS = new Set(['custom_units', 'created_units', 'assignments']);
const parse = (s, d) => {
  try {
    return JSON.parse(s);
  } catch {
    return d;
  }
};

// ================= HỌC SINH =================
async function handleStudents(path, request, db, url) {
  // Danh sách công khai để học sinh chọn tên khi đăng nhập (KHÔNG có PIN)
  if (path === '/api/students/public' && request.method === 'GET') {
    const cls = str(url.searchParams.get('class'), 20);
    const q = cls
      ? db.prepare('SELECT id, username, display_name, class, avatar FROM students WHERE class = ? ORDER BY display_name').bind(cls)
      : db.prepare('SELECT id, username, display_name, class, avatar FROM students ORDER BY class, display_name');
    const { results } = await q.all();
    return json({ success: true, data: (results || []).map(studentPublic) });
  }

  if (path !== '/api/students') return null;
  await requireRole(db, request, 'teacher');

  if (request.method === 'GET') {
    const { results } = await db.prepare('SELECT * FROM students ORDER BY class, display_name').all();
    return json({ success: true, data: (results || []).map((r) => ({ ...studentPublic(r), hasPin: !!r.pin_hash })) });
  }

  // Ghi hàng loạt: { upsert: [{id, username, name, class, avatar, pin?}], remove: [id] }
  if (request.method === 'PUT') {
    const body = await readJson(request, 256 * 1024);
    const upsert = Array.isArray(body.upsert) ? body.upsert.slice(0, 1000) : [];
    const remove = Array.isArray(body.remove) ? body.remove.slice(0, 1000).map((x) => str(x, 60)) : [];
    const now = new Date().toISOString();
    const conflicts = [];
    const stmts = [];
    for (const s of upsert) {
      const id = str(s.id, 60) || `stu_${randomHex(6)}`;
      const username = str(s.username, 60).toLowerCase();
      const name = str(s.name, 80);
      const cls = str(s.class, 20);
      if (!username || !name || !cls) throw new HttpError(400, `Thiếu tên đăng nhập / họ tên / lớp (${name || username || id}).`);
      const clash = await db.prepare('SELECT id FROM students WHERE username = ? AND id != ?').bind(username, id).first();
      if (clash) {
        conflicts.push(username);
        continue;
      }
      const pin = s.pin != null && String(s.pin).trim() !== '' ? String(s.pin).trim() : null;
      if (pin && !/^\d{4,8}$/.test(pin)) throw new HttpError(400, `Mã PIN của ${name} phải là 4–8 chữ số.`);
      const hashed = pin ? await hashSecret(pin) : null;
      stmts.push(
        db
          .prepare(
            `INSERT INTO students (id, username, display_name, class, avatar, pin_hash, salt, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)
             ON CONFLICT(id) DO UPDATE SET username = ?2, display_name = ?3, class = ?4, avatar = ?5,
               pin_hash = COALESCE(?6, pin_hash), salt = COALESCE(?7, salt), updated_at = ?8`,
          )
          .bind(id, username, name, cls, str(s.avatar, 8) || '🙂', hashed?.hash ?? null, hashed?.salt ?? null, now),
      );
    }
    for (const id of remove) {
      stmts.push(db.prepare('DELETE FROM students WHERE id = ?').bind(id));
      stmts.push(db.prepare("DELETE FROM sessions WHERE role = 'student' AND subject_id = ?").bind(id));
    }
    if (stmts.length) await db.batch(stmts);
    return json({ success: conflicts.length === 0, conflicts, error: conflicts.length ? `Tên đăng nhập bị trùng: ${conflicts.join(', ')}` : undefined });
  }
  return null;
}

// ================= NỘI DUNG GIÁO VIÊN SOẠN =================
async function handleContent(path, request, db) {
  if (path === '/api/content' && request.method === 'GET') {
    const { results } = await db.prepare('SELECT key, json, version, updated_at FROM content').all();
    const data = {};
    const versions = {};
    for (const r of results || []) {
      data[r.key] = parse(r.json, null);
      versions[r.key] = r.version;
    }
    const etag = `"${Object.entries(versions).sort().map(([k, v]) => `${k}${v}`).join('.') || 'empty'}"`;
    if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: { ETag: etag } });
    return json({ success: true, data, versions }, 200, { ETag: etag });
  }

  const m = path.match(/^\/api\/content\/([a-z_]+)$/);
  if (!m || request.method !== 'PUT') return null;
  const key = m[1];
  if (!CONTENT_KEYS.has(key)) throw new HttpError(404, 'Không có mục nội dung này.');
  await requireRole(db, request, 'teacher');
  const body = await readJson(request, MAX_CONTENT_BODY);
  if (body.json === undefined) throw new HttpError(400, 'Thiếu dữ liệu.');
  const cur = await db.prepare('SELECT version FROM content WHERE key = ?').bind(key).first();
  const curVersion = Number(cur?.version || 0);
  if (body.baseVersion != null && Number(body.baseVersion) !== curVersion) {
    throw new HttpError(409, 'Dữ liệu trên máy chủ vừa được sửa ở máy khác. Hãy tải lại rồi sửa tiếp.');
  }
  const text = JSON.stringify(body.json);
  if (text.length > MAX_CONTENT_BODY) throw new HttpError(413, 'Nội dung quá lớn (ảnh/âm thanh nên nhỏ hơn).');
  const next = curVersion + 1;
  await db
    .prepare('INSERT INTO content (key, json, version, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET json = excluded.json, version = excluded.version, updated_at = excluded.updated_at')
    .bind(key, text, next, new Date().toISOString())
    .run();
  return json({ success: true, version: next });
}

// ================= BÀI NỘP =================
async function handleSubmissions(path, request, db, url) {
  if (path !== '/api/submissions') return null;
  if (request.method === 'POST') {
    const s = await requireRole(db, request, 'student');
    const st = await db.prepare('SELECT * FROM students WHERE id = ?').bind(s.subjectId).first();
    if (!st) throw new HttpError(401, 'Tài khoản học sinh không còn.');
    const body = await readJson(request);
    const id = `sub_${randomHex(8)}`;
    const score = Math.max(0, Math.min(10, Number(body.score) || 0));
    await db
      .prepare('INSERT INTO submissions (id, assignment_id, student_id, student_name, student_class, score, json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, str(body.assignmentId, 80), st.id, st.display_name, st.class, score, JSON.stringify(body.detail ?? null).slice(0, 60000), new Date().toISOString())
      .run();
    return json({ success: true, id });
  }
  if (request.method === 'GET') {
    await requireRole(db, request, 'teacher');
    const aid = str(url.searchParams.get('assignmentId'), 80);
    const q = aid
      ? db.prepare('SELECT * FROM submissions WHERE assignment_id = ? ORDER BY created_at DESC LIMIT 1000').bind(aid)
      : db.prepare('SELECT * FROM submissions ORDER BY created_at DESC LIMIT 1000');
    const { results } = await q.all();
    return json({
      success: true,
      data: (results || []).map((r) => ({
        id: r.id,
        assignmentId: r.assignment_id,
        studentId: r.student_id,
        studentName: r.student_name,
        studentClass: r.student_class,
        score: r.score,
        detail: parse(r.json, null),
        submittedAt: r.created_at,
      })),
    });
  }
  return null;
}

// ================= ĐIỂM TEST =================
async function handleScores(path, request, db, url) {
  if (path !== '/api/scores') return null;

  if (request.method === 'GET') {
    await requireRole(db, request, 'teacher');
    const cls = str(url.searchParams.get('class'), 20);
    // kind=all: cả tiến độ từng trạm (cho bảng Tiến độ cả lớp). Mặc định chỉ bài test.
    // Bản ghi "stn_…" cũ (trước khi có cột kind) cũng là tiến độ trạm, không phải bài test.
    const onlyTests = url.searchParams.get('kind') !== 'all';
    const where = [];
    const params = [];
    if (cls && cls !== 'all') {
      where.push('student_class = ?');
      params.push(cls);
    }
    if (onlyTests) where.push("COALESCE(kind,'test') = 'test' AND substr(id, 1, 4) != 'stn_'");
    const sql = `SELECT * FROM test_results ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT ${onlyTests ? 1000 : 3000}`;
    const { results } = await db.prepare(sql).bind(...params).all();
    return json({
      success: true,
      hasD1: true,
      data: (results || []).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        studentName: row.student_name,
        studentClass: row.student_class,
        score: row.score,
        stars: row.stars,
        correct: row.correct,
        total: row.total,
        unitIds: parse(row.unit_ids, []),
        wrongWords: parse(row.wrong_words, []),
        answers: parse(row.answers_json, []),
        createdAt: row.created_at,
        kind: row.kind === 'station' || String(row.id).startsWith('stn_') ? 'station' : 'test',
      })),
    });
  }

  if (request.method === 'POST') {
    // Chỉ học sinh đã đăng nhập mới gửi điểm; tên/lớp lấy từ tài khoản trên máy chủ (không tin dữ liệu gửi lên)
    const s = await requireRole(db, request, 'student');
    const st = await db.prepare('SELECT * FROM students WHERE id = ?').bind(s.subjectId).first();
    if (!st) throw new HttpError(401, 'Tài khoản học sinh không còn.');
    const b = await readJson(request);
    const total = Math.max(0, Math.min(200, Math.floor(Number(b.total) || 0)));
    const correct = Math.max(0, Math.min(total, Math.floor(Number(b.correct) || 0)));
    const score = Math.max(0, Math.min(10, Number(b.score) || 0));
    const stars = Math.max(0, Math.min(3, Math.floor(Number(b.stars) || 0)));
    const unitIds = (Array.isArray(b.unitIds) ? b.unitIds : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 20);
    const wrong = (Array.isArray(b.wrongWords) ? b.wrongWords : []).map((w) => str(w, 60)).slice(0, 100);
    const answers = JSON.stringify(Array.isArray(b.answers) ? b.answers.slice(0, 200) : []).slice(0, 50000);
    const kind = b.kind === 'station' ? 'station' : 'test';
    const id = `res_${randomHex(8)}`;
    await db
      .prepare(
        'INSERT INTO test_results (id, student_name, student_class, score, stars, correct, total, unit_ids, wrong_words, answers_json, created_at, student_id, kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(id, st.display_name, st.class, score, stars, correct, total, JSON.stringify(unitIds), JSON.stringify(wrong), answers, new Date().toISOString(), st.id, kind)
      .run();
    return json({ success: true, id });
  }

  if (request.method === 'DELETE') {
    await requireRole(db, request, 'teacher');
    const id = str(url.searchParams.get('id'), 80);
    const cls = str(url.searchParams.get('class'), 20);
    if (id) {
      await db.prepare('DELETE FROM test_results WHERE id = ?').bind(id).run();
    } else if (cls && url.searchParams.get('confirm') === 'yes') {
      // Chỉ xóa theo lớp đang chọn – không còn lệnh xóa toàn bộ cơ sở dữ liệu
      await db.prepare('DELETE FROM test_results WHERE student_class = ?').bind(cls).run();
    } else {
      throw new HttpError(400, 'Cần chọn bản ghi hoặc lớp cần xóa.');
    }
    return json({ success: true });
  }
  return null;
}

export async function handleData(path, request, env, db) {
  const url = new URL(request.url);
  return (
    (await handleStudents(path, request, db, url)) ||
    (await handleContent(path, request, db)) ||
    (await handleSubmissions(path, request, db, url)) ||
    (await handleScores(path, request, db, url))
  );
}
