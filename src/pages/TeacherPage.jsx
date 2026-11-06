import { useState, useEffect, useMemo, useTransition } from 'react';
import { store } from '../utils/storage.js';
import { fetchTeacherScores, deleteScore, clearAllScores } from '../utils/syncService.js';
import { teacherScoresToCsv, downloadText } from '../utils/report.js';
import { formatViDate } from '../utils/dates.js';
import { Button3D, PageHeader, Stars } from '../components/ui.jsx';

export default function TeacherPage() {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scores, setScores] = useState([]);
  const [backendStatus, setBackendStatus] = useState({ hasD1: false, isLocalFallback: false });
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectItem, setInspectItem] = useState(null);

  const correctPin = store().getTeacherPin();

  const handleUnlock = (e) => {
    e?.preventDefault();
    if (pin.trim() === correctPin) {
      setIsUnlocked(true);
      setPinError(false);
      loadScores();
    } else {
      setPinError(true);
      setPin('');
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
    if (isUnlocked) {
      loadScores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, isUnlocked]);

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

  const handleClearAll = async () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ điểm của tất cả học sinh! Thầy cô có chắc chắn không?')) {
      await clearAllScores();
      loadScores();
    }
  };

  const handleChangePin = () => {
    if (newPin.trim().length >= 4) {
      store().saveTeacherPin(newPin.trim());
      alert('Đã đổi mã PIN thành công!');
      setNewPin('');
      setShowSettings(false);
    } else {
      alert('Mã PIN cần có ít nhất 4 ký tự.');
    }
  };

  // Màn hình khóa PIN
  if (!isUnlocked) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="👨‍🏫 Góc Giáo Viên" backTo="/" backLabel="Về trang chủ" />

        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-[2.5rem] bg-white p-8 text-center shadow-md border-4 border-banana-soft">
          <span className="text-6xl" aria-hidden>🔒</span>
          <div>
            <h2 className="text-2xl font-black text-ink">Khu vực dành cho Thầy Cô</h2>
            <p className="text-sm font-bold text-ink-soft mt-1">
              Nhập mã PIN để xem bảng điểm và kết quả làm bài của học sinh
            </p>
          </div>

          <form onSubmit={handleUnlock} className="flex w-full flex-col gap-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Nhập mã PIN (Mặc định: 1234)"
              className="w-full rounded-2xl bg-cream px-4 py-3 text-center text-2xl font-black tracking-widest text-ink border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana"
              autoFocus
            />

            {pinError && (
              <p className="text-sm font-black text-peach">
                ❌ Mã PIN chưa đúng. Vui lòng thử lại nhé thầy cô!
              </p>
            )}

            <Button3D tone="peach" onClick={handleUnlock} className="w-full py-4 text-lg">
              Mở khóa Bảng điểm 🔓
            </Button3D>
          </form>

          <p className="text-xs font-bold text-ink-soft">
            💡 Gợi ý: Mã PIN mặc định ban đầu là <strong className="text-ink">1234</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="👨‍🏫 Bảng Điểm Giáo Viên"
        subtitle="Theo dõi tiến độ và kết quả làm bài của học sinh"
        backTo="/"
        backLabel="Về trang chủ"
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-ink shadow-xs border border-banana-soft hover:bg-cream cursor-pointer"
            >
              ⚙️ Đổi PIN
            </button>
            <button
              type="button"
              onClick={loadScores}
              className="rounded-2xl bg-banana px-4 py-2 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              🔄 {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        }
      />

      {/* Đổi mã PIN */}
      {showSettings && (
        <section className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft">
          <h3 className="text-lg font-black text-ink mb-2">Đổi mã PIN giáo viên</h3>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Nhập mã PIN mới (ít nhất 4 số)"
              className="rounded-2xl bg-cream px-4 py-2.5 text-base font-bold text-ink border border-banana-soft"
            />
            <Button3D tone="mint" onClick={handleChangePin} className="min-h-12 py-2 px-5 text-sm">
              Lưu mã PIN mới
            </Button3D>
          </div>
        </section>
      )}

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
              <li>Vào <strong>Workers & Pages</strong> → chọn dự án <strong>English-kid</strong> → <strong>Settings</strong> → <strong>Functions</strong> → cuộn xuống <strong>D1 Database Bindings</strong> → Bấm <strong>Add binding</strong>: Variable name đặt là <code>DB</code>, Database chọn <code>english-kid-db</code> vừa tạo. Xong!</li>
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

      {/* Bảng danh sách chi tiết học sinh */}
      <section className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-ink">
            Danh sách bài thi ({filteredScores.length})
          </h3>
          {filteredScores.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold text-peach-dark hover:underline cursor-pointer"
            >
              Xóa tất cả
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

      {/* Thư viện Sách giáo khoa & Tài liệu PDF chuẩn Bộ GD&ĐT */}
      <section className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft">
        <div className="flex items-center gap-3 border-b-2 border-banana-soft pb-4 mb-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-banana to-banana-dark text-2xl shadow-xs">
            📄
          </span>
          <div>
            <span className="rounded-full bg-banana-soft px-3 py-0.5 text-xs font-black text-ink-soft">
              Học liệu chính thức Bộ GD&ĐT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink mt-0.5">
              Thư viện Sách Giáo Khoa & Tài Liệu PDF (Global Success 6)
            </h2>
          </div>
        </div>

        <p className="text-sm sm:text-base font-bold text-ink-soft mb-5">
          Toàn bộ nội dung từ vựng, ngữ pháp và 4 kỹ năng trên web app đều đối chiếu chuẩn xác 100% theo các đầu sách PDF chính thức dưới đây:
        </p>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border border-[#efe3cc] shadow-2xs">
            <div>
              <span className="rounded-full bg-banana px-2.5 py-0.5 text-xs font-black text-ink">
                Học kỳ I
              </span>
              <h3 className="mt-2 text-base font-black text-ink">SGK Tiếng Anh 6 – Tập 1</h3>
              <p className="text-xs font-bold text-ink-soft mt-1">Gồm Unit 1 đến Unit 6 (Trang 6 – 69). Bản số hóa chuẩn NXBGDVN.</p>
            </div>
            <a
              href="https://hanhtrangso.nxbgd.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-banana px-3 text-xs font-black text-ink shadow-2xs hover:scale-102 transition-all cursor-pointer text-center"
            >
              Mở SGK Tập 1 (Hành Trang Số) ↗
            </a>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border border-[#efe3cc] shadow-2xs">
            <div>
              <span className="rounded-full bg-sky px-2.5 py-0.5 text-xs font-black text-ink">
                Học kỳ II
              </span>
              <h3 className="mt-2 text-base font-black text-ink">SGK Tiếng Anh 6 – Tập 2</h3>
              <p className="text-xs font-bold text-ink-soft mt-1">Gồm Unit 7 đến Unit 12 (Trang 6 – 69). Kèm các bài Review củng cố.</p>
            </div>
            <a
              href="https://hoclieu.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-sky px-3 text-xs font-black text-ink shadow-2xs hover:scale-102 transition-all cursor-pointer text-center"
            >
              Mở SGK Tập 2 (Học Liệu VN) ↗
            </a>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border border-[#efe3cc] shadow-2xs">
            <div>
              <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-black text-white">
                Bài tập củng cố
              </span>
              <h3 className="mt-2 text-base font-black text-ink">Sách Bài Tập (Workbook)</h3>
              <p className="text-xs font-bold text-ink-soft mt-1">Bộ bài tập ngữ pháp, đọc hiểu bổ trợ dành cho tự luyện ở nhà.</p>
            </div>
            <a
              href="https://sachhoc.com/sach-giao-khoa-tieng-anh-lop-6-tap-1-phien-ban-moi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-mint px-3 text-xs font-black text-white shadow-2xs hover:scale-102 transition-all cursor-pointer text-center"
            >
              Tải Workbook PDF ↗
            </a>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border border-[#efe3cc] shadow-2xs">
            <div>
              <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
                Dành cho Giáo viên
              </span>
              <h3 className="mt-2 text-base font-black text-ink">Sách Giáo Viên (Teacher's Book)</h3>
              <p className="text-xs font-bold text-ink-soft mt-1">Kế hoạch bài dạy (giáo án), phân phối tiết và hướng dẫn giảng dạy.</p>
            </div>
            <a
              href="https://taphuan.nxbgd.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-peach px-3 text-xs font-black text-white shadow-2xs hover:scale-102 transition-all cursor-pointer text-center"
            >
              Mở Sách Giáo Viên (Tập Huấn) ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

