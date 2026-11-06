import { useState } from 'react';
import { Button3D, ProgressBar, SpeakerButton } from '../ui.jsx';
import { playSfx } from '../../utils/sfx.js';

export default function ReadingStation({ unit, onFinish }) {
  const reading = unit?.reading;
  const questions = reading?.questions ?? [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  if (!reading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
        <span className="text-5xl" aria-hidden>📖</span>
        <p className="text-xl font-black text-ink">Bài đọc hiểu đang được cập nhật!</p>
        <Button3D onClick={() => onFinish?.(3, 'Đã đọc bài!')}>Tiếp tục bài học</Button3D>
      </div>
    );
  }

  const q = questions[index];
  const isLast = index === questions.length - 1;

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
      const finalStars = score >= questions.length ? 3 : score >= 1 ? 2 : 1;
      onFinish?.(finalStars, `Đọc hiểu đúng ${score}/${questions.length} câu!`);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Đoạn văn đọc hiểu ngắn */}
      <section className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_6px_0_#efe3cc] border-2 border-banana-soft flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-sky-soft px-3.5 py-1 text-xs font-black text-sky-dark uppercase">
            Đoạn văn đọc hiểu ngắn (A1)
          </span>
          <SpeakerButton text={reading.passage} size="sm" />
        </div>

        <p className="text-lg sm:text-xl font-bold text-ink leading-relaxed bg-cream-soft p-5 rounded-2xl border border-banana-soft">
          &quot;{reading.passage}&quot;
        </p>
      </section>

      {/* Tiến độ câu hỏi */}
      <div className="flex items-center gap-3">
        <ProgressBar value={index + 1} max={questions.length} tone="bg-sky" />
        <span className="shrink-0 text-base font-black text-ink">
          Câu hỏi {index + 1}/{questions.length}
        </span>
      </div>

      {/* Câu hỏi trắc nghiệm */}
      <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-4">
        <h3 className="text-xl sm:text-2xl font-black text-ink leading-relaxed">
          ❓ {q.question}
        </h3>

        <div className="grid gap-3">
          {q.options.map((opt, idx) => {
            let style = 'bg-white text-ink border-2 border-[#efe3cc] hover:bg-cream';
            if (answered) {
              if (idx === q.answerIndex) {
                style = 'bg-mint text-white border-2 border-mint-dark font-black';
              } else if (idx === selected) {
                style = 'bg-rose-100 text-rose-800 border-2 border-rose-300';
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
                className={`min-h-14 rounded-2xl px-5 py-3 text-left text-lg font-bold transition-all cursor-pointer ${style}`}
              >
                <span>{String.fromCharCode(65 + idx)}. </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="flex justify-end pt-3">
            <Button3D tone="sky" onClick={handleNext} className="px-8 py-3.5 text-lg">
              {isLast ? 'Hoàn thành trạm Đọc hiểu →' : 'Câu tiếp theo →'}
            </Button3D>
          </div>
        )}
      </div>
    </div>
  );
}
