/**
 * Tiện ích phân tích đề trắc nghiệm dán từ Word / Zalo / PDF
 * Hỗ trợ các định dạng phổ biến của Giáo viên Tiếng Anh Việt Nam
 */

export function parseBatchQuestions(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const questionBlocks = [];
  let currentBlock = [];
  const qStartRegex = /^\s*(?:câu|question|bài)?\s*\d+[\.\:\)\/]\s+/i;

  for (const line of lines) {
    if (qStartRegex.test(line)) {
      if (currentBlock.length > 0) {
        questionBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      currentBlock.push(line);
    } else {
      if (currentBlock.length > 0) {
        currentBlock.push(line);
      } else if (line.trim()) {
        currentBlock.push(line);
      }
    }
  }

  if (currentBlock.length > 0) {
    questionBlocks.push(currentBlock.join('\n'));
  }

  // Nếu không phân tách được bằng số thứ tự (ví dụ chỉ có 1 câu không đánh số)
  if (questionBlocks.length === 0 && normalized.trim()) {
    questionBlocks.push(normalized.trim());
  }

  const results = [];
  for (const block of questionBlocks) {
    const parsed = parseSingleBlock(block);
    if (parsed && parsed.question && parsed.options.length >= 2) {
      results.push(parsed);
    }
  }

  return results;
}

function parseSingleBlock(block) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  let questionText = '';
  const options = [];
  let detectedAnswerIndex = -1;
  let explain = '';

  // Kiểm tra dòng đáp án cuối cùng: "Đáp án: B", "Answer: C", "Key: A", "Đ/a: D"
  const answerLineRegex = /^(?:đáp án|answer|key|đ\/a|da)\s*[\:\=\-]\s*([A-D])/i;
  // Kiểm tra dòng giải thích: "Giải thích: ...", "Explain: ..."
  const explainLineRegex = /^(?:giải thích|explain|lời giải)\s*[\:\=\-]\s*(.+)/i;

  const contentLines = [];

  for (const line of lines) {
    const ansMatch = line.match(answerLineRegex);
    if (ansMatch) {
      const letter = ansMatch[1].toUpperCase();
      detectedAnswerIndex = letter.charCodeAt(0) - 65; // A -> 0, B -> 1, ...
      continue;
    }

    const expMatch = line.match(explainLineRegex);
    if (expMatch) {
      explain = expMatch[1].trim();
      continue;
    }

    contentLines.push(line);
  }

  // Tách dòng câu hỏi và các dòng lựa chọn
  const optLineRegex = /^([A-D])[\.\:\)\/]\s*(.+)$/i;

  let collectingQuestion = true;
  const questionParts = [];

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];

    // Kiểm tra xem dòng này có chứa nhiều lựa chọn trên 1 dòng không: "A. xxx B. yyy C. zzz D. ttt"
    const inlineMatch = line.match(/(?:^|\s+)([A-D])[\.\:\)\/]\s+([^\n]+?)(?=(?:\s+[A-D][\.\:\)\/]|$))/gi);

    if (inlineMatch && inlineMatch.length >= 2) {
      collectingQuestion = false;
      for (const item of inlineMatch) {
        const m = item.trim().match(/^([A-D])[\.\:\)\/]\s*(.*)$/i);
        if (m) {
          const letter = m[1].toUpperCase();
          let optText = m[2].trim();
          const isMarked = optText.includes('*') || optText.toLowerCase().includes('(đúng)');
          optText = optText.replace(/\*/g, '').replace(/\(đúng\)/gi, '').trim();

          const oIdx = letter.charCodeAt(0) - 65;
          options[oIdx] = optText;
          if (isMarked) detectedAnswerIndex = oIdx;
        }
      }
      continue;
    }

    const singleMatch = line.match(optLineRegex);
    if (singleMatch) {
      collectingQuestion = false;
      const letter = singleMatch[1].toUpperCase();
      let optText = singleMatch[2].trim();
      const isMarked = optText.includes('*') || optText.toLowerCase().includes('(đúng)');
      optText = optText.replace(/\*/g, '').replace(/\(đúng\)/gi, '').trim();

      const oIdx = letter.charCodeAt(0) - 65;
      options[oIdx] = optText;
      if (isMarked) detectedAnswerIndex = oIdx;
    } else if (collectingQuestion) {
      questionParts.push(line);
    } else {
      // Dòng phụ tiếp nối của lựa chọn cuối cùng
      if (options.length > 0) {
        const lastIdx = options.length - 1;
        options[lastIdx] = `${options[lastIdx]} ${line}`.trim();
      }
    }
  }

  // Xóa số thứ tự đầu câu hỏi: "1. ", "Câu 1: ", "Question 1. "
  questionText = questionParts.join(' ').trim();
  questionText = questionText.replace(/^\s*(?:câu|question|bài)?\s*\d+[\.\:\)\/]\s*/i, '').trim();

  // Chuẩn hóa danh sách options (đảm bảo không có ô rỗng)
  const cleanOptions = [];
  for (let i = 0; i < 4; i++) {
    if (options[i]) {
      cleanOptions.push(options[i]);
    }
  }

  // Nếu không nhận diện được A, B, C, D rõ ràng, thử lấy các phần tử có sẵn
  if (cleanOptions.length === 0) {
    for (const opt of options) {
      if (opt) cleanOptions.push(opt);
    }
  }

  if (!questionText || cleanOptions.length < 2) return null;

  // Nếu chưa phát hiện đáp án đúng, mặc định là 0
  const finalAnswerIndex = detectedAnswerIndex >= 0 && detectedAnswerIndex < cleanOptions.length
    ? detectedAnswerIndex
    : 0;

  return {
    question: questionText,
    options: cleanOptions,
    answerIndex: finalAnswerIndex,
    explain: explain || 'Áp dụng kiến thức ngữ pháp và từ vựng bài học.',
  };
}

