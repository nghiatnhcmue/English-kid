import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUnits, vocabOf, getWord } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { generateTest } from '../utils/testGenerator.js';
import { wordsByStatus } from '../utils/mastery.js';
import { Button3D, Confetti, PageHeader, Stars } from '../components/ui.jsx';
import WeeklyTest from '../components/WeeklyTest.jsx';
import VocabCard from '../components/VocabCard.jsx';
import { playSfx } from '../utils/sfx.js';
import { t } from '../i18n/vi.js';

function UnitPicker({ onStart }) {
  const units = listUnits().filter((u) => u.available);
  const [chosen, setChosen] = useState(() => new Set(units.slice(0, 1).map((u) => u.unitId)));

  const toggle = (id) => {
    playSfx('click');
    const next = new Set(chosen);
    next.has(id) ? next.delete(id) : next.add(id);
    setChosen(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-sky-soft/80 p-5 sm:p-6 border-2 border-sky/30 shadow-xs">
        <p className="text-lg sm:text-xl font-black text-ink">📋 {t.test.structure}</p>
        <p className="mt-1.5 text-base font-bold text-ink-soft">⏳ {t.common.noPressure}</p>
      </div>

      <div>
        <h2 className="text-2xl font-black text-ink">{t.test.chooseUnits}</h2>
        <p className="text-sm sm:text-base font-bold text-ink-soft mt-0.5">{t.test.chooseUnitsSub}</p>
      </div>

      <ul className="grid gap-3.5 sm:grid-cols-2">
        {units.map((u) => {
          const on = chosen.has(u.unitId);
          return (
            <li key={u.unitId}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(u.unitId)}
                className={`flex min-h-24 w-full items-center gap-4 rounded-3xl p-4 text-left transition-all cursor-pointer ${
                  on
                    ? 'bg-banana text-ink shadow-[0_6px_0_var(--color-banana-dark)] ring-3 ring-banana-soft border-2 border-banana-dark/30'
                    : 'bg-white text-ink shadow-[0_5px_0_#efe3cc] border-2 border-[#efe3cc] hover:bg-cream'
                }`}
              >
                <span className="text-4xl sm:text-5xl shrink-0" aria-hidden>
                  {u.emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-lg sm:text-xl font-black truncate">
                    Unit {u.unitId}: {u.titleEn}
                  </span>
                  <span className="block text-sm sm:text-base font-bold text-ink-soft truncate">{u.titleVi}</span>
                </span>
                <span className="text-3xl shrink-0" aria-hidden>
                  {on ? '✅' : '⬜'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Button3D
        tone="peach"
        disabled={chosen.size === 0}
        onClick={() => onStart([...chosen].sort((a, b) => a - b))}
        className="w-full py-5 text-xl"
      >
        {t.test.start}
      </Button3D>

      {chosen.size === 0 && (
        <p className="text-center text-lg font-black text-peach">{t.test.needUnit}</p>
      )}
    </div>
  );
}

function TestResult({ entry }) {
  const wrongIds = [...new Set(entry.answers.filter((a) => !a.correct).map((a) => a.wordId))];

  return (
    <div className="flex flex-col gap-6">
      <Confetti show={entry.stars >= 2} />

      <div className="animate-pop flex flex-col items-center gap-3 rounded-[2.5rem] bg-white p-8 sm:p-10 text-center shadow-md border-4 border-banana-soft">
        <p className="text-lg sm:text-xl font-black text-ink-soft">{t.test.score}</p>
        <p className="text-7xl sm:text-8xl font-black text-peach tracking-tight">{entry.score}</p>
        <Stars count={entry.stars} className="text-5xl my-1" />
        <p className="text-xl sm:text-2xl font-black text-ink">
          {t.test.correctCount(entry.correct, entry.total)}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-2xl font-black text-ink">{t.test.wrongWords}</h2>
        {wrongIds.length === 0 ? (
          <p className="rounded-3xl bg-mint-soft p-6 text-center text-xl font-black text-mint-dark border-2 border-mint">
            🌟 {t.test.allCorrect}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {wrongIds
              .map(getWord)
              .filter(Boolean)
              .map((w) => (
                <li key={w.id}>
                  <VocabCard word={w} status="review" />
                </li>
              ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {wrongIds.length > 0 && (
          <Button3D tone="sky" to="/review/flashcard" className="py-4">
            🔁 {t.test.reviewNow}
          </Button3D>
        )}
        <Button3D tone="mint" to="/journal" className="py-4">
          📒 {t.test.toJournal}
        </Button3D>
      </div>
    </div>
  );
}

export default function TestPage() {
  const navigate = useNavigate();
  const [state, setState] = useState({ step: 'pick' });

  const start = (unitIds) => {
    const questions = generateTest({
      vocab: vocabOf(unitIds),
      hardWordIds: wordsByStatus(store().getMastery(), 'review'),
      seed: Date.now(),
    });
    setState({ step: 'run', unitIds, questions });
  };

  const complete = (answers) => {
    const entry = store().saveTestResult({ unitIds: state.unitIds, answers });
    setState({ step: 'done', entry });
  };

  const leave = () => {
    if (state.step !== 'run' || window.confirm(t.test.leaveConfirm)) {
      if (state.step === 'run') setState({ step: 'pick' });
      else navigate('/');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={state.step === 'done' ? t.test.resultTitle : `📝 ${t.test.title}`}
        backTo={state.step === 'run' ? null : '/'}
        backLabel={t.nav.home}
        right={
          state.step === 'run' && (
            <button
              type="button"
              onClick={leave}
              className="min-h-12 rounded-2xl bg-white px-5 font-black text-peach border border-peach/30 shadow-xs hover:bg-rose-soft/40 cursor-pointer"
            >
              ✕ Dừng bài test
            </button>
          )
        }
      />
      {state.step === 'pick' && <UnitPicker onStart={start} />}
      {state.step === 'run' && <WeeklyTest questions={state.questions} onComplete={complete} />}
      {state.step === 'done' && <TestResult entry={state.entry} />}
    </div>
  );
}
