import { useState, useEffect } from 'react';
import { Button3D, ProgressBar, SpeakerButton, Confetti } from '../ui.jsx';
import { playSfx } from '../../utils/sfx.js';
import { Check, RotateCcw, Sparkles, BookOpen, Volume2, HelpCircle } from 'lucide-react';

export default function ReadingStation({ unit, onFinish }) {
  const reading = unit?.reading;
  const questions = reading?.questions ?? [];

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  // Trạng thái câu trả lời hiện tại
  const [selectedOption, setSelectedOption] = useState(null); // cho multiple_choice & sentence_completion
  const [filledWord, setFilledWord] = useState(''); // cho fill_blank & sentence_completion typing
  const [availableWords, setAvailableWords] = useState([]); // cho unscramble
  const [assembledWords, setAssembledWords] = useState([]); // cho unscramble
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQ = questions[index];
  const qType = currentQ?.type || (currentQ?.question?.includes('_') ? 'fill_blank' : 'multiple_choice');
  const isLast = index === questions.length - 1;

  // Reset trạng thái khi chuyển sang câu tiếp theo
  useEffect(() => {
    if (!currentQ) return;
    setAnswered(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setFilledWord('');

    if (qType === 'unscramble') {
      const words = Array.isArray(currentQ.scrambledWords) && currentQ.scrambledWords.length > 0
        ? currentQ.scrambledWords
        : (currentQ.correctSentence || '').split(/\s+/).filter(Boolean);
      setAvailableWords(words.map((w, idx) => ({ id: `${idx}_${w}_${Date.now()}`, word: w })));
      setAssembledWords([]);
    }
  }, [index, currentQ, qType]);

  if (!reading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
        <span className="text-5xl" aria-hidden>📖</span>
        <p className="text-xl font-black text-ink">Bài đọc hiểu đang được cập nhật!</p>
        <Button3D onClick={() => onFinish?.(3, 'Đã đọc bài!')}>Tiếp tục bài học</Button3D>
      </div>
    );
  }

  const norm = (s) => String(s || '').toLowerCase().replace(/[.!?,]/g, '').trim();

  // Thao tác ghép từ cho unscramble
  const addWord = (item) => {
    if (answered) return;
    playSfx('click');
    setAvailableWords((prev) => prev.filter((x) => x.id !== item.id));
    setAssembledWords((prev) => [...prev, item]);
  };

  const removeWord = (item) => {
    if (answered) return;
    playSfx('click');
    setAssembledWords((prev) => prev.filter((x) => x.id !== item.id));
    setAvailableWords((prev) => [...prev, item]);
  };

  const resetUnscramble = () => {
    if (answered) return;
    playSfx('click');
    const words = Array.isArray(currentQ.scrambledWords) && currentQ.scrambledWords.length > 0
      ? currentQ.scrambledWords
      : (currentQ.correctSentence || '').split(/\s+/).filter(Boolean);
    setAvailableWords(words.map((w, idx) => ({ id: `${idx}_${w}_${Date.now()}`, word: w })));
    setAssembledWords([]);
  };

  // Kiểm tra câu trả lời
  const handleCheck = () => {
    if (answered) return;
    let correct = false;

    if (qType === 'multiple_choice') {
      correct = selectedOption === currentQ.answerIndex;
    } else if (qType === 'fill_blank') {
      const target = currentQ.blankWord || (currentQ.options ? currentQ.options[currentQ.answerIndex] : '');
      correct = norm(filledWord) === norm(target);
    } else if (qType === 'unscramble') {
      const sentence = assembledWords.map((x) => x.word).join(' ').trim();
      const target = currentQ.correctSentence || '';
      correct = norm(sentence) === norm(target);
    } else if (qType === 'sentence_completion') {
      if (selectedOption !== null && currentQ.options) {
        correct = selectedOption === currentQ.answerIndex;
      } else {
        const target = currentQ.correctAnswer || currentQ.correctSentence || (currentQ.options ? currentQ.options[currentQ.answerIndex] : '');
        correct = norm(filledWord) === norm(target);
      }
    }

    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      playSfx('correct');
    } else {
      playSfx('wrong');
    }
  };

  // Chuyển sang câu tiếp theo
  const handleNext = () => {
    if (isLast) {
      const total = questions.length;
      const finalStars = score >= total ? 3 : score >= Math.ceil(total / 2) ? 2 : 1;
      onFinish?.(finalStars, `Đọc hiểu đúng ${score}/${total} câu hỏi!`);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const canCheck = () => {
    if (answered) return false;
    if (qType === 'multiple_choice') return selectedOption !== null;
    if (qType === 'fill_blank') return filledWord.trim().length > 0;
    if (qType === 'unscramble') return assembledWords.length > 0;
    if (qType === 'sentence_completion') return selectedOption !== null || filledWord.trim().length > 0;
    return false;
  };

  return (
    <div className="flex flex-col gap-6">
      <Confetti show={answered && isCorrect} />

      {/* BỐ CỤC THÔNG MINH 2 CỘT (SIDE-BY-SIDE SPLIT VIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= CỘT TRÁI: ĐOẠN VĂN ĐỌC HIỂU (STICKY) ================= */}
        <section className="lg:col-span-5 xl:col-span-5 rounded-[2.5rem] bg-white p-6 sm:p-7 shadow-[0_6px_0_#efe3cc] border-2 border-banana-soft flex flex-col gap-4 lg:sticky lg:top-4 z-10">
          <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-black text-sky-dark uppercase tracking-wider">
                Đoạn văn đọc hiểu
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <SpeakerButton text={reading.passage} size="sm" />
              {reading.translation && (
                <button
                  type="button"
                  onClick={() => setShowTranslation((v) => !v)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer border ${
                    showTranslation
                      ? 'bg-peach text-white border-peach-dark'
                      : 'bg-cream text-ink-soft hover:bg-banana-soft border-banana-soft'
                  }`}
                  title="Bấm để xem/ẩn bản dịch nghĩa tiếng Việt"
                >
                  {showTranslation ? 'Ẩn dịch' : 'Dịch nghĩa'}
                </button>
              )}
            </div>
          </div>

          {reading.title && (
            <h3 className="text-base sm:text-lg font-black text-ink text-center">
              &quot;{reading.title}&quot;
            </h3>
          )}

          <div className="p-5 rounded-2xl bg-cream-soft border border-banana-soft text-base sm:text-lg font-bold text-ink leading-relaxed max-h-[45vh] lg:max-h-[60vh] overflow-y-auto">
            &quot;{reading.passage}&quot;
          </div>

          {showTranslation && reading.translation && (
            <div className="p-4 rounded-xl bg-banana-soft/60 border border-banana-soft text-xs sm:text-sm font-bold text-ink-soft leading-relaxed animate-fade-in">
              <span className="font-black text-peach-dark block mb-1">🇻🇳 Bản dịch nghĩa tham khảo:</span>
              {reading.translation}
            </div>
          )}

          <div className="text-[11px] font-bold text-ink-soft text-center opacity-80">
            💡 Em có thể bấm loa 🔊 để nghe máy đọc mẫu hoặc đối chiếu đoạn văn khi làm bài.
          </div>
        </section>

        {/* ================= CỘT PHẢI: BÀI TẬP & CÂU HỎI TƯƠNG TÁC ================= */}
        <section className="lg:col-span-7 xl:col-span-7 flex flex-col gap-5">
          {/* Thanh tiến độ câu hỏi */}
          <div className="flex items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-banana-soft shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">❓</span>
              <span className="text-sm font-black text-ink">
                Câu hỏi {index + 1}/{questions.length}
              </span>
            </div>

            <div className="flex-1 max-w-[200px]">
              <ProgressBar value={index + 1} max={questions.length} tone="bg-sky" />
            </div>

            <span className="rounded-full bg-cream px-3 py-0.5 text-xs font-black text-ink-soft border border-banana-soft">
              ⭐ {score} điểm
            </span>
          </div>

          {/* Khung câu hỏi tương tác */}
          <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-5">
            {/* Huy hiệu loại câu hỏi */}
            <div>
              <span
                className={`rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider ${
                  qType === 'multiple_choice'
                    ? 'bg-mint-soft text-mint-dark'
                    : qType === 'fill_blank'
                    ? 'bg-sky-soft text-sky-dark'
                    : qType === 'unscramble'
                    ? 'bg-peach-soft text-peach-dark'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {qType === 'multiple_choice'
                  ? '🏷️ Trắc nghiệm A, B, C, D'
                  : qType === 'fill_blank'
                  ? '✏️ Điền từ vào chỗ trống'
                  : qType === 'unscramble'
                  ? '🧩 Sắp xếp từ thành câu'
                  : '✍️ Viết thêm hoàn thành câu'}
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-ink leading-relaxed mt-2.5">
                {currentQ.question}
              </h3>
            </div>

            {/* DẠNG 1: TRẮC NGHIỆM A, B, C, D */}
            {qType === 'multiple_choice' && (
              <div className="grid gap-3">
                {currentQ.options?.map((opt, oIdx) => {
                  let style = 'bg-white text-ink border-2 border-[#efe3cc] hover:bg-cream';
                  if (answered) {
                    if (oIdx === currentQ.answerIndex) {
                      style = 'bg-mint text-white border-2 border-mint-dark font-black';
                    } else if (oIdx === selectedOption) {
                      style = 'bg-rose-100 text-rose-800 border-2 border-rose-300';
                    } else {
                      style = 'bg-gray-50 text-gray-400 border-2 border-gray-200';
                    }
                  } else if (selectedOption === oIdx) {
                    style = 'bg-sky-soft text-ink border-2 border-sky font-black scale-[1.01]';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => {
                        if (answered) return;
                        playSfx('click');
                        setSelectedOption(oIdx);
                      }}
                      disabled={answered}
                      className={`min-h-14 rounded-2xl px-5 py-3 text-left text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center gap-3 ${style}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 font-black text-sm">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* DẠNG 2: ĐIỀN KHUYẾT (FILL IN THE BLANK) */}
            {qType === 'fill_blank' && (
              <div className="flex flex-col gap-4">
                {/* Câu có ô điền khuyết */}
                <div className="p-5 rounded-2xl bg-cream-soft border-2 border-banana-soft text-center text-lg sm:text-xl font-bold text-ink leading-relaxed flex flex-wrap items-center justify-center gap-2">
                  <span>{currentQ.question.split(/_{2,}|\[[^\]]+\]/)[0] || ''}</span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[130px] px-4 py-1.5 rounded-xl font-black text-lg border-2 ${
                      answered
                        ? isCorrect
                          ? 'bg-mint text-white border-mint-dark'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                        : filledWord
                        ? 'bg-white text-ink border-sky shadow-xs'
                        : 'bg-white text-gray-400 border-dashed border-banana animate-pulse'
                    }`}
                  >
                    {filledWord || '_______'}
                  </span>
                  <span>{currentQ.question.split(/_{2,}|\[[^\]]+\]/)[1] || ''}</span>
                </div>

                {/* Các từ gợi ý nếu có */}
                {currentQ.options?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase text-ink-soft">Chạm vào từ để điền:</span>
                    <div className="flex flex-wrap gap-2 p-3 bg-cream rounded-2xl border border-banana-soft">
                      {currentQ.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            if (answered) return;
                            playSfx('click');
                            setFilledWord(opt);
                          }}
                          disabled={answered}
                          className={`rounded-xl px-4 py-2 text-sm sm:text-base font-black transition-all cursor-pointer ${
                            filledWord === opt
                              ? 'bg-sky text-ink border-2 border-sky-dark shadow-xs scale-105'
                              : 'bg-white text-ink border-2 border-banana-soft hover:bg-banana-soft'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ô gõ từ nếu học sinh muốn tự gõ */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-ink-soft whitespace-nowrap">Hoặc gõ từ:</span>
                  <input
                    type="text"
                    disabled={answered}
                    value={filledWord}
                    onChange={(e) => setFilledWord(e.target.value)}
                    placeholder="Gõ từ cần điền vào đây..."
                    className="flex-1 rounded-xl bg-cream px-3.5 py-2 text-sm font-black text-ink border border-banana-soft"
                  />
                </div>
              </div>
            )}

            {/* DẠNG 3: SẮP XẾP TỪ (UNSCRAMBLE) */}
            {qType === 'unscramble' && (
              <div className="flex flex-col gap-4">
                {/* Khung từ đã ghép */}
                <div
                  className={`min-h-20 rounded-2xl p-4 border-2 transition-all flex flex-wrap items-center gap-2 ${
                    answered
                      ? isCorrect
                        ? 'bg-mint-soft border-mint shadow-md'
                        : 'bg-rose-50 border-rose-300'
                      : assembledWords.length > 0
                      ? 'bg-cream-soft border-banana'
                      : 'bg-gray-50 border-dashed border-gray-300'
                  }`}
                >
                  {assembledWords.length === 0 ? (
                    <span className="text-sm sm:text-base font-bold text-gray-400 italic">
                      Chạm vào các khối từ bên dưới để ghép thành câu...
                    </span>
                  ) : (
                    assembledWords.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => removeWord(item)}
                        disabled={answered}
                        className="rounded-xl bg-white px-3.5 py-2 text-base font-black text-ink shadow-xs border border-banana-soft hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                        title="Bấm để gỡ từ này"
                      >
                        {item.word}
                      </button>
                    ))
                  )}
                </div>

                {/* Khung khối từ gợi ý */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black uppercase text-ink-soft">Khối từ gợi ý:</span>
                  <div className="flex flex-wrap gap-2 p-3 bg-cream rounded-2xl border border-banana-soft">
                    {availableWords.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addWord(item)}
                        disabled={answered}
                        className="rounded-xl bg-white px-3.5 py-2 text-base font-black text-ink shadow-xs border-2 border-banana hover:bg-banana-soft active:translate-y-0.5 cursor-pointer"
                      >
                        {item.word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DẠNG 4: VIẾT THÊM ĐỂ HOÀN THÀNH CÂU (SENTENCE COMPLETION) */}
            {qType === 'sentence_completion' && (
              <div className="flex flex-col gap-4">
                {currentQ.prompt && (
                  <div className="p-4 rounded-2xl bg-cream-soft border border-banana-soft text-base sm:text-lg font-bold text-ink">
                    <span className="font-black text-peach-dark block text-xs uppercase mb-1">Vế câu cho sẵn:</span>
                    &quot;{currentQ.prompt}&quot;
                  </div>
                )}

                {/* Các vế lựa chọn nếu có */}
                {currentQ.options?.length > 0 ? (
                  <div className="grid gap-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      let style = 'bg-white text-ink border-2 border-[#efe3cc] hover:bg-cream';
                      if (answered) {
                        if (oIdx === currentQ.answerIndex) {
                          style = 'bg-mint text-white border-2 border-mint-dark font-black';
                        } else if (oIdx === selectedOption) {
                          style = 'bg-rose-100 text-rose-800 border-2 border-rose-300';
                        } else {
                          style = 'bg-gray-50 text-gray-400 border-2 border-gray-200';
                        }
                      } else if (selectedOption === oIdx) {
                        style = 'bg-purple-100 text-purple-900 border-2 border-purple-400 font-black';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            if (answered) return;
                            playSfx('click');
                            setSelectedOption(oIdx);
                          }}
                          disabled={answered}
                          className={`p-3.5 rounded-xl text-left text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-2.5 ${style}`}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/70 text-xs font-black">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>... {opt}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-ink-soft">Nhập vế câu hoàn thiện:</label>
                    <textarea
                      rows={3}
                      disabled={answered}
                      value={filledWord}
                      onChange={(e) => setFilledWord(e.target.value)}
                      placeholder="Nhập phần viết tiếp của câu vào đây..."
                      className="w-full rounded-2xl bg-cream p-3.5 text-sm font-bold text-ink border border-banana-soft"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Phản hồi kết quả sau khi kiểm tra */}
            {answered && (
              <div
                className={`rounded-2xl p-4 text-center font-bold text-base sm:text-lg animate-fade-in ${
                  isCorrect ? 'bg-mint text-white' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isCorrect ? (
                  <div className="flex flex-col items-center gap-1 font-black">
                    <span>🎉 Tuyệt vời! Em đã trả lời hoàn toàn chính xác!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-black">Chưa chính xác rồi, đáp án đúng là:</span>
                    <span className="font-mono text-base underline font-black">
                      {qType === 'multiple_choice' && currentQ.options
                        ? `${String.fromCharCode(65 + currentQ.answerIndex)}. ${currentQ.options[currentQ.answerIndex]}`
                        : qType === 'fill_blank'
                        ? currentQ.blankWord || (currentQ.options ? currentQ.options[currentQ.answerIndex] : '')
                        : qType === 'unscramble'
                        ? currentQ.correctSentence
                        : currentQ.correctAnswer || (currentQ.options ? currentQ.options[currentQ.answerIndex] : '')}
                    </span>
                  </div>
                )}

                {currentQ.explain && (
                  <div className="mt-2 text-xs font-bold opacity-90 border-t border-white/20 pt-2 text-left">
                    💡 Căn cứ bài đọc: {currentQ.explain}
                  </div>
                )}
              </div>
            )}

            {/* Thanh nút bấm điều khiển */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {qType === 'unscramble' && !answered ? (
                <Button3D tone="white" onClick={resetUnscramble} className="px-4 py-2.5 text-sm">
                  <RotateCcw className="h-4 w-4 mr-1" /> Làm lại
                </Button3D>
              ) : (
                <div />
              )}

              {!answered ? (
                <Button3D
                  tone="sky"
                  onClick={handleCheck}
                  disabled={!canCheck()}
                  className="px-8 py-3 text-base sm:text-lg"
                >
                  <Check className="h-5 w-5 mr-1" /> Kiểm tra câu này
                </Button3D>
              ) : (
                <Button3D
                  tone={isLast ? 'peach' : 'mint'}
                  onClick={handleNext}
                  className="px-8 py-3 text-base sm:text-lg"
                >
                  {isLast ? 'Hoàn thành bài đọc 📖 →' : 'Câu tiếp theo →'}
                </Button3D>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
