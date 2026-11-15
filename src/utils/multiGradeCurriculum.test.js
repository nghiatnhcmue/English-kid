import { describe, it, expect } from 'vitest';
import multiGradeCurriculum from '../data/multiGradeCurriculum.json';
import { OFFICIAL_BOOKS } from '../data/officialBooks.js';

describe('multiGradeCurriculum catalog and integrity', () => {
  it('should contain metadata and all 11 grades from Grade 1 to Grade 12', () => {
    expect(multiGradeCurriculum.metadata).toBeDefined();
    expect(multiGradeCurriculum.grades).toHaveLength(11);
    
    const grades = multiGradeCurriculum.grades.map((g) => g.grade);
    expect(grades).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12]);
  });

  it('should have exact required unit counts per grade according to official standard', () => {
    const gradeMap = Object.fromEntries(multiGradeCurriculum.grades.map((g) => [g.grade, g.units.length]));
    
    // Tiểu học: Lớp 1 (16), Lớp 2 (16), Lớp 3 (20), Lớp 4 (20), Lớp 5 (20)
    expect(gradeMap[1]).toBe(16);
    expect(gradeMap[2]).toBe(16);
    expect(gradeMap[3]).toBe(20);
    expect(gradeMap[4]).toBe(20);
    expect(gradeMap[5]).toBe(20);

    // THCS: Lớp 6 (12), Lớp 7 (12), Lớp 8 (12)
    expect(gradeMap[6]).toBe(12);
    expect(gradeMap[7]).toBe(12);
    expect(gradeMap[8]).toBe(12);

    // THPT: Lớp 10 (10), Lớp 11 (10), Lớp 12 (10)
    expect(gradeMap[10]).toBe(10);
    expect(gradeMap[11]).toBe(10);
    expect(gradeMap[12]).toBe(10);
  });

  it('should mark Grade 6 as interactiveAvailable = true and other grades false', () => {
    const grade6 = multiGradeCurriculum.grades.find((g) => g.grade === 6);
    expect(grade6.interactiveAvailable).toBe(true);

    const otherGrades = multiGradeCurriculum.grades.filter((g) => g.grade !== 6);
    for (const g of otherGrades) {
      expect(g.interactiveAvailable).toBe(false);
    }
  });

  it('should reference valid book IDs defined in OFFICIAL_BOOKS', () => {
    const validBookIds = new Set(OFFICIAL_BOOKS.map((b) => b.id));

    for (const g of multiGradeCurriculum.grades) {
      for (const tb of g.textbooks) {
        expect(validBookIds.has(tb.bookId)).toBe(true);
      }
      for (const u of g.units) {
        expect(validBookIds.has(u.bookId)).toBe(true);
      }
    }
  });

  it('each unit should have unit number, title, titleVi, theme, and semester', () => {
    for (const g of multiGradeCurriculum.grades) {
      for (const u of g.units) {
        expect(u.unit).toBeGreaterThan(0);
        expect(u.title).toBeTruthy();
        expect(u.titleVi).toBeTruthy();
        expect(u.theme).toBeTruthy();
        expect([1, 2]).toContain(u.semester);
      }
    }
  });
});
