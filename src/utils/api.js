// Lớp gọi API máy chủ (Cloudflare Worker + D1): đăng nhập, đồng bộ nội dung giáo viên, hàng đợi nộp bài offline.
import { KEYS, store, onStoreWrite } from './storage.js';

const PREFIX = 'app_tienganh_v1_';
const K = {
  TEACHER_TOKEN: `${PREFIX}teacher_token`,
  STUDENT_TOKEN: `${PREFIX}student_token`,
  CONTENT_VERSIONS: `${PREFIX}content_versions`,
  CONTENT_ETAG: `${PREFIX}content_etag`,
  OUTBOX: `${PREFIX}outbox`,
  SENT: `${PREFIX}outbox_sent`,
};

const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);
const get = (k, d = null) => {
  try {
    const v = ls()?.getItem(k);
    return v == null ? d : JSON.parse(v);
  } catch {
    return d;
  }
};
const set = (k, v) => {
  try {
    if (v == null) ls()?.removeItem(k);
    else ls()?.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
};
const emit = (name, detail) => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent(name, { detail }));

export const getTeacherToken = () => get(K.TEACHER_TOKEN);
export const getStudentToken = () => get(K.STUDENT_TOKEN);

/** fetch JSON: trả về { ok, status, data, offline } – không bao giờ ném lỗi. */
export async function apiFetch(path, { method = 'GET', body, role, headers = {} } = {}) {
  const token = role === 'teacher' ? getTeacherToken() : role === 'student' ? getStudentToken() : null;
  try {
    const res = await fetch(path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    if (res.status !== 304) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    }
    if (res.status === 401 && role === 'teacher' && token) {
      set(K.TEACHER_TOKEN, null);
      store().clearTeacherSession();
    }
    return { ok: res.ok, status: res.status, data, headers: res.headers };
  } catch {
    return { ok: false, status: 0, data: null, offline: true };
  }
}

const errorOf = (r, fallback) =>
  r.offline ? 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.' : r.data?.error || fallback;

// ================= GIÁO VIÊN =================
export async function getAuthStatus() {
  const r = await apiFetch('/api/auth/status');
  return r.ok ? r.data : { needsSetup: false, setupEnabled: false, offline: !!r.offline, error: errorOf(r, '') };
}

function startTeacherSession(data) {
  set(K.TEACHER_TOKEN, data.token);
  store().setTeacherSession({ ...data.teacher, loginAt: new Date().toISOString() });
  emit('teacher-auth-changed', { session: store().getTeacherSession() });
}

export async function setupTeacher({ setupCode, username, password, displayName }) {
  const r = await apiFetch('/api/auth/teacher/setup', { method: 'POST', body: { setupCode, username, password, displayName } });
  if (!r.ok) return { success: false, error: errorOf(r, 'Không tạo được tài khoản.') };
  startTeacherSession(r.data);
  await pullContent({ force: true });
  pushLocalContentIfServerEmpty();
  await pushLocalStudentsIfServerEmpty();
  return { success: true };
}

