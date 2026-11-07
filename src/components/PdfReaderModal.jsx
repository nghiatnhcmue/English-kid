import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Maximize2, Minimize2, Upload, X, ZoomIn, ZoomOut } from 'lucide-react';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

// Bản scan SGK: trang PDF = trang in trên sách + 1 (trang 1 của file là bìa).
export const PDF_PAGE_OFFSET = 1;
export const bookIdForUnit = (unit) => (Number(unit?.bookVolume) === 2 ? 'tap2' : 'tap1');
export const pdfPageForUnit = (unit) => {
  const start = Number(unit?.bookStartPage) || Number(String(unit?.bookPages || '').match(/\d+/)?.[0]) || 1;
  return start + PDF_PAGE_OFFSET;
};

export const OFFICIAL_BOOKS = [
  {
    id: 'tap1',
    title: 'SGK Tiếng Anh 6 – Tập 1 (Global Success)',
    shortTitle: 'Tập 1 (Unit 1 - 6)',
    semester: 'Học kỳ I',
    badgeTone: 'bg-banana text-ink',
    desc: 'Unit 1 đến Unit 6 và Review 1 – 2 (sách in trang 6 – 71). Bản scan để tra cứu nhanh.',
    src: '/pdf/sgk-tieng-anh-6-tap-1.pdf',
    downloadName: 'SGK-Tieng-Anh-6-Tap-1-Global-Success.pdf',
    fileSize: '16.8 MB',
    pages: '73 trang',
  },
  {
    id: 'tap2',
    title: 'SGK Tiếng Anh 6 – Tập 2 (Global Success)',
    shortTitle: 'Tập 2 (Unit 7 - 12)',
    semester: 'Học kỳ II',
    badgeTone: 'bg-sky text-ink',
    desc: 'Unit 7 đến Unit 12 và Review 3 – 4 (sách in trang 6 – 71). Bản scan để tra cứu nhanh.',
    src: '/pdf/sgk-tieng-anh-6-tap-2.pdf',
    downloadName: 'SGK-Tieng-Anh-6-Tap-2-Global-Success.pdf',
    fileSize: '16.5 MB',
    pages: '73 trang',
  },
];

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
 * initialPage = số trang PDF (đã cộng PDF_PAGE_OFFSET).
 */
function PdfReaderBody({ onClose, initialBookId = 'tap1', initialPage = 1 }) {
  const [activeBookId, setActiveBookId] = useState(initialBookId);
  const [customPdf, setCustomPdf] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(String(Math.max(1, initialPage - PDF_PAGE_OFFSET)));
  const [zoomIdx, setZoomIdx] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [containerWidth, setContainerWidth] = useState(0);
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const renderTaskRef = useRef(null);

  const currentBook = customPdf || OFFICIAL_BOOKS.find((b) => b.id === activeBookId) || OFFICIAL_BOOKS[0];
  const isOfficial = !customPdf;
  const printedPage = isOfficial ? page - PDF_PAGE_OFFSET : page;

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

  // Mở tài liệu (chỉ tải phần cần thiết của file 16MB)
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
    setPageInput(String(isOfficial ? page - PDF_PAGE_OFFSET : page));
  }, [page, isOfficial]);

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
    const target = isOfficial ? n + PDF_PAGE_OFFSET : n;
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
      shortTitle: 'File PDF tải lên',
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
    setPage(bookId === initialBookId ? initialPage : 1 + PDF_PAGE_OFFSET);
  };

  const navBtn =
    'flex h-10 min-w-10 items-center justify-center rounded-xl bg-white px-2 text-ink border border-banana-soft hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

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
        <header className="flex flex-col gap-2 border-b-2 border-banana-soft p-3 sm:p-4 bg-cream/70">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-banana text-lg" aria-hidden>
                📖
              </span>
              <div className="min-w-0">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${currentBook.badgeTone}`}>{currentBook.semester}</span>
                <h3 className="truncate text-sm sm:text-lg font-black text-ink">{currentBook.title}</h3>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <a href={currentBook.src} download={currentBook.downloadName} className={navBtn} title={`Tải PDF (${currentBook.fileSize})`}>
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

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-2xl bg-white p-1 border border-banana-soft">
              {OFFICIAL_BOOKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBook(b.id)}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-black cursor-pointer ${
                    isOfficial && activeBookId === b.id ? 'bg-peach text-white' : 'text-ink-soft hover:bg-cream'
                  }`}
                >
                  {b.shortTitle}
                </button>
              ))}
              <label className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-black text-ink-soft hover:bg-banana-soft cursor-pointer" title="Mở file PDF trong máy">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">PDF trong máy</span>
                <input type="file" accept="application/pdf" onChange={handleCustomPdfUpload} className="hidden" />
              </label>
            </div>

            <div className="flex items-center gap-1.5">
              <button type="button" className={navBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Trang trước">
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
                  className="h-10 w-12 rounded-xl border border-banana-soft bg-white text-center text-sm font-black text-ink"
                />
                <span className="whitespace-nowrap">
                  {printedPage < 1 && isOfficial ? '(bìa)' : `/ ${isOfficial ? Math.max(0, numPages - PDF_PAGE_OFFSET) : numPages}`}
                </span>
              </form>
              <button type="button" className={navBtn} disabled={!numPages || page >= numPages} onClick={() => setPage((p) => Math.min(numPages, p + 1))} aria-label="Trang sau">
                <ChevronRight className="h-5 w-5" />
              </button>
              <button type="button" className={navBtn} disabled={zoomIdx === 0} onClick={() => setZoomIdx((z) => Math.max(0, z - 1))} aria-label="Thu nhỏ">
                <ZoomOut className="h-4 w-4" />
              </button>
              <button type="button" className={navBtn} disabled={zoomIdx === ZOOMS.length - 1} onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))} aria-label="Phóng to">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div ref={viewportRef} className="relative flex-1 overflow-auto bg-slate-700 p-1">
          {status === 'loading' && (
            <p className="absolute inset-x-0 top-10 text-center text-sm font-bold text-white">Đang mở sách… (chỉ tải những trang em xem)</p>
          )}
          {status === 'error' && (
            <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-5 text-center">
              <p className="font-black text-ink">Chưa mở được sách 😢</p>
              <p className="mt-1 text-sm font-bold text-ink-soft">Kiểm tra mạng rồi thử lại, hoặc mở PDF trong tab mới.</p>
              <a href={currentBook.src} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-xl bg-banana px-4 py-2 text-sm font-black text-ink">
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
