import { Compass, Target, Dices, BadgeCheck, RotateCcw } from 'lucide-react';
import { playSfx } from '../../utils/sfx.js';
import { t } from '../../i18n/vi.js';

function DockButton({ icon: Icon, label, onClick, active, disabled, tone = 'bg-white' }) {
  return (
    <button
      type="button"
      onClick={() => {
        playSfx('click');
        onClick();
      }}
      disabled={disabled}
      aria-pressed={active}
      className={`flex min-h-16 min-w-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-sm font-black transition-all active:translate-y-0.5 disabled:opacity-40 sm:flex-row sm:gap-2 sm:text-base ${
        active ? 'bg-banana shadow-[0_4px_0_var(--color-banana-dark)]' : `${tone} shadow-[0_4px_0_#e9dcc4]`
      }`}
    >
      <Icon className="h-6 w-6 shrink-0" aria-hidden />
      <span>{label}</span>
    </button>
  );
}

/** Thanh công cụ của Sân khấu 3D. */
export default function ToolDock({ mode, canEvaluate, hasResult, onExplore, onChallenge, onSurprise, onEvaluate, onReset }) {
  return (
    <div
      className="sticky bottom-20 z-20 flex gap-2 rounded-3xl border-2 border-banana-soft bg-cream/95 p-2 shadow-lg backdrop-blur md:bottom-4"
      role="toolbar"
      aria-label="Công cụ sân khấu"
    >
      <DockButton icon={Compass} label={t.stage.explore} active={mode === 'explore'} onClick={onExplore} />
      <DockButton icon={Target} label={t.stage.challenge} active={mode === 'challenge'} onClick={onChallenge} />
      <DockButton icon={Dices} label={t.stage.surprise} onClick={onSurprise} tone="bg-sky-soft" />
      {mode === 'challenge' &&
        (hasResult ? (
          <DockButton icon={RotateCcw} label={t.stage.reset} onClick={onReset} />
        ) : (
          <DockButton icon={BadgeCheck} label={t.stage.evaluate} onClick={onEvaluate} disabled={!canEvaluate} tone="bg-mint-soft" />
        ))}
    </div>
  );
}
