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
  TEACHER_ACCOUNT: `${PREFIX}teacher_account`,
  TEACHER_SESSION: `${PREFIX}teacher_session`,
  CUSTOM_UNITS: `${PREFIX}custom_units`,
  ASSIGNMENTS: `${PREFIX}assignments`,
  ASSIGNMENT_SUBMISSIONS: `${PREFIX}assignment_submissions`,
  STUDENTS: `${PREFIX}students_list`,
  CURRENT_STUDENT_ID: `${PREFIX}current_student_id`,
  STUDENT_PROGRESS: `${PREFIX}student_progress_map`,
  CUSTOM_QUESTIONS: `${PREFIX}custom_questions`,
  CREATED_UNITS: `${PREFIX}created_units`,
};

export const DEFAULT_STUDENTS = [
  { id: 'stu_1', username: 'an6a1', name: 'Nguyễn Văn An', class: '6A1', password: '123', avatar: '🦁' },
  { id: 'stu_2', username: 'binh6a1', name: 'Trần Thị Bình', class: '6A1', password: '123', avatar: '🦊' },
  { id: 'stu_3', username: 'duy6a1', name: 'Lê Hoàng Duy', class: '6A1', password: '123', avatar: '🐱' },
  { id: 'stu_4', username: 'chi6a1', name: 'Phạm Quỳnh Chi', class: '6A1', password: '123', avatar: '🐼' },
  { id: 'stu_5', username: 'huy6a1', name: 'Đỗ Gia Huy', class: '6A1', password: '123', avatar: '🚀' },
  { id: 'stu_6', username: 'linh6a1', name: 'Hoàng Mai Linh', class: '6A1', password: '123', avatar: '🦄' },
  { id: 'stu_7', username: 'nam6a1', name: 'Vũ Minh Nam', class: '6A1', password: '123', avatar: '⚽' },
  { id: 'stu_8', username: 'nhi6a1', name: 'Bùi Yến Nhi', class: '6A1', password: '123', avatar: '🎨' },
  { id: 'stu_9', username: 'phong6a1', name: 'Đinh Quốc Phong', class: '6A1', password: '123', avatar: '📚' },
  { id: 'stu_10', username: 'tu6a1', name: 'Trịnh Cẩm Tú', class: '6A1', password: '123', avatar: '🎒' },
];

export const DEFAULT_SETTINGS = { lang: 'en-GB', rate: 0.85, sound: true };

// Ghi chú: KHÔNG còn tài khoản giáo viên mặc định trên máy. Đăng nhập giáo viên do máy chủ kiểm tra (src/utils/api.js).

// Lớp đồng bộ đăng ký để biết khi nào nội dung giáo viên thay đổi trên máy.
const writeListeners = new Set();
export function onStoreWrite(fn) {
  writeListeners.add(fn);
  return () => writeListeners.delete(fn);
}
const IS_DEV = (() => {
  try {
    return !!import.meta.env?.DEV;
  } catch {
    return false;
  }
})();

