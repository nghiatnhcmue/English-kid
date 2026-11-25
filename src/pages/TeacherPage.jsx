import { useState, useEffect, useMemo } from 'react';
import { BookOpen, KeyRound, LogOut } from 'lucide-react';
import { store } from '../utils/storage.js';
import { fetchTeacherScores, deleteScore, clearClassScores } from '../utils/syncService.js';
import { getAuthStatus, logoutTeacher, verifyTeacherSession } from '../utils/api.js';
import { playSfx } from '../utils/sfx.js';
import { PageHeader } from '../components/ui.jsx';
import { OFFICIAL_BOOKS } from '../data/officialBooks.js';
import TeacherAssignmentManager from '../components/TeacherAssignmentManager.jsx';
import TeacherDataEditor from '../components/TeacherDataEditor.jsx';
import TeacherGuide from '../components/TeacherGuide.jsx';
import TeacherStudentManager from '../components/TeacherStudentManager.jsx';
import TeacherClassProgress from '../components/TeacherClassProgress.jsx';
import PdfReaderModal from '../components/PdfReaderModal.jsx';
import TeacherAuthGate from '../components/teacher/dashboard/TeacherAuthGate.jsx';
import TeacherPasswordPanel from '../components/teacher/dashboard/TeacherPasswordPanel.jsx';
import TeacherScoresTab from '../components/teacher/dashboard/TeacherScoresTab.jsx';
import TeacherRoadmapTab from '../components/teacher/dashboard/TeacherRoadmapTab.jsx';
import TeacherLibraryTab from '../components/teacher/dashboard/TeacherLibraryTab.jsx';

