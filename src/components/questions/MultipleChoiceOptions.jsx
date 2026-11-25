import { playSfx } from '../../utils/sfx.js';

export default function MultipleChoiceOptions({
  options = [],
  selectedIndex = null,
  answerIndex = 0,
  locked = false,
  showResult = false,
  onSelect,
}) {
  return (
    <div className="grid gap-3">
      {options.map((opt, oIdx) => {
        let style = 'bg-white text-ink border-2 border-[#efe3cc] hover:bg-cream';
        if (showResult) {
          if (oIdx === answerIndex) {
            style = 'bg-mint text-white border-2 border-mint-dark font-black';
          } else if (oIdx === selectedIndex) {
            style = 'bg-rose-100 text-rose-800 border-2 border-rose-300';
          } else {
            style = 'bg-gray-50 text-gray-400 border-2 border-gray-200';
          }
        } else if (selectedIndex === oIdx) {
          style = 'bg-sky-soft text-ink border-2 border-sky font-black scale-[1.01]';
        }

        return (
          <button
            key={oIdx}
            type="button"
            onClick={() => {
              if (locked) return;
              playSfx('click');
              onSelect?.(oIdx);
            }}
            disabled={locked}
            className={`min-h-14 rounded-2xl px-5 py-3 text-left text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center gap-3 ${style}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 text-ink font-black text-sm">
              {String.fromCharCode(65 + oIdx)}
            </span>
            <span className="flex-1">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
