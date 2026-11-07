import { formatViDate } from './dates.js';

export const esc = (v) => {
  let s = String(v ?? '');
  // Chống "CSV injection": ô bắt đầu bằng = + - @ (hoặc tab/CR) sẽ bị Excel chạy như công thức → thêm dấu ' phía trước
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = `'${s}`;
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV lịch sử bài test của học sinh. Có BOM để Excel mở không bị lỗi font tiếng Việt. */
export function testsToCsv(tests, wordLookup) {
  const header = ['Ngày', 'Tuần', 'Unit', 'Số câu đúng', 'Tổng số câu', 'Điểm (thang 10)', 'Số sao', 'Từ làm sai'];
  const rows = tests.map((t) => {
    const wrong = [
      ...new Set((t.answers || []).filter((a) => !a.correct).map((a) => wordLookup(a.wordId)?.word ?? a.wordId)),
    ];
    return [
      formatViDate(t.isoDate),
      t.week,
      t.unitIds.join(' + '),
      t.correct,
      t.total,
      t.score,
      t.stars,
      wrong.join(' | '),
    ];
  });
  return '\uFEFF' + [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}

/** CSV bảng điểm dành cho giáo viên (kèm Tên và Lớp của học sinh) */
export function teacherScoresToCsv(records) {
  const header = [
    'Thời gian nộp bài',
    'Họ và tên học sinh',
    'Lớp',
    'Bài học (Unit)',
    'Điểm số (thang 10)',
    'Số câu đúng',
    'Tổng số câu',
    'Đạt số sao',
    'Các từ vựng làm sai',
  ];

  const rows = records.map((r) => {
    const wrong = Array.isArray(r.wrongWords) ? r.wrongWords.join(' | ') : '';
    const units = Array.isArray(r.unitIds) ? r.unitIds.map((u) => `Unit ${u}`).join(' + ') : '';
    const time = r.createdAt ? `${formatViDate(r.createdAt)} ${new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : '';

    return [
      time,
      r.studentName || 'Học sinh',
      r.studentClass || '',
      units,
      r.score,
      r.correct,
      r.total,
      r.stars,
      wrong,
    ];
  });

  return '\uFEFF' + [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}

export function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
