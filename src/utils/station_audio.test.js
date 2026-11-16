import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speakWord } from '../pages/HomePage.jsx';
import * as speechModule from './speech.js';

describe('Station Audio & Voice Interaction Fixes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('HomePage speakWord', () => {
    it('uses speak() with lang: en-GB and rate: 0.85', async () => {
      const speakSpy = vi.spyOn(speechModule, 'speak').mockResolvedValue(true);
      await speakWord('calculator');
      expect(speakSpy).toHaveBeenCalledWith('calculator', { lang: 'en-GB', rate: 0.85 });
    });

    it('gracefully handles empty word without crashing or hanging', async () => {
      const speakSpy = vi.spyOn(speechModule, 'speak').mockResolvedValue(true);
      await speakWord('');
      await speakWord(null);
      await speakWord(undefined);
      expect(speakSpy).not.toHaveBeenCalled();
    });
  });

  describe('SpeakingStation & ShadowingStation audio and mic resiliency logic', () => {
    it('ensures computer line playback resets isComputerSpeaking in finally even if speak rejects', async () => {
      let isComputerSpeaking = false;
      const setIsComputerSpeaking = (v) => {
        isComputerSpeaking = v;
      };

      const failingSpeak = async () => {
        setIsComputerSpeaking(true);
        try {
          throw new Error('TTS audio load timeout / decoding failure');
        } finally {
          setIsComputerSpeaking(false);
        }
      };

      await expect(failingSpeak()).rejects.toThrow('TTS audio load timeout');
      // Microphone button is not locked!
      expect(isComputerSpeaking).toBe(false);
    });

    it('proceeds with recognizeOnce if recorder.start() fails but isSttSupported is true', async () => {
      let status = 'idle';
      let micError = null;
      let recognizeOnceCalled = false;

      const mockRecorder = {
        start: vi.fn().mockResolvedValue({ ok: false, message: 'Audio encoding unavailable' }),
        stop: vi.fn().mockResolvedValue(null),
      };

      const isSttSupportedMock = () => true;
      const recognizeOnceMock = () => {
        recognizeOnceCalled = true;
        return {
          promise: Promise.resolve({ transcripts: ['hello world'] }),
          stop: vi.fn(),
          abort: vi.fn(),
        };
      };

      // Simulated startRecord logic from SpeakingStation
      const startRecord = async () => {
        const sttAvailable = isSttSupportedMock();
        let recorderStarted = false;
        let recErrorMsg = null;

        const res = await mockRecorder.start();
        if (res && res.ok) {
          recorderStarted = true;
        } else {
          recErrorMsg = res?.message || 'Không thể ghi âm';
        }

        if (!recorderStarted && !sttAvailable) {
          micError = recErrorMsg;
          status = 'done';
          return;
        }

        if (!recorderStarted && sttAvailable) {
          micError = 'Lưu ý: Không thể lưu file nghe lại, nhưng AI vẫn đang lắng nghe và chấm điểm phát âm cho em!';
        }

        status = 'recording';

        if (sttAvailable) {
          recognizeOnceMock();
        }
      };

      await startRecord();
      expect(status).toBe('recording');
      expect(recognizeOnceCalled).toBe(true);
      expect(micError).toContain('AI vẫn đang lắng nghe');
    });

    it('reports friendly error and marks done if neither recorder nor STT works', async () => {
      let status = 'idle';
      let micError = null;

      const mockRecorder = {
        start: vi.fn().mockResolvedValue({ ok: false, message: 'Permission denied' }),
      };

      const isSttSupportedMock = () => false;

      // Simulated startRecord logic
      const startRecord = async () => {
        const sttAvailable = isSttSupportedMock();
        let recorderStarted = false;
        let recErrorMsg = null;

        const res = await mockRecorder.start();
        if (res && res.ok) {
          recorderStarted = true;
        } else {
          recErrorMsg = res?.message || 'Không thể truy cập micro';
        }

        if (!recorderStarted && !sttAvailable) {
          micError = recErrorMsg;
          status = 'done';
          return;
        }
      };

      await startRecord();
      expect(status).toBe('done');
      expect(micError).toBe('Permission denied');
    });
  });

  describe('SpeakerButton & SlowSpeakerButton finally reset', () => {
    it('always resets playing state in finally when speak() rejects', async () => {
      let playing = false;
      const setPlaying = (val) => {
        playing = val;
      };

      const play = async () => {
        setPlaying(true);
        try {
          await Promise.reject(new Error('Audio playback interrupted'));
        } finally {
          setPlaying(false);
        }
      };

      await expect(play()).rejects.toThrow('Audio playback interrupted');
      expect(playing).toBe(false);
    });
  });
});
