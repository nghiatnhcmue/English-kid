import { useState } from 'react';
import { Button3D, ProgressBar, Stars, Confetti } from '../ui.jsx';
import { playSfx } from '../../utils/sfx.js';
import { t } from '../../i18n/vi.js';

export default function GrammarStation({ unit, onFinish }) {
  const grammar = unit?.grammar;
  const quiz = grammar?.quiz ?? [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  if (!grammar || quiz.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
        <span className="text-5xl" aria-hidden>📐</span>
        <p className="text-xl font-black text-ink">Nội dung ngữ pháp bài này đang được cập nhật!</p>
        <Button3D onClick={() => onFinish?.(3, 'Đã xem ngữ pháp!')}>Tiếp tục bài học</Button3D>
      </div>
    );
  }

  const q = quiz[index];
  const isLast = index === quiz.length - 1;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === q.answerIndex;
    playSfx(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      const finalStars = score >= quiz.length ? 3 : score >= 1 ? 2 : 1;
      onFinish?.(finalStars, `Làm đúng ${score}/${quiz.length} câu ngữ pháp!`);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Thẻ lý thuyết tinh gọn & mẹo nhớ */}
      <section className="rounded-[2.5rem] bg-gradient-to-br from-banana-soft via-white to-sky-soft p-6 sm:p-7 shadow-[0_6px_0_#efe3cc] border-2 border-banana">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl" aria-hidden>📐</span>
          <h2 className="text-2xl sm:text-3xl font-black text-ink">{grammar.title}</h2>
        </div>
        <p className="text-base sm:text-lg font-bold text-ink-soft mb-4">{grammar.ruleVi}</p>

        {grammar.formula && (
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm border border-banana mb-3">
            <span className="text-xs font-black uppercase text-banana-dark tracking-wider block mb-1">
              Công thức cốt lõi:
            </span>
            <p className="text-lg sm:text-xl font-black text-ink font-mono">{grammar.formula}</p>
          </div>
        )}

        {grammar.quickTip && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-amber-900 text-sm sm:text-base font-bold">
            <span className="text-xl shrink-0" aria-hidden>💡</span>
            <p><strong>Mẹo nhớ nhanh:</strong> {grammar.quickTip}</p>
          </div>
        )}
      </section>

      {/* Tiến độ câu hỏi */}
      <div className="flex items-center gap-3">
        <ProgressBar value={index + 1} max={quiz.length} tone="bg-banana" />
        <span className="shrink-0 text-base font-black text-ink">
          Câu {index + 1}/{quiz.length}
        </span>
      </div>

      {/* Khung câu hỏi trắc nghiệm củng cố quy tắc */}
      <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-5">
        <h3 className="text-xl sm:text-2xl font-black text-ink leading-relaxed">
          {q.question}
        </h3>

        <div className="grid gap-3">
          {q.options.map((opt, idx) => {
            let style = 'bg-white text-ink border-2 border-[#efe3cc] hover:bg-cream active:translate-y-0.5';
            if (answered) {
              if (idx === q.answerIndex) {
                style = 'bg-mint text-white border-2 border-mint-dark font-black shadow-md';
              } else if (idx === selected) {
                style = 'bg-rose-100 text-rose-800 border-2 border-rose-300 font-black';
              } else {
                style = 'bg-gray-50 text-gray-400 border-2 border-gray-200';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`min-h-14 rounded-2xl px-5 py-3 text-left text-lg font-black transition-all cursor-pointer ${style}`}
              >
                <span>{String.fromCharCode(65 + idx)}. </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Giải thích câu trả lời */}
        {answered && (
          <div className="rounded-2xl bg-cream p-4 text-base font-bold text-ink-soft animate-fade-in flex flex-col gap-2">
            <p>
              {selected === q.answerIndex ? (
                <span className="text-mint-dark font-black">🎉 Giỏi lắm! Đáp án hoàn toàn chính xác.</span>
              ) : (
                <span className="text-peach font-black">
                  💡 Đáp án đúng là {String.fromCharCode(65 + q.answerIndex)}: &quot;{q.options[q.answerIndex]}&quot;
                </span>
              )}
            </p>
            {q.explain && <p className="text-sm">{q.explain}</p>}
          </div>
        )}

        {/* Nút tiếp theo */}
        {answered && (
          <div className="flex justify-end pt-2">
            <Button3D tone="mint" onClick={handleNext} className="px-8 py-3.5 text-lg">
              {isLast ? 'Hoàn thành trạm ngữ pháp →' : 'Câu tiếp theo →'}
            </Button3D>
          </div>
        )}
      </div>
    </div>
  );
}
