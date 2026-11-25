import { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

/**
 * Modal dán hàng loạt câu hỏi / bài tập viết từ Word hoặc Zalo có xem trước trực quan.
 * Dùng chung cho: Ngân hàng câu hỏi, Đề ngoài SGK, Bài Đọc hiểu, và Bài Viết câu.
 */
export default function BatchImportModal({
  isOpen,
  onClose,
  title = '⚡ Dán Nhanh Câu Hỏi Từ Word / Zalo',
  subtitle = 'Copy toàn bộ đề bài và dán vào đây, hệ thống sẽ tự động phân tách từng câu!',
  sampleGuide = '',
  placeholder = 'Dán nội dung từ Word vào đây...',
  parser,
  onImport,
  confirmText = (count) => `⚡ Nhập ${count} câu vào bài học`,
}) {
  const [rawText, setRawText] = useState('');
  const [previewList, setPreviewList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setRawText('');
      setPreviewList([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (text) => {
    setRawText(text);
    setPreviewList(parser ? parser(text) : []);
  };

  const handleConfirm = () => {
    const list = previewList.length > 0 ? previewList : parser ? parser(rawText) : [];
    if (!list.length) {
      alert('Chưa có câu hợp lệ nào được nhận diện từ văn bản dán vào.');
      return;
    }
    onImport?.(list);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-banana flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3">
          <div>
            <h3 className="text-xl font-black text-ink">{title}</h3>
            <p className="text-xs font-bold text-ink-soft">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {sampleGuide && (
            <div className="rounded-2xl bg-cream/70 p-3 border border-banana-soft text-xs font-bold text-ink-soft leading-relaxed">
              <span className="font-black text-ink">💡 Định dạng mẫu Word hỗ trợ:</span>
              <pre className="mt-1 font-mono text-[11px] text-ink bg-white p-2 rounded-xl border border-banana-soft/60 whitespace-pre-wrap">
                {sampleGuide}
              </pre>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-ink">Dán văn bản đề bài vào đây (*):</label>
              <span className="text-[11px] font-bold text-peach-dark">
                Đã nhận diện: <strong>{previewList.length}</strong> câu
              </span>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="w-full font-mono rounded-2xl bg-cream p-3.5 text-xs font-bold text-ink border-2 border-banana-soft focus:border-banana focus:outline-none"
            />
          </div>

          {previewList.length > 0 && (
            <div className="rounded-2xl bg-mint-soft/40 p-3 border border-mint text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-mint-dark">
                <CheckCircle2 className="h-4 w-4" />
                <span>Bản xem trước ({previewList.length} câu):</span>
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {previewList.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="rounded-xl bg-white/90 p-2.5 border border-banana-soft text-xs font-bold"
                  >
                    <p className="font-black text-ink">
                      <span className="text-peach-dark mr-1">Câu {qIdx + 1}:</span>
                      {q.question || q.sentence || q.correctSentence}
                      {q.blankWord && (
                        <span className="ml-2 text-mint-dark font-black">(Từ điền: {q.blankWord})</span>
                      )}
                    </p>
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-1.5">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              const next = [...previewList];
                              next[qIdx] = { ...next[qIdx], answerIndex: oIdx };
                              setPreviewList(next);
                            }}
                            className={`truncate rounded-lg px-2 py-1 text-[11px] border text-left cursor-pointer transition-all ${
                              oIdx === q.answerIndex
                                ? 'bg-mint text-white border-mint-dark font-black'
                                : 'bg-cream/60 text-ink border-banana-soft/60 hover:bg-cream'
                            }`}
                            title="Bấm để đặt làm đáp án đúng"
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.answerIndex ? '✓' : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-banana-soft mt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-ink-soft hover:bg-cream cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              disabled={!rawText.trim() && previewList.length === 0}
              onClick={handleConfirm}
              className="flex items-center gap-1.5 rounded-2xl bg-mint px-5 py-2.5 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{typeof confirmText === 'function' ? confirmText(previewList.length) : confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
