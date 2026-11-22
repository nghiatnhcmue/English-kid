// Hồi quy cho các lỗi tìm thấy khi rà soát toàn bộ code (11/2026).
import { describe, it, expect, beforeEach } from 'vitest';
import { handleApi } from '../worker.js';
import { createTestD1 } from '../../server/testing/d1.js';
import { normUnitId, unitNumberOf } from './unitId.js';
import { generateTest } from './testGenerator.js';

const mem = {};
globalThis.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => (mem[k] = String(v)),
  removeItem: (k) => delete mem[k],
  clear: () => Object.keys(mem).forEach((k) => delete mem[k]),
  key: (i) => Object.keys(mem)[i] ?? null,
  get length() {
    return Object.keys(mem).length;
  },
};
const { store } = await import('./storage.js');
const { getUnitRaw, getUnit } = await import('./data.js');

beforeEach(() => globalThis.localStorage.clear());

describe('ID Unit nhiều khối lớp', () => {
  it('normUnitId giữ nguyên "g7_u1", đổi "3" thành số', () => {
    expect(normUnitId('g7_u1')).toBe('g7_u1');
    expect(normUnitId('3')).toBe(3);
    expect(normUnitId(5)).toBe(5);
    expect(normUnitId('')).toBeNull();
    expect(unitNumberOf({ unitId: 'g10_u4' })).toBe(4);
  });

  it('tiến độ Unit Lớp 7 lưu đúng ô của Unit đó (không dồn vào "NaN")', () => {
    store().saveModeResult('g7_u1', 'flashcard', 3);
    store().saveModeResult('g8_u2', 'grammar', 2);
    const p = store().getProgress();
    expect(p.units['g7_u1'].modes.flashcard).toBe(3);
    expect(p.units['g8_u2'].modes.grammar).toBe(2);
    expect(p.units.NaN).toBeUndefined();
  });

  it('giáo viên sửa Unit Lớp 6 thì học sinh thấy bản đã sửa', () => {
    store().saveCustomUnit(1, { reading: { passage: 'TEACHER EDITED PASSAGE' } });
    expect(getUnitRaw(1).reading.passage).toBe('TEACHER EDITED PASSAGE');
    expect(getUnit(1).reading.passage).toBe('TEACHER EDITED PASSAGE');
    // các phần khác của reading (câu hỏi SGK) vẫn còn
    expect(getUnitRaw(1).reading.questions?.length).toBeGreaterThan(0);
  });

  it('giáo viên sửa Unit Lớp 7 không đè lên Unit Lớp 8', () => {
    store().saveCustomUnit('g7_u1', { reading: { passage: 'G7 EDIT' } });
    expect(getUnitRaw('g7_u1').reading.passage).toBe('G7 EDIT');
    expect(getUnitRaw('g8_u1').reading.passage).not.toBe('G7 EDIT');
  });
});

describe('Đề test', () => {
  it('chỗ trống trong câu chỉ đục đúng cả từ', () => {
    const vocab = [
      { id: 'a', word: 'cat', meaning: 'mèo', exampleEn: 'This category has a cat.', emoji: '🐱' },
      { id: 'b', word: 'dog', meaning: 'chó', exampleEn: 'A dog.', emoji: '🐶' },
      { id: 'c', word: 'pig', meaning: 'lợn', exampleEn: 'A pig.', emoji: '🐷' },
      { id: 'd', word: 'cow', meaning: 'bò', exampleEn: 'A cow.', emoji: '🐮' },
    ];
    const qs = generateTest({ vocab, seed: 1, total: 40 }).filter((q) => q.type === 'context' && q.wordId === 'a');
    for (const q of qs) expect(q.sentence).toBe('This category has a _____.');
  });
});

