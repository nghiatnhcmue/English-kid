import { formatViDate } from '../../../utils/dates.js';
import { teacherScoresToCsv, downloadText } from '../../../utils/report.js';

export default function TeacherScoresTab({
  backendStatus,
  stats,
  classList,
  selectedClass,
  setSelectedClass,
  searchQuery,
  setSearchQuery,
  filteredScores,
  onDeleteScore,
  onClearClass,
}) {
  const handleExportCsv = () => {
    const csv = teacherScoresToCsv(filteredScores);
    downloadText(`bang-diem-tieng-anh-6_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="flex flex-col gap-6">
      <section
        className={`rounded-3xl p-5 border-2 ${
          backendStatus.hasD1
            ? 'bg-mint-soft/80 border-mint text-mint-dark'
            : 'bg-banana-soft/80 border-banana-dark/30 text-ink'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{backendStatus.hasD1 ? '🟢' : '🟡'}</span>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                {backendStatus.hasD1
                  ? 'Cloudflare D1 Database: Đang kết nối Online'
                  : 'Chưa cấu hình Cloudflare D1 Database'}
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
            <p className="font-black text-peach mb-1">
              👉 2 bước nhanh để bật D1 trên Cloudflare Dashboard (mất 1 phút):
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Vào Cloudflare Dashboard → <strong>Storage &amp; Databases</strong> →{' '}
                <strong>D1 SQL Database</strong> → Bấm <strong>Create</strong> đặt tên là{' '}
                <code>english-kid-db</code>.
              </li>
              <li>
                Vào <strong>Workers &amp; Pages</strong> → chọn Worker <strong>english-kid</strong> →{' '}
                <strong>Settings</strong> → <strong>Bindings</strong> → Bấm <strong>Add</strong>: Variable
                name đặt là <code>DB</code>, Database chọn <code>english-kid-db</code>. Xong!
              </li>
            </ol>
          </div>
        )}
      </section>

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

      <section className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-ink">Danh sách bài thi ({filteredScores.length})</h3>
          {filteredScores.length > 0 && selectedClass !== 'all' && backendStatus.hasD1 && (
            <button
              type="button"
              onClick={onClearClass}
              className="text-xs font-bold text-peach-dark hover:underline cursor-pointer"
            >
              Xóa điểm lớp {selectedClass}
            </button>
          )}
        </div>

        {filteredScores.length === 0 ? (
          <div className="py-12 text-center font-bold text-ink-soft">
            <span className="text-5xl block mb-2" aria-hidden>
              📝
            </span>
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
                  const units = Array.isArray(row.unitIds)
                    ? row.unitIds.map((u) => `Unit ${u}`).join(', ')
                    : '';

                  return (
                    <tr key={row.id} className="hover:bg-cream/60 transition-colors">
                      <td className="py-3 font-bold text-ink-soft">
                        {row.createdAt ? formatViDate(row.createdAt) : ''}
                      </td>
                      <td className="py-3 font-black text-ink text-base">{row.studentName || 'Học sinh'}</td>
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
                          onClick={() => onDeleteScore?.(row.id)}
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
  );
}
