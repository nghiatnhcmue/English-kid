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

  it('suy ra answerIndex từ answer dạng chuỗi hoặc dạng số nguyên', () => {
    const qStr = { question: 'She likes ___ books.', options: ['reading', 'read', 'reads'], answer: 'reading' };
    const rStr = shuffleOptions(qStr);
    expect(rStr.options[rStr.answerIndex]).toBe('reading');

    const qNum = { question: 'Select option', options: ['A', 'B', 'C'], answer: 1 };
    const rNum = shuffleOptions(qNum);
    expect(rNum.options[rNum.answerIndex]).toBe('B');
  });

  it('suy ra answerIndex từ correctAnswer khi có', () => {
    const qCorrect = { question: 'What is it?', options: ['cat', 'dog', 'bird'], correctAnswer: 'dog' };
    const rCorrect = shuffleOptions(qCorrect);
    expect(rCorrect.options[rCorrect.answerIndex]).toBe('dog');
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

import { makeOptions } from '../components/ListeningQuiz.jsx';
import { resolveWordEmoji } from '../components/ui.jsx';

describe('ListeningQuiz makeOptions & Visual Resolution', () => {
  it('luôn tạo đủ 4 lựa chọn trong Nghe chọn hình kể cả khi tất cả từ có chung emoji', () => {
    const dummyPool = [
      { id: 'w1', word: 'gardening', emoji: '🌟', meaning: 'Làm vườn' },
      { id: 'w2', word: 'collecting', emoji: '🌟', meaning: 'Sưu tầm' },
      { id: 'w3', word: 'arranging flowers', emoji: '🌟', meaning: 'Cắm hoa' },
      { id: 'w4', word: 'making models', emoji: '🌟', meaning: 'Làm mô hình' },
      { id: 'w5', word: 'horse riding', emoji: '🌟', meaning: 'Cưỡi ngựa' },
      { id: 'w6', word: 'cycling', emoji: '🌟', meaning: 'Đi xe đạp' },
    ];
    const targetWord = dummyPool[0];
    const options = makeOptions(targetWord, dummyPool);

    expect(options.length).toBe(4);
    expect(options.some((o) => o.id === targetWord.id)).toBe(true);
    // 4 lựa chọn phải là các từ phân biệt (id khác nhau)
    const uniqueIds = new Set(options.map((o) => o.id));
    expect(uniqueIds.size).toBe(4);
  });

  it('tự động gán emoji trực quan thông minh thay vì icon sao mặc định', () => {
    expect(resolveWordEmoji({ word: 'gardening', meaning: 'Làm vườn', emoji: '🌟' })).toBe('🧑‍🌾');
    expect(resolveWordEmoji({ word: 'making models', meaning: 'Làm mô hình', emoji: '🌟' })).toBe('✈️');
    expect(resolveWordEmoji({ word: 'cycling', meaning: 'Đi xe đạp', emoji: '🌟' })).toBe('🚴');
    expect(resolveWordEmoji({ word: 'sunburn', meaning: 'Cháy nắng', emoji: '🌟' })).toBe('☀️');
  });
});
