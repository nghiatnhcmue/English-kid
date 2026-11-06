import { useState } from 'react';
import { Download, ExternalLink, FileText, Maximize2, Minimize2, Upload, X } from 'lucide-react';

export const OFFICIAL_BOOKS = [
  {
    id: 'tap1',
    title: 'SGK Tiếng Anh 6 – Tập 1 (Global Success)',
    shortTitle: 'Tập 1 (Unit 1 - 6)',
    semester: 'Học kỳ I',
    badgeTone: 'bg-banana text-ink',
    desc: 'Gồm trọn vẹn Unit 1 đến Unit 6 (Trang 6 – 69), đối chiếu chuẩn bản in NXB Giáo Dục Việt Nam.',
    src: '/pdf/sgk-tieng-anh-6-tap-1.pdf',
    downloadName: 'SGK-Tieng-Anh-6-Tap-1-Global-Success.pdf',
    fileSize: '16.8 MB',
    pages: '72 trang',
  },
  {
    id: 'tap2',
    title: 'SGK Tiếng Anh 6 – Tập 2 (Global Success)',
    shortTitle: 'Tập 2 (Unit 7 - 12)',
    semester: 'Học kỳ II',
    badgeTone: 'bg-sky text-ink',
    desc: 'Gồm trọn vẹn Unit 7 đến Unit 12 (Trang 6 – 69) kèm các bài Review ôn tập cuối kỳ.',
    src: '/pdf/sgk-tieng-anh-6-tap-2.pdf',
    downloadName: 'SGK-Tieng-Anh-6-Tap-2-Global-Success.pdf',
    fileSize: '16.5 MB',
    pages: '72 trang',
  },
];

export default function PdfReaderModal({ isOpen, onClose, initialBookId = 'tap1' }) {
  if (!isOpen) return null;

  const [activeBookId, setActiveBookId] = useState(initialBookId);
  const [customPdf, setCustomPdf] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const currentBook = customPdf || OFFICIAL_BOOKS.find((b) => b.id === activeBookId) || OFFICIAL_BOOKS[0];

  const handleCustomPdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Vui lòng chọn file định dạng .pdf');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCustomPdf({
      id: 'custom',
      title: file.name,
      shortTitle: 'File PDF tải lên',
      semester: 'Tài liệu riêng',
      badgeTone: 'bg-mint text-white',
      desc: `Tài liệu PDF do Thầy/Cô tự mở từ máy tính (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
      src: objectUrl,
      downloadName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    });
  };

  const handleSelectBook = (bookId) => {
    setCustomPdf(null);
    setActiveBookId(bookId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div
        className={`relative flex w-full flex-col rounded-[2.5rem] bg-white shadow-2xl border-4 border-banana transition-all overflow-hidden ${
          isFullScreen ? 'h-[98vh] max-w-[98vw]' : 'h-[92vh] max-w-6xl'
        }`}
      >
        {/* THANH ĐIỀU HƯỚNG TRÌNH ĐỌC PDF */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-banana-soft p-4 bg-cream/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-banana text-ink text-xl shadow-xs">
              📖
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${currentBook.badgeTone}`}>
                  {currentBook.semester}
                </span>
                {currentBook.fileSize && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-ink-soft border border-banana-soft">
                    {currentBook.fileSize}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-ink mt-0.5 truncate max-w-md">
                {currentBook.title}
              </h3>
            </div>
          </div>

          {/* CÁC NÚT ĐỔI SÁCH & TẢI FILE */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Chuyển nhanh giữa các đầu sách */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-banana-soft">
              {OFFICIAL_BOOKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBook(b.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    !customPdf && activeBookId === b.id
                      ? 'bg-peach text-white shadow-xs'
                      : 'text-ink-soft hover:bg-cream hover:text-ink'
                  }`}
                >
                  {b.shortTitle}
                </button>
              ))}

              {/* Nút mở PDF riêng từ máy */}
              <label className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black text-ink-soft hover:bg-banana-soft cursor-pointer transition-all" title="Mở file PDF từ máy tính của thầy cô">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mở PDF từ máy</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCustomPdfUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Nút tải file PDF trực tiếp về máy */}
            <a
              href={currentBook.src}
              download={currentBook.downloadName}
              className="flex items-center gap-1.5 rounded-xl bg-banana px-3.5 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="Tải file PDF trực tiếp về máy tính"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tải PDF</span>
            </a>

            {/* Nút mở tab mới */}
            <a
              href={currentBook.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-2 text-xs font-black text-ink shadow-xs border border-banana-soft hover:bg-cream transition-all cursor-pointer"
              title="Mở PDF trong tab mới"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* Phóng to toàn màn hình */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="hidden sm:flex items-center justify-center h-8 w-8 rounded-xl bg-white text-ink hover:bg-cream border border-banana-soft transition-all cursor-pointer"
              title={isFullScreen ? 'Thu nhỏ cửa sổ' : 'Xem toàn màn hình'}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Nút đóng */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-ink hover:bg-peach hover:text-white transition-all cursor-pointer font-black text-sm"
              title="Đóng trình đọc sách"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* KHUNG HIỂN THỊ FILE PDF TRỰC TIẾP */}
        <div className="flex-1 w-full bg-slate-800 relative">
          <iframe
            src={`${currentBook.src}#view=FitH&toolbar=1&navpanes=1`}
            title={currentBook.title}
            className="w-full h-full border-0"
          />

          {/* Dải thông báo hỗ trợ cho thiết bị di động */}
          <div className="absolute bottom-2 left-2 right-2 sm:hidden rounded-xl bg-ink/80 text-white p-2 text-center text-[11px] backdrop-blur-xs flex items-center justify-between gap-2">
            <span>Nếu điện thoại không tự mở PDF trong khung:</span>
            <a
              href={currentBook.src}
              target="_blank"
              rel="noopener noreferrer"
              className="font-black underline text-banana"
            >
              Mở Tab Mới ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

