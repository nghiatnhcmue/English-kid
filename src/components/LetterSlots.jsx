/**
 * Ô chữ có chỗ trống + bong bóng chữ cái để chọn. Dùng chung cho chế độ "Điền chữ" và bài test.
 * gap: [{ char, hidden }], filled: { [indexTrongGap]: { letter, bankIdx } }
 */
export function GapWord({ gap, filled, onSlotTap, status }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 my-2" aria-live="polite">
      {gap.map((c, i) => {
        if (c.char === ' ') return <span key={i} className="w-5" aria-hidden />;
        if (!c.hidden) {
          return (
            <span
              key={i}
              className="flex h-16 w-12 sm:w-14 items-center justify-center text-3xl sm:text-4xl font-black text-ink select-none"
            >
              {c.char}
            </span>
          );
        }
        const f = filled[i];
        const tone =
          status === 'correct'
            ? 'border-mint bg-mint-soft text-mint-dark ring-4 ring-mint'
            : status === 'wrong' && f
              ? 'border-peach bg-peach-soft text-peach-dark animate-shake'
              : f
                ? 'border-banana bg-banana-soft text-ink shadow-sm'
                : 'border-banana-dark/40 bg-white text-ink';

        return (
          <button
            key={i}
            type="button"
            onClick={() => f && onSlotTap?.(i)}
            aria-label={f ? `Bỏ chữ ${f.letter}` : 'Ô trống, bấm chữ bên dưới để điền'}
            title={f ? `Bấm để bỏ chữ ${f.letter}` : 'Ô trống'}
            className={`flex h-16 w-12 sm:w-14 items-center justify-center rounded-2xl border-4 border-dashed text-3xl sm:text-4xl font-black cursor-pointer transition-all hover:scale-105 active:scale-95 ${tone}`}
          >
            {f?.letter ?? ''}
          </button>
        );
      })}
    </div>
  );
}

export function LetterBank({ letters, used, onPick, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-3.5 my-2">
      {letters.map((l, i) => {
        const isUsed = used.has(i);
        return (
          <button
            key={i}
            type="button"
            disabled={disabled || isUsed}
            onClick={() => onPick(i)}
            aria-label={`Chọn chữ ${l}`}
            className={`flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full text-3xl sm:text-4xl font-black cursor-pointer transition-all select-none ${
              isUsed
                ? 'bg-ink-soft/10 text-ink-soft/30 opacity-40 shadow-none cursor-not-allowed scale-90'
                : 'bg-sky text-ink shadow-[0_6px_0_var(--color-sky-dark)] hover:-translate-y-1 hover:shadow-[0_8px_0_var(--color-sky-dark)] active:translate-y-1 active:shadow-none'
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

/** Các vị trí bị ẩn theo thứ tự. */
export const hiddenPositions = (gap) => gap.map((c, i) => (c.hidden ? i : -1)).filter((i) => i >= 0);
