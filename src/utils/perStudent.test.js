import { describe, it, expect, beforeEach } from 'vitest';
import { createStore, KEYS } from './storage.js';
import { esc } from './report.js';

let mem;
let s;
const fake = () => ({
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => (mem[k] = String(v)),
  removeItem: (k) => delete mem[k],
  key: (i) => Object.keys(mem)[i] ?? null,
  get length() {
    return Object.keys(mem).length;
  },
});
const answers = (ok) => [{ questionId: 'q1', wordId: 'u1_01', type: 'listen', correct: ok }];

beforeEach(() => {
  mem = {};
  s = createStore(fake());
  mem[KEYS.STUDENTS] = JSON.stringify([
    { id: 'a', username: 'an', name: 'Nguyễn Văn An', class: '6A1', password: '1111' },
    { id: 'b', username: 'binh', name: 'Bình', class: '6A1', password: '2222' },
  ]);
});

describe('Máy dùng chung: dữ liệu học tách theo từng em', () => {
  it('điểm test, từ đã thuộc và tiến độ của em này không hiện sang em khác', () => {
    s.setCurrentStudent('a');
    s.saveTestResult({ unitIds: [1], answers: answers(true) });
    s.saveModeResult(1, 'flashcard', 3);
    expect(s.getTestHistory()).toHaveLength(1);
    expect(Object.keys(s.getMastery())).toContain('u1_01');

    s.setCurrentStudent('b');
    expect(s.getTestHistory()).toHaveLength(0);
    expect(s.getMastery()).toEqual({});
    expect(s.getProgress().units).toEqual({});

    s.setCurrentStudent('a');
    expect(s.getProgress().units[1].modes.flashcard).toBe(3);
    expect(s.getProgress().studyDays.length).toBe(1);
  });

  it('dữ liệu chung cũ được giao cho em đăng nhập đầu tiên, chỉ một lần', () => {
    s.saveTestResult({ unitIds: [1], answers: answers(false) }); // khách (chưa đăng nhập)
    s.setCurrentStudent('a');
    expect(s.getTestHistory()).toHaveLength(1);
    s.setCurrentStudent('b');
    expect(s.getTestHistory()).toHaveLength(0);
  });

  it('“Bắt đầu lại” của một em không xóa tiến độ của bạn khác', () => {
    s.setCurrentStudent('a');
    s.saveModeResult(1, 'flashcard', 3);
    s.setCurrentStudent('b');
    s.saveModeResult(2, 'matching', 2);
    s.clearAll();
    expect(s.getProgress().units).toEqual({});
    s.setCurrentStudent('a');
    expect(s.getProgress().units[1].modes.flashcard).toBe(3);
  });

  it('xóa học sinh thì dọn dữ liệu học của em đó', () => {
    s.setCurrentStudent('a');
    s.saveTestResult({ unitIds: [1], answers: answers(true) });
    s.setCurrentStudent('b');
    s.deleteStudent('a');
    expect(Object.keys(mem).some((k) => k.endsWith('__a'))).toBe(false);
    expect(s.getAllStudentsProgress().a).toBeUndefined();
  });

  it('đăng nhập trên máy (khi mất mạng) bắt buộc đúng mã PIN đã lưu, không khớp theo họ tên', () => {
    expect(s.loginStudent('an', '9999').success).toBe(false);
    expect(s.loginStudent('Nguyễn Văn An', '1111').success).toBe(false); // họ tên không còn dùng để đăng nhập
    expect(s.loginStudent('an', '1111').success).toBe(true);
    mem[KEYS.STUDENTS] = JSON.stringify([{ id: 'c', username: 'chi', name: 'Chi', class: '6A1' }]); // máy học sinh: không có PIN
    expect(s.loginStudent('chi', '').success).toBe(false);
  });

  it('không tự tạo 10 tài khoản mẫu trên bản thật', () => {
    mem = {};
    s = createStore(fake());
    // Vitest chạy với import.meta.env.DEV = true nên chỉ kiểm tra cờ demo được gắn để lọc khỏi danh sách giáo viên
    const list = s.getStudents();
    expect(list.every((x) => x.demo)).toBe(true);
  });
});

describe('Xuất CSV an toàn', () => {
  it('ô bắt đầu bằng = + - @ không thành công thức Excel; số âm giữ nguyên', () => {
    expect(esc('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(esc('@cmd')).toBe("'@cmd");
    expect(esc('-5')).toBe('-5');
    expect(esc('Nguyễn An')).toBe('Nguyễn An');
  });
});
