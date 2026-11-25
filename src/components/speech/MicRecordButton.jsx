import { Mic, Sparkles, AlertCircle } from 'lucide-react';

export default function MicRecordButton({
  status = 'idle',
  micError = null,
  tone = 'peach',
  idleLabel = 'Bấm vào Micro màu cam và đọc to câu trên',
  doneLabel = 'Bấm vào Micro để luyện đọc lại câu này',
  recordingLabel = 'Đang thu âm... Em đọc to rõ vào micro nhé!',
  subHint = '(Máy sẽ tự động lắng nghe và chấm điểm phát âm cho em)',
  onStart,
  onStop,
}) {
  const micColorCls =
    tone === 'banana'
      ? 'bg-banana text-ink shadow-[0_7px_0_#d8b13c]'
      : 'bg-peach text-white shadow-[0_7px_0_var(--color-peach-dark)]';

  return (
    <div className="flex flex-col items-center gap-3 py-4 border-t-2 border-dashed border-banana-soft">
      {status === 'evaluating' ? (
        <div className="flex flex-col items-center gap-3 py-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-banana-soft text-ink animate-pulse shadow-md border-2 border-banana">
            <Sparkles className="h-10 w-10 text-peach animate-spin" />
          </div>
          <div className="flex items-center gap-2 text-peach-dark font-black text-sm sm:text-base animate-pulse">
            <span className="h-3 w-3 rounded-full bg-peach animate-ping" />
            <span>Đang chấm điểm AI... Em chờ một chút nhé! 🤖✨</span>
          </div>
        </div>
      ) : status === 'recording' ? (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onStop}
            className="animate-pulse inline-flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_6px_0_#b91c1c] hover:bg-rose-600 cursor-pointer transition-all touch-manipulation select-none"
            title="Bấm để kết thúc và xem điểm"
          >
            <div className="h-8 w-8 rounded-lg bg-white" />
          </button>
          <div className="flex items-center gap-2 text-rose-600 font-black text-sm sm:text-base animate-pulse text-center">
            <span className="h-3 w-3 rounded-full bg-rose-600 shrink-0" />
            <span>{recordingLabel}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 text-center">
          <button
            type="button"
            onClick={onStart}
            className={`inline-flex h-24 w-24 items-center justify-center rounded-full transition-all cursor-pointer hover:-translate-y-1 active:translate-y-1 active:shadow-none touch-manipulation select-none ${micColorCls}`}
            title={status === 'done' ? 'Bấm vào micro để đọc lại' : 'Bấm vào micro để nói'}
          >
            <Mic className="h-11 w-11" />
          </button>
          <span className="text-base font-black text-ink">
            {status === 'done' ? doneLabel : idleLabel}
          </span>
          {subHint && <span className="text-xs font-bold text-ink-soft">{subHint}</span>}
        </div>
      )}

      {micError && (
        <div className="rounded-2xl bg-rose-50 p-3 text-xs sm:text-sm font-bold text-rose-700 border border-rose-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}
    </div>
  );
}
