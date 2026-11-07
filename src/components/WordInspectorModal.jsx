import { useEffect, useRef, useState } from 'react';
import { X, Rotate3d, Smartphone, RotateCcw } from 'lucide-react';
import ModelView, { applyModelColor } from './ModelView.jsx';
import { SpeakerButton, SlowSpeakerButton, ExtendedBadge } from './ui.jsx';
import { speak } from '../utils/speech.js';
import { playSfx } from '../utils/sfx.js';
import { useSettings } from '../settings.jsx';

export const PALETTE = [
  { hex: '#EF4444', en: 'red', vi: 'đỏ' },
  { hex: '#3B82F6', en: 'blue', vi: 'xanh dương' },
  { hex: '#22C55E', en: 'green', vi: 'xanh lá' },
  { hex: '#FACC15', en: 'yellow', vi: 'vàng' },
  { hex: '#EC4899', en: 'pink', vi: 'hồng' },
  { hex: '#8B5CF6', en: 'purple', vi: 'tím' },
];

/**
 * Cửa sổ xem chi tiết từ vựng 3D tương tác:
 * - Xoay 360 độ, phóng to, thu nhỏ mô hình 3D trực quan
 * - Đổi màu 3D theo bảng màu và nghe phát âm tên màu tiếng Anh
 * - Nghe phát âm từ vựng chuẩn + câu ví dụ thực tế chuẩn SGK
 */
export default function WordInspectorModal({ word, onClose }) {
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
    if (applyModelColor(mvRef.current, c?.hex ?? null)) {
      setColor(c?.hex ?? null);
    }
    if (c) speak(c.en, settings);
  };

  if (!word) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${word.word} – ${word.meaning}`}
      onClick={onClose}
    >
      <div
        className="animate-pop flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-[2.5rem] bg-white shadow-2xl sm:rounded-[2.5rem] border-3 border-banana-soft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-banana-soft px-6 py-4 bg-cream/70">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-banana text-ink shadow-xs">
              <Rotate3d className="h-5 w-5" />
            </span>
            <div>
              <span className="text-xs font-black uppercase text-ink-soft">
                {word.model3d ? 'Mô hình 3D tương tác 360°' : 'Hình ảnh từ vựng'}
              </span>
              <h2 className="text-lg font-black text-ink">{word.word}</h2>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center gap-1.5 rounded-2xl bg-white px-4 text-sm font-black text-ink shadow-[0_2px_0_#efe3cc] hover:bg-banana hover:text-ink cursor-pointer border border-[#efe3cc] transition-all"
          >
            <X className="h-5 w-5" aria-hidden /> Đóng
          </button>
        </div>

        {/* Khung hiển thị mô hình 3D */}
        <div className="relative h-72 sm:h-80 bg-gradient-to-b from-sky-soft/60 via-cream to-white border-b-2 border-banana-soft flex items-center justify-center">
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
            {canAR && (
              <button
                slot="ar-button"
                className="absolute right-4 bottom-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-mint px-4 font-black text-white shadow-[0_4px_0_var(--color-mint-dark)] active:translate-y-1 cursor-pointer"
              >
                <Smartphone className="h-5 w-5" aria-hidden /> Xem thực tế ảo (AR)
              </button>
            )}
          </ModelView>
          {word.model3d ? (
            <div className="pointer-events-none absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-ink shadow-xs border border-banana-soft">
              👆 Chạm & kéo để xoay 360° · Cuộn để phóng to
            </div>
          ) : (
            <p className="absolute bottom-3 text-center text-xs font-bold text-ink-soft">
              Đồ vật này chưa có file 3D, em xem hình vẽ minh họa nhé!
            </p>
          )}
        </div>

        {/* Nội dung thông tin từ vựng */}
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl sm:text-4xl font-black text-ink">{word.word}</h3>
                <span className="text-lg font-black text-sky-dark">{word.phonetic}</span>
              </div>
              <p className="mt-1 text-2xl font-black text-ink">{word.meaning}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-bold text-ink-soft">
                <span className="rounded-full bg-banana-soft px-3 py-0.5 text-ink font-black">
                  {word.wordType}
                </span>
                <ExtendedBadge word={word} />
                {word.hint && <span>💡 {word.hint}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SlowSpeakerButton word={word} size="md" />
              <SpeakerButton key={word.id} word={word} autoPlay size="md" slowToo />
            </div>
          </div>

          {/* Câu ví dụ ứng dụng */}
          {word.exampleEn && (
            <div className="rounded-2xl bg-cream p-4 border border-banana-soft shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base sm:text-lg font-black text-ink">{word.exampleEn}</p>
                <SpeakerButton text={word.exampleEn} audio={word.audioExample} size="sm" />
              </div>
              <p className="mt-1 text-sm font-bold text-ink-soft">{word.exampleVi}</p>
            </div>
          )}

          {/* Đổi màu mô hình 3D */}
          {word.model3d && (
            <div className="rounded-2xl bg-white p-4 border-2 border-banana-soft shadow-xs">
              <h4 className="mb-2 text-sm font-black text-ink flex items-center gap-2">
                <span>🎨 Đổi màu mô hình 3D (học màu sắc tiếng Anh):</span>
              </h4>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    disabled={!loaded}
                    onClick={() => pickColor(c)}
                    aria-label={`${c.en} – ${c.vi}`}
                    aria-pressed={color === c.hex}
                    title={`${c.en} – ${c.vi}`}
                    className={`flex h-14 w-14 flex-col items-center justify-end rounded-2xl pb-1 text-[11px] font-black text-white shadow-[0_3px_0_rgb(0_0_0/0.15)] transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-40 hover:scale-105 ${
                      color === c.hex ? 'ring-4 ring-ink ring-offset-2' : ''
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
                  className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-cream px-4 text-xs font-black text-ink shadow-[0_3px_0_#efe3cc] hover:bg-banana transition-all cursor-pointer border border-[#efe3cc] disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden /> Màu gốc
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