export default function TeacherPage() {
  const [teacherSession, setTeacherSession] = useState(() => store().getTeacherSession());
  const [authStatus, setAuthStatus] = useState({ needsSetup: false, setupEnabled: false });
  const [showSettings, setShowSettings] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showPdfReaderModal, setShowPdfReaderModal] = useState(false);
  const [selectedBookForReader, setSelectedBookForReader] = useState('tap1');

  const [activeTab, setActiveTab] = useState('scores');
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [backendStatus, setBackendStatus] = useState({ hasD1: false, isLocalFallback: false });
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let alive = true;
    if (teacherSession) {
      verifyTeacherSession().then((ok) => {
        if (alive && !ok) setTeacherSession(null);
      });
    } else {
      getAuthStatus().then((st) => alive && setAuthStatus(st));
    }
    const onAuth = () => setTeacherSession(store().getTeacherSession());
    window.addEventListener('teacher-auth-changed', onAuth);
    return () => {
      alive = false;
      window.removeEventListener('teacher-auth-changed', onAuth);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScores = async () => {
    setLoading(true);
    const res = await fetchTeacherScores(selectedClass);
    setScores(res.data || []);
    setBackendStatus({
      hasD1: res.hasD1 === true,
      isLocalFallback: res.isLocalFallback || res.hasD1 === false,
      error: res.error,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (teacherSession) loadScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, teacherSession]);

  const classList = useMemo(() => {
    const set = new Set();
    scores.forEach((s) => s.studentClass && set.add(s.studentClass));
    return ['all', ...Array.from(set).sort()];
  }, [scores]);

  const filteredScores = useMemo(() => {
    let list = scores;
    if (selectedClass !== 'all') {
      list = list.filter((s) => s.studentClass === selectedClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) => s.studentName?.toLowerCase().includes(q) || s.studentClass?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [scores, selectedClass, searchQuery]);

  const stats = useMemo(() => {
    if (filteredScores.length === 0) return { total: 0, avg: 0, passRate: 0, topWrong: [] };
    const total = filteredScores.length;
    const sumScore = filteredScores.reduce((acc, s) => acc + (Number(s.score) || 0), 0);
    const avg = (sumScore / total).toFixed(1);
    const passCount = filteredScores.filter((s) => (Number(s.score) || 0) >= 5).length;
    const passRate = Math.round((passCount / total) * 100);

    const wrongMap = {};
    filteredScores.forEach((s) => {
      (Array.isArray(s.wrongWords) ? s.wrongWords : []).forEach((w) => {
        wrongMap[w] = (wrongMap[w] || 0) + 1;
      });
    });
    const topWrong = Object.entries(wrongMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word, count]) => ({ word, count }));

    return { total, avg, passRate, topWrong };
  }, [filteredScores]);

  const handleLogout = async () => {
    if (window.confirm('Thầy/Cô có chắc muốn đăng xuất khỏi Cổng Giáo Viên?')) {
      await logoutTeacher();
      setTeacherSession(null);
      playSfx('click');
      getAuthStatus().then(setAuthStatus);
    }
  };

  const handleDeleteScore = async (id) => {
    if (window.confirm('Thầy cô có chắc muốn xóa bản ghi điểm này không?')) {
      await deleteScore(id);
      loadScores();
    }
  };

  const handleClearClass = async () => {
    if (selectedClass === 'all') return;
    const typed = window.prompt(
      `Xóa TOÀN BỘ điểm của lớp ${selectedClass}? Gõ tên lớp "${selectedClass}" để xác nhận:`,
    );
    if (typed && typed.trim() === selectedClass) {
      const ok = await clearClassScores(selectedClass);
      if (!ok) alert('Chưa xóa được (cần mạng và đăng nhập giáo viên).');
      loadScores();
    }
  };

  const openBookReader = (bookId = 'tap1') => {
    setSelectedBookForReader(bookId);
    setShowPdfReaderModal(true);
  };

  if (!teacherSession) {
    return (
      <TeacherAuthGate
        authStatus={authStatus}
        onAuthenticated={() => setTeacherSession(store().getTeacherSession())}
      />
    );
  }

  const TABS = [
    { id: 'scores', icon: '📊', label: `Bảng Điểm (${filteredScores.length})`, activeCls: 'bg-peach text-white' },
    { id: 'students', icon: '👥', label: 'Tài Khoản Học Sinh', activeCls: 'bg-peach text-white' },
    { id: 'progress_matrix', icon: '📈', label: 'Tiến Độ Cả Lớp', activeCls: 'bg-peach text-white' },
    { id: 'assignments', icon: '📅', label: 'Giao Bài Tập Tuần', activeCls: 'bg-peach text-white' },
    { id: 'editor', icon: '✏️', label: 'Tùy Biến Sâu Data', activeCls: 'bg-peach text-white' },
    { id: 'roadmap', icon: '🗺️', label: 'Lộ Trình Bài Học (Lớp 1-12)', activeCls: 'bg-banana text-ink' },
    { id: 'guide', icon: '📖', label: 'Hướng Dẫn Thầy Cô', activeCls: 'bg-mint text-white' },
    { id: 'library', icon: '📚', label: `Thư Viện SGK & PDF (${OFFICIAL_BOOKS.length} Sách)`, activeCls: 'bg-sky text-ink' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="👨‍🏫 Bảng Điểm & Lộ Trình Giáo Viên"
        subtitle="Quản lý lớp học, theo dõi tiến độ 12 Unit và phân tích kết quả bài test của học sinh"
        backTo="/"
        backLabel="Về trang chủ"
        right={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-xs sm:text-sm font-black text-ink shadow-xs border border-banana-soft">
              <span className="text-base">👨‍🏫</span>
              <span>{teacherSession?.displayName || teacherSession?.username}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-mint px-4 py-2 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>📖 Hướng Dẫn Thầy Cô</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-sm font-black text-ink shadow-xs border border-banana-soft hover:bg-cream cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-peach" />
              <span>Đổi Mật Khẩu</span>
            </button>
            <button
              type="button"
              onClick={loadScores}
              className="rounded-2xl bg-banana px-3.5 py-2 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              🔄 {loading ? '...' : 'Làm mới'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-sm font-black text-peach-dark shadow-xs border border-peach/30 hover:bg-rose-soft cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-3xl bg-gradient-to-r from-mint/20 via-banana/25 to-sky/20 p-4 sm:p-5 border-2 border-mint/50 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-mint text-white text-2xl sm:text-3xl shadow-sm">
            💡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-ink">
                Cẩm Nang &amp; Mẹo Hướng Dẫn Dành Cho Thầy Cô
              </h3>
              <span className="rounded-full bg-peach px-2.5 py-0.5 text-[11px] font-black text-white">Mới</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">
              Cách giao đề ngoài SGK, tải ảnh từ vựng, tự thêm Unit, thu bài học sinh qua Zalo và đọc sách PDF.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-mint px-5 py-3 text-sm sm:text-base font-black text-white shadow-[0_4px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer ring-2 ring-white"
        >
          <BookOpen className="h-5 w-5" />
          <span>📖 Mở Hướng Dẫn Thầy Cô</span>
        </button>
      </div>

      <nav
        aria-label="Tab quản lý giáo viên"
        className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-xs border-2 border-banana-soft overflow-x-auto"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? `${tab.activeCls} shadow-xs` : 'text-ink-soft hover:bg-cream hover:text-ink'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {showSettings && (
        <TeacherPasswordPanel username={teacherSession?.username} onClose={() => setShowSettings(false)} />
      )}

      {activeTab === 'scores' && (
        <TeacherScoresTab
          backendStatus={backendStatus}
          stats={stats}
          classList={classList}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredScores={filteredScores}
          onDeleteScore={handleDeleteScore}
          onClearClass={handleClearClass}
        />
      )}
      {activeTab === 'assignments' && <TeacherAssignmentManager />}
      {activeTab === 'students' && <TeacherStudentManager />}
      {activeTab === 'progress_matrix' && <TeacherClassProgress />}
      {activeTab === 'editor' && <TeacherDataEditor />}
      {activeTab === 'guide' && <TeacherGuide />}
      {activeTab === 'roadmap' && (
        <TeacherRoadmapTab onSwitchToEditor={() => setActiveTab('editor')} onOpenPdf={openBookReader} />
      )}
      {activeTab === 'library' && <TeacherLibraryTab onOpenPdf={openBookReader} />}

      <button
        type="button"
        onClick={() => setShowGuideModal(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-black text-white shadow-xl shadow-mint-dark/30 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0.5 transition-all cursor-pointer border-2 border-white/60"
        title="Bấm để mở cẩm nang hướng dẫn cho Thầy Cô"
      >
        <BookOpen className="h-5 w-5" />
        <span className="hidden sm:inline">📖 Hướng Dẫn Thầy Cô</span>
        <span className="sm:hidden">📖 Hướng dẫn</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative flex w-full max-w-4xl max-h-[92vh] flex-col rounded-[2.5rem] bg-white p-5 sm:p-7 shadow-2xl border-4 border-mint overflow-hidden">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3 pr-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint text-white text-xl shadow-xs">
                  📖
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-ink">
                    Cẩm Nang Hướng Dẫn Dành Cho Thầy Cô
                  </h3>
                  <p className="text-xs font-bold text-ink-soft">
                    Hướng dẫn chi tiết từ A - Z: Giao bài, dán từ Word, tải ảnh từ vựng và quản lý lớp.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink hover:bg-peach hover:text-white transition-all cursor-pointer font-black"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 pr-1">
              <TeacherGuide />
            </div>

            <div className="flex justify-end pt-3 border-t border-banana-soft">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
              >
                Đã hiểu &amp; Tiếp tục làm việc ↵
              </button>
            </div>
          </div>
        </div>
      )}

      <PdfReaderModal
        isOpen={showPdfReaderModal}
        onClose={() => setShowPdfReaderModal(false)}
        initialBookId={selectedBookForReader}
      />
    </div>
  );
}
