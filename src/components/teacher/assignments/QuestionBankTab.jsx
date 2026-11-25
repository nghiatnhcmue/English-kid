import { Plus, Send, Sparkles } from 'lucide-react';
import { normUnitId, unitNumberOf } from '../../../utils/unitId.js';
import QuestionSummaryCard from '../shared/QuestionSummaryCard.jsx';

export default function QuestionBankTab({
  units,
  bankUnitId,
  setBankUnitId,
  bankQuestions,
  onOpenBatch,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onCreateAssignmentForUnit,
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-black text-ink">Chọn Unit:</label>
          <select
            value={bankUnitId}
            onChange={(e) => setBankUnitId(normUnitId(e.target.value))}
            className="rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
          >
            {units.map((u) => (
              <option key={u.unitId} value={u.unitId}>
                Unit {unitNumberOf(u)}: {u.title}
              </option>
            ))}
          </select>
          <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-black text-mint-dark">
            {bankQuestions.length} câu hỏi
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenBatch?.(bankUnitId)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-banana px-3.5 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>⚡ Dán từ Word</span>
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion?.(bankUnitId)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-mint px-4 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Soạn câu hỏi</span>
          </button>
          <button
            type="button"
            onClick={() => onCreateAssignmentForUnit?.(bankUnitId)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-peach px-4 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Giao bài tập Unit này</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {bankQuestions.length === 0 ? (
          <div className="p-8 text-center bg-cream/50 rounded-2xl border border-dashed border-banana-soft">
            <p className="text-sm font-bold text-ink-soft">Unit này chưa có câu hỏi trắc nghiệm nào.</p>
            <button
              type="button"
              onClick={() => onAddQuestion?.(bankUnitId)}
              className="mt-2 text-xs font-black text-peach hover:underline cursor-pointer"
            >
              + Thêm câu hỏi đầu tiên
            </button>
          </div>
        ) : (
          bankQuestions.map((q, idx) => (
            <QuestionSummaryCard
              key={idx}
              question={q}
              index={idx}
              showSourceTag
              onEdit={() => onEditQuestion?.(bankUnitId, idx, q)}
              onDelete={() => onDeleteQuestion?.(bankUnitId, idx)}
            />
          ))
        )}
      </div>
    </div>
  );
}
