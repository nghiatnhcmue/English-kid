import { KEYS, DEFAULT_STUDENTS, PREFIX, IS_DEV, randomPin } from './io.js';

export function createStudentSlice(ctx, api) {
  const { read, write, remove, migrateOnce, PER_STUDENT } = ctx;

  return {
    getStudents() {
      const list = read(KEYS.STUDENTS, null);
      if (Array.isArray(list)) return list;
      if (!IS_DEV) return [];
      const demo = DEFAULT_STUDENTS.map((st) => ({ ...st, demo: true }));
      write(KEYS.STUDENTS, demo);
      return demo;
    },

    getCurrentStudent() {
      const curId = read(KEYS.CURRENT_STUDENT_ID, null);
      if (!curId) return null;
      const all = api.getStudents();
      return all.find((s) => s.id === curId) || null;
    },

    setCurrentStudent(studentId) {
      if (!studentId) {
        write(KEYS.CURRENT_STUDENT_ID, null);
        return null;
      }
      const all = api.getStudents();
      const found = all.find((s) => s.id === studentId);
      if (found) {
        migrateOnce(found.id);
        write(KEYS.CURRENT_STUDENT_ID, found.id);
        write(KEYS.STUDENT, { name: found.name, class: found.class, avatar: found.avatar });
        return found;
      }
      return null;
    },

    loginStudent(identifier, password = '') {
      const all = api.getStudents();
      const cleanId = String(identifier || '').trim().toLowerCase();
      const found = all.find(
        (s) => s.id === identifier || (s.username && s.username.toLowerCase() === cleanId),
      );
      if (!found) {
        return { success: false, error: 'Không tìm thấy tài khoản học sinh này.' };
      }
      if (!found.password) {
        return { success: false, error: 'Máy này chưa lưu mã PIN của em. Em cần có mạng để đăng nhập.' };
      }
      if (String(found.password).trim() !== String(password || '').trim()) {
        return { success: false, error: 'Mã PIN chưa đúng. Hãy hỏi lại thầy cô nhé!' };
      }
      api.setCurrentStudent(found.id);
      return { success: true, student: found };
    },

    logoutStudent() {
      write(KEYS.CURRENT_STUDENT_ID, null);
      write(KEYS.STUDENT, { name: '', class: '', avatar: '👤' });
    },

    saveStudent(student) {
      const all = api.getStudents();
      const id = student.id || `stu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const clean = {
        id,
        username: String(student.username || id).trim().toLowerCase(),
        name: String(student.name || 'Học sinh').trim(),
        class: String(student.class || '6A1').trim(),
        password: String(student.password || '').trim() || randomPin(),
        avatar: String(student.avatar || '🦁'),
        createdAt: student.createdAt || new Date().toISOString(),
      };
      const idx = all.findIndex((s) => s.id === id);
      let updated;
      if (idx >= 0) {
        updated = [...all];
        updated[idx] = { ...updated[idx], ...clean };
      } else {
        updated = [...all, clean];
      }
      write(KEYS.STUDENTS, updated);
      if (api.getCurrentStudent()?.id === id) {
        api.setCurrentStudent(id);
      }
      return clean;
    },

    deleteStudent(studentId) {
      const all = api.getStudents();
      const next = all.filter((s) => s.id !== studentId);
      write(KEYS.STUDENTS, next);
      for (const base of PER_STUDENT) {
        remove(`${base}__${studentId}`);
      }
      const map = read(KEYS.STUDENT_PROGRESS, {}) || {};
      if (map[studentId]) {
        delete map[studentId];
        write(KEYS.STUDENT_PROGRESS, map);
      }
      if (read(KEYS.CURRENT_STUDENT_ID, null) === studentId) {
        api.logoutStudent();
      }
      return true;
    },

    batchImportStudents(nameListText, className = '6A1', defaultPassword = '123') {
      const lines = String(nameListText || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return [];
      const avatars = ['🦁', '🦊', '🐱', '🐼', '🚀', '🦄', '⚽', '🎨', '📚', '🎒', '⭐', '🐬'];
      const added = [];
      const taken = new Set(api.getStudents().map((x) => String(x.username || '').toLowerCase()));
      lines.forEach((name, idx) => {
        const cleanName = name.replace(/^\d+[\.\-\s]+/, '').trim();
        if (!cleanName) return;
        const slug = cleanName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');
        const base = `${slug || 'hs'}${String(className).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        let username = base;
        for (let n = 2; taken.has(username); n++) username = `${base}${n}`;
        taken.add(username);
        added.push({
          id: `stu_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
          username,
          name: cleanName,
          class: className,
          password: /^\d{4,8}$/.test(String(defaultPassword || '')) ? String(defaultPassword) : randomPin(),
          avatar: avatars[idx % avatars.length],
          createdAt: new Date().toISOString(),
        });
      });
      const all = api.getStudents();
      write(KEYS.STUDENTS, [...all, ...added]);
      return added;
    },

    getStudentInfo() {
      const cur = api.getCurrentStudent();
      if (cur) {
        return { id: cur.id, name: cur.name, class: cur.class, avatar: cur.avatar };
      }
      const info = read(KEYS.STUDENT, { name: '', class: '', avatar: '👤' });
      return info && typeof info === 'object' ? info : { name: '', class: '', avatar: '👤' };
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

    getTeacherSession() {
      const session = read(KEYS.TEACHER_SESSION, null);
      const token = read(`${PREFIX}teacher_token`, null);
      return session && typeof session === 'object' && session.username && token ? session : null;
    },

    setTeacherSession(session) {
      write(KEYS.TEACHER_SESSION, session);
    },

    clearTeacherSession() {
      write(KEYS.TEACHER_SESSION, null);
    },

    mergeRoster(list = []) {
      if (!Array.isArray(list) || !list.length) return api.getStudents();
      const cur = read(KEYS.STUDENTS, []) || [];
      const byId = new Map(cur.filter((x) => !x.demo).map((x) => [x.id, x]));
      for (const st of list) {
        if (!st?.id) continue;
        byId.set(st.id, {
          ...(byId.get(st.id) || {}),
          id: st.id,
          username: st.username,
          name: st.name,
          class: st.class,
          avatar: st.avatar,
        });
      }
      const next = [...byId.values()];
      write(KEYS.STUDENTS, next);
      return next;
    },
  };
}
