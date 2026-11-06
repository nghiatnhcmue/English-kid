import { createRng, shuffle } from './random.js';

/**
 * Chấm điểm thử thách bối cảnh.
 * - correct: món đúng (trong required)
 * - missing: món cần mà chưa chọn
 * - extra:   món chọn thừa (không thuộc required và không thuộc allowed)
 * - okExtra: món không bắt buộc nhưng hợp lý (thuộc allowed) – không bị trừ điểm
 */
export function evaluateContext(picked, challenge) {
  const pickedSet = new Set(picked);
  const required = challenge.required ?? [];
  const allowed = new Set(challenge.allowed ?? []);
  const correct = required.filter((id) => pickedSet.has(id));
  const missing = required.filter((id) => !pickedSet.has(id));
  const extra = [...pickedSet].filter((id) => !required.includes(id) && !allowed.has(id));
  const okExtra = [...pickedSet].filter((id) => !required.includes(id) && allowed.has(id));

  const errors = missing.length + extra.length;
  const stars = correct.length === 0 ? 1 : errors === 0 ? 3 : errors === 1 ? 2 : 1;
  const messageKey = errors === 0 ? 'perfect' : missing.length && extra.length ? 'both' : missing.length ? 'missing' : 'extra';
  return { correct, missing, extra, okExtra, stars, messageKey };
}

/** "a" hay "an" trước một từ (đủ dùng cho từ vựng lớp 6). */
export function article(word) {
  const w = word.toLowerCase();
  if (/^(uni|use|eu|one)/.test(w)) return 'a';
  if (/^(hour|honest)/.test(w)) return 'an';
  return /^[aeiou]/.test(w) ? 'an' : 'a';
}

/** Điền từ vào mẫu câu "{0}", tự sửa "a" → "an" khi cần. */
export function fillPattern(pattern, words) {
  return pattern
    .replace(/\b(a|an) \{(\d)\}/gi, (_, a, i) => {
      const w = words[Number(i)] ?? '';
      const art = article(w);
      return `${a[0] === 'A' ? art[0].toUpperCase() + art.slice(1) : art} ${w}`;
    })
    .replace(/\{(\d)\}/g, (_, i) => words[Number(i)] ?? '');
}

/** Ghép danh sách tiếng Anh: "a calculator, a compass and a ruler". */
export function listEn(words) {
  const items = words.map((w) => `${article(w)} ${w}`);
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Thử thách nói ngẫu nhiên ("Bất ngờ"): chọn mẫu câu + 1–2 đồ vật trong bối cảnh.
 * vocabById: (id) => từ vựng
 */
export function surpriseChallenge(scene, vocabById, seed = Date.now()) {
  const rng = createRng(seed);
  const patterns = scene.speakingPatterns ?? [{ en: 'This is my {0}.', vi: 'Đây là {0} của em.' }];
  const pattern = patterns[Math.floor(rng() * patterns.length)];
  const slots = pattern.en.includes('{1}') ? 2 : 1;
  const objects = shuffle(scene.objects, rng)
    .slice(0, slots)
    .map(vocabById)
    .filter(Boolean);
  const sentenceEn = fillPattern(pattern.en, objects.map((o) => o.word));
  const sentenceVi = pattern.vi.replace(/\{(\d)\}/g, (_, i) => (objects[Number(i)]?.meaning ?? '').toLowerCase());
  return { objects, sentenceEn, sentenceVi };
}

const normalize = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** Độ giống giữa câu nói được và câu mẫu, theo từ (0..1). Dùng để chấm nói thật nhẹ nhàng. */
export function similarity(spoken, target) {
  const a = normalize(spoken);
  const b = normalize(target);
  if (!b.length) return 0;
  if (!a.length) return 0;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return Math.max(0, 1 - dp[a.length][b.length] / Math.max(a.length, b.length));
}

/** Mức đánh giá nói: 'great' (≥0.6) | 'close' (≥0.3) | 'retry'. */
export function speakingLevel(score) {
  return score >= 0.6 ? 'great' : score >= 0.3 ? 'close' : 'retry';
}
