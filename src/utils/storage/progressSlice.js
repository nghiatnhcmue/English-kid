import { updateMastery } from '../mastery.js';
import { isoWeek, localDay } from '../dates.js';
import { scoreTest } from '../testGenerator.js';
import { normUnitId } from '../unitId.js';
import { KEYS, DEFAULT_SETTINGS } from './io.js';

export function createProgressSlice(ctx, api) {
  const { read, write, remove, nsKey, currentId, PER_STUDENT } = ctx;

  return {
    getTestHistory() {
      const list = read(nsKey(KEYS.TESTS), []);
      return Array.isArray(list) ? list : [];
    },

    getMastery() {
      const m = read(nsKey(KEYS.MASTERY), {});
      return m && typeof m === 'object' && !Array.isArray(m) ? m : {};
    },

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

      const history = [entry, ...api.getTestHistory()]
        .slice(0, 200)
        .map((t, i) => (i < 30 || !t.answers ? t : { ...t, answers: undefined }));
      write(nsKey(KEYS.TESTS), history);
      write(nsKey(KEYS.MASTERY), updateMastery(api.getMastery(), answers, entry.isoDate));
      api.markStudyDay(now);
      return entry;
    },

    getProgress() {
      const cur = api.getCurrentStudent();
      if (cur) {
        const map = read(KEYS.STUDENT_PROGRESS, {});
        const stuP = map[cur.id];
        if (stuP && typeof stuP === 'object') {
          return { units: stuP.units ?? {}, studyDays: Array.isArray(stuP.studyDays) ? stuP.studyDays : [] };
        }
        return { units: {}, studyDays: [] };
      }
      const p = read(KEYS.PROGRESS, {});
      return { units: p.units ?? {}, studyDays: Array.isArray(p.studyDays) ? p.studyDays : [] };
    },

    saveModeResult(unitId, mode, stars, now = new Date()) {
      const p = api.getProgress();
      const numUnit = normUnitId(unitId);
      const unit = p.units[numUnit] ?? { modes: {} };
      unit.modes = { ...unit.modes, [mode]: Math.max(unit.modes?.[mode] ?? 0, stars) };
      p.units = { ...p.units, [numUnit]: unit };

      const cur = api.getCurrentStudent();
      if (!cur) write(KEYS.PROGRESS, p);
      if (cur) {
        const map = read(KEYS.STUDENT_PROGRESS, {});
        const stuP = map[cur.id] || { units: {}, studyDays: [] };
        const stuUnit = stuP.units[numUnit] || { modes: {} };
        stuUnit.modes = { ...stuUnit.modes, [mode]: Math.max(stuUnit.modes?.[mode] ?? 0, stars) };
        stuP.units[numUnit] = stuUnit;
        const day = localDay(now);
        if (!stuP.studyDays.includes(day)) {
          stuP.studyDays = [...stuP.studyDays, day].slice(-400);
        }
        map[cur.id] = stuP;
        write(KEYS.STUDENT_PROGRESS, map);
      }

      api.markStudyDay(now);
    },

    markStudyDay(now = new Date()) {
      const day = localDay(now);
      const cur = api.getCurrentStudent();
      if (cur) {
        const map = read(KEYS.STUDENT_PROGRESS, {}) || {};
        const stuP = map[cur.id] || { units: {}, studyDays: [] };
        if (!stuP.studyDays.includes(day)) {
          stuP.studyDays = [...stuP.studyDays, day].slice(-400);
          map[cur.id] = stuP;
          write(KEYS.STUDENT_PROGRESS, map);
        }
        return;
      }
      const p = api.getProgress();
      if (!p.studyDays.includes(day)) {
        p.studyDays = [...p.studyDays, day].slice(-400);
        write(KEYS.PROGRESS, p);
      }
    },

    getStudentProgress(studentId) {
      const targetId = studentId || api.getCurrentStudent()?.id;
      if (!targetId) return api.getProgress();
      const map = read(KEYS.STUDENT_PROGRESS, {});
      const p = map[targetId] || { units: {}, studyDays: [] };
      return { units: p.units ?? {}, studyDays: Array.isArray(p.studyDays) ? p.studyDays : [] };
    },

    getAllStudentsProgress() {
      return read(KEYS.STUDENT_PROGRESS, {});
    },

    recordStationProgress(unitId, stationKey, data = {}) {
      const student = api.getCurrentStudent();
      const now = new Date();
      const numUnit = normUnitId(unitId);
      const stars = Number(data.stars ?? (data.correct ? 3 : 1));

      api.saveModeResult(numUnit, stationKey, stars, now);

      if (student && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('station-progress', { detail: { unitId: numUnit, stationKey, stars, data } }),
        );
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
      const id = currentId();
      if (id) {
        PER_STUDENT.forEach((b) => remove(`${b}__${id}`));
        const map = read(KEYS.STUDENT_PROGRESS, {}) || {};
        delete map[id];
        write(KEYS.STUDENT_PROGRESS, map);
        remove(KEYS.SETTINGS);
        return;
      }
      [KEYS.TESTS, KEYS.MASTERY, KEYS.PROGRESS, KEYS.SETTINGS, KEYS.STUDENT, KEYS.ASSIGNMENT_SUBMISSIONS].forEach(
        remove,
      );
    },
  };
}

const sum = (obj) => Object.values(obj ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);

/** Sao của các chế độ ôn trong một Unit (tối đa 12). */
export const modeStarsOf = (unitProgress) => sum(unitProgress?.modes);
/** Giữ lại để tương thích an toàn nếu có module gọi tới. */
export const stageStarsOf = () => 0;
/** Tổng sao toàn bộ app theo các Unit. */
export const totalStarsOf = (progress) =>
  Object.values(progress?.units ?? {}).reduce((acc, u) => acc + modeStarsOf(u), 0);
