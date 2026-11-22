/**
 * System Audit & Verification Suite (10-Point Checklist)
 *
 * 1. Grade 6 Units (12 units) standard structure & content completeness.
 * 2. Official Textbooks (15 books) metadata, schema, and PDF file existence.
 * 3. Multi-grade curriculum (170 units across 12 grades).
 * 4. Speech recognition controller (STT) lifecycle, interim results, and methods.
 * 5. Speech fallback scoring and word matching engine.
 * 6. Dialogue turn structure and multi-turn conversations.
 * 7. Teacher authentication (online flow; no hard-coded offline fallback).
 * 8. Student login PIN validation (local storage + online flow).
 * 9. ErrorBoundary fallback navigation URLs and cache-buster logic.
 * 10. Offline outbox queue, deduplication, and sync resilience.
 */

// Setup persistent localStorage mock before any storage/api imports
const mem = {};
globalThis.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: (k) => { delete mem[k]; },
  clear: () => { Object.keys(mem).forEach((k) => delete mem[k]); },
  key: (i) => Object.keys(mem)[i] ?? null,
  get length() { return Object.keys(mem).length; },
};

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';

// Curriculum and Books
import { listUnits, getUnit } from './data.js';
import {
  OFFICIAL_BOOKS,
  findOfficialBook,
  getBooksBySchoolLevel,
  getBooksByGrade,
} from '../data/officialBooks.js';
import multiGradeCurriculum from '../data/multiGradeCurriculum.json';

// Speech & Scoring
import { recognizeOnce, isSttSupported, stopSpeaking, playAudioFile, speak } from './speech.js';
import { createRecorder } from './recorder.js';
import { similarity, speakingLevel } from './scene.js';
import { compareWords } from '../components/stations/SpeakingStation.jsx';

// Auth, Storage & API
import {
  loginTeacher,
  verifyTeacherSession,
  getTeacherToken,
  logoutTeacher,
  loginStudentOnline,
  enqueue,
  pendingCount,
  flushOutbox,
} from './api.js';
import { createStore, store } from './storage.js';

// Error Boundary
import ErrorBoundary from '../components/ErrorBoundary.jsx';

const until = async (cond) => {
  for (let i = 0; i < 100 && !cond(); i++) await new Promise((r) => setTimeout(r, 5));
};

