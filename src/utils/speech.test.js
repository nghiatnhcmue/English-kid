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

const { sayWord, speak, stopSpeaking, mp3Rate, recognizeOnce, isSttSupported, playAudioFile } = await import('./speech.js');
import { createRecorder } from './recorder.js';
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

  it('sayWord tôn trọng settings.sound === false', async () => {
    const res = await sayWord({ word: 'cat', audio: '/assets/audio/cat.mp3' }, { sound: false });
    expect(res).toBe(false);
    expect(played).toHaveLength(0);
  });
});

describe('speech: recognizeOnce STT controller', () => {
  it('trả về controller với .promise, .stop(), .abort() và thenable khi không hỗ trợ STT', async () => {
    const ctrl = recognizeOnce();
    expect(ctrl).toHaveProperty('promise');
    expect(typeof ctrl.stop).toBe('function');
    expect(typeof ctrl.abort).toBe('function');
    expect(typeof ctrl.then).toBe('function');

    const res = await ctrl;
    expect(res).toBeNull();
  });

  it('hỗ trợ interimResults = true, gọi rec.stop() khi controller.stop() và trả về transcripts', async () => {
    let capturedRec = null;
    class MockSpeechRecognition {
      constructor() {
        this.lang = 'en-US';
        this.interimResults = false;
        this.maxAlternatives = 1;
        this.stopCalled = false;
        this.abortCalled = false;
        capturedRec = this;
      }
      start() {}
      stop() {
        this.stopCalled = true;
        // Giả lập bắn sự kiện onend sau khi stop
        setTimeout(() => {
          this.onend?.();
        }, 10);
      }
      abort() {
        this.abortCalled = true;
      }
    }

    globalThis.SpeechRecognition = MockSpeechRecognition;

    const ctrl = recognizeOnce({ lang: 'en-GB', timeoutMs: 5000 });
    expect(capturedRec).not.toBeNull();
    expect(capturedRec.interimResults).toBe(true);
    expect(capturedRec.maxAlternatives).toBe(5);

    // Giả lập browser bắn sự kiện onresult với interim/final transcript
    capturedRec.onresult?.({
      results: [
        Object.assign([{ transcript: 'hello' }], { isFinal: true, length: 1 }),
        Object.assign([{ transcript: 'world' }], { isFinal: false, length: 1 }),
      ],
    });

    // Dừng nhận diện bằng controller.stop()
    await ctrl.stop();
    expect(capturedRec.stopCalled).toBe(true);
    expect(capturedRec.abortCalled).toBe(false);

    const result = await ctrl.promise;
    expect(result).not.toBeNull();
    expect(result.transcripts).toContain('hello world');

    delete globalThis.SpeechRecognition;
  });

  it('abort() hủy nhận diện và trả về null', async () => {
    class MockSpeechRecognition {
      constructor() {
        this.abortCalled = false;
      }
      start() {}
      stop() {}
      abort() {
        this.abortCalled = true;
      }
    }
    globalThis.SpeechRecognition = MockSpeechRecognition;

    const ctrl = recognizeOnce();
    ctrl.abort();
    const result = await ctrl.promise;
    expect(result).toBeNull();

    delete globalThis.SpeechRecognition;
  });
});

describe('speech: audio timeout and fast fallback', () => {
  it('remote HTTP audio times out after 2200ms and returns false without hanging', async () => {
    vi.useFakeTimers();
    let resolved = false;
    let res = null;
    playAudioFile('https://dict.youdao.com/dictvoice?audio=pencil').then((val) => {
      resolved = true;
      res = val;
    });

    // Advance 2100ms: still waiting
    await vi.advanceTimersByTimeAsync(2100);
    expect(resolved).toBe(false);

    // Advance past 2200ms: timeout fires and resolves false
    await vi.advanceTimersByTimeAsync(200);
    expect(resolved).toBe(true);
    expect(res).toBe(false);

    vi.useRealTimers();
  });

  it('local audio file timeout allows up to 6000ms', async () => {
    vi.useFakeTimers();
    let resolved = false;
    let res = null;
    playAudioFile('/assets/audio/unit1/pencil.mp3').then((val) => {
      resolved = true;
      res = val;
    });

    // Advance 2500ms: local file should not time out
    await vi.advanceTimersByTimeAsync(2500);
    expect(resolved).toBe(false);

    // Advance past 6000ms: timeout fires
    await vi.advanceTimersByTimeAsync(3600);
    expect(resolved).toBe(true);
    expect(res).toBe(false);

    vi.useRealTimers();
  });
});

describe('speech: speech cancellation recovery & keepalive', () => {
  it('recovers from pause state, waits 40ms to settle Chromium cancel race, and runs keepalive', async () => {
    let resumeCount = 0;
    let spokeUtterance = null;
    const mockSynth = {
      speaking: false,
      pending: false,
      paused: true,
      resume: vi.fn(() => {
        resumeCount++;
        mockSynth.paused = false;
      }),
      cancel: vi.fn(),
      speak: vi.fn((u) => {
        spokeUtterance = u;
      }),
      getVoices: () => [{ lang: 'en-GB', name: 'Google UK English' }],
    };

    class MockUtterance {
      constructor(text) {
        this.text = text;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
      }
    }

    globalThis.speechSynthesis = mockSynth;
    globalThis.SpeechSynthesisUtterance = MockUtterance;

    const p = speak('Testing speech cancellation recovery and keepalive');
    await new Promise((r) => setTimeout(r, 60));

    expect(mockSynth.resume).toHaveBeenCalled();
    expect(mockSynth.speak).toHaveBeenCalled();
    expect(spokeUtterance).not.toBeNull();

    // Trigger onstart -> keepalive should be scheduled
    mockSynth.paused = true;
    spokeUtterance.onstart?.();

    // Advance time to verify keepalive interval fires
    await new Promise((r) => setTimeout(r, 2100));
    expect(resumeCount).toBeGreaterThanOrEqual(2);

    // End utterance
    spokeUtterance.onend?.();
    const result = await p;
    expect(result).toBe(true);

    delete globalThis.speechSynthesis;
    delete globalThis.SpeechSynthesisUtterance;
  });
});

describe('speech: recorder live track handling', () => {
  it('requests new media stream if current tracks are ended, and reuses when live', async () => {
    let getUserMediaCalls = 0;
    const track = {
      kind: 'audio',
      readyState: 'ended',
      stop: vi.fn(),
    };
    const origNav = globalThis.navigator;
    const origMR = globalThis.MediaRecorder;

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        mediaDevices: {
          getUserMedia: vi.fn(async () => {
            getUserMediaCalls++;
            return {
              getAudioTracks: () => [track],
              getTracks: () => [track],
            };
          }),
        },
      },
      configurable: true,
      writable: true,
    });
    globalThis.MediaRecorder = class {
      constructor() {
        this.state = 'inactive';
      }
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; }
      static isTypeSupported() { return true; }
    };

    const rec = createRecorder();
    await rec.start();
    expect(getUserMediaCalls).toBe(1);

    // Still ended -> calling start again must re-acquire getUserMedia
    track.readyState = 'ended';
    await rec.start();
    expect(getUserMediaCalls).toBe(2);

    // Live track -> calling start again reuses without re-acquiring
    track.readyState = 'live';
    await rec.start();
    expect(getUserMediaCalls).toBe(2);

    rec.release();
    Object.defineProperty(globalThis, 'navigator', {
      value: origNav,
      configurable: true,
      writable: true,
    });
    globalThis.MediaRecorder = origMR;
  });
});