/**
 * Tiện ích phân tích bài tập Viết câu & Điền khuyết từ văn bản / Word
 */
export function parseBatchWriting(rawText) {
  if (!rawText || !rawText.trim()) return [];

  // Nếu đề thi có định dạng trắc nghiệm 4 đáp án A, B, C, D và có chỗ trống ____
  const qList = parseBatchQuestions(rawText);
  if (qList.length > 0 && qList.some((q) => q.question.includes('_'))) {
    return qList.map((q) => {
      const isFill = q.question.includes('_');
      const correctWord = q.options[q.answerIndex] || '';
      return {
        type: isFill ? 'fill_blank' : 'unscramble',
        sentence: q.question,
        blankWord: correctWord,
        options: q.options,
        correctSentence: isFill ? q.question.replace(/_{2,}/g, correctWord).replace(/\s+/g, ' ').trim() : q.question,
        scrambledWords: isFill ? [] : q.question.split(/\s+/).filter(Boolean).sort(() => Math.random() - 0.5),
        meaningVi: q.explain || '',
        hint: q.explain || '',
      };
    });
  }

  // Tách từng dòng câu viết / câu điền khuyết
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items = [];
  let currentItem = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/^\s*(?:câu|question|bài)?\s*\d+[\.\:\)\/]\s*/i, '').trim();
    if (!line) continue;

    // Kiểm tra dòng đáp án hoặc giải thích
    const isAnswerKey = /^(?:đáp\s*án|answer|key)[\s\:\=]/i.test(line);
    const isExplanation = /^(?:giải\s*thích|nghĩa|dịch|gợi\s*ý|hint|explain)[\s\:\=]/i.test(line) || line.startsWith('->') || line.startsWith('=>');

    if (isAnswerKey) {
      const ans = line.replace(/^(?:đáp\s*án|answer|key)[\s\:\=]+/i, '').trim();
      if (currentItem) {
        currentItem.correctSentence = ans;
        if (!currentItem.blankWord && currentItem.type === 'fill_blank') {
          currentItem.blankWord = ans;
          currentItem.options = [ans];
        }
      }
      continue;
    }

    if (isExplanation) {
      const expl = line.replace(/^(?:giải\s*thích|nghĩa|dịch|gợi\s*ý|hint|explain)[\s\:\=]+|^(?:->|=>)\s*/i, '').trim();
      if (currentItem) {
        currentItem.meaningVi = expl;
        currentItem.hint = expl;
      }
      continue;
    }

    // Dạng có kèm dịch ngay trên dòng: "This / is / my / new / pen -> Đây là cây bút mới của mình"
    const transMatch = line.match(/^([^\-\=\>]+?)\s*(?:->|=>)\s*(.+)$/);
    if (transMatch) {
      if (currentItem) {
        items.push(currentItem);
        currentItem = null;
      }
      const rawSent = transMatch[1].replace(/^(?:sắp\s*xếp|unscramble|reorder|viết\s*lại)[\s\:\-]+/i, '').trim();
      const rawTrans = transMatch[2].trim();
      items.push(createSingleWritingItem(rawSent, rawTrans));
      continue;
    }

    // Câu mới
    if (currentItem) {
      items.push(currentItem);
    }
    const cleanedLine = line.replace(/^(?:sắp\s*xếp|unscramble|reorder|viết\s*lại)[\s\:\-]+/i, '').trim();
    currentItem = createSingleWritingItem(cleanedLine);
  }

  if (currentItem) {
    items.push(currentItem);
  }

  return items;
}

