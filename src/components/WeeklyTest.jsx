import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { isCorrect } from '../utils/testGenerator.js';
import { playSfx } from '../utils/sfx.js';
import { getWord } from '../utils/data.js';
import { Button3D, ProgressBar, SpeakerButton, SlowSpeakerButton, WordImage } from './ui.jsx';
import { GapWord, LetterBank, hiddenPositions } from './LetterSlots.jsx';
import VocabCard from './VocabCard.jsx';
import { t } from '../i18n/vi.js';

const LABELS = ['A', 'B', 'C', 'D'];

function ChoiceOptions({ q, picked, onPick, big }) {
  // Hỗ trợ phím số 1-4 hoặc A-D trên bàn phím máy tính
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (picked != null) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();
      let selectedIdx = -1;
      if (['1', '2', '3', '4'].includes(key)) {
        selectedIdx = parseInt(key, 10) - 1;
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        selectedIdx = LABELS.indexOf(key);
      }

      if (selectedIdx >= 0 && selectedIdx < q.options.length) {
        e.preventDefault();
        onPick(q.options[selectedIdx].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [picked, q.options, onPick]);

  return (
    <div className={`grid gap-3 ${big ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {q.options.map((o, idx) => {
        const answered = picked != null;
        const isAnswer = o.id === q.answerId;
        const tone = !answered
          ? 'bg-white shadow-[0_5px_0_#efe3cc] border-2 border-[#efe3cc] hover:-translate-y-0.5 hover:bg-banana-soft/30 active:translate-y-1 active:shadow-none'
          : isAnswer
            ? 'bg-mint-soft ring-4 ring-mint border-2 border-mint text-mint-dark font-black'
            : picked === o.id
              ? 'bg-peach-soft border-2 border-peach text-peach-dark'
              : 'bg-white opacity-40 border-2 border-transparent';

        return (
          <button
            key={o.id}
            type="button"
            disabled={answered}
            onClick={() => onPick(o.id)}
            className={`flex min-h-20 items-center gap-3 rounded-3xl px-5 py-4 text-left text-lg sm:text-xl font-black transition-all cursor-pointer ${tone}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cream text-base font-black text-ink shadow-xs">
              {LABELS[idx] || idx + 1}
            </span>
            <span className="flex-1 leading-snug">
              {answered && isAnswer && '✓ '}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SpellingAnswer({ q, onSubmit, answered }) {
  const slots = hiddenPositions(q.gap);
  const [filled, setFilled] = useState({});
  const used = new Set(Object.values(filled).map((f) => f.bankIdx));
  const complete = slots.every((i) => filled[i]);

  const pick = (bankIdx) => {
    if (answered) return;
    const empty = slots.find((i) => !filled[i]);
    if (empty === undefined) return;
    playSfx('click');
    setFilled({ ...filled, [empty]: { letter: q.letterBank[bankIdx], bankIdx } });
  };

  const unfill = (i) => {
    if (answered) return;
    const next = { ...filled };
    delete next[i];
    setFilled(next);
  };

  const unfillLast = () => {
    if (answered) return;
    const filledKeys = slots.filter((i) => filled[i]);
    if (filledKeys.length === 0) return;
    unfill(filledKeys[filledKeys.length - 1]);
  };

  // Hỗ trợ gõ chữ trực tiếp từ bàn phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (answered) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        unfillLast();
        return;
      }

      if (e.key === 'Enter' && complete) {
        e.preventDefault();
        onSubmit(slots.map((i) => filled[i].letter));
        return;
      }

      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        const bankIdx = q.letterBank.findIndex(
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
  }, [answered, complete, filled, q.letterBank, used, slots, onSubmit]);

  const status = answered
    ? isCorrect(q, slots.map((i) => filled[i]?.letter))
      ? 'correct'
      : 'wrong'
    : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <GapWord gap={q.gap} filled={filled} onSlotTap={unfill} status={status} />
      {!answered && (
        <div className="flex flex-col items-center gap-4 w-full">
          <LetterBank letters={q.letterBank} used={used} onPick={pick} />

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {Object.keys(filled).length > 0 && (
              <button
                type="button"
                onClick={unfillLast}
                className="rounded-2xl bg-cream px-4 py-2 text-sm font-black text-ink-soft hover:text-peach border border-banana-soft cursor-pointer"
              >
                {t.spelling.deleteLetter}
              </button>
            )}

            <Button3D
              tone="mint"
              disabled={!complete}
              onClick={() => onSubmit(slots.map((i) => filled[i]?.letter))}
              className="px-8"
            >
              {t.common.check} ✓
            </Button3D>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionBody({ q, response, onAnswer }) {
  const answered = response !== undefined;

  switch (q.type) {
    case 'image_to_word':
      return (
        <div className="flex flex-col gap-5">
          <div className="flex justify-center my-2">
            <WordImage word={{ word: '?', emoji: q.emoji, image: q.image }} size="xl" />
          </div>
          <ChoiceOptions q={q} picked={response} onPick={onAnswer} />
        </div>
      );
    case 'word_to_meaning': {
      const wordObj = getWord(q.wordId);
      return (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-center gap-3 my-2">
            <p className="text-4xl sm:text-5xl font-black text-ink">{q.word}</p>
            <SpeakerButton word={wordObj} text={q.word} size="md" />
            <SlowSpeakerButton word={wordObj} text={q.word} size="sm" />
          </div>
          <ChoiceOptions q={q} picked={response} onPick={onAnswer} big />
        </div>
      );
    }
    case 'listen_to_word': {
      const wordObj = getWord(q.wordId);
      return (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center justify-center gap-2 my-2">
            <SpeakerButton key={q.id} word={wordObj} text={q.speak} autoPlay size="xl" />
            <span className="text-sm font-bold text-ink-soft">{t.listening.pressToListen}</span>
          </div>
          <ChoiceOptions q={q} picked={response} onPick={onAnswer} />
        </div>
      );
    }
    case 'context': {
      const wordObj = getWord(q.wordId);
      return (
        <div className="flex flex-col gap-5">
          <div className="rounded-3xl bg-white p-6 text-center shadow-xs border-2 border-banana-soft my-2">
            <div className="flex items-center justify-center gap-3">
              <p className="text-2xl sm:text-3xl font-black text-ink leading-relaxed">{q.sentence}</p>
              {wordObj?.audioExample && <SpeakerButton audio={wordObj.audioExample} text={wordObj.exampleEn} size="sm" />}
            </div>
            <p className="mt-2 text-lg sm:text-xl font-bold text-ink-soft">({q.sentenceVi})</p>
          </div>
          <ChoiceOptions q={q} picked={response} onPick={onAnswer} />
        </div>
      );
    }
    case 'spelling':
      return (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 my-2">
            <WordImage word={{ word: q.meaning, emoji: q.emoji, image: q.image }} size="lg" />
            <p className="text-2xl sm:text-3xl font-black text-ink">{q.meaning}</p>
          </div>
          <SpellingAnswer key={q.id} q={q} answered={answered} onSubmit={onAnswer} />
        </div>
      );
    default:
      return null;
  }
}

function Feedback({ q, correct, onNext, isLast }) {
  const word = getWord(q.wordId);

  // Nhấn Enter để chuyển câu tiếp theo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <div
      className={`animate-pop flex flex-col gap-4 rounded-3xl p-5 border-2 shadow-sm ${
        correct ? 'bg-mint-soft border-mint' : 'bg-banana-soft border-banana-dark/30'
      }`}
      role="status"
    >
      <div className="flex items-center justify-between">
        {correct ? (
          <p className="text-xl sm:text-2xl font-black text-mint-dark">🎉 {t.common.greatJob}</p>
        ) : (
          <p className="text-lg sm:text-xl font-black text-ink">
            💛 Không sao cả! {t.common.correctIs}:{' '}
            <strong className="text-mint-dark underline">{word?.word}</strong>
          </p>
        )}
      </div>

      {!correct && word && <VocabCard word={word} compact />}

      <div className="flex justify-end">
        <Button3D
          tone={correct ? 'mint' : 'banana'}
          onClick={onNext}
          className="px-8 py-3.5 text-lg"
        >
          {isLast ? `${t.common.finish} ✓` : `${t.common.next} →`}
        </Button3D>
      </div>
    </div>
  );
}

/** Chạy bài test tuần */
export default function WeeklyTest({ questions, onComplete }) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const answersRef = useRef([]);
  const q = questions[index];
  const response = responses[q.id];
  const correct = response !== undefined && isCorrect(q, response);

  // Cảnh báo nếu học sinh vô tình reload hoặc đóng trang giữa chừng
  useEffect(() => {
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const answer = (value) => {
    if (response !== undefined) return;
    const ok = isCorrect(q, value);
    playSfx(ok ? 'correct' : 'wrong');
    setResponses({ ...responses, [q.id]: value });
    answersRef.current.push({
      questionId: q.id,
      wordId: q.wordId,
      type: q.type,
      kind: q.kind,
      correct: ok,
    });
  };

  const next = () => {
    if (index + 1 < questions.length) setIndex(index + 1);
    else onComplete(answersRef.current);
  };

  const sectionTitle = useMemo(() => t.test.section[q.kind], [q.kind]);

  return (
    <div className="flex flex-col gap-5">
      {/* Thanh tiến trình và tiêu đề phần thi */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-black text-sm sm:text-base">
          <span className="rounded-full bg-sky-soft px-3 py-1 text-sky-dark">{sectionTitle}</span>
          <span className="text-ink">{t.test.question(index + 1, questions.length)}</span>
        </div>
        <ProgressBar value={index} max={questions.length} tone="bg-sky" />
      </div>

      <h2 className="text-center text-2xl sm:text-3xl font-black text-ink">{t.test.prompt[q.type]}</h2>

      <QuestionBody q={q} response={response} onAnswer={answer} />

      {response !== undefined && (
        <Feedback q={q} correct={correct} onNext={next} isLast={index + 1 === questions.length} />
      )}
    </div>
  );
}
