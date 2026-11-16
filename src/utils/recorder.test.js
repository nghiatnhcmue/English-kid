import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRecorder, isRecordingSupported } from './recorder.js';

describe('recorder: createRecorder & stream management', () => {
  let mockStream = null;
  let mockTracks = [];
  let mediaRecorderInstances = [];
  const originalNavigator = globalThis.navigator;
  const originalMediaRecorder = globalThis.MediaRecorder;
  const originalURL = globalThis.URL;

  beforeEach(() => {
    mockTracks = [
      {
        kind: 'audio',
        readyState: 'live',
        stop: vi.fn(function () {
          this.readyState = 'ended';
        }),
      },
    ];

    mockStream = {
      getAudioTracks: () => mockTracks,
      getTracks: () => mockTracks,
    };

    mediaRecorderInstances = [];

    class MockMediaRecorder {
      constructor(stream, options) {
        this.stream = stream;
        this.options = options;
        this.state = 'inactive';
        this.mimeType = options?.mimeType || 'audio/webm';
        this.ondataavailable = null;
        this.onstop = null;
        mediaRecorderInstances.push(this);
      }
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        if (this.ondataavailable) {
          this.ondataavailable({ data: new Blob(['audio-data'], { type: this.mimeType }) });
        }
        if (this.onstop) {
          this.onstop();
        }
      }
      static isTypeSupported(type) {
        return type.includes('audio/webm');
      }
    }

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        mediaDevices: {
          getUserMedia: vi.fn().mockImplementation(async () => mockStream),
        },
      },
      configurable: true,
      writable: true,
    });
    globalThis.MediaRecorder = MockMediaRecorder;
    globalThis.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-audio-url'),
      revokeObjectURL: vi.fn(),
    };
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
    globalThis.MediaRecorder = originalMediaRecorder;
    globalThis.URL = originalURL;
  });

  it('isRecordingSupported trả về true khi môi trường hỗ trợ getUserMedia và MediaRecorder', () => {
    expect(isRecordingSupported()).toBe(true);
  });

  it('lần start đầu tiên gọi getUserMedia và khởi tạo recorder với mimeType phù hợp', async () => {
    const rec = createRecorder();
    const res = await rec.start();
    expect(res.ok).toBe(true);
    expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(mediaRecorderInstances).toHaveLength(1);
    expect(mediaRecorderInstances[0].options?.mimeType).toBe('audio/webm;codecs=opus');
  });

  it('không tái sử dụng stream khi track đã kết thúc (readyState ended), gọi lại getUserMedia', async () => {
    const rec = createRecorder();
    await rec.start();
    expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);

    // Dừng track (giả lập track bị kết thúc sau lượt đầu hoặc bị thu hồi)
    mockTracks[0].readyState = 'ended';

    // Tạo track mới cho lần getUserMedia thứ hai
    const newTracks = [
      {
        kind: 'audio',
        readyState: 'live',
        stop: vi.fn(function () {
          this.readyState = 'ended';
        }),
      },
    ];
    globalThis.navigator.mediaDevices.getUserMedia.mockImplementationOnce(async () => ({
      getAudioTracks: () => newTracks,
      getTracks: () => newTracks,
    }));

    await rec.start();
    expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('tái sử dụng stream nếu track vẫn đang live', async () => {
    const rec = createRecorder();
    await rec.start();
    expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);

    mockTracks[0].readyState = 'live';
    await rec.start();
    expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('stop() trả về blob URL và release() dọn dẹp đầy đủ track và URL', async () => {
    const rec = createRecorder();
    await rec.start();
    const url = await rec.stop();
    expect(url).toBe('blob:mock-audio-url');
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();

    rec.release();
    expect(mockTracks[0].stop).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-audio-url');
  });
});
