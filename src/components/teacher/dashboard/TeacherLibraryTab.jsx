import { useState, useMemo } from 'react';
import { BookOpen, Download, ExternalLink, Upload } from 'lucide-react';
import { OFFICIAL_BOOKS, getBooksBySchoolLevel } from '../../../data/officialBooks.js';

export default function TeacherLibraryTab({ onOpenPdf }) {
  const [filterLevel, setFilterLevel] = useState('all');
  const filteredBooks = useMemo(() => getBooksBySchoolLevel(filterLevel), [filterLevel]);

  const filterTabs = [
    { id: 'all', label: `Tất cả (${OFFICIAL_BOOKS.length})` },
    { id: 'primary', label: `Tiểu học: Lớp 1-5 (${getBooksBySchoolLevel('primary').length})` },
    { id: 'secondary', label: `THCS: Lớp 6-9 (${getBooksBySchoolLevel('secondary').length})` },
    { id: 'high', label: `THPT: Lớp 10-12 (${getBooksBySchoolLevel('high').length})` },
  ];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-banana-soft pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-banana to-banana-dark text-2xl shadow-xs">
            📄
          </span>
          <div>
            <span className="rounded-full bg-banana-soft px-3 py-0.5 text-xs font-black text-ink-soft">
              Thư viện tài liệu chuẩn NXB Giáo Dục Việt Nam
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink mt-0.5">
              Thư viện Sách Giáo Khoa &amp; Trình Đọc PDF (Toàn bộ {OFFICIAL_BOOKS.length} Sách từ Lớp 1 – 12)
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenPdf?.('tap1')}
          className="inline-flex items-center gap-2 rounded-2xl bg-peach px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          <span>📖 Mở Trình Đọc PDF Toàn Màn Hình</span>
        </button>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-banana-soft via-cream to-mint-soft/50 p-4 border border-banana-soft">
        <p className="text-sm font-black text-ink">
          ✨ Trình đọc PDF đã tích hợp sẵn trọn bộ {OFFICIAL_BOOKS.length} SGK Tiếng Anh Global Success từ Lớp 1
          đến Lớp 12!
        </p>
        <p className="text-xs font-bold text-ink-soft mt-0.5">
          Thầy/Cô bấm &quot;Đọc Sách Trực Tiếp 📖&quot; là xem được ngay trong ứng dụng với bộ lọc cấp học tiện
          lợi, hoặc bấm &quot;Tải PDF&quot; để lưu offline về máy tính.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-banana-soft pb-3">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterLevel(tab.id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              filterLevel === tab.id
                ? 'bg-sky text-ink shadow-xs border-2 border-sky-dark/40 scale-102'
                : 'bg-cream text-ink-soft border border-banana-soft hover:bg-banana/30 hover:text-ink'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBooks.map((book) => {
          const levelLabel =
            book.schoolLevel === 'primary' ? 'Tiểu học' : book.schoolLevel === 'secondary' ? 'THCS' : 'THPT';
          const levelBadgeClass =
            book.schoolLevel === 'primary'
              ? 'bg-emerald-500 text-white'
              : book.schoolLevel === 'secondary'
              ? 'bg-banana text-ink border border-banana-dark/30'
              : 'bg-rose-500 text-white';

          return (
            <div
              key={book.id}
              className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border-2 border-banana-soft shadow-xs hover:shadow-md hover:border-banana transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${levelBadgeClass}`}>
                      {levelLabel} · Lớp {book.grade}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-ink-soft border border-banana-soft">
                      {book.semester}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-ink-soft bg-white px-2 py-0.5 rounded-md border border-banana-soft">
                    {book.fileSize}
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-black text-ink line-clamp-1" title={book.title}>
                  {book.title}
                </h3>
                <p className="text-xs font-bold text-ink-soft mt-1 line-clamp-3 leading-relaxed">{book.desc}</p>
                <div className="mt-2 text-[11px] font-bold text-ink-soft">📄 Quy cách: {book.pages}</div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60">
                <button
                  type="button"
                  onClick={() => onOpenPdf?.(book.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-peach px-3 py-2.5 text-xs font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Đọc Sách Trực Tiếp 📖</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={book.src}
                    download={book.downloadName}
                    className="flex items-center justify-center gap-1 rounded-xl bg-banana px-2.5 py-1.5 text-xs font-black text-ink shadow-2xs hover:bg-banana-dark transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải PDF</span>
                  </a>
                  <a
                    href={book.src}
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
          );
        })}
      </div>

      <div className="mt-3 pt-4 border-t-2 border-banana-soft flex flex-col gap-3">
        <h3 className="text-base font-black text-ink flex items-center gap-2">
          <span>📁</span>
          <span>Tài Liệu Bổ Trợ &amp; Sách Tự Mở (PDF Riêng)</span>
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              tag: 'Bài tập củng cố',
              tagCls: 'bg-mint text-white',
              title: 'Sách Bài Tập (Workbook)',
              desc: 'Bài tập bổ trợ 4 kỹ năng. Thầy/Cô có thể tải file PDF từ máy để đọc trực tiếp.',
              btnCls: 'bg-mint shadow-[0_2px_0_var(--color-mint-dark)]',
              btnLabel: 'Mở PDF từ máy tính 📁',
              sub: 'Hỗ trợ mở mọi file PDF bài tập',
            },
            {
              tag: 'Dành cho Giáo viên',
              tagCls: 'bg-peach text-white',
              title: "Sách Giáo Viên (Teacher's Book)",
              desc: 'Kế hoạch bài dạy (giáo án), phân phối tiết và tài liệu bồi dưỡng.',
              btnCls: 'bg-peach shadow-[0_2px_0_var(--color-peach-dark)]',
              btnLabel: 'Mở PDF Giáo Án / SGV 📁',
              sub: 'Đọc trực tiếp mọi giáo án PDF',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/70 p-4 border-2 border-banana-soft shadow-xs hover:shadow-md transition-all"
            >
              <div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${card.tagCls}`}>
                  {card.tag}
                </span>
                <h3 className="mt-2 text-base font-black text-ink">{card.title}</h3>
                <p className="text-xs font-bold text-ink-soft mt-1">{card.desc}</p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60">
                <button
                  type="button"
                  onClick={() => onOpenPdf?.('tap1')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-black text-white hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer ${card.btnCls}`}
                >
                  <Upload className="h-4 w-4" />
                  <span>{card.btnLabel}</span>
                </button>
                <p className="text-[11px] font-bold text-center text-ink-soft">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
