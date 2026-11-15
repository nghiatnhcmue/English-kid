import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  OFFICIAL_BOOKS,
  SCHOOL_LEVELS,
  findOfficialBook,
  getBooksBySchoolLevel,
  getBooksByGrade,
} from '../data/officialBooks.js';
import {
  OFFICIAL_BOOKS as RE_EXPORTED_BOOKS,
  bookIdForUnit,
  pdfPageForUnit,
} from '../components/PdfReaderModal.jsx';

describe('Official Textbook Assets & Metadata (14 Books)', () => {
  it('contains exactly 14 official textbooks', () => {
    expect(OFFICIAL_BOOKS).toHaveLength(14);
    expect(RE_EXPORTED_BOOKS).toHaveLength(14);
  });

  it('validates each textbook has all required schema properties', () => {
    const requiredKeys = [
      'id',
      'grade',
      'schoolLevel',
      'title',
      'shortTitle',
      'semester',
      'badgeTone',
      'desc',
      'src',
      'downloadName',
      'fileSize',
      'pages',
    ];

    OFFICIAL_BOOKS.forEach((book) => {
      requiredKeys.forEach((key) => {
        expect(book[key], `Book ${book.id} missing property "${key}"`).toBeDefined();
        if (typeof book[key] === 'string') {
          expect(book[key].trim().length).toBeGreaterThan(0);
        }
      });

      // Grade must be a number between 1 and 12
      expect(book.grade).toBeGreaterThanOrEqual(1);
      expect(book.grade).toBeLessThanOrEqual(12);

      // School level must be primary, secondary, or high
      expect(['primary', 'secondary', 'high']).toContain(book.schoolLevel);

      // Src must point to /pdf/
      expect(book.src.startsWith('/pdf/')).toBe(true);
      expect(book.src.endsWith('.pdf')).toBe(true);
    });
  });

  it('correctly categorizes books by school level (7 Primary, 4 Secondary, 3 High)', () => {
    const primary = getBooksBySchoolLevel('primary');
    const secondary = getBooksBySchoolLevel('secondary');
    const high = getBooksBySchoolLevel('high');

    expect(primary).toHaveLength(7); // Grades 1, 2, 3(T2), 4(T1), 4(T2), 5(T1), 5(T2)
    expect(secondary).toHaveLength(4); // Grades 6(T1), 6(T2), 7, 8
    expect(high).toHaveLength(3); // Grades 10, 11, 12
  });

  it('verifies that each PDF file exists in public/pdf and has content', () => {
    const publicDir = path.resolve(process.cwd(), 'public');

    OFFICIAL_BOOKS.forEach((book) => {
      const relPath = book.src.replace(/^\//, '');
      const filePath = path.join(publicDir, relPath);
      expect(fs.existsSync(filePath), `PDF file not found: ${filePath}`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size, `PDF file empty: ${filePath}`).toBeGreaterThan(1000000); // at least 1MB
    });
  });

  it('supports finding books by ID, code, or alias', () => {
    // Legacy Grade 6 tap1 and tap2
    expect(findOfficialBook('tap1').title).toContain('Tiếng Anh 6 – Tập 1');
    expect(findOfficialBook('tap2').title).toContain('Tiếng Anh 6 – Tập 2');
    expect(findOfficialBook('sgk-6-tap1').id).toBe('tap1');

    // Primary books
    expect(findOfficialBook('sgk-1').grade).toBe(1);
    expect(findOfficialBook('sgk-2').grade).toBe(2);
    expect(findOfficialBook('sgk-3-tap2').grade).toBe(3);
    expect(findOfficialBook('sgk-4-tap1').grade).toBe(4);
    expect(findOfficialBook('sgk-4-tap2').grade).toBe(4);
    expect(findOfficialBook('sgk-5-tap1').grade).toBe(5);
    expect(findOfficialBook('sgk-5-tap2').grade).toBe(5);

    // Secondary & High
    expect(findOfficialBook('sgk-7').grade).toBe(7);
    expect(findOfficialBook('sgk-8').grade).toBe(8);
    expect(findOfficialBook('sgk-10').grade).toBe(10);
    expect(findOfficialBook('sgk-11').grade).toBe(11);
    expect(findOfficialBook('sgk-12').grade).toBe(12);

    // Fallback for non-existent id
    expect(findOfficialBook('non-existent')).toBe(OFFICIAL_BOOKS[0]);
  });

  it('maintains backwards compatibility for bookIdForUnit and pdfPageForUnit', () => {
    expect(bookIdForUnit({ bookVolume: 1 })).toBe('tap1');
    expect(bookIdForUnit({ bookVolume: 2 })).toBe('tap2');
    expect(bookIdForUnit({})).toBe('tap1');

    expect(pdfPageForUnit({ bookStartPage: 6 })).toBe(7);
    expect(pdfPageForUnit({ bookPages: '6 - 15' })).toBe(7);
  });
});
