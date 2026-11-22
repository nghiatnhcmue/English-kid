import { describe, it, expect } from 'vitest';
import { listUnits, getUnit } from './data.js';
import multiGradeCurriculum from '../data/multiGradeCurriculum.json';

describe('All 12 Grades Comprehensive Curriculum Suite', () => {
  it('1. multiGradeCurriculum has all 12 grades flagged interactiveAvailable = true', () => {
    expect(multiGradeCurriculum.grades).toHaveLength(12);
    for (const g of multiGradeCurriculum.grades) {
      expect(g.interactiveAvailable).toBe(true);
      expect(g.units.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('2. Exact unit distribution: 170 units total across 12 grades', () => {
    const expectedCounts = {
      1: 16, 2: 16, 3: 20, 4: 20, 5: 20,
      6: 12, 7: 12, 8: 12, 9: 12,
      10: 10, 11: 10, 12: 10,
    };

    let total = 0;
    for (const g of multiGradeCurriculum.grades) {
      expect(g.units.length).toBe(expectedCounts[g.grade]);
      total += g.units.length;
    }
    expect(total).toBe(170);
  });

  it('3. listUnits(grade) dynamically returns units for any grade', () => {
    expect(listUnits(1)).toHaveLength(16);
    expect(listUnits(2)).toHaveLength(16);
    expect(listUnits(3)).toHaveLength(20);
    expect(listUnits(4)).toHaveLength(20);
    expect(listUnits(5)).toHaveLength(20);
    expect(listUnits(6)).toHaveLength(12);
    expect(listUnits(7)).toHaveLength(12);
    expect(listUnits(8)).toHaveLength(12);
    expect(listUnits(9)).toHaveLength(12);
    expect(listUnits(10)).toHaveLength(10);
    expect(listUnits(11)).toHaveLength(10);
    expect(listUnits(12)).toHaveLength(10);
  });

  it('4. getUnit loads complete 7 stations for Primary grades (e.g. Grade 1 & Grade 3)', () => {
    const g1u1 = getUnit('g1_u1');
    expect(g1u1).toBeDefined();
    expect(g1u1.grade).toBe(1);
    expect(g1u1.unit).toBe(1);
    expect(g1u1.vocabularies.length).toBeGreaterThanOrEqual(3); // SGK Lớp 1 Unit 1: ball, bike, book
    expect(g1u1.grammar.quiz.length).toBeGreaterThanOrEqual(1);
    expect(g1u1.pronunciation.pair).toBeDefined();
    expect(g1u1.speaking.dialogueLines.length).toBeGreaterThanOrEqual(4);
    expect(g1u1.reading.passage).toBeTruthy();
    expect(g1u1.listening.transcript).toBeTruthy();
    expect(g1u1.writing.items.length).toBeGreaterThanOrEqual(1);

    const g3u5 = getUnit('g3_u5');
    expect(g3u5).toBeDefined();
    expect(g3u5.grade).toBe(3);
    expect(g3u5.unit).toBe(5);
    expect(g3u5.vocabularies.length).toBeGreaterThanOrEqual(4);
    expect(g3u5.grammar.formula).toBeTruthy();
  });

  it('5. getUnit loads complete 7 stations for Secondary grades (e.g. Grade 7, 8, 9)', () => {
    const g7u1 = getUnit('g7_u1');
    expect(g7u1).toBeDefined();
    expect(g7u1.grade).toBe(7);
    expect(g7u1.unit).toBe(1);
    expect(g7u1.speaking.dialogueLines.length).toBeGreaterThanOrEqual(4);
    expect(g7u1.reading.questions.length).toBeGreaterThanOrEqual(1);
    expect(g7u1.pronunciation.practiceQuiz.length).toBeGreaterThanOrEqual(1);

    const g9u2 = getUnit('g9_u2');
    expect(g9u2).toBeDefined();
    expect(g9u2.grade).toBe(9);
    expect(g9u2.unit).toBe(2);
    expect(g9u2.grammar.quiz.length).toBeGreaterThanOrEqual(1);
  });

  it('6. getUnit loads complete 7 stations for High School grades (e.g. Grade 10, 11, 12)', () => {
    const g10u1 = getUnit('g10_u1');
    expect(g10u1).toBeDefined();
    expect(g10u1.grade).toBe(10);
    expect(g10u1.unit).toBe(1);
    expect(g10u1.vocabularies.length).toBeGreaterThanOrEqual(6);
    expect(g10u1.grammar.title).toBeTruthy();

    const g12u10 = getUnit('g12_u10');
    expect(g12u10).toBeDefined();
    expect(g12u10.grade).toBe(12);
    expect(g12u10.unit).toBe(10);
    expect(g12u10.speaking.challenges.length).toBeGreaterThanOrEqual(1);
  });

  it('7. Preserves Grade 6 backward compatibility with numeric unit IDs 1-12', () => {
    const u1 = getUnit(1);
    expect(u1).toBeDefined();
    expect(u1.unitId).toBe(1);
    expect(u1.titleEn).toContain('My New School');
    expect(u1.vocabularies.length).toBeGreaterThanOrEqual(20);

    const u12 = getUnit(12);
    expect(u12).toBeDefined();
    expect(u12.unitId).toBe(12);
    expect(u12.titleEn).toContain('Robots');
  });

  it('8. bookIdForUnit maps correctly across all school levels and grades', async () => {
    const { bookIdForUnit } = await import('../components/PdfReaderModal.jsx');
    expect(bookIdForUnit({ grade: 1 })).toBe('sgk-1');
    expect(bookIdForUnit({ grade: 2 })).toBe('sgk-2');
    expect(bookIdForUnit({ grade: 3 })).toBe('sgk-3-tap2');
    expect(bookIdForUnit({ grade: 4, semester: 1 })).toBe('sgk-4-tap1');
    expect(bookIdForUnit({ grade: 4, semester: 2 })).toBe('sgk-4-tap2');
    expect(bookIdForUnit({ grade: 5, semester: 1 })).toBe('sgk-5-tap1');
    expect(bookIdForUnit({ grade: 5, semester: 2 })).toBe('sgk-5-tap2');
    expect(bookIdForUnit({ grade: 6, semester: 1 })).toBe('tap1');
    expect(bookIdForUnit({ grade: 6, semester: 2 })).toBe('tap2');
    expect(bookIdForUnit({ grade: 7 })).toBe('sgk-7');
    expect(bookIdForUnit({ grade: 8 })).toBe('sgk-8');
    expect(bookIdForUnit({ grade: 9 })).toBe('sgk-9');
    expect(bookIdForUnit({ grade: 10 })).toBe('sgk-10');
    expect(bookIdForUnit({ grade: 11 })).toBe('sgk-11');
    expect(bookIdForUnit({ grade: 12 })).toBe('sgk-12');
  });
});