export async function loginTeacher(username, password) {
  if (!String(username).trim() || !String(password)) return { success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' };
  const r = await apiFetch('/api/auth/teacher/login', { method: 'POST', body: { username: String(username).trim(), password } });
  if (!r.ok) return { success: false, error: errorOf(r, 'Đăng nhập không thành công.') };
  startTeacherSession(r.data);
  await pullContent({ force: true });
  pushLocalContentIfServerEmpty();
  await pushLocalStudentsIfServerEmpty();
  return { success: true };
}

export async function logoutTeacher() {
  await apiFetch('/api/auth/logout', { method: 'POST', role: 'teacher', body: {} });
  set(K.TEACHER_TOKEN, null);
  store().clearTeacherSession();
  emit('teacher-auth-changed', { session: null });
}

export async function changeTeacherPassword(oldPassword, newPassword) {
  const r = await apiFetch('/api/auth/teacher/password', { method: 'POST', role: 'teacher', body: { oldPassword, newPassword } });
  return r.ok ? { success: true } : { success: false, error: errorOf(r, 'Không đổi được mật khẩu.') };
}

/** Kiểm tra phiên giáo viên còn hiệu lực trên máy chủ (gọi khi mở trang Giáo viên). */
export async function verifyTeacherSession() {
  if (!getTeacherToken()) return false;
  const r = await apiFetch('/api/auth/me', { role: 'teacher' });
  if (r.offline) return !!store().getTeacherSession(); // mất mạng: tạm tin phiên cũ, mọi lệnh ghi vẫn do máy chủ kiểm tra
  if (r.ok && r.data?.role === 'teacher') return true;
  set(K.TEACHER_TOKEN, null);
  store().clearTeacherSession();
  return false;
}

// ================= HỌC SINH =================
export async function fetchRoster(className = '') {
  const r = await apiFetch(`/api/students/public${className ? `?class=${encodeURIComponent(className)}` : ''}`);
  if (!r.ok) return { success: false, offline: !!r.offline, data: [] };
  store().mergeRoster(r.data.data || []);
  return { success: true, data: r.data.data || [] };
}

export async function loginStudentOnline(id, pin) {
  const r = await apiFetch('/api/auth/student/login', { method: 'POST', body: { id, pin: String(pin || '') } });
  if (r.ok) {
    set(K.STUDENT_TOKEN, r.data.token);
    store().mergeRoster([r.data.student]);
    store().setCurrentStudent(r.data.student.id);
    flushOutbox();
    return { success: true, student: r.data.student };
  }
  return { success: false, offline: !!r.offline, status: r.status, error: errorOf(r, 'Đăng nhập không thành công.') };
}

export async function logoutStudentOnline() {
  if (getStudentToken()) await apiFetch('/api/auth/logout', { method: 'POST', role: 'student', body: {} });
  set(K.STUDENT_TOKEN, null);
}

/** Đồng bộ danh sách học sinh (giáo viên): upsert có pin (mới/đổi) và remove. */
export async function syncStudents({ upsert = [], remove = [] }) {
  if (!getTeacherToken()) return { success: false, error: 'Cần đăng nhập giáo viên.' };
  const r = await apiFetch('/api/students', { method: 'PUT', role: 'teacher', body: { upsert, remove } });
  return r.ok && r.data?.success !== false ? { success: true } : { success: false, error: errorOf(r, 'Chưa lưu được lên máy chủ.'), conflicts: r.data?.conflicts };
}

export async function fetchTeacherStudents() {
  const r = await apiFetch('/api/students', { role: 'teacher' });
  return r.ok ? r.data.data || [] : null;
}

const toServerStudent = (s) => ({
  id: s.id,
  username: s.username,
  name: s.name,
  class: s.class,
  avatar: s.avatar,
  pin: /^\d{4,8}$/.test(String(s.password || '')) ? String(s.password) : undefined,
});

/** Lần đầu dùng máy chủ: đưa danh sách học sinh đang có trên máy giáo viên lên (nếu máy chủ còn trống). */
async function pushLocalStudentsIfServerEmpty() {
  const remote = await fetchTeacherStudents();
  if (!remote || remote.length) return;
  const local = store().getStudents().filter((s) => !s.demo);
  if (local.length) await syncStudents({ upsert: local.map(toServerStudent) });
}
export { toServerStudent };

// ================= NỘI DUNG GIÁO VIÊN SOẠN =================
const CONTENT_MAP = { custom_units: KEYS.CUSTOM_UNITS, created_units: KEYS.CREATED_UNITS, assignments: KEYS.ASSIGNMENTS };
let applyingRemote = false;

/** Tải nội dung (Unit tự soạn, bài giao) từ máy chủ về máy này. Gọi khi mở app / có mạng lại. */
export async function pullContent({ force = false } = {}) {
  const etag = force ? null : get(K.CONTENT_ETAG);
  const r = await apiFetch('/api/content', { headers: etag ? { 'If-None-Match': etag } : {} });
  if (r.status === 304) return { success: true, changed: false };
  if (!r.ok) return { success: false, offline: !!r.offline };
  const { data = {}, versions = {} } = r.data || {};
  applyingRemote = true;
  try {
    for (const [key, storeKey] of Object.entries(CONTENT_MAP)) {
      if (data[key] !== undefined && data[key] !== null) store().writeRaw(storeKey, data[key]);
    }
  } finally {
    applyingRemote = false;
  }
  set(K.CONTENT_VERSIONS, versions);
  set(K.CONTENT_ETAG, r.headers?.get?.('ETag') || null);
  emit('curriculum-updated', { source: 'server' });
  emit('assignment-updated', { source: 'server' });
  return { success: true, changed: true };
}

const pending = new Map();
/** Giáo viên sửa nội dung trên máy → đẩy lên máy chủ (gộp các lần sửa liên tiếp trong 800ms). */
function schedulePush(key) {
  clearTimeout(pending.get(key));
  pending.set(
    key,
    setTimeout(async () => {
      pending.delete(key);
      const storeKey = CONTENT_MAP[key];
      const versions = get(K.CONTENT_VERSIONS, {}) || {};
      emit('sync-status', { state: 'saving', key });
      const r = await apiFetch(`/api/content/${key}`, {
        method: 'PUT',
        role: 'teacher',
        body: { json: store().readRaw(storeKey), baseVersion: versions[key] ?? 0 },
      });
      if (r.ok) {
        set(K.CONTENT_VERSIONS, { ...versions, [key]: r.data.version });
        set(K.CONTENT_ETAG, null);
        emit('sync-status', { state: 'saved', key });
      } else {
        emit('sync-status', { state: 'error', key, error: errorOf(r, 'Chưa lưu được lên máy chủ.'), conflict: r.status === 409 });
      }
    }, 800),
  );
}

/** Lần đầu: nội dung giáo viên đã soạn trên máy này (trước khi có máy chủ) được đưa lên máy chủ. */
function pushLocalContentIfServerEmpty() {
  const versions = get(K.CONTENT_VERSIONS, {}) || {};
  for (const [key, storeKey] of Object.entries(CONTENT_MAP)) {
    const local = store().readRaw(storeKey);
    const hasLocal = Array.isArray(local) ? local.length > 0 : local && Object.keys(local).length > 0;
    if (versions[key] == null && hasLocal) schedulePush(key);
  }
}

const KEY_BY_STORE = Object.fromEntries(Object.entries(CONTENT_MAP).map(([k, v]) => [v, k]));
onStoreWrite((storeKey) => {
  const key = KEY_BY_STORE[storeKey];
  if (key && !applyingRemote && getTeacherToken()) schedulePush(key);
});

// ================= HÀNG ĐỢI GỬI ĐIỂM / BÀI NỘP (chạy được khi offline) =================
/** dedupeKey: cùng một bài (vd id bài test) chỉ được xếp hàng / gửi một lần. */
export function enqueue(kind, payload, dedupeKey = null) {
  const box = get(K.OUTBOX, []) || [];
  if (dedupeKey) {
    const sent = get(K.SENT, []) || [];
    if (sent.includes(dedupeKey) || box.some((x) => x.key === dedupeKey)) return;
  }
  box.push({ kind, payload, key: dedupeKey, at: Date.now(), uid: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}` });
  set(K.OUTBOX, box.slice(-200));
  flushOutbox();
}

export const pendingCount = () => (get(K.OUTBOX, []) || []).length;

let flushing = false;
let flushAgain = false;
const sameItem = (a, b) => (a.uid || b.uid ? a.uid === b.uid : a.at === b.at && a.kind === b.kind && a.key === b.key);
export async function flushOutbox() {
  if (!getStudentToken()) return;
  if (flushing) {
    flushAgain = true; // có món mới trong lúc đang gửi → gửi tiếp sau vòng này
    return;
  }
  flushing = true;
  try {
    do {
      flushAgain = false;
      for (;;) {
        // Luôn đọc lại hàng đợi mới nhất (món mới có thể vừa được thêm) và chỉ gỡ đúng món đã gửi
        const box = get(K.OUTBOX, []) || [];
        const item = box[0];
        if (!item) break;
        const path = item.kind === 'submission' ? '/api/submissions' : '/api/scores';
        const r = await apiFetch(path, { method: 'POST', role: 'student', body: item.payload });
        if (r.offline || r.status >= 500 || r.status === 401) return; // thử lại sau / khi em đăng nhập lại
        // gửi xong, hoặc bị từ chối hẳn (4xx khác) thì bỏ khỏi hàng đợi
        set(K.OUTBOX, (get(K.OUTBOX, []) || []).filter((x) => !sameItem(x, item)));
        if (item.key) set(K.SENT, [...(get(K.SENT, []) || []), item.key].slice(-300));
        emit('outbox-changed', { pending: (get(K.OUTBOX, []) || []).length });
      }
    } while (flushAgain);
  } finally {
    flushing = false;
  }
}

// Tiến độ từng trạm (storage.recordStationProgress phát sự kiện) → gửi lên máy chủ dạng 'station'
if (typeof window !== 'undefined') {
  window.addEventListener('station-progress', (e) => {
    const { unitId, stationKey, stars, data = {} } = e.detail || {};
    enqueue('score', {
      kind: 'station',
      score: data.score != null ? Number(data.score) : Number(stars) * 3.33,
      stars,
      correct: data.correct === false ? 0 : 1,
      total: 1,
      unitIds: [Number(unitId)],
      answers: [{ station: stationKey, unitId: Number(unitId) }],
    });
  });
}

/** Khởi động đồng bộ: gọi 1 lần khi mở app. */
export function startSync() {
  if (typeof window === 'undefined') return;
  pullContent();
  flushOutbox();
  window.addEventListener('online', () => {
    pullContent();
    flushOutbox();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pullContent();
  });
}
