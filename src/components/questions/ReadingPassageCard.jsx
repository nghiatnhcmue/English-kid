import { useState } from 'react';
import { SpeakerButton } from '../ui.jsx';

export default function ReadingPassageCard({
  title,
  passage,
  translation,
  sticky = false,
  className = '',
}) {
  const [showTranslation, setShowTranslation] = useState(false);

  if (!passage) return null;

  return (
    <section
      className={`rounded-[2.5rem] bg-white p-6 sm:p-7 shadow-[0_6px_0_#efe3cc] border-2 border-banana-soft flex flex-col gap-4 ${
        sticky ? 'lg:sticky lg:top-4 z-10' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            📖
          </span>
          <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-black text-sky-dark uppercase tracking-wider">
            Đoạn văn đọc hiểu
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <SpeakerButton text={passage} size="sm" />
          {translation && (
            <button
              type="button"
              onClick={() => setShowTranslation((v) => !v)}
              className={`rounded-xl px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer border ${
                showTranslation
                  ? 'bg-peach text-white border-peach-dark'
                  : 'bg-cream text-ink-soft hover:bg-banana-soft border-banana-soft'
              }`}
              title="Bấm để xem/ẩn bản dịch nghĩa tiếng Việt"
            >
              {showTranslation ? 'Ẩn dịch' : 'Dịch nghĩa'}
            </button>
          )}
        </div>
      </div>

      {title && (
        <h3 className="text-base sm:text-lg font-black text-ink text-center">&quot;{title}&quot;</h3>
      )}

      <div className="p-5 rounded-2xl bg-cream-soft border border-banana-soft text-base sm:text-lg font-bold text-ink leading-relaxed max-h-[45vh] lg:max-h-[60vh] overflow-y-auto">
        &quot;{passage}&quot;
      </div>

      {showTranslation && translation && (
        <div className="p-4 rounded-xl bg-banana-soft/60 border border-banana-soft text-xs sm:text-sm font-bold text-ink-soft leading-relaxed animate-fade-in">
          <span className="font-black text-peach-dark block mb-1">🇻🇳 Bản dịch nghĩa tham khảo:</span>
          {translation}
        </div>
      )}

      <div className="text-[11px] font-bold text-ink-soft text-center opacity-80">
        💡 Em có thể bấm loa 🔊 để nghe máy đọc mẫu hoặc đối chiếu đoạn văn khi làm bài.
      </div>
    </section>
  );
}
