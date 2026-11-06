import { useMemo, useRef, useState } from 'react';
import { shuffle } from '../utils/random.js';
import { playSfx } from '../utils/sfx.js';
import { sayWord } from '../utils/speech.js';
import { useSettings } from '../settings.jsx';
import { WordImage, starsFromMistakes } from './ui.jsx';
import { t } from '../i18n/vi.js';

const ROUND_SIZE = 5;

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  // Tránh vòng cuối chỉ có 1 từ
  if (out.length > 1 && out[out.length - 1].length < 2) out[out.length - 2].push(...out.pop());
  return out;
}

export default function MatchingGame({ words, onFinish }) {
  const { settings } = useSettings();
  const [target, setTarget] = useState('image'); // 'image' | 'meaning'
  const rounds = useMemo(() => chunk(shuffle(words), ROUND_SIZE), [words]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [matched, setMatched] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [shakeId, setShakeId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const mistakes = useRef(0);

  const round = rounds[roundIdx] || [];
  const rightSide = useMemo(() => shuffle(round), [round]);

  const selectedWord = selected ? round.find((w) => w.id === selected) : null;

  const attempt = (leftId, rightId) => {
    if (leftId === rightId) {
      playSfx('correct');
      const word = round.find((w) => w.id === leftId);
      sayWord(word, settings);
      const next = new Set(matched).add(leftId);
      setMatched(next);
      setSelected(null);
      setFeedbackMsg({ type: 'success', text: `Chính xác! ${word.word}` });
      setTimeout(() => setFeedbackMsg(null), 1200);

      if (next.size === round.length) {
        setTimeout(() => {
          if (roundIdx + 1 < rounds.length) {
            setRoundIdx(roundIdx + 1);
            setMatched(new Set());
          } else {
            onFinish(starsFromMistakes(mistakes.current, words.length));
          }
        }, 800);
      }
    } else {
      playSfx('wrong');
      mistakes.current++;
      setShakeId(rightId);
      setFeedbackMsg({ type: 'wrong', text: t.matching.wrongTryAgain });
      setTimeout(() => {
        setShakeId(null);
        setFeedbackMsg(null);
      }, 1200);
    }
  };

  const handleLeftClick = (id) => {
    if (matched.has(id)) return;
    playSfx('click');
    const word = round.find((w) => w.id === id);
    sayWord(word, settings);
    setSelected((prev) => (prev === id ? null : id));
  };

  const handleRightClick = (id) => {
    if (matched.has(id)) return;
    if (!selected) {
      // Nhắc nhở nếu học sinh bấm cột bên phải trước
      setFeedbackMsg({ type: 'info', text: '👉 Em hãy chọn 1 từ ở cột bên trái trước nhé!' });
      setTimeout(() => setFeedbackMsg(null), 1500);
      return;
    }
    attempt(selected, id);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Chọn kiểu nối: Hình ảnh HOẶC Nghĩa tiếng Việt */}
      <div className="flex gap-2 rounded-3xl bg-white p-2 shadow-xs border border-banana-soft">
        {[
          ['image', t.matching.toImage],
          ['meaning', t.matching.toMeaning],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={target === key}
            onClick={() => {
              playSfx('click');
              setTarget(key);
              setSelected(null);
            }}
            className={`min-h-14 flex-1 rounded-2xl text-base sm:text-lg font-black transition-all cursor-pointer ${
              target === key
                ? 'bg-sky text-ink shadow-[0_4px_0_var(--color-sky-dark)]'
                : 'text-ink-soft hover:bg-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Thông báo tiến độ & hướng dẫn bước làm bài */}
      <div className="rounded-2xl bg-white p-3.5 text-center shadow-xs border border-banana-soft">
        <div className="flex items-center justify-between text-xs sm:text-sm font-black text-ink-soft mb-1">
          <span>Vòng {roundIdx + 1}/{rounds.length}</span>
          <span>Đã nối: {matched.size}/{round.length} cặp</span>
        </div>

        {feedbackMsg ? (
          <p
            className={`text-base sm:text-lg font-black transition-all ${
              feedbackMsg.type === 'success'
                ? 'text-mint-dark animate-pop'
                : feedbackMsg.type === 'wrong'
                  ? 'text-peach'
                  : 'text-sky-dark'
            }`}
          >
            {feedbackMsg.text}
          </p>
        ) : selectedWord ? (
          <p className="text-base sm:text-lg font-black text-peach animate-pulse">
            {t.matching.step2(selectedWord.word)}
          </p>
        ) : (
          <p className="text-base sm:text-lg font-black text-ink">
            {t.matching.step1}
          </p>
        )}
      </div>

      {/* 2 Cột bài tập: Bên trái tiếng Anh, bên phải Hình/Nghĩa */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Cột bên trái: Tiếng Anh */}
        <ul className="flex flex-col gap-3">
          {round.map((w) => {
            const done = matched.has(w.id);
            const isSelected = selected === w.id;
            return (
              <li key={w.id}>
                <button
                  type="button"
                  disabled={done}
                  onClick={() => handleLeftClick(w.id)}
                  className={`flex min-h-24 w-full items-center justify-center rounded-3xl p-3 text-center text-xl sm:text-2xl font-black break-words transition-all cursor-pointer select-none ${
                    done
                      ? 'bg-mint-soft text-mint-dark opacity-60 border-2 border-mint cursor-default'
                      : isSelected
                        ? 'bg-banana text-ink shadow-[0_6px_0_var(--color-banana-dark)] ring-4 ring-banana-soft scale-[1.02]'
                        : 'bg-white text-ink shadow-[0_6px_0_#efe3cc] hover:bg-banana-soft/40 hover:-translate-y-0.5 active:translate-y-1'
                  }`}
                >
                  {done ? `✓ ${w.word}` : w.word}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Cột bên phải: Hình ảnh hoặc Nghĩa tiếng Việt */}
        <ul className="flex flex-col gap-3">
          {rightSide.map((w) => {
            const done = matched.has(w.id);
            return (
              <li key={w.id}>
                <button
                  type="button"
                  disabled={done}
                  onClick={() => handleRightClick(w.id)}
                  className={`flex min-h-24 w-full items-center justify-center rounded-3xl p-3 text-center text-lg sm:text-xl font-black transition-all cursor-pointer select-none ${
                    done
                      ? 'bg-mint-soft text-mint-dark opacity-60 border-2 border-mint cursor-default'
                      : selected
                        ? 'bg-sky-soft/90 text-ink shadow-[0_6px_0_#c4dcf7] ring-3 ring-sky hover:bg-sky-soft hover:scale-[1.02]'
                        : 'bg-sky-soft text-ink shadow-[0_6px_0_#c4dcf7] hover:-translate-y-0.5 active:translate-y-1'
                  } ${shakeId === w.id ? 'animate-shake !bg-rose-soft ring-4 ring-peach' : ''}`}
                >
                  {done ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">✓</span>
                      {target === 'image' ? (
                        <div className="flex items-center gap-2">
                          <WordImage word={w} size="sm" />
                          <span className="text-base font-black text-ink">{w.meaning}</span>
                        </div>
                      ) : (
                        <span>{w.meaning}</span>
                      )}
                    </span>
                  ) : target === 'image' ? (
                    <div className="flex flex-col items-center gap-1">
                      <WordImage word={w} size="sm" />
                      <span className="text-xs sm:text-sm font-black text-ink line-clamp-1">{w.meaning}</span>
                    </div>
                  ) : (
                    <span>{w.meaning}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
