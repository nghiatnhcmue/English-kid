import { useEffect, useState, useCallback } from 'react';
import { Button3D, ProgressBar, SpeakerButton, SlowSpeakerButton, WordImage, KeyboardBadge } from './ui.jsx';
import { playSfx } from '../utils/sfx.js';
import { t } from '../i18n/vi.js';

/** Mô hình 3D (chỉ tải thư viện model-viewer khi từ có file .glb). */
function ModelView({ word }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    import('@google/model-viewer')
      .then(() => alive && setReady(true))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  if (failed || !ready) return <WordImage word={word} size="xl" />;
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="h-56 w-full"
    >
      <model-viewer
        src={word.model3d}
        alt={word.word}
        camera-controls
        auto-rotate
        touch-action="pan-y"
        shadow-intensity="1"
        style={{ width: '100%', height: '100%' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function Flashcard3D({ words, onFinish }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index];
  const isLast = index === words.length - 1;

  const toggleFlip = useCallback(() => {
    playSfx('click');
    setFlipped((f) => !f);
  }, []);

  const go = useCallback(
    (delta) => {
      setFlipped(false);
      setIndex((i) => Math.min(words.length - 1, Math.max(0, i + delta)));
    },
    [words.length],
  );

  // Hỗ trợ bàn phím máy tính cực kỳ tiện lợi cho học sinh
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tránh bắt phím nếu đang gõ input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isLast) onFinish(3, t.flashcard.allSeen);
        else go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (index > 0) go(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFlip, go, isLast, index, onFinish]);

  return (
    <div className="flex flex-col gap-4">
      {/* Tiến độ bài học */}
      <div className="flex items-center gap-3">
        <ProgressBar value={index + 1} max={words.length} tone="bg-banana" />
        <span className="shrink-0 text-base font-black text-ink">
          {index + 1}/{words.length}
        </span>
      </div>

      {/* Thẻ lật 3D */}
      <div className="flip-scene">
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? t.flashcard.flipPromptBack : t.flashcard.flipPromptFront}
          onClick={toggleFlip}
          className={`flip-card min-h-[27rem] cursor-pointer select-none ${flipped ? 'is-flipped' : ''}`}
        >
          {/* Mặt trước: Tiếng Anh */}
          <section className="flip-face flex flex-col items-center justify-between gap-3 rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc]">
            <span className="rounded-full bg-cream px-4 py-1 text-xs sm:text-sm font-black text-ink-soft">
              {t.flashcard.flipPromptFront}
            </span>

            <div className="flex flex-col items-center gap-2">
              {word.model3d ? (
                <ModelView word={word} />
              ) : (
                <WordImage word={word} size="xl" className="animate-float" />
              )}
              <h2 className="text-center text-4xl sm:text-5xl font-black text-ink">{word.word}</h2>
              <p className="text-xl sm:text-2xl font-black text-sky-dark">{word.phonetic}</p>
            </div>

            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <SpeakerButton key={word.id} word={word} slowToo autoPlay size="md" />
              <SlowSpeakerButton word={word} size="md" />
            </div>
          </section>

          {/* Mặt sau: Tiếng Việt */}
          <section className="flip-face flip-back flex flex-col justify-between gap-4 rounded-[2.5rem] bg-mint-soft p-6 sm:p-8 shadow-[0_8px_0_#bfe6d6] border-2 border-[#bfe6d6]">
            <div className="text-center">
              <span className="rounded-full bg-white px-4 py-1 text-xs sm:text-sm font-black text-mint-dark">
                {t.flashcard.flipPromptBack}
              </span>
              <div className="mt-4">
                <span className="rounded-full bg-mint text-white px-3 py-1 text-xs sm:text-sm font-black">
                  {word.wordType}
                </span>
                <h2 className="mt-3 text-4xl sm:text-5xl font-black text-ink">{word.meaning}</h2>
                <p className="mt-2 text-lg font-bold text-ink-soft">💡 {word.hint}</p>
              </div>
            </div>

            {/* Câu ví dụ song ngữ */}
            <div className="rounded-3xl bg-white p-4 shadow-sm" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs sm:text-sm font-black text-mint-dark uppercase tracking-wider">
                {t.flashcard.example}
              </p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-lg sm:text-xl font-black text-ink">{word.exampleEn}</p>
                <SpeakerButton text={word.exampleEn} size="sm" />
              </div>
              <p className="mt-1 text-base sm:text-lg font-bold text-ink-soft">{word.exampleVi}</p>
            </div>
          </section>
        </div>
      </div>

      {/* Nút bấm lật thẻ tường minh dành cho học sinh ít dùng máy tính */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-black text-ink shadow-[0_4px_0_#efe3cc] hover:bg-cream active:translate-y-1 active:shadow-none cursor-pointer border border-[#efe3cc] transition-all"
        >
          <span>{flipped ? t.flashcard.flipButtonBack : t.flashcard.flipButtonFront}</span>
        </button>
      </div>

      {/* Các nút chuyển từ */}
      <div className="flex items-center justify-between gap-3 mt-1">
        <Button3D
          tone="white"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="flex-1 sm:flex-initial"
        >
          ← {t.common.prev}
        </Button3D>

        {isLast ? (
          <Button3D
            tone="mint"
            onClick={() => onFinish(3, t.flashcard.allSeen)}
            className="flex-1 sm:flex-initial"
          >
            {t.common.finish} ✓
          </Button3D>
        ) : (
          <Button3D
            tone="banana"
            onClick={() => go(1)}
            className="flex-1 sm:flex-initial"
          >
            {t.common.next} →
          </Button3D>
        )}
      </div>

      {/* Mẹo phím tắt cho học sinh dùng máy tính */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-center mt-1">
        <KeyboardBadge keyName="Space" label="Lật thẻ" />
        <KeyboardBadge keyName="←" label="Từ trước" />
        <KeyboardBadge keyName="→" label="Từ tiếp theo" />
      </div>
    </div>
  );
}
