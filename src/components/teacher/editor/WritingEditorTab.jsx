import { useState } from 'react';
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { store } from '../../../utils/storage.js';
import { parseBatchWriting } from '../../../utils/questionParser.js';
import BatchImportModal from '../shared/BatchImportModal.jsx';

const SAMPLE_WRITING_BATCH = `// Dạng 1: Ghép câu
1. This / is / my / new / calculator
-> Đây là chiếc máy tính cầm tay mới của mình.

// Dạng 2: Điền khuyết
2. She ______ to school by bus every day.
A. go
B. goes
C. going
Đáp án: B`;

export default function WritingEditorTab({
  unitId,
  baseWriting,
  writingItems = [],
  onReload,
  onNotify,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({
    type: 'unscramble',
    sentence: '',
    correctSentence: '',
    blankWord: '',
    options: ['', '', '', ''],
    meaningVi: '',
    hint: '',
  });
  const [showBatchModal, setShowBatchModal] = useState(false);

  const openAdd = (type = 'unscramble') => {
    setEditingIndex(-1);
    setForm({
      type,
      sentence: '',
      correctSentence: '',
      blankWord: '',
      options: ['', '', '', ''],
      meaningVi: '',
      hint: '',
    });
    setShowModal(true);
  };

  const openEdit = (item, idx) => {
    const opts = Array.isArray(item.options) ? [...item.options] : [];
    while (opts.length < 4) opts.push('');
    setEditingIndex(idx);
    setForm({
      type: item.type || 'unscramble',
      sentence: item.sentence || item.correctSentence || '',
      correctSentence: item.correctSentence || item.sentence || '',
      blankWord: item.blankWord || '',
      options: opts,
      meaningVi: item.meaningVi || '',
      hint: item.hint || '',
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const isFill = form.type === 'fill_blank';
    const mainSentence = isFill ? form.sentence.trim() : form.correctSentence.trim();
    if (!mainSentence) {
      onNotify?.(
        isFill ? 'Vui lòng nhập câu có chỗ trống!' : 'Vui lòng nhập câu tiếng Anh hoàn chỉnh!',
        'peach',
      );
      return;
    }
    if (isFill && !form.blankWord.trim()) {
      onNotify?.('Vui lòng nhập từ cần điền đúng vào chỗ trống!', 'peach');
      return;
    }

    const filteredOptions = form.options.map((o) => o.trim()).filter(Boolean);
    if (isFill && form.blankWord.trim() && !filteredOptions.includes(form.blankWord.trim())) {
      filteredOptions.unshift(form.blankWord.trim());
    }

    store().saveWritingItem(
      unitId,
      {
        ...form,
        sentence: mainSentence,
        correctSentence: isFill
          ? mainSentence.replace(/_{2,}/g, form.blankWord.trim()).replace(/\[|\]/g, '')
          : mainSentence,
        options: filteredOptions,
      },
      editingIndex,
      baseWriting,
    );

    setShowModal(false);
    onReload?.();
    onNotify?.(
      editingIndex >= 0
        ? '✅ Đã cập nhật bài tập viết / điền khuyết!'
        : '🎉 Đã thêm bài tập viết / điền khuyết mới!',
      'mint',
    );
  };

  const handleDelete = (idx) => {
    if (!window.confirm('Thầy cô có chắc chắn muốn xóa bài tập này?')) return;
    store().deleteWritingItem(unitId, idx, baseWriting);
    onReload?.();
    onNotify?.('🗑️ Đã xóa bài tập viết!', 'mint');
  };

  const handleBatchImport = (items) => {
    store().batchAddWritingItems(unitId, items, baseWriting);
    onReload?.();
    onNotify?.(`🎉 Đã thêm thành công ${items.length} bài tập viết vào Unit!`, 'mint');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-black text-ink flex items-center gap-2">
              <span>✍️</span>
              <span>Bài tập Viết câu &amp; Điền khuyết Skills 2 ({writingItems.length} câu)</span>
            </h3>
            <p className="text-xs font-bold text-ink-soft">
              Rèn luyện phản xạ ngữ pháp qua dạng bài Ghép từ xáo trộn thành câu và Điền từ vào chỗ trống
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => openAdd('unscramble')}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-3.5 py-2 text-xs font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-[0_3px_0_#58b292]"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm câu ghép từ</span>
            </button>

            <button
              type="button"
              onClick={() => openAdd('fill_blank')}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-sky px-3.5 py-2 text-xs font-black text-ink hover:bg-sky-dark hover:text-white transition-all cursor-pointer shadow-[0_3px_0_var(--color-sky-dark)]"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm câu điền khuyết</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-banana px-3.5 py-2 text-xs font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-[0_3px_0_var(--color-banana-dark)]"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Dán từ Word</span>
            </button>
          </div>
        </div>

        {writingItems.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-banana-soft p-8 text-center flex flex-col items-center gap-2 bg-cream/40">
            <span className="text-4xl">✍️</span>
            <p className="text-base font-black text-ink">Chưa có bài tập viết nào cho Unit này</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {writingItems.map((item, idx) => {
              const isFill = item.type === 'fill_blank';
              return (
                <div
                  key={item.id || idx}
                  className="rounded-2xl bg-cream/60 p-4 border border-banana-soft hover:bg-cream transition-colors flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="rounded-lg bg-banana px-2 py-0.5 text-xs font-black text-ink shrink-0">
                        Câu {idx + 1}
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-black shrink-0 ${
                          isFill
                            ? 'bg-sky-soft text-sky-dark border border-sky/30'
                            : 'bg-mint-soft text-mint-dark border border-mint/30'
                        }`}
                      >
                        {isFill ? '✏️ Điền khuyết (Fill-in-the-blank)' : '🧩 Ghép từ thành câu (Unscramble)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(item, idx)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-ink hover:bg-banana transition-all cursor-pointer border border-banana-soft"
                        title="Sửa câu này"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(idx)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-rose-600 hover:bg-rose-500 hover:text-white transition-all cursor-pointer border border-rose-200"
                        title="Xóa câu này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-banana-soft flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-ink-soft">Câu bài tập:</span>
                      <span className="text-sm font-black text-ink font-mono">
                        {isFill ? item.sentence : item.correctSentence}
                      </span>
                    </div>

                    {isFill && item.blankWord && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-mint-dark">Từ cần điền đúng:</span>
                        <span className="rounded-lg bg-mint-soft px-2 py-0.5 text-xs font-black text-mint-dark font-mono border border-mint">
                          {item.blankWord}
                        </span>
                      </div>
                    )}

                    {!isFill && item.scrambledWords?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-ink-soft">Khối từ xáo trộn:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.scrambledWords.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className="rounded-lg bg-cream px-2 py-0.5 text-xs font-bold text-ink border border-banana-soft"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.meaningVi && (
                      <div className="text-xs font-bold text-ink-soft border-t border-banana-soft/60 pt-1.5 mt-0.5">
                        💡 Nghĩa tiếng Việt: &quot;{item.meaningVi}&quot;
                      </div>
                    )}
                    {item.hint && (
                      <div className="text-[11px] font-bold text-ink-soft">
                        📌 Gợi ý cho học sinh: {item.hint}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-mint flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-xl font-black text-ink">
                  {editingIndex >= 0
                    ? `✏️ Sửa bài viết câu ${editingIndex + 1}`
                    : form.type === 'fill_blank'
                    ? '✏️ Thêm câu hỏi điền khuyết mới'
                    : '🧩 Thêm câu ghép từ xáo trộn mới'}
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Unit {unitId} · Bài tập Viết &amp; Luyện câu Skills 2
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-cream rounded-2xl border border-banana-soft">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'unscramble' })}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  form.type === 'unscramble' ? 'bg-mint text-white shadow-xs' : 'text-ink-soft hover:text-ink'
                }`}
              >
                🧩 Ghép từ xáo trộn thành câu
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'fill_blank' })}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  form.type === 'fill_blank' ? 'bg-sky text-ink shadow-xs' : 'text-ink-soft hover:text-ink'
                }`}
              >
                ✏️ Điền từ vào chỗ trống
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              {form.type === 'unscramble' ? (
                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Câu hoàn chỉnh đúng ngữ pháp (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={form.correctSentence}
                    onChange={(e) => setForm({ ...form, correctSentence: e.target.value })}
                    placeholder="Ví dụ: This is my new calculator"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Câu có chỗ trống (Dùng ______ hoặc [từ_cần_điền]) (*):
                    </label>
                    <input
                      type="text"
                      required
                      value={form.sentence}
                      onChange={(e) => setForm({ ...form, sentence: e.target.value })}
                      placeholder="Ví dụ: She ______ to school by bus every day."
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-ink mb-1">Từ cần điền đúng (*):</label>
                      <input
                        type="text"
                        required
                        value={form.blankWord}
                        onChange={(e) => setForm({ ...form, blankWord: e.target.value })}
                        placeholder="Ví dụ: goes"
                        className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-black border border-banana-soft text-mint-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-ink mb-1">Các từ gợi ý (cách dấu phẩy):</label>
                      <input
                        type="text"
                        value={Array.isArray(form.options) ? form.options.filter(Boolean).join(', ') : ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            options: e.target.value.split(',').map((o) => o.trim()),
                          })
                        }
                        placeholder="Ví dụ: go, goes, going"
                        className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-black text-ink mb-1">Nghĩa tiếng Việt của câu (*):</label>
                <input
                  type="text"
                  required
                  value={form.meaningVi}
                  onChange={(e) => setForm({ ...form, meaningVi: e.target.value })}
                  placeholder="Ví dụ: Đây là chiếc máy tính cầm tay mới của mình."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Gợi ý cho học sinh (Tùy chọn):</label>
                <input
                  type="text"
                  value={form.hint}
                  onChange={(e) => setForm({ ...form, hint: e.target.value })}
                  placeholder="Ví dụ: Bắt đầu bằng đại từ chỉ định This..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_#58b292] cursor-pointer"
                >
                  {editingIndex >= 0 ? 'Lưu thay đổi' : 'Thêm câu bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BatchImportModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title="📋 Dán bài tập Viết & Điền khuyết hàng loạt từ Word"
        subtitle="Hỗ trợ dán câu sắp xếp xáo trộn hoặc câu điền từ vào chỗ trống"
        sampleGuide={SAMPLE_WRITING_BATCH}
        parser={parseBatchWriting}
        onImport={handleBatchImport}
      />
    </div>
  );
}
