import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { shuffle } from '../utils/random.js';
import { playSfx } from '../utils/sfx.js';
import { ProgressBar, SpeakerButton, SlowSpeakerButton, WordImage, InstructionBanner, starsFromMistakes } from './ui.jsx';
import { t } from '../i18n/vi.js';

const MAX_ROUNDS = 8;

/** 1 đáp án + 3 hình nhiễu (khác emoji/hình), lấy từ pool. */
function makeOptions(word, pool) {
  const seen = new Set([word.emoji]);
  const others = [];
  for (const w of shuffle(pool)) {
    if (w.id === word.id || seen.has(w.emoji)) continue;
    seen.add(w.emoji);
    others.push(w);
    if (others.length === 3) break;
  }
  return shuffle([word, ...others]);
}

function Round({ word, pool, onDone }) {
  const options = useMemo(() => makeOptions(word, pool), [word, pool]);
  const [wrongIds, setWrongIds] = useState(() => new Set());
  const [shakeId, setShakeId] = useState(null);
  const [correct, setCorrect] = useState(false);

  const choose = useCallback(
    (opt) => {
      if (correct || wrongIds.has(opt.id)) return;
      if (opt.id === word.id) {
        setCorrect(true);
        playSfx('correct');
        setTimeout(() => onDone(wrongIds.size > 0), 1200);
      } else {
        playSfx('wrong');
        setWrongIds((prev) => new Set(prev).add(opt.id));
        setShakeId(opt.id);
        setTimeout(() => setShakeId(null), 450);
      }
    },
    [correct, wrongIds, word.id, onDone],
  );

  // Hỗ trợ phím số 1, 2, 3, 4 trên bàn phím máy tính
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        e.preventDefault();
        choose(options[num - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, choose]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Nút nghe chính to rõ + nút nghe chậm */}
      <div className="flex flex-col items-center gap-3">
        <SpeakerButton word={word} autoPlay size="xl" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink-soft">{t.listening.pressToListen}</span>
          <SlowSpeakerButton word={word} size="sm" />
        </div>
      </div>

      {correct ? (
        <div className="animate-pop text-center">
          <p className="text-2xl sm:text-3xl font-black text-mint-dark">
            🎉 {word.word}
          </p>
          <p className="text-lg font-bold text-ink-soft mt-0.5">{word.meaning}</p>
        </div>
      ) : wrongIds.size > 0 ? (
        <p className="text-lg font-black text-peach animate-pulse">{t.common.tryAgain}</p>
      ) : (
        <p className="text-base sm:text-lg font-bold text-ink-soft text-center">
          {t.listening.howTo}
        </p>
      )}

      {/* 4 Lựa chọn hình vẽ với số thứ tự 1, 2, 3, 4 */}
      <div className="grid w-full grid-cols-2 gap-3 sm:gap-5">
        {options.map((opt, idx) => {
          const isRight = correct && opt.id === word.id;
          const isWrong = wrongIds.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => choose(opt)}
              aria-label={`Lựa chọn ${idx + 1}`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-[2rem] transition-all cursor-pointer p-4 ${
                isRight
                  ? 'animate-pop bg-mint-soft ring-6 ring-mint shadow-md'
                  : isWrong
                    ? 'bg-white opacity-35 cursor-not-allowed border-2 border-dashed border-rose-soft'
                    : 'bg-white shadow-[0_6px_0_#efe3cc] border-2 border-[#efe3cc] hover:-translate-y-1 hover:shadow-[0_8px_0_#efe3cc] active:translate-y-1 active:shadow-none'
              } ${shakeId === opt.id ? 'animate-shake' : ''}`}
            >
              <span className="absolute top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-sm font-black text-ink shadow-xs">
                {idx + 1}
              </span>
              <WordImage word={opt} size="lg" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ListeningQuiz({ words, pool, onFinish }) {
  const list = useMemo(() => shuffle(words).slice(0, MAX_ROUNDS), [words]);
  const optionPool = pool?.length >= 4 ? pool : words;
  const [index, setIndex] = useState(0);
  const mistakes = useRef(0);

  const done = (hadMistake) => {
    if (hadMistake) mistakes.current++;
    if (index + 1 < list.length) setIndex(index + 1);
    else onFinish(starsFromMistakes(mistakes.current, list.length));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ProgressBar value={index} max={list.length} tone="bg-peach" />
        <span className="shrink-0 text-base font-black text-ink">
          {index + 1}/{list.length}
        </span>
      </div>

      <InstructionBanner text={t.listening.keyboardHint} />

      <Round key={list[index].id} word={list[index]} pool={optionPool} onDone={done} />
    </div>
  );
}
