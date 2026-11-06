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
  CUSTOM_UNITS: `${PREFIX}custom_units`,
  ASSIGNMENTS: `${PREFIX}assignments`,
  ASSIGNMENT_SUBMISSIONS: `${PREFIX}assignment_submissions`,
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
      const info = read(KEYS.STUDENT, { name: '', class: '', avatar: '🦊' });
      return info && typeof info === 'object' ? info : { name: '', class: '', avatar: '🦊' };
    },
    saveStudentInfo({ name = '', class: className = '', avatar = '🦊' }) {
      const clean = {
        name: String(name).trim(),
        class: String(className).trim(),
        avatar: String(avatar || '🦊'),
      };
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
    /** Lưu số sao tốt nhất của một thử thách trên Sân khấu 3D (tách riêng khỏi modes). */
    saveStageResult(unitId, sceneId, challengeId, stars, now = new Date()) {
      const p = api.getProgress();
      const unit = p.units[unitId] ?? { modes: {} };
      const key = `${sceneId}:${challengeId}`;
      unit.stage = { ...unit.stage, [key]: Math.max(unit.stage?.[key] ?? 0, stars) };
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

    // ---- Dữ liệu bài học tùy biến của Giáo viên (Custom Units) ----
    getCustomUnits() {
      const units = read(KEYS.CUSTOM_UNITS, {});
      return units && typeof units === 'object' && !Array.isArray(units) ? units : {};
    },
    getCustomUnit(unitId) {
      const all = api.getCustomUnits();
      return all[Number(unitId)] || null;
    },
    saveCustomUnit(unitId, data) {
      const all = api.getCustomUnits();
      const numId = Number(unitId);
      all[numId] = { ...(all[numId] || {}), ...data };
      write(KEYS.CUSTOM_UNITS, all);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculum-updated', { detail: { unitId: numId } }));
      }
      return all[numId];
    },
    resetUnit(unitId) {
      const all = api.getCustomUnits();
      const numId = Number(unitId);
      delete all[numId];
      write(KEYS.CUSTOM_UNITS, all);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculum-updated', { detail: { unitId: numId } }));
      }
      return true;
    },
    resetAllUnits() {
      write(KEYS.CUSTOM_UNITS, {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculum-updated', { detail: { all: true } }));
      }
      return true;
    },

    // ---- Quản lý Giao bài tập theo tuần (Assignments) ----
    getAssignments() {
      const list = read(KEYS.ASSIGNMENTS, []);
      return Array.isArray(list) ? list : [];
    },
    getAssignmentById(idOrCode) {
      if (!idOrCode) return null;
      const clean = String(idOrCode).trim().toLowerCase();
      const list = api.getAssignments();
      return (
        list.find(
          (a) =>
            String(a.id).toLowerCase() === clean ||
            String(a.code).toLowerCase() === clean
        ) || null
      );
    },
    saveAssignment(assignment) {
      const list = api.getAssignments();
      const now = new Date();
      const id = assignment.id || `assign_${now.getTime()}`;
      const code =
        assignment.code ||
        `TA6-W${String(assignment.week || 1).padStart(2, '0')}-${Math.floor(
          100 + Math.random() * 900
        )}`;
      const entry = {
        id,
        code,
        createdAt: assignment.createdAt || now.toISOString(),
        updatedAt: now.toISOString(),
        title: assignment.title || `Bài tập Tuần ${assignment.week || 1}`,
        week: Number(assignment.week) || 1,
        targetClass: assignment.targetClass || 'all',
        scopeType: assignment.scopeType || 'full_unit', // 'full_unit' | 'skill' | 'custom_words' | 'custom_questions'
        unitId: Number(assignment.unitId) || 1,
        selectedSkill: assignment.selectedSkill || 'all', // 'vocab' | 'pronunciation' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mastery'
        selectedWordIds: Array.isArray(assignment.selectedWordIds)
          ? assignment.selectedWordIds
          : [],
        selectedQuestions: Array.isArray(assignment.selectedQuestions)
          ? assignment.selectedQuestions
          : [],
        deadline: assignment.deadline || '',
        note: assignment.note || '',
        status: assignment.status || 'active',
      };

      const existingIdx = list.findIndex((a) => a.id === id);
      let nextList;
      if (existingIdx >= 0) {
        nextList = [...list];
        nextList[existingIdx] = entry;
      } else {
        nextList = [entry, ...list];
      }
      write(KEYS.ASSIGNMENTS, nextList);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('assignment-updated', { detail: { id } })
        );
      }
      return entry;
    },
    deleteAssignment(id) {
      const list = api
        .getAssignments()
        .filter((a) => a.id !== id && a.code !== id);
      write(KEYS.ASSIGNMENTS, list);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('assignment-updated', { detail: { id, deleted: true } })
        );
      }
      return true;
    },

    // ---- Lịch sử nộp bài tập của học sinh (Assignment Submissions) ----
    getAssignmentSubmissions(assignmentId) {
      const all = read(KEYS.ASSIGNMENT_SUBMISSIONS, []);
      if (!Array.isArray(all)) return [];
      if (!assignmentId) return all;
      return all.filter(
        (s) => s.assignmentId === assignmentId || s.assignmentCode === assignmentId
      );
    },
    submitAssignment(assignmentId, submission = {}) {
      const all = api.getAssignmentSubmissions();
      const student = api.getStudentInfo();
      const now = new Date();
      const entry = {
        id: `sub_${now.getTime()}_${Math.random().toString(36).substring(2, 6)}`,
        assignmentId,
        assignmentCode: submission.assignmentCode || '',
        studentName: submission.studentName || student.name || 'Học sinh',
        studentClass: submission.studentClass || student.class || '6',
        submittedAt: now.toISOString(),
        score: submission.score ?? 10,
        stars: submission.stars ?? 3,
        total: submission.total ?? 10,
        correct: submission.correct ?? 10,
        detail: submission.detail || null,
      };
      write(KEYS.ASSIGNMENT_SUBMISSIONS, [entry, ...all]);
      return entry;
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

const sum = (obj) => Object.values(obj ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);

/** Sao của 4 chế độ ôn trong một Unit (tối đa 12). */
export const modeStarsOf = (unitProgress) => sum(unitProgress?.modes);
/** Sao từ các thử thách Sân khấu 3D của một Unit. */
export const stageStarsOf = (unitProgress) => sum(unitProgress?.stage);
/** Tổng sao toàn bộ app (chế độ ôn + sân khấu). */
export const totalStarsOf = (progress) =>
  Object.values(progress?.units ?? {}).reduce((acc, u) => acc + modeStarsOf(u) + stageStarsOf(u), 0);

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