/** Tạo kho lưu trữ; storage có thể thay bằng bản giả khi test. */
export function randomPin() {
  const a = new Uint32Array(1);
  (globalThis.crypto || { getRandomValues: (x) => ((x[0] = Math.floor(Math.random() * 2 ** 32)), x) }).getRandomValues(a);
  return String(1000 + (a[0] % 9000));
}

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
    } catch {
      // Hết dung lượng bộ nhớ trình duyệt (thường do ảnh/âm thanh lớn): báo cho giao diện thay vì im lặng
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('storage-write-failed', { detail: { key } }));
      return false;
    }
    writeListeners.forEach((fn) => {
      try {
        fn(key);
      } catch {
        /* bỏ qua */
      }
    });
    return true;
  };

  // Dữ liệu học của TỪNG em (máy dùng chung trong lớp): điểm test, từ đã thuộc, bài nộp
  // lưu theo khóa riêng `<khóa>__<mã học sinh>`. Chưa đăng nhập thì dùng khóa chung (khách).
  const PER_STUDENT = [KEYS.TESTS, KEYS.MASTERY, KEYS.ASSIGNMENT_SUBMISSIONS];
  const currentId = () => read(KEYS.CURRENT_STUDENT_ID, null);
  const nsKey = (base) => {
    const id = currentId();
    return id ? `${base}__${id}` : base;
  };
  /** Lần đầu tách dữ liệu: dữ liệu chung cũ trên máy được giao cho em đăng nhập đầu tiên (chỉ 1 lần). */
  const migrateOnce = (id) => {
    const flag = `${PREFIX}per_student_migrated`;
    if (!id || read(flag, false)) return;
    for (const base of PER_STUDENT) {
      const own = `${base}__${id}`;
      if (storage?.getItem(own) == null && storage?.getItem(base) != null) write(own, read(base, null));
    }
    const map = read(KEYS.STUDENT_PROGRESS, {}) || {};
    const legacy = read(KEYS.PROGRESS, null);
    if (!map[id] && legacy?.units) {
      map[id] = { units: legacy.units, studyDays: Array.isArray(legacy.studyDays) ? legacy.studyDays : [] };
      write(KEYS.STUDENT_PROGRESS, map);
    }
    write(flag, true);
  };

  const collectAll = (base) => {
    const out = [...(read(base, []) || [])];
    try {
      for (let i = 0; i < (storage?.length || 0); i++) {
        const k = storage.key(i);
        if (k && k.startsWith(`${base}__`)) out.push(...(read(k, []) || []));
      }
    } catch {
      /* bỏ qua */
    }
    return out;
  };

  const api = {
    // ---- Quản lý Tài khoản Học sinh ----
    getStudents() {
      const list = read(KEYS.STUDENTS, null);
      if (Array.isArray(list)) return list;
      // Tài khoản mẫu chỉ dùng khi chạy thử (npm run dev), không tự tạo trên bản thật
      if (!IS_DEV) return [];
      const demo = DEFAULT_STUDENTS.map((st) => ({ ...st, demo: true }));
      write(KEYS.STUDENTS, demo);
      return demo;
    },

    getCurrentStudent() {
      const curId = read(KEYS.CURRENT_STUDENT_ID, null);
      if (!curId) return null;
      const all = api.getStudents();
      const found = all.find((s) => s.id === curId);
      return found || null;
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
        (s) =>
          s.id === identifier ||
          (s.username && s.username.toLowerCase() === cleanId)
      );
      if (!found) {
        return { success: false, error: 'Không tìm thấy tài khoản học sinh này.' };
      }
      // Đăng nhập trên máy (chỉ dùng khi không kết nối được máy chủ): bắt buộc có mã đã lưu trên máy này
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
      // Dọn dữ liệu học của em đó trên máy này
      for (const base of PER_STUDENT) {
        try {
          storage?.removeItem(`${base}__${studentId}`);
        } catch {
          /* bỏ qua */
        }
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
      const lines = String(nameListText || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
        // Tên đăng nhập không được trùng với bạn đã có (kể cả khi nhập nhiều đợt cho cùng lớp)
        const base = `${slug || 'hs'}${String(className).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        let username = base;
        for (let n = 2; taken.has(username); n++) username = `${base}${n}`;
        taken.add(username);
        const newStu = {
          id: `stu_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
          username,
          name: cleanName,
          class: className,
          // Mỗi em một mã PIN 4 số ngẫu nhiên (trừ khi thầy cô nhập một mã chung)
          password: /^\d{4,8}$/.test(String(defaultPassword || '')) ? String(defaultPassword) : randomPin(),
          avatar: avatars[idx % avatars.length],
          createdAt: new Date().toISOString(),
        };
        added.push(newStu);
      });
      const all = api.getStudents();
      const combined = [...all, ...added];
      write(KEYS.STUDENTS, combined);
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

    // ---- Phiên giáo viên (máy chủ cấp token; ở đây chỉ nhớ thông tin hiển thị) ----
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

    // ---- Đọc/ghi thô cho lớp đồng bộ ----
    readRaw(key) {
      return read(key, null);
    },
    writeRaw(key, value) {
      return write(key, value);
    },

    /** Gộp danh sách học sinh từ máy chủ (không có PIN) vào danh sách trên máy. */
    mergeRoster(list = []) {
      if (!Array.isArray(list) || !list.length) return api.getStudents();
      const cur = read(KEYS.STUDENTS, []) || [];
      const byId = new Map(cur.filter((x) => !x.demo).map((x) => [x.id, x]));
      for (const st of list) {
        if (!st?.id) continue;
        byId.set(st.id, { ...(byId.get(st.id) || {}), id: st.id, username: st.username, name: st.name, class: st.class, avatar: st.avatar });
      }
      const next = [...byId.values()];
      write(KEYS.STUDENTS, next);
      return next;
    },

    getTestHistory() {
      const list = read(nsKey(KEYS.TESTS), []);
      return Array.isArray(list) ? list : [];
    },
    getMastery() {
      const m = read(nsKey(KEYS.MASTERY), {});
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

      // Giới hạn lịch sử để không đầy bộ nhớ trình duyệt: giữ 200 bài, chỉ 30 bài mới nhất còn chi tiết từng câu
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
        return { units: {}, studyDays: [] }; // em mới: không lấy tiến độ của bạn khác trên cùng máy
      }
      const p = read(KEYS.PROGRESS, {});
      return { units: p.units ?? {}, studyDays: Array.isArray(p.studyDays) ? p.studyDays : [] };
    },
    /** Lưu số sao tốt nhất của một chế độ ôn trong Unit. */
    saveModeResult(unitId, mode, stars, now = new Date()) {
      const p = api.getProgress();
      const numUnit = Number(unitId);
      const unit = p.units[numUnit] ?? { modes: {} };
      unit.modes = { ...unit.modes, [mode]: Math.max(unit.modes?.[mode] ?? 0, stars) };
      p.units = { ...p.units, [numUnit]: unit };

      // Đang đăng nhập: chỉ ghi vào tiến độ của em đó (không ghi vào tiến độ chung của máy)
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
      const numUnit = Number(unitId);
      const stars = Number(data.stars ?? (data.correct ? 3 : 1));

      // 1. Cập nhật tiến độ
      api.saveModeResult(numUnit, stationKey, stars, now);

      // 2. Báo cho lớp đồng bộ (api.js) gửi lên máy chủ – có hàng đợi khi mất mạng
      if (student && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('station-progress', { detail: { unitId: numUnit, stationKey, stars, data } }));
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

    // ---- Quản lý Thêm/Sửa/Xóa Unit mới do Giáo viên tạo ----
    getCreatedUnits() {
      const list = read(KEYS.CREATED_UNITS, []);
      return Array.isArray(list) ? list : [];
    },
    saveCreatedUnit(unitMeta, initialData = {}) {
      const all = api.getCreatedUnits();
      const numId = Number(unitMeta.unitId);
      const cleanMeta = {
        unitId: numId,
        titleEn: String(unitMeta.titleEn || unitMeta.title || `Unit ${numId}`).trim(),
        title: String(unitMeta.titleEn || unitMeta.title || `Unit ${numId}`).trim(),
        titleVi: String(unitMeta.titleVi || '').trim(),
        topic: String(unitMeta.topic || 'Bài học tự chọn').trim(),
        emoji: String(unitMeta.emoji || '📘').trim(),
        color: String(unitMeta.color || '#FFC83D').trim(),
        description: String(unitMeta.description || 'Bài học bổ trợ do thầy cô biên soạn.').trim(),
        available: true,
        isCustomUnit: true,
        bookVolume: Number(unitMeta.bookVolume) || 2,
        bookPages: String(unitMeta.bookPages || 'Tự chọn').trim(),
        createdAt: unitMeta.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = all.findIndex((u) => u.unitId === numId);
      let updated;
      if (existingIndex >= 0) {
        updated = [...all];
        updated[existingIndex] = { ...updated[existingIndex], ...cleanMeta };
      } else {
        updated = [...all, cleanMeta];
      }
      write(KEYS.CREATED_UNITS, updated);

      // Đồng thời khởi tạo dữ liệu nội dung trong CUSTOM_UNITS nếu chưa có
      const currentCustom = api.getCustomUnit(numId) || {};
      api.saveCustomUnit(numId, {
        unitId: numId,
        title: cleanMeta.titleEn,
        titleVi: cleanMeta.titleVi,
        vocabularies: currentCustom.vocabularies || initialData.vocabularies || [],
        grammar: currentCustom.grammar || initialData.grammar || { points: [], quiz: [] },
        pronunciation: currentCustom.pronunciation || initialData.pronunciation || { sounds: [], explanation: '' },
        listenPractice: currentCustom.listenPractice || initialData.listenPractice || { questions: [] },
        reading: currentCustom.reading || initialData.reading || { passage: '', translation: '', questions: [] },
        writing: currentCustom.writing || initialData.writing || { task: '', guide: '', hints: [] },
        videos: currentCustom.videos || initialData.videos || [],
        isCustomUnit: true,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculum-updated', { detail: { unitId: numId } }));
      }
      return cleanMeta;
    },
    deleteCreatedUnit(unitId) {
      const numId = Number(unitId);
      const all = api.getCreatedUnits();
      const updated = all.filter((u) => u.unitId !== numId);
      write(KEYS.CREATED_UNITS, updated);
      api.resetUnit(numId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculum-updated', { detail: { unitId: numId, deleted: true } }));
      }
      return true;
    },

    // ---- Ngân hàng Câu hỏi Trắc nghiệm của Unit ----
    getUnitQuestions(unitId, baseQuiz = []) {
      const customUnit = api.getCustomUnit(unitId);
      if (customUnit?.grammar?.quiz && Array.isArray(customUnit.grammar.quiz)) {
        return customUnit.grammar.quiz;
      }
      return Array.isArray(baseQuiz) ? baseQuiz : [];
    },
    saveUnitQuestion(unitId, questionData, indexToUpdate = -1, baseQuiz = []) {
      const currentList = [...api.getUnitQuestions(unitId, baseQuiz)];
      const cleanQ = {
        question: questionData.question.trim(),
        options: Array.isArray(questionData.options)
          ? questionData.options.map((o) => String(o).trim())
          : [],
        answerIndex: Number(questionData.answerIndex) || 0,
        explain: questionData.explain
          ? String(questionData.explain).trim()
          : 'Áp dụng quy tắc ngữ pháp bài học.',
        isCustom: true,
      };
      if (indexToUpdate >= 0 && indexToUpdate < currentList.length) {
        currentList[indexToUpdate] = cleanQ;
      } else {
        currentList.push(cleanQ);
      }
      const customUnit = api.getCustomUnit(unitId) || {};
      const currentGrammar = { ...(customUnit.grammar || {}) };
      currentGrammar.quiz = currentList;
      api.saveCustomUnit(unitId, { grammar: currentGrammar });
      return currentList;
    },
    deleteUnitQuestion(unitId, index, baseQuiz = []) {
      const currentList = [...api.getUnitQuestions(unitId, baseQuiz)];
      if (index >= 0 && index < currentList.length) {
        currentList.splice(index, 1);
        const customUnit = api.getCustomUnit(unitId) || {};
        const currentGrammar = { ...(customUnit.grammar || {}) };
        currentGrammar.quiz = currentList;
        api.saveCustomUnit(unitId, { grammar: currentGrammar });
      }
      return currentList;
    },
    batchAddUnitQuestions(unitId, questionsArray = [], baseQuiz = []) {
      const currentList = [...api.getUnitQuestions(unitId, baseQuiz)];
      const cleaned = (questionsArray || []).map((q) => ({
        question: q.question.trim(),
        options: Array.isArray(q.options)
          ? q.options.map((o) => String(o).trim())
          : [],
        answerIndex: Number(q.answerIndex) || 0,
        explain: q.explain
          ? String(q.explain).trim()
          : 'Áp dụng quy tắc ngữ pháp bài học.',
        isCustom: true,
      }));
      const nextList = [...currentList, ...cleaned];
      const customUnit = api.getCustomUnit(unitId) || {};
      const currentGrammar = { ...(customUnit.grammar || {}) };
      currentGrammar.quiz = nextList;
      api.saveCustomUnit(unitId, { grammar: currentGrammar });
      return nextList;
    },

    // ---- Quản lý Bài đọc hiểu & Câu hỏi Đọc hiểu của Unit ----
    getUnitReading(unitId, baseReading = null) {
      const customUnit = api.getCustomUnit(unitId);
      if (customUnit?.reading) {
        return customUnit.reading;
      }
      return baseReading || { passage: '', questions: [] };
    },
    saveUnitReadingPassage(unitId, passageData, baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const updatedReading = {
        ...currentReading,
        title: passageData.title !== undefined ? String(passageData.title).trim() : currentReading.title,
        passage: String(passageData.passage || '').trim(),
        translation: passageData.translation !== undefined ? String(passageData.translation).trim() : (currentReading.translation || ''),
      };
      api.saveCustomUnit(unitId, { reading: updatedReading });
      return updatedReading;
    },
    saveReadingQuestion(unitId, questionData, indexToUpdate = -1, baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const currentList = Array.isArray(currentReading.questions) ? [...currentReading.questions] : [];
      const qType = questionData.type || 'multiple_choice';
      const cleanQ = {
        id: questionData.id || `rq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: qType,
        question: String(questionData.question || '').trim(),
        prompt: String(questionData.prompt || '').trim(),
        blankWord: String(questionData.blankWord || '').trim(),
        correctSentence: String(questionData.correctSentence || '').trim(),
        correctAnswer: String(questionData.correctAnswer || '').trim(),
        scrambledWords: Array.isArray(questionData.scrambledWords) && questionData.scrambledWords.length > 0
          ? questionData.scrambledWords.map((w) => String(w).trim()).filter(Boolean)
          : (questionData.correctSentence ? String(questionData.correctSentence).trim().split(/\s+/).filter(Boolean) : []),
        options: Array.isArray(questionData.options)
          ? questionData.options.map((o) => String(o).trim()).filter(Boolean)
          : [],
        answerIndex: Number(questionData.answerIndex) || 0,
        explain: questionData.explain
          ? String(questionData.explain).trim()
          : 'Dựa vào thông tin chi tiết trong đoạn văn đọc hiểu.',
        isCustom: true,
      };
      if (indexToUpdate >= 0 && indexToUpdate < currentList.length) {
        currentList[indexToUpdate] = cleanQ;
      } else {
        currentList.push(cleanQ);
      }
      const updatedReading = { ...currentReading, questions: currentList };
      api.saveCustomUnit(unitId, { reading: updatedReading });
      return updatedReading;
    },
    deleteReadingQuestion(unitId, index, baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const currentList = Array.isArray(currentReading.questions) ? [...currentReading.questions] : [];
      if (index >= 0 && index < currentList.length) {
        currentList.splice(index, 1);
        const updatedReading = { ...currentReading, questions: currentList };
        api.saveCustomUnit(unitId, { reading: updatedReading });
        return updatedReading;
      }
      return currentReading;
    },
    batchAddReadingQuestions(unitId, questionsArray = [], baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const currentList = Array.isArray(currentReading.questions) ? [...currentReading.questions] : [];
      const cleaned = (questionsArray || []).map((q) => {
        const qType = q.type || (q.question?.includes('_') ? 'fill_blank' : 'multiple_choice');
        return {
          id: q.id || `rq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: qType,
          question: String(q.question || '').trim(),
          prompt: String(q.prompt || '').trim(),
          blankWord: String(q.blankWord || (q.options ? q.options[q.answerIndex || 0] : '')).trim(),
          correctSentence: String(q.correctSentence || '').trim(),
          correctAnswer: String(q.correctAnswer || '').trim(),
          scrambledWords: Array.isArray(q.scrambledWords) && q.scrambledWords.length > 0
            ? q.scrambledWords.map((w) => String(w).trim()).filter(Boolean)
            : (q.correctSentence ? String(q.correctSentence).trim().split(/\s+/).filter(Boolean) : []),
          options: Array.isArray(q.options)
            ? q.options.map((o) => String(o).trim()).filter(Boolean)
            : [],
          answerIndex: Number(q.answerIndex) || 0,
          explain: q.explain
            ? String(q.explain).trim()
            : 'Dựa vào thông tin chi tiết trong đoạn văn đọc hiểu.',
          isCustom: true,
        };
      });
      const updatedReading = { ...currentReading, questions: [...currentList, ...cleaned] };
      api.saveCustomUnit(unitId, { reading: updatedReading });
      return updatedReading;
    },

    // ---- Quản lý Bài tập Viết câu & Điền khuyết (Writing & Cloze) ----
    getUnitWriting(unitId, baseWriting = null) {
      const customUnit = api.getCustomUnit(unitId);
      if (customUnit?.writing) {
        const raw = customUnit.writing;
        if (Array.isArray(raw.items) && raw.items.length > 0) {
          return raw;
        }
        if (raw.correctSentence) {
          return {
            ...raw,
            items: [
              {
                id: `u${unitId}_write_base`,
                type: raw.type || 'unscramble',
                sentence: raw.correctSentence,
                correctSentence: raw.correctSentence,
                scrambledWords: raw.scrambledWords || raw.correctSentence.split(' '),
                blankWord: raw.blankWord || '',
                options: raw.options || [],
                meaningVi: raw.meaningVi || '',
                hint: raw.hint || '',
              },
            ],
          };
        }
        return raw;
      }
      if (baseWriting?.correctSentence) {
        return {
          ...baseWriting,
          items: [
            {
              id: `u${unitId}_write_base`,
              type: baseWriting.type || 'unscramble',
              sentence: baseWriting.correctSentence,
              correctSentence: baseWriting.correctSentence,
              scrambledWords: baseWriting.scrambledWords || baseWriting.correctSentence.split(' '),
              blankWord: baseWriting.blankWord || '',
              options: baseWriting.options || [],
              meaningVi: baseWriting.meaningVi || '',
              hint: baseWriting.hint || '',
            },
          ],
        };
      }
      return baseWriting || { items: [] };
    },
    saveWritingItem(unitId, itemData, indexToUpdate = -1, baseWriting = null) {
      const currentWriting = api.getUnitWriting(unitId, baseWriting);
      const currentItems = Array.isArray(currentWriting.items) ? [...currentWriting.items] : [];
      const isFill = itemData.type === 'fill_blank';
      const cleanSentence = String(itemData.sentence || itemData.correctSentence || '').trim();
      const cleanCorrect = String(itemData.correctSentence || itemData.sentence || '').trim();

      const cleanItem = {
        id: itemData.id || `write_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: isFill ? 'fill_blank' : 'unscramble',
        sentence: cleanSentence,
        correctSentence: cleanCorrect,
        blankWord: String(itemData.blankWord || '').trim(),
        options: Array.isArray(itemData.options)
          ? itemData.options.map((o) => String(o).trim()).filter(Boolean)
          : [],
        scrambledWords: Array.isArray(itemData.scrambledWords) && itemData.scrambledWords.length > 0
          ? itemData.scrambledWords.map((w) => String(w).trim()).filter(Boolean)
          : cleanCorrect.split(/\s+/).filter(Boolean),
        meaningVi: String(itemData.meaningVi || '').trim(),
        hint: String(itemData.hint || '').trim(),
        isCustom: true,
      };

      if (indexToUpdate >= 0 && indexToUpdate < currentItems.length) {
        currentItems[indexToUpdate] = cleanItem;
      } else {
        currentItems.push(cleanItem);
      }

      const updatedWriting = {
        ...currentWriting,
        items: currentItems,
        correctSentence: currentItems[0]?.correctSentence || '',
        scrambledWords: currentItems[0]?.scrambledWords || [],
        meaningVi: currentItems[0]?.meaningVi || '',
        type: currentItems[0]?.type || 'unscramble',
      };
      api.saveCustomUnit(unitId, { writing: updatedWriting });
      return updatedWriting;
    },
    deleteWritingItem(unitId, index, baseWriting = null) {
      const currentWriting = api.getUnitWriting(unitId, baseWriting);
      const currentItems = Array.isArray(currentWriting.items) ? [...currentWriting.items] : [];
      if (index >= 0 && index < currentItems.length) {
        currentItems.splice(index, 1);
        const updatedWriting = {
          ...currentWriting,
          items: currentItems,
          correctSentence: currentItems[0]?.correctSentence || '',
          scrambledWords: currentItems[0]?.scrambledWords || [],
          meaningVi: currentItems[0]?.meaningVi || '',
          type: currentItems[0]?.type || 'unscramble',
        };
        api.saveCustomUnit(unitId, { writing: updatedWriting });
        return updatedWriting;
      }
      return currentWriting;
    },
    batchAddWritingItems(unitId, itemsArray = [], baseWriting = null) {
      const currentWriting = api.getUnitWriting(unitId, baseWriting);
      const currentItems = Array.isArray(currentWriting.items) ? [...currentWriting.items] : [];
      const cleaned = (itemsArray || []).map((item) => {
        const isFill = item.type === 'fill_blank';
        const cleanSentence = String(item.sentence || item.correctSentence || '').trim();
        const cleanCorrect = String(item.correctSentence || item.sentence || '').trim();
        return {
          id: item.id || `write_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: isFill ? 'fill_blank' : 'unscramble',
          sentence: cleanSentence,
          correctSentence: cleanCorrect,
          blankWord: String(item.blankWord || '').trim(),
          options: Array.isArray(item.options)
            ? item.options.map((o) => String(o).trim()).filter(Boolean)
            : [],
          scrambledWords: Array.isArray(item.scrambledWords) && item.scrambledWords.length > 0
            ? item.scrambledWords.map((w) => String(w).trim()).filter(Boolean)
            : cleanCorrect.split(/\s+/).filter(Boolean),
          meaningVi: String(item.meaningVi || '').trim(),
          hint: String(item.hint || '').trim(),
          isCustom: true,
        };
      });

      const nextItems = [...currentItems, ...cleaned];
      const updatedWriting = {
        ...currentWriting,
        items: nextItems,
        correctSentence: nextItems[0]?.correctSentence || '',
        scrambledWords: nextItems[0]?.scrambledWords || [],
        meaningVi: nextItems[0]?.meaningVi || '',
        type: nextItems[0]?.type || 'unscramble',
      };
      api.saveCustomUnit(unitId, { writing: updatedWriting });
      return updatedWriting;
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
        scopeType: assignment.scopeType || 'full_unit', // 'full_unit' | 'skill' | 'custom_words' | 'custom_questions' | 'external_quiz'
        unitId: assignment.unitId !== undefined && assignment.unitId !== null ? Number(assignment.unitId) : 1,
        passage: assignment.passage || null,
        selectedSkill: assignment.selectedSkill || 'all', // 'vocab' | 'pronunciation' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mastery'
        selectedWordIds: Array.isArray(assignment.selectedWordIds)
          ? assignment.selectedWordIds
          : [],
        selectedQuestions: Array.isArray(assignment.selectedQuestions)
          ? assignment.selectedQuestions
          : [],
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
      // Máy giáo viên (không có học sinh đăng nhập) xem được bài nộp thử của mọi em trên máy này
      const all = currentId() ? read(nsKey(KEYS.ASSIGNMENT_SUBMISSIONS), []) : collectAll(KEYS.ASSIGNMENT_SUBMISSIONS);
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
      write(nsKey(KEYS.ASSIGNMENT_SUBMISSIONS), [entry, ...read(nsKey(KEYS.ASSIGNMENT_SUBMISSIONS), [])].slice(0, 300));
      return entry;
    },

    /**
     * "Bắt đầu lại" trong Cài đặt: chỉ xóa dữ liệu HỌC trên máy này (điểm, tiến độ, từ đã thuộc, cài đặt).
     * KHÔNG xóa phiên/tài khoản giáo viên, danh sách học sinh (kèm mã PIN trên máy thầy cô) và nội dung đã soạn.
     */
    clearAll() {
      const id = currentId();
      const remove = (k) => {
        try {
          storage?.removeItem(k);
        } catch {
          /* bỏ qua */
        }
      };
      if (id) {
        // Máy dùng chung: chỉ xóa dữ liệu của em đang đăng nhập, giữ nguyên tiến độ các bạn khác
        PER_STUDENT.forEach((b) => remove(`${b}__${id}`));
        const map = read(KEYS.STUDENT_PROGRESS, {}) || {};
        delete map[id];
        write(KEYS.STUDENT_PROGRESS, map);
        remove(KEYS.SETTINGS);
        return;
      }
      [KEYS.TESTS, KEYS.MASTERY, KEYS.PROGRESS, KEYS.SETTINGS, KEYS.STUDENT, KEYS.ASSIGNMENT_SUBMISSIONS].forEach(remove);
    },
  };
  return api;
}

const sum = (obj) => Object.values(obj ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);

/** Sao của các chế độ ôn trong một Unit (tối đa 12). */
export const modeStarsOf = (unitProgress) => sum(unitProgress?.modes);
/** Giữ lại để tương thích an toàn nếu có module gọi tới. */
export const stageStarsOf = () => 0;
/** Tổng sao toàn bộ app theo các Unit. */
export const totalStarsOf = (progress) =>
  Object.values(progress?.units ?? {}).reduce((acc, u) => acc + modeStarsOf(u), 0);

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
