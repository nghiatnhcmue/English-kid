import { useState, useEffect, useMemo, useTransition } from 'react';
import confetti from 'canvas-confetti';
import { store, totalStarsOf } from '../utils/storage.js';
import { fetchTeacherScores, deleteScore, clearClassScores } from '../utils/syncService.js';
import { changeTeacherPassword, getAuthStatus, loginTeacher, logoutTeacher, setupTeacher, verifyTeacherSession } from '../utils/api.js';
import { teacherScoresToCsv, downloadText } from '../utils/report.js';
import { formatViDate, streakOf } from '../utils/dates.js';
import { listUnits } from '../utils/data.js';
import { wordsByStatus } from '../utils/mastery.js';
import { playSfx } from '../utils/sfx.js';
import { Button3D, PageHeader, Stars } from '../components/ui.jsx';
import { 
  AlertCircle, 
  Award, 
  BookOpen, 
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Upload,
  Eye,
  EyeOff, 
  FileText, 
  KeyRound, 
  Lock, 
  LogIn, 
  LogOut, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Users 
} from 'lucide-react';
import TeacherAssignmentManager from '../components/TeacherAssignmentManager.jsx';
import TeacherDataEditor from '../components/TeacherDataEditor.jsx';
import TeacherGuide from '../components/TeacherGuide.jsx';
import TeacherStudentManager from '../components/TeacherStudentManager.jsx';
import TeacherClassProgress from '../components/TeacherClassProgress.jsx';
import PdfReaderModal from '../components/PdfReaderModal.jsx';

