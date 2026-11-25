import { SpeakerButton } from '../ui.jsx';
import { speak } from '../../utils/speech.js';
import { useSettings } from '../../settings.jsx';

export default function TargetSentenceHeader({
  badge,
  badgeTone = 'peach',
  sentenceEn,
  quoted = true,
  phonetic,
  meaningVi,
  tipsVi,
  tipsLabel = 'Mẹo phát âm',
  audio,
  dialoguePrompt,
}) {
  const { settings } = useSettings();
  const badgeCls =
    badgeTone === 'banana'
      ? 'bg-banana text-ink'
      : 'bg-peach-soft text-peach-dark';

  return (
    <div className="flex flex-col gap-5">
      {dialoguePrompt && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream/90 p-3.5 sm:p-4 border border-banana-soft text-sm sm:text-base font-bold text-ink">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-banana px-3 py-1 font-black text-xs text-ink shrink-0">
              👤 {dialoguePrompt.speaker || 'Gợi ý'}:
            </span>
            <span className="italic text-ink-soft">&quot;{dialoguePrompt.prompt}&quot;</span>
          </div>
          <SpeakerButton text={dialoguePrompt.prompt} size="sm" />
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-2">
        {badge && (
          <span className={`rounded-full px-3.5 py-1 text-xs font-black uppercase ${badgeCls}`}>
            {badge}
          </span>
        )}
        <h3 className="text-3xl sm:text-4xl font-black text-ink leading-tight">
          {quoted ? `"${sentenceEn}"` : sentenceEn}
        </h3>
        {phonetic && (
          <p className="font-mono text-lg sm:text-xl font-bold text-sky-dark">{phonetic}</p>
        )}
        {meaningVi && (
          <p className="text-base sm:text-lg font-bold text-ink-soft">({meaningVi})</p>
        )}
      </div>

      {tipsVi && (
        <div className="rounded-2xl bg-mint-soft/50 p-4 text-sm sm:text-base font-bold text-ink border border-mint/30 flex items-start gap-2.5">
          <span className="text-xl shrink-0" aria-hidden>
            💡
          </span>
          <div>
            <strong className="text-mint-dark">{tipsLabel}:</strong> {tipsVi}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-cream p-2 border border-banana-soft shadow-xs">
          <SpeakerButton text={sentenceEn} audio={audio} size="md" />
          <span className="text-xs sm:text-sm font-black text-ink pr-2">Nghe bản xứ chuẩn</span>
        </div>
        <button
          type="button"
          onClick={() => speak(sentenceEn, { lang: settings.lang || 'en-GB', rate: 0.65, audio })}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-xs sm:text-sm font-black text-ink shadow-xs border border-banana-soft hover:bg-cream cursor-pointer transition-all touch-manipulation select-none"
        >
          <span>🐢 Nghe chậm từng từ</span>
        </button>
      </div>
    </div>
  );
}
