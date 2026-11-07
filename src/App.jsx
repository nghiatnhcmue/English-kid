import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './settings.jsx';
import { KEYS, onStoreWrite, store, totalStarsOf } from './utils/storage.js';
import { getStudentToken, pendingCount, startSync } from './utils/api.js';
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
import SpeakingPage from './pages/SpeakingPage.jsx';
import ReadingPage from './pages/ReadingPage.jsx';
import WritingPage from './pages/WritingPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PronunciationPage from './pages/PronunciationPage.jsx';
import StudentAuthModal from './components/StudentAuthModal.jsx';

const NAV = [
  { to: '/', label: 'Bài học', icon: '📚', end: true },
  { to: '/search', label: 'Tìm kiếm', icon: '🔍' },
  { to: '/test', label: t.nav.test, icon: '📝' },
  { to: '/journal', label: t.nav.journal, icon: '📒' },
  { to: '/settings', label: t.nav.settings, icon: '⚙️' },
];

function TopNavBar({ currentStudent, onOpenAuthModal, totalStars, streak }) {
  const { settings, update } = useSettings();

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
                  {/* Màn < 1280px: chỉ icon (chữ vẫn đọc được bằng trình đọc màn hình) để thanh trên không tràn ngang */}
                  <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Vạch ngăn cách tinh tế */}
            <li className="h-5 w-px bg-banana-dark/20 mx-0.5" aria-hidden />

            {/* Mục dành cho Giáo viên */}
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

        {/* Cụm Tiện Ích: Đăng nhập học sinh + Số sao + Streak + Âm thanh */}
        <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
          {/* Nút Hồ sơ / Đăng nhập học sinh */}
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              onOpenAuthModal();
            }}
            title={currentStudent ? `Học sinh: ${currentStudent.name} (${currentStudent.class}) - Bấm để xem hoặc đăng xuất` : 'Bấm để đăng nhập'}
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs lg:text-sm font-black text-ink shadow-[0_2px_0_#e9dcc4] border border-banana-soft select-none hover:bg-cream hover:scale-105 transition-all cursor-pointer"
          >
            <span className="text-sm lg:text-base leading-none" aria-hidden>
              {currentStudent ? (currentStudent.avatar || '🦁') : '👤'}
            </span>
            <span className="sr-only 2xl:not-sr-only 2xl:max-w-36 2xl:truncate">
              {currentStudent ? `${currentStudent.name} (${currentStudent.class})` : 'Đăng nhập học sinh'}
            </span>
          </button>

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

function MobileTopBar({ currentStudent, onOpenAuthModal, totalStars }) {
  return (
    <header className="no-print md:hidden sticky top-0 z-40 bg-white/95 border-b-2 border-banana-soft px-3 py-2 flex items-center justify-between shadow-xs backdrop-blur-md">
      <NavLink to="/" className="flex items-center gap-2">
        <span className="text-2xl leading-none">📚</span>
        <span className="text-base font-black text-ink">{t.appName}</span>
      </NavLink>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            playSfx('click');
            onOpenAuthModal();
          }}
          className="flex items-center gap-1.5 rounded-xl bg-cream px-2.5 py-1 text-xs font-black text-ink border border-banana-soft max-w-[150px] truncate shadow-2xs"
        >
          <span>{currentStudent ? (currentStudent.avatar || '🦁') : '👤'}</span>
          <span className="truncate">{currentStudent ? currentStudent.name : 'Đăng nhập'}</span>
        </button>
        <span className="flex items-center gap-1 rounded-xl bg-white px-2 py-1 text-xs font-black text-ink border border-banana-soft shadow-2xs">
          ⭐ {totalStars}
        </span>
      </div>
    </header>
  );
}

const MOBILE_NAV = [
  { to: '/', label: 'Bài học', icon: '📚', end: true },
  { to: '/search', label: 'Tìm kiếm', icon: '🔍' },
  { to: '/test', label: 'Test tuần', icon: '📝' },
  { to: '/journal', label: 'Nhật ký', icon: '📒' },
  { to: '/teacher', label: 'Giáo viên', icon: '👨‍🏫' },
];

