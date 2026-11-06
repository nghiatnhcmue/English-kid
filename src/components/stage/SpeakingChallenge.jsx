import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Square, Shuffle, Check, X } from 'lucide-react';
import ModelView from './ModelView.jsx';
import { SpeakerButton, SlowSpeakerButton, Stars } from '../ui.jsx';
import { surpriseChallenge, similarity, speakingLevel } from '../../utils/scene.js';
import { createRecorder, isRecordingSupported } from '../../utils/recorder.js';
import { isSttSupported, recognizeOnce } from '../../utils/speech.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import { t } from '../../i18n/vi.js';

const LEVEL_STARS = { great: 3, close: 2, retry: 1 };

/** "Bất ngờ": câu nói ngẫu nhiên với đồ vật trong bối cảnh → nghe mẫu → ghi âm → nghe lại → chấm nhẹ. */
export default function SpeakingChallenge({ scene, vocabById, onClose, onScore }) {
  const { settings } = useSettings();
  const [seed, setSeed] = useState(() => Date.now());
  const challenge = useMemo(() => surpriseChallenge(scene, vocabById, seed), [scene, vocabById, seed]);
  const recorder = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | recording | done
  const [audioUrl, setAudioUrl] = useState(null);
  const [heard, setHeard] = useState(null);
  const [level, setLevel] = useState(null);
  const [error, setError] = useState(null);
  const sttRun = useRef(0);

  useEffect(() => {
    recorder.current = createRecorder();
    return () => recorder.current?.release();
  }, []);

  const reset = () => {
    setStatus('idle');
    setAudioUrl(null);
    setHeard(null);
    setLevel(null);
    setError(null);
  };

  const another = () => {
    playSfx('click');
    reset();
    setSeed(Date.now());
  };

  const grade = (lvl) => {
    setLevel(lvl);
    playSfx(lvl === 'retry' ? 'wrong' : 'correct');
    onScore?.(LEVEL_STARS[lvl]);
  };

  const stop = async () => {
    const url = await recorder.current?.stop();
    setAudioUrl(url);
    setStatus('done');
  };

  const start = async () => {
    playSfx('click');
    reset();
    const res = await recorder.current.start();
    if (!res.ok) {
      setError(res.message);
      setStatus('done');
      return;
    }
    setStatus('recording');
    if (isSttSupported()) {
      const run = ++sttRun.current;
      recognizeOnce({ lang: settings.lang, timeoutMs: 9000 }).then(async (r) => {
        if (run !== sttRun.current) return;
        await stop();
        if (!r) return; // không nghe được → để em tự đánh giá
        const best = r.transcripts.reduce(
          (acc, tr) => {
            const s = similarity(tr, challenge.sentenceEn);
            return s > acc.s ? { s, tr } : acc;
          },
          { s: -1, tr: '' },
        );
        setHeard(best.tr);
        grade(speakingLevel(best.s));
      });
    }
  };

  const canRecord = isRecordingSupported();

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.speaking.title}
      onClick={onClose}
    >
      <div
        className="animate-pop flex max-h-[95dvh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">{t.speaking.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.stage.close}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cream hover:bg-banana-soft"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <div className="flex justify-center gap-4">
          {challenge.objects.map((o) => (
            <div key={o.id} className="flex flex-col items-center rounded-3xl bg-sky-soft p-2">
              <ModelView word={o} size="md" style={{ width: '7rem', height: '6rem' }} className="h-24 w-28" />
              <span className="font-black">{o.word}</span>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-banana-soft p-4 text-center">
          <p className="text-sm font-bold text-ink-soft">{t.speaking.sayThis}</p>
          <p className="mt-1 text-3xl leading-snug font-black">{challenge.sentenceEn}</p>
          <p className="mt-1 text-lg font-bold text-ink-soft">({challenge.sentenceVi})</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <SpeakerButton key={challenge.sentenceEn} text={challenge.sentenceEn} size="md" autoPlay label={t.speaking.listen} className="w-auto! px-5" />
            <SlowSpeakerButton text={challenge.sentenceEn} size="md" />
          </div>
        </div>

        {canRecord ? (
          <div className="flex flex-col items-center gap-2">
            {status === 'recording' ? (
              <button
                type="button"
                onClick={() => {
                  sttRun.current++;
                  stop();
                }}
                className="inline-flex min-h-20 items-center gap-3 rounded-full bg-peach px-8 text-xl font-black text-white shadow-[0_6px_0_var(--color-peach-dark)] animate-pulse-ring"
              >
                <Square className="h-7 w-7" aria-hidden /> {t.speaking.stop}
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                className="inline-flex min-h-20 items-center gap-3 rounded-full bg-mint px-8 text-xl font-black text-white shadow-[0_6px_0_var(--color-mint-dark)] active:translate-y-1 active:shadow-none"
              >
                <Mic className="h-7 w-7" aria-hidden /> {t.speaking.record}
              </button>
            )}
            {status === 'recording' && <p className="font-bold text-peach">🎙️ {t.speaking.recording}</p>}
          </div>
        ) : (
          <p className="rounded-2xl bg-sky-soft p-3 text-center font-bold">{t.speaking.noMic}</p>
        )}

        {error && <p className="rounded-2xl bg-peach-soft p-3 text-center font-bold">{error}</p>}

        {audioUrl && (
          <div className="flex flex-col items-center gap-1">
            <p className="font-black">{t.speaking.yourVoice}</p>
            <audio src={audioUrl} controls className="w-full max-w-sm" />
          </div>
        )}

        {heard && (
          <p className="text-center font-bold text-ink-soft">
            {t.speaking.heard} <span className="text-ink">“{heard}”</span>
          </p>
        )}

        {status === 'done' && !level && (
          <div className="flex flex-col items-center gap-2">
            <p className="font-black">{t.speaking.selfAssess}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                ['great', t.speaking.self.great],
                ['close', t.speaking.self.ok],
                ['retry', t.speaking.self.retry],
              ].map(([lvl, label]) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => grade(lvl)}
                  className="min-h-14 rounded-2xl bg-cream px-4 text-lg font-black hover:bg-banana-soft"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {level && (
          <div className="animate-pop flex flex-col items-center gap-1 rounded-3xl bg-mint-soft p-4 text-center">
            <Stars count={LEVEL_STARS[level]} className="text-3xl" />
            <p className="text-lg font-black">{t.speaking.levels[level]}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={another}
            className="inline-flex min-h-16 flex-1 items-center justify-center gap-2 rounded-3xl bg-sky text-lg font-black shadow-[0_5px_0_var(--color-sky-dark)] active:translate-y-1 active:shadow-none"
          >
            <Shuffle className="h-5 w-5" aria-hidden /> {t.speaking.another}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-16 flex-1 items-center justify-center gap-2 rounded-3xl bg-banana text-lg font-black shadow-[0_5px_0_var(--color-banana-dark)] active:translate-y-1 active:shadow-none"
          >
            <Check className="h-5 w-5" aria-hidden /> {t.speaking.done}
          </button>
        </div>
      </div>
    </div>
  );
}