export default function TeacherPage() {
  const [teacherSession, setTeacherSession] = useState(() => store().getTeacherSession());
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authStatus, setAuthStatus] = useState({ needsSetup: false, setupEnabled: false });
  const [busy, setBusy] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Đổi mật khẩu
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showPdfReaderModal, setShowPdfReaderModal] = useState(false);
  const [selectedBookForReader, setSelectedBookForReader] = useState('tap1');

  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'students' | 'progress_matrix' | 'assignments' | 'editor' | 'roadmap' | 'guide' | 'library'
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scores, setScores] = useState([]);
  const [backendStatus, setBackendStatus] = useState({ hasD1: false, isLocalFallback: false });
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectItem, setInspectItem] = useState(null);

  const allUnits = listUnits();
  const currentStudent = store().getStudentInfo();
  const progress = store().getProgress();
  const mastery = store().getMastery();
  const studentStreak = streakOf(progress.studyDays);
  const studentTotalStars = totalStarsOf(progress);
  const masteredCount = wordsByStatus(mastery, 'mastered').length;
  const reviewCount = wordsByStatus(mastery, 'review').length;

  // Phiên giáo viên do máy chủ cấp: mở trang thì hỏi lại máy chủ xem phiên còn hiệu lực không
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

  const afterLogin = () => {
    setTeacherSession(store().getTeacherSession());
    setLoginError('');
    setPasswordInput('');
    setSetupCode('');
    playSfx('victory');
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const handleTeacherLogin = async (e) => {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await loginTeacher(usernameInput, passwordInput);
    setBusy(false);
    if (res.success) afterLogin();
    else {
      playSfx('wrong');
      setLoginError(res.error);
    }
  };

  const handleTeacherSetup = async (e) => {
    e?.preventDefault();
    if (busy) return;
    if (passwordInput.length < 8) return setLoginError('Mật khẩu cần ít nhất 8 ký tự.');
    if (passwordInput !== confirmPassword) return setLoginError('Hai lần nhập mật khẩu chưa khớp.');
    setBusy(true);
    const res = await setupTeacher({ setupCode, username: usernameInput, password: passwordInput, displayName });
    setBusy(false);
    if (res.success) {
      setConfirmPassword('');
      afterLogin();
    } else {
      playSfx('wrong');
      setLoginError(res.error);
    }
  };

  const handleTeacherLogout = async () => {
    if (window.confirm('Thầy/Cô có chắc muốn đăng xuất khỏi Cổng Giáo Viên?')) {
      await logoutTeacher();
      setTeacherSession(null);
      setPasswordInput('');
      setLoginError('');
      playSfx('click');
      getAuthStatus().then(setAuthStatus);
    }
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');
    if (!oldPassword) return setChangePassError('Vui lòng nhập mật khẩu hiện tại!');
    if (newPassword.length < 8) return setChangePassError('Mật khẩu mới cần ít nhất 8 ký tự!');
    if (newPassword !== confirmPassword) return setChangePassError('Xác nhận mật khẩu không khớp!');
    const res = await changeTeacherPassword(oldPassword, newPassword);
    if (res.success) {
      setChangePassSuccess('🎉 Đã đổi mật khẩu. Các máy khác đang đăng nhập tài khoản này đã bị đăng xuất.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowSettings(false);
        setChangePassSuccess('');
      }, 2500);
    } else {
      setChangePassError(res.error);
    }
  };

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
    if (teacherSession) {
      loadScores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, teacherSession]);

  // Danh sách các lớp có trong dữ liệu
  const classList = useMemo(() => {
    const set = new Set();
    scores.forEach((s) => s.studentClass && set.add(s.studentClass));
    return ['all', ...Array.from(set).sort()];
  }, [scores]);

  // Lọc theo tìm kiếm
  const filteredScores = useMemo(() => {
    let list = scores;
    if (selectedClass !== 'all') {
      list = list.filter((s) => s.studentClass === selectedClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.studentName?.toLowerCase().includes(q) ||
          s.studentClass?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [scores, selectedClass, searchQuery]);

  // Thống kê chung
  const stats = useMemo(() => {
    if (filteredScores.length === 0) {
      return { total: 0, avg: 0, passRate: 0, topWrong: [] };
    }
    const total = filteredScores.length;
    const sumScore = filteredScores.reduce((acc, s) => acc + (Number(s.score) || 0), 0);
    const avg = (sumScore / total).toFixed(1);
    const passCount = filteredScores.filter((s) => (Number(s.score) || 0) >= 5).length;
    const passRate = Math.round((passCount / total) * 100);

    // Thống kê các từ hay làm sai nhất
    const wrongMap = {};
    filteredScores.forEach((s) => {
      const words = Array.isArray(s.wrongWords) ? s.wrongWords : [];
      words.forEach((w) => {
        wrongMap[w] = (wrongMap[w] || 0) + 1;
      });
    });
    const topWrong = Object.entries(wrongMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word, count]) => ({ word, count }));

    return { total, avg, passRate, topWrong };
  }, [filteredScores]);

  const handleExportCsv = () => {
    const csv = teacherScoresToCsv(filteredScores);
    downloadText(`bang-diem-tieng-anh-6_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Thầy cô có chắc muốn xóa bản ghi điểm này không?')) {
      await deleteScore(id);
      loadScores();
    }
  };

  // Chỉ xóa điểm của LỚP đang chọn (không còn nút xóa toàn bộ cơ sở dữ liệu)
  const handleClearClass = async () => {
    if (selectedClass === 'all') return;
    const typed = window.prompt(`Xóa TOÀN BỘ điểm của lớp ${selectedClass}? Gõ tên lớp "${selectedClass}" để xác nhận:`);
    if (typed && typed.trim() === selectedClass) {
      const ok = await clearClassScores(selectedClass);
      if (!ok) alert('Chưa xóa được (cần mạng và đăng nhập giáo viên).');
      loadScores();
    }
  };

  // Màn hình Đăng Nhập Giáo Viên (máy chủ kiểm tra tài khoản)
  if (!teacherSession) {
    const isSetup = authStatus.needsSetup;
    const inputCls =
      'w-full rounded-2xl bg-cream px-4 py-3 text-base font-black text-ink border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana';
    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto py-4">
        <PageHeader title="👨‍🏫 Cổng Quản Trị Giáo Viên" backTo="/" backLabel="Về trang chủ" />

        <div className="flex flex-col items-center gap-5 rounded-[2.5rem] bg-white p-7 sm:p-9 shadow-lg border-4 border-banana-soft">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-banana via-banana-light to-amber-200 text-4xl shadow-md border-2 border-banana-dark/20">
              👨‍🏫
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-peach text-white shadow-xs">
              <Lock className="h-4 w-4" />
            </span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-ink">{isSetup ? 'Tạo tài khoản giáo viên' : 'Đăng nhập giáo viên'}</h2>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
              {isSetup
                ? 'Lần đầu dùng: tạo tài khoản quản trị. Cần mã cài đặt (ADMIN_SETUP_CODE) do người quản lý website đặt trên Cloudflare.'
                : 'Quản lý lớp học, giao bài, xem điểm và soạn nội dung. Tài khoản được kiểm tra trên máy chủ.'}
            </p>
          </div>

          {authStatus.offline && (
            <p className="w-full rounded-2xl bg-banana-soft p-3 text-xs font-black text-ink">
              📡 Chưa kết nối được máy chủ. Cổng giáo viên cần có mạng.
            </p>
          )}

          {isSetup && !authStatus.setupEnabled ? (
            <div className="w-full rounded-2xl bg-cream p-4 text-sm font-bold text-ink border-2 border-banana">
              <p className="font-black text-peach-dark">Máy chủ chưa có mã cài đặt.</p>
              <ol className="mt-2 list-decimal list-inside space-y-1 text-xs sm:text-sm">
                <li>
                  Vào Cloudflare Dashboard → Workers &amp; Pages → <strong>english-kid</strong> → Settings → Variables and Secrets.
                </li>
                <li>
                  Bấm <strong>Add</strong>, chọn loại <strong>Secret</strong>, tên <code>ADMIN_SETUP_CODE</code>, giá trị là một mã bí mật do thầy
                  cô tự đặt.
                </li>
                <li>Lưu (Deploy) rồi tải lại trang này và nhập mã đó để tạo tài khoản.</li>
              </ol>
            </div>
          ) : (
            <form onSubmit={isSetup ? handleTeacherSetup : handleTeacherLogin} className="flex w-full flex-col gap-4">
              {isSetup && (
                <>
                  <label className="text-xs font-black text-ink">
                    <span className="mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-mint-dark" /> Mã cài đặt (ADMIN_SETUP_CODE):
                    </span>
                    <input
                      type="password"
                      value={setupCode}
                      onChange={(e) => {
                        setSetupCode(e.target.value);
                        setLoginError('');
                      }}
                      className={inputCls}
                      autoComplete="off"
                    />
                  </label>
                  <label className="text-xs font-black text-ink">
                    <span className="mb-1.5 block">Tên hiển thị (vd: Cô Hiền):</span>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
                  </label>
                </>
              )}
              <label className="text-xs font-black text-ink">
                <span className="mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-sky-dark" /> Tên đăng nhập:
                </span>
                <input
                  type="text"
                  autoCapitalize="none"
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder={isSetup ? 'vd: cohien (chữ thường, không dấu)' : ''}
                  className={inputCls}
                  autoFocus
                />
              </label>
              <label className="text-xs font-black text-ink">
                <span className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-peach" /> Mật khẩu{isSetup ? ' (ít nhất 8 ký tự)' : ''}:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center gap-1 text-[11px] font-black text-ink-soft hover:text-ink cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
                  </button>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSetup ? 'new-password' : 'current-password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  className={inputCls}
                />
              </label>
              {isSetup && (
                <label className="text-xs font-black text-ink">
                  <span className="mb-1.5 block">Nhập lại mật khẩu:</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setLoginError('');
                    }}
                    className={inputCls}
                  />
                </label>
              )}

              {loginError && (
                <div role="alert" className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 border border-rose-200 text-xs sm:text-sm font-black text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <Button3D tone="peach" onClick={isSetup ? handleTeacherSetup : handleTeacherLogin} className="w-full py-4 text-base sm:text-lg mt-1 font-black">
                {busy ? 'Đang kiểm tra…' : isSetup ? 'Tạo tài khoản 🚀' : 'Đăng nhập 🚀'}
              </Button3D>
            </form>
          )}

          <p className="text-xs font-bold text-ink-soft flex items-center gap-1.5 text-center">
            <ShieldCheck className="h-4 w-4 text-mint-dark" />
            <span>Quên mật khẩu? Người quản lý website có thể đặt lại tài khoản trong Cloudflare D1.</span>
          </p>
        </div>
      </div>
    );
  }

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
              title="Bấm xem cẩm nang hướng dẫn sử dụng"
            >
              <BookOpen className="h-4 w-4" />
              <span>📖 Hướng Dẫn Thầy Cô</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-sm font-black text-ink shadow-xs border border-banana-soft hover:bg-cream cursor-pointer"
              title="Đổi mật khẩu tài khoản giáo viên"
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
              onClick={handleTeacherLogout}
              className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-sm font-black text-peach-dark shadow-xs border border-peach/30 hover:bg-rose-soft cursor-pointer"
              title="Đăng xuất khỏi tài khoản giáo viên"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        }
      />

      {/* Banner Nút Hướng Dẫn Giáo Viên Cực Kỳ Nổi Bật & Dễ Thấy Nhất */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-3xl bg-gradient-to-r from-mint/20 via-banana/25 to-sky/20 p-4 sm:p-5 border-2 border-mint/50 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-mint text-white text-2xl sm:text-3xl shadow-sm">
            💡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-ink">
                Cẩm Nang & Mẹo Hướng Dẫn Dành Cho Thầy Cô
              </h3>
              <span className="rounded-full bg-peach px-2.5 py-0.5 text-[11px] font-black text-white">
                Mới
              </span>
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

      {/* Thanh 6 Tab Điều Hướng Giáo Viên */}
      <nav aria-label="Tab quản lý giáo viên" className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-xs border-2 border-banana-soft overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('scores')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'scores'
              ? 'bg-peach text-white shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>📊</span>
          <span>Bảng Điểm ({filteredScores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-peach text-white shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>👥</span>
          <span>Tài Khoản Học Sinh</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress_matrix')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'progress_matrix'
              ? 'bg-peach text-white shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>📈</span>
          <span>Tiến Độ Cả Lớp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-peach text-white shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>📅</span>
          <span>Giao Bài Tập Tuần</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'editor'
              ? 'bg-peach text-white shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>✏️</span>
          <span>Tùy Biến Sâu Data</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'bg-banana text-ink shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>🗺️</span>
          <span>Lộ Trình Bài Học ({allUnits.length} Unit)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-mint text-white shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>📖</span>
          <span>Hướng Dẫn Thầy Cô</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-sky text-ink shadow-xs'
              : 'text-ink-soft hover:bg-cream hover:text-ink'
          }`}
        >
          <span>📚</span>
          <span>Thư Viện SGK & PDF</span>
        </button>
      </nav>

      {/* Đổi Mật Khẩu Giáo Viên (máy chủ kiểm tra mật khẩu cũ) */}
      {showSettings && (
        <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border-2 border-banana-soft flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-banana-soft pb-3">
            <div>
              <h3 className="text-lg font-black text-ink flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-peach" />
                <span>Đổi mật khẩu (tài khoản: {teacherSession?.username})</span>
              </h3>
              <p className="text-xs font-bold text-ink-soft mt-0.5">Đổi xong, các máy khác đang đăng nhập tài khoản này sẽ bị đăng xuất.</p>
            </div>
            <button type="button" onClick={() => setShowSettings(false)} className="text-xs font-black text-ink-soft hover:text-ink cursor-pointer">
              ✕ Đóng
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-3 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['Mật khẩu hiện tại:', oldPassword, setOldPassword, 'current-password'],
                ['Mật khẩu mới (≥ 8 ký tự):', newPassword, setNewPassword, 'new-password'],
                ['Nhập lại mật khẩu mới:', confirmPassword, setConfirmPassword, 'new-password'],
              ].map(([label, value, setter, ac]) => (
                <label key={label} className="block text-xs font-black text-ink">
                  <span className="mb-1 block">{label}</span>
                  <input
                    type="password"
                    autoComplete={ac}
                    value={value}
                    onChange={(e) => {
                      setter(e.target.value);
                      setChangePassError('');
                    }}
                    className="w-full rounded-2xl bg-cream px-3.5 py-2.5 text-sm font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
                  />
                </label>
              ))}
            </div>

            {changePassError && (
              <p className="text-xs font-black text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{changePassError}</span>
              </p>
            )}
            {changePassSuccess && (
              <p className="text-xs font-black text-mint-dark flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{changePassSuccess}</span>
              </p>
            )}

            <div className="pt-1">
              <Button3D tone="mint" onClick={handleChangePassword} className="min-h-11 py-2 px-5 text-sm">
                Lưu mật khẩu mới
              </Button3D>
            </div>
          </form>
        </section>
      )}

      {/* TAB 1: BẢNG ĐIỂM & BÀI TEST */}
      {activeTab === 'scores' && (
        <div className="flex flex-col gap-6">
          {/* Trạng thái kết nối Cloudflare D1 Database */}
          <section className={`rounded-3xl p-5 border-2 ${backendStatus.hasD1 ? 'bg-mint-soft/80 border-mint text-mint-dark' : 'bg-banana-soft/80 border-banana-dark/30 text-ink'}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{backendStatus.hasD1 ? '🟢' : '🟡'}</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    {backendStatus.hasD1 ? 'Cloudflare D1 Database: Đang kết nối Online' : 'Chưa cấu hình Cloudflare D1 Database'}
                  </h3>
                  <p className="text-sm font-bold opacity-85">
                    {backendStatus.hasD1
                      ? 'Điểm số từ mọi thiết bị học sinh đều được đồng bộ tự động lên máy chủ.'
                      : 'Hiện đang hiển thị điểm lưu cục bộ trên máy này. Để xem điểm từ máy học sinh khác qua Cloudflare, chỉ cần bật D1 theo hướng dẫn bên dưới.'}
                  </p>
                </div>
              </div>
            </div>

            {!backendStatus.hasD1 && (
              <div className="mt-3 rounded-2xl bg-white/90 p-4 text-sm font-bold text-ink">
                <p className="font-black text-peach mb-1">👉 2 bước nhanh để bật D1 trên Cloudflare Dashboard (mất 1 phút):</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vào Cloudflare Dashboard → <strong>Storage & Databases</strong> → <strong>D1 SQL Database</strong> → Bấm <strong>Create</strong> đặt tên là <code>english-kid-db</code>.</li>
                  <li>Vào <strong>Workers & Pages</strong> → chọn Worker <strong>english-kid</strong> → <strong>Settings</strong> → <strong>Bindings</strong> (hoặc cuộn xuống <strong>D1 Database Bindings</strong>) → Bấm <strong>Add</strong>: Variable name đặt là <code>DB</code>, Database chọn <code>english-kid-db</code>. Xong!</li>
                </ol>
              </div>
            )}
          </section>

          {/* 4 Thẻ thống kê nhanh */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-white p-5 text-center shadow-xs border-2 border-banana-soft">
              <p className="text-xs sm:text-sm font-black text-ink-soft">Tổng lượt bài test</p>
              <p className="text-3xl sm:text-4xl font-black text-ink mt-1">{stats.total}</p>
            </div>

            <div className="rounded-3xl bg-white p-5 text-center shadow-xs border-2 border-banana-soft">
              <p className="text-xs sm:text-sm font-black text-ink-soft">Điểm trung bình</p>
              <p className="text-3xl sm:text-4xl font-black text-peach mt-1">{stats.avg} / 10</p>
            </div>

            <div className="rounded-3xl bg-white p-5 text-center shadow-xs border-2 border-banana-soft">
              <p className="text-xs sm:text-sm font-black text-ink-soft">Tỷ lệ đạt (≥ 5.0)</p>
              <p className="text-3xl sm:text-4xl font-black text-mint-dark mt-1">{stats.passRate}%</p>
            </div>

            <div className="rounded-3xl bg-white p-5 text-center shadow-xs border-2 border-banana-soft">
              <p className="text-xs sm:text-sm font-black text-ink-soft">Xuất báo cáo</p>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredScores.length === 0}
                className="mt-2 inline-flex items-center gap-1 rounded-2xl bg-sky px-3 py-1.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-sky-dark)] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-40 cursor-pointer"
              >
                ⬇️ Tải Excel (CSV)
              </button>
            </div>
          </section>

          {/* Top các từ vựng học sinh làm sai nhiều nhất */}
          {stats.topWrong.length > 0 && (
            <section className="rounded-3xl bg-white p-5 shadow-xs border-2 border-rose-soft">
              <h3 className="text-lg font-black text-ink mb-2 flex items-center gap-2">
                <span>🔴</span>
                <span>Các từ học sinh hay làm sai nhất (Cần ôn lại trên lớp)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.topWrong.map((item) => (
                  <span
                    key={item.word}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-soft px-3.5 py-1.5 text-sm font-black text-peach-dark border border-peach/20"
                  >
                    <span>{item.word}</span>
                    <span className="rounded-full bg-white px-2 py-0.2 text-xs font-black text-ink">
                      {item.count} em sai
                    </span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Bộ lọc theo Lớp và Ô tìm kiếm học sinh */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-xs border-2 border-banana-soft">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-ink">Lọc lớp:</span>
              {classList.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`rounded-2xl px-3.5 py-1.5 text-sm font-black transition-all cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-peach text-white shadow-[0_3px_0_var(--color-peach-dark)]'
                      : 'bg-cream text-ink-soft hover:bg-banana-soft'
                  }`}
                >
                  {cls === 'all' ? 'Tất cả lớp' : `Lớp ${cls}`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm tên học sinh..."
                className="w-full rounded-2xl bg-cream px-3.5 py-2 text-sm font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
              />
            </div>
          </section>

          {/* Bảng danh sách chi tiết bài thi */}
          <section className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-ink">
                Danh sách bài thi ({filteredScores.length})
              </h3>
              {filteredScores.length > 0 && selectedClass !== 'all' && backendStatus.hasD1 && (
                <button
                  type="button"
                  onClick={handleClearClass}
                  className="text-xs font-bold text-peach-dark hover:underline cursor-pointer"
                >
                  Xóa điểm lớp {selectedClass}
                </button>
              )}
            </div>

            {filteredScores.length === 0 ? (
              <div className="py-12 text-center font-bold text-ink-soft">
                <span className="text-5xl block mb-2" aria-hidden>📝</span>
                Chưa có bài kiểm tra nào trong danh mục này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-banana-soft text-ink-soft">
                      <th className="pb-3 font-black">Thời gian</th>
                      <th className="pb-3 font-black">Họ và tên</th>
                      <th className="pb-3 font-black">Lớp</th>
                      <th className="pb-3 font-black">Bài học</th>
                      <th className="pb-3 font-black">Số câu đúng</th>
                      <th className="pb-3 font-black">Điểm</th>
                      <th className="pb-3 font-black">Từ làm sai</th>
                      <th className="pb-3 font-black text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-banana-soft/50">
                    {filteredScores.map((row) => {
                      const scoreNum = Number(row.score) || 0;
                      const scoreColor =
                        scoreNum >= 8
                          ? 'bg-mint-soft text-mint-dark'
                          : scoreNum >= 5
                            ? 'bg-banana-soft text-ink'
                            : 'bg-rose-soft text-peach-dark';

                      const wrongList = Array.isArray(row.wrongWords) ? row.wrongWords : [];
                      const units = Array.isArray(row.unitIds) ? row.unitIds.map((u) => `Unit ${u}`).join(', ') : '';

                      return (
                        <tr key={row.id} className="hover:bg-cream/60 transition-colors">
                          <td className="py-3 font-bold text-ink-soft">
                            {row.createdAt ? formatViDate(row.createdAt) : ''}
                          </td>
                          <td className="py-3 font-black text-ink text-base">
                            {row.studentName || 'Học sinh'}
                          </td>
                          <td className="py-3 font-black text-ink">
                            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs border border-banana-soft">
                              {row.studentClass || '-'}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-ink-soft">{units}</td>
                          <td className="py-3 font-black text-ink">
                            {row.correct}/{row.total}
                          </td>
                          <td className="py-3">
                            <span className={`inline-block rounded-xl px-2.5 py-1 text-base font-black ${scoreColor}`}>
                              {row.score}
                            </span>
                          </td>
                          <td className="py-3 max-w-xs truncate font-bold text-peach">
                            {wrongList.length > 0 ? wrongList.join(', ') : '✓ Không sai'}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(row.id)}
                              className="rounded-xl px-2.5 py-1 text-xs font-bold text-peach-dark hover:bg-rose-soft cursor-pointer transition-colors"
                              title="Xóa bài thi này"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB GIAO BÀI TẬP THEO TUẦN */}
      {activeTab === 'assignments' && <TeacherAssignmentManager />}

      {/* TAB QUẢN LÝ TÀI KHOẢN HỌC SINH */}
      {activeTab === 'students' && <TeacherStudentManager />}

      {/* TAB MA TRẬN TIẾN ĐỘ CẢ LỚP */}
      {activeTab === 'progress_matrix' && <TeacherClassProgress />}

      {/* TAB TÙY BIẾN SÂU DATA */}
      {activeTab === 'editor' && <TeacherDataEditor />}

      {/* TAB HƯỚNG DẪN THẦY CÔ */}
      {activeTab === 'guide' && <TeacherGuide />}

      {/* TAB 2: THEO DÕI LỘ TRÌNH 12 UNIT CỦA HỌC SINH */}
      {activeTab === 'roadmap' && (
        <div className="flex flex-col gap-6">
          {/* Thẻ Tổng quan Hồ Sơ Học Sinh */}
          <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-banana text-4xl shadow-sm">
                {currentStudent.avatar || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-ink">
                    {currentStudent.name || 'Chưa đặt tên'}
                  </h3>
                  <span className="rounded-full bg-cream px-3 py-0.5 text-xs font-black text-ink-soft border border-banana-soft">
                    {currentStudent.class ? `Lớp ${currentStudent.class}` : 'Chưa chọn lớp'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">
                  Thiết bị học tập hiện tại · Tiến độ lưu an toàn trong hệ thống
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial rounded-2xl bg-cream p-3 text-center border border-banana-soft">
                <span className="text-xs font-black text-ink-soft block">Tổng số sao</span>
                <span className="text-xl font-black text-ink">⭐ {studentTotalStars}</span>
              </div>
              <div className="flex-1 sm:flex-initial rounded-2xl bg-cream p-3 text-center border border-banana-soft">
                <span className="text-xs font-black text-ink-soft block">Chuỗi học tập</span>
                <span className="text-xl font-black text-peach-dark">🔥 {studentStreak} ngày</span>
              </div>
              <div className="flex-1 sm:flex-initial rounded-2xl bg-cream p-3 text-center border border-banana-soft">
                <span className="text-xs font-black text-ink-soft block">Từ vựng đã thuộc</span>
                <span className="text-xl font-black text-mint-dark">✓ {masteredCount} từ</span>
              </div>
            </div>
          </section>

          {/* Ma Trận Tiến Độ 12 Unit */}
          <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-ink">
                  Tiến Độ Chi Tiết Các Unit ({allUnits.length} Bài học)
                </h3>
                <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">
                  Theo dõi học sinh đã hoàn thành những trạm kỹ năng nào trong từng bài học
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-2xl bg-mint px-4 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-mint-dark transition-all shadow-[0_3px_0_#58b292] active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <span>➕ Thêm / Chỉnh Sửa Unit</span>
              </button>
            </div>

            <div className="grid gap-3">
              {allUnits.map((u) => {
                const uProg = progress.units[u.unitId]?.modes || {};
                const uStars = Object.values(uProg).reduce((a, b) => a + b, 0);
                const hasVocab = (uProg.flashcard || 0) > 0;
                const hasGrammar = (uProg.grammar || 0) > 0;
                const hasSpeaking = (uProg.speaking || 0) > 0;
                const hasListening = (uProg.listenstation || 0) > 0 || (uProg.listening || 0) > 0;
                const hasReading = (uProg.reading || 0) > 0;
                const hasWriting = (uProg.writing || 0) > 0;
                const hasMastery = (uProg.mastery || 0) > 0;

                const completedStations = [hasVocab, hasGrammar, hasSpeaking, hasListening, hasReading, hasWriting, hasMastery].filter(Boolean).length;

                return (
                  <div
                    key={u.unitId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-cream/50 p-4 border border-banana-soft hover:bg-cream transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl shrink-0" aria-hidden>{u.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-ink">
                            Unit {u.unitId}: {u.titleEn}
                          </h4>
                          <span className="text-xs font-bold text-ink-soft">({u.titleVi})</span>
                        </div>
                        {/* 7 Badge Trạm Kỹ năng */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${hasVocab ? 'bg-mint text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {hasVocab ? '✓' : '○'} Từ vựng
                          </span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${hasGrammar ? 'bg-mint text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {hasGrammar ? '✓' : '○'} Ngữ pháp
                          </span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${hasListening ? 'bg-mint text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {hasListening ? '✓' : '○'} Nghe
                          </span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${hasSpeaking ? 'bg-mint text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {hasSpeaking ? '✓' : '○'} Nói
                          </span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${hasReading ? 'bg-mint text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {hasReading ? '✓' : '○'} Đọc
                          </span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${hasWriting ? 'bg-mint text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {hasWriting ? '✓' : '○'} Viết
                          </span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${hasMastery ? 'bg-peach text-white shadow-2xs' : 'bg-gray-200 text-gray-500'}`}>
                            {hasMastery ? '★ Bài tập Unit' : '○ Bài tập'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-black text-ink-soft block">Tiến độ trạm</span>
                        <span className="text-sm font-black text-ink">{completedStations} / 7 Trạm</span>
                      </div>
                      <Button3D
                        tone="banana"
                        to={`/unit/${u.unitId}`}
                        className="px-3.5 py-1.5 text-xs"
                      >
                        Xem Unit →
                      </Button3D>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: THƯ VIỆN SGK & PHÂN PHỐI */}
      {activeTab === 'library' && (
        <section className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-banana-soft pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-banana to-banana-dark text-2xl shadow-xs">
                📄
              </span>
              <div>
                <span className="rounded-full bg-banana-soft px-3 py-0.5 text-xs font-black text-ink-soft">
                  Bản scan SGK để tra cứu
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-ink mt-0.5">
                  Thư viện Sách Giáo Khoa & Trình Đọc PDF (Global Success 6)
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedBookForReader('tap1');
                setShowPdfReaderModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-peach px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <BookOpen className="h-4 w-4" />
              <span>📖 Mở Trình Đọc PDF Toàn Màn Hình</span>
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-banana-soft via-cream to-mint-soft/50 p-4 border border-banana-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-ink">
                ✨ Trình đọc PDF đã tích hợp sẵn trọn bộ SGK Tiếng Anh 6 Tập 1 & Tập 2!
              </p>
              <p className="text-xs font-bold text-ink-soft mt-0.5">
                Thầy/Cô bấm "Đọc sách trực tiếp" là xem được ngay trong ứng dụng, hoặc bấm "Tải PDF" để lưu offline về máy tính.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* SGK TẬP 1 */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border-2 border-banana-soft shadow-xs hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-banana px-2.5 py-0.5 text-xs font-black text-ink">
                    Học kỳ I
                  </span>
                  <span className="text-[11px] font-mono font-bold text-ink-soft bg-white px-2 py-0.5 rounded-md border border-banana-soft">
                    16.8 MB
                  </span>
                </div>
                <h3 className="mt-2 text-base font-black text-ink">SGK Tiếng Anh 6 – Tập 1</h3>
                <p className="text-xs font-bold text-ink-soft mt-1">Gồm Unit 1 đến Unit 6 và Review 1–2 (sách in trang 6 – 71). Bản scan, không phải file gốc của NXB.</p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookForReader('tap1');
                    setShowPdfReaderModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-peach px-3 py-2.5 text-xs font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Đọc Sách Trực Tiếp 📖</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/pdf/sgk-tieng-anh-6-tap-1.pdf"
                    download="SGK-Tieng-Anh-6-Tap-1-Global-Success.pdf"
                    className="flex items-center justify-center gap-1 rounded-xl bg-banana px-2.5 py-1.5 text-xs font-black text-ink shadow-2xs hover:bg-banana-dark transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải PDF</span>
                  </a>
                  <a
                    href="/pdf/sgk-tieng-anh-6-tap-1.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-black text-ink border border-banana-soft hover:bg-cream transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Tab mới</span>
                  </a>
                </div>
              </div>
            </div>

            {/* SGK TẬP 2 */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border-2 border-banana-soft shadow-xs hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-sky px-2.5 py-0.5 text-xs font-black text-ink">
                    Học kỳ II
                  </span>
                  <span className="text-[11px] font-mono font-bold text-ink-soft bg-white px-2 py-0.5 rounded-md border border-banana-soft">
                    16.5 MB
                  </span>
                </div>
                <h3 className="mt-2 text-base font-black text-ink">SGK Tiếng Anh 6 – Tập 2</h3>
                <p className="text-xs font-bold text-ink-soft mt-1">Gồm Unit 7 đến Unit 12 và Review 3–4 (sách in trang 6 – 71).</p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookForReader('tap2');
                    setShowPdfReaderModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-peach px-3 py-2.5 text-xs font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Đọc Sách Trực Tiếp 📖</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/pdf/sgk-tieng-anh-6-tap-2.pdf"
                    download="SGK-Tieng-Anh-6-Tap-2-Global-Success.pdf"
                    className="flex items-center justify-center gap-1 rounded-xl bg-sky px-2.5 py-1.5 text-xs font-black text-ink shadow-2xs hover:bg-sky-dark transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải PDF</span>
                  </a>
                  <a
                    href="/pdf/sgk-tieng-anh-6-tap-2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-black text-ink border border-banana-soft hover:bg-cream transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Tab mới</span>
                  </a>
                </div>
              </div>
            </div>

            {/* SÁCH BÀI TẬP (WORKBOOK) */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border-2 border-banana-soft shadow-xs hover:shadow-md transition-all">
              <div>
                <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-black text-white">
                  Bài tập củng cố
                </span>
                <h3 className="mt-2 text-base font-black text-ink">Sách Bài Tập (Workbook)</h3>
                <p className="text-xs font-bold text-ink-soft mt-1">Bài tập bổ trợ 4 kỹ năng. Thầy/Cô có thể tải file PDF từ máy để đọc trực tiếp.</p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookForReader('tap1');
                    setShowPdfReaderModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-mint px-3 py-2.5 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Mở PDF từ máy tính 📁</span>
                </button>
                <p className="text-[11px] font-bold text-center text-ink-soft">
                  Hỗ trợ mở mọi file PDF bài tập
                </p>
              </div>
            </div>

            {/* SÁCH GIÁO VIÊN */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border-2 border-banana-soft shadow-xs hover:shadow-md transition-all">
              <div>
                <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
                  Dành cho Giáo viên
                </span>
                <h3 className="mt-2 text-base font-black text-ink">Sách Giáo Viên (Teacher's Book)</h3>
                <p className="text-xs font-bold text-ink-soft mt-1">Kế hoạch bài dạy (giáo án), phân phối tiết và tài liệu bồi dưỡng.</p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookForReader('tap1');
                    setShowPdfReaderModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-peach px-3 py-2.5 text-xs font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Mở PDF Giáo Án / SGV 📁</span>
                </button>
                <p className="text-[11px] font-bold text-center text-ink-soft">
                  Đọc trực tiếp mọi giáo án PDF
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nút Hướng Dẫn Nổi Cố Định Ở Góc Dưới - Luôn hiển thị dù thầy cô cuộn trang tới đâu */}
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

      {/* Modal Hướng Dẫn Thầy Cô Toàn Diện */}
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
                Đã hiểu & Tiếp tục làm việc ↵
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trình Đọc Sách PDF Tích Hợp Sẵn */}
      <PdfReaderModal
        isOpen={showPdfReaderModal}
        onClose={() => setShowPdfReaderModal(false)}
        initialBookId={selectedBookForReader}
      />
    </div>
  );
}

