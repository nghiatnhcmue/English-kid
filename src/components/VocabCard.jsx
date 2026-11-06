import { SpeakerButton, SlowSpeakerButton, WordImage } from './ui.jsx';

const BADGE = {
  review: { text: '🔴 Cần ôn lại', cls: 'bg-rose-soft text-peach-dark' },
  mastered: { text: '🟢 Đã ghi nhớ', cls: 'bg-mint-soft text-mint-dark' },
};

/** Thẻ từ vựng to rõ, trực quan, có cả nút đọc chuẩn và đọc chậm hình chú rùa */
export default function VocabCard({ word, status, compact = false }) {
  const badge = BADGE[status];

  return (
    <article className="print-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-3xl bg-white p-4 sm:p-5 shadow-[0_4px_0_#efe3cc] border border-[#f0e7d5] transition-all hover:shadow-[0_6px_0_#efe3cc]">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-cream">
          <WordImage word={word} size={compact ? 'sm' : 'md'} className="shrink-0" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <h3 className="text-xl sm:text-2xl font-black text-ink">{word.word}</h3>
            <span className="text-base font-bold text-sky-dark">{word.phonetic}</span>
          </div>

          <p className="text-lg sm:text-xl font-bold text-ink mt-0.5">{word.meaning}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="rounded-full bg-banana-soft px-3 py-0.5 text-ink-soft">
              {word.wordType}
            </span>
            {badge && (
              <span className={`rounded-full px-3 py-0.5 ${badge.cls}`}>
                {badge.text}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="no-print flex items-center gap-2 self-end sm:self-center shrink-0">
        <SlowSpeakerButton word={word} size={compact ? 'sm' : 'md'} />
        <SpeakerButton word={word} size={compact ? 'sm' : 'md'} slowToo />
      </div>
    </article>
  );
}
