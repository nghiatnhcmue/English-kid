import { describe, it, expect } from 'vitest';
import {
  ALL_GRADES,
  EDUCATION_LEVELS,
  getEducationLevel,
  getLevelIcon,
} from '../constants/educationLevels.js';
import {
  resolveQuestionType,
  normalizeAnswerText,
  splitBlankSentence,
  extractScrambledWords,
  getExpectedAnswerText,
  gradeQuestionAnswer,
} from './questionGrading.js';
import { compareWords, evaluateSpeechAttempt } from './speechScoring.js';
import {
  cleanGrammarQuestion,
  cleanReadingQuestion,
  cleanWritingItem,
  normalizeWritingContainer,
  withLegacyWritingFields,
} from './storage/normalizers.js';
import { buildAssignmentTargetLink } from '../components/home/AssignmentBanner.jsx';

describe('Refactored Shared Modules & Utilities', () => {
  describe('constants/educationLevels', () => {
    it('covers all 12 grades across Primary, Secondary, and High School without gaps', () => {
      expect(ALL_GRADES).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const flattened = EDUCATION_LEVELS.flatMap((lvl) => lvl.grades);
      expect(flattened).toEqual(ALL_GRADES);
    });

    it('resolves education level and icon accurately for each grade tier', () => {
      expect(getEducationLevel(1).id).toBe('primary');
      expect(getLevelIcon(5)).toBe('🎒');
      expect(getEducationLevel(6).id).toBe('secondary');
      expect(getLevelIcon(9)).toBe('🎓');
      expect(getEducationLevel(10).id).toBe('high');
      expect(getLevelIcon(12)).toBe('🏛️');
    });
  });

  describe('utils/questionGrading', () => {
    it('detects question types with fallback underscore detection', () => {
      expect(resolveQuestionType({ question: 'What is your name?' })).toBe('multiple_choice');
      expect(resolveQuestionType({ question: 'She ______ to school.' })).toBe('fill_blank');
      expect(resolveQuestionType({ type: 'unscramble', question: 'Arrange:' })).toBe('unscramble');
    });

    it('normalizes punctuation, case, and repeated spaces when grading answers', () => {
      expect(normalizeAnswerText('  We   visited Da Nang! ')).toBe('we visited da nang');
    });

    it('splits fill-in-the-blank sentences cleanly on underscores and brackets', () => {
      expect(splitBlankSentence('She ______ to school.')).toEqual({
        before: 'She ',
        after: ' to school.',
        hasBlankToken: true,
      });
      expect(splitBlankSentence('I [play] football.')).toEqual({
        before: 'I ',
        after: ' football.',
        hasBlankToken: true,
      });
    });

    it('grades all 4 question types accurately', () => {
      const mcq = { type: 'multiple_choice', options: ['go', 'goes', 'went'], answerIndex: 1 };
      expect(gradeQuestionAnswer(mcq, 1)).toBe(true);
      expect(gradeQuestionAnswer(mcq, 0)).toBe(false);

      const fill = { type: 'fill_blank', blankWord: 'goes' };
      expect(gradeQuestionAnswer(fill, '  Goes. ')).toBe(true);
      expect(gradeQuestionAnswer(fill, 'go')).toBe(false);

      const unscr = { type: 'unscramble', correctSentence: 'This is my new school.' };
      expect(extractScrambledWords(unscr)).toEqual(['This', 'is', 'my', 'new', 'school.']);
      expect(gradeQuestionAnswer(unscr, 'this is my new school')).toBe(true);
      expect(gradeQuestionAnswer(unscr, 'is this my new school')).toBe(false);

      const comp = {
        type: 'sentence_completion',
        correctAnswer: 'will stay at home',
        options: ['go out', 'will stay at home'],
        answerIndex: 1,
      };
      expect(gradeQuestionAnswer(comp, 1)).toBe(true);
      expect(gradeQuestionAnswer(comp, 'Will stay at home!')).toBe(true);
      expect(getExpectedAnswerText(comp)).toBe('will stay at home');
    });
  });

  describe('utils/speechScoring', () => {
    it('awards 0% and 0 stars when silent (hasVoice = false)', () => {
      const res = evaluateSpeechAttempt({
        transcripts: [],
        targetSentence: 'Hello teacher',
        audioStats: { hasVoice: false },
      });
      expect(res.scorePercent).toBe(0);
      expect(res.stars).toBe(0);
      expect(res.wordAnalysis.every((w) => !w.matched)).toBe(true);
    });

    it('awards 35% and 1 star when voice is detected by VAD but STT yields no English words', () => {
      const res = evaluateSpeechAttempt({
        transcripts: [],
        targetSentence: 'Hello teacher',
        audioStats: { hasVoice: true },
      });
      expect(res.scorePercent).toBe(35);
      expect(res.stars).toBe(1);
    });

    it('scores accurate transcripts with 3 stars and word-level matches', () => {
      const res = evaluateSpeechAttempt({
        transcripts: ['i go to school every day'],
        targetSentence: 'I go to school every day.',
        audioStats: { hasVoice: true },
      });
      expect(res.scorePercent).toBeGreaterThanOrEqual(90);
      expect(res.stars).toBe(3);
      expect(compareWords('I go', 'i go')).toEqual([
        { word: 'I', matched: true },
        { word: 'go', matched: true },
      ]);
    });
  });

  describe('utils/storage/normalizers & assignment links', () => {
    it('normalizes grammar, reading, and writing items consistently', () => {
      const gq = cleanGrammarQuestion({ question: ' Test? ', options: [' A ', ' B '], answerIndex: 1 });
      expect(gq).toEqual({
        question: 'Test?',
        options: ['A', 'B'],
        answerIndex: 1,
        explain: 'Áp dụng quy tắc ngữ pháp bài học.',
        isCustom: true,
      });

      const rq = cleanReadingQuestion({ question: 'She ___ home.', options: ['goes'], answerIndex: 0 }, { autoDetectFill: true });
      expect(rq.type).toBe('fill_blank');
      expect(rq.blankWord).toBe('goes');

      const wi = cleanWritingItem({ type: 'unscramble', correctSentence: 'I love English' });
      expect(wi.scrambledWords).toEqual(['I', 'love', 'English']);

      const legacyWrapped = normalizeWritingContainer({ correctSentence: 'Hello world' }, 3);
      expect(legacyWrapped.items).toHaveLength(1);
      expect(withLegacyWritingFields({}, [wi]).correctSentence).toBe('I love English');
    });

    it('builds accurate student target URLs for teacher assignments', () => {
      expect(buildAssignmentTargetLink({ scopeType: 'full_unit', unitId: 4 })).toBe('/unit/4');
      expect(
        buildAssignmentTargetLink({ scopeType: 'skill', selectedSkill: 'speaking', unitId: 'g7_u2' }),
      ).toBe('/speaking?unit=g7_u2');
      expect(
        buildAssignmentTargetLink({ scopeType: 'custom_words', unitId: 1, selectedWordIds: ['u1_1', 'u1_2'] }),
      ).toBe('/unit/1/flashcard?words=u1_1%2Cu1_2');
    });
  });
});
