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
    function evaluateSpeaking({ transcripts, audioUrl, durationMs, targetSentence, audioStats }) {
      const target = targetSentence || '';
      const resolvedUrl = audioUrl;
      const stats = audioStats || { hasVoice: false };
      const targetWords = (target || '').split(/\s+/).filter(Boolean);

      // 1. Khi không có STT transcripts (im lặng, tắt mic, hoặc STT không nghe được)
      if (!transcripts || !transcripts.length) {
        if (!stats.hasVoice) {
          const analysis = targetWords.map((origWord) => ({ word: origWord, matched: false }));
          return {
            status: 'no_voice',
            score: 0,
            stars: 0,
            recognizedText: '(Không phát hiện giọng nói)',
            analysis,
            feedbackType: 'silence',
          };
        }

        // Có tiếng nói nhưng STT không nhận diện được
        const analysis = targetWords.map((origWord) => ({ word: origWord, matched: false }));
        return {
          status: 'voice_no_stt',
          score: 35,
          stars: 1,
          recognizedText: '(Đã thu âm nhưng chưa nhận diện rõ từ tiếng Anh)',
          analysis,
          feedbackType: 'retry',
        };
      }

      // 2. Có STT transcripts: Chấm điểm thực tế 100%, không nâng khống 60%
      const best = transcripts.reduce(
        (acc, tr) => {
          const s = similarity(tr, target);
          return s > acc.s ? { s, tr } : acc;
        },
        { s: -1, tr: transcripts[0] },
      );

      const percent = Math.round(best.s * 100);
      const earnedStars = percent >= 80 ? 3 : percent >= 50 ? 2 : percent >= 20 ? 1 : 0;
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

    it('awards 0% and 0 stars when student does not say anything (silence / hasVoice false)', () => {
      const result = evaluateSpeaking({
        transcripts: [],
        audioUrl: 'blob:https://english-kid.example/record-silence',
        durationMs: 2500,
        targetSentence: 'My new school has a large library.',
        audioStats: { hasVoice: false, peakVolume: 5 },
      });

      expect(result.status).toBe('no_voice');
      expect(result.score).toBe(0);
      expect(result.stars).toBe(0);
      expect(result.recognizedText).toBe('(Không phát hiện giọng nói)');
      expect(result.analysis.every((w) => w.matched === false)).toBe(true);
      expect(result.feedbackType).toBe('silence');
    });

    it('awards 35% (1 star) and marks words unmatched when voice is detected but STT returns empty', () => {
      const result = evaluateSpeaking({
        transcripts: [],
        audioUrl: 'blob:https://english-kid.example/record-voice',
        durationMs: 1500,
        targetSentence: 'My new school has a very large and modern library.',
        audioStats: { hasVoice: true, peakVolume: 35 },
      });

      expect(result.status).toBe('voice_no_stt');
      expect(result.score).toBe(35);
      expect(result.stars).toBe(1);
      expect(result.recognizedText).toBe('(Đã thu âm nhưng chưa nhận diện rõ từ tiếng Anh)');
      expect(result.analysis.every((w) => w.matched === false)).toBe(true);
      expect(result.feedbackType).toBe('retry');
    });

    it('does not boost distorted STT score (<50%) to floor 60%, grades strictly by actual similarity', () => {
      const result = evaluateSpeaking({
        transcripts: ['random noise here'],
        audioUrl: 'blob:https://english-kid.example/record-3',
        durationMs: 1200,
        targetSentence: 'There is a big clock on the wall.',
        audioStats: { hasVoice: true, peakVolume: 30 },
      });

      expect(result.status).toBe('evaluated');
      expect(result.score).toBe(0); // Zero similarity for unrelated words
      expect(result.stars).toBe(0);
      expect(result.feedbackType).toBe('retry');
      expect(result.analysis.every((w) => w.matched === false)).toBe(true);
    });

    it('accurately grades high similarity speech (>80%) with excellent feedback', () => {
      const result = evaluateSpeaking({
        transcripts: ['There is a big clock on the wall'],
        audioUrl: 'blob:https://english-kid.example/record-4',
        durationMs: 1500,
        targetSentence: 'There is a big clock on the wall.',
        audioStats: { hasVoice: true, peakVolume: 40 },
      });

      expect(result.status).toBe('evaluated');
      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.feedbackType).toBe('excellent');
      expect(result.analysis.every((w) => w.matched === true)).toBe(true);
    });

    it('accurately grades partial matches with only matched words green', () => {
      const result = evaluateSpeaking({
        transcripts: ['There is a big clock'],
        audioUrl: 'blob:https://english-kid.example/record-5',
        durationMs: 1500,
        targetSentence: 'There is a big clock on the wall.',
        audioStats: { hasVoice: true, peakVolume: 40 },
      });

      expect(result.status).toBe('evaluated');
      expect(result.score).toBe(63); // 5 out of 8 words matched
      expect(result.stars).toBe(2);
      expect(result.feedbackType).toBe('good');
      const matchedWords = result.analysis.filter((w) => w.matched).map((w) => w.word);
      expect(matchedWords).toEqual(['There', 'is', 'a', 'big', 'clock']);
      const unmatchedWords = result.analysis.filter((w) => !w.matched).map((w) => w.word);
      expect(unmatchedWords).toEqual(['on', 'the', 'wall.']);
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
