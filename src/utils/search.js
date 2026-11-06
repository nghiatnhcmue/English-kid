import { listUnits, getUnit, allWords } from './data.js';

/**
 * Tìm kiếm toàn diện nội dung học tập trên toàn bộ 12 Unit:
 * - Từ vựng (Mặt chữ, nghĩa tiếng Việt, phiên âm, câu ví dụ)
 * - Ngữ pháp (Tên chủ điểm, quy tắc, công thức, mẹo nhớ)
 * - Luyện Nghe (Nội dung đoạn đối thoại, câu hỏi nghe)
 * - Luyện Nói (Câu giao tiếp mục tiêu)
 * - Đọc hiểu (Đoạn văn ngắn A1)
 */
export function searchCurriculum(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return { vocab: [], grammar: [], reading: [], speaking: [], listening: [] };

  const units = listUnits();
  const allVocab = allWords();

  // 1. Tìm Từ vựng
  const vocab = allVocab
    .filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.hint && w.hint.toLowerCase().includes(q)) ||
        (w.phonetic && w.phonetic.toLowerCase().includes(q)) ||
        (w.exampleEn && w.exampleEn.toLowerCase().includes(q)) ||
        (w.exampleVi && w.exampleVi.toLowerCase().includes(q))
    )
    .map((w) => {
      const u = units.find((x) => x.unitId === w.unitId);
      return { ...w, unitTitle: u ? `Unit ${u.unitId}: ${u.titleEn}` : `Unit ${w.unitId}` };
    });

  const grammar = [];
  const reading = [];
  const speaking = [];
  const listening = [];

  for (const uMeta of units) {
    const u = getUnit(uMeta.unitId);
    if (!u) continue;

    // 2. Tìm Ngữ pháp
    if (u.grammar) {
      const matchTitle = u.grammar.title?.toLowerCase().includes(q);
      const matchRule = u.grammar.ruleVi?.toLowerCase().includes(q);
      const matchFormula = u.grammar.formula?.toLowerCase().includes(q);
      const matchTip = u.grammar.quickTip?.toLowerCase().includes(q);
      if (matchTitle || matchRule || matchFormula || matchTip) {
        grammar.push({
          unitId: u.unitId,
          unitTitle: `Unit ${u.unitId}: ${u.titleEn}`,
          emoji: u.emoji,
          title: u.grammar.title,
          ruleVi: u.grammar.ruleVi,
          formula: u.grammar.formula,
          quickTip: u.grammar.quickTip,
        });
      }
    }

    // 3. Tìm Đọc hiểu
    if (u.reading?.passage && u.reading.passage.toLowerCase().includes(q)) {
      reading.push({
        unitId: u.unitId,
        unitTitle: `Unit ${u.unitId}: ${u.titleEn}`,
        emoji: u.emoji,
        passage: u.reading.passage,
      });
    }

    // 4. Tìm Luyện Nói
    if (u.speaking) {
      const matchEn = u.speaking.targetSentence?.toLowerCase().includes(q);
      const matchVi = u.speaking.meaningVi?.toLowerCase().includes(q);
      if (matchEn || matchVi) {
        speaking.push({
          unitId: u.unitId,
          unitTitle: `Unit ${u.unitId}: ${u.titleEn}`,
          emoji: u.emoji,
          sentence: u.speaking.targetSentence,
          phonetic: u.speaking.phonetic,
          meaningVi: u.speaking.meaningVi,
        });
      }
    }

    // 5. Tìm Luyện Nghe
    if (u.listening?.transcript && u.listening.transcript.toLowerCase().includes(q)) {
      listening.push({
        unitId: u.unitId,
        unitTitle: `Unit ${u.unitId}: ${u.titleEn}`,
        emoji: u.emoji,
        transcript: u.listening.transcript,
        question: u.listening.question,
      });
    }
  }

  return { vocab, grammar, reading, speaking, listening };
}
