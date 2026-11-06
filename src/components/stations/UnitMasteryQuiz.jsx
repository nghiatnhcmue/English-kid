import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, Volume2, Sparkles, BookOpen, Mic, ArrowRight } from 'lucide-react';
import { Button3D, SpeakerButton, Stars } from '../ui.jsx';
import { speak } from '../../utils/speech.js';
import { playSfx } from '../../utils/sfx.js';
import { store } from '../../utils/storage.js';

/**
 * Thử thách Tổng hợp Toàn diện Unit (Unit Mastery Quiz):
 * Gom đủ 6 phần trọng tâm của Unit:
 * 1. Từ vựng (Vocabulary)
 * 2. Phát âm (Pronunciation)
 * 3. Ngữ pháp (Grammar)
 * 4. Kỹ năng Nghe (Listening)
 * 5. Kỹ năng Đọc (Reading)
 * 6. Kỹ năng Viết (Writing)
 */
export default function UnitMasteryQuiz({ unit, onFinish }) {
  // Tạo danh sách 6 câu hỏi tổng hợp từ dữ liệu của Unit
  const questions = useMemo(() => {
    const list = [];
    const v1 = unit.vocabularies?.[0] || { word: 'school', meaning: 'trường học' };
    const v2 = unit.vocabularies?.[1] || { word: 'bag', meaning: 'cặp' };
    const v3 = unit.vocabularies?.[2] || { word: 'book', meaning: 'sách' };

    // 1. TỪ VỰNG
    list.push({
      type: 'vocab',
      domain: '🔤 Từ vựng',
      question: `Từ nào sau đây có nghĩa là "${v1.meaning}"?`,
      options: [v1.word, v2.word, v3.word],
      correctAnswer: v1.word,
      hint: v1.hint || 'Nhớ lại các từ mới đã học ở đầu bài nhé.',
    });

    // 2. PHÁT ÂM (A Closer Look 1)
    if (unit.pronunciation?.practiceQuiz?.length) {
      const p = unit.pronunciation.practiceQuiz[0];
      list.push({
        type: 'pronunciation',
        domain: '🗣️ Phát âm & Ngữ âm',
        audioText: p.word,
        question: `Nghe từ "${p.word}" (${p.meaning}) và chọn âm đúng:`,
        options: p.options,
        correctAnswer: p.correctSound,
        hint: `Cặp âm của Unit ${unit.unitId} là ${unit.pronunciation.pair}.`,
      });
    }

    // 3. NGỮ PHÁP (A Closer Look 2)
    const grammarList = unit.grammar?.quiz || unit.grammar?.practiceQuestions || [];
    if (grammarList.length) {
      const g = grammarList[0];
      const correctAns = g.answer || g.options?.[g.answerIndex];
      list.push({
        type: 'grammar',
        domain: '📐 Ngữ pháp cốt lõi',
        question: g.question,
        options: g.options,
        correctAnswer: correctAns,
        hint: g.explain || g.explanation || 'Áp dụng quy tắc ngữ pháp của bài học.',
      });
    }

    // 4. KỸ NĂNG NGHE (Skills 2)
    if (unit.listening) {
      list.push({
        type: 'listening',
        domain: '👂 Kỹ năng Nghe',
        audioText: unit.listening.transcript,
        question: `[Nghe đoạn thoại] ${unit.listening.question}`,
        options: unit.listening.options,
        correctAnswer: unit.listening.options[unit.listening.answerIndex],
        hint: 'Bấm nút loa để nghe kỹ đoạn hội thoại.',
      });
    }

    // 5. KỸ NĂNG ĐỌC (Skills 1)
    const readQuestions = unit.reading?.questions || unit.reading?.quizQuestions || [];
    if (readQuestions.length) {
      const r = readQuestions[0];
      list.push({
        type: 'reading',
        domain: '📖 Kỹ năng Đọc hiểu',
        passage: unit.reading.passage || unit.reading.passageEn,
        question: r.question,
        options: r.options,
        correctAnswer: r.options[r.answerIndex],
        hint: 'Đọc kỹ câu trong đoạn văn để tìm thông tin.',
      });
    }

    // 6. KỸ NĂNG VIẾT (Skills 2)
    if (unit.writing) {
      const w = unit.writing;
      list.push({
        type: 'writing',
        domain: '✍️ Kỹ năng Viết câu',
        isScramble: true,
        meaningVi: w.meaningVi,
        correctSentence: w.correctSentence,
        shuffledWords: w.scrambledWords || w.shuffledWords,
        hint: 'Chạm các từ theo đúng thứ tự ngữ pháp.',
      });
    }

    return list;
  }, [unit]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Trạng thái cho câu hỏi viết (sắp xếp từ)
  const currentQ = questions[currentIdx];
  const [writtenWords, setWrittenWords] = useState([]);

  const handleSelectOption = (opt) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
    setIsSubmitted(true);

    const isCorrect = opt === currentQ.correctAnswer;
    playSfx(isCorrect ? 'correct' : 'wrong');
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: isCorrect,
    }));
  };

  // Logic sắp xếp từ cho câu hỏi viết
  const handlePickWord = (word, index) => {
    if (isSubmitted) return;
    playSfx('click');
    setWrittenWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (index) => {
    if (isSubmitted) return;
    playSfx('click');
    setWrittenWords((prev) => prev.filter((_, i) => i !== index));
  };

  const checkWrittenAnswer = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    const constructed = writtenWords.join(' ').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const expected = currentQ.correctSentence.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const isCorrect = constructed === expected;

    playSfx(isCorrect ? 'correct' : 'wrong');
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: isCorrect,
    }));
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setWrittenWords([]);
    } else {
      setIsFinished(true);
      playSfx('victory');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      store().markStudyDay();
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setIsFinished(false);
    setWrittenWords([]);
  };

  const correctCount = Object.values(userAnswers).filter(Boolean).length;
  const starsEarned = correctCount >= 5 ? 3 : correctCount >= 3 ? 2 : 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Tiêu đề Bài tập Tổng Hợp */}
      <div className="rounded-[2.5rem] bg-gradient-to-r from-banana via-cream to-peach-soft p-6 sm:p-7 shadow-[0_6px_0_#efe3cc] border-3 border-banana-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-peach text-white px-3.5 py-1 text-xs font-black uppercase shadow-2xs">
            Unit {unit.unitId} · Bài Tập Tổng Hợp Toàn Diện
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 font-mono text-xs font-black text-ink shadow-2xs">
            Đủ 4 Kỹ Năng + Từ Vựng + Ngữ Pháp
          </span>
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-black text-ink">
          🏆 Thử Thách Toàn Diện Unit {unit.unitId}
        </h2>
        <p className="mt-1 text-sm sm:text-base font-bold text-ink-soft">
          Đánh giá năng lực tổng thể: 6 câu hỏi đại diện cho Từ vựng, Ngữ âm, Ngữ pháp, Nghe, Đọc và Viết
        </p>
      </div>

      {!isFinished ? (
        <section aria-label="Nội dung câu hỏi bài tập tổng hợp" className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col gap-6">
          {/* Thanh Tiến trình 6 Câu hỏi */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-ink-soft">
              <span className="rounded-full bg-cream px-3 py-1 border border-banana-soft text-peach-dark">
                {currentQ.domain}
              </span>
              <span>
                Câu {currentIdx + 1} / {questions.length}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-cream border border-banana-soft">
              <div
                className="h-full bg-gradient-to-r from-banana to-peach transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Âm thanh mẫu nếu câu hỏi có audioText */}
          {currentQ.audioText && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-cream/70 p-4 border border-banana-soft">
              <span className="text-xs font-bold text-ink-soft">Bấm loa để nghe âm thanh câu hỏi:</span>
              <div className="flex items-center gap-3">
                <SpeakerButton text={currentQ.audioText} size="lg" />
                <button
                  type="button"
                  onClick={() => speak(currentQ.audioText, { rate: 0.65 })}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-2xl bg-white px-4 text-sm font-black text-ink shadow-xs border border-banana-soft hover:bg-cream cursor-pointer"
                >
                  <span>🐢 Nghe chậm</span>
                </button>
              </div>
            </div>
          )}

          {/* Đoạn văn nếu là câu hỏi Đọc hiểu */}
          {currentQ.passage && (
            <div className="rounded-2xl bg-sky-soft/40 p-4 border border-sky/30 text-sm sm:text-base font-bold text-ink leading-relaxed">
              <span className="text-xs font-black uppercase text-sky-dark block mb-1">Đoạn văn đọc hiểu:</span>
              &quot;{currentQ.passage}&quot;
            </div>
          )}

          {/* Nội dung Câu hỏi */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-ink">
              {currentQ.question}
            </h3>
            {currentQ.meaningVi && (
              <p className="text-sm font-bold text-ink-soft mt-1">
                Dịch nghĩa: &quot;{currentQ.meaningVi}&quot;
              </p>
            )}
          </div>

          {/* Khu vực trả lời: Trắc nghiệm HOẶC Sắp xếp từ */}
          {!currentQ.isScramble ? (
            <div className="grid gap-3 pt-2">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let style = 'bg-cream/50 text-ink border-2 border-banana-soft hover:bg-banana/30 hover:border-banana';
                let icon = null;

                if (isSubmitted) {
                  if (isCorrect) {
                    style = 'bg-mint text-white border-2 border-mint-dark font-black shadow-sm ring-2 ring-mint-dark/30';
                    icon = <CheckCircle2 className="h-5 w-5 text-white shrink-0" />;
                  } else if (isSelected) {
                    style = 'bg-rose-soft text-peach-dark border-2 border-rose-400 font-black';
                    icon = <XCircle className="h-5 w-5 text-peach-dark shrink-0" />;
                  } else {
                    style = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex min-h-14 items-center justify-between rounded-2xl px-5 py-3 text-base sm:text-lg font-bold transition-all cursor-pointer ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black">{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Dạng Sắp xếp từ thành câu (Writing) */
            <div className="flex flex-col gap-4">
              {/* Vùng các từ đã ghép */}
              <div className="min-h-16 rounded-2xl bg-cream/70 p-4 border-2 border-dashed border-banana flex flex-wrap items-center gap-2">
                {writtenWords.length === 0 ? (
                  <span className="text-sm font-bold text-ink-soft italic">
                    Chạm các từ bên dưới để xếp vào đây...
                  </span>
                ) : (
                  writtenWords.map((word, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleRemoveWord(i)}
                      className="rounded-xl bg-peach px-3 py-1.5 text-base font-black text-white shadow-xs hover:bg-peach-dark cursor-pointer transition-transform active:scale-95"
                    >
                      {word} ✕
                    </button>
                  ))
                )}
              </div>

              {/* Ngân hàng từ xáo trộn */}
              <div className="flex flex-wrap items-center gap-2">
                {currentQ.shuffledWords?.map((word, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handlePickWord(word, i)}
                    className="rounded-xl bg-white px-4 py-2 text-base font-black text-ink shadow-sm border border-banana-soft hover:bg-banana hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer transition-all"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {!isSubmitted ? (
                <div className="flex justify-end pt-2">
                  <Button3D
                    tone="banana"
                    disabled={writtenWords.length === 0}
                    onClick={checkWrittenAnswer}
                    className="px-6 py-2.5 text-base"
                  >
                    Kiểm tra câu viết ↵
                  </Button3D>
                </div>
              ) : (
                <div className="rounded-xl p-3 text-sm font-bold bg-white border border-banana-soft">
                  <span className="text-ink-soft">Câu mẫu đúng:</span>{' '}
                  <strong className="text-ink">{currentQ.correctSentence}</strong>
                </div>
              )}
            </div>
          )}

          {/* Nút sang câu tiếp theo */}
          {isSubmitted && (
            <div className="flex items-center justify-between pt-4 border-t border-banana-soft">
              <span className="text-xs sm:text-sm font-bold text-ink-soft">
                {userAnswers[currentIdx] ? '🎉 Chính xác!' : `💡 Gợi ý: ${currentQ.hint}`}
              </span>
              <Button3D tone="peach" onClick={handleNext} className="px-6 py-3 text-base">
                <span>{currentIdx + 1 < questions.length ? 'Câu tiếp theo →' : 'Xem kết quả tổng kết 🏆'}</span>
              </Button3D>
            </div>
          )}
        </section>
      ) : (
        /* MÀN HÌNH TỔNG KẾT TOÀN DIỆN */
        <section aria-label="Kết quả tổng kết bài tập toàn diện" className="rounded-[2.5rem] bg-white p-6 sm:p-10 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col items-center text-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-banana text-5xl shadow-md">
            🏆
          </div>

          <div>
            <span className="rounded-full bg-peach text-white px-4 py-1 text-xs font-black uppercase shadow-xs">
              Hoàn Thành Bài Tập Tổng Hợp Unit {unit.unitId}
            </span>
            <h3 className="mt-3 text-3xl sm:text-4xl font-black text-ink">
              Em Đã Làm Rất Xuất Sắc!
            </h3>
            <p className="mt-1 text-base font-bold text-ink-soft">
              Kết quả: Đạt <strong className="text-peach-dark text-xl">{correctCount} / {questions.length}</strong> phần câu hỏi
            </p>
          </div>

          <div className="flex justify-center">
            <Stars count={starsEarned} className="text-4xl" />
          </div>

          {/* Bảng Năng lực 6 Phần */}
          <div className="w-full max-w-md rounded-2xl bg-cream/70 p-4 border border-banana-soft text-left flex flex-col gap-2">
            <span className="text-xs font-black uppercase text-ink-soft block pb-1 border-b border-banana-soft">
              Đánh giá chi tiết từng kỹ năng:
            </span>
            {questions.map((q, idx) => {
              const isRight = userAnswers[idx];
              return (
                <div key={idx} className="flex items-center justify-between py-1 text-sm font-bold">
                  <span className="text-ink">{q.domain}</span>
                  <span className={`flex items-center gap-1 font-black ${isRight ? 'text-mint-dark' : 'text-peach-dark'}`}>
                    {isRight ? '✓ Đạt chuẩn' : '✕ Cần ôn thêm'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button3D tone="banana" onClick={handleRestart} className="px-6 py-3 text-base">
              <RotateCcw className="h-4 w-4" /> Làm lại bài thử thách
            </Button3D>
            <Button3D
              tone="mint"
              to={`/unit/${unit.unitId}`}
              className="px-6 py-3 text-base"
              onClick={() => onFinish?.(starsEarned, 'Đã hoàn thành toàn bộ Unit!')}
            >
              <span>Về trang Unit {unit.unitId} →</span>
            </Button3D>
          </div>
        </section>
      )}
    </div>
  );
}

