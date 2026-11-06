import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { playSfx } from '../utils/sfx.js';
import { sayWord, speak } from '../utils/speech.js';
import { useSettings } from '../settings.jsx';
import { t } from '../i18n/vi.js';

const TONES = {
  banana: 'bg-banana text-ink shadow-[0_6px_0_var(--color-banana-dark)] hover:shadow-[0_8px_0_var(--color-banana-dark)] active:shadow-[0_2px_0_var(--color-banana-dark)]',
  mint: 'bg-mint text-white shadow-[0_6px_0_var(--color-mint-dark)] hover:shadow-[0_8px_0_var(--color-mint-dark)] active:shadow-[0_2px_0_var(--color-mint-dark)]',
  peach: 'bg-peach text-white shadow-[0_6px_0_var(--color-peach-dark)] hover:shadow-[0_8px_0_var(--color-peach-dark)] active:shadow-[0_2px_0_var(--color-peach-dark)]',
  sky: 'bg-sky text-ink shadow-[0_6px_0_var(--color-sky-dark)] hover:shadow-[0_8px_0_var(--color-sky-dark)] active:shadow-[0_2px_0_var(--color-sky-dark)]',
  white: 'bg-white text-ink shadow-[0_6px_0_#e9dcc4] hover:shadow-[0_8px_0_#e9dcc4] active:shadow-[0_2px_0_#e9dcc4]',
};

/** Nút 3D to rõ, lún xuống khi bấm, cực kỳ dễ bấm bằng chuột hoặc cảm ứng. */
export function Button3D({ tone = 'banana', className = '', children, onClick, sound = true, to, ...rest }) {
  const cls = `inline-flex min-h-16 min-w-16 items-center justify-center gap-2 rounded-3xl px-6 text-lg font-black transition-all duration-100 select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-banana ${TONES[tone]} ${className}`;
  const handle = (e) => {
    if (sound) playSfx('click');
    onClick?.(e);
  };
  if (to) {
    return (
      <Link to={to} onClick={handle} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={handle} className={cls} {...rest}>
      {children}
    </button>
  );
}

export function SpeakerIcon({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Nút phát âm to, dễ bấm: đọc chuẩn và có hiệu ứng sóng âm khi đang đọc */
export function SpeakerButton({
  word,
  text,
  audio,
  slow = false,
  slowToo = false,
  size = 'lg',
  autoPlay = false,
  label,
  className = '',
}) {
  const { settings } = useSettings();
  const [playing, setPlaying] = useState(false);
  const target = word ?? text;

  const play = async () => {
    if (!target) return;
    setPlaying(true);
    if (slow) {
      if (typeof target === 'object') {
        await sayWord(target, settings, { slow: true });
      } else {
        await speak(target, { ...settings, rate: 0.65, audio });
      }
    } else {
      if (typeof target === 'object') {
        await sayWord(target, settings, { slowToo });
      } else {
        await speak(target, { ...settings, audio });
      }
    }
    setPlaying(false);
  };

  useEffect(() => {
    if (autoPlay) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, typeof target === 'string' ? target : target?.id]);

  const dims =
    size === 'xl'
      ? 'h-24 w-24'
      : size === 'lg'
        ? 'h-20 w-20'
        : size === 'md'
          ? 'h-16 w-16'
          : 'h-12 w-12';

  const iconDims = size === 'xl' ? 'h-12 w-12' : size === 'lg' ? 'h-9 w-9' : size === 'md' ? 'h-7 w-7' : 'h-6 w-6';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        play();
      }}
      aria-label={label ?? t.common.listen}
      title={label ?? t.common.listen}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full cursor-pointer transition-all active:translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-peach ${
        slow
          ? 'bg-sky text-ink shadow-[0_5px_0_var(--color-sky-dark)] active:shadow-[0_1px_0_var(--color-sky-dark)]'
          : 'bg-peach text-white shadow-[0_5px_0_var(--color-peach-dark)] active:shadow-[0_1px_0_var(--color-peach-dark)]'
      } ${playing ? 'animate-pulse-ring' : 'hover:scale-105'} ${dims} ${className}`}
    >
      <SpeakerIcon className={iconDims} />
      {label && <span className="text-base font-black">{label}</span>}
    </button>
  );
}

/** Nút phát âm chậm hình chú rùa 🐢 */
export function SlowSpeakerButton({ word, text, audio, size = 'sm', className = '' }) {
  const { settings } = useSettings();
  const [playing, setPlaying] = useState(false);
  const target = word ?? text;

  const play = async (e) => {
    e.stopPropagation();
    if (!target) return;
    setPlaying(true);
    if (typeof target === 'object') {
      await sayWord(target, settings, { slow: true });
    } else {
      await speak(target, { ...settings, rate: 0.65, audio });
    }
    setPlaying(false);
  };

  const dims = size === 'md' ? 'h-14 px-4 text-base' : 'h-11 px-3 text-sm';

  return (
    <button
      type="button"
      onClick={play}
      aria-label={t.common.listenSlow}
      title={t.common.listenSlow}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-sky-soft text-ink font-black border-2 border-sky-dark/20 shadow-[0_3px_0_#c4dcf7] cursor-pointer hover:bg-sky-soft/80 active:translate-y-0.5 active:shadow-none transition-all ${dims} ${
        playing ? 'ring-2 ring-sky' : ''
      } ${className}`}
    >
      <span className="text-lg">🐢</span>
      <span>{t.common.listenSlow}</span>
    </button>
  );
}

