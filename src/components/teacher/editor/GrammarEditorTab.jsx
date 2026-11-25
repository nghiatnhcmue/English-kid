import { useState } from 'react';
import { Plus } from 'lucide-react';
import { store } from '../../../utils/storage.js';
import QuestionSummaryCard from '../shared/QuestionSummaryCard.jsx';
import QuestionFormModal from '../shared/QuestionFormModal.jsx';

export default function GrammarEditorTab({ unitId, grammar = {}, onReload, onNotify }) {
  const [modalState, setModalState] = useState({ open: false, editIndex: -1, initialData: null });
  const quiz = grammar?.quiz || [];

  const handleSave = (payload) => {
    store().saveUnitQuestion(unitId, payload, modalState.editIndex, quiz);
    onReload?.();
    onNotify?.(
      modalState.editIndex >= 0
        ? 'Đã cập nhật câu hỏi trắc nghiệm ngữ pháp!'
        : 'Đã thêm câu hỏi trắc nghiệm ngữ pháp!',
    );
  };

  const handleDelete = (index) => {
    if (!window.confirm('Xóa câu hỏi trắc nghiệm này?')) return;
    store().deleteUnitQuestion(unitId, index, quiz);
    onReload?.();
    onNotify?.('Đã xóa câu hỏi ngữ pháp.', 'peach');
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
        <div>
          <h3 className="text-xl font-black text-ink">📐 Ngữ pháp &amp; Trắc nghiệm Unit {unitId}</h3>
          <p className="text-xs font-bold text-ink-soft mt-0.5">
            Chủ điểm: {grammar?.title || 'Chưa cập nhật'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ open: true, editIndex: -1, initialData: null })}
          className="inline-flex items-center gap-2 rounded-2xl bg-mint px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Thêm câu hỏi trắc nghiệm</span>
        </button>
      </div>

      <div className="space-y-3">
        {quiz.map((q, idx) => (
          <QuestionSummaryCard
            key={idx}
            question={q}
            index={idx}
            onEdit={() => setModalState({ open: true, editIndex: idx, initialData: q })}
            onDelete={() => handleDelete(idx)}
          />
        ))}
      </div>

      <QuestionFormModal
        isOpen={modalState.open}
        onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
        title={modalState.editIndex >= 0 ? '✏️ Sửa câu hỏi ngữ pháp' : '📐 Thêm câu hỏi trắc nghiệm'}
        subtitle={`Unit ${unitId} · Bấm chữ A, B, C, D để chọn đáp án đúng`}
        initialData={modalState.initialData}
        allowedTypes={['multiple_choice']}
        allowSaveAndNext
        onSave={handleSave}
        onError={(msg) => onNotify?.(msg, 'peach')}
      />
    </div>
  );
}
