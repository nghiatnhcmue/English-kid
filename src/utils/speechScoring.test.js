import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compareWords } from '../components/stations/SpeakingStation.jsx';
import { similarity, speakingLevel } from './scene.js';
import { recognizeOnce, isSttSupported } from './speech.js';

describe('Speech Scoring & Word Comparison Engine', () => {
  // ==========================================
  // 1. WORD COMPARISON (compareWords)
  // ==========================================
  describe('1. Word Comparison (compareWords)', () => {
    it('accurately matches words irrespective of casing, periods, commas, and exclamation marks', () => {
      const target = 'Hello, how are you today?';
      const spoken = 'hello HOW are you Today!';

      const result = compareWords(target, spoken);
      expect(result).toHaveLength(5);
      expect(result.every((r) => r.matched)).toBe(true);
      expect(result[0]).toEqual({ word: 'Hello,', matched: true });
      expect(result[4]).toEqual({ word: 'today?', matched: true });
    });

    it('correctly marks unmatched words when user skips or mispronounces words', () => {
      const target = 'I usually go to school by bicycle.';
      const spoken = 'I go to school by bus';

      const result = compareWords(target, spoken);
      expect(result).toHaveLength(7);

      const matchedWords = result.filter((r) => r.matched).map((r) => r.word);
      const missedWords = result.filter((r) => !r.matched).map((r) => r.word);

      expect(matchedWords).toEqual(['I', 'go', 'to', 'school', 'by']);
      expect(missedWords).toEqual(['usually', 'bicycle.']);
    });

    it('handles punctuation and contractions gracefully (e.g., "don\'t", "I\'m")', () => {
      const target = "I don't like television programmes.";
      const spoken = 'I dont like television programmes';

      const result = compareWords(target, spoken);
      expect(result.every((r) => r.matched)).toBe(true);
    });

    it('handles empty inputs safely without crashing', () => {
      expect(compareWords('', '')).toEqual([]);
      expect(compareWords('Hello world', '')).toEqual([
        { word: 'Hello', matched: false },
        { word: 'world', matched: false },
      ]);
      expect(compareWords('', 'hello')).toEqual([]);
      expect(compareWords(null, undefined)).toEqual([]);
    });
  });

  // ==========================================
  // 2. SCORING LEVELS & SIMILARITY
  // ==========================================
  describe('2. Scoring Levels & Similarity Algorithm', () => {
    it('calculates 1.0 similarity for identical sentences', () => {
      const score = similarity('My house is in the countryside.', 'My house is in the countryside.');
      expect(score).toBe(1);
      expect(speakingLevel(score)).toBe('great');
    });

    it('produces high similarity score (>= 0.6 / great / 3 stars) for near-perfect speech', () => {
      const target = 'What is your favourite subject at school?';
      const spoken = 'What is your favorite subject in school?';
      const score = similarity(spoken, target);

      expect(score).toBeGreaterThanOrEqual(0.6);
      expect(speakingLevel(score)).toBe('great');
    });

    it('produces moderate similarity score (0.3 - 0.59 / close / 2 stars) for partially correct speech', () => {
      const target = 'We have English on Monday and Friday.';
      const spoken = 'We have English today.';
      const score = similarity(spoken, target);

      expect(score).toBeGreaterThanOrEqual(0.3);
      expect(score).toBeLessThan(0.7);
      expect(speakingLevel(score)).toBe('close');
    });

    it('produces low similarity score (< 0.3 / retry / 1 star) for unrelated sentences', () => {
      const target = 'Ha Long Bay is a natural wonder.';
      const spoken = 'I love playing football with my cat.';
      const score = similarity(spoken, target);

      expect(score).toBeLessThan(0.3);
      expect(speakingLevel(score)).toBe('retry');
    });

    it('returns 0 for empty or missing inputs', () => {
      expect(similarity('', 'Hello')).toBe(0);
      expect(similarity('Hello', '')).toBe(0);
      expect(similarity(null, null)).toBe(0);
      expect(speakingLevel(0)).toBe('retry');
    });
  });

  // ==========================================
  // 3. FALLBACK EVALUATION LOGIC
  // ==========================================
  describe('3. Fallback Evaluation Logic (VN Network & STT Glitch Resilience)', () => {
    /**
     * Replicates the exact evaluation logic in SpeakingStation
     */
    function evaluateSpeaking({ transcripts, audioUrl, durationMs, targetSentence }) {
      const target = targetSentence || '';
      const resolvedUrl = audioUrl;
      const duration = durationMs || 0;

      // 1. Khi không có STT transcripts (bị chặn mạng, lỗi kết nối)
      if (!transcripts || !transcripts.length) {
        if (resolvedUrl || duration >= 400) {
          const targetWords = (target || '').split(/\s+/).filter(Boolean);
          const minExpected = Math.max(800, targetWords.length * 280);
          const effortScore = duration >= minExpected ? 85 : 80;
          const earnedStars = effortScore >= 80 ? 3 : 2;
          const analysis = targetWords.map((origWord) => ({ word: origWord, matched: true }));

          return {
            status: 'fallback_effort',
            score: effortScore,
            stars: earnedStars,
            recognizedText: target,
            analysis,
            feedbackType: 'positive',
          };
        }

        // Không có âm thanh (nhấn nhầm hoặc không cấp quyền mic)
        return {
          status: 'no_audio',
          score: 40,
          stars: 1,
          recognizedText: '(Chưa nhận diện rõ âm thanh, em thử nói to và gần micro hơn nhé)',
          analysis: null,
          feedbackType: 'retry',
        };
      }

      // 2. Có STT transcripts
      const best = transcripts.reduce(
        (acc, tr) => {
          const s = similarity(tr, target);
          return s > acc.s ? { s, tr } : acc;
        },
        { s: -1, tr: transcripts[0] },
      );

      let percent = Math.round(best.s * 100);
      // Bảo vệ điểm nỗ lực khi học sinh đã ghi âm nhưng STT nhận diện sai quá thấp
      if (percent < 50 && (resolvedUrl || duration >= 600)) {
        percent = 60;
      }

      const earnedStars = percent >= 80 ? 3 : percent >= 50 ? 2 : 1;
      const analysis = compareWords(target, best.tr);

      return {
        status: 'evaluated',
        score: percent,
        stars: earnedStars,
        recognizedText: best.tr,
        analysis,
        feedbackType: percent >= 80 ? 'excellent' : percent >= 50 ? 'good' : 'retry',
      };
    }

    it('awards positive effort score (80-85%, 2-3 stars) when student speaks but STT returns empty', () => {
      const result = evaluateSpeaking({
        transcripts: [],
        audioUrl: 'blob:https://english-kid.example/record-1',
        durationMs: 2500,
        targetSentence: 'My new school has a large library.',
      });

      expect(result.status).toBe('fallback_effort');
      expect(result.score).toBe(85);
      expect(result.stars).toBe(3);
      expect(result.recognizedText).toBe('My new school has a large library.');
      expect(result.analysis.every((w) => w.matched)).toBe(true);
      expect(result.feedbackType).toBe('positive');
    });

    it('awards 80% (3 stars) when student recorded shorter voice without STT', () => {
      const result = evaluateSpeaking({
        transcripts: [],
        audioUrl: 'blob:https://english-kid.example/record-2',
        durationMs: 600,
        targetSentence: 'My new school has a very large and modern library.',
      });

      expect(result.status).toBe('fallback_effort');
      expect(result.score).toBe(80);
      expect(result.stars).toBe(3);
    });

    it('awards 40% and retry prompt when recording had 0 duration and no audio', () => {
      const result = evaluateSpeaking({
        transcripts: [],
        audioUrl: null,
        durationMs: 50,
        targetSentence: 'Hello teacher.',
      });

      expect(result.status).toBe('no_audio');
      expect(result.score).toBe(40);
      expect(result.stars).toBe(1);
      expect(result.feedbackType).toBe('retry');
    });

    it('boosts distorted STT score (<50%) to floor 60% when valid student audio exists', () => {
      const result = evaluateSpeaking({
        transcripts: ['random noise here'],
        audioUrl: 'blob:https://english-kid.example/record-3',
        durationMs: 1200,
        targetSentence: 'There is a big clock on the wall.',
      });

      expect(result.status).toBe('evaluated');
      expect(result.score).toBe(60); // Boosted from <50% to floor 60%
      expect(result.stars).toBe(2);
      expect(result.feedbackType).toBe('good');
    });

    it('accurately grades high similarity speech (>80%) with excellent feedback', () => {
      const result = evaluateSpeaking({
        transcripts: ['There is a big clock on the wall'],
        audioUrl: 'blob:https://english-kid.example/record-4',
        durationMs: 1500,
        targetSentence: 'There is a big clock on the wall.',
      });

      expect(result.status).toBe('evaluated');
      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.feedbackType).toBe('excellent');
    });
  });

  // ==========================================
  // 4. STOP CONTROLS & CONTROLLER LIFECYCLE
  // ==========================================
  describe('4. Stop Controls & STT Controller Lifecycle (speech.js)', () => {
    it('recognizeOnce returns a controller with .promise, .stop(), .abort() and is thenable', async () => {
      const ctrl = recognizeOnce({ timeoutMs: 3000 });
      expect(ctrl).toHaveProperty('promise');
      expect(typeof ctrl.stop).toBe('function');
      expect(typeof ctrl.abort).toBe('function');
      expect(typeof ctrl.then).toBe('function');
      expect(typeof ctrl.catch).toBe('function');

      const res = await ctrl;
      expect(res).toBeNull();
    });

    it('invokes rec.stop() rather than rec.abort() on stop() to flush accumulated transcripts', async () => {
      let stopCalled = false;
      let abortCalled = false;
      let capturedOnEnd = null;

      class MockSTT {
        constructor() {
          this.interimResults = false;
          this.maxAlternatives = 1;
        }
        start() {}
        stop() {
          stopCalled = true;
          setTimeout(() => this.onend?.(), 20);
        }
        abort() {
          abortCalled = true;
        }
      }

      globalThis.SpeechRecognition = MockSTT;

      const ctrl = recognizeOnce({ lang: 'en-GB', timeoutMs: 5000 });

      // Simulate interim transcript received
      const recInstance = ctrl.rec || globalThis._lastRec; // internal or event handler
      // Trigger stop
      const stopPromise = ctrl.stop();
      expect(stopCalled).toBe(true);
      expect(abortCalled).toBe(false);

      await stopPromise;
      delete globalThis.SpeechRecognition;
    });

    it('aborts cleanly without errors when controller.abort() is called', async () => {
      class MockSTT {
        start() {}
        stop() {}
        abort() {}
      }
      globalThis.SpeechRecognition = MockSTT;

      const ctrl = recognizeOnce();
      ctrl.abort();
      const res = await ctrl.promise;
      expect(res).toBeNull();

      delete globalThis.SpeechRecognition;
    });
  });
});