describe('System Audit Checklist (10-Point Verification)', () => {
  // =========================================================================
  // CHECKPOINT 1: Grade 6 Curriculum Structure (12 Units)
  // =========================================================================
  describe('Checkpoint 1: Grade 6 Curriculum 12 Units Structure & Completeness', () => {
    const units = listUnits();

    it('contains exactly 12 registered units with proper IDs and metadata', () => {
      expect(units).toHaveLength(12);
      const unitIds = units.map((u) => u.unitId).sort((a, b) => a - b);
      expect(unitIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('each of the 12 units has all required stations: vocab, grammar, pronunciation, speaking, reading, writing, listening', () => {
      units.forEach(({ unitId }) => {
        const u = getUnit(unitId);
        expect(u, `Unit ${unitId} not found`).toBeDefined();

        // 1. Vocabulary
        expect(Array.isArray(u.vocabularies), `Unit ${unitId} missing vocabularies`).toBe(true);
        expect(u.vocabularies.length).toBeGreaterThanOrEqual(10);
        u.vocabularies.forEach((v) => {
          expect(v.word).toBeTruthy();
          expect(v.meaning).toBeTruthy();
          expect(v.phonetic).toMatch(/^\/.+\/$/);
          expect(v.exampleEn).toBeTruthy();
          expect(v.exampleVi).toBeTruthy();
        });

        // 2. Grammar
        expect(u.grammar, `Unit ${unitId} missing grammar`).toBeDefined();
        expect(u.grammar.title).toBeTruthy();
        expect(u.grammar.ruleVi).toBeTruthy();
        expect(u.grammar.formula).toBeTruthy();
        expect(u.grammar.quiz.length).toBeGreaterThanOrEqual(6);

        // 3. Pronunciation
        expect(u.pronunciation, `Unit ${unitId} missing pronunciation`).toBeDefined();
        expect(u.pronunciation.pair).toBeTruthy();
        expect(u.pronunciation.practiceQuiz.length).toBeGreaterThanOrEqual(4);

        // 4. Speaking & Dialogue
        expect(u.speaking, `Unit ${unitId} missing speaking`).toBeDefined();
        expect(u.speaking.targetSentence).toBeTruthy();
        expect(u.speaking.challenges.length).toBeGreaterThanOrEqual(6);
        expect(u.speaking.dialogueTitle).toBeTruthy();
        expect(u.speaking.dialogueLines.length).toBeGreaterThanOrEqual(8);

        // 5. Reading
        expect(u.reading, `Unit ${unitId} missing reading`).toBeDefined();
        expect(u.reading.passage.length).toBeGreaterThan(100);
        expect(u.reading.translation.length).toBeGreaterThan(100);
        expect(u.reading.questions.length).toBeGreaterThanOrEqual(5);

        // 6. Writing
        expect(u.writing, `Unit ${unitId} missing writing`).toBeDefined();
        const writingItems = u.writing.items || [];
        expect(writingItems.length).toBeGreaterThanOrEqual(4);

        // 7. Listening
        expect(u.listening, `Unit ${unitId} missing listening`).toBeDefined();
        expect(u.listening.transcript).toBeTruthy();
        expect(u.listening.question).toBeTruthy();
        expect(u.listening.options.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  // =========================================================================
  // CHECKPOINT 2: Official Textbooks (15 Books Metadata & Assets)
  // =========================================================================
  describe('Checkpoint 2: Official Textbooks (15 Books) Metadata and Files', () => {
    it('contains exactly 15 official textbooks covering Primary, Secondary, and High School', () => {
      expect(OFFICIAL_BOOKS).toHaveLength(15);
      const primary = getBooksBySchoolLevel('primary');
      const secondary = getBooksBySchoolLevel('secondary');
      const high = getBooksBySchoolLevel('high');

      expect(primary).toHaveLength(7);
      expect(secondary).toHaveLength(5);
      expect(high).toHaveLength(3);
      expect(primary.length + secondary.length + high.length).toBe(15);
    });

    it('each textbook contains valid metadata schema and download info', () => {
      OFFICIAL_BOOKS.forEach((book) => {
        expect(book.id).toBeTruthy();
        expect(book.grade).toBeGreaterThanOrEqual(1);
        expect(book.grade).toBeLessThanOrEqual(12);
        expect(['primary', 'secondary', 'high']).toContain(book.schoolLevel);
        expect(book.title).toBeTruthy();
        expect(book.shortTitle).toBeTruthy();
        expect(book.src).toMatch(/^\/pdf\/.*\.pdf$/);
        expect(book.downloadName).toMatch(/\.pdf$/);
        expect(book.pages).toBeTruthy();
      });
    });

    it('verifies every textbook PDF file exists in public/pdf/ and is not empty', () => {
      const publicDir = path.resolve(process.cwd(), 'public');
      OFFICIAL_BOOKS.forEach((book) => {
        const filePath = path.join(publicDir, book.src.replace(/^\//, ''));
        expect(fs.existsSync(filePath), `Missing PDF file for book ${book.id}: ${filePath}`).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.size, `File size too small for ${book.id}`).toBeGreaterThan(1_000_000);
      });
    });

    it('supports looking up books by id and grade', () => {
      const bookG6T1 = findOfficialBook('tap1');
      expect(bookG6T1.grade).toBe(6);
      expect(bookG6T1.shortTitle).toContain('T1');

      const booksGrade6 = getBooksByGrade(6);
      expect(booksGrade6).toHaveLength(2);
    });
  });

  // =========================================================================
  // CHECKPOINT 3: Multi-Grade Curriculum (170 Units)
  // =========================================================================
  describe('Checkpoint 3: Multi-Grade Curriculum 170 Units Catalog', () => {
    it('contains metadata and exactly 12 grades from Grade 1 to Grade 12', () => {
      expect(multiGradeCurriculum.metadata).toBeDefined();
      expect(multiGradeCurriculum.metadata.totalGrades).toBe(12);
      expect(multiGradeCurriculum.grades).toHaveLength(12);
      const gradeNumbers = multiGradeCurriculum.grades.map((g) => g.grade);
      expect(gradeNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('totals exactly 170 units across all grades with standard distributions', () => {
      let totalUnits = 0;
      const expectedCounts = {
        1: 16, 2: 16, 3: 20, 4: 20, 5: 20, // Tiểu học: 92
        6: 12, 7: 12, 8: 12, 9: 12,        // THCS: 48
        10: 10, 11: 10, 12: 10,            // THPT: 30
      };

      multiGradeCurriculum.grades.forEach((g) => {
        expect(g.units.length).toBe(expectedCounts[g.grade]);
        totalUnits += g.units.length;
      });

      expect(totalUnits).toBe(170);
    });

    it('references valid book IDs from OFFICIAL_BOOKS and correctly flags interactive availability', () => {
      const validBookIds = new Set(OFFICIAL_BOOKS.map((b) => b.id));
      multiGradeCurriculum.grades.forEach((g) => {
        expect(g.interactiveAvailable).toBe(true);

        g.textbooks.forEach((tb) => {
          expect(validBookIds.has(tb.bookId), `Invalid textbook id ${tb.bookId} in grade ${g.grade}`).toBe(true);
        });

        g.units.forEach((u) => {
          expect(validBookIds.has(u.bookId), `Invalid bookId ${u.bookId} in grade ${g.grade} unit ${u.unit}`).toBe(true);
          expect(u.title).toBeTruthy();
          expect(u.titleVi).toBeTruthy();
          expect([1, 2]).toContain(u.semester);
        });
      });
    });
  });

  // =========================================================================
  // CHECKPOINT 4: Speech Recognition Controller (STT) Lifecycle
  // =========================================================================
  describe('Checkpoint 4: Speech Recognition Controller (STT)', () => {
    it('returns a controller with promise, stop, abort, and thenable interface', () => {
      const controller = recognizeOnce({ lang: 'en-GB' });
      expect(controller).toBeDefined();
      expect(typeof controller.stop).toBe('function');
      expect(typeof controller.abort).toBe('function');
      expect(typeof controller.then).toBe('function');
      expect(controller.promise instanceof Promise).toBe(true);
    });

    it('gracefully resolves to null when Web Speech API is unavailable', async () => {
      const originalWindowSR = globalThis.window?.SpeechRecognition;
      const originalGlobalSR = globalThis.SpeechRecognition;
      if (globalThis.window) globalThis.window.SpeechRecognition = undefined;
      globalThis.SpeechRecognition = undefined;

      const result = await recognizeOnce();
      expect(result).toBeNull();

      if (globalThis.window) globalThis.window.SpeechRecognition = originalWindowSR;
      globalThis.SpeechRecognition = originalGlobalSR;
    });

    it('handles simulated recognition lifecycle, interim results, and stop()', async () => {
      let inst;
      class MockSpeechRecognition {
        constructor() {
          inst = this;
          this.lang = '';
          this.interimResults = false;
          this.maxAlternatives = 1;
        }
        start() {}
        stop() {
          if (this.onresult) {
            this.onresult({
              results: [
                Object.assign([{ transcript: 'hello world' }], { isFinal: true }),
              ],
            });
          }
          if (this.onend) this.onend();
        }
        abort() {
          if (this.onend) this.onend();
        }
      }

      globalThis.SpeechRecognition = MockSpeechRecognition;
      try {
        const controller = recognizeOnce({ lang: 'en-US' });
        expect(inst).toBeDefined();
        expect(inst.lang).toBe('en-US');

        // Call stop() and verify it collects final transcript
        const res = await controller.stop();
        expect(res).toBeDefined();
        expect(res.transcripts).toContain('hello world');
      } finally {
        delete globalThis.SpeechRecognition;
      }
    });

    it('enforces fast 2.2s timeout on remote audio vs 6.0s on local audio to prevent hanging', async () => {
      const origAudio = globalThis.Audio;
      class AuditFakeAudio {
        constructor(src) {
          this.src = src;
          this.listeners = {};
          this.playbackRate = 1;
        }
        addEventListener(type, fn) {
          (this.listeners[type] ||= []).push(fn);
        }
        play() {
          return Promise.resolve();
        }
        pause() {}
      }
      globalThis.Audio = AuditFakeAudio;

      vi.useFakeTimers();
      let remoteResolved = false;
      playAudioFile('https://dict.youdao.com/dictvoice?audio=umbrella').then(() => {
        remoteResolved = true;
      });

      await vi.advanceTimersByTimeAsync(2100);
      expect(remoteResolved).toBe(false);

      await vi.advanceTimersByTimeAsync(150);
      expect(remoteResolved).toBe(true);

      let localResolved = false;
      playAudioFile('/assets/audio/unit1/umbrella.mp3').then(() => {
        localResolved = true;
      });

      await vi.advanceTimersByTimeAsync(2500);
      expect(localResolved).toBe(false);

      await vi.advanceTimersByTimeAsync(3600);
      expect(localResolved).toBe(true);

      vi.useRealTimers();
      globalThis.Audio = origAudio;
    });

    it('recovers speech synthesis from pause and sets keepalive interval', async () => {
      let resumed = false;
      let spokenUtterance = null;
      const mockSynth = {
        speaking: false,
        pending: false,
        paused: true,
        resume: vi.fn(() => {
          resumed = true;
          mockSynth.paused = false;
        }),
        cancel: vi.fn(),
        speak: vi.fn((u) => {
          spokenUtterance = u;
        }),
        getVoices: () => [{ lang: 'en-GB', name: 'Google UK English' }],
      };

      class MockUtterance {
        constructor(text) {
          this.text = text;
        }
      }

      globalThis.speechSynthesis = mockSynth;
      globalThis.SpeechSynthesisUtterance = MockUtterance;

      const p = speak('Verification of speech cancellation recovery in system audit');
      await new Promise((r) => setTimeout(r, 60));

      expect(mockSynth.resume).toHaveBeenCalled();
      expect(mockSynth.speak).toHaveBeenCalled();
      expect(resumed).toBe(true);

      spokenUtterance?.onend?.();
      await p;

      delete globalThis.speechSynthesis;
      delete globalThis.SpeechSynthesisUtterance;
    });

    it('recorder checks for live track and does not reuse ended streams', async () => {
      let getUserMediaCount = 0;
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
              getUserMediaCount++;
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

      const recorder = createRecorder();
      await recorder.start();
      expect(getUserMediaCount).toBe(1);

      // Dead track -> start() must call getUserMedia again
      track.readyState = 'ended';
      await recorder.start();
      expect(getUserMediaCount).toBe(2);

      // Live track -> start() reuses stream
      track.readyState = 'live';
      await recorder.start();
      expect(getUserMediaCount).toBe(2);

      recorder.release();
      Object.defineProperty(globalThis, 'navigator', {
        value: origNav,
        configurable: true,
        writable: true,
      });
      globalThis.MediaRecorder = origMR;
    });
  });

  // =========================================================================
  // CHECKPOINT 5: Speech Fallback Scoring & Word Matching Engine
  // =========================================================================
  describe('Checkpoint 5: Speech Fallback Scoring & Word Matching Engine', () => {
    it('compareWords matches exact and case/punctuation insensitive words correctly', () => {
      const target = 'Hello, how are you today?';
      const spoken = 'hello HOW are you Today!';

      const result = compareWords(target, spoken);
      expect(result).toHaveLength(5);
      expect(result.every((r) => r.matched)).toBe(true);
    });

    it('compareWords identifies missing or unpronounced words accurately', () => {
      const target = 'I usually go to school by bicycle.';
      const spoken = 'I go to school by bus';

      const result = compareWords(target, spoken);
      const matched = result.filter((r) => r.matched).map((r) => r.word);
      const missed = result.filter((r) => !r.matched).map((r) => r.word);

      expect(matched).toEqual(['I', 'go', 'to', 'school', 'by']);
      expect(missed).toEqual(['usually', 'bicycle.']);
    });

    it('similarity and speakingLevel assign appropriate ratings based on similarity thresholds', () => {
      // 1.0 -> great (3 stars)
      const perfect = similarity('My house is in the countryside.', 'My house is in the countryside.');
      expect(perfect).toBe(1);
      expect(speakingLevel(perfect)).toBe('great');

      // Partial match
      const high = similarity('What is your favorite subject in school?', 'What is your favourite subject at school?');
      expect(high).toBeGreaterThanOrEqual(0.6);
      expect(['great', 'good']).toContain(speakingLevel(high));

      // Low match -> retry
      const low = similarity('completely different words', 'my uniform is blue');
      expect(low).toBeLessThan(0.4);
      expect(speakingLevel(low)).toBe('retry');
    });
  });

  // =========================================================================
  // CHECKPOINT 6: Dialogue Turn Structure & Multi-Turn Conversations
  // =========================================================================
  describe('Checkpoint 6: Dialogue Turn Structure & Multi-Turn Conversations', () => {
    it('all 12 units have Getting Started multi-turn dialogue with alternating speakers', () => {
      const units = listUnits();
      units.forEach(({ unitId }) => {
        const u = getUnit(unitId);
        const { dialogueLines } = u.speaking;
        expect(dialogueLines.length).toBeGreaterThanOrEqual(8);

        const speakers = new Set(dialogueLines.map((l) => l.speaker));
        expect(speakers.size).toBeGreaterThanOrEqual(2);

        dialogueLines.forEach((line) => {
          expect(line.speaker).toBeTruthy();
          expect(line.sentenceEn).toBeTruthy();
          expect(line.meaningVi).toBeTruthy();
          expect(line.phonetic).toMatch(/^\/.+\/$/);
          expect(line.tipsVi).toBeTruthy();
        });
      });
    });
  });

  // =========================================================================
  // CHECKPOINT 7: Teacher Authentication (Online & Offline GV01/123456789)
  // =========================================================================
  describe('Checkpoint 7: Teacher Authentication (Online & Offline Emergency Fallback)', () => {
    beforeEach(() => {
      globalThis.localStorage.clear();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('validates that empty credentials return friendly error', async () => {
      const emptyUser = await loginTeacher('', '123456');
      expect(emptyUser.success).toBe(false);
      expect(emptyUser.error).toContain('Vui lòng nhập');

      const emptyPass = await loginTeacher('GV01', '');
      expect(emptyPass.success).toBe(false);
    });

    it('GV01 / 123456789 KHÔNG còn là tài khoản khẩn cấp khi mất mạng', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      const res = await loginTeacher('gv01', '123456789');
      expect(res.success).toBe(false);
      expect(getTeacherToken()).toBeNull();
      expect(store().getTeacherSession()).toBeFalsy();
    });

    it('GV01 KHÔNG đăng nhập được khi máy chủ trả 404 / 503', async () => {
      for (const status of [404, 503]) {
        globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'x' }), { status }));
        const res = await loginTeacher('GV01', '123456789');
        expect(res.success).toBe(false);
        expect(getTeacherToken()).toBeNull();
      }
    });

    it('phiên cục bộ "local-gv01-session" còn sót từ bản cũ bị xóa', async () => {
      globalThis.localStorage.setItem('app_tienganh_v1_teacher_token', JSON.stringify('local-gv01-session'));
      store().setTeacherSession({ id: 'gv01_local', username: 'GV01' });
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      expect(await verifyTeacherSession()).toBe(false);
      expect(getTeacherToken()).toBeNull();
    });

    it('offline mode rejects incorrect credentials and does NOT authenticate', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      // Wrong password for GV01
      const wrongPass = await loginTeacher('GV01', 'wrongpassword');
      expect(wrongPass.success).toBe(false);
      expect(getTeacherToken()).toBeNull();

      // Different user offline
      const otherUser = await loginTeacher('other_teacher', '123456789');
      expect(otherUser.success).toBe(false);
      expect(getTeacherToken()).toBeNull();
    });

    it('online mode logs in successfully when server returns 200 with session data', async () => {
      globalThis.fetch = vi.fn(async (url) => {
        if (String(url).includes('/api/auth/teacher/login')) {
          return new Response(
            JSON.stringify({
              token: 'token-teacher-online-123',
              teacher: { id: 't1', username: 'cohien', displayName: 'Cô Hiền' },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const res = await loginTeacher('cohien', 'matkhau123');
      expect(res.success).toBe(true);
      expect(getTeacherToken()).toBe('token-teacher-online-123');
      expect(store().getTeacherSession().displayName).toBe('Cô Hiền');
    });
  });

  // =========================================================================
  // CHECKPOINT 8: Student Login PIN Validation (Local & Online)
  // =========================================================================
  describe('Checkpoint 8: Student Login PIN Validation', () => {
    it('local storage loginStudent checks credentials and rejects incorrect/missing PIN', () => {
      const memory = {};
      const fakeStorage = {
        getItem: (k) => memory[k] ?? null,
        setItem: (k, v) => { memory[k] = String(v); },
        removeItem: (k) => { delete memory[k]; },
      };
      const testStore = createStore(fakeStorage);

      testStore.saveStudent({
        id: 'stu_audit_1',
        username: 'student_audit',
        name: 'Trần Văn Kiểm Tra',
        class: '6A1',
        password: '4821',
      });

      // Correct username and PIN
      const ok = testStore.loginStudent('student_audit', '4821');
      expect(ok.success).toBe(true);
      expect(ok.student.name).toBe('Trần Văn Kiểm Tra');
      expect(testStore.getCurrentStudent().id).toBe('stu_audit_1');

      // Incorrect PIN
      const wrongPin = testStore.loginStudent('student_audit', '9999');
      expect(wrongPin.success).toBe(false);
      expect(wrongPin.error).toContain('Mã PIN chưa đúng');

      // Unknown student
      const unknown = testStore.loginStudent('nonexistent', '1234');
      expect(unknown.success).toBe(false);
      expect(unknown.error).toContain('Không tìm thấy');
    });

    it('online student login validates PIN against backend and handles offline / error responses', async () => {
      // 1. Success online
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: 'token-stu-xyz',
            student: { id: 's1', name: 'Trần Bình', class: '6A1' },
          }),
          { status: 200 }
        )
      );

      const resOk = await loginStudentOnline('s1', '1357');
      expect(resOk.success).toBe(true);
      expect(resOk.student.name).toBe('Trần Bình');

      // 2. Incorrect PIN from server (401)
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 'Mã PIN không đúng' }),
          { status: 401 }
        )
      );

      const resFail = await loginStudentOnline('s1', '0000');
      expect(resFail.success).toBe(false);
      expect(resFail.error).toContain('Mã PIN không đúng');

      // 3. Offline server
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Network Error'));
      const resOffline = await loginStudentOnline('s1', '1357');
      expect(resOffline.success).toBe(false);
      expect(resOffline.offline).toBe(true);
    });
  });

  // =========================================================================
  // CHECKPOINT 9: ErrorBoundary Fallback URLs & Cache-Buster Logic
  // =========================================================================
  describe('Checkpoint 9: ErrorBoundary Fallback URLs & Cache-Buster Logic', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('getDerivedStateFromError updates state to capture error', () => {
      const err = new Error('ChunkLoadError: Failed to load module');
      const state = ErrorBoundary.getDerivedStateFromError(err);
      expect(state).toEqual({ hasError: true, error: err });
    });

    it('handleReload purges service workers, deletes caches, and appends ?refresh= cache-buster', async () => {
      const unregisterMock = vi.fn().mockResolvedValue(true);
      const cacheDeleteMock = vi.fn().mockResolvedValue(true);

      vi.stubGlobal('navigator', {
        serviceWorker: {
          getRegistrations: vi.fn().mockResolvedValue([{ unregister: unregisterMock }]),
        },
      });

      const mockCaches = {
        keys: vi.fn().mockResolvedValue(['cache-v1', 'cache-v2']),
        delete: cacheDeleteMock,
      };

      vi.stubGlobal('caches', mockCaches);

      const mockLocation = {
        origin: 'https://english.edu.vn',
        pathname: '/app',
        href: '',
        hash: '',
        reload: vi.fn(),
      };
      vi.stubGlobal('window', {
        location: mockLocation,
        caches: mockCaches,
      });

      const boundary = new ErrorBoundary({});
      boundary.setState = vi.fn();

      await boundary.handleReload();

      expect(unregisterMock).toHaveBeenCalledTimes(1);
      expect(cacheDeleteMock).toHaveBeenCalledWith('cache-v1');
      expect(cacheDeleteMock).toHaveBeenCalledWith('cache-v2');
      expect(mockLocation.href).toMatch(/^https:\/\/english\.edu\.vn\/app\?refresh=\d+$/);
    });

    it('render output provides friendly kid-facing fallback with Home and Teacher routes', () => {
      const boundary = new ErrorBoundary({});
      boundary.state = {
        hasError: true,
        error: new Error('Critical Rendering Glitch'),
      };

      const rendered = boundary.render();
      expect(rendered).toBeDefined();

      // Check structure of rendered element
      expect(rendered.type).toBe('div');
      const content = JSON.stringify(rendered);
      expect(content).toContain('Úi! Trang cần được làm mới');
      expect(content).toContain('Làm mới & Vào học ngay');
      expect(content).toContain('Về trang chủ');
      expect(content).toContain('Góc Giáo viên');
      expect(content).toContain('Critical Rendering Glitch');
    });
  });

  // =========================================================================
  // CHECKPOINT 10: Offline Outbox Queue & Sync Resilience
  // =========================================================================
  describe('Checkpoint 10: Offline Outbox Queue & Sync Resilience', () => {
    beforeEach(() => {
      globalThis.localStorage.clear();
      // Set student session token so flushOutbox can process
      mem.app_tienganh_v1_student_token = JSON.stringify('token-student-session');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('enqueues items, respects deduplication key, and correctly tracks pendingCount', () => {
      enqueue('score', { kind: 'test', score: 10 }, 'score-test-1');
      expect(pendingCount()).toBe(1);

      // Attempt to re-enqueue same dedupe key -> should be ignored
      enqueue('score', { kind: 'test', score: 10 }, 'score-test-1');
      expect(pendingCount()).toBe(1);

      // Enqueue different item
      enqueue('score', { kind: 'test', score: 9 }, 'score-test-2');
      expect(pendingCount()).toBe(2);
    });

    it('flushOutbox transmits pending items and prunes queue upon server 200', async () => {
      const calls = [];
      let release;
      let first = true;
      globalThis.fetch = vi.fn(async (path, opts) => {
        calls.push({ path, body: JSON.parse(opts.body) });
        if (first) {
          first = false;
          await new Promise((r) => (release = r));
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      });

      enqueue('submission', { assignmentId: 'asg-1', score: 10 }, 'sub-1');
      await until(() => calls.length === 1);
      enqueue('score', { kind: 'unit_test', score: 8 }, 'score-3');
      release();

      await until(() => calls.length === 2 && pendingCount() === 0);

      expect(calls.map((c) => c.path)).toEqual(['/api/submissions', '/api/scores']);
      expect(pendingCount()).toBe(0);
    });

    it('retains queued items in outbox when network is offline', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Network Error'));

      enqueue('score', { kind: 'offline_station', score: 9.5 }, 'offline-item');
      expect(pendingCount()).toBeGreaterThanOrEqual(1);

      await flushOutbox();

      // Remains in queue due to offline failure
      expect(pendingCount()).toBeGreaterThanOrEqual(1);
    });
  });
});
