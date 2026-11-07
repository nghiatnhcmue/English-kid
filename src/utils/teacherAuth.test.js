// Kiểm tra quyền giáo viên / học sinh trên máy chủ (Worker + D1 giả bằng node:sqlite).
import { describe, it, expect, beforeEach } from 'vitest';
import { handleApi } from '../worker.js';
import { createTestD1 } from '../../server/testing/d1.js';
import { createStore } from './storage.js';

const ORIGIN = 'https://english-kid.example';
let env;

async function call(path, { method = 'GET', body, token, headers = {} } = {}) {
  const res = await handleApi(
    new Request(`${ORIGIN}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    }),
    env,
  );
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* 304 */
  }
  return { status: res.status, data };
}

async function setupTeacher() {
  const r = await call('/api/auth/teacher/setup', {
    method: 'POST',
    body: { setupCode: 'secret-code-1', username: 'cohien', password: 'matkhau123', displayName: 'Cô Hiền' },
  });
  expect(r.status).toBe(200);
  return r.data.token;
}

async function addStudents(teacher) {
  const r = await call('/api/students', {
    method: 'PUT',
    token: teacher,
    body: {
      upsert: [
        { id: 's1', username: 'an6a1', name: 'Nguyễn An', class: '6A1', pin: '4821' },
        { id: 's2', username: 'binh6a1', name: 'Trần Bình', class: '6A1', pin: '1357' },
      ],
    },
  });
  expect(r.data.success).toBe(true);
}

beforeEach(() => {
  // Mỗi test một cơ sở dữ liệu mới (ensureSchema chạy lại vì là đối tượng DB khác)
  env = { DB: createTestD1(), ADMIN_SETUP_CODE: 'secret-code-1' };
});

describe('Máy chủ: tài khoản giáo viên', () => {
  it('không còn tài khoản mặc định: chưa tạo thì GV01/123456789 không đăng nhập được', async () => {
    const r = await call('/api/auth/teacher/login', { method: 'POST', body: { username: 'GV01', password: '123456789' } });
    expect(r.status).toBe(401);
    const st = await call('/api/auth/status');
    expect(st.data.needsSetup).toBe(true);
  });

  it('tạo tài khoản đầu tiên cần đúng mã cài đặt, và chỉ tạo được một lần', async () => {
    const bad = await call('/api/auth/teacher/setup', { method: 'POST', body: { setupCode: 'sai', username: 'x', password: 'matkhau123' } });
    expect(bad.status).toBe(403);
    await setupTeacher();
    const again = await call('/api/auth/teacher/setup', { method: 'POST', body: { setupCode: 'secret-code-1', username: 'hacker', password: 'matkhau123' } });
    expect(again.status).toBe(409);
  });

  it('không có ADMIN_SETUP_CODE thì không ai tạo được tài khoản', async () => {
    env.ADMIN_SETUP_CODE = undefined;
    const r = await call('/api/auth/teacher/setup', { method: 'POST', body: { setupCode: '', username: 'cohien', password: 'matkhau123' } });
    expect(r.status).toBe(503);
  });

  it('mật khẩu không lưu dạng chữ thường trong cơ sở dữ liệu', async () => {
    await setupTeacher();
    const row = env.DB.raw.prepare('SELECT * FROM teachers').get();
    expect(row.pass_hash).not.toContain('matkhau123');
    expect(row.pass_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('sai mật khẩu 5 lần thì bị khóa tạm (429), kể cả khi lần 6 nhập đúng', async () => {
    await setupTeacher();
    for (let i = 0; i < 5; i++) {
      const r = await call('/api/auth/teacher/login', { method: 'POST', body: { username: 'cohien', password: 'sai' } });
      expect(r.status).toBe(401);
    }
    const locked = await call('/api/auth/teacher/login', { method: 'POST', body: { username: 'cohien', password: 'matkhau123' } });
    expect(locked.status).toBe(429);
  });

  it('đổi mật khẩu phải nhập đúng mật khẩu cũ; đổi xong các phiên khác bị đăng xuất', async () => {
    const t1 = await setupTeacher();
    const t2 = (await call('/api/auth/teacher/login', { method: 'POST', body: { username: 'cohien', password: 'matkhau123' } })).data.token;
    const wrong = await call('/api/auth/teacher/password', { method: 'POST', token: t1, body: { oldPassword: 'x', newPassword: 'moi12345' } });
    expect(wrong.status).toBe(401);
    const ok = await call('/api/auth/teacher/password', { method: 'POST', token: t1, body: { oldPassword: 'matkhau123', newPassword: 'moi12345' } });
    expect(ok.status).toBe(200);
    expect((await call('/api/scores', { token: t2 })).status).toBe(401);
    expect((await call('/api/scores', { token: t1 })).status).toBe(200);
  });

  it('phiên giả (token tự chế) không được chấp nhận', async () => {
    await setupTeacher();
    const fake = 'a'.repeat(64);
    expect((await call('/api/scores', { token: fake })).status).toBe(401);
  });
});

describe('Máy chủ: bảng điểm', () => {
  it('không đăng nhập thì không đọc, không xóa được điểm', async () => {
    expect((await call('/api/scores')).status).toBe(401);
    expect((await call('/api/scores?all=true', { method: 'DELETE' })).status).toBe(401);
  });

  it('học sinh gửi điểm: tên/lớp lấy từ tài khoản, điểm bị giới hạn hợp lệ; học sinh không xem được bảng điểm', async () => {
    const teacher = await setupTeacher();
    await addStudents(teacher);
    const login = await call('/api/auth/student/login', { method: 'POST', body: { id: 's1', pin: '4821' } });
    expect(login.status).toBe(200);
    const stu = login.data.token;
    const post = await call('/api/scores', {
      method: 'POST',
      token: stu,
      body: { studentName: '=HYPERLINK("x")', studentClass: '9Z', score: 99, stars: 9, correct: 7, total: 5, unitIds: [1, 'abc'] },
    });
    expect(post.status).toBe(200);
    expect((await call('/api/scores', { token: stu })).status).toBe(403);
    const list = await call('/api/scores', { token: teacher });
    const row = list.data.data[0];
    expect(row.studentName).toBe('Nguyễn An');
    expect(row.studentClass).toBe('6A1');
    expect(row.score).toBe(10);
    expect(row.stars).toBe(3);
    expect(row.correct).toBeLessThanOrEqual(row.total);
    expect(row.unitIds).toEqual([1]);
  });

  it('tiến độ trạm (kind=station) không lẫn vào bảng điểm bài test', async () => {
    const teacher = await setupTeacher();
    await addStudents(teacher);
    const stu = (await call('/api/auth/student/login', { method: 'POST', body: { id: 's2', pin: '1357' } })).data.token;
    await call('/api/scores', { method: 'POST', token: stu, body: { kind: 'station', score: 10, stars: 3, correct: 1, total: 1, unitIds: [2] } });
    await call('/api/scores', { method: 'POST', token: stu, body: { score: 8, stars: 2, correct: 16, total: 20, unitIds: [2] } });
    expect((await call('/api/scores', { token: teacher })).data.data).toHaveLength(1);
    expect((await call('/api/scores?kind=all', { token: teacher })).data.data).toHaveLength(2);
  });

  it('không còn lệnh xóa toàn bộ; chỉ xóa theo lớp khi có xác nhận', async () => {
    const teacher = await setupTeacher();
    expect((await call('/api/scores?all=true', { method: 'DELETE', token: teacher })).status).toBe(400);
    expect((await call('/api/scores?class=6A1&confirm=yes', { method: 'DELETE', token: teacher })).status).toBe(200);
  });

  it('chặn gửi từ trang web khác và dữ liệu quá lớn', async () => {
    const teacher = await setupTeacher();
    const cross = await call('/api/content/assignments', { method: 'PUT', token: teacher, body: { json: [] }, headers: { origin: 'https://evil.example' } });
    expect(cross.status).toBe(403);
    await addStudents(teacher);
    const stu = (await call('/api/auth/student/login', { method: 'POST', body: { id: 's1', pin: '4821' } })).data.token;
    const big = await call('/api/scores', { method: 'POST', token: stu, body: JSON.stringify({ x: 'a'.repeat(70000) }) });
    expect(big.status).toBe(413);
  });
});

describe('Máy chủ: học sinh & nội dung đồng bộ', () => {
  it('danh sách lớp công khai không chứa mã PIN; sai PIN bị khóa tạm', async () => {
    const teacher = await setupTeacher();
    await addStudents(teacher);
    const roster = await call('/api/students/public?class=6A1');
    expect(roster.data.data).toHaveLength(2);
    expect(JSON.stringify(roster.data)).not.toMatch(/4821|pin|salt|hash/i);
    for (let i = 0; i < 5; i++) await call('/api/auth/student/login', { method: 'POST', body: { id: 's2', pin: '0000' } });
    expect((await call('/api/auth/student/login', { method: 'POST', body: { id: 's2', pin: '1357' } })).status).toBe(429);
  });

  it('tên đăng nhập trùng bị từ chối; PIN phải là số', async () => {
    const teacher = await setupTeacher();
    await addStudents(teacher);
    const dup = await call('/api/students', { method: 'PUT', token: teacher, body: { upsert: [{ id: 's9', username: 'an6a1', name: 'An khác', class: '6A2', pin: '1111' }] } });
    expect(dup.data.success).toBe(false);
    expect(dup.data.conflicts).toEqual(['an6a1']);
    const badPin = await call('/api/students', { method: 'PUT', token: teacher, body: { upsert: [{ id: 's8', username: 'c6a1', name: 'C', class: '6A1', pin: 'abc' }] } });
    expect(badPin.status).toBe(400);
  });

  it('bài giao giáo viên lưu lên máy chủ thì máy học sinh tải về được; ghi đè bản cũ bị chặn (409)', async () => {
    const teacher = await setupTeacher();
    const put = await call('/api/content/assignments', { method: 'PUT', token: teacher, body: { json: [{ id: 'a1', code: 'ABC123' }], baseVersion: 0 } });
    expect(put.data.version).toBe(1);
    const pub = await call('/api/content');
    expect(pub.data.data.assignments[0].code).toBe('ABC123');
    const stale = await call('/api/content/assignments', { method: 'PUT', token: teacher, body: { json: [], baseVersion: 0 } });
    expect(stale.status).toBe(409);
    expect((await call('/api/content/assignments', { method: 'PUT', body: { json: [] } })).status).toBe(401);
  });

  it('học sinh nộp bài giao, giáo viên xem được bài nộp', async () => {
    const teacher = await setupTeacher();
    await addStudents(teacher);
    const stu = (await call('/api/auth/student/login', { method: 'POST', body: { id: 's1', pin: '4821' } })).data.token;
    expect((await call('/api/submissions', { method: 'POST', token: stu, body: { assignmentId: 'a1', score: 8, detail: { correct: 4 } } })).status).toBe(200);
    const subs = await call('/api/submissions?assignmentId=a1', { token: teacher });
    expect(subs.data.data[0].studentName).toBe('Nguyễn An');
    expect((await call('/api/submissions', { token: stu })).status).toBe(403);
  });
});

describe('Máy học sinh: phiên giáo viên cục bộ', () => {
  it('chỉ ghi session vào localStorage (không có token máy chủ) thì KHÔNG được coi là đã đăng nhập', () => {
    const mem = {};
    const s = createStore({ getItem: (k) => mem[k] ?? null, setItem: (k, v) => (mem[k] = String(v)), removeItem: (k) => delete mem[k] });
    mem.app_tienganh_v1_teacher_session = JSON.stringify({ username: 'x' });
    expect(s.getTeacherSession()).toBeNull();
    expect(s.loginTeacher).toBeUndefined();
  });
});
