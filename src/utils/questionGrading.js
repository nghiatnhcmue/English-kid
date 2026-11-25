/**
 * Tiện ích nhận diện loại câu hỏi, tách câu đục lỗ và chấm điểm thống nhất
 * cho ReadingStation, WritingStation và AssignmentQuizModal.
 */

export function resolveQuestionType(q) {
  if (!q) return 'multiple_choice';
  if (q.type) return q.type;
  return q.question?.includes('_') ? 'fill_blank' : 'multiple_choice';
}

export function normalizeAnswerText(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[.!?,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitBlankSentence(rawSentence) {
  const text = String(rawSentence || '______');
  const parts = text.split(/_{2,}|\[[^\]]+\]/);
  return {
    before: parts[0] || '',
    after: parts[1] || '',
    hasBlankToken: parts.length > 1,
  };
}

export function extractScrambledWords(q) {
  if (Array.isArray(q?.scrambledWords) && q.scrambledWords.length > 0) {
    return q.scrambledWords;
  }
  return String(q?.correctSentence || '')
    .split(/\s+/)
    .filter(Boolean);
}

export function makeWordTokens(words, prefix = 'tok') {
  const stamp = Date.now();
  return (words || []).map((w, idx) => ({
    id: `${prefix}_${idx}_${w}_${stamp}`,
    word: w,
  }));
}

export function getExpectedAnswerText(q) {
  const type = resolveQuestionType(q);
  if (type === 'multiple_choice') {
    return q?.options?.[q?.answerIndex] || String.fromCharCode(65 + (q?.answerIndex || 0));
  }
  if (type === 'fill_blank') {
    return q?.blankWord || q?.options?.[q?.answerIndex] || '';
  }
  if (type === 'unscramble') {
    return q?.correctSentence || '';
  }
  return q?.correctAnswer || q?.correctSentence || q?.blankWord || q?.options?.[q?.answerIndex] || '';
}

export function gradeQuestionAnswer(q, userAnswer) {
  if (!q) return false;
  const type = resolveQuestionType(q);

  if (type === 'multiple_choice') {
    return typeof userAnswer === 'number' && userAnswer === q.answerIndex;
  }

  if (type === 'fill_blank') {
    const target = q.blankWord || (q.options ? q.options[q.answerIndex] : '');
    return Boolean(target) && normalizeAnswerText(userAnswer) === normalizeAnswerText(target);
  }

  if (type === 'unscramble') {
    const target = q.correctSentence || '';
    return Boolean(target) && normalizeAnswerText(userAnswer) === normalizeAnswerText(target);
  }

  if (type === 'sentence_completion') {
    if (typeof userAnswer === 'number' && Array.isArray(q.options)) {
      return userAnswer === q.answerIndex;
    }
    const candidates = [
      q.correctAnswer,
      q.blankWord,
      q.correctSentence,
      q.options ? q.options[q.answerIndex] : '',
    ].filter(Boolean);
    const normUser = normalizeAnswerText(userAnswer);
    return normUser.length > 0 && candidates.some((c) => normUser === normalizeAnswerText(c));
  }

  return false;
}
