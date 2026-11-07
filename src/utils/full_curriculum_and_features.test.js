import { describe, it, expect } from 'vitest';
import { listUnits, getUnit } from './data.js';
import { store, createStore } from './storage.js';
import { parseBatchQuestions, parseBatchWriting, parseBatchAny } from './questionParser.js';

describe('10-Point Curriculum & Features Comprehensive Verification', () => {
  const units = listUnits();

  // Test 1: 12 Units Existence & Integrity
  it('1. Exactly 12 Units are registered with proper book volume & page ranges', () => {
    expect(units.length).toBe(12);
    for (let i = 1; i <= 12; i++) {
      const u = units.find((x) => x.unitId === i);
      expect(u).toBeDefined();
      expect(u.titleEn).toBeTruthy();
      expect(u.titleVi).toBeTruthy();
      expect(u.bookVolume).toBe(i <= 6 ? 1 : 2);
      expect(u.bookPages).toBeTruthy();
    }
  });

  // Test 2: Vocabulary Quality & Phonetic Standard
  it('2. All vocabularies across 12 Units have standard British IPA and valid examples', () => {
    let totalVocabs = 0;
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      expect(u.vocabularies.length).toBeGreaterThanOrEqual(10);
      totalVocabs += u.vocabularies.length;

      u.vocabularies.forEach((v) => {
        expect(v.id).toBeTruthy();
        expect(v.word).toBeTruthy();
        expect(v.meaning).toBeTruthy();
        expect(v.phonetic).toMatch(/^\/.+\/$/);
        expect(v.wordType).toBeTruthy();
        expect(v.exampleEn).toBeTruthy();
        expect(v.exampleVi).toBeTruthy();
        // Check example sentence contains the word (case-insensitive)
        const cleanWord = v.word.toLowerCase().replace(/[-']/g, ' ');
        const cleanEx = v.exampleEn.toLowerCase().replace(/[-']/g, ' ');
        const wordParts = cleanWord.split(' ');
        const hasMatch = wordParts.some((part) => cleanEx.includes(part));
        expect(hasMatch).toBe(true);
      });
    });
    expect(totalVocabs).toBeGreaterThanOrEqual(130);
  });

  // Test 3: Reading Passages & Comprehension Questions
  it('3. All 12 Units have official Reading passages and at least 5 comprehension questions', () => {
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      expect(u.reading).toBeDefined();
      expect(u.reading.passage.length).toBeGreaterThan(100);
      expect(u.reading.translation.length).toBeGreaterThan(100);
      expect(u.reading.questions.length).toBeGreaterThanOrEqual(5);

      u.reading.questions.forEach((q) => {
        expect(q.id).toBeTruthy();
        expect(['multiple_choice', 'fill_blank', 'unscramble', 'sentence_completion']).toContain(q.type);
        expect(q.question).toBeTruthy();
        if (q.type === 'multiple_choice') {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.answerIndex).toBeGreaterThanOrEqual(0);
          expect(q.answerIndex).toBeLessThan(q.options.length);
        } else if (q.type === 'fill_blank') {
          expect(q.blankWord).toBeTruthy();
        }
        expect(q.explain).toBeTruthy();
      });
    });
  });

  // Test 4: Grammar Rules, Formulas & Quizzes
  it('4. All 12 Units have complete Grammar topics, child-friendly rules, formulas and 6 quiz items', () => {
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      const g = u.grammar;
      expect(g).toBeDefined();
      expect(g.title).toBeTruthy();
      expect(g.ruleVi).toBeTruthy();
      expect(g.formula).toBeTruthy();
      expect(g.quickTip).toBeTruthy();
      expect(g.quiz.length).toBeGreaterThanOrEqual(6);

      g.quiz.forEach((q) => {
        expect(q.question).toBeTruthy();
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(q.options.length);
        expect(q.explain).toBeTruthy();
      });
    });
  });

  // Test 5: Writing Exercises (Unscramble & Fill Blank)
  it('5. All 12 Units have at least 4 Writing items with unscramble and cloze formats', () => {
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      const w = u.writing;
      expect(w).toBeDefined();
      const items = Array.isArray(w.items) ? w.items : [];
      expect(items.length).toBeGreaterThanOrEqual(4);

      items.forEach((item) => {
        expect(item.id).toBeTruthy();
        expect(['unscramble', 'fill_blank', 'sentence_completion']).toContain(item.type);
        expect(item.meaningVi).toBeTruthy();
        if (item.type === 'unscramble') {
          expect(item.scrambledWords.length).toBeGreaterThanOrEqual(3);
          expect(item.correctSentence).toBeTruthy();
        } else if (item.type === 'fill_blank') {
          expect(item.blankWord).toBeTruthy();
          expect(item.sentence).toContain('______');
        }
      });
    });
  });

  // Test 6: Speaking Target Sentences & Progressive Challenges
  it('6. All 12 Units have AI Speaking challenges and target sentence', () => {
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      const spk = u.speaking;
      expect(spk).toBeDefined();
      expect(spk.targetSentence).toBeTruthy();
      expect(spk.meaningVi).toBeTruthy();
      expect(spk.challenges.length).toBeGreaterThanOrEqual(3);
    });
  });

  // Test 7: Listening Transcripts & Comprehension Quizzes
  it('7. All 12 Units have Listening audio transcripts and valid quiz options', () => {
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      const lis = u.listening;
      expect(lis).toBeDefined();
      expect(lis.transcript).toBeTruthy();
      expect(lis.question).toBeTruthy();
      expect(lis.options.length).toBeGreaterThanOrEqual(2);
      expect(lis.answerIndex).toBeGreaterThanOrEqual(0);
      expect(lis.answerIndex).toBeLessThan(lis.options.length);
    });
  });

  // Test 8: Pronunciation Pairs matching Official Global Success Book Map
  it('8. All 12 Units have correct Pronunciation phonetic pairs', () => {
    const expectedPairs = [
      '/ɑː/ & /ʌ/',   // Unit 1
      '/s/ & /z/',     // Unit 2
      '/b/ & /p/',     // Unit 3
      '/iː/ & /ɪ/',    // Unit 4
      '/t/ & /d/',     // Unit 5
      '/s/ & /ʃ/',     // Unit 6
      '/θ/ & /ð/',     // Unit 7
      '/e/ & /æ/',     // Unit 8
      '/əʊ/ & /aʊ/',   // Unit 9
      'Oo & oO',      // Unit 10: Stress in two-syllable words (SGK tr.40)
      'Nhấn & Lướt',  // Unit 11: Rhythm in sentences (SGK tr.51)
      '↘ & ↗',        // Unit 12: Falling tone in statements (SGK tr.60)
    ];

    units.forEach((summary, idx) => {
      const u = getUnit(summary.unitId);
      expect(u.pronunciation).toBeDefined();
      expect(u.pronunciation.pair).toBe(expectedPairs[idx]);
      expect(u.pronunciation.practiceQuiz.length).toBeGreaterThanOrEqual(4);
    });
  });

  // Test 9: Custom Units CRUD & Fallback Logic
  it('9. Custom unit creation, editing, override and deletion behave properly', () => {
    const memory = {};
    const fakeStorage = {
      getItem: (key) => memory[key] ?? null,
      setItem: (key, val) => { memory[key] = String(val); },
      removeItem: (key) => { delete memory[key]; },
      clear: () => { Object.keys(memory).forEach((k) => delete memory[k]); },
    };
    const s = createStore(fakeStorage);
    const testCustomId = 99;

    // Create custom unit
    const created = s.saveCreatedUnit({
      unitId: testCustomId,
      titleEn: 'Special Grammar Review',
      titleVi: 'Chuyên đề Ôn tập Ngữ pháp Đặc biệt',
      topic: 'Tense Mastery',
    }, {
      vocabularies: [
        {
          id: 'u99_01',
          word: 'championship',
          phonetic: '/ˈtʃæmpiənʃɪp/',
          wordType: 'Danh từ',
          meaning: 'Giải vô địch',
          hint: 'Cuộc thi đấu tranh chức vô địch',
          exampleEn: 'Our team won the championship.',
          exampleVi: 'Đội của chúng mình đã giành giải vô địch.',
          image: '',
          emoji: '🏆',
        },
      ],
    });

    expect(created).toBeDefined();
    expect(created.titleEn).toBe('Special Grammar Review');
    expect(s.getCreatedUnits().some((u) => u.unitId === testCustomId)).toBe(true);
    expect(s.getCustomUnit(testCustomId)).toBeDefined();
    expect(s.getCustomUnit(testCustomId).title).toBe('Special Grammar Review');
    expect(s.getCustomUnit(testCustomId).vocabularies).toHaveLength(1);

    // Delete custom unit
    s.deleteCreatedUnit(testCustomId);
    expect(s.getCreatedUnits().some((u) => u.unitId === testCustomId)).toBe(false);
    expect(s.getCustomUnit(testCustomId)).toBeNull();
  });

  // Test 10: Multi-format Question Parser for Word import
  it('10. Question parser correctly parses ABCD, Fill Blank, and Unscramble from Word text', () => {
    const rawText = `
Câu 1: Where is Ha Long Bay?
A. In Quang Ninh*
B. In Ha Noi
C. In Da Nang
D. In Hue
Giải thích: Vịnh Hạ Long thuộc tỉnh Quảng Ninh.

Câu 2: A [desert] is a large area of land with very little water.
Giải thích: Điền từ desert.

Câu 3: Sắp xếp: Ha Long Bay / is / Viet Nam's / best / natural wonder
Đáp án: Ha Long Bay is Viet Nam's best natural wonder
    `.trim();

    const parsed = parseBatchAny(rawText);
    expect(parsed.length).toBe(3);

    expect(parsed[0].type).toBe('multiple_choice');
    expect(parsed[0].answerIndex).toBe(0);
    expect(parsed[0].options[0]).toBe('In Quang Ninh');

    expect(parsed[1].type).toBe('fill_blank');
    expect(parsed[1].blankWord).toBe('desert');

    expect(parsed[2].type).toBe('unscramble');
    expect(parsed[2].correctSentence).toBe("Ha Long Bay is Viet Nam's best natural wonder");
  });
});
