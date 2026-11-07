import { SpeakerButton, SlowSpeakerButton, WordImage, ExtendedBadge } from './ui.jsx';

const BADGE = {
  review: { text: '🔴 Cần ôn lại', cls: 'bg-rose-soft text-peach-dark' },
  mastered: { text: '🟢 Đã ghi nhớ', cls: 'bg-mint-soft text-mint-dark' },
};

/** Thẻ từ vựng to rõ, trực quan, có cả nút đọc chuẩn, đọc chậm và nút xem mô hình 3D xoay 360 độ */
export default function VocabCard({ word, status, compact = false, onInspect }) {
  const badge = BADGE[status];

  return (
    <article className="print-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-3xl bg-white p-4 sm:p-5 shadow-[0_4px_0_#efe3cc] border border-[#f0e7d5] transition-all hover:shadow-[0_6px_0_#efe3cc]">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {(word.image || word.emoji || word.model3d) && (
          <button
            type="button"
            onClick={() => onInspect?.(word)}
            className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-cream cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
              word.model3d ? 'ring-3 ring-banana ring-offset-2' : ''
            }`}
            title={word.model3d ? 'Bấm để xoay mô hình 3D 360°' : 'Xem chi tiết từ vựng'}
          >
            <WordImage word={word} size={compact ? 'sm' : 'md'} className="shrink-0" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <h3 className="text-xl sm:text-2xl font-black text-ink">{word.word}</h3>
            <span className="text-base font-bold text-sky-dark">{word.phonetic}</span>
          </div>

          <p className="text-lg sm:text-xl font-bold text-ink mt-0.5">{word.meaning}</p>

          {/* Câu ví dụ kèm nút nghe phát âm câu ví dụ */}
          {word.exampleEn && (
            <div className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl bg-cream/70 p-2.5 sm:px-3 sm:py-2 border border-banana-soft/60">
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-extrabold text-ink leading-snug">
                  "{word.exampleEn}"
                </p>
                {word.exampleVi && (
                  <p className="text-xs font-bold text-ink-soft mt-0.5">
                    ({word.exampleVi})
                  </p>
                )}
              </div>
              <SpeakerButton
                text={word.exampleEn}
                audio={word.audioExample}
                size="sm"
                title="Nghe phát âm câu ví dụ"
                className="shrink-0"
              />
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="rounded-full bg-banana-soft px-3 py-0.5 text-ink-soft">
              {word.wordType}
            </span>
            <ExtendedBadge word={word} />
            {word.model3d && (
              <button
                type="button"
                onClick={() => onInspect?.(word)}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-banana to-banana-dark px-3 py-0.5 text-xs font-black text-ink shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Bấm để xoay mô hình 3D 360°"
              >
                <span aria-hidden>🧊</span>
                <span>Mô hình 3D</span>
              </button>
            )}
            {badge && (
              <span className={`rounded-full px-3 py-0.5 ${badge.cls}`}>
                {badge.text}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="no-print flex items-center gap-2 self-end sm:self-center shrink-0">
        {word.model3d && (
          <button
            type="button"
            onClick={() => onInspect?.(word)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl bg-cream px-3 py-2 text-xs font-black text-ink shadow-[0_2px_0_#efe3cc] hover:bg-banana hover:text-ink cursor-pointer border border-[#efe3cc] transition-all"
            title="Mở xem 3D xoay 360°"
          >
            <span>🧊 Xoay 3D</span>
          </button>
        )}
        <SlowSpeakerButton word={word} size={compact ? 'sm' : 'md'} />
        <SpeakerButton word={word} size={compact ? 'sm' : 'md'} slowToo />
      </div>
    </article>
  );
}
