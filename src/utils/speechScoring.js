import { similarity, speakingLevel } from './scene.js';

/**
 * So sánh từng từ giữa câu mẫu và câu máy nghe được.
 */
export function compareWords(targetSentence, spokenSentence) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetWords = (targetSentence || '').split(/\s+/).filter(Boolean);
  const spokenWords = (spokenSentence || '').split(/\s+/).map(norm).filter(Boolean);

  return targetWords.map((origWord) => {
    const cleanOrig = norm(origWord);
    const isMatched = spokenWords.includes(cleanOrig);
    return {
      word: origWord,
      matched: isMatched,
    };
  });
}

/**
 * Chấm điểm một lượt thu âm phát âm dựa trên danh sách STT transcripts + thông số VAD từ micro.
 * Đảm bảo im lặng (hasVoice = false) luôn nhận 0% / 0 sao, không nâng điểm khống.
 */
export function evaluateSpeechAttempt({ transcripts, targetSentence = '', audioStats = null }) {
  const targetWords = (targetSentence || '').split(/\s+/).filter(Boolean);
  const unmatchedAnalysis = () =>
    targetWords.map((origWord) => ({
      word: origWord,
      matched: false,
    }));

  if (!transcripts || !transcripts.length) {
    if (!audioStats?.hasVoice) {
      return {
        recognizedText: '(Không phát hiện giọng nói)',
        rawSpokenText: '',
        score: 0,
        scorePercent: 0,
        stars: 0,
        level: 'retry',
        feedback: 'Micro chưa nghe thấy giọng của em. Em hãy kiểm tra micro và đọc to câu trên nhé!',
        wordAnalysis: unmatchedAnalysis(),
        sfx: 'wrong',
      };
    }

    return {
      recognizedText: '(Đã thu âm nhưng chưa nhận diện rõ từ tiếng Anh)',
      rawSpokenText: '',
      score: 0.35,
      scorePercent: 35,
      stars: 1,
      level: 'retry',
      feedback: 'Đã ghi nhận giọng đọc nhưng AI chưa nhận diện rõ từng từ tiếng Anh. Em hãy nói to, chậm rãi hơn nhé!',
      wordAnalysis: unmatchedAnalysis(),
      sfx: 'wrong',
    };
  }

  const best = transcripts.reduce(
    (acc, tr) => {
      const s = similarity(tr, targetSentence);
      return s > acc.s ? { s, tr } : acc;
    },
    { s: -1, tr: transcripts[0] },
  );

  const score = Math.max(0, best.s);
  const scorePercent = Math.round(score * 100);
  const level = speakingLevel(score);
  const stars = scorePercent >= 80 ? 3 : scorePercent >= 50 ? 2 : scorePercent >= 20 ? 1 : 0;
  const wordAnalysis = compareWords(targetSentence, best.tr);

  let feedback = '💪 Cố gắng lên nhé! Bấm nghe lại bản xứ đọc chậm rồi thử lại nào!';
  let sfx = 'click';
  if (scorePercent >= 80) {
    feedback = '🌟 Xuất sắc! Phát âm rất chuẩn và ngữ điệu vô cùng tự nhiên!';
    sfx = 'victory';
  } else if (scorePercent >= 50) {
    feedback = '👍 Rất tốt! Em đã phát âm rõ hầu hết các từ quan trọng!';
    sfx = 'correct';
  } else if (scorePercent === 0) {
    sfx = 'wrong';
  }

  return {
    recognizedText: best.tr,
    rawSpokenText: best.tr,
    score,
    scorePercent,
    stars,
    level,
    feedback,
    wordAnalysis,
    sfx,
  };
}
