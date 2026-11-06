import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from './storage.js';
import { listUnits, getUnit } from './data.js';

describe('Custom Units management', () => {
  let fakeStorage;
  let customStore;

  beforeEach(() => {
    const memory = {};
    fakeStorage = {
      getItem: (key) => memory[key] ?? null,
      setItem: (key, val) => { memory[key] = String(val); },
      removeItem: (key) => { delete memory[key]; },
      clear: () => { Object.keys(memory).forEach((k) => delete memory[k]); },
    };
    customStore = createStore(fakeStorage);
  });

  it('can create a new custom unit and retrieve it', () => {
    const created = customStore.saveCreatedUnit({
      unitId: 13,
      titleEn: 'Robots in the Future',
      titleVi: 'Robot trong tương lai',
      topic: 'Technology',
      emoji: '🤖',
      color: '#8EC5FF',
      description: 'Học về các loại robot và tương lai.',
    });

    expect(created.unitId).toBe(13);
    expect(created.titleEn).toBe('Robots in the Future');

    const allCreated = customStore.getCreatedUnits();
    expect(allCreated).toHaveLength(1);
    expect(allCreated[0].unitId).toBe(13);

    // Initial content template is initialized
    const customContent = customStore.getCustomUnit(13);
    expect(customContent).toBeDefined();
    expect(customContent.vocabularies).toEqual([]);
    expect(customContent.videos).toEqual([]);
  });

  it('can update an existing custom unit', () => {
    customStore.saveCreatedUnit({
      unitId: 13,
      titleEn: 'Robots in the Future',
      titleVi: 'Robot trong tương lai',
      emoji: '🤖',
    });

    customStore.saveCreatedUnit({
      unitId: 13,
      titleEn: 'Advanced AI and Robots',
      titleVi: 'Trí tuệ nhân tạo và Robot',
      emoji: '🦾',
    });

    const all = customStore.getCreatedUnits();
    expect(all).toHaveLength(1);
    expect(all[0].titleEn).toBe('Advanced AI and Robots');
    expect(all[0].emoji).toBe('🦾');
  });

  it('can delete a custom unit', () => {
    customStore.saveCreatedUnit({
      unitId: 13,
      titleEn: 'Robots',
      titleVi: 'Người máy',
    });

    expect(customStore.getCreatedUnits()).toHaveLength(1);

    customStore.deleteCreatedUnit(13);
    expect(customStore.getCreatedUnits()).toHaveLength(0);
    expect(customStore.getCustomUnit(13)).toBeNull();
  });

  it('can manage reading passage and comprehension questions', () => {
    // 1. Save passage
    const updated = customStore.saveUnitReadingPassage(1, {
      title: 'A Day at School',
      passage: 'Mai goes to school by bicycle every morning.',
      translation: 'Mai đến trường bằng xe đạp vào mỗi buổi sáng.',
    });
    expect(updated.title).toBe('A Day at School');
    expect(updated.passage).toContain('bicycle');

    // 2. Add question
    customStore.saveReadingQuestion(1, {
      question: 'How does Mai go to school?',
      options: ['By bus', 'By bicycle', 'On foot'],
      answerIndex: 1,
      explain: 'Based on: Mai goes to school by bicycle',
    });

    const reading = customStore.getUnitReading(1);
    expect(reading.questions).toHaveLength(1);
    expect(reading.questions[0].question).toBe('How does Mai go to school?');
    expect(reading.questions[0].answerIndex).toBe(1);

    // 3. Edit question
    customStore.saveReadingQuestion(1, {
      question: 'How does Mai travel to school?',
      options: ['By bus', 'By bicycle', 'On foot'],
      answerIndex: 1,
    }, 0);

    const edited = customStore.getUnitReading(1);
    expect(edited.questions[0].question).toBe('How does Mai travel to school?');

    // 4. Batch add questions
    customStore.batchAddReadingQuestions(1, [
      {
        question: 'When does Mai go to school?',
        options: ['Every morning', 'Every evening'],
        answerIndex: 0,
      },
    ]);

    const batch = customStore.getUnitReading(1);
    expect(batch.questions).toHaveLength(2);

    // 5. Delete question
    customStore.deleteReadingQuestion(1, 0);
    const afterDelete = customStore.getUnitReading(1);
    expect(afterDelete.questions).toHaveLength(1);
    expect(afterDelete.questions[0].question).toBe('When does Mai go to school?');
  });
});
