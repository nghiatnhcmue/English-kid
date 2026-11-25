import { playSfx } from '../../utils/sfx.js';
import { splitBlankSentence } from '../../utils/questionGrading.js';

export default function FillBlankField({
  sentence,
  value = '',
  options = [],
  locked = false,
  showResult = false,
  isCorrect = false,
  onChange,
  placeholder = 'Nhập từ cần điền vào đây...',
}) {
  const { before, after } = splitBlankSentence(sentence);

  return (
    <div className="flex flex-col gap-4">
      {sentence && (
        <div className="p-5 rounded-2xl bg-cream-soft border-2 border-banana-soft text-center text-lg sm:text-xl font-bold text-ink leading-relaxed flex flex-wrap items-center justify-center gap-2">
          <span>{before}</span>
          <span
            className={`inline-flex items-center justify-center min-w-[130px] px-4 py-1.5 rounded-xl font-black text-lg border-2 transition-all ${
              showResult
                ? isCorrect
                  ? 'bg-mint text-white border-mint-dark shadow-sm'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
                : value
                ? 'bg-white text-ink border-sky shadow-xs'
                : 'bg-white text-gray-400 border-dashed border-banana animate-pulse'
            }`}
          >
            {value || '_______'}
          </span>
          <span>{after}</span>
        </div>
      )}

      {options?.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase text-ink-soft">Chạm vào từ gợi ý để chọn:</span>
          <div className="flex flex-wrap gap-2.5 p-3 bg-cream-soft rounded-2xl border border-banana-soft">
            {options.map((opt, oIdx) => (
              <button
                key={oIdx}
                type="button"
                onClick={() => {
                  if (locked) return;
                  playSfx('click');
                  onChange?.(opt);
                }}
                disabled={locked}
                className={`rounded-2xl px-4 py-2 text-base font-black transition-all cursor-pointer ${
                  value === opt
                    ? 'bg-sky text-ink border-2 border-sky-dark shadow-xs scale-105'
                    : 'bg-white text-ink border-2 border-banana-soft hover:bg-banana-soft'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-xs font-black text-ink-soft whitespace-nowrap">
          {options?.length > 0 ? 'Hoặc tự gõ từ:' : 'Nhập câu trả lời:'}
        </span>
        <input
          type="text"
          disabled={locked}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-2xl bg-cream px-4 py-2.5 text-base font-black text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
        />
      </div>
    </div>
  );
}
