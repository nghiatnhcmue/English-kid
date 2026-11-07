// /api/auth/* – đăng nhập giáo viên và học sinh (kiểm tra trên máy chủ).
import {
  HttpError,
  json,
  readJson,
  str,
  hashSecret,
  verifySecret,
  safeEqual,
  createSession,
  getSession,
  requireRole,
  checkRateLimit,
  recordFailure,
  clearFailures,
  clientIp,
  randomHex,
} from './lib.js';

const WRONG = 'Tên đăng nhập hoặc mật khẩu chưa đúng.';

async function teacherCount(db) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM teachers').first();
  return Number(r?.n || 0);
}

function validPassword(pw) {
  if (String(pw).length < 8) throw new HttpError(400, 'Mật khẩu cần ít nhất 8 ký tự.');
}

export async function handleAuth(path, request, env, db) {
  const method = request.method;

  // Trạng thái: đã có tài khoản giáo viên chưa (để hiện màn "Tạo tài khoản lần đầu")
  if (path === '/api/auth/status' && method === 'GET') {
    return json({ success: true, needsSetup: (await teacherCount(db)) === 0, setupEnabled: !!env.ADMIN_SETUP_CODE });
  }

  // Tạo tài khoản giáo viên ĐẦU TIÊN – chỉ khi chưa có ai, và phải có mã cài đặt (Worker secret)
  if (path === '/api/auth/teacher/setup' && method === 'POST') {
    const body = await readJson(request);
    const key = `setup:${clientIp(request)}`;
    await checkRateLimit(db, key);
    if (!env.ADMIN_SETUP_CODE) throw new HttpError(503, 'Máy chủ chưa đặt ADMIN_SETUP_CODE.');
    if ((await teacherCount(db)) > 0) throw new HttpError(409, 'Đã có tài khoản giáo viên. Hãy đăng nhập.');
    if (!safeEqual(str(body.setupCode, 200), env.ADMIN_SETUP_CODE)) {
      await recordFailure(db, key);
      throw new HttpError(403, 'Mã cài đặt chưa đúng.');
    }
    const username = str(body.username, 40).toLowerCase();
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) throw new HttpError(400, 'Tên đăng nhập 3–40 ký tự: chữ, số, dấu . _ -');
    validPassword(body.password);
    const { hash, salt } = await hashSecret(body.password);
    const id = `t_${randomHex(8)}`;
    await db
      .prepare('INSERT INTO teachers (id, username, display_name, pass_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, username, str(body.displayName, 80) || username, hash, salt, new Date().toISOString())
      .run();
    await clearFailures(db, key);
    const token = await createSession(db, 'teacher', id);
    return json({ success: true, token, teacher: { id, username, displayName: str(body.displayName, 80) || username } });
  }

  if (path === '/api/auth/teacher/login' && method === 'POST') {
    const body = await readJson(request);
    const username = str(body.username, 40).toLowerCase();
    const key = `t:${username}:${clientIp(request)}`;
    await checkRateLimit(db, key);
    const row = await db.prepare('SELECT * FROM teachers WHERE username = ?').bind(username).first();
    const ok = row ? await verifySecret(String(body.password || ''), row.pass_hash, row.salt) : false;
    if (!ok) {
      await recordFailure(db, key);
      throw new HttpError(401, WRONG);
    }
    await clearFailures(db, key);
    const token = await createSession(db, 'teacher', row.id);
    return json({ success: true, token, teacher: { id: row.id, username: row.username, displayName: row.display_name } });
  }

  if (path === '/api/auth/teacher/password' && method === 'POST') {
    const s = await requireRole(db, request, 'teacher');
    const body = await readJson(request);
    const row = await db.prepare('SELECT * FROM teachers WHERE id = ?').bind(s.subjectId).first();
    if (!row || !(await verifySecret(String(body.oldPassword || ''), row.pass_hash, row.salt))) {
      throw new HttpError(401, 'Mật khẩu hiện tại chưa đúng.');
    }
    validPassword(body.newPassword);
    const { hash, salt } = await hashSecret(body.newPassword);
    await db.batch([
      db.prepare('UPDATE teachers SET pass_hash = ?, salt = ? WHERE id = ?').bind(hash, salt, row.id),
      // Đổi mật khẩu thì đăng xuất mọi máy khác
      db.prepare('DELETE FROM sessions WHERE subject_id = ? AND token_hash != ?').bind(row.id, s.tokenHash),
    ]);
    return json({ success: true });
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const s = await getSession(db, request);
    if (s) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(s.tokenHash).run();
    return json({ success: true });
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const s = await getSession(db, request);
    if (!s) return json({ success: true, role: null });
    if (s.role === 'teacher') {
      const t = await db.prepare('SELECT id, username, display_name FROM teachers WHERE id = ?').bind(s.subjectId).first();
      return json({ success: true, role: t ? 'teacher' : null, teacher: t && { id: t.id, username: t.username, displayName: t.display_name } });
    }
    const st = await db.prepare('SELECT id, username, display_name, class, avatar FROM students WHERE id = ?').bind(s.subjectId).first();
    return json({ success: true, role: st ? 'student' : null, student: st && studentPublic(st) });
  }

  // Học sinh đăng nhập bằng mã PIN do thầy cô cấp
  if (path === '/api/auth/student/login' && method === 'POST') {
    const body = await readJson(request);
    const ident = str(body.id || body.username, 80);
    const key = `s:${ident}:${clientIp(request)}`;
    await checkRateLimit(db, key);
    const row = await db.prepare('SELECT * FROM students WHERE id = ? OR username = ?').bind(ident, ident.toLowerCase()).first();
    const ok = row?.pin_hash ? await verifySecret(String(body.pin || ''), row.pin_hash, row.salt) : false;
    if (!ok) {
      await recordFailure(db, key);
      throw new HttpError(401, row && !row.pin_hash ? 'Em chưa có mã PIN, hãy hỏi thầy cô.' : 'Mã PIN chưa đúng, em thử lại nhé.');
    }
    await clearFailures(db, key);
    const token = await createSession(db, 'student', row.id);
    return json({ success: true, token, student: studentPublic(row) });
  }

  return null;
}

export const studentPublic = (r) => ({ id: r.id, username: r.username, name: r.display_name, class: r.class, avatar: r.avatar || '🙂' });
