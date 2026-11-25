import { NavLink } from 'react-router-dom';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import GradeSwitcher from './GradeSwitcher.jsx';

export default function MobileTopBar({ currentStudent, onOpenAuthModal, totalStars, streak = 0 }) {
  const { settings, update } = useSettings();
  const toggleSound = () => {
    const next = !settings.sound;
    update({ sound: next });
    if (next) playSfx('click');
  };

  return (
    <header className="no-print md:hidden sticky top-0 z-40 bg-white/95 border-b-2 border-banana-soft px-3 py-2 flex items-center justify-between shadow-xs backdrop-blur-md gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <NavLink to="/" className="flex items-center gap-1.5 shrink-0" aria-label="Trang chủ">
          <span className="text-2xl leading-none" aria-hidden>
            📚
          </span>
        </NavLink>
        <GradeSwitcher compact />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            playSfx('click');
            onOpenAuthModal();
          }}
          className="flex items-center gap-1 rounded-xl bg-cream px-2 py-1 text-xs font-black text-ink border border-banana-soft max-w-[110px] truncate shadow-2xs active:scale-95"
        >
          <span aria-hidden>{currentStudent ? currentStudent.avatar || '🦁' : '👤'}</span>
          <span className="truncate">{currentStudent ? currentStudent.name : 'Đăng nhập'}</span>
        </button>
        <div className="flex items-center gap-1 rounded-xl bg-white px-2 py-1 text-xs font-black text-ink border border-banana-soft shadow-2xs">
          <span aria-hidden>⭐</span>
          <span>{totalStars}</span>
        </div>
        {streak > 0 && (
          <div className="hidden xs:flex items-center gap-0.5 rounded-xl bg-white px-1.5 py-1 text-xs font-black text-peach-dark border border-banana-soft shadow-2xs">
            <span aria-hidden>🔥</span>
            <span>{streak}</span>
          </div>
        )}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
          title={settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm shadow-2xs border border-banana-soft active:scale-95 cursor-pointer"
        >
          {settings.sound ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  );
}
