import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Save, Volume2 } from 'lucide-react';
import { store } from '../../../utils/storage.js';
import { speak } from '../../../utils/speech.js';
import { parseBatchQuestions } from '../../../utils/questionParser.js';
import QuestionSummaryCard from '../shared/QuestionSummaryCard.jsx';
import QuestionFormModal from '../shared/QuestionFormModal.jsx';
import BatchImportModal from '../shared/BatchImportModal.jsx';

const SAMPLE_READING_BATCH = `Câu 1: Where does Mai go to school?
A. Hanoi
B. Da Nang
C. Ho Chi Minh City
Đáp án: B

Câu 2: What does Mai like studying?
A. Maths and art
B. History and music
Đáp án: A`;

export default function ReadingEditorTab({ unitId, reading = {}, onReload, onNotify }) {
  const [passageTitle, setPassageTitle] = useState(reading?.title || '');
  const [passageText, setPassageText] = useState(reading?.passage || '');
  const [passageTranslation, setPassageTranslation] = useState(reading?.translation || '');

  const [questionModal, setQuestionModal] = useState({
    open: false,
    editIndex: -1,
    initialData: null,
    defaultType: 'multiple_choice',
  });
  const [showBatchModal, setShowBatchModal] = useState(false);

  useEffect(() => {
    setPassageTitle(reading?.title || '');
    setPassageText(reading?.passage || '');
    setPassageTranslation(reading?.translation || '');
  }, [unitId, reading?.title, reading?.passage, reading?.translation]);

  const handleSavePassage = () => {
    store().saveUnitReadingPassage(
      unitId,
      { title: passageTitle, passage: passageText, translation: passageTranslation },
      reading,
    );
    onReload?.();
    onNotify?.('💾 Đã lưu thành công đoạn văn đọc hiểu!', 'mint');
  };

  const handleSaveQuestion = (payload) => {
    store().saveReadingQuestion(unitId, payload, questionModal.editIndex, reading);
    onReload?.();
    onNotify?.(
      questionModal.editIndex >= 0
        ? '✅ Đã cập nhật câu hỏi đọc hiểu!'
        : '🎉 Đã thêm câu hỏi đọc hiểu mới!',
      'mint',
    );
  };

  const handleDeleteQuestion = (idx) => {
    if (!window.confirm('Thầy cô có chắc chắn muốn xóa câu hỏi đọc hiểu này?')) return;
    store().deleteReadingQuestion(unitId, idx, reading);
    onReload?.();
    onNotify?.('🗑️ Đã xóa câu hỏi đọc hiểu!', 'mint');
  };

  const handleBatchImport = (questions) => {
    store().batchAddReadingQuestions(unitId, questions, reading);
    onReload?.();
    onNotify?.(`🎉 Đã thêm thành công ${questions.length} câu hỏi đọc hiểu vào bài!`, 'mint');
  };

  const questions = reading?.questions || [];

  const typeButtons = [
    ['multiple_choice', 'Trắc nghiệm', 'bg-mint text-white shadow-[0_3px_0_#58b292]'],
    ['fill_blank', 'Điền khuyết', 'bg-sky text-ink shadow-[0_3px_0_#60a5fa]'],
    ['unscramble', 'Sắp xếp từ', 'bg-peach text-white shadow-[0_3px_0_#f48265]'],
    ['sentence_completion', 'Viết tiếp câu', 'bg-purple-600 text-white shadow-[0_3px_0_#7e22ce]'],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-black text-ink flex items-center gap-2">
              <span>📖</span>
              <span>Đoạn Văn Đọc Hiểu Skills 1 (Unit {unitId})</span>
            </h3>
            <p className="text-xs font-bold text-ink-soft">
              Bài đọc chính để học sinh luyện đọc thầm, nghe đọc mẫu và trả lời câu hỏi nắm ý
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!passageText.trim()) {
                  onNotify?.('Vui lòng nhập đoạn văn trước khi nghe thử!', 'peach');
                  return;
                }
                speak(passageText, { lang: 'en-GB', rate: 0.85 });
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-soft px-3.5 py-2 text-xs font-black text-sky-dark hover:bg-sky hover:text-ink transition-all cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
              <span>Nghe thử bài đọc</span>
            </button>

            <button
              type="button"
              onClick={handleSavePassage}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-4 py-2 text-xs font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-[0_3px_0_#58b292]"
            >
              <Save className="h-4 w-4" />
              <span>Lưu đoạn văn</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-ink mb-1">Tiêu đề bài đọc (Title - Tùy chọn):</label>
          <input
            type="text"
            value={passageTitle}
            onChange={(e) => setPassageTitle(e.target.value)}
            placeholder="Ví dụ: My New School, A Special Day..."
            className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold text-ink border border-banana-soft"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-ink mb-1 flex items-center justify-between">
            <span>Nội dung đoạn văn tiếng Anh (Passage) (*):</span>
            <span className="text-[11px] font-bold text-ink-soft">
              {passageText.trim().split(/\s+/).filter(Boolean).length} từ
            </span>
          </label>
          <textarea
            rows={6}
            value={passageText}
            onChange={(e) => setPassageText(e.target.value)}
            onBlur={handleSavePassage}
            placeholder="Nhập hoặc dán đoạn văn tiếng Anh vào đây..."
            className="w-full rounded-2xl bg-cream p-4 text-sm font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-ink mb-1">
            Bản dịch nghĩa tiếng Việt (Dành cho học sinh đối chiếu khi cần):
          </label>
          <textarea
            rows={3}
            value={passageTranslation}
            onChange={(e) => setPassageTranslation(e.target.value)}
            onBlur={handleSavePassage}
            placeholder="Nhập bản dịch nghĩa tiếng Việt của đoạn văn..."
            className="w-full rounded-2xl bg-cream p-3 text-xs font-bold text-ink border border-banana-soft resize-none"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-black text-ink flex items-center gap-2">
              <span>❓</span>
              <span>Câu hỏi Đọc hiểu ({questions.length} câu)</span>
            </h3>
            <p className="text-xs font-bold text-ink-soft">
              Các câu hỏi kiểm tra độ hiểu bài, bắt ý chính và chi tiết của đoạn văn
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {typeButtons.map(([type, label, cls]) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setQuestionModal({ open: true, editIndex: -1, initialData: null, defaultType: type })
                }
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-black transition-all cursor-pointer active:translate-y-0.5 active:shadow-none ${cls}`}
              >
                <Plus className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-banana px-3 py-2 text-xs font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-[0_3px_0_var(--color-banana-dark)]"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Dán từ Word</span>
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-banana-soft p-8 text-center flex flex-col items-center gap-2 bg-cream/40">
            <span className="text-4xl">📝</span>
            <p className="text-base font-black text-ink">Chưa có câu hỏi đọc hiểu nào cho Unit này</p>
            <p className="text-xs font-bold text-ink-soft max-w-md">
              Bấm các nút phía trên để tạo câu hỏi trắc nghiệm, điền khuyết, sắp xếp từ hoặc dán từ Word.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {questions.map((q, idx) => (
              <QuestionSummaryCard
                key={idx}
                question={q}
                index={idx}
                onEdit={() =>
                  setQuestionModal({
                    open: true,
                    editIndex: idx,
                    initialData: q,
                    defaultType: q.type || 'multiple_choice',
                  })
                }
                onDelete={() => handleDeleteQuestion(idx)}
              />
            ))}
          </div>
        )}
      </div>

      <QuestionFormModal
        isOpen={questionModal.open}
        onClose={() => setQuestionModal((prev) => ({ ...prev, open: false }))}
        title={
          questionModal.editIndex >= 0
            ? `✏️ Sửa câu hỏi đọc hiểu ${questionModal.editIndex + 1}`
            : '📖 Thêm câu hỏi đọc hiểu mới'
        }
        subtitle={`Unit ${unitId} · Bài tập đọc hiểu chuyên sâu`}
        initialData={questionModal.initialData}
        defaultType={questionModal.defaultType}
        onSave={handleSaveQuestion}
        onError={(msg) => onNotify?.(msg, 'peach')}
      />

      <BatchImportModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title="📋 Dán câu hỏi đọc hiểu hàng loạt từ Word"
        subtitle="Hệ thống tự động phân tách câu hỏi, 4 phương án A, B, C, D và đáp án đúng"
        sampleGuide={SAMPLE_READING_BATCH}
        parser={parseBatchQuestions}
        onImport={handleBatchImport}
      />
    </div>
  );
}
