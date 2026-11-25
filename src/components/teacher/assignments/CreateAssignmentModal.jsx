import { useMemo, useState } from 'react';
import { Edit, Plus, Sparkles, Trash2 } from 'lucide-react';
import { normUnitId, unitNumberOf } from '../../../utils/unitId.js';
import QuestionSummaryCard from '../shared/QuestionSummaryCard.jsx';

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  units,
  week,
  setWeek,
  title,
  setTitle,
  targetClass,
  setTargetClass,
  unitId,
  onChangeUnitId,
  scopeType,
  setScopeType,
  selectedSkill,
  setSelectedSkill,
  activeUnit,
  selectedWordIds,
  setSelectedWordIds,
  unitQuestions,
  selectedQuestionIndices,
  setSelectedQuestionIndices,
  externalQuestions,
  onOpenAddExternalQuestion,
  onOpenEditExternalQuestion,
  onDeleteExternalQuestion,
  externalPassage,
  setExternalPassage,
  hasPassage,
  setHasPassage,
  deadline,
  setDeadline,
  note,
  setNote,
  onOpenAddUnitQuestion,
  onOpenEditUnitQuestion,
  onDeleteUnitQuestion,
  onOpenBatchImport,
  onSubmit,
}) {
  const [questionFilter, setQuestionFilter] = useState('all');

  const filteredUnitQuestions = useMemo(
    () =>
      unitQuestions
        .map((q, idx) => ({ ...q, originalIndex: idx }))
        .filter((q) => {
          if (questionFilter === 'custom') return q.isCustom;
          if (questionFilter === 'textbook') return !q.isCustom;
          return true;
        }),
    [unitQuestions, questionFilter],
  );

  if (!isOpen) return null;

  const toggleWord = (wId) => {
    setSelectedWordIds((prev) =>
      prev.includes(wId) ? prev.filter((id) => id !== wId) : [...prev, wId],
    );
  };

  const toggleQuestion = (qIdx) => {
    setSelectedQuestionIndices((prev) =>
      prev.includes(qIdx) ? prev.filter((idx) => idx !== qIdx) : [...prev, qIdx],
    );
  };

  const toggleAllWords = () => {
    const allIds = (activeUnit?.vocabularies || []).map((v) => v.id);
    setSelectedWordIds(selectedWordIds.length === allIds.length ? [] : allIds);
  };

  const toggleAllQuestions = () => {
    setSelectedQuestionIndices(
      selectedQuestionIndices.length === unitQuestions.length ? [] : unitQuestions.map((_, i) => i),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-peach flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-ink">🚀 Thiết Kế Bài Tập Tuần Cho Học Sinh</h3>
            <p className="text-xs font-bold text-ink-soft">
              Thầy cô chọn tuần, lớp và tùy chọn nội dung giao bài linh hoạt.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-ink mb-1">Tuần học:</label>
              <select
                value={week}
                onChange={(e) => {
                  const nextWeek = Number(e.target.value);
                  setWeek(nextWeek);
                  setTitle(
                    scopeType === 'external_quiz' || unitId === 0
                      ? `Bài tập Tuần ${nextWeek}: Đề luyện tập ngoài SGK`
                      : `Bài tập Tuần ${nextWeek}: Ôn tập Unit ${unitId}`,
                  );
                }}
                className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-ink mb-1">Áp dụng cho Lớp:</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
              >
                <option value="all">Tất cả các lớp (Toàn khối 6)</option>
                <option value="6A1">Lớp 6A1</option>
                <option value="6A2">Lớp 6A2</option>
                <option value="6A3">Lớp 6A3</option>
                <option value="6A4">Lớp 6A4</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-ink mb-1">Bài học (Unit):</label>
              <select
                value={unitId}
                onChange={(e) => onChangeUnitId(normUnitId(e.target.value) ?? 0)}
                className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
              >
                <option value={0}>🌐 Đề tự do ngoài SGK (Không theo Unit)</option>
                {units.map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    Unit {unitNumberOf(u)}: {u.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1">Tiêu đề bài tập (*):</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
            />
          </div>

          <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft">
            <label className="block text-xs font-black text-ink mb-2">Hình thức giao bài tập:</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'full_unit', label: '🌟 Trọn bộ Unit', desc: 'Đủ 7 trạm + Test' },
                { id: 'skill', label: '🎯 Theo kỹ năng', desc: 'Chỉ định 1 kỹ năng' },
                { id: 'custom_words', label: '📝 Chọn từ vựng', desc: 'Tích chọn vài từ' },
                { id: 'custom_questions', label: '📐 Chọn câu hỏi', desc: 'Câu hỏi của Unit' },
                { id: 'external_quiz', label: '🚀 Đề ngoài SGK', desc: 'Đề riêng, Word, đọc hiểu' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setScopeType(s.id);
                    if (s.id === 'external_quiz' && !title.includes('ngoài SGK')) {
                      setTitle(`Bài tập Tuần ${week}: Đề luyện tập ngoài SGK`);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all cursor-pointer border ${
                    scopeType === s.id
                      ? 'bg-peach text-white border-peach-dark shadow-sm font-black'
                      : 'bg-white text-ink border-banana-soft/60 hover:bg-banana-soft/30 font-bold'
                  }`}
                >
                  <span className="text-xs">{s.label}</span>
                  <span className="text-[10px] opacity-80">{s.desc}</span>
                </button>
              ))}
            </div>

            {scopeType === 'skill' && (
              <div className="mt-3 pt-3 border-t border-banana-soft">
                <label className="block text-xs font-black text-ink mb-1.5">Chọn kỹ năng cụ thể:</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full rounded-xl bg-white px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                >
                  <option value="speaking">🎙️ Luyện Nói &amp; Chấm Điểm AI (Speaking Studio)</option>
                  <option value="listening">👂 Luyện Nghe &amp; Điền Từ (Listening Station)</option>
                  <option value="pronunciation">🗣️ Luyện Phát Âm Cặp Âm (Pronunciation Station)</option>
                  <option value="grammar">📐 Bài Tập Trắc Nghiệm Ngữ Pháp (A Closer Look 2)</option>
                  <option value="reading">📖 Bài Tập Đọc Hiểu (Skills 1)</option>
                  <option value="writing">✍️ Luyện Viết Ghép Câu (Skills 2)</option>
                  <option value="mastery">🏆 Bài Kiểm Tra Thử Thách Tổng Hợp (Unit Mastery)</option>
                </select>
              </div>
            )}

            {scopeType === 'custom_words' && (
              <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-ink">
                    Tích chọn từ vựng cần giao ({selectedWordIds.length}/
                    {activeUnit?.vocabularies?.length || 0}):
                  </span>
                  <button
                    type="button"
                    onClick={toggleAllWords}
                    className="text-xs font-black text-peach hover:underline cursor-pointer"
                  >
                    {selectedWordIds.length === (activeUnit?.vocabularies?.length || 0)
                      ? 'Bỏ chọn tất cả'
                      : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {(activeUnit?.vocabularies || []).map((v) => {
                    const checked = selectedWordIds.includes(v.id);
                    return (
                      <label
                        key={v.id}
                        className={`flex items-center gap-2 rounded-xl p-2 text-xs font-bold border cursor-pointer select-none transition-all ${
                          checked
                            ? 'bg-mint-soft border-mint text-mint-dark font-black'
                            : 'bg-white border-banana-soft text-ink'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleWord(v.id)}
                          className="rounded accent-mint"
                        />
                        {v.image ? (
                          <img
                            src={v.image}
                            alt={v.word}
                            className="h-5 w-5 shrink-0 object-contain rounded-sm"
                          />
                        ) : v.emoji ? (
                          <span>{v.emoji}</span>
                        ) : null}
                        <span>{v.word}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {scopeType === 'custom_questions' && (
              <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-banana-soft">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-ink">
                      Đã chọn: <strong className="text-peach-dark">{selectedQuestionIndices.length}</strong> /{' '}
                      {unitQuestions.length} câu
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setQuestionFilter('all')}
                        className={`px-2 py-0.5 rounded-lg ${
                          questionFilter === 'all' ? 'bg-peach text-white font-black' : 'bg-cream text-ink'
                        }`}
                      >
                        Tất cả ({unitQuestions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionFilter('custom')}
                        className={`px-2 py-0.5 rounded-lg ${
                          questionFilter === 'custom' ? 'bg-peach text-white font-black' : 'bg-cream text-ink'
                        }`}
                      >
                        Tự soạn ({unitQuestions.filter((q) => q.isCustom).length})
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAddUnitQuestion?.(unitId)}
                      className="flex items-center gap-1 rounded-xl bg-mint px-3 py-1.5 text-xs font-black text-white shadow-xs hover:bg-mint-dark transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Soạn câu mới</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenBatchImport?.(unitId)}
                      className="flex items-center gap-1 rounded-xl bg-banana px-3 py-1.5 text-xs font-black text-ink shadow-xs hover:bg-banana-dark transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>⚡ Dán từ Word</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleAllQuestions}
                      className="text-xs font-black text-peach hover:underline cursor-pointer ml-1"
                    >
                      {selectedQuestionIndices.length === unitQuestions.length
                        ? 'Bỏ chọn hết'
                        : 'Chọn tất cả'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {filteredUnitQuestions.length === 0 ? (
                    <div className="text-center p-6 bg-white rounded-2xl border border-dashed border-banana-soft">
                      <p className="text-xs font-bold text-ink-soft">Chưa có câu hỏi nào theo bộ lọc này.</p>
                    </div>
                  ) : (
                    filteredUnitQuestions.map((q) => {
                      const realIdx = q.originalIndex;
                      const checked = selectedQuestionIndices.includes(realIdx);
                      return (
                        <div
                          key={realIdx}
                          className={`rounded-2xl p-3 border-2 transition-all flex flex-col gap-2 ${
                            checked
                              ? 'bg-mint-soft/60 border-mint text-mint-dark'
                              : 'bg-white border-banana-soft text-ink hover:border-banana'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="flex items-start gap-2.5 flex-1 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleQuestion(realIdx)}
                                className="mt-1 rounded accent-mint h-4 w-4"
                              />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-peach-dark text-xs">
                                    Câu {realIdx + 1}:
                                  </span>
                                  <span
                                    className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
                                      q.isCustom ? 'bg-mint text-white' : 'bg-sky-soft text-sky-dark'
                                    }`}
                                  >
                                    {q.isCustom ? '✏️ Tự soạn' : '📘 SGK'}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-ink mt-0.5 leading-relaxed">
                                  {q.question}
                                </p>
                              </div>
                            </label>

                            {q.isCustom && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onOpenEditUnitQuestion?.(unitId, realIdx, q)}
                                  className="rounded-lg p-1 text-ink-soft hover:bg-banana-soft hover:text-ink cursor-pointer"
                                  title="Sửa câu hỏi"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteUnitQuestion?.(unitId, realIdx)}
                                  className="rounded-lg p-1 text-peach-dark hover:bg-peach-soft cursor-pointer"
                                  title="Xóa câu hỏi"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pl-6">
                            {(q.options || []).map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className={`truncate rounded-lg px-2 py-1 text-[11px] font-bold border ${
                                  oIdx === q.answerIndex
                                    ? 'bg-mint text-white border-mint-dark font-black'
                                    : 'bg-white/80 text-ink-soft border-banana-soft/60'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {scopeType === 'external_quiz' && (
              <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-4">
                <div className="rounded-2xl bg-white p-3.5 border border-banana-soft flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasPassage}
                        onChange={(e) => setHasPassage(e.target.checked)}
                        className="rounded accent-peach h-4 w-4"
                      />
                      <span className="text-xs font-black text-ink">
                        📖 Đề bài có kèm theo Đoạn văn Đọc hiểu riêng (Passage ngoài)
                      </span>
                    </label>
                    <span className="text-[11px] font-bold text-ink-soft">
                      (Dành cho đề đọc hiểu 5 - 10 câu)
                    </span>
                  </div>

                  {hasPassage && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60 animate-in fade-in">
                      <input
                        type="text"
                        value={externalPassage.title}
                        onChange={(e) => setExternalPassage({ ...externalPassage, title: e.target.value })}
                        placeholder="Tiêu đề đoạn văn đọc hiểu (vd: A Visit to Cuc Phuong National Park)"
                        className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                      />
                      <textarea
                        rows={3}
                        value={externalPassage.content}
                        onChange={(e) => setExternalPassage({ ...externalPassage, content: e.target.value })}
                        placeholder="Dán hoặc nhập đoạn văn đọc hiểu tiếng Anh vào đây..."
                        className="w-full rounded-xl bg-cream px-3 py-2 text-xs font-bold border border-banana-soft resize-none"
                      />
                      <textarea
                        rows={2}
                        value={externalPassage.translation}
                        onChange={(e) =>
                          setExternalPassage({ ...externalPassage, translation: e.target.value })
                        }
                        placeholder="Bản dịch tiếng Việt tham khảo (Tùy chọn)..."
                        className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft resize-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-banana-soft">
                    <span className="text-xs font-black text-ink">
                      Câu hỏi trong đề: <strong className="text-peach-dark">{externalQuestions.length}</strong>{' '}
                      câu
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        ['multiple_choice', 'Trắc nghiệm', 'bg-mint text-white'],
                        ['fill_blank', 'Điền khuyết', 'bg-sky text-ink'],
                        ['unscramble', 'Sắp xếp từ', 'bg-peach text-white'],
                        ['sentence_completion', 'Viết tiếp', 'bg-purple-600 text-white'],
                      ].map(([t, lbl, cls]) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => onOpenAddExternalQuestion?.(t)}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-xs ${cls}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{lbl}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => onOpenBatchImport?.(0)}
                        className="inline-flex items-center gap-1 rounded-xl bg-banana px-2.5 py-1.5 text-xs font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Dán từ Word</span>
                      </button>
                    </div>
                  </div>

                  {externalQuestions.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 text-center border-2 border-dashed border-banana-soft flex flex-col items-center gap-2">
                      <span className="text-3xl">📝</span>
                      <p className="text-xs font-black text-ink">Đề ngoài SGK này chưa có câu hỏi nào</p>
                      <p className="text-[11px] font-bold text-ink-soft max-w-sm">
                        Bấm các nút bên trên để tạo câu hỏi hoặc dán nhanh đề bài từ Word/PDF.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                      {externalQuestions.map((q, idx) => (
                        <QuestionSummaryCard
                          key={idx}
                          question={q}
                          index={idx}
                          onEdit={() => onOpenEditExternalQuestion?.(q, idx)}
                          onDelete={() => onDeleteExternalQuestion?.(idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-ink mb-1">Hạn chót nộp bài (Deadline):</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-ink mb-1">Lời nhắn / Dặn dò của Thầy Cô:</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Các em nhớ làm cẩn thận để lấy điểm 10 nhé!"
                className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-peach px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              🚀 Tạo &amp; Giao bài ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
