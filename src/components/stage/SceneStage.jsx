import ModelView from './ModelView.jsx';
import { playSfx } from '../../utils/sfx.js';
import { sayWord } from '../../utils/speech.js';
import { useSettings } from '../../settings.jsx';

/**
 * Phông cảnh + các đồ vật. mode 'explore': chạm để xem kỹ; 'challenge': chạm để bỏ vào / lấy ra khỏi giỏ.
 * result: kết quả chấm (để tô màu đúng / thiếu / thừa sau khi chấm).
 */
export default function SceneStage({ scene, objects, mode, basket, result, onInspect, onToggle }) {
  const { settings } = useSettings();

  const tap = (w) => {
    playSfx('click');
    sayWord(w, settings);
    if (mode === 'challenge') onToggle(w.id);
    else onInspect(w);
  };

  const stateOf = (id) => {
    if (!result) return basket.has(id) ? 'picked' : 'idle';
    if (result.correct.includes(id) || result.okExtra.includes(id)) return 'good';
    if (result.missing.includes(id)) return 'missing';
    if (result.extra.includes(id)) return 'extra';
    return 'idle';
  };

  const TONE = {
    idle: 'bg-white/85 shadow-[0_6px_0_rgb(0_0_0/0.08)]',
    picked: 'bg-banana shadow-[0_6px_0_var(--color-banana-dark)] ring-4 ring-white',
    good: 'bg-mint-soft ring-4 ring-mint',
    missing: 'bg-white outline-4 outline-dashed outline-sky-dark',
    extra: 'bg-peach-soft ring-4 ring-peach/50',
  };
  const BADGE = { picked: '🧺', good: '✅', missing: '🧐', extra: '🤔' };

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-md"
      style={{ background: `linear-gradient(180deg, ${scene.bg} 0%, ${scene.bg} 62%, ${scene.floor ?? scene.bg} 62%, ${scene.floor ?? scene.bg} 100%)` }}
      aria-label={`${scene.titleEn} – ${scene.titleVi}`}
    >
      <div className="pointer-events-none absolute top-3 right-4 text-5xl opacity-60 sm:text-6xl" aria-hidden>
        {scene.emoji}
      </div>
      <ul className="relative grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-4">
        {objects.map((w) => {
          const state = stateOf(w.id);
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => tap(w)}
                aria-pressed={mode === 'challenge' ? basket.has(w.id) : undefined}
                aria-label={`${w.word}${mode === 'challenge' && basket.has(w.id) ? ' (đã bỏ vào giỏ)' : ''}`}
                className={`group relative flex w-full flex-col items-center gap-1 rounded-3xl p-2 pb-3 transition-all hover:-translate-y-1 active:translate-y-1 ${TONE[state]}`}
              >
                {BADGE[state] && (
                  <span className="absolute top-2 right-2 z-10 text-2xl drop-shadow" aria-hidden>
                    {BADGE[state]}
                  </span>
                )}
                <ModelView word={w} size="md" className="h-28 w-full sm:h-32" style={{ width: '100%', height: '8rem' }} />
                <span className="text-lg leading-tight font-black">{w.word}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
