/**
 * Bộ hàm chuẩn hóa dữ liệu câu hỏi / bài đọc / bài viết của Giáo viên trước khi lưu vào Custom Units.
 */

export function cleanGrammarQuestion(q) {
  return {
    question: String(q?.question || '').trim(),
    options: Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()) : [],
    answerIndex: Number(q?.answerIndex) || 0,
    explain: q?.explain ? String(q.explain).trim() : 'Áp dụng quy tắc ngữ pháp bài học.',
    isCustom: true,
  };
}

export function cleanReadingQuestion(q, { autoDetectFill = false } = {}) {
  const qType = q?.type || (autoDetectFill && q?.question?.includes('_') ? 'fill_blank' : 'multiple_choice');
  const fallbackBlank = autoDetectFill && q?.options ? q.options[q.answerIndex || 0] : '';
  return {
    id: q?.id || `rq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: qType,
    question: String(q?.question || '').trim(),
    prompt: String(q?.prompt || '').trim(),
    blankWord: String(q?.blankWord || fallbackBlank || '').trim(),
    correctSentence: String(q?.correctSentence || '').trim(),
    correctAnswer: String(q?.correctAnswer || '').trim(),
    scrambledWords:
      Array.isArray(q?.scrambledWords) && q.scrambledWords.length > 0
        ? q.scrambledWords.map((w) => String(w).trim()).filter(Boolean)
        : q?.correctSentence
        ? String(q.correctSentence).trim().split(/\s+/).filter(Boolean)
        : [],
    options: Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : [],
    answerIndex: Number(q?.answerIndex) || 0,
    explain: q?.explain ? String(q.explain).trim() : 'Dựa vào thông tin chi tiết trong đoạn văn đọc hiểu.',
    isCustom: true,
  };
}

export function cleanWritingItem(item) {
  const isFill = item?.type === 'fill_blank';
  const cleanSentence = String(item?.sentence || item?.correctSentence || '').trim();
  const cleanCorrect = String(item?.correctSentence || item?.sentence || '').trim();

  return {
    id: item?.id || `write_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: isFill ? 'fill_blank' : 'unscramble',
    sentence: cleanSentence,
    correctSentence: cleanCorrect,
    blankWord: String(item?.blankWord || '').trim(),
    options: Array.isArray(item?.options) ? item.options.map((o) => String(o).trim()).filter(Boolean) : [],
    scrambledWords:
      Array.isArray(item?.scrambledWords) && item.scrambledWords.length > 0
        ? item.scrambledWords.map((w) => String(w).trim()).filter(Boolean)
        : cleanCorrect.split(/\s+/).filter(Boolean),
    meaningVi: String(item?.meaningVi || '').trim(),
    hint: String(item?.hint || '').trim(),
    isCustom: true,
  };
}

export function normalizeWritingContainer(raw, unitId) {
  if (!raw) return null;
  if (Array.isArray(raw.items) && raw.items.length > 0) return raw;
  if (raw.correctSentence) {
    return {
      ...raw,
      items: [
        {
          id: `u${unitId}_write_base`,
          type: raw.type || 'unscramble',
          sentence: raw.correctSentence,
          correctSentence: raw.correctSentence,
          scrambledWords: raw.scrambledWords || raw.correctSentence.split(' '),
          blankWord: raw.blankWord || '',
          options: raw.options || [],
          meaningVi: raw.meaningVi || '',
          hint: raw.hint || '',
        },
      ],
    };
  }
  return raw;
}

export function withLegacyWritingFields(currentWriting, items) {
  return {
    ...currentWriting,
    items,
    correctSentence: items[0]?.correctSentence || '',
    scrambledWords: items[0]?.scrambledWords || [],
    meaningVi: items[0]?.meaningVi || '',
    type: items[0]?.type || 'unscramble',
  };
}
