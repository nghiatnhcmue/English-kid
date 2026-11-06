import { describe, it, expect } from 'vitest';
import unit1 from '../data/unit1.json';
import unit2 from '../data/unit2.json';
import { generateTest, sectionCounts, isCorrect, scoreTest } from './testGenerator.js';
import { updateMastery, statusOf } from './mastery.js';
import { makeGap } from './spelling.js';
import { createRng } from './random.js';
import { createStore, KEYS } from './storage.js';
import { isoWeek, streakOf, localDay } from './dates.js';
import { testsToCsv } from './report.js';

const vocab = [...unit1.vocabularies, ...unit2.vocabularies];

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => delete data[k],
    data,
  };
}

describe('generateTest', () => {
  it('tạo đủ 20 câu theo tỉ lệ 8/6/6', () => {
    const qs = generateTest({ vocab, seed: 1 });
    expect(qs).toHaveLength(20);
    const count = (k) => qs.filter((q) => q.kind === k).length;
    expect(sectionCounts(20)).toEqual({ recognition: 8, listening: 6, completion: 6 });
    expect(count('recognition')).toBe(8);
    expect(count('listening')).toBe(6);
    expect(count('completion')).toBe(6);
  });

  it('không trùng (loại câu, từ) và đáp án luôn nằm trong lựa chọn', () => {
    for (const seed of [1, 2, 3, 42, 999]) {
      const qs = generateTest({ vocab: unit1.vocabularies, seed });
      const pairs = qs.map((q) => `${q.type}:${q.wordId}`);
      expect(new Set(pairs).size).toBe(pairs.length);
      for (const q of qs) {
        if (q.type === 'spelling') {
          expect(q.missing.length).toBeGreaterThan(0);
          q.missing.forEach((m) => expect(q.letterBank).toContain(m));
        } else {
          expect(q.options).toHaveLength(4);
          expect(q.options.map((o) => o.id)).toContain(q.answerId);
          expect(new Set(q.options.map((o) => o.label)).size).toBe(4);
        }
      }
    }
  });

  it('vẫn đủ 20 câu khi Unit có ít từ (lặp từ ở loại câu khác)', () => {
    const qs = generateTest({ vocab: unit1.vocabularies.slice(0, 8), seed: 7 });
    expect(qs).toHaveLength(20);
    expect(new Set(qs.map((q) => `${q.type}:${q.wordId}`)).size).toBe(20);
  });

  it('ưu tiên từ khó', () => {
    const hard = ['u2_15', 'u2_14', 'u2_13'];
    const qs = generateTest({ vocab, hardWordIds: hard, seed: 5 });
    hard.forEach((id) => expect(qs.some((q) => q.wordId === id)).toBe(true));
  });

  it('tái lập được với cùng seed', () => {
    expect(generateTest({ vocab, seed: 11 })).toEqual(generateTest({ vocab, seed: 11 }));
  });

  it('chấm đúng/sai', () => {
    const qs = generateTest({ vocab, seed: 3 });
    const choice = qs.find((q) => q.type !== 'spelling');
    expect(isCorrect(choice, choice.answerId)).toBe(true);
    expect(isCorrect(choice, 'khong-co')).toBe(false);
    const sp = qs.find((q) => q.type === 'spelling');
    expect(isCorrect(sp, sp.missing)).toBe(true);
  });

  it('điểm thang 10 và sao', () => {
    expect(scoreTest(20, 20)).toEqual({ score: 10, stars: 3 });
    expect(scoreTest(15, 20)).toEqual({ score: 7.5, stars: 2 });
    expect(scoreTest(7, 20)).toEqual({ score: 3.5, stars: 1 });
  });
});

