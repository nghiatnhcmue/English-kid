import { normUnitId } from '../unitId.js';
import { KEYS } from './io.js';

export function createAssignmentSlice(ctx, api) {
  const { read, write, currentId, nsKey, collectAll } = ctx;

  return {
    getAssignments() {
      const list = read(KEYS.ASSIGNMENTS, []);
      return Array.isArray(list) ? list : [];
    },

    getAssignmentById(idOrCode) {
      if (!idOrCode) return null;
      const clean = String(idOrCode).trim().toLowerCase();
      return (
        api
          .getAssignments()
          .find(
            (a) =>
              String(a.id).toLowerCase() === clean ||
              String(a.code).toLowerCase() === clean,
          ) || null
      );
    },

    saveAssignment(assignment) {
      const list = api.getAssignments();
      const now = new Date();
      const id = assignment.id || `assign_${now.getTime()}`;
      const code =
        assignment.code ||
        `TA6-W${String(assignment.week || 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
      const entry = {
        id,
        code,
        createdAt: assignment.createdAt || now.toISOString(),
        updatedAt: now.toISOString(),
        title: assignment.title || `Bài tập Tuần ${assignment.week || 1}`,
        week: Number(assignment.week) || 1,
        targetClass: assignment.targetClass || 'all',
        scopeType: assignment.scopeType || 'full_unit',
        unitId:
          assignment.unitId !== undefined && assignment.unitId !== null
            ? normUnitId(assignment.unitId) ?? 1
            : 1,
        passage: assignment.passage || null,
        selectedSkill: assignment.selectedSkill || 'all',
        selectedWordIds: Array.isArray(assignment.selectedWordIds) ? assignment.selectedWordIds : [],
        selectedQuestions: Array.isArray(assignment.selectedQuestions) ? assignment.selectedQuestions : [],
        questions: Array.isArray(assignment.questions) ? assignment.questions : [],
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
        window.dispatchEvent(new CustomEvent('assignment-updated', { detail: { id } }));
      }
      return entry;
    },

    deleteAssignment(id) {
      const list = api.getAssignments().filter((a) => a.id !== id && a.code !== id);
      write(KEYS.ASSIGNMENTS, list);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('assignment-updated', { detail: { id, deleted: true } }));
      }
      return true;
    },

    getAssignmentSubmissions(assignmentId) {
      const all = currentId()
        ? read(nsKey(KEYS.ASSIGNMENT_SUBMISSIONS), [])
        : collectAll(KEYS.ASSIGNMENT_SUBMISSIONS);
      if (!Array.isArray(all)) return [];
      if (!assignmentId) return all;
      return all.filter((s) => s.assignmentId === assignmentId || s.assignmentCode === assignmentId);
    },

    submitAssignment(assignmentId, submission = {}) {
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
      const prev = read(nsKey(KEYS.ASSIGNMENT_SUBMISSIONS), []) || [];
      write(nsKey(KEYS.ASSIGNMENT_SUBMISSIONS), [entry, ...prev].slice(0, 300));
      return entry;
    },
  };
}
