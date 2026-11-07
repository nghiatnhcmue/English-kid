// Hàng đợi gửi điểm / bài nộp (src/utils/api.js): không mất món nào, không gửi trùng.
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mem = {};
globalThis.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => (mem[k] = String(v)),
  removeItem: (k) => delete mem[k],
  key: (i) => Object.keys(mem)[i] ?? null,
  get length() {
    return Object.keys(mem).length;
  },
};

const { enqueue, pendingCount, flushOutbox } = await import('./api.js');
const until = async (cond) => {
  for (let i = 0; i < 100 && !cond(); i++) await new Promise((r) => setTimeout(r, 5));
};

let calls;
let release;
beforeEach(() => {
  Object.keys(mem).forEach((k) => delete mem[k]);
  mem.app_tienganh_v1_student_token = JSON.stringify('a'.repeat(64));
  calls = [];
  let first = true;
  globalThis.fetch = vi.fn(async (path, opts) => {
    calls.push({ path, body: JSON.parse(opts.body) });
    if (first) {
      first = false;
      await new Promise((r) => (release = r)); // giữ request đầu tiên "đang gửi"
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  });
});

describe('Hàng đợi gửi bài (offline-first)', () => {
  it('món được thêm TRONG LÚC đang gửi món trước vẫn được gửi (không bị ghi đè mất)', async () => {
    enqueue('submission', { assignmentId: 'a1', score: 8 }, 'sub:1');
    await until(() => calls.length === 1);
    enqueue('score', { kind: 'test', score: 8 }, 'score:1'); // thêm khi request 1 chưa xong
    release();
    await until(() => calls.length === 2 && pendingCount() === 0);
    expect(calls.map((c) => c.path)).toEqual(['/api/submissions', '/api/scores']);
    expect(pendingCount()).toBe(0);
  });

  it('cùng một bài (cùng mã) chỉ gửi một lần', async () => {
    enqueue('score', { kind: 'test', score: 9 }, 'score:t1');
    await until(() => calls.length === 1);
    release();
    await until(() => pendingCount() === 0);
    enqueue('score', { kind: 'test', score: 9 }, 'score:t1'); // StrictMode / mở lại trang kết quả
    await flushOutbox();
    expect(calls).toHaveLength(1);
  });

  it('mất mạng: giữ lại trong hàng đợi để gửi sau', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    enqueue('score', { kind: 'test', score: 5 }, 'score:t2');
    await flushOutbox();
    expect(pendingCount()).toBe(1);
  });

  it('chưa đăng nhập (không có token): không gửi, giữ lại chờ em đăng nhập', async () => {
    delete mem.app_tienganh_v1_student_token;
    enqueue('score', { kind: 'test', score: 7 }, 'score:t3');
    await flushOutbox();
    expect(calls).toHaveLength(0);
    expect(pendingCount()).toBe(1);
  });
});
