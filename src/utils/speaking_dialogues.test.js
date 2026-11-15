import { describe, it, expect } from 'vitest';
import { listUnits, getUnit } from './data.js';
import { searchCurriculum } from './search.js';
import { createStore } from './storage.js';

// Test compareWords logic (same as in SpeakingStation)
function compareWords(targetSentence, spokenSentence) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetWords = (targetSentence || '').split(/\s+/).filter(Boolean);
  const spokenWords = (spokenSentence || '').split(/\s+/).map(norm).filter(Boolean);

  return targetWords.map((origWord) => {
    const cleanOrig = norm(origWord);
    const isMatched = spokenWords.includes(cleanOrig);
    return {
      word: origWord,
      matched: isMatched,
    };
  });
}

describe('Speaking & Textbook Getting Started Dialogues Suite', () => {
  const units = listUnits();

  it('1. All 12 Units have Getting Started dialogues with at least 10 turns', () => {
    expect(units.length).toBe(12);
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      expect(u.speaking).toBeDefined();
      expect(u.speaking.dialogueTitle).toMatch(/Getting Started/i);
      expect(u.speaking.dialogueContext.length).toBeGreaterThan(15);
      expect(u.speaking.dialogueLines.length).toBeGreaterThanOrEqual(10);

      // Verify each turn
      u.speaking.dialogueLines.forEach((line, idx) => {
        expect(line.speaker).toBeTruthy();
        expect(line.sentenceEn).toBeTruthy();
        expect(line.sentenceEn.length).toBeGreaterThan(2);
        expect(line.phonetic).toMatch(/^\/.+\/$/);
        expect(line.meaningVi).toBeTruthy();
        expect(line.tipsVi).toBeTruthy();
      });
    });
  });

  it('2. All 12 Units have at least 6 speaking challenges with varied situational topics', () => {
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      expect(u.speaking.challenges.length).toBeGreaterThanOrEqual(6);
      u.speaking.challenges.forEach((ch) => {
        expect(ch.id).toBeTruthy();
        expect(ch.level).toBeTruthy();
        expect(ch.sentenceEn).toBeTruthy();
        expect(ch.phonetic).toMatch(/^\/.+\/$/);
        expect(ch.meaningVi).toBeTruthy();
        expect(ch.tipsVi).toBeTruthy();
      });
    });
  });

  it('3. Specific textbook dialogue characters match Curriculum', () => {
    // Unit 1: Phong, Duy, Vy
    const u1 = getUnit(1);
    const u1Speakers = new Set(u1.speaking.dialogueLines.map((l) => l.speaker));
    expect(u1Speakers.has('Phong')).toBe(true);
    expect(u1Speakers.has('Duy')).toBe(true);
    expect(u1Speakers.has('Vy')).toBe(true);

    // Unit 2: Elena, Mi
    const u2 = getUnit(2);
    const u2Speakers = new Set(u2.speaking.dialogueLines.map((l) => l.speaker));
    expect(u2Speakers.has('Elena')).toBe(true);
    expect(u2Speakers.has('Mi')).toBe(true);

    // Unit 12: Nick, TS. Alex / Dr. Alex, Phong
    const u12 = getUnit(12);
    const u12Speakers = new Set(u12.speaking.dialogueLines.map((l) => l.speaker));
    expect(u12Speakers.has('Nick')).toBe(true);
    expect(u12Speakers.has('TS. Alex') || u12Speakers.has('Dr. Alex')).toBe(true);
  });

  it('4. compareWords correctly matches words irrespective of casing and punctuation', () => {
    const target = 'Hi, Phong. Are you ready?';
    const spoken = 'hi phong are you ready';
    const result = compareWords(target, spoken);

    expect(result.length).toBe(5);
    expect(result.every((r) => r.matched)).toBe(true);
    expect(result[0].word).toBe('Hi,');
    expect(result[4].word).toBe('ready?');
  });

  it('5. compareWords identifies missing words and mispronounced words', () => {
    const target = 'Your school bag looks heavy.';
    const spoken = 'your school bag looks'; // missed "heavy"
    const result = compareWords(target, spoken);

    expect(result.length).toBe(5);
    expect(result[0].matched).toBe(true);
    expect(result[1].matched).toBe(true);
    expect(result[2].matched).toBe(true);
    expect(result[3].matched).toBe(true);
    expect(result[4].matched).toBe(false); // "heavy." was not spoken
  });

  it('6. searchCurriculum finds dialogue sentences and challenges', () => {
    // Search for "calculator" (present in Unit 1 dialogue)
    const res = searchCurriculum('calculator');
    const u1Speaking = res.speaking.find((s) => s.unitId === 1);
    expect(u1Speaking).toBeDefined();
    expect(u1Speaking.sentence.toLowerCase()).toContain('calculator');

    // Search for "solar trees" (present in Unit 10 dialogue)
    const res2 = searchCurriculum('solar trees');
    const u10Speaking = res2.speaking.find((s) => s.unitId === 10);
    expect(u10Speaking).toBeDefined();
    expect(u10Speaking.sentence.toLowerCase()).toContain('solar trees');
  });

  it('7. Storage accurately records speaking station stars and progress', () => {
    const memStorage = {};
    const fakeStore = createStore({
      getItem: (k) => memStorage[k] || null,
      setItem: (k, v) => {
        memStorage[k] = v;
      },
      removeItem: (k) => {
        delete memStorage[k];
      },
    });

    fakeStore.recordStationProgress(1, 'speaking', {
      score: 95,
      stars: 3,
      correct: true,
    });

    const prog = fakeStore.getProgress();
    expect(prog.units[1]).toBeDefined();
    expect(prog.units[1].modes.speaking).toBe(3);
  });

  it('8. Role-play logic ensures valid turn partition for Computer and Student in all 12 units', () => {
    units.forEach((summary) => {
      const u = getUnit(summary.unitId);
      const lines = u.speaking.dialogueLines;
      const speakers = [...new Set(lines.map((l) => l.speaker))];
      expect(speakers.length).toBeGreaterThanOrEqual(2);

      // Pick any speaker as student's role
      const studentRole = speakers[0];
      const studentLines = lines.filter((l) => l.speaker === studentRole);
      const computerLines = lines.filter((l) => l.speaker !== studentRole);

      expect(studentLines.length).toBeGreaterThan(0);
      expect(computerLines.length).toBeGreaterThan(0);
      expect(studentLines.length + computerLines.length).toBe(lines.length);
    });
  });
});
