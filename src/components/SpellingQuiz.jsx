import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { shuffle } from '../utils/random.js';
import { makeGap, makeLetterBank } from '../utils/spelling.js';
import { playSfx } from '../utils/sfx.js';
import { sayWord } from '../utils/speech.js';
import { useSettings } from '../settings.jsx';
import { Button3D, ProgressBar, SpeakerButton, SlowSpeakerButton, WordImage, InstructionBanner, starsFromMistakes } from './ui.jsx';
import { GapWord, LetterBank, hiddenPositions } from './LetterSlots.jsx';
import { t } from '../i18n/vi.js';

const MAX_WORDS = 8;
const MAX_TRIES = 2;

function SpellingItem({ word, onDone }) {
  const { settings } = useSettings();
  const puzzle = useMemo(() => {
    const g = makeGap(word.word);
    return { gap: g.chars, bank: makeLetterBank(g.missing) };
  }, [word]);

  const slots = hiddenPositions(puzzle.gap);
  const [filled, setFilled] = useState({});
  const [status, setStatus] = useState(null); // null | 'correct' | 'wrong' | 'revealed'
  const [tries, setTries] = useState(0);
  const [shake, setShake] = useState(false);

  const used = new Set(Object.values(filled).map((f) => f.bankIdx));

  const check = useCallback(
    (next) => {
      const ok = slots.every((i) => next[i]?.letter === puzzle.gap[i].char);
      if (ok) {
        setStatus('correct');
        playSfx('correct');
        sayWord(word, settings);
        setTimeout(() => onDone(tries > 0), 1300);
        return;
      }
      playSfx('wrong');
      const nextTries = tries + 1;
      setTries(nextTries);
      setShake(true);
      setTimeout(() => setShake(false), 450);
      if (nextTries >= MAX_TRIES) {
        setStatus('revealed');
        sayWord(word, settings, { slowToo: true });
        return;
      }
      setStatus('wrong');
      // Giữ lại chữ đúng, chỉ trả các chữ sai về bảng chữ
      setTimeout(() => {
        setFilled(
          Object.fromEntries(
            Object.entries(next).filter(([i, f]) => f.letter === puzzle.gap[i].char)
          )
        );
        setStatus(null);
      }, 700);
    },
    [slots, puzzle.gap, word, settings, tries, onDone],
  );

  const pick = useCallback(
    (bankIdx) => {
      if (status) return;
      const empty = slots.find((i) => !filled[i]);
      if (empty === undefined) return;
      playSfx('click');
      const next = { ...filled, [empty]: { letter: puzzle.bank[bankIdx], bankIdx } };
      setFilled(next);
      if (slots.every((i) => next[i])) check(next);
    },
    [status, slots, filled, puzzle.bank, check],
  );

  const unfill = useCallback(
    (i) => {
      if (status) return;
      const next = { ...filled };
      delete next[i];
      setFilled(next);
    },
    [status, filled],
  );

  // Xóa chữ cái vừa điền gần nhất
  const unfillLast = useCallback(() => {
    if (status) return;
    const filledKeys = slots.filter((i) => filled[i]);
    if (filledKeys.length === 0) return;
    const lastKey = filledKeys[filledKeys.length - 1];
    unfill(lastKey);
  }, [status, slots, filled, unfill]);

  // Hỗ trợ gõ trực tiếp từ bàn phím máy tính cho học sinh
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (status === 'revealed' && e.key === 'Enter') {
        e.preventDefault();
        onDone(true);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        unfillLast();
        return;
      }

      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        // Tìm chữ trong letter bank chưa được dùng khớp với phím vừa gõ
        const bankIdx = puzzle.bank.findIndex(
          (letter, idx) => letter.toLowerCase() === key && !used.has(idx)
        );
        if (bankIdx !== -1) {
          e.preventDefault();
          pick(bankIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, onDone, unfillLast, puzzle.bank, used, pick]);

  return (
    <div className="flex flex-col items-center gap-5 rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc]">
      <WordImage word={word} size="lg" />

      <div className="flex items-center gap-3">
        <p className="text-2xl sm:text-3xl font-black text-ink">{word.meaning}</p>
        <SpeakerButton word={word} size="sm" />
        <SlowSpeakerButton word={word} size="sm" />
      </div>

      <div className={shake ? 'animate-shake' : ''}>
        <GapWord gap={puzzle.gap} filled={filled} onSlotTap={unfill} status={status} />
      </div>

      {status === 'revealed' ? (
        <div className="animate-pop flex flex-col items-center gap-3 text-center my-2">
          <p className="text-lg font-bold text-ink-soft">{t.spelling.revealed}</p>
          <p className="text-4xl sm:text-5xl font-black text-mint-dark">{word.word}</p>
          <p className="text-xl font-bold text-sky-dark">{word.phonetic}</p>
          <Button3D tone="banana" onClick={() => onDone(true)} className="mt-2 px-8">
            {t.common.next} →
          </Button3D>
        </div>
      ) : status === 'correct' ? (
        <p className="animate-pop text-2xl sm:text-3xl font-black text-mint-dark my-2">
          🎉 {t.common.greatJob}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full">
          {status === 'wrong' && (
            <p className="font-black text-peach text-lg animate-pulse">{t.common.tryAgain}</p>
          )}

          {/* Bảng chữ cái để chọn */}
          <LetterBank letters={puzzle.bank} used={used} onPick={pick} disabled={!!status} />

          {/* Nút xóa chữ vừa điền cho người dùng chuột */}
          {Object.keys(filled).length > 0 && (
            <button
              type="button"
              onClick={unfillLast}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-cream px-4 py-2 text-sm font-black text-ink-soft hover:text-peach border border-banana-soft hover:bg-rose-soft/40 cursor-pointer transition-all active:scale-95"
            >
              <span>{t.spelling.deleteLetter}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SpellingQuiz({ words, onFinish }) {
  const list = useMemo(() => shuffle(words).slice(0, MAX_WORDS), [words]);
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
        <ProgressBar value={index} max={list.length} tone="bg-mint" />
        <span className="shrink-0 text-base font-black text-ink">
          {index + 1}/{list.length}
        </span>
      </div>

      <InstructionBanner text={t.spelling.keyboardHint} />

      <SpellingItem key={list[index].id} word={list[index]} onDone={done} />
    </div>
  );
}
