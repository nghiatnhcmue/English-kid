import { describe, it, expect } from 'vitest';
import { shuffleOptions, scrambleWords, prepareUnitForPractice } from './quiz.js';
import { getUnitRaw } from './data.js';

describe('shuffleOptions', () => {
  it('giữ đúng đáp án sau khi trộn và ổn định giữa các lần gọi', () => {
    const q = { question: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], answerIndex: 0 };
    const a = shuffleOptions(q);
    const b = shuffleOptions(q);
    expect(a.options[a.answerIndex]).toBe('am');
    expect(a.options).toEqual(b.options);
    expect([...a.options].sort()).toEqual([...q.options].sort());
  });

  it('suy ra answerIndex từ blankWord khi thiếu', () => {
    const q = { sentence: 'He plays ___ well.', options: ['basketball', 'tennis'], blankWord: 'tennis' };
    const r = shuffleOptions(q);
    expect(r.options[r.answerIndex]).toBe('tennis');
  });

  it('bỏ qua câu hỏi không hợp lệ', () => {
    const q = { question: 'x', options: ['a', 'b'], answerIndex: 5 };
    expect(shuffleOptions(q)).toBe(q);
  });
});

describe('scrambleWords', () => {
  it('không bao giờ trả về đúng thứ tự câu gốc', () => {
    const sentence = 'Jimmy has blonde hair and blue eyes';
    for (let i = 0; i < 20; i++) {
      const out = scrambleWords(sentence.split(' '), sentence, `s${i}`);
      expect(out.join(' ')).not.toBe(sentence);
      expect([...out].sort()).toEqual(sentence.split(' ').sort());
    }
  });

  it('câu 1 từ giữ nguyên', () => {
    expect(scrambleWords(['Hello'], 'Hello')).toEqual(['Hello']);
  });
});

describe('dữ liệu 12 Unit sau khi chuẩn bị để học', () => {
  it('đáp án đúng không còn dồn hết về A, và mọi câu sắp xếp đều đã bị xáo', () => {
    const positions = [];
    for (let id = 1; id <= 12; id++) {
      const raw = getUnitRaw(id);
      const u = prepareUnitForPractice(raw);
      const qs = [...(u.grammar?.quiz || []), ...(u.reading?.questions || []), u.listening].filter(
        (q) => Array.isArray(q?.options) && Number.isInteger(q.answerIndex),
      );
      qs.forEach((q) => positions.push(q.answerIndex));
      for (const it of u.writing?.items || []) {
        if (it.type === 'unscramble' && it.correctSentence?.split(/\s+/).length > 1) {
          expect(it.scrambledWords.join(' ')).not.toBe(it.correctSentence.replace(/[.!?]$/, ''));
        }
      }
    }
    const shareA = positions.filter((p) => p === 0).length / positions.length;
    expect(positions.length).toBeGreaterThan(50);
    expect(shareA).toBeLessThan(0.5);
  });
});
