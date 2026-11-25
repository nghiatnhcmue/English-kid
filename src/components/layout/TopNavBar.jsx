import { NavLink } from 'react-router-dom';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import { t } from '../../i18n/vi.js';
import GradeSwitcher from './GradeSwitcher.jsx';

const NAV = [
  { to: '/', label: 'Bài học', icon: '📚', end: true },
  { to: '/search', label: 'Tìm kiếm', icon: '🔍' },
  { to: '/test', label: t.nav.test, icon: '📝' },
  { to: '/journal', label: t.nav.journal, icon: '📒' },
  { to: '/settings', label: t.nav.settings, icon: '⚙️' },
];

export default function TopNavBar({ currentStudent, onOpenAuthModal, totalStars, streak }) {
  const { settings, update } = useSettings();

  const toggleSound = () => {
    const next = !settings.sound;
    update({ sound: next });
    if (next) playSfx('click');
  };

  return (
    <header className="no-print sticky top-0 z-40 hidden md:block bg-white/95 border-b-2 border-banana-soft shadow-xs backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 gap-3">
        <div className="flex items-center gap-2.5">
          <NavLink
            to="/"
            className="group flex shrink-0 items-center gap-3 text-ink transition-transform hover:scale-[1.02] active:scale-95"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-banana to-banana-dark text-2xl shadow-[0_3px_0_#d8b13c]">
              <span>📚</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black tracking-tight text-ink">{t.appName}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-dark">
                Global Success {settings.selectedGrade || 6}
              </span>
            </div>
          </NavLink>
          <GradeSwitcher />
        </div>

        <nav aria-label="Điều hướng chính" className="flex items-center">
          <ul className="flex items-center gap-1 lg:gap-1.5 rounded-2xl bg-cream/70 p-1 border border-banana-soft/60">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  onClick={() => playSfx('click')}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-extrabold whitespace-nowrap transition-all select-none ${
                      isActive
                        ? 'bg-banana text-ink shadow-[0_3px_0_var(--color-banana-dark)] scale-[1.02]'
                        : 'text-ink-soft hover:bg-white hover:text-ink'
                    }`
                  }
                >
                  <span className="text-base lg:text-lg leading-none" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">{item.label}</span>
                </NavLink>
              </li>
            ))}

            <li className="h-5 w-px bg-banana-dark/20 mx-0.5" aria-hidden />

            <li>
              <NavLink
                to="/teacher"
                title="Góc Giáo Viên"
                onClick={() => playSfx('click')}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-black whitespace-nowrap transition-all select-none ${
                    isActive
                      ? 'bg-peach text-white shadow-[0_3px_0_var(--color-peach-dark)]'
                      : 'text-peach-dark hover:bg-peach/15'
                  }`
                }
              >
                <span className="text-base leading-none">👨‍🏫</span>
                <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">Góc Giáo Viên</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              onOpenAuthModal();
            }}
            title={
              currentStudent
                ? `Học sinh: ${currentStudent.name} (${currentStudent.class}) - Bấm để xem hoặc đăng xuất`
                : 'Bấm để đăng nhập'
            }
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs lg:text-sm font-black text-ink shadow-[0_2px_0_#e9dcc4] border border-banana-soft select-none hover:bg-cream hover:scale-105 transition-all cursor-pointer"
          >
            <span className="text-sm lg:text-base leading-none" aria-hidden>
              {currentStudent ? currentStudent.avatar || '🦁' : '👤'}
            </span>
            <span className="sr-only 2xl:not-sr-only 2xl:max-w-36 2xl:truncate">
              {currentStudent ? `${currentStudent.name} (${currentStudent.class})` : 'Đăng nhập học sinh'}
            </span>
          </button>

          <div
            title={`Em đã tích lũy được ${totalStars} ngôi sao`}
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs lg:text-sm font-black text-ink shadow-[0_2px_0_#e9dcc4] border border-banana-soft select-none hover:scale-105 transition-transform"
          >
            <span className="text-sm lg:text-base leading-none" aria-hidden>
              ⭐
            </span>
            <span>{totalStars}</span>
          </div>

          <div
            title={streak > 0 ? `Chuỗi học liên tiếp ${streak} ngày` : 'Học mỗi ngày để giữ ngọn lửa!'}
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs lg:text-sm font-black text-peach-dark shadow-[0_2px_0_#e9dcc4] border border-banana-soft select-none hover:scale-105 transition-transform"
          >
            <span className="text-sm lg:text-base leading-none" aria-hidden>
              🔥
            </span>
            <span>{streak}</span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
            title={settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-base font-bold shadow-[0_2px_0_#e9dcc4] hover:bg-cream active:translate-y-0.5 active:shadow-none cursor-pointer border border-[#ece0cc] transition-all hover:scale-105"
          >
            {settings.sound ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  );
}
