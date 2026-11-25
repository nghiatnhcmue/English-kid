import { Edit, Trash2 } from 'lucide-react';
import { resolveQuestionType } from '../../../utils/questionGrading.js';
import QuestionTypeBadge from '../../questions/QuestionTypeBadge.jsx';

export default function QuestionSummaryCard({
  question: q,
  index,
  showSourceTag = false,
  onEdit,
  onDelete,
}) {
  const itemType = resolveQuestionType(q);

  return (
    <div className="rounded-2xl bg-cream/60 p-4 border border-banana-soft hover:bg-cream transition-colors flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-wrap flex-1">
          <span className="rounded-lg bg-peach px-2 py-0.5 text-xs font-black text-white shrink-0">
            Câu {index + 1}
          </span>
          <QuestionTypeBadge type={itemType} />
          {showSourceTag && (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                q.isCustom ? 'bg-mint-soft text-mint-dark' : 'bg-sky-soft text-sky-dark'
              }`}
            >
              {q.isCustom ? '✏️ Thầy/Cô tự soạn' : '📘 Chuẩn SGK'}
            </span>
          )}
          <h4 className="text-sm font-black text-ink leading-snug w-full mt-0.5">{q.question}</h4>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl p-1.5 bg-white text-ink hover:bg-banana transition-all cursor-pointer border border-banana-soft"
              title="Sửa câu hỏi"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl p-1.5 bg-white text-peach-dark hover:bg-rose-500 hover:text-white transition-all cursor-pointer border border-rose-200"
              title="Xóa câu hỏi"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {itemType === 'multiple_choice' && Array.isArray(q.options) && q.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt, oIdx) => {
            const isCorrect = oIdx === q.answerIndex;
            return (
              <div
                key={oIdx}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
                  isCorrect
                    ? 'bg-mint-soft text-mint-dark border-mint font-black'
                    : 'bg-white text-ink border-banana-soft/60'
                }`}
              >
                {String.fromCharCode(65 + oIdx)}. {opt} {isCorrect ? '✓ (Đáp án đúng)' : ''}
              </div>
            );
          })}
        </div>
      )}

      {itemType === 'fill_blank' && (
        <div className="rounded-xl bg-white p-2.5 border border-banana-soft/60 text-xs font-bold text-ink flex items-center gap-2 flex-wrap">
          <span className="text-ink-soft">Từ điền đúng:</span>
          <span className="rounded-lg bg-sky px-2.5 py-0.5 text-ink font-black">
            {q.blankWord || (q.options ? q.options[q.answerIndex] : 'Chưa nhập')}
          </span>
        </div>
      )}

      {itemType === 'unscramble' && (
        <div className="rounded-xl bg-white p-2.5 border border-banana-soft/60 text-xs font-bold text-ink">
          <span className="text-ink-soft">Câu hoàn chỉnh: </span>
          <span className="text-peach-dark font-black">{q.correctSentence || q.question}</span>
        </div>
      )}

      {itemType === 'sentence_completion' && (
        <div className="rounded-xl bg-white p-2.5 border border-banana-soft/60 text-xs font-bold text-ink flex items-center gap-2 flex-wrap">
          <span className="text-ink-soft">Vế hoàn thành đúng:</span>
          <span className="rounded-lg bg-purple-600 px-2.5 py-0.5 text-white font-black">
            {q.correctAnswer || q.blankWord || (q.options ? q.options[q.answerIndex] : 'Chưa nhập')}
          </span>
        </div>
      )}

      {q.explain && (
        <p className="text-[11px] font-bold text-ink-soft bg-banana-soft/50 p-2 rounded-xl">
          💡 Giải thích: {q.explain}
        </p>
      )}
    </div>
  );
}
