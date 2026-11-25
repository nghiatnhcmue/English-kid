import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProvider } from './settings.jsx';
import { store, totalStarsOf, onStoreWrite, KEYS } from './utils/storage.js';
import { startSync, pendingCount, getStudentToken } from './utils/api.js';
import { streakOf } from './utils/dates.js';
import TopNavBar from './components/layout/TopNavBar.jsx';
import MobileTopBar from './components/layout/MobileTopBar.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import StudentAuthModal from './components/StudentAuthModal.jsx';
import HomePage from './pages/HomePage.jsx';
import UnitPage from './pages/UnitPage.jsx';

// Lazy-load các trang chuyên biệt & cổng Giáo viên để tối ưu dung lượng bundle khởi động
const PracticePage = lazy(() => import('./pages/PracticePage.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));
const PronunciationPage = lazy(() => import('./pages/PronunciationPage.jsx'));
const GrammarPage = lazy(() => import('./pages/GrammarPage.jsx'));
const ListeningPage = lazy(() => import('./pages/ListeningPage.jsx'));
const SpeakingPage = lazy(() => import('./pages/SpeakingPage.jsx'));
const ReadingPage = lazy(() => import('./pages/ReadingPage.jsx'));
const WritingPage = lazy(() => import('./pages/WritingPage.jsx'));
const TestPage = lazy(() => import('./pages/TestPage.jsx'));
const JournalPage = lazy(() => import('./pages/JournalPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const TeacherPage = lazy(() => import('./pages/TeacherPage.jsx'));

/** Mỗi lần điều hướng (kể cả bấm lại cùng trang) là một phiên mới, trạng thái được reset. */
function Fresh({ component: Component, ...props }) {
  const location = useLocation();
  return <Component key={location.key} {...props} />;
}

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="h-12 w-12 rounded-2xl bg-banana flex items-center justify-center text-2xl animate-bounce shadow-xs">
        📚
      </div>
      <p className="text-sm font-black text-ink-soft">Đang mở bài học...</p>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const [currentStudent, setCurrentStudent] = useState(() => store().getCurrentStudent());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setDataTick] = useState(0);
  const [toast, setToast] = useState(null);
  const [pending, setPending] = useState(() => pendingCount());

  useEffect(() => {
    startSync();
    const bump = () => setDataTick((n) => n + 1);
    const onWriteFailed = () =>
      setToast({
        tone: 'error',
        text: '⚠️ Bộ nhớ trình duyệt đã đầy nên CHƯA lưu được. Hãy dùng ảnh/âm thanh nhỏ hơn hoặc xóa bớt.',
      });
    const onSync = (e) => {
      const d = e.detail || {};
      if (d.state === 'error') setToast({ tone: 'error', text: `⚠️ ${d.error}` });
      if (d.state === 'saved') {
        setToast({ tone: 'ok', text: '☁️ Đã lưu lên máy chủ – học sinh ở máy khác sẽ nhận được.' });
      }
    };
    const onOutbox = (e) => setPending(e.detail?.pending ?? pendingCount());

    window.addEventListener('curriculum-updated', bump);
    window.addEventListener('assignment-updated', bump);
    window.addEventListener('storage-write-failed', onWriteFailed);
    window.addEventListener('sync-status', onSync);
    window.addEventListener('outbox-changed', onOutbox);

    const off = onStoreWrite((key) => {
      if (key === KEYS.STUDENTS || key === KEYS.CURRENT_STUDENT_ID) {
        setCurrentStudent(store().getCurrentStudent());
      }
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
        streak={streak}
      />
      <main className="mx-auto w-full max-w-6xl xl:max-w-7xl flex-1 px-3.5 sm:px-6 lg:px-8 pt-3 pb-28 md:pb-12 md:pt-6">
        {currentStudent && pending > 0 && !getStudentToken() && !isTeacherPage && (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="mb-4 w-full rounded-2xl bg-banana-soft px-4 py-3 text-left text-sm font-black text-ink border-2 border-banana cursor-pointer"
          >
            💾 Có {pending} kết quả chưa gửi cho thầy cô. Bấm vào đây và đăng nhập bằng mã PIN để gửi nhé!
          </button>
        )}
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
