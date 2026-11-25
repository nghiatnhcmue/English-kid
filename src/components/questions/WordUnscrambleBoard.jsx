import { RotateCcw } from 'lucide-react';

export default function WordUnscrambleBoard({
  availableWords = [],
  assembledWords = [],
  locked = false,
  showResult = false,
  isCorrect = false,
  onAddWord,
  onRemoveWord,
  onReset,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={`min-h-24 rounded-3xl p-4 sm:p-5 border-3 transition-all flex flex-wrap items-center gap-2.5 ${
          showResult
            ? isCorrect
              ? 'bg-mint-soft border-mint shadow-md'
              : 'bg-rose-50 border-rose-300'
            : assembledWords.length > 0
            ? 'bg-cream-soft border-banana'
            : 'bg-gray-50 border-dashed border-gray-300'
        }`}
      >
        {assembledWords.length === 0 ? (
          <span className="text-sm sm:text-base font-bold text-gray-400 italic">
            Chạm vào các khối từ bên dưới để đưa lên đây...
          </span>
        ) : (
          assembledWords.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRemoveWord?.(item)}
              disabled={locked}
              className="rounded-2xl bg-white px-4 py-2 text-base sm:text-lg font-black text-ink shadow-[0_3px_0_#efe3cc] border border-[#efe3cc] hover:bg-rose-100 hover:text-rose-700 active:translate-y-0.5 transition-all cursor-pointer select-none"
              title="Bấm để gỡ từ này"
            >
              {item.word}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-ink-soft">Kho từ để chọn:</span>
          {!locked && assembledWords.length > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-black text-peach-dark hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Đặt lại từ đầu</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2.5 p-3.5 rounded-2xl bg-cream/60 border border-banana-soft min-h-16">
          {availableWords.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onAddWord?.(item)}
              disabled={locked}
              className="rounded-2xl bg-banana px-4 py-2 text-base sm:text-lg font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer select-none"
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
