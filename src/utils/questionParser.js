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