function createSingleWritingItem(sentence, meaningVi = '', extra = {}) {
  const hasBracket = /\[([^\]]+)\]/.test(sentence);
  const isFill = sentence.includes('_') || hasBracket;
  const cleanSent = sentence.replace(/\s+/g, ' ').trim();

  let blankWord = extra.blankWord || '';
  if (hasBracket && !blankWord) {
    const bracketMatch = sentence.match(/\[([^\]]+)\]/);
    if (bracketMatch) {
      blankWord = bracketMatch[1].trim();
    }
  }

  let correctSentence = extra.correctSentence || cleanSent.replace(/\[|\]/g, '');
  if (sentence.includes('/') && !extra.correctSentence) {
    correctSentence = cleanSent.replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
  }

  const displaySentence = hasBracket
    ? cleanSent.replace(/\[([^\]]+)\]/g, '______')
    : cleanSent;

  const words = correctSentence.replace(/[\.\,\?\!]/g, '').split(/\s+/).filter(Boolean);
  const shuffled = [...words].sort(() => Math.random() - 0.5);

  return {
    type: isFill ? 'fill_blank' : 'unscramble',
    sentence: isFill ? displaySentence : cleanSent,
    blankWord: blankWord,
    options: blankWord ? [blankWord] : [],
    correctSentence: correctSentence,
    scrambledWords: shuffled,
    meaningVi: meaningVi || '',
    hint: extra.hint || '',
  };
}

/**
 * Tiện ích phân tích bài tập tổng hợp ngoài SGK (Trắc nghiệm, Điền khuyết, Sắp xếp từ)
 * Hỗ trợ trộn lẫn nhiều dạng bài tập trong cùng một văn bản dán từ Word
 */
export function parseBatchAny(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const blocks = [];
  let currentBlock = [];
  const qStartRegex = /^\s*(?:câu|question|bài)?\s*\d+[\.\:\)\/]\s+/i;

  for (const line of lines) {
    if (qStartRegex.test(line)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      currentBlock.push(line);
    } else {
      if (currentBlock.length > 0) {
        currentBlock.push(line);
      } else if (line.trim()) {
        currentBlock.push(line);
      }
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }

  const finalBlocks = blocks.length > 0 ? blocks : normalized.split(/\n\s*\n/).filter((b) => b.trim());
  const results = [];

  for (const block of finalBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // 1. Thử phân tích dạng trắc nghiệm lựa chọn A, B, C, D
    const mcResults = parseBatchQuestions(trimmed);
    if (mcResults.length > 0) {
      for (const q of mcResults) {
        const isFill = q.question.includes('_');
        results.push({
          id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: isFill ? 'fill_blank' : 'multiple_choice',
          question: q.question,
          prompt: q.question,
          options: q.options || [],
          answerIndex: q.answerIndex ?? 0,
          blankWord: isFill ? (q.options[q.answerIndex] || '') : '',
          correctSentence: isFill
            ? q.question.replace(/_{2,}/g, q.options[q.answerIndex] || '').replace(/\s+/g, ' ').trim()
            : '',
          explain: q.explain || '',
          isCustom: true,
        });
      }
      continue;
    }

    // 2. Thử phân tích dạng câu viết / điền khuyết / sắp xếp
    const wResults = parseBatchWriting(trimmed);
    if (wResults.length > 0) {
      for (const w of wResults) {
        results.push({
          id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: w.type || 'unscramble',
          question:
            w.type === 'unscramble'
              ? w.meaningVi
                ? `Sắp xếp các từ sau thành câu đúng (${w.meaningVi}):`
                : 'Sắp xếp các từ sau thành câu hoàn chỉnh đúng ngữ pháp:'
              : w.sentence || '',
          prompt: w.meaningVi || '',
          blankWord: w.blankWord || '',
          correctSentence: w.correctSentence || w.sentence || '',
          scrambledWords: w.scrambledWords || [],
          options: w.options || [],
          answerIndex: 0,
          explain: w.meaningVi ? `Nghĩa tiếng Việt: ${w.meaningVi}` : '',
          isCustom: true,
        });
      }
      continue;
    }
  }

  return results;
}


