export const PREFIX = 'app_tienganh_v1_';

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

export const DEFAULT_SETTINGS = { lang: 'en-GB', rate: 0.85, sound: true, selectedGrade: 6 };

const writeListeners = new Set();
export function onStoreWrite(fn) {
  writeListeners.add(fn);
  return () => writeListeners.delete(fn);
}

export const IS_DEV = (() => {
  try {
    return !!import.meta.env?.DEV;
  } catch {
    return false;
  }
})();

export function randomPin() {
  const a = new Uint32Array(1);
  (globalThis.crypto || { getRandomValues: (x) => ((x[0] = Math.floor(Math.random() * 2 ** 32)), x) }).getRandomValues(a);
  return String(1000 + (a[0] % 9000));
}

export function createStorageContext(storage = globalThis.localStorage) {
  const PER_STUDENT = [KEYS.TESTS, KEYS.MASTERY, KEYS.ASSIGNMENT_SUBMISSIONS];

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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('storage-write-failed', { detail: { key } }));
      }
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

  const remove = (key) => {
    try {
      storage?.removeItem(key);
    } catch {
      /* bỏ qua */
    }
  };

  const currentId = () => read(KEYS.CURRENT_STUDENT_ID, null);
  const nsKey = (base) => {
    const id = currentId();
    return id ? `${base}__${id}` : base;
  };

  const migrateOnce = (id) => {
    const flag = `${PREFIX}per_student_migrated`;
    if (!id || read(flag, false)) return;
    for (const base of PER_STUDENT) {
      const own = `${base}__${id}`;
      if (storage?.getItem(own) == null && storage?.getItem(base) != null) {
        write(own, read(base, null));
      }
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

  return {
    storage,
    PER_STUDENT,
    read,
    write,
    remove,
    currentId,
    nsKey,
    migrateOnce,
    collectAll,
  };
}
