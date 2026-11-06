import { useEffect, useRef, useState } from 'react';
import { X, Rotate3d, Smartphone, RotateCcw } from 'lucide-react';
import ModelView, { applyModelColor } from './ModelView.jsx';
import { SpeakerButton, SlowSpeakerButton } from '../ui.jsx';
import { speak } from '../../utils/speech.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import { t } from '../../i18n/vi.js';

export const PALETTE = [
  { hex: '#EF4444', en: 'red', vi: 'đỏ' },
  { hex: '#3B82F6', en: 'blue', vi: 'xanh dương' },
  { hex: '#22C55E', en: 'green', vi: 'xanh lá' },
  { hex: '#FACC15', en: 'yellow', vi: 'vàng' },
  { hex: '#EC4899', en: 'pink', vi: 'hồng' },
  { hex: '#8B5CF6', en: 'purple', vi: 'tím' },
];

/** Cửa sổ xem kỹ một đồ vật: 3D xoay được, hotspot, đổi màu, AR, thẻ từ. */
export default function ObjectInspector({ word, onClose }) {
  const { settings } = useSettings();
  const mvRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [color, setColor] = useState(null);
  const [canAR, setCanAR] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onLoad = () => {
    setLoaded(true);
    setCanAR(!!mvRef.current?.canActivateAR);
  };

  const pickColor = (c) => {
    playSfx('click');
    if (applyModelColor(mvRef.current, c?.hex ?? null)) setColor(c?.hex ?? null);
    if (c) speak(`${c.en}!`, settings);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${word.word} – ${word.meaning}`}
      onClick={onClose}
    >
      <div
        className="animate-pop flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-banana-soft px-5 py-3">
          <span className="flex items-center gap-2 font-black text-ink-soft">
            <Rotate3d className="h-5 w-5" aria-hidden /> {t.stage.model3d}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center gap-1.5 rounded-2xl bg-cream px-4 font-black text-ink hover:bg-banana-soft"
          >
            <X className="h-5 w-5" aria-hidden /> {t.stage.close}
          </button>
        </div>

        <div className="relative h-72 bg-gradient-to-b from-sky-soft to-cream sm:h-80">
          <ModelView
            ref={mvRef}
            word={word}
            interactive
            autoRotate
            ar
            size="xl"
            className="h-full w-full"
            style={{ width: '100%', height: '100%' }}
            onLoad={onLoad}
          >
            {(word.hotspots ?? []).map((h, i) => (
              <button
                key={i}
                slot={`hotspot-${i}`}
                data-position={h.position}
                data-normal={h.normal ?? '0 1 0'}
                onClick={() => speak(h.labelEn, settings)}
                className="rounded-full bg-white/95 px-3 py-1 text-sm font-black text-ink shadow-md"
              >
                {h.labelEn} · {h.labelVi}
              </button>
            ))}
            {canAR && (
              <button
                slot="ar-button"
                className="absolute right-3 bottom-3 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-mint px-4 font-black text-white shadow-[0_4px_0_var(--color-mint-dark)]"
              >
                <Smartphone className="h-5 w-5" aria-hidden /> {t.stage.ar}
              </button>
            )}
          </ModelView>
          {word.model3d ? (
            <p className="pointer-events-none absolute bottom-2 left-3 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-ink-soft">
              {t.stage.rotateHint}
            </p>
          ) : (
            <p className="absolute bottom-2 left-3 right-3 text-center text-sm font-bold text-ink-soft">{t.stage.noModel}</p>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-4xl font-black">{word.word}</h2>
              <p className="text-lg font-bold text-sky-dark">{word.phonetic}</p>
              <p className="mt-1 text-2xl font-black">{word.meaning}</p>
              <p className="text-sm font-bold text-ink-soft">
                {word.wordType} · 💡 {word.hint}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SpeakerButton key={word.id} word={word} autoPlay />
              <SlowSpeakerButton word={word} />
            </div>
          </div>

          <div className="rounded-2xl bg-cream p-4">
            <div className="flex items-center gap-3">
              <p className="flex-1 text-lg font-extrabold">{word.exampleEn}</p>
              <SpeakerButton text={word.exampleEn} audio={word.audioExample} size="sm" />
            </div>
            <p className="text-ink-soft">{word.exampleVi}</p>
          </div>

          {word.model3d && (
            <div>
              <h3 className="mb-2 font-black">🎨 {t.stage.colors}</h3>
              <div className="flex flex-wrap items-center gap-3">
                {PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    disabled={!loaded}
                    onClick={() => pickColor(c)}
                    aria-label={`${c.en} – ${c.vi}`}
                    aria-pressed={color === c.hex}
                    title={`${c.en} – ${c.vi}`}
                    className={`flex h-16 w-16 flex-col items-center justify-end rounded-2xl pb-1 text-xs font-black text-white shadow-[0_4px_0_rgb(0_0_0/0.15)] transition-transform active:translate-y-1 disabled:opacity-40 ${
                      color === c.hex ? 'ring-4 ring-ink/70 ring-offset-2' : ''
                    }`}
                    style={{ background: c.hex }}
                  >
                    <span className="drop-shadow">{c.en}</span>
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!loaded}
                  onClick={() => pickColor(null)}
                  className="inline-flex min-h-16 items-center gap-2 rounded-2xl bg-white px-4 font-black text-ink shadow-[0_4px_0_#e9dcc4] disabled:opacity-40"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden /> {t.stage.originalColor}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
