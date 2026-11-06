import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './settings.jsx';
import { store, totalStarsOf } from './utils/storage.js';
import UnitSwitcher from './components/UnitSwitcher.jsx';
import StagePage from './pages/StagePage.jsx';
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
import GrammarPage from './pages/GrammarPage.jsx';
import ListeningPage from './pages/ListeningPage.jsx';

const NAV = [
  { to: '/', label: t.nav.home, icon: '🏠', end: true },
  { to: '/grammar', label: 'Ngữ pháp', icon: '📐' },
  { to: '/listening', label: 'Luyện Nghe', icon: '👂' },
  { to: '/unit/1/stage', label: t.nav.stage, icon: '🎭' },
  { to: '/test', label: t.nav.test, icon: '📝' },
  { to: '/journal', label: t.nav.journal, icon: '📒' },
  { to: '/settings', label: t.nav.settings, icon: '⚙️' },
];

function TopNavBar() {
  const { settings, update } = useSettings();
  const progress = store().getProgress();
  const streak = streakOf(progress.studyDays);
  const totalStars = totalStarsOf(progress);
  useLocation(); // vẽ lại khi đổi trang để số sao/streak luôn mới

  const toggleSound = () => {
    const next = !settings.sound;
    update({ sound: next });
    if (next) playSfx('click');
  };

  return (
    <header className="no-print sticky top-0 z-40 hidden md:block bg-white/95 border-b-2 border-banana-soft shadow-xs backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 gap-3">
        {/* Logo / Tên Ứng Dụng */}
        <NavLink
          to="/"
          className="group flex shrink-0 items-center gap-3 text-ink transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-banana to-banana-dark text-2xl shadow-[0_3px_0_#d8b13c]">
            <span>📚</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black tracking-tight text-ink">
              {t.appName}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-dark">
              Global Success 6
            </span>
          </div>
        </NavLink>

        {/* Thanh Menu Điều Hướng Trung Tâm */}
        <nav aria-label="Điều hướng chính" className="flex items-center">
          <ul className="flex items-center gap-1 lg:gap-1.5 rounded-2xl bg-cream/70 p-1 border border-banana-soft/60">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
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
                  <span className="whitespace-nowrap">{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Vạch ngăn cách tinh tế */}
            <li className="h-5 w-px bg-banana-dark/20 mx-0.5" aria-hidden />

            {/* Mục dành cho Giáo viên */}
            <li>
              <NavLink
                to="/teacher"
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
                <span className="whitespace-nowrap">Góc Giáo Viên</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Cụm Tiện Ích: Đổi bài + Số sao + Chuỗi streak + Âm thanh */}
        <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
          <UnitSwitcher className="hidden xl:flex w-52" />

          {/* Huy hiệu Sao ⭐ */}
          <div
            title={`Em đã tích lũy được ${totalStars} ngôi sao`}
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs lg:text-sm font-black text-ink shadow-[0_2px_0_#e9dcc4] border border-banana-soft select-none hover:scale-105 transition-transform"
          >
            <span className="text-sm lg:text-base leading-none" aria-hidden>⭐</span>
            <span>{totalStars}</span>
          </div>

          {/* Huy hiệu Chuỗi ngày học 🔥 */}
          <div
            title={streak > 0 ? `Chuỗi học liên tiếp ${streak} ngày` : 'Học mỗi ngày để giữ ngọn lửa!'}
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs lg:text-sm font-black text-peach-dark shadow-[0_2px_0_#e9dcc4] border border-banana-soft select-none hover:scale-105 transition-transform"
          >
            <span className="text-sm lg:text-base leading-none" aria-hidden>🔥</span>
            <span>{streak}</span>
          </div>

          {/* Nút bật / tắt âm thanh */}
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

function BottomNav() {
  return (
    <nav
      className="no-print md:hidden fixed inset-x-0 bottom-0 z-30 border-t-2 border-banana-soft bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur"
      aria-label="Điều hướng điện thoại"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={() => playSfx('click')}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-black transition-colors ${
                  isActive ? 'text-peach' : 'text-ink-soft'
                }`
              }
            >
              <span className="text-xl leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Mỗi lần điều hướng (kể cả bấm lại cùng trang) là một phiên mới, trạng thái được reset. */
function Fresh({ component: Component, ...props }) {
  const location = useLocation();
  return <Component key={location.key} {...props} />;
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
              <Route path="/grammar" element={<Fresh component={GrammarPage} />} />
              <Route path="/listening" element={<Fresh component={ListeningPage} />} />
              <Route path="/unit/:unitId" element={<UnitPage />} />
              <Route path="/unit/:unitId/stage/:sceneId?" element={<Fresh component={StagePage} />} />
              <Route path="/unit/:unitId/:mode" element={<Fresh component={PracticePage} />} />
              <Route path="/review/:mode" element={<Fresh component={PracticePage} review />} />
              <Route path="/test" element={<Fresh component={TestPage} />} />
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
