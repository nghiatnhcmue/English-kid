import {
  KEYS,
  DEFAULT_STUDENTS,
  DEFAULT_SETTINGS,
  onStoreWrite,
  randomPin,
  createStorageContext,
} from './storage/io.js';
import { createStudentSlice } from './storage/studentSlice.js';
import {
  createProgressSlice,
  modeStarsOf,
  stageStarsOf,
  totalStarsOf,
} from './storage/progressSlice.js';
import { createCurriculumSlice } from './storage/curriculumSlice.js';
import { createAssignmentSlice } from './storage/assignmentSlice.js';

export {
  KEYS,
  DEFAULT_STUDENTS,
  DEFAULT_SETTINGS,
  onStoreWrite,
  randomPin,
  modeStarsOf,
  stageStarsOf,
  totalStarsOf,
};

/**
 * Tạo kho lưu trữ hợp nhất từ 4 miền nghiệp vụ (Học sinh, Tiến độ, Học liệu, Bài giao).
 * `storage` có thể thay bằng bản giả khi chạy unit test.
 */
export function createStore(storage = globalThis.localStorage) {
  const ctx = createStorageContext(storage);
  const api = {
    readRaw(key) {
      return ctx.read(key, null);
    },
    writeRaw(key, value) {
      return ctx.write(key, value);
    },
  };

  Object.assign(
    api,
    createStudentSlice(ctx, api),
    createProgressSlice(ctx, api),
    createCurriculumSlice(ctx, api),
    createAssignmentSlice(ctx, api),
  );

  return api;
}

let defaultStore;
export function store() {
  if (!defaultStore) {
    let storage;
    try {
      storage = globalThis.localStorage;
    } catch {
      storage = undefined;
    }
    defaultStore = createStore(storage);
  }
  return defaultStore;
}
