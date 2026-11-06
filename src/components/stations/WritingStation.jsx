import { useState } from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button3D, Confetti, Stars } from '../ui.jsx';
import { playSfx } from '../../utils/sfx.js';

export default function WritingStation({ unit, onFinish }) {
  const writing = unit?.writing;
  const initialPool = writing?.scrambledWords ?? [];
  const target = writing?.correctSentence ?? '';

  const [available, setAvailable] = useState(() => initialPool.map((w, idx) => ({ id: `${idx}_${w}`, word: w })));
  const [assembled, setAssembled] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!writing) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
        <span className="text-5xl" aria-hidden>✍️</span>
        <p className="text-xl font-black text-ink">Bài tập viết đang được cập nhật!</p>
        <Button3D onClick={() => onFinish?.(3, 'Đã hoàn thành viết!')}>Tiếp tục bài học</Button3D>
      </div>
    );
  }

  const addWord = (item) => {
    if (checked) return;
    playSfx('click');
    setAvailable((prev) => prev.filter((x) => x.id !== item.id));
    setAssembled((prev) => [...prev, item]);
  };

  const removeWord = (item) => {
    if (checked) return;
    playSfx('click');
    setAssembled((prev) => prev.filter((x) => x.id !== item.id));
    setAvailable((prev) => [...prev, item]);
  };

  const reset = () => {
    playSfx('click');
    setAvailable(initialPool.map((w, idx) => ({ id: `${idx}_${w}`, word: w })));
    setAssembled([]);
    setChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    const sentence = assembled.map((x) => x.word).join(' ').trim();
    // So sánh chuẩn không phân biệt dấu chấm cuối câu
    const norm = (s) => s.toLowerCase().replace(/[.!?,]/g, '').trim();
    const correct = norm(sentence) === norm(target);
    setChecked(true);
    setIsCorrect(correct);
    playSfx(correct ? 'victory' : 'wrong');
  };

  return (
    <div className="flex flex-col gap-5">
      <Confetti show={checked && isCorrect} />

      <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-6">
        <div>
          <span className="rounded-full bg-mint-soft px-3.5 py-1 text-xs font-black text-mint-dark uppercase">
            Sắp xếp các khối từ thành câu hoàn chỉnh
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-ink mt-3">
            Em hãy chạm vào các từ bên dưới để ghép thành câu đúng nhé:
          </h2>
          {writing.meaningVi && (
            <p className="text-base sm:text-lg font-bold text-ink-soft mt-1">
              💡 Nghĩa tiếng Việt: &quot;{writing.meaningVi}&quot;
            </p>
          )}
        </div>

        {/* Khung chứa các từ đã ghép */}
        <div className={`min-h-24 rounded-3xl p-4 sm:p-6 border-3 transition-all flex flex-wrap items-center gap-2.5 ${
          checked
            ? isCorrect
              ? 'bg-mint-soft border-mint shadow-md'
              : 'bg-rose-50 border-rose-300'
            : assembled.length > 0
            ? 'bg-cream-soft border-banana'
            : 'bg-gray-50 border-dashed border-gray-300'
        }`}>
          {assembled.length === 0 ? (
            <span className="text-base sm:text-lg font-bold text-gray-400 italic">
              Chạm vào các khối từ bên dưới để đưa lên đây...
            </span>
          ) : (
            assembled.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => removeWord(item)}
                disabled={checked}
                className="rounded-2xl bg-white px-4 py-2.5 text-lg font-black text-ink shadow-[0_3px_0_#efe3cc] border border-[#efe3cc] hover:bg-rose-100 hover:text-rose-700 active:translate-y-0.5 transition-all cursor-pointer select-none"
                title="Bấm để gỡ từ này"
              >
                {item.word}
              </button>
            ))
          )}
        </div>

        {/* Khung chứa các từ còn lại để chọn */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase text-ink-soft">Khối từ gợi ý:</span>
          <div className="flex flex-wrap gap-2.5 min-h-16 p-3 bg-cream-soft rounded-2xl border border-banana-soft">
            {available.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addWord(item)}
                disabled={checked}
                className="rounded-2xl bg-white px-4 py-2.5 text-lg font-black text-ink shadow-[0_4px_0_var(--color-banana-dark)] border-2 border-banana hover:bg-banana-soft active:translate-y-1 active:shadow-none transition-all cursor-pointer select-none"
              >
                {item.word}
              </button>
            ))}
          </div>
        </div>

        {/* Kết quả kiểm tra */}
        {checked && (
          <div className={`rounded-2xl p-4 text-center font-black text-lg animate-fade-in ${
            isCorrect ? 'bg-mint text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            {isCorrect ? (
              <div className="flex flex-col items-center gap-1">
                <span>🎉 Xuất sắc! Em đã ghép đúng câu:</span>
                <span className="text-xl font-mono">&quot;{target}&quot;</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span>Chưa hoàn toàn chính xác rồi, em xem đáp án đúng nhé:</span>
                <span className="text-xl font-mono underline">&quot;{target}&quot;</span>
              </div>
            )}
          </div>
        )}

        {/* Các nút bấm điều khiển */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button3D tone="white" onClick={reset} className="px-5 py-3">
            <RotateCcw className="h-5 w-5 mr-1" /> Làm lại
          </Button3D>

          {!checked ? (
            <Button3D
              tone="mint"
              onClick={handleCheck}
              disabled={assembled.length === 0}
              className="px-8 py-3 text-lg"
            >
              <Check className="h-5 w-5 mr-1" /> Kiểm tra câu
            </Button3D>
          ) : (
            <Button3D
              tone="peach"
              onClick={() => onFinish?.(isCorrect ? 3 : 2, 'Hoàn thành bài tập Viết!')}
              className="px-8 py-3 text-lg"
            >
              Hoàn thành trạm Viết ✍️ →
            </Button3D>
          )}
        </div>
      </div>
    </div>
  );
}
