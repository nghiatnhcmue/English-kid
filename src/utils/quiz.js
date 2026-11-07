import { createRng, shuffle } from './random.js';

// Dữ liệu gốc gần như luôn để đáp án đúng ở vị trí A và câu "sắp xếp từ" đã đúng thứ tự.
// Các hàm dưới đây trộn lại khi hiển thị, với seed cố định theo nội dung câu hỏi:
// cùng một câu luôn ra cùng một thứ tự (không nhảy lung tung khi re-render), nhưng mỗi câu một kiểu.

export function hashSeed(text) {
  let h = 2166136261;
  const s = String(text ?? '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const norm = (s) => String(s ?? '').trim().toLowerCase();

/** Trộn options và tính lại answerIndex. Câu fill_blank chỉ có blankWord thì tự suy ra answerIndex. */
export function shuffleOptions(q, salt = '') {
  if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;
  let answerIndex = Number.isInteger(q.answerIndex) ? q.answerIndex : -1;
  if (answerIndex < 0 && q.blankWord) answerIndex = q.options.findIndex((o) => norm(o) === norm(q.blankWord));
  if (answerIndex < 0 || answerIndex >= q.options.length) return q;
  const rng = createRng(hashSeed(`${salt}|${q.question ?? q.sentence ?? ''}|${q.options.join('|')}`));
  const order = shuffle(
    q.options.map((_, i) => i),
    rng,
  );
  return { ...q, options: order.map((i) => q.options[i]), answerIndex: order.indexOf(answerIndex) };
}

/** Trộn các từ của câu sắp xếp, bảo đảm KHÁC thứ tự đúng (nếu câu có ≥ 2 từ khác nhau). */
export function scrambleWords(words, correctSentence = '', salt = '') {
  const list = Array.isArray(words) && words.length ? words : String(correctSentence).split(/\s+/).filter(Boolean);
  if (list.length < 2) return list;
  const target = norm(correctSentence || list.join(' ')).replace(/[.!?]$/, '');
  const same = (arr) => norm(arr.join(' ')).replace(/[.!?]$/, '') === target;
  const rng = createRng(hashSeed(`${salt}|${list.join(' ')}`));
  for (let i = 0; i < 6; i++) {
    const out = shuffle(list, rng);
    if (!same(out)) return out;
  }
  const rotated = [...list.slice(1), list[0]];
  return same(rotated) ? list : rotated;
}

const mapQ = (arr, fn) => (Array.isArray(arr) ? arr.map(fn) : arr);

/** Trộn đáp án + xáo từ cho MỘT câu hỏi (dùng cho bài giao của thầy cô). */
export function prepareItem(item, salt) {
  if (!item || typeof item !== 'object') return item;
  let out = shuffleOptions(item, salt);
  if (Array.isArray(out.scrambledWords) || out.type === 'unscramble') {
    out = { ...out, scrambledWords: scrambleWords(out.scrambledWords, out.correctSentence, salt) };
  }
  return out;
}

/** Bản Unit dùng để HỌC: đáp án đã trộn, từ đã xáo. (Trình soạn của giáo viên dùng bản gốc.) */
export function prepareUnitForPractice(unit) {
  if (!unit) return unit;
  const u = { ...unit };
  const salt = `u${unit.unitId}`;
  if (u.grammar) u.grammar = { ...u.grammar, quiz: mapQ(u.grammar.quiz, (q) => prepareItem(q, salt)) };
  if (u.listening) u.listening = prepareItem(u.listening, salt);
  if (u.reading) u.reading = { ...u.reading, questions: mapQ(u.reading.questions, (q) => prepareItem(q, salt)) };
  if (u.writing) {
    u.writing = prepareItem({ ...u.writing, items: mapQ(u.writing.items, (q) => prepareItem(q, salt)) }, salt);
  }
  return u;
}
