import { describe, it, expect } from 'vitest';
import unit1 from '../data/unit1.json';
import unit2 from '../data/unit2.json';
import { evaluateContext, surpriseChallenge, similarity, speakingLevel, fillPattern, listEn, article } from './scene.js';
import { createStore, totalStarsOf, modeStarsOf, stageStarsOf } from './storage.js';

const vocab = [...unit1.vocabularies, ...unit2.vocabularies];
const byId = (id) => vocab.find((v) => v.id === id);
const maths = { required: ['calc', 'compass', 'ruler'], allowed: ['notebook'] };

describe('evaluateContext', () => {
  it('đủ món, không thừa → 3 sao', () => {
    const r = evaluateContext(['ruler', 'calc', 'compass'], maths);
    expect(r).toMatchObject({ stars: 3, missing: [], extra: [], messageKey: 'perfect' });
  });
  it('món trong allowed không bị trừ', () => {
    const r = evaluateContext(['ruler', 'calc', 'compass', 'notebook'], maths);
    expect(r.stars).toBe(3);
    expect(r.okExtra).toEqual(['notebook']);
  });
  it('thiếu 1 món → 2 sao kèm danh sách thiếu', () => {
    const r = evaluateContext(['ruler', 'calc'], maths);
    expect(r).toMatchObject({ stars: 2, missing: ['compass'], messageKey: 'missing' });
  });
  it('thừa 1 món ngoài allowed → 2 sao', () => {
    const r = evaluateContext(['ruler', 'calc', 'compass', 'sofa'], maths);
    expect(r).toMatchObject({ stars: 2, extra: ['sofa'], messageKey: 'extra' });
  });
  it('sai nhiều hoặc không chọn đúng món nào → 1 sao', () => {
    expect(evaluateContext(['ruler'], maths).stars).toBe(1);
    expect(evaluateContext([], maths).stars).toBe(1);
    expect(evaluateContext(['sofa'], maths).messageKey).toBe('both');
  });
});

describe('mẫu câu', () => {
  it('a / an', () => {
    expect(article('apartment')).toBe('an');
    expect(article('uniform')).toBe('a');
    expect(article('ruler')).toBe('a');
    expect(fillPattern('I live in a {0}.', ['apartment'])).toBe('I live in an apartment.');
    expect(fillPattern('I have a {0} and a {1}.', ['uniform', 'rubber'])).toBe('I have a uniform and a rubber.');
    expect(listEn(['calculator', 'compass', 'ruler'])).toBe('a calculator, a compass and a ruler');
  });

  it('surpriseChallenge chọn đồ trong bối cảnh và điền đủ câu', () => {
    for (const unit of [unit1, unit2]) {
      for (const scene of unit.scenes) {
        for (let seed = 1; seed < 30; seed++) {
          const c = surpriseChallenge(scene, byId, seed);
          expect(c.objects.length).toBeGreaterThan(0);
          c.objects.forEach((o) => expect(scene.objects).toContain(o.id));
          expect(c.sentenceEn).not.toMatch(/\{\d\}/);
          expect(c.sentenceVi).not.toMatch(/\{\d\}/);
          c.objects.forEach((o) => expect(c.sentenceEn).toContain(o.word));
        }
      }
    }
  });
});

describe('similarity', () => {
  it('giống hệt = 1, không phân biệt hoa thường/dấu câu', () => {
    expect(similarity('i have a ruler', 'I have a ruler.')).toBe(1);
    expect(speakingLevel(similarity('I have a ruler', 'I have a ruler.'))).toBe('great');
  });
  it('gần đúng / khác hẳn / rỗng', () => {
    expect(speakingLevel(similarity('I have ruler', 'I have a ruler.'))).toBe('great');
    expect(speakingLevel(similarity('have a', 'I have a ruler.'))).toBe('close');
    expect(similarity('banana', 'I have a ruler.')).toBe(0);
    expect(similarity('', 'I have a ruler.')).toBe(0);
  });
});

describe('sao sân khấu', () => {
  it('lưu sao tốt nhất, không làm sai tổng sao 4 chế độ', () => {
    const data = {};
    const s = createStore({ getItem: (k) => data[k] ?? null, setItem: (k, v) => (data[k] = v), removeItem: (k) => delete data[k] });
    s.saveModeResult(1, 'flashcard', 3);
    s.saveStageResult(1, 'desk', 'maths', 2);
    s.saveStageResult(1, 'desk', 'maths', 1);
    s.saveStageResult(1, 'desk', 'drawing', 3);
    const p = s.getProgress();
    expect(modeStarsOf(p.units[1])).toBe(3);
    expect(stageStarsOf(p.units[1])).toBe(5);
    expect(totalStarsOf(p)).toBe(8);
  });
});