/** Hình minh họa: ảnh webp nếu có, nếu không thì emoji to, nổi bật. */
export function WordImage({ word, size = 'lg', className = '' }) {
  const [broken, setBroken] = useState(false);
  const px = {
    xl: 'h-48 w-48 text-[8rem]',
    lg: 'h-28 w-28 text-7xl',
    md: 'h-20 w-20 text-5xl',
    sm: 'h-14 w-14 text-4xl',
  }[size] || 'h-28 w-28 text-7xl';

  if (word?.image && !broken) {
    return (
      <img
        src={word.image}
        alt={word.word}
        onError={() => setBroken(true)}
        className={`${px} object-contain transition-transform drop-shadow-md ${className}`}
      />
    );
  }
  if (!word?.emoji) {
    return null;
  }
  return (
    <span
      role="img"
      aria-label={word?.word || 'hình'}
      className={`inline-flex items-center justify-center leading-none select-none drop-shadow-sm ${px} ${className}`}
    >
      {word.emoji}
    </span>
  );
}

export function Stars({ count = 0, max = 3, className = 'text-2xl' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`${count}/${max} sao`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`transition-all select-none ${i < count ? 'scale-110 drop-shadow-sm' : 'opacity-25 grayscale'}`}
          aria-hidden
        >
          ⭐
        </span>
      ))}
    </span>
  );
}

/** Tiêu đề trang to rõ, có nút "Quay lại" kèm chữ rõ nghĩa cho học sinh dễ nhận biết */
export function PageHeader({ title, subtitle, backTo, backLabel, right }) {
  return (
    <header className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {backTo && (
          <Link
            to={backTo}
            onClick={() => playSfx('click')}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-base font-extrabold text-ink shadow-[0_4px_0_#e9dcc4] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-banana"
          >
            <span className="text-xl leading-none">←</span>
            <span>{backLabel ?? t.common.back}</span>
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-black text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="truncate text-sm sm:text-base font-bold text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}

/** Thanh tiến trình to, dễ nhìn */
export function ProgressBar({ value, max, tone = 'bg-mint' }) {
  const pct = max ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <div
      className="h-5 w-full overflow-hidden rounded-full bg-white p-0.5 shadow-inner border border-banana-soft/60"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full ${tone} transition-all duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Hộp hướng dẫn thân thiện dành riêng cho học sinh ít dùng máy tính */
export function InstructionBanner({ text, icon = '💡', children, className = '' }) {
  return (
    <aside className={`flex items-center gap-3 rounded-2xl bg-banana-soft/70 border border-banana-dark/15 px-4 py-3 text-ink ${className}`}>
      <span className="text-2xl shrink-0" aria-hidden>{icon}</span>
      <div className="flex-1 text-base font-extrabold leading-snug">
        {text}
        {children}
      </div>
    </aside>
  );
}

/** Phím tắt bàn phím nổi bật */
export function KeyboardBadge({ keyName, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-ink-soft">
      <kbd className="inline-flex items-center justify-center rounded-lg bg-white px-2 py-0.5 font-black text-ink shadow-[0_2px_0_#d5c8b2] border border-[#e8dcc6]">
        {keyName}
      </kbd>
      {label && <span>{label}</span>}
    </span>
  );
}

const CONFETTI_COLORS = ['#FFC83D', '#3BB78F', '#8EC5FF', '#F26B3A', '#C3A6FF'];

/** Bắn pháo hoa giấy (canvas-confetti). Tự tắt khi máy bật "giảm chuyển động". */
export function fireConfetti(power = 1) {
  const shoot = (opts) =>
    confetti({ disableForReducedMotion: true, colors: CONFETTI_COLORS, zIndex: 60, ...opts });
  shoot({ particleCount: Math.round(90 * power), spread: 75, startVelocity: 42, origin: { y: 0.65 } });
  setTimeout(() => {
    shoot({ particleCount: Math.round(45 * power), angle: 60, spread: 60, origin: { x: 0, y: 0.75 } });
    shoot({ particleCount: Math.round(45 * power), angle: 120, spread: 60, origin: { x: 1, y: 0.75 } });
  }, 220);
}

/** Pháo hoa chúc mừng khi component hiện ra (giữ API cũ: <Confetti show />). */
export function Confetti({ show, power = 1 }) {
  useEffect(() => {
    if (show) fireConfetti(power);
  }, [show, power]);
  return null;
}

/** Màn hình kết thúc một chế độ ôn */
export function ResultScreen({ stars, summary, onAgain, backTo, backLabel = t.result.backToUnit }) {
  useEffect(() => {
    playSfx('victory');
  }, []);
  return (
    <div className="animate-pop flex flex-col items-center gap-6 rounded-[2.5rem] bg-white p-8 sm:p-10 text-center shadow-md border-4 border-banana-soft">
      <Confetti show />
      <div className="animate-float text-8xl" aria-hidden>
        🏆
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-ink">{t.result.title}</h2>
        <p className="text-xl font-black text-peach">{t.result.stars(stars)}</p>
      </div>
      <Stars count={stars} className="text-5xl" />
      {summary && <p className="text-lg font-bold text-ink-soft max-w-md">{summary}</p>}
      <div className="flex flex-wrap justify-center gap-4 mt-2 w-full max-w-md">
        <Button3D tone="white" onClick={onAgain} className="flex-1 min-w-40 py-4">
          🔁 {t.result.again}
        </Button3D>
        <Button3D tone="mint" to={backTo} className="flex-1 min-w-40 py-4">
          {backLabel}
        </Button3D>
      </div>
    </div>
  );
}

/** Số sao theo số lần sai: 0 → 3 sao, ≤ 1/4 số câu → 2 sao, còn lại 1 sao. */
export function starsFromMistakes(mistakes, total) {
  if (mistakes === 0) return 3;
  if (mistakes <= Math.max(1, Math.round(total / 4))) return 2;
  return 1;
}
