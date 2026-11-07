import { store } from './storage.js';
import { getWord } from './data.js';
import { apiFetch, enqueue, getStudentToken } from './api.js';

const wrongWordsOf = (answers) => [
  ...new Set(
    (answers || [])
      .filter((a) => a && a.correct === false)
      .map((a) => getWord(a.wordId)?.word || a.wordId)
      .filter(Boolean),
  ),
];

/**
 * Gửi kết quả bài test lên máy chủ. Luôn đi qua hàng đợi: mất mạng thì tự gửi lại khi có mạng.
 * Tên/lớp do máy chủ lấy từ tài khoản đã đăng nhập (không tin dữ liệu gửi lên).
 */
export async function submitTestScore(entry) {
  enqueue('score', {
    kind: 'test',
    score: entry.score,
    stars: entry.stars,
    correct: entry.correct,
    total: entry.total,
    unitIds: entry.unitIds,
    wrongWords: wrongWordsOf(entry.answers),
    answers: entry.answers,
  }, entry.id ? `score:${entry.id}` : null);
  return { success: true, queued: true, needsLogin: !getStudentToken() };
}

/** Nộp bài giao (bài giáo viên giao qua mã/link). */
export function submitAssignmentResult({ id, assignmentId, score, detail }) {
  enqueue('submission', { assignmentId, score, detail }, id ? `sub:${id}` : null);
}

/** Lấy điểm cho giáo viên. kind: 'test' (mặc định) | 'all' (gồm cả tiến độ từng trạm). */
export async function fetchTeacherScores(classFilter = 'all', kind = 'test') {
  const qs = new URLSearchParams();
  if (classFilter && classFilter !== 'all') qs.set('class', classFilter);
  if (kind === 'all') qs.set('kind', 'all');
  const r = await apiFetch(`/api/scores${qs.toString() ? `?${qs}` : ''}`, { role: 'teacher' });
  if (r.ok) return { success: true, hasD1: true, data: r.data?.data || [] };
  if (r.status === 401) return { success: false, hasD1: true, needsLogin: true, error: r.data?.error, data: [] };
  // Chưa liên kết D1 (503) hoặc mất mạng: xem điểm đã lưu trên máy này
  return {
    success: false,
    hasD1: false,
    isLocalFallback: true,
    offline: !!r.offline,
    error: r.data?.error,
    data: kind === 'all' ? [] : getLocalFallbackScores(classFilter),
  };
}

/** Lấy bài nộp của bài giao (giáo viên). */
export async function fetchSubmissions(assignmentId) {
  const r = await apiFetch(`/api/submissions${assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : ''}`, { role: 'teacher' });
  return r.ok ? r.data?.data || [] : null;
}

export async function deleteScore(id) {
  const r = await apiFetch(`/api/scores?id=${encodeURIComponent(id)}`, { method: 'DELETE', role: 'teacher' });
  return !!(r.ok && r.data?.success);
}

/** Xóa điểm của MỘT lớp (không còn lệnh xóa toàn bộ). */
export async function clearClassScores(className) {
  if (!className || className === 'all') return false;
  const r = await apiFetch(`/api/scores?class=${encodeURIComponent(className)}&confirm=yes`, { method: 'DELETE', role: 'teacher' });
  return !!(r.ok && r.data?.success);
}

/** Điểm lưu trên máy này (khi chưa có D1 hoặc mất mạng). */
function getLocalFallbackScores(classFilter) {
  const localTests = store().getTestHistory();
  const student = store().getStudentInfo();
  let list = localTests.map((t) => ({
    id: t.id,
    studentName: t.studentName || student.name || 'Em học sinh',
    studentClass: t.studentClass || student.class || '6A1',
    score: t.score,
    stars: t.stars,
    correct: t.correct,
    total: t.total,
    unitIds: t.unitIds,
    wrongWords: wrongWordsOf(t.answers),
    createdAt: t.isoDate,
    kind: 'test',
  }));
  if (classFilter && classFilter !== 'all') {
    list = list.filter((item) => String(item.studentClass).toLowerCase() === classFilter.toLowerCase());
  }
  return list;
}
