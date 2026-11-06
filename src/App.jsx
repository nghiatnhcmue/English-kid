import { HashRouter, NavLink, Route, Routes, Link } from 'react-router-dom';
import { SettingsProvider, useSettings } from './settings.jsx';
import { store } from './utils/storage.js';
import { streakOf } from './utils/dates.js';
import { playSfx } from './utils/sfx.js';
import { t } from './i18n/vi.js';
import HomePage from './pages/HomePage.jsx';
import UnitPage from './pages/UnitPage.jsx';
import PracticePage from './pages/PracticePage.jsx';
import TestPage from './pages/TestPage.jsx';
import JournalPage from './pages/JournalPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TeacherPage from './pages/TeacherPage.jsx';

const NAV = [
  { to: '/', label: t.nav.home, icon: '🏠', end: true },
  { to: '/test', label: t.nav.test, icon: '📝' },
  { to: '/journal', label: t.nav.journal, icon: '📒' },
  { to: '/settings', label: t.nav.settings, icon: '⚙️' },
];

function TopNavBar() {
  const { settings, update } = useSettings();
  const progress = store().getProgress();
  const streak = streakOf(progress.studyDays);
  const totalStars = Object.values(progress.units).reduce(
    (sum, u) => sum + Object.values(u.modes ?? {}).reduce((a, b) => a + b, 0),
    0,
  );

  const toggleSound = () => {
    const next = !settings.sound;
    update({ sound: next });
    if (next) playSfx('click');
  };

  return (
    <header className="no-print sticky top-0 z-30 hidden md:block bg-white/95 border-b-2 border-banana-soft shadow-xs backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2.5">
        {/* Logo / App Name */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 text-xl font-black text-ink hover:opacity-85 transition-opacity"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-banana text-2xl shadow-[0_3px_0_var(--color-banana-dark)]">
            📚
          </span>
          <span className="tracking-tight">{t.appName}</span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav aria-label="Điều hướng chính">
          <ul className="flex items-center gap-1.5">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => playSfx('click')}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-2xl px-4 py-2 text-base font-extrabold transition-all ${
                      isActive
                        ? 'bg-banana text-ink shadow-[0_3px_0_var(--color-banana-dark)]'
                        : 'text-ink-soft hover:bg-cream hover:text-ink'
                    }`
                  }
                >
                  <span className="text-xl" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Mục dành cho Giáo viên */}
            <li>
              <NavLink
                to="/teacher"
                onClick={() => playSfx('click')}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-black transition-all ${
                    isActive
                      ? 'bg-peach text-white shadow-[0_3px_0_var(--color-peach-dark)]'
                      : 'text-peach-dark hover:bg-rose-soft/50'
                  }`
                }
              >
                <span>👨‍🏫</span>
                <span>Góc Giáo Viên</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Quick Stats & Audio Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl bg-cream px-3 py-1.5 text-sm font-black text-ink shadow-xs border border-banana-soft">
            <span aria-hidden>⭐</span>
            <span>{totalStars}</span>
          </div>
          <div className="flex items-center gap-1 rounded-2xl bg-cream px-3 py-1.5 text-sm font-black text-ink shadow-xs border border-banana-soft">
            <span aria-hidden>🔥</span>
            <span>{streak}</span>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
            title={settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-bold shadow-[0_3px_0_#e9dcc4] hover:bg-cream active:translate-y-0.5 active:shadow-none cursor-pointer border border-[#ece0cc]"
          >
            {settings.sound ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav
      className="no-print md:hidden fixed inset-x-0 bottom-0 z-30 border-t-2 border-banana-soft bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur"
      aria-label="Điều hướng điện thoại"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={() => playSfx('click')}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-black transition-colors ${
                  isActive ? 'text-peach' : 'text-ink-soft'
                }`
              }
            >
              <span className="text-2xl leading-none" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <div className="min-h-dvh flex flex-col bg-cream text-ink">
          <TopNavBar />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-4 pb-28 md:pb-12 md:pt-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/unit/:unitId" element={<UnitPage />} />
              <Route path="/unit/:unitId/:mode" element={<PracticePage />} />
              <Route path="/review/:mode" element={<PracticePage review />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/teacher" element={<TeacherPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </HashRouter>
    </SettingsProvider>
  );
}