describe('Máy chủ', () => {
  let env;
  const ORIGIN = 'https://english-kid.example';
  const call = async (path, { method = 'GET', body, token } = {}) => {
    const res = await handleApi(
      new Request(`${ORIGIN}${path}`, {
        method,
        headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      }),
      env,
    );
    return { status: res.status, data: await res.json().catch(() => null) };
  };
  const setup = async () => {
    const t = (await call('/api/auth/teacher/setup', { method: 'POST', body: { setupCode: 'c', username: 'cohien', password: 'matkhau123' } })).data.token;
    await call('/api/students', { method: 'PUT', token: t, body: { upsert: [{ id: 's1', username: 'an6a1', name: 'An', class: '6A1', pin: '4821' }] } });
    return t;
  };
  beforeEach(() => {
    env = { DB: createTestD1(), ADMIN_SETUP_CODE: 'c' };
  });

  it('đổi hoa/thường tên đăng nhập hoặc dùng id KHÔNG lách được giới hạn nhập sai PIN', async () => {
    await setup();
    const variants = ['an6a1', 'AN6A1', 'An6a1', 'aN6A1', 's1'];
    for (const v of variants) await call('/api/auth/student/login', { method: 'POST', body: { id: v, pin: '0000' } });
    const r = await call('/api/auth/student/login', { method: 'POST', body: { id: 'AN6a1', pin: '4821' } });
    expect(r.status).toBe(429);
  });

  it('điểm trạm của Unit Lớp 7 giữ được unitId "g7_u1"', async () => {
    const t = await setup();
    const stu = (await call('/api/auth/student/login', { method: 'POST', body: { id: 's1', pin: '4821' } })).data.token;
    await call('/api/scores', { method: 'POST', token: stu, body: { kind: 'station', score: 10, stars: 3, correct: 1, total: 1, unitIds: ['g7_u1', 2, 'bad', "g7_u1'--"] } });
    const all = await call('/api/scores?kind=all', { token: t });
    expect(all.data.data[0].unitIds).toEqual(['g7_u1', 2]);
  });

  it('2 dòng trùng tên đăng nhập trong một lần gửi → báo trùng, không lỗi 500', async () => {
    const t = await setup();
    const r = await call('/api/students', {
      method: 'PUT',
      token: t,
      body: { upsert: [{ id: 'x1', username: 'dup', name: 'A', class: '6A1' }, { id: 'x2', username: 'dup', name: 'B', class: '6A1' }] },
    });
    expect(r.status).toBe(200);
    expect(r.data.conflicts).toEqual(['dup']);
  });
});

describe('Đối chiếu SGK lớp 10–12 và trang PDF (11/2026)', () => {
  it('mở đúng trang PDF theo độ lệch riêng của từng file scan', async () => {
    const { pdfPageForUnit, pdfOffsetFor } = await import('../components/PdfReaderModal.jsx');
    // Lớp 11, 12, 7, 4, 5 Tập 1 có 2 trang trước trang in số 1; các sách còn lại 1 trang
    expect(pdfOffsetFor('sgk-12')).toBe(2);
    expect(pdfOffsetFor('sgk-10')).toBe(1);
    expect(pdfPageForUnit({ grade: 12, bookId: 'sgk-12', bookPages: 'Trang 8 – 19' })).toBe(10);
    expect(pdfPageForUnit({ grade: 10, bookId: 'sgk-10', bookPages: 'Trang 8 – 17' })).toBe(9);
    expect(pdfPageForUnit({ grade: 4, semester: 1, bookPages: 'Trang 8 – 13' })).toBe(10);
  });

  it('chủ điểm ngữ pháp / phát âm / số trang lớp 10–12 khớp Book map SGK', async () => {
    const g12 = (await import('../data/grades/grade12.json')).default;
    const g10 = (await import('../data/grades/grade10.json')).default;
    expect(g12.units[0].pronunciation.pair).toBe('/eɪ/ và /aʊ/');
    expect(g12.units[5].grammar.title).toMatch(/sai khiến/);
    expect(g12.units.map((u) => u.bookPages.match(/\d+/)[0])).toEqual(['8', '20', '32', '48', '60', '76', '88', '100', '116', '128']);
    expect(g10.units[3].bookPages).toBe('Trang 42 – 51');
    for (const g of [g10, g12]) {
      for (const u of g.units) {
        // Có câu hỏi ngữ pháp thật (không chỉ câu điền từ vựng) và bài luyện phát âm
        expect(u.grammar.quiz.length).toBeGreaterThanOrEqual(4);
        expect(u.pronunciation.practiceQuiz.length).toBeGreaterThanOrEqual(4);
        for (const q of u.pronunciation.practiceQuiz) expect(q.options).toContain(q.correctSound);
      }
    }
  });
});

describe('Lớp 7: Nghe chọn hình chỉ còn 1 đáp án / hình lỗi (11/2026)', () => {
  it('bỏ qua ô "NaN" do bản cũ ghi chung mọi Unit Lớp 7–12', () => {
    localStorage.setItem('app_tienganh_v1_custom_units', JSON.stringify({ NaN: { vocabularies: [{ word: 'robot', meaning: 'người máy' }] } }));
    expect(store().getCustomUnit('g7_u1')).toBeNull();
    expect(getUnitRaw('g7_u1').vocabularies.length).toBeGreaterThanOrEqual(4);
    localStorage.removeItem('app_tienganh_v1_custom_units');
  });

  it('luôn đủ 4 phương án kể cả khi từ không có id', async () => {
    const { makeOptions } = await import('../components/ListeningQuiz.jsx');
    const pool = ['cat', 'dog', 'bird', 'fish', 'cow'].map((w) => ({ word: w, meaning: w, emoji: '🐾' }));
    const opts = makeOptions(pool[0], pool);
    expect(opts).toHaveLength(4);
    expect(new Set(opts.map((o) => o.word)).size).toBe(4);
    expect(opts.map((o) => o.word)).toContain('cat');
  });
});
