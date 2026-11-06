import { updateMastery } from './mastery.js';
import { isoWeek, localDay } from './dates.js';
import { scoreTest } from './testGenerator.js';

const PREFIX = 'app_tienganh_v1_';
export const KEYS = {
  TESTS: `${PREFIX}weekly_records`,
  MASTERY: `${PREFIX}word_mastery`,
  PROGRESS: `${PREFIX}progress`,
  SETTINGS: `${PREFIX}settings`,
  STUDENT: `${PREFIX}student_info`,
  TEACHER_PIN: `${PREFIX}teacher_pin`,
};

export const DEFAULT_SETTINGS = { lang: 'en-GB', rate: 0.85, sound: true };

/** Tạo kho lưu trữ; storage có thể thay bằng bản giả khi test. */
export function createStore(storage = globalThis.localStorage) {
  const read = (key, fallback) => {
    try {
      const raw = storage?.getItem(key);
      if (raw == null) return fallback;
      const value = JSON.parse(raw);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      storage?.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };

  const api = {
    getStudentInfo() {
      const info = read(KEYS.STUDENT, { name: '', class: '' });
      return info && typeof info === 'object' ? info : { name: '', class: '' };
    },
    saveStudentInfo({ name = '', class: className = '' }) {
      const clean = { name: String(name).trim(), class: String(className).trim() };
      write(KEYS.STUDENT, clean);
      return clean;
    },

    getTeacherPin() {
      const pin = read(KEYS.TEACHER_PIN, '1234');
      return String(pin || '1234');
    },
    saveTeacherPin(pin) {
      const clean = String(pin || '1234').trim();
      write(KEYS.TEACHER_PIN, clean);
      return clean;
    },

    getTestHistory() {
      const list = read(KEYS.TESTS, []);
      return Array.isArray(list) ? list : [];
    },
    getMastery() {
      const m = read(KEYS.MASTERY, {});
      return m && typeof m === 'object' && !Array.isArray(m) ? m : {};
    },
    /** answers: [{ questionId, wordId, type, correct }] */
    saveTestResult({ unitIds, answers, now = new Date(), studentName, studentClass }) {
      const correct = answers.filter((a) => a.correct).length;
      const total = answers.length;
      const { score, stars } = scoreTest(correct, total);
      const student = api.getStudentInfo();

      const entry = {
        id: `t_${now.getTime()}`,
        isoDate: now.toISOString(),
        week: isoWeek(now),
        unitIds,
        correct,
        total,
        score,
        stars,
        answers,
        studentName: studentName || student.name || 'Học sinh',
        studentClass: studentClass || student.class || '6',
      };

      write(KEYS.TESTS, [entry, ...api.getTestHistory()]);
      write(KEYS.MASTERY, updateMastery(api.getMastery(), answers, entry.isoDate));
      api.markStudyDay(now);
      return entry;
    },

    getProgress() {
      const p = read(KEYS.PROGRESS, {});
      return { units: p.units ?? {}, studyDays: Array.isArray(p.studyDays) ? p.studyDays : [] };
    },
    /** Lưu số sao tốt nhất của một chế độ ôn trong Unit. */
    saveModeResult(unitId, mode, stars, now = new Date()) {
      const p = api.getProgress();
      const unit = p.units[unitId] ?? { modes: {} };
      unit.modes = { ...unit.modes, [mode]: Math.max(unit.modes?.[mode] ?? 0, stars) };
      p.units = { ...p.units, [unitId]: unit };
      write(KEYS.PROGRESS, p);
      api.markStudyDay(now);
    },
    markStudyDay(now = new Date()) {
      const p = api.getProgress();
      const day = localDay(now);
      if (!p.studyDays.includes(day)) {
        p.studyDays = [...p.studyDays, day].slice(-400);
        write(KEYS.PROGRESS, p);
      }
    },

    getSettings() {
      return { ...DEFAULT_SETTINGS, ...read(KEYS.SETTINGS, {}) };
    },
    saveSettings(patch) {
      const next = { ...api.getSettings(), ...patch };
      write(KEYS.SETTINGS, next);
      return next;
    },

    clearAll() {
      Object.values(KEYS).forEach((k) => {
        try {
          storage?.removeItem(k);
        } catch {
          /* bỏ qua */
        }
      });
    },
  };
  return api;
}

let defaultStore;
export function store() {
  if (!defaultStore) {
    let storage;
    try {
      storage = globalThis.localStorage;
    } catch {
      storage = undefined; // trình duyệt chặn localStorage
    }
    defaultStore = createStore(storage);
  }
  return defaultStore;
}
