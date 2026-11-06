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
});
