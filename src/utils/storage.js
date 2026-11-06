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
    // ---- Quản lý Tài khoản Học sinh ----
    getStudents() {
      const list = read(KEYS.STUDENTS, null);
      if (Array.isArray(list) && list.length > 0) return list;
      write(KEYS.STUDENTS, DEFAULT_STUDENTS);
      return DEFAULT_STUDENTS;
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
          (s.username && s.username.toLowerCase() === cleanId) ||
          s.name.toLowerCase() === cleanId
      );
      if (!found) {
        return { success: false, error: 'Không tìm thấy tài khoản học sinh này.' };
      }
      if (found.password && String(found.password).trim() !== String(password || '').trim()) {
        return { success: false, error: 'Mật khẩu chưa chính xác. Hãy hỏi lại thầy cô nhé!' };
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
        password: String(student.password || '123').trim(),
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
      lines.forEach((name, idx) => {
        const cleanName = name.replace(/^\d+[\.\-\s]+/, '').trim();
        if (!cleanName) return;
        const slug = cleanName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');
        const username = `${slug || 'hs'}${String(className).toLowerCase().replace(/[^a-z0-9]/g, '')}${idx + 1}`;
        const newStu = {
          id: `stu_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
          username,
          name: cleanName,
          class: className,
          password: defaultPassword,
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
      const cur = api.getCurrentStudent();
      if (cur) {
        const map = read(KEYS.STUDENT_PROGRESS, {});
        const stuP = map[cur.id];
        if (stuP && typeof stuP === 'object') {
          return { units: stuP.units ?? {}, studyDays: Array.isArray(stuP.studyDays) ? stuP.studyDays : [] };
        }
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
      write(KEYS.PROGRESS, p);

      // Lưu song song vào tiến độ học sinh nếu đang đăng nhập
      const cur = api.getCurrentStudent();
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
      const p = api.getProgress();
      const day = localDay(now);
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

      // 2. Đồng bộ kết quả lên Cloudflare D1
      if (student) {
        try {
          if (typeof window !== 'undefined' && window.fetch) {
            fetch('/api/scores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: `stn_${now.getTime()}_${Math.random().toString(36).slice(2, 6)}`,
                studentName: student.name,
                studentClass: student.class,
                score: data.score != null ? Number(data.score) : stars * 3.33,
                stars,
                correct: data.correct != null ? (data.correct ? 1 : 0) : 1,
                total: 1,
                unitIds: [numUnit],
                wrongWords: [],
                answers: [{ station: stationKey, unitId: numUnit, data }],
                createdAt: now.toISOString(),
              }),
            }).catch(() => {});
          }
        } catch {}
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
