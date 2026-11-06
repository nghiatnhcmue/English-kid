import { describe, it, expect, beforeEach } from 'vitest';
import { createStore, DEFAULT_TEACHER_ACCOUNT } from './storage.js';

describe('Teacher Authentication (GV01 / 123456789)', () => {
  let memory;
  let fakeStorage;
  let s;

  beforeEach(() => {
    memory = {};
    fakeStorage = {
      getItem: (key) => memory[key] ?? null,
      setItem: (key, val) => { memory[key] = String(val); },
      removeItem: (key) => { delete memory[key]; },
      clear: () => { Object.keys(memory).forEach((k) => delete memory[k]); },
    };
    s = createStore(fakeStorage);
  });

  it('1. Default teacher account is GV01 with password 123456789', () => {
    const acc = s.getTeacherAccount();
    expect(acc.username).toBe('GV01');
    expect(acc.password).toBe('123456789');
    expect(DEFAULT_TEACHER_ACCOUNT.username).toBe('GV01');
    expect(DEFAULT_TEACHER_ACCOUNT.password).toBe('123456789');
  });

  it('2. Login with correct GV01 and 123456789 succeeds and creates session', () => {
    const res = s.loginTeacher('GV01', '123456789');
    expect(res.success).toBe(true);
    expect(res.teacher).toBeDefined();
    expect(res.teacher.username).toBe('GV01');

    const session = s.getTeacherSession();
    expect(session).toBeDefined();
    expect(session.username).toBe('GV01');
  });

  it('3. Username comparison is case-insensitive (e.g. gv01 or GV01)', () => {
    const res1 = s.loginTeacher('gv01', '123456789');
    expect(res1.success).toBe(true);
    expect(res1.teacher.username).toBe('GV01');

    s.logoutTeacher();

    const res2 = s.loginTeacher('Gv01 ', '123456789');
    expect(res2.success).toBe(true);
  });

  it('4. Login with wrong password fails with clear error message', () => {
    const res = s.loginTeacher('GV01', 'wrong_pass');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Mật khẩu chưa chính xác');
    expect(s.getTeacherSession()).toBeNull();
  });

  it('5. Login with wrong username fails with clear error message', () => {
    const res = s.loginTeacher('GV99', '123456789');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Mã giáo viên không chính xác');
    expect(s.getTeacherSession()).toBeNull();
  });

  it('6. Login with empty inputs fails validation', () => {
    const res = s.loginTeacher('', '');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Vui lòng nhập đầy đủ');
  });

  it('7. logoutTeacher clears active teacher session', () => {
    s.loginTeacher('GV01', '123456789');
    expect(s.getTeacherSession()).not.toBeNull();

    s.logoutTeacher();
    expect(s.getTeacherSession()).toBeNull();
  });

  it('8. Changing teacher password updates credentials and allows logging in with new password', () => {
    const changeRes = s.saveTeacherPassword('myNewSecurePass888');
    expect(changeRes.success).toBe(true);

    // Old password should now fail
    const oldLogin = s.loginTeacher('GV01', '123456789');
    expect(oldLogin.success).toBe(false);

    // New password should succeed
    const newLogin = s.loginTeacher('GV01', 'myNewSecurePass888');
    expect(newLogin.success).toBe(true);
  });

  it('9. Changing password requires at least 6 characters', () => {
    const shortRes = s.saveTeacherPassword('123');
    expect(shortRes.success).toBe(false);
    expect(shortRes.error).toContain('ít nhất 6 ký tự');
  });

  it('10. resetTeacherAccount restores default account credentials (GV01 / 123456789)', () => {
    s.saveTeacherPassword('changedPass123456');
    s.resetTeacherAccount();

    const acc = s.getTeacherAccount();
    expect(acc.username).toBe('GV01');
    expect(acc.password).toBe('123456789');

    const loginRes = s.loginTeacher('GV01', '123456789');
    expect(loginRes.success).toBe(true);
  });
});
