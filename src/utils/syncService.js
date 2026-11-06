import { store } from './storage.js';
import { getWord } from './data.js';

/**
 * Gửi kết quả bài kiểm tra lên máy chủ Cloudflare D1
 */
export async function submitTestScore(entry) {
  const wrongWords = [
    ...new Set(
      entry.answers
        ?.filter((a) => !a.correct)
        .map((a) => getWord(a.wordId)?.word || a.wordId)
        .filter(Boolean) || []
    ),
  ];

  const payload = {
    id: entry.id,
    studentName: entry.studentName || 'Học sinh',
    studentClass: entry.studentClass || '6',
    score: entry.score,
    stars: entry.stars,
    correct: entry.correct,
    total: entry.total,
    unitIds: entry.unitIds,
    wrongWords,
    answers: entry.answers,
    createdAt: entry.isoDate,
  };

  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: !!data.success, remote: true, hasD1: data.hasD1 !== false };
    }
    return { success: false, remote: false, error: `HTTP ${res.status}` };
  } catch (err) {
    // Không có mạng hoặc chạy ở môi trường offline cục bộ
    return { success: false, remote: false, offline: true, error: err.message };
  }
}

/**
 * Lấy danh sách điểm thi cho giáo viên
 */
export async function fetchTeacherScores(classFilter = 'all') {
  try {
    const url = classFilter && classFilter !== 'all' ? `/api/scores?class=${encodeURIComponent(classFilter)}` : '/api/scores';
    const res = await fetch(url);

    if (res.ok) {
      const json = await res.json();
      if (json.hasD1 === false) {
        // D1 chưa được liên kết
        return {
          success: false,
          hasD1: false,
          error: json.error,
          data: getLocalFallbackScores(classFilter),
        };
      }
      return {
        success: true,
        hasD1: true,
        data: json.data || [],
      };
    }
  } catch (err) {
    /* Mạng offline hoặc serverless chưa chạy */
  }

  // Dữ liệu dự phòng từ localStorage nếu chưa liên kết Cloudflare D1
  return {
    success: false,
    hasD1: false,
    isLocalFallback: true,
    data: getLocalFallbackScores(classFilter),
  };
}

/**
 * Xóa một bản ghi điểm
 */
export async function deleteScore(id) {
  try {
    const res = await fetch(`/api/scores?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      const json = await res.json();
      return json.success;
    }
  } catch {
    /* bỏ qua */
  }
  return false;
}

/**
 * Xóa toàn bộ điểm (khi giáo viên muốn đặt lại danh sách lớp)
 */
export async function clearAllScores() {
  try {
    const res = await fetch('/api/scores?all=true', { method: 'DELETE' });
    if (res.ok) {
      const json = await res.json();
      return json.success;
    }
  } catch {
    /* bỏ qua */
  }
  return false;
}

/**
 * Lấy danh sách điểm lưu tạm trên máy này nếu chưa có D1
 */
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
    wrongWords: [
      ...new Set(
        t.answers?.filter((a) => !a.correct).map((a) => getWord(a.wordId)?.word || a.wordId).filter(Boolean) || []
      ),
    ],
    createdAt: t.isoDate,
  }));

  if (classFilter && classFilter !== 'all') {
    list = list.filter((item) => item.studentClass.toLowerCase() === classFilter.toLowerCase());
  }

  return list;
}
