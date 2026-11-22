import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Maximize2, Minimize2, Upload, X, ZoomIn, ZoomOut } from 'lucide-react';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import {
  OFFICIAL_BOOKS,
  SCHOOL_LEVELS,
  findOfficialBook,
  getBooksBySchoolLevel,
  getBooksByGrade,
} from '../data/officialBooks.js';

// Tái xuất danh mục sách và các hàm trợ giúp
export { OFFICIAL_BOOKS, SCHOOL_LEVELS, findOfficialBook, getBooksBySchoolLevel, getBooksByGrade };

// Bản scan SGK: trang PDF = trang in trên sách + độ lệch (số trang bìa/trang lót trước trang 1).
// Đo bằng OCR số trang in ở chân trang của từng file trong public/pdf/.
export const PDF_PAGE_OFFSET = 1;
const PDF_PAGE_OFFSETS = {
  'sgk-4-tap1': 2,
  'sgk-4-tap2': 2,
  'sgk-5-tap1': 2,
  'sgk-7': 2,
  'sgk-11': 2,
  'sgk-12': 2,
};
export const pdfOffsetFor = (bookId) => PDF_PAGE_OFFSETS[bookId] ?? PDF_PAGE_OFFSET;
export const bookIdForUnit = (unit) => {
  if (unit?.bookId) return unit.bookId;
  const grade = Number(unit?.grade) || 6;
  const sem = Number(unit?.semester) || Number(unit?.bookVolume) || 1;
  if (grade === 6) return sem === 2 ? 'tap2' : 'tap1';
  if (grade === 1) return 'sgk-1';
  if (grade === 2) return 'sgk-2';
  if (grade === 3) return 'sgk-3-tap2';
  if (grade === 4) return sem === 2 ? 'sgk-4-tap2' : 'sgk-4-tap1';
  if (grade === 5) return sem === 2 ? 'sgk-5-tap2' : 'sgk-5-tap1';
  return `sgk-${grade}`;
};
export const pdfPageForUnit = (unit) => {
  const start = Number(unit?.bookStartPage) || Number(String(unit?.bookPages || '').match(/\d+/)?.[0]) || 1;
  return start + pdfOffsetFor(bookIdForUnit(unit));
};

let pdfjsPromise;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.min.mjs').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = workerUrl;
      return lib;
    });
  }
  return pdfjsPromise;
}

