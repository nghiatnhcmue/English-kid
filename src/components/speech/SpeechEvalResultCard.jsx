import { Mic, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { Stars } from '../ui.jsx';
import { playRecording } from '../../utils/speech.js';

export default function SpeechEvalResultCard({
  status,
  scorePercent,
  stars = 0,
  feedback,
  wordAnalysis,
  recognizedText,
  audioUrl,
  onRetry,
  nextAction = null,
}) {
  if (status !== 'done') return null;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-cream via-white to-peach-soft/30 p-5 sm:p-6 border-2 border-banana flex flex-col gap-4 text-center animate-fade-in shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-banana-soft pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-peach" />
          <h5 className="text-lg sm:text-xl font-black text-ink">Kết quả AI đánh giá</h5>
        </div>
        {scorePercent !== null && scorePercent !== undefined && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-banana px-3 py-1 font-mono text-sm sm:text-base font-black text-ink shadow-xs">
              {scorePercent}% Chính xác
            </span>
            <Stars count={stars} className="text-xl" />
          </div>
        )}
      </div>

      {feedback && <p className="text-base font-black text-peach-dark">{feedback}</p>}

      {wordAnalysis && wordAnalysis.length > 0 && (
        <div className="flex flex-col items-center gap-2 bg-white/80 p-3.5 rounded-2xl border border-banana-soft">
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {wordAnalysis.map((item, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-sm sm:text-base font-black ${
                  item.matched
                    ? 'bg-mint-soft text-mint-dark ring-2 ring-mint border border-mint/40'
                    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-300'
                }`}
              >
                <span>{item.word}</span>
                {item.matched && <CheckCircle2 className="h-3.5 w-3.5 text-mint-dark" />}
              </span>
            ))}
          </div>
          {recognizedText && (
            <p className="text-xs font-bold text-ink-soft mt-1">
              Máy nghe được: &quot;{recognizedText}&quot;
            </p>
          )}
        </div>
      )}

      {!wordAnalysis && recognizedText && (
        <p className="text-sm font-bold text-ink-soft">
          Máy nghe được: <strong className="text-ink">&quot;{recognizedText}&quot;</strong>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {audioUrl && (
          <button
            type="button"
            onClick={() => playRecording(audioUrl)}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-peach px-5 text-sm sm:text-base font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>▶️ Nghe lại giọng em</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-sky-dark px-5 text-sm sm:text-base font-black text-white shadow-[0_4px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
        >
          <Mic className="h-4 w-4" />
          <span>Luyện đọc lại</span>
        </button>

        {nextAction}
      </div>
    </div>
  );
}
