import { useState, useMemo, useEffect } from 'react';
import { RotateCcw, Check, Sparkles, Pencil } from 'lucide-react';
import { Button3D, Confetti, ProgressBar } from '../ui.jsx';
import { playSfx } from '../../utils/sfx.js';

export default function WritingStation({ unit, onFinish }) {
  const writing = unit?.writing;

  // Chuẩn hóa danh sách các bài tập viết/điền khuyết
  const items = useMemo(() => {
    if (!writing) return [];
    if (Array.isArray(writing.items) && writing.items.length > 0) {
      return writing.items;
    }
    if (writing.correctSentence) {
      return [
        {
          id: 'base_item_1',
          type: writing.type || 'unscramble',
          sentence: writing.correctSentence,
          correctSentence: writing.correctSentence,
          scrambledWords: writing.scrambledWords || writing.correctSentence.split(/\s+/),
          meaningVi: writing.meaningVi || '',
          hint: writing.hint || '',
        },
      ];
    }
    return [];
  }, [writing]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentItem = items[currentIndex];

  // Trạng thái của câu ghép từ (unscramble)
  const [available, setAvailable] = useState([]);
  const [assembled, setAssembled] = useState([]);

  // Trạng thái của câu điền khuyết (fill_blank)
  const [filledWord, setFilledWord] = useState('');

  // Trạng thái kiểm tra chung
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Khởi tạo/Đặt lại trạng thái khi đổi câu
  useEffect(() => {
    if (!currentItem) return;
    setChecked(false);
    setIsCorrect(false);

    if (currentItem.type === 'fill_blank') {
      setFilledWord('');
    } else {
      const words = Array.isArray(currentItem.scrambledWords) && currentItem.scrambledWords.length > 0
        ? currentItem.scrambledWords
        : (currentItem.correctSentence || '').split(/\s+/);

      setAvailable(words.map((w, idx) => ({ id: `${idx}_${w}_${Date.now()}`, word: w })));
      setAssembled([]);
    }
  }, [currentIndex, currentItem]);

  if (!writing || items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
        <span className="text-5xl" aria-hidden>✍️</span>
        <p className="text-xl font-black text-ink">Bài tập viết đang được cập nhật!</p>
        <Button3D onClick={() => onFinish?.(3, 'Đã hoàn thành viết!')}>Tiếp tục bài học</Button3D>
      </div>
    );
  }

  const isFill = currentItem.type === 'fill_blank';
  const isLast = currentIndex === items.length - 1;

  // Thao tác ghép từ
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

  const resetCurrent = () => {
    playSfx('click');
    setChecked(false);
    setIsCorrect(false);

    if (isFill) {
      setFilledWord('');
    } else {
      const words = Array.isArray(currentItem.scrambledWords) && currentItem.scrambledWords.length > 0
        ? currentItem.scrambledWords
        : (currentItem.correctSentence || '').split(/\s+/);

      setAvailable(words.map((w, idx) => ({ id: `${idx}_${w}_${Date.now()}`, word: w })));
      setAssembled([]);
    }
  };

  const norm = (s) => String(s || '').toLowerCase().replace(/[.!?,]/g, '').trim();

  // Kiểm tra câu trả lời
  const handleCheck = () => {
    let correct = false;
    if (isFill) {
      const targetWord = currentItem.blankWord || '';
      correct = norm(filledWord) === norm(targetWord);
    } else {
      const target = currentItem.correctSentence || '';
      const assembledSentence = assembled.map((x) => x.word).join(' ').trim();
      correct = norm(assembledSentence) === norm(target);
    }

    setChecked(true);
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      playSfx('victory');
    } else {
      playSfx('wrong');
    }
  };

  // Sang câu tiếp theo
  const handleNext = () => {
    if (isLast) {
      const total = items.length;
      const finalStars = score >= total ? 3 : score >= Math.ceil(total / 2) ? 2 : 1;
      onFinish?.(finalStars, `Hoàn thành ${score}/${total} câu bài tập viết!`);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Tách câu điền khuyết thành 2 phần trước và sau chỗ trống
  const renderFillBlankSentence = () => {
    const rawSentence = currentItem.sentence || '______';
    const parts = rawSentence.split(/_{2,}|\[[^\]]+\]/);
    const before = parts[0] || '';
    const after = parts[1] || '';

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-xl sm:text-2xl font-bold text-ink leading-relaxed bg-cream-soft p-6 rounded-3xl border-2 border-banana-soft text-center">
        <span>{before}</span>
        <span
          className={`inline-flex items-center justify-center min-w-[140px] px-4 py-1.5 rounded-2xl font-black text-xl border-2 transition-all ${
            checked
              ? isCorrect
                ? 'bg-mint text-white border-mint-dark shadow-sm'
                : 'bg-rose-100 text-rose-800 border-rose-300'
              : filledWord
              ? 'bg-white text-ink border-banana shadow-xs'
              : 'bg-white/80 text-gray-400 border-dashed border-banana animate-pulse'
          }`}
        >
          {filledWord || '_______'}
        </span>
        <span>{after}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <Confetti show={checked && isCorrect} />

      {/* Thanh tiến độ nếu có nhiều hơn 1 câu */}
      {items.length > 1 && (
        <div className="flex items-center gap-3">
          <ProgressBar value={currentIndex + 1} max={items.length} tone={isFill ? 'bg-sky' : 'bg-mint'} />
          <span className="shrink-0 text-sm font-black text-ink">
            Câu {currentIndex + 1}/{items.length}
          </span>
        </div>
      )}

      <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-6">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span
              className={`rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider ${
                isFill ? 'bg-sky-soft text-sky-dark' : 'bg-mint-soft text-mint-dark'
              }`}
            >
              {isFill ? '✏️ Điền từ còn thiếu vào chỗ trống' : '🧩 Ghép các khối từ thành câu hoàn chỉnh'}
            </span>

            {currentItem.hint && (
              <span className="text-xs font-bold text-ink-soft bg-banana-soft/60 px-3 py-1 rounded-full">
                💡 {currentItem.hint}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-ink mt-3">
            {isFill
              ? 'Em hãy chọn hoặc gõ từ đúng để điền vào câu bên dưới nhé:'
              : 'Em hãy chạm vào các từ bên dưới để ghép thành câu hoàn chỉnh nhé:'}
          </h2>

          {currentItem.meaningVi && (
            <p className="text-base sm:text-lg font-bold text-ink-soft mt-1">
              💡 Nghĩa tiếng Việt: &quot;{currentItem.meaningVi}&quot;
            </p>
          )}
        </div>

        {/* ================= GIAO DIỆN DẠNG 1: ĐIỀN KHUYẾT (FILL IN BLANK) ================= */}
        {isFill && (
          <div className="flex flex-col gap-5">
            {renderFillBlankSentence()}

            {/* Các lựa chọn từ gợi ý nếu có */}
            {currentItem.options?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase text-ink-soft">Chạm vào từ để chọn:</span>
                <div className="flex flex-wrap gap-2.5 p-3 bg-cream-soft rounded-2xl border border-banana-soft">
                  {currentItem.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => {
                        if (checked) return;
                        playSfx('click');
                        setFilledWord(opt);
                      }}
                      disabled={checked}
                      className={`rounded-2xl px-5 py-2.5 text-base sm:text-lg font-black transition-all cursor-pointer ${
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

            {/* Hoặc ô tự gõ từ */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-ink-soft whitespace-nowrap">Hoặc tự gõ từ:</span>
              <input
                type="text"
                disabled={checked}
                value={filledWord}
                onChange={(e) => setFilledWord(e.target.value)}
                placeholder="Nhập từ cần điền vào đây..."
                className="flex-1 rounded-2xl bg-cream px-4 py-2.5 text-base font-black text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
              />
            </div>
          </div>
        )}

        {/* ================= GIAO DIỆN DẠNG 2: GHÉP TỪ (UNSCRAMBLE) ================= */}
        {!isFill && (
          <div className="flex flex-col gap-5">
            {/* Khung chứa các từ đã ghép */}
            <div
              className={`min-h-24 rounded-3xl p-4 sm:p-6 border-3 transition-all flex flex-wrap items-center gap-2.5 ${
                checked
                  ? isCorrect
                    ? 'bg-mint-soft border-mint shadow-md'
                    : 'bg-rose-50 border-rose-300'
                  : assembled.length > 0
                  ? 'bg-cream-soft border-banana'
                  : 'bg-gray-50 border-dashed border-gray-300'
              }`}
            >
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
          </div>
        )}

        {/* Kết quả kiểm tra */}
        {checked && (
          <div
            className={`rounded-2xl p-4 text-center font-black text-lg animate-fade-in ${
              isCorrect ? 'bg-mint text-white' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isCorrect ? (
              <div className="flex flex-col items-center gap-1">
                <span>🎉 Xuất sắc! Em đã hoàn thành đúng:</span>
                <span className="text-xl font-mono">
                  &quot;{isFill ? (currentItem.correctSentence || currentItem.sentence.replace(/_{2,}/g, currentItem.blankWord)) : currentItem.correctSentence}&quot;
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span>Chưa hoàn toàn chính xác rồi, em xem đáp án đúng nhé:</span>
                <span className="text-xl font-mono underline">
                  &quot;{isFill ? (currentItem.blankWord || currentItem.correctSentence) : currentItem.correctSentence}&quot;
                </span>
              </div>
            )}
          </div>
        )}

        {/* Các nút bấm điều khiển */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button3D tone="white" onClick={resetCurrent} className="px-5 py-3">
            <RotateCcw className="h-5 w-5 mr-1" /> Làm lại
          </Button3D>

          {!checked ? (
            <Button3D
              tone="mint"
              onClick={handleCheck}
              disabled={isFill ? !filledWord.trim() : assembled.length === 0}
              className="px-8 py-3 text-lg"
            >
              <Check className="h-5 w-5 mr-1" /> Kiểm tra câu
            </Button3D>
          ) : (
            <Button3D
              tone="peach"
              onClick={handleNext}
              className="px-8 py-3 text-lg"
            >
              {isLast ? 'Hoàn thành trạm Viết ✍️ →' : 'Câu tiếp theo →'}
            </Button3D>
          )}
        </div>
      </div>
    </div>
  );
}
