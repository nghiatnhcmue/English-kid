import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUnit, getWord, allWords } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { wordsByStatus } from '../utils/mastery.js';
import { Button3D, PageHeader, ResultScreen } from '../components/ui.jsx';
import Flashcard3D from '../components/Flashcard3D.jsx';
import MatchingGame from '../components/MatchingGame.jsx';
import SpellingQuiz from '../components/SpellingQuiz.jsx';
import ListeningQuiz from '../components/ListeningQuiz.jsx';
import GrammarStation from '../components/stations/GrammarStation.jsx';
import ShadowingStation from '../components/stations/ShadowingStation.jsx';
import SpeakingStation from '../components/stations/SpeakingStation.jsx';
import ReadingStation from '../components/stations/ReadingStation.jsx';
import WritingStation from '../components/stations/WritingStation.jsx';
import { MODES } from './UnitPage.jsx';
import { t } from '../i18n/vi.js';

const COMPONENTS = {
  flashcard: Flashcard3D,
  listening: ListeningQuiz,
  matching: MatchingGame,
  spelling: SpellingQuiz,
  grammar: GrammarStation,
  shadowing: ShadowingStation,
  speaking: SpeakingStation,
  reading: ReadingStation,
  writing: WritingStation,
};

/** Chạy 1 chế độ ôn cho 1 Unit, hoặc cho danh sách "Từ khó" (review). */
export default function PracticePage({ review = false }) {
  const { unitId, mode } = useParams();
  const unit = review ? null : getUnit(unitId);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);

  const { words, pool } = useMemo(() => {
    if (review) {
      const hard = wordsByStatus(store().getMastery(), 'review').map(getWord).filter(Boolean);
      return { words: hard, pool: allWords() };
    }
    return { words: unit?.vocabularies ?? [], pool: unit?.vocabularies ?? [] };
  }, [review, unit]);

  const Mode = COMPONENTS[mode];
  const backTo = review ? '/journal' : `/unit/${unitId}`;
  const backLabel = review ? t.journal.title : unit ? `Unit ${unit.unitId}` : t.common.back;
  const subtitle = review ? '🔴 Luyện tập các từ em chưa nhớ' : unit ? `${unit.emoji} Unit ${unit.unitId}: ${unit.titleEn}` : '';

  if (!Mode || (!review && !unit)) {
    return (
      <div className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-2xl font-black">{t.unit.notFound}</p>
        <Button3D to="/">{t.common.backToHome}</Button3D>
      </div>
    );
  }

  const minWords = mode === 'flashcard' ? 1 : 2;

  const finish = (stars, summary) => {
    if (review) store().markStudyDay();
    else store().saveModeResult(unit.unitId, mode, stars);
    setResult({ stars, summary });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`${t.modes[mode].icon} ${t.modes[mode].name}`}
        subtitle={subtitle}
        backTo={backTo}
        backLabel={backLabel}
      />

      {review && (
        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Chọn chế độ ôn">
          {MODES.map((m) => (
            <Link
              key={m}
              to={`/review/${m}`}
              onClick={() => {
                setResult(null);
                setRound((r) => r + 1);
              }}
              className={`shrink-0 rounded-2xl px-5 py-3 text-base font-black transition-all ${
                m === mode
                  ? 'bg-sky text-ink shadow-[0_4px_0_var(--color-sky-dark)]'
                  : 'bg-white text-ink-soft hover:bg-cream'
              }`}
            >
              {t.modes[m].icon} {t.modes[m].name}
            </Link>
          ))}
        </nav>
      )}

      {words.length < minWords ? (
        <div className="rounded-[2rem] bg-white p-8 sm:p-12 text-center text-xl font-black text-ink shadow-sm border border-banana-soft">
          {review ? `🌱 ${t.home.noHardWords}` : t.unit.notFound}
        </div>
      ) : result ? (
        <ResultScreen
          stars={result.stars}
          summary={result.summary}
          backTo={backTo}
          backLabel={review ? t.journal.title : t.result.backToUnit}
          onAgain={() => {
            setResult(null);
            setRound((r) => r + 1);
          }}
        />
      ) : (
        <Mode key={`${mode}-${round}`} words={words} pool={pool} unit={unit} onFinish={finish} />
      )}
    </div>
  );
}
