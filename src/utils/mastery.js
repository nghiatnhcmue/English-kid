// Theo dõi độ nhớ từng từ qua các bài test tuần.
// 🔴 review   : đã từng làm sai và chưa đúng 2 bài test liên tiếp
// 🟢 mastered : đúng ở 2 bài test liên tiếp trở lên
// ⚪ learning : đã gặp trong test nhưng chưa đủ điều kiện hai nhóm trên

export const PASSES_TO_MASTER = 2;

export function statusOf(entry) {
  if (!entry) return 'new';
  if (entry.consecutivePasses >= PASSES_TO_MASTER) return 'mastered';
  if (entry.wrongCount > 0) return 'review';
  return 'learning';
}

/**
 * Cập nhật bảng độ nhớ sau một bài test.
 * Một từ được tính "qua" nếu mọi câu hỏi về từ đó trong bài đều đúng.
 */
export function updateMastery(prev, answers, isoDate = new Date().toISOString()) {
  const perWord = new Map();
  for (const { wordId, correct } of answers) {
    perWord.set(wordId, (perWord.get(wordId) ?? true) && correct);
  }
  const next = { ...prev };
  for (const [wordId, passed] of perWord) {
    const old = next[wordId] ?? { wrongCount: 0, consecutivePasses: 0 };
    const entry = passed
      ? { ...old, consecutivePasses: old.consecutivePasses + 1 }
      : { ...old, wrongCount: old.wrongCount + 1, consecutivePasses: 0 };
    entry.lastTested = isoDate;
    entry.status = statusOf(entry);
    next[wordId] = entry;
  }
  return next;
}

export function wordsByStatus(mastery, status) {
  return Object.entries(mastery)
    .filter(([, e]) => statusOf(e) === status)
    .map(([id]) => id);
}