function BottomNav() {
  return (
    <nav
      className="no-print md:hidden fixed inset-x-0 bottom-0 z-30 border-t-2 border-banana-soft bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur"
      aria-label="Điều hướng điện thoại"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {MOBILE_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={() => playSfx('click')}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 text-[10px] font-black transition-colors ${
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

function AppContent() {
  const location = useLocation();
  const [currentStudent, setCurrentStudent] = useState(() => store().getCurrentStudent());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setDataTick] = useState(0);
  const [toast, setToast] = useState(null); // { tone, text }
  const [pending, setPending] = useState(() => pendingCount());

  useEffect(() => {
    startSync();
    const bump = () => setDataTick((n) => n + 1);
    const onWriteFailed = () =>
      setToast({ tone: 'error', text: '⚠️ Bộ nhớ trình duyệt đã đầy nên CHƯA lưu được. Hãy dùng ảnh/âm thanh nhỏ hơn hoặc xóa bớt.' });
    const onSync = (e) => {
      const d = e.detail || {};
      if (d.state === 'error') setToast({ tone: 'error', text: `⚠️ ${d.error}` });
      if (d.state === 'saved') setToast({ tone: 'ok', text: '☁️ Đã lưu lên máy chủ – học sinh ở máy khác sẽ nhận được.' });
    };
    const onOutbox = (e) => setPending(e.detail?.pending ?? pendingCount());
    window.addEventListener('curriculum-updated', bump);
    window.addEventListener('assignment-updated', bump);
    window.addEventListener('storage-write-failed', onWriteFailed);
    window.addEventListener('sync-status', onSync);
    window.addEventListener('outbox-changed', onOutbox);
    // Giáo viên sửa / xóa đúng học sinh đang đăng nhập trên máy này → cập nhật tên trên thanh trên cùng
    const off = onStoreWrite((key) => {
      if (key === KEYS.STUDENTS || key === KEYS.CURRENT_STUDENT_ID) setCurrentStudent(store().getCurrentStudent());
      if (key.endsWith('_outbox')) setPending(pendingCount());
    });
    return () => {
      window.removeEventListener('curriculum-updated', bump);
      window.removeEventListener('assignment-updated', bump);
      window.removeEventListener('storage-write-failed', onWriteFailed);
      window.removeEventListener('sync-status', onSync);
      window.removeEventListener('outbox-changed', onOutbox);
      off();
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), toast.tone === 'error' ? 8000 : 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const progress = store().getProgress();
  const streak = streakOf(progress.studyDays);
  const totalStars = totalStarsOf(progress);

  // Nếu chưa đăng nhập học sinh nào VÀ không phải đang ở trang Giáo viên -> Bắt buộc mở modal đăng nhập
  const isTeacherPage = location.pathname.startsWith('/teacher');
  const mustLogin = !currentStudent && !isTeacherPage;

  const handleLoginSuccess = (stu) => {
    setCurrentStudent(stu);
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream text-ink">
      <TopNavBar
        currentStudent={currentStudent}
        onOpenAuthModal={() => setShowAuthModal(true)}
        totalStars={totalStars}
        streak={streak}
      />
      <MobileTopBar
        currentStudent={currentStudent}
        onOpenAuthModal={() => setShowAuthModal(true)}
        totalStars={totalStars}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-4 pb-28 md:pb-12 md:pt-6">
        {currentStudent && pending > 0 && !getStudentToken() && !isTeacherPage && (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="mb-4 w-full rounded-2xl bg-banana-soft px-4 py-3 text-left text-sm font-black text-ink border-2 border-banana cursor-pointer"
          >
            💾 Có {pending} kết quả chưa gửi cho thầy cô. Bấm vào đây và đăng nhập bằng mã PIN để gửi nhé!
          </button>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<Fresh component={SearchPage} />} />
          <Route path="/pronunciation" element={<Fresh component={PronunciationPage} />} />
          <Route path="/grammar" element={<Fresh component={GrammarPage} />} />
          <Route path="/listening" element={<Fresh component={ListeningPage} />} />
          <Route path="/speaking" element={<Fresh component={SpeakingPage} />} />
          <Route path="/reading" element={<Fresh component={ReadingPage} />} />
          <Route path="/writing" element={<Fresh component={WritingPage} />} />
          <Route path="/unit/:unitId" element={<UnitPage />} />
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

      {toast && (
        <div
          role="status"
          className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl px-4 py-3 text-sm font-black shadow-lg md:bottom-6 ${
            toast.tone === 'error' ? 'bg-rose-600 text-white' : 'bg-mint-dark text-white'
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Modal đăng nhập đơn giản cho học sinh yếu máy tính */}
      <StudentAuthModal
        isOpen={mustLogin || showAuthModal}
        forceLogin={mustLogin}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </SettingsProvider>
  );
}
