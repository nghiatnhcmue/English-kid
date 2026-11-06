import { formatViDate } from './dates.js';

const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV lịch sử bài test, kèm danh sách từ sai. Có BOM để Excel đọc đúng tiếng Việt. */
export function testsToCsv(tests, wordLookup) {
  const header = ['Ngày', 'Tuần', 'Unit', 'Số câu đúng', 'Tổng số câu', 'Điểm (thang 10)', 'Số sao', 'Từ làm sai'];
  const rows = tests.map((t) => {
    const wrong = [...new Set(t.answers.filter((a) => !a.correct).map((a) => wordLookup(a.wordId)?.word ?? a.wordId))];
    return [formatViDate(t.isoDate), t.week, t.unitIds.join(' + '), t.correct, t.total, t.score, t.stars, wrong.join(' | ')];
  });
  return '﻿' + [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
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
