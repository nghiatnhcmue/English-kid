import { describe, it, expect, beforeEach, vi } from 'vitest';

// Audio giả: ghi lại mọi file được phát; test tự bắn sự kiện 'ended'
const played = [];
class FakeAudio {
  constructor(src) {
    this.src = src;
    this.listeners = {};
    this.playbackRate = 1;
    this.paused = false;
    played.push(this);
  }
  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn);
  }
  emit(type) {
    (this.listeners[type] || []).forEach((fn) => fn());
  }
  play() {
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}
globalThis.Audio = FakeAudio;

const { sayWord, speak, stopSpeaking, mp3Rate } = await import('./speech.js');
const tick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  stopSpeaking();
  played.length = 0;
  vi.useRealTimers();
});

describe('speech: điều phối lượt phát', () => {
  it('sayWord chỉ phát file của TỪ, không lấy file câu ví dụ', async () => {
    const p = sayWord({ word: 'ruler', audioExample: '/assets/audio/unit1/ruler-example.mp3' }, {});
    await tick();
    expect(played[0].src).not.toContain('example');
    played[0].emit('ended');
    await p;
  });

  it('đổi thẻ giữa chừng: từ cũ KHÔNG tự phát lại chậm sau đó', async () => {
    const first = sayWord({ word: 'ruler', audio: '/a/ruler.mp3' }, {}, { slowToo: true });
    await tick();
    expect(played).toHaveLength(1);
    // em lướt sang thẻ khác trước khi "ruler" đọc xong
    const second = sayWord({ word: 'rubber', audio: '/a/rubber.mp3' }, {});
    await tick();
    played[1].emit('ended');
    await second;
    await first;
    await new Promise((r) => setTimeout(r, 450));
    expect(played.map((a) => a.src)).toEqual(['/a/ruler.mp3', '/a/rubber.mp3']);
    expect(played[0].paused).toBe(true);
  });

  it('slowToo phát lần 2 chậm khi không bị hủy', async () => {
    const p = sayWord({ word: 'desk', audio: '/a/desk.mp3' }, {}, { slowToo: true });
    await tick();
    played[0].emit('ended');
    await new Promise((r) => setTimeout(r, 400));
    expect(played).toHaveLength(2);
    expect(played[1].playbackRate).toBeCloseTo(0.7);
    played[1].emit('ended');
    await p;
  });

  it('file mp3 phát 1.0x ở tốc độ mặc định, chậm thì 0.7x', () => {
    expect(mp3Rate({ rate: 0.85 })).toBe(1);
    expect(mp3Rate({ slow: true })).toBe(0.7);
  });

  it('speak với file lỗi thì chuyển sang nguồn khác, không treo', async () => {
    const p = speak('hello', { audio: '/a/missing.mp3' });
    await tick();
    played[0].emit('error');
    await tick();
    expect(played[1].src).toContain('dictvoice'); // cụm ngắn → thử Youdao
    played[1].emit('ended');
    expect(await p).toBe(true);
  });
});
