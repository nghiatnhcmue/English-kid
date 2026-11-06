import { createRng, shuffle } from './random.js';
import { makeGap, makeLetterBank } from './spelling.js';

export const TEST_SIZE = 20;

/** Tỉ lệ đề: 40% nhận diện, 30% nghe, 30% hoàn thành từ/câu. */
export function sectionCounts(total = TEST_SIZE) {
  const recognition = Math.round(total * 0.4);
  const listening = Math.round(total * 0.3);
  return { recognition, listening, completion: total - recognition - listening };
}

const KIND_TYPES = {
  recognition: ['image_to_word', 'word_to_meaning'],
  listening: ['listen_to_word'],
  completion: ['spelling', 'context'],
};

function blankSentence(sentence, word) {
  const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return re.test(sentence) ? sentence.replace(re, '_____') : null;
}

function pickDistractors(word, pool, rng, field) {
  const seen = new Set([word[field]]);
  const out = [];
  for (const w of shuffle(pool, rng)) {
    if (w.id === word.id || seen.has(w[field])) continue;
    seen.add(w[field]);
    out.push(w);
    if (out.length === 3) break;
  }
  return out;
}

function choiceQuestion(type, word, pool, rng, field) {
  const options = shuffle([word, ...pickDistractors(word, pool, rng, field)], rng).map((w) => ({
    id: w.id,
    label: w[field],
    emoji: w.emoji,
  }));
  return { type, wordId: word.id, options, answerId: word.id };
}

function buildQuestion(kind, type, word, pool, rng) {
  switch (type) {
    case 'image_to_word':
      return { kind, ...choiceQuestion(type, word, pool, rng, 'word'), emoji: word.emoji, image: word.image };
    case 'word_to_meaning':
      return { kind, ...choiceQuestion(type, word, pool, rng, 'meaning'), word: word.word };
    case 'listen_to_word':
      return { kind, ...choiceQuestion(type, word, pool, rng, 'word'), speak: word.word };
    case 'context': {
      const sentence = blankSentence(word.exampleEn, word.word);
      if (!sentence) return buildQuestion(kind, 'spelling', word, pool, rng);
      return { kind, ...choiceQuestion(type, word, pool, rng, 'word'), sentence, sentenceVi: word.exampleVi };
    }
    case 'spelling': {
      const gap = makeGap(word.word, rng);
      return {
        kind,
        type,
        wordId: word.id,
        emoji: word.emoji,
        image: word.image,
        meaning: word.meaning,
        gap: gap.chars,
        missing: gap.missing,
        letterBank: makeLetterBank(gap.missing, rng),
      };
    }
    default:
      throw new Error(`Loại câu hỏi không hỗ trợ: ${type}`);
  }
}

/**
 * Sinh đề test tuần.
 * @param {object} opts
 * @param {Array} opts.vocab       từ vựng của các Unit được chọn
 * @param {string[]} opts.hardWordIds  từ cần ôn lại (được ưu tiên đưa vào đề)
 * @param {number} opts.seed
 * @param {number} opts.total
 */
export function generateTest({ vocab, hardWordIds = [], seed = Date.now(), total = TEST_SIZE }) {
  if (!vocab || vocab.length < 4) throw new Error('Cần ít nhất 4 từ vựng để tạo đề.');
  const rng = createRng(seed);
  const hardSet = new Set(hardWordIds);
  const ordered = [
    ...shuffle(vocab.filter((w) => hardSet.has(w.id)), rng),
    ...shuffle(vocab.filter((w) => !hardSet.has(w.id)), rng),
  ];

  // Ô thứ i của đề dùng từ ordered[i % n] -> phủ đều các từ, từ khó đứng đầu.
  // Trong mỗi phần, lần thứ r một từ xuất hiện sẽ dùng loại câu khác (xoay vòng),
  // nên không trùng (loại, từ) trừ khi Unit quá ít từ so với số câu của phần đó.
  const n = ordered.length;
  const slots = [];
  let i = 0;
  for (const [kind, count] of Object.entries(sectionCounts(total))) {
    const types = KIND_TYPES[kind];
    const sectionStart = i;
    for (let j = 0; j < count; j++, i++) {
      const round = Math.floor(j / n);
      const typeOffset = Math.floor(sectionStart / n);
      const type = types[(i + round + typeOffset) % types.length];
      slots.push({ kind, type, word: ordered[i % n] });
    }
  }

  // Trộn trong từng phần, giữ thứ tự phần: nhận diện -> nghe -> hoàn thành (dễ trước, khó sau).
  const sections = ['recognition', 'listening', 'completion'];
  return sections
    .flatMap((kind) => shuffle(slots.filter((s) => s.kind === kind), rng))
    .map((s, idx) => ({ id: `q${idx + 1}`, ...buildQuestion(s.kind, s.type, s.word, vocab, rng) }));
}

export function isCorrect(question, response) {
  if (question.type === 'spelling') {
    return Array.isArray(response) && response.join('') === question.missing.join('');
  }
  return response === question.answerId;
}

/** Điểm thang 10 (làm tròn 0,5) và số sao. */
export function scoreTest(correct, total) {
  const score = total ? Math.round((correct / total) * 20) / 2 : 0;
  const stars = score >= 8 ? 3 : score >= 5 ? 2 : 1;
  return { score, stars };
}