describe('makeGap', () => {
  it('giữ chữ đầu, giữ khoảng trắng, ẩn ít nhất 1 chữ', () => {
    const rng = createRng(1);
    for (const w of vocab) {
      const g = makeGap(w.word, rng);
      expect(g.chars[0].hidden).toBe(false);
      expect(g.missing.length).toBeGreaterThan(0);
      g.chars.filter((c) => c.char === ' ').forEach((c) => expect(c.hidden).toBe(false));
      expect(g.chars.map((c) => c.char).join('')).toBe(w.word.toLowerCase());
    }
  });
});

describe('mastery', () => {
  it('sai → cần ôn; đúng 2 bài liên tiếp → đã nhớ; sai lại → cần ôn', () => {
    let m = updateMastery({}, [{ wordId: 'a', correct: false }, { wordId: 'b', correct: true }]);
    expect(statusOf(m.a)).toBe('review');
    expect(statusOf(m.b)).toBe('learning');
    m = updateMastery(m, [{ wordId: 'a', correct: true }, { wordId: 'b', correct: true }]);
    expect(statusOf(m.a)).toBe('review');
    expect(statusOf(m.b)).toBe('mastered');
    m = updateMastery(m, [{ wordId: 'a', correct: true }]);
    expect(statusOf(m.a)).toBe('mastered');
    m = updateMastery(m, [{ wordId: 'a', correct: false }]);
    expect(statusOf(m.a)).toBe('review');
    expect(m.a.consecutivePasses).toBe(0);
  });

  it('một từ chỉ qua khi mọi câu về từ đó trong bài đều đúng', () => {
    const m = updateMastery({}, [
      { wordId: 'a', correct: true },
      { wordId: 'a', correct: false },
    ]);
    expect(statusOf(m.a)).toBe('review');
  });
});

describe('storage', () => {
  it('dữ liệu hỏng hoặc trống không làm sập app', () => {
    const s = createStore(memoryStorage({ [KEYS.TESTS]: '{hỏng', [KEYS.MASTERY]: '[1,2]' }));
    expect(s.getTestHistory()).toEqual([]);
    expect(s.getMastery()).toEqual({});
    expect(createStore(undefined).getTestHistory()).toEqual([]);
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
    const t = createStore(throwing);
    expect(t.getSettings().lang).toBe('en-GB');
    expect(() => t.saveTestResult({ unitIds: [1], answers: [{ wordId: 'a', correct: true }] })).not.toThrow();
  });

  it('lưu kết quả test, cập nhật độ nhớ và nhật ký', () => {
    const s = createStore(memoryStorage());
    const now1 = new Date('2026-11-02T08:00:00');
    const now2 = new Date('2026-11-09T08:00:00');
    s.saveTestResult({ unitIds: [1], answers: [{ wordId: 'u1_01', correct: false }, { wordId: 'u1_02', correct: true }], now: now1 });
    s.saveTestResult({ unitIds: [1], answers: [{ wordId: 'u1_01', correct: true }, { wordId: 'u1_02', correct: true }], now: now2 });
    const h = s.getTestHistory();
    expect(h).toHaveLength(2);
    expect(h[0].week).toBe(isoWeek(now2));
    expect(h[1].score).toBe(5);
    const m = s.getMastery();
    expect(statusOf(m.u1_01)).toBe('review');
    expect(statusOf(m.u1_02)).toBe('mastered');
    const csv = testsToCsv(h, (id) => vocab.find((v) => v.id === id));
    expect(csv).toContain('school bag');
    expect(csv.split('\r\n')).toHaveLength(3);
  });
});

describe('dates', () => {
  it('tuần ISO và chuỗi ngày học', () => {
    expect(isoWeek(new Date('2026-01-01T12:00:00'))).toBe('2026-W01');
    const today = new Date('2026-11-06T10:00:00');
    const d = (n) => {
      const x = new Date(today);
      x.setDate(x.getDate() - n);
      return localDay(x);
    };
    expect(streakOf([d(0), d(1), d(2), d(4)], today)).toBe(3);
    expect(streakOf([d(1), d(2)], today)).toBe(2);
    expect(streakOf([d(3)], today)).toBe(0);
  });
});
