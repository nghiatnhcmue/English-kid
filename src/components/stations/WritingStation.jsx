import { useState, useMemo, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { Button3D, Confetti, ProgressBar } from '../ui.jsx';
import { playSfx } from '../../utils/sfx.js';
import {
  extractScrambledWords,
  makeWordTokens,
  gradeQuestionAnswer,
} from '../../utils/questionGrading.js';
import FillBlankField from '../questions/FillBlankField.jsx';
import WordUnscrambleBoard from '../questions/WordUnscrambleBoard.jsx';

export default function WritingStation({ unit, onFinish }) {
  const writing = unit?.writing;

  const items = useMemo(() => {
    if (!writing) return [];
    if (Array.isArray(writing.items) && writing.items.length > 0) return writing.items;
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

  const [available, setAvailable] = useState([]);
  const [assembled, setAssembled] = useState([]);
  const [filledWord, setFilledWord] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (!currentItem) return;
    setChecked(false);
    setIsCorrect(false);
    if (currentItem.type === 'fill_blank') {
      setFilledWord('');
    } else {
      setAvailable(makeWordTokens(extractScrambledWords(currentItem), 'wr'));
      setAssembled([]);
    }
  }, [currentIndex, currentItem]);

  if (!writing || items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
        <span className="text-5xl" aria-hidden>
          ✍️
        </span>
        <p className="text-xl font-black text-ink">Bài tập viết đang được cập nhật!</p>
        <Button3D onClick={() => onFinish?.(3, 'Đã hoàn thành viết!')}>Tiếp tục bài học</Button3D>
      </div>
    );
  }

  const isFill = currentItem.type === 'fill_blank';
  const isLast = currentIndex === items.length - 1;

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
      setAvailable(makeWordTokens(extractScrambledWords(currentItem), 'wr'));
      setAssembled([]);
    }
  };

  const handleCheck = () => {
    const qObj = { ...currentItem, type: isFill ? 'fill_blank' : 'unscramble' };
    const answer = isFill ? filledWord : assembled.map((x) => x.word).join(' ').trim();
    const correct = gradeQuestionAnswer(qObj, answer);

    setChecked(true);
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      playSfx('victory');
    } else {
      playSfx('wrong');
    }
  };

  const handleNext = () => {
    if (isLast) {
      const total = items.length;
      const finalStars = score >= total ? 3 : score >= Math.ceil(total / 2) ? 2 : 1;
      onFinish?.(finalStars, `Hoàn thành ${score}/${total} câu bài tập viết!`);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Confetti show={checked && isCorrect} />

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

        {isFill ? (
          <FillBlankField
            sentence={currentItem.sentence || '______'}
            value={filledWord}
            options={currentItem.options}
            locked={checked}
            showResult={checked}
            isCorrect={isCorrect}
            onChange={setFilledWord}
          />
        ) : (
          <WordUnscrambleBoard
            availableWords={available}
            assembledWords={assembled}
            locked={checked}
            showResult={checked}
            isCorrect={isCorrect}
            onAddWord={addWord}
            onRemoveWord={removeWord}
            onReset={resetCurrent}
          />
        )}

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
                  &quot;
                  {isFill
                    ? currentItem.correctSentence ||
                      (currentItem.sentence || '').replace(/_{2,}/g, currentItem.blankWord)
                    : currentItem.correctSentence}
                  &quot;
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span>Chưa hoàn toàn chính xác rồi, em xem đáp án đúng nhé:</span>
                <span className="text-xl font-mono underline">
                  &quot;{isFill ? currentItem.blankWord || currentItem.correctSentence : currentItem.correctSentence}
                  &quot;
                </span>
              </div>
            )}
          </div>
        )}

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
            <Button3D tone="peach" onClick={handleNext} className="px-8 py-3 text-lg">
              {isLast ? 'Hoàn thành trạm Viết ✍️ →' : 'Câu tiếp theo →'}
            </Button3D>
          )}
        </div>
      </div>
    </div>
  );
}
