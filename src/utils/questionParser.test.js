import { describe, it, expect } from 'vitest';
import { parseBatchQuestions, parseBatchAny } from './questionParser.js';

describe('parseBatchQuestions', () => {
  it('parses standard multiline questions with asterisk mark', () => {
    const raw = `
1. Nam ______ his school uniform every Monday.
A. wear
B. wears*
C. wearing
D. to wear

2. Where does your father work?
A. In a hospital*
B. At home
C. By motorbike
D. On Sunday
    `;

    const result = parseBatchQuestions(raw);
    expect(result).toHaveLength(2);

    expect(result[0].question).toBe('Nam ______ his school uniform every Monday.');
    expect(result[0].options).toEqual(['wear', 'wears', 'wearing', 'to wear']);
    expect(result[0].answerIndex).toBe(1);

    expect(result[1].question).toBe('Where does your father work?');
    expect(result[1].options).toEqual(['In a hospital', 'At home', 'By motorbike', 'On Sunday']);
    expect(result[1].answerIndex).toBe(0);
  });

  it('parses questions with "Câu 1:" prefix and "Đáp án: B" line', () => {
    const raw = `
Câu 1: I ______ my maths homework after dinner.
A. do
B. does
C. doing
D. did
Đáp án: A
Giải thích: Chủ ngữ I đi với động từ nguyên mẫu do.

Câu 2: They ______ football in the park right now.
A. plays
B. is playing
C. are playing
D. played
Đáp án: C
    `;

    const result = parseBatchQuestions(raw);
    expect(result).toHaveLength(2);

    expect(result[0].question).toBe('I ______ my maths homework after dinner.');
    expect(result[0].answerIndex).toBe(0);
    expect(result[0].explain).toContain('Chủ ngữ I đi với động từ nguyên mẫu do.');

    expect(result[1].question).toBe('They ______ football in the park right now.');
    expect(result[1].answerIndex).toBe(2);
  });

  it('handles inline options A. xxx B. yyy C. zzz D. ttt', () => {
    const raw = `
1. She is a ______ student.
A. good*  B. well  C. badly  D. better
    `;

    const result = parseBatchQuestions(raw);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe('She is a ______ student.');
    expect(result[0].options).toEqual(['good', 'well', 'badly', 'better']);
    expect(result[0].answerIndex).toBe(0);
  });

  it('handles empty or garbage input gracefully', () => {
    expect(parseBatchQuestions('')).toEqual([]);
    expect(parseBatchQuestions('   \n  \n')).toEqual([]);
    expect(parseBatchQuestions('Just some random text without options')).toEqual([]);
  });
});

describe('parseBatchAny for external exercises', () => {
  it('parses multiple choice questions and fill-in-the-blank automatically', () => {
    const raw = `
1. My brother ______ English every day.
A. study
B. studies*
C. studying
D. to study

2. Where are you from?
A. I am from Vietnam*
B. I am fine
C. Yes, please
D. At 6 o'clock
    `;

    const result = parseBatchAny(raw);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('fill_blank');
    expect(result[0].blankWord).toBe('studies');
    expect(result[1].type).toBe('multiple_choice');
    expect(result[1].answerIndex).toBe(0);
  });

  it('parses unscramble sentence items', () => {
    const raw = `
This / is / my / new / calculator -> Đây là máy tính mới của tôi
We / love / learning / English -> Chúng tôi yêu thích học tiếng Anh
    `;

    const result = parseBatchAny(raw);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('unscramble');
    expect(result[0].correctSentence).toBe('This is my new calculator');
    expect(result[1].type).toBe('unscramble');
    expect(result[1].correctSentence).toBe('We love learning English');
  });
});