export default function PdfReaderModal({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <PdfReaderBody {...props} />;
}

const ZOOMS = [1, 1.25, 1.5, 2];

/**
 * Trình đọc PDF vẽ từng trang ra canvas (pdf.js): chạy được trên Android/iOS (iframe PDF thì không),
 * chỉ tải phần trang đang xem nhờ range request, và mở thẳng tới trang của Unit.
 * initialPage = số trang PDF (đã cộng độ lệch của sách, xem pdfOffsetFor).
 */
function PdfReaderBody({ onClose, initialBookId = 'tap1', initialPage = 1 }) {
  const [activeBookId, setActiveBookId] = useState(initialBookId);
  const [levelFilter, setLevelFilter] = useState('all');
  const [customPdf, setCustomPdf] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(String(Math.max(1, initialPage - pdfOffsetFor(initialBookId))));
  const [zoomIdx, setZoomIdx] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [containerWidth, setContainerWidth] = useState(0);
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const renderTaskRef = useRef(null);

  const currentBook = customPdf || findOfficialBook(activeBookId);
  const isOfficial = !customPdf;
  const offset = isOfficial ? pdfOffsetFor(currentBook?.id) : 0;
  const printedPage = page - offset;

  // Đồng bộ activeBookId và levelFilter khi initialBookId thay đổi
  useEffect(() => {
    if (initialBookId) {
      setActiveBookId(initialBookId);
      const b = findOfficialBook(initialBookId);
      if (b?.schoolLevel) {
        setLevelFilter(b.schoolLevel);
      }
    }
  }, [initialBookId]);

  // Đồng bộ trang ban đầu
  useEffect(() => {
    if (initialPage) {
      setPage(initialPage);
    }
  }, [initialPage]);

  // Giải phóng blob URL của file tự mở khi đổi file hoặc đóng trình đọc
  useEffect(() => () => customPdf?.src && URL.revokeObjectURL(customPdf.src), [customPdf]);

  // Đóng bằng phím Esc, lật trang bằng phím mũi tên
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.target?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') setPage((p) => Math.min(numPages || p, p + 1));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(1, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, numPages]);

  // Theo dõi bề rộng khung để vẽ trang vừa khít
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Mở tài liệu (chỉ tải phần cần thiết của file)
  useEffect(() => {
    let cancelled = false;
    let task = null;
    setStatus('loading');
    setDoc(null);
    loadPdfjs()
      .then((pdfjs) => {
        if (cancelled) return null;
        task = pdfjs.getDocument({ url: currentBook.src, disableAutoFetch: true, rangeChunkSize: 262144 });
        return task.promise;
      })
      .then((pdf) => {
        if (cancelled || !pdf) return;
        setDoc(pdf);
        setNumPages(pdf.numPages);
        setPage((p) => Math.min(Math.max(1, p), pdf.numPages));
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
      task?.destroy?.();
    };
  }, [currentBook.src]);

  useEffect(() => {
    setPageInput(String(page - offset));
  }, [page, offset]);

  // Vẽ trang hiện tại
  const renderPage = useCallback(async () => {
    if (!doc || !canvasRef.current || !containerWidth) return;
    try {
      renderTaskRef.current?.cancel();
      const pdfPage = await doc.getPage(page);
      const base = pdfPage.getViewport({ scale: 1 });
      const cssScale = ((containerWidth - 8) / base.width) * ZOOMS[zoomIdx];
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const viewport = pdfPage.getViewport({ scale: cssScale * dpr });
      const canvas = canvasRef.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
      const task = pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport });
      renderTaskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') setStatus('error');
    }
  }, [doc, page, zoomIdx, containerWidth]);

  useEffect(() => {
    renderPage();
    viewportRef.current?.scrollTo?.({ top: 0 });
  }, [renderPage]);

  const goToPrinted = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    const target = n + offset;
    setPage(Math.min(Math.max(1, target), numPages || target));
  };

  const handleCustomPdfUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Vui lòng chọn file định dạng .pdf');
      return;
    }
    setCustomPdf({
      id: 'custom',
      title: file.name,
      shortTitle: 'File PDF riêng',
      semester: 'Tài liệu riêng',
      badgeTone: 'bg-mint text-white',
      src: URL.createObjectURL(file),
      downloadName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    });
    setPage(1);
  };

  const handleSelectBook = (bookId) => {
    setCustomPdf(null);
    setActiveBookId(bookId);
    const b = findOfficialBook(bookId);
    if (b?.schoolLevel && levelFilter !== 'all' && levelFilter !== b.schoolLevel) {
      setLevelFilter(b.schoolLevel);
    }
    setPage(bookId === initialBookId ? initialPage : 1 + pdfOffsetFor(bookId));
  };

  const navBtn =
    'flex h-10 min-w-10 items-center justify-center rounded-xl bg-white px-2 text-ink border border-banana-soft hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors';

  const visibleBooksForPills =
    levelFilter === 'all'
      ? OFFICIAL_BOOKS
      : OFFICIAL_BOOKS.filter((b) => b.schoolLevel === levelFilter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-1 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={currentBook.title}
    >
      <div
        className={`relative flex w-full flex-col rounded-3xl sm:rounded-[2.5rem] bg-white shadow-2xl border-4 border-banana overflow-hidden ${
          isFullScreen ? 'h-[98vh] max-w-[98vw]' : 'h-[96vh] sm:h-[92vh] max-w-5xl'
        }`}
      >
        <header className="flex flex-col gap-2.5 border-b-2 border-banana-soft p-3 sm:p-4 bg-cream/70">
          {/* Hàng 1: Tiêu đề sách, badge thông tin và các nút thao tác chính */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-banana text-lg shadow-2xs" aria-hidden>
                📖
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentBook.schoolLevel && (
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-ink">
                      {currentBook.schoolLevel === 'primary' ? 'Tiểu học' : currentBook.schoolLevel === 'secondary' ? 'THCS' : 'THPT'}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${currentBook.badgeTone}`}>
                    {currentBook.semester}
                  </span>
                  {currentBook.pages && (
                    <span className="text-[11px] font-bold text-ink-soft hidden sm:inline">
                      • {currentBook.pages}
                    </span>
                  )}
                  {currentBook.fileSize && (
                    <span className="text-[11px] font-mono font-bold text-ink-soft hidden md:inline">
                      ({currentBook.fileSize})
                    </span>
                  )}
                </div>
                <h3 className="truncate text-sm sm:text-base md:text-lg font-black text-ink">{currentBook.title}</h3>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <a href={currentBook.src} download={currentBook.downloadName} className={navBtn} title={`Tải PDF (${currentBook.fileSize || ''})`}>
                <Download className="h-4 w-4" />
              </a>
              <a href={currentBook.src} target="_blank" rel="noopener noreferrer" className={navBtn} title="Mở PDF trong tab mới">
                <ExternalLink className="h-4 w-4" />
              </a>
              <button type="button" onClick={() => setIsFullScreen((v) => !v)} className={`${navBtn} hidden sm:flex`} title="Phóng to / thu nhỏ cửa sổ">
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button type="button" onClick={onClose} className={`${navBtn} bg-peach! text-white! border-peach!`} title="Đóng (Esc)" aria-label="Đóng trình đọc sách">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Hàng 2: Bộ chọn 14 SGK và thanh điều hướng trang / thu phóng */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Dropdown chuyển đổi 14 đầu sách */}
              <div className="flex items-center rounded-2xl bg-white p-1 border border-banana-soft shadow-2xs">
                <label htmlFor="official-book-select" className="sr-only">
                  Chọn sách giáo khoa
                </label>
                <select
                  id="official-book-select"
                  value={isOfficial ? currentBook.id : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      handleSelectBook(e.target.value);
                    }
                  }}
                  aria-label="Chọn sách giáo khoa"
                  className="h-8 max-w-[190px] sm:max-w-[240px] md:max-w-[280px] truncate rounded-xl bg-transparent px-2 text-xs font-black text-ink outline-none cursor-pointer hover:bg-cream/60 transition-colors"
                >
                  {customPdf && (
                    <option value="custom">📄 {customPdf.title} (PDF tải lên)</option>
                  )}
                  <optgroup label="🌱 Tiểu học (Lớp 1 – 5)">
                    {OFFICIAL_BOOKS.filter((b) => b.schoolLevel === 'primary').map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortTitle} – {b.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🏫 THCS (Lớp 6 – 8)">
                    {OFFICIAL_BOOKS.filter((b) => b.schoolLevel === 'secondary').map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortTitle} – {b.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🎓 THPT (Lớp 10 – 12)">
                    {OFFICIAL_BOOKS.filter((b) => b.schoolLevel === 'high').map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortTitle} – {b.title}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <label
                  className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-black text-ink-soft hover:bg-banana-soft cursor-pointer transition-colors"
                  title="Mở file PDF trong máy"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">PDF riêng</span>
                  <input type="file" accept="application/pdf" onChange={handleCustomPdfUpload} className="hidden" />
                </label>
              </div>

              {/* Bộ lọc cấp học dạng pill */}
              <div className="hidden xl:flex items-center gap-1 rounded-2xl bg-white/90 p-1 border border-banana-soft/70">
                {SCHOOL_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setLevelFilter(lvl.id)}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-black cursor-pointer transition-colors ${
                      levelFilter === lvl.id ? 'bg-ink text-white shadow-2xs' : 'text-ink-soft hover:bg-cream'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              {/* Các nút chọn nhanh từng cuốn sách */}
              <div className="hidden md:flex items-center gap-1 max-w-[280px] lg:max-w-[340px] xl:max-w-[420px] overflow-x-auto no-scrollbar py-0.5">
                {visibleBooksForPills.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBook(b.id)}
                    title={`${b.title} (${b.pages})`}
                    className={`shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-black cursor-pointer transition-all ${
                      isOfficial && currentBook.id === b.id
                        ? 'bg-peach text-white shadow-2xs'
                        : 'bg-white text-ink-soft border border-banana-soft hover:bg-cream'
                    }`}
                  >
                    {b.shortTitle}
                  </button>
                ))}
              </div>
            </div>

            {/* Điều khiển trang & thu phóng */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={navBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  goToPrinted(pageInput);
                }}
                className="flex items-center gap-1 text-xs font-black text-ink-soft"
              >
                <span>Trang</span>
                <input
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => goToPrinted(pageInput)}
                  inputMode="numeric"
                  aria-label="Số trang"
                  className="h-10 w-12 rounded-xl border border-banana-soft bg-white text-center text-sm font-black text-ink shadow-2xs"
                />
                <span className="whitespace-nowrap">
                  {printedPage < 1 && isOfficial ? '(bìa)' : `/ ${isOfficial ? Math.max(0, numPages - offset) : numPages}`}
                </span>
              </form>
              <button
                type="button"
                className={navBtn}
                disabled={!numPages || page >= numPages}
                onClick={() => setPage((p) => Math.min(numPages, p + 1))}
                aria-label="Trang sau"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                className={navBtn}
                disabled={zoomIdx === 0}
                onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
                aria-label="Thu nhỏ"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={navBtn}
                disabled={zoomIdx === ZOOMS.length - 1}
                onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))}
                aria-label="Phóng to"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div ref={viewportRef} className="relative flex-1 overflow-auto bg-slate-700 p-1">
          {status === 'loading' && (
            <p className="absolute inset-x-0 top-10 text-center text-sm font-bold text-white">
              Đang mở {currentBook.title}… (chỉ tải những trang em xem)
            </p>
          )}
          {status === 'error' && (
            <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-5 text-center shadow-lg">
              <p className="font-black text-ink">Chưa mở được sách 😢</p>
              <p className="mt-1 text-sm font-bold text-ink-soft">Kiểm tra kết nối rồi thử lại, hoặc mở PDF trong tab mới.</p>
              <a
                href={currentBook.src}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-xl bg-banana px-4 py-2 text-sm font-black text-ink hover:bg-banana-dark transition-colors"
              >
                Mở PDF trong tab mới ↗
              </a>
            </div>
          )}
          <canvas ref={canvasRef} className={`mx-auto block bg-white shadow-lg ${status === 'ready' ? '' : 'invisible'}`} />
        </div>
      </div>
    </div>
  );
}
