import { shuffle } from './random.js';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Tạo từ bị khuyết chữ, ví dụ "compass" -> c _ m p _ s s.
 * Ẩn khoảng 35% số chữ cái, ưu tiên nguyên âm, giữ lại chữ cái đầu tiên để gợi ý.
 * Trả về { chars: [{ char, hidden }], missing: [chữ cái bị ẩn theo thứ tự] }.
 */
export function makeGap(word, rng = Math.random, ratio = 0.35) {
  const chars = [...word.toLowerCase()];
  const letterIdx = chars.map((c, i) => (/[a-z]/.test(c) ? i : -1)).filter((i) => i >= 0);
  const candidates = letterIdx.slice(1); // không ẩn chữ đầu
  const hideCount = Math.max(1, Math.min(candidates.length, Math.round(letterIdx.length * ratio)));

  const vowels = shuffle(candidates.filter((i) => VOWELS.has(chars[i])), rng);
  const consonants = shuffle(candidates.filter((i) => !VOWELS.has(chars[i])), rng);
  const hidden = new Set([...vowels, ...consonants].slice(0, hideCount));

  return {
    chars: chars.map((char, i) => ({ char, hidden: hidden.has(i) })),
    missing: chars.filter((_, i) => hidden.has(i)),
  };
}

/** Bộ chữ cái để chọn: chữ bị ẩn + vài chữ gây nhiễu, đã trộn. */
export function makeLetterBank(missing, rng = Math.random, extra = 3) {
  const pool = shuffle([...ALPHABET].filter((c) => !missing.includes(c)), rng).slice(0, extra);
  return shuffle([...missing, ...pool], rng);
}

/** Dạng hiển thị: "c _ m p _ s s" */
export function gapToText(chars) {
  return chars.map((c) => (c.hidden ? '_' : c.char === ' ' ? '  ' : c.char)).join(' ');
}
