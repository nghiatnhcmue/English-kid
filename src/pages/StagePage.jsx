import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUnit, getWord } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { evaluateContext, listEn } from '../utils/scene.js';
import { speak } from '../utils/speech.js';
import { playSfx } from '../utils/sfx.js';
import { useSettings } from '../settings.jsx';
import { Button3D, Confetti, InstructionBanner, PageHeader, Stars, WordImage } from '../components/ui.jsx';
import UnitSwitcher from '../components/UnitSwitcher.jsx';
import SceneStage from '../components/stage/SceneStage.jsx';
import ObjectInspector from '../components/stage/ObjectInspector.jsx';
import SpeakingChallenge from '../components/stage/SpeakingChallenge.jsx';
import ToolDock from '../components/stage/ToolDock.jsx';
import { t } from '../i18n/vi.js';

function WordChip({ id, tone }) {
  const w = getWord(id);
  if (!w) return null;
  return (
    <li className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 font-black ${tone}`}>
      <WordImage word={w} size="sm" className="h-8! w-8! text-2xl!" />
      {w.word} <span className="font-bold opacity-75">– {w.meaning}</span>
    </li>
  );
}

function EvaluationPanel({ result, onRetry, onNext }) {
  return (
    <section className="animate-pop flex flex-col gap-3 rounded-3xl border-4 border-white bg-white p-5 shadow-md" aria-live="polite">
      <Confetti show={result.stars >= 2} power={result.stars === 3 ? 1 : 0.5} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-black">{t.stage.messages[result.messageKey]}</p>
        <Stars count={result.stars} className="text-3xl" />
      </div>
      {result.correct.length + result.okExtra.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-black text-mint-dark">{t.stage.goodLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {[...result.correct, ...result.okExtra].map((id) => (
              <WordChip key={id} id={id} tone="bg-mint-soft" />
            ))}
          </ul>
        </div>
      )}
      {result.missing.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-black text-sky-dark">{t.stage.missingLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {result.missing.map((id) => (
              <WordChip key={id} id={id} tone="bg-sky-soft" />
            ))}
          </ul>
        </div>
      )}
      {result.extra.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-black text-peach-dark">{t.stage.extraLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {result.extra.map((id) => (
              <WordChip key={id} id={id} tone="bg-peach-soft" />
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button3D tone="white" onClick={onRetry} className="flex-1">
          🔁 {t.stage.tryAgain}
        </Button3D>
        <Button3D tone="mint" onClick={onNext} className="flex-1">
          {t.stage.nextChallenge} →
        </Button3D>
      </div>
    </section>
  );
}

export default function StagePage() {
  const { unitId, sceneId } = useParams();
  const { settings } = useSettings();
  const unit = getUnit(unitId);
  const scene = unit?.scenes?.find((s) => s.id === sceneId) ?? unit?.scenes?.[0];
  const objects = useMemo(() => (scene?.objects ?? []).map(getWord).filter(Boolean), [scene]);

  const [mode, setMode] = useState('explore');
  const [challengeId, setChallengeId] = useState(null);
  const [basket, setBasket] = useState(() => new Set());
  const [result, setResult] = useState(null);
  const [inspecting, setInspecting] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [hint, setHint] = useState(null);
  const [, refresh] = useState(0);

  const vocabById = useCallback((id) => getWord(id), []);

  if (!unit || !scene) {
    return (
      <div className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-2xl font-black">{t.unit.notFound}</p>
        <Button3D to={unit ? `/unit/${unit.unitId}` : '/'}>{t.common.back}</Button3D>
      </div>
    );
  }

  const stageStars = store().getProgress().units[unit.unitId]?.stage ?? {};
  const challenge = scene.challenges.find((c) => c.id === challengeId);

  const clearRound = () => {
    setBasket(new Set());
    setResult(null);
    setHint(null);
  };

  const chooseChallenge = (id) => {
    playSfx('click');
    clearRound();
    setChallengeId(id);
    const c = scene.challenges.find((x) => x.id === id);
    if (c) speak(c.promptEn, settings);
  };

  const toggle = (id) => {
    if (result || !challenge) return;
    setHint(null);
    const next = new Set(basket);
    next.has(id) ? next.delete(id) : next.add(id);
    setBasket(next);
  };

  const evaluate = () => {
    if (!challenge) return;
    if (basket.size === 0) {
      setHint(t.stage.needPick);
      return;
    }
    const r = evaluateContext([...basket], challenge);
    setResult(r);
    playSfx(r.stars === 3 ? 'victory' : r.stars === 2 ? 'correct' : 'wrong');
    store().saveStageResult(unit.unitId, scene.id, challenge.id, r.stars);
    refresh((n) => n + 1);
    const answer = listEn(challenge.required.map((id) => getWord(id)?.word).filter(Boolean));
    setTimeout(() => speak(`${r.stars === 3 ? 'Well done! ' : ''}Here they are: ${answer}.`, settings), 600);
  };

  const nextChallenge = () => {
    const idx = scene.challenges.findIndex((c) => c.id === challengeId);
    chooseChallenge(scene.challenges[(idx + 1) % scene.challenges.length].id);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`🎪 ${t.stage.title}`}
        subtitle={`Unit ${unit.unitId}: ${unit.titleEn} · ${scene.titleVi}`}
        backTo={`/unit/${unit.unitId}`}
        backLabel={`Unit ${unit.unitId}`}
      />
      <UnitSwitcher className="flex w-full xl:hidden" />

      {unit.scenes.length > 1 && (
        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label={t.stage.scenes}>
          {unit.scenes.map((s) => (
            <Link
              key={s.id}
              to={`/unit/${unit.unitId}/stage/${s.id}`}
              onClick={() => playSfx('click')}
              aria-current={s.id === scene.id ? 'page' : undefined}
              className={`inline-flex min-h-14 shrink-0 items-center gap-2 rounded-2xl px-4 font-black transition-all ${
                s.id === scene.id ? 'bg-sky shadow-[0_4px_0_var(--color-sky-dark)]' : 'bg-white text-ink-soft hover:bg-cream'
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {s.emoji}
              </span>
              {s.titleVi}
            </Link>
          ))}
        </nav>
      )}

      {mode === 'explore' ? (
        <InstructionBanner text={t.stage.exploreHint} icon="👆" />
      ) : (
        <section className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-xs">
          <h2 className="font-black">🎯 {t.stage.chooseChallenge}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {scene.challenges.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => chooseChallenge(c.id)}
                aria-pressed={c.id === challengeId}
                className={`flex min-h-16 items-center gap-3 rounded-2xl px-4 py-2 text-left font-bold transition-all ${
                  c.id === challengeId ? 'bg-banana shadow-[0_4px_0_var(--color-banana-dark)]' : 'bg-cream hover:bg-banana-soft'
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="flex-1 leading-snug">{c.promptVi}</span>
                <Stars count={stageStars[`${scene.id}:${c.id}`] ?? 0} className="text-sm" />
              </button>
            ))}
          </div>
          {challenge && !result && (
            <p className="rounded-2xl bg-sky-soft px-4 py-2 font-bold">
              🧺 {t.stage.basket}: {basket.size ? [...basket].map((id) => getWord(id)?.word).join(', ') : t.stage.basketEmpty}
              <span className="block text-sm text-ink-soft">{t.stage.pickHint}</span>
            </p>
          )}
          {hint && <p className="font-black text-peach">{hint}</p>}
        </section>
      )}

      <SceneStage
        scene={scene}
        objects={objects}
        mode={mode === 'challenge' && challenge ? 'challenge' : 'explore'}
        basket={basket}
        result={result}
        onInspect={setInspecting}
        onToggle={toggle}
      />

      {result && <EvaluationPanel result={result} onRetry={clearRound} onNext={nextChallenge} />}

      <ToolDock
        mode={mode}
        canEvaluate={!!challenge && basket.size > 0}
        hasResult={!!result}
        onExplore={() => {
          setMode('explore');
          clearRound();
          setChallengeId(null);
        }}
        onChallenge={() => {
          setMode('challenge');
          if (!challengeId) chooseChallenge(scene.challenges[0].id);
        }}
        onSurprise={() => setSpeaking(true)}
        onEvaluate={evaluate}
        onReset={clearRound}
      />

      {inspecting && <ObjectInspector word={inspecting} onClose={() => setInspecting(null)} />}
      {speaking && (
        <SpeakingChallenge
          scene={scene}
          vocabById={vocabById}
          onClose={() => setSpeaking(false)}
          onScore={(stars) => {
            store().saveStageResult(unit.unitId, scene.id, 'speaking', stars);
            refresh((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
