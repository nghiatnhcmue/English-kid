import { useState } from 'react';
import { Copy, Send, Trash2, UserCheck } from 'lucide-react';

export function getAssignmentUrl(code) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/#/?assign=${encodeURIComponent(code)}`;
}

export default function AssignmentListTab({
  assignments,
  getSubmissionsFor,
  onInspect,
  onDelete,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [copiedZaloId, setCopiedZaloId] = useState(null);

  const copyLink = (code) => {
    navigator.clipboard?.writeText(getAssignmentUrl(code));
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyZaloMessage = (assign) => {
    const url = getAssignmentUrl(assign.code);
    const msg = `Kính gửi Quý Phụ huynh và các em học sinh lớp ${
      assign.targetClass === 'all' ? '6' : assign.targetClass
    },\nThầy/Cô gửi bài tập tuần này trên ứng dụng English-Kid:\n📌 Bài: ${assign.title}\n⏰ Hạn nộp: ${
      assign.deadline || 'Chủ Nhật tuần này'
    }\n📝 Lời dặn: ${
      assign.note || 'Các em cố gắng hoàn thành tốt nhé!'
    }\n👉 Link làm bài trực tiếp: ${url}\n(Bấm vào link, chọn tên mình và nhập mã PIN thầy cô đã phát là làm được ngay).\nChúc các em học tập vui vẻ!`;
    navigator.clipboard?.writeText(msg);
    setCopiedZaloId(assign.code);
    setTimeout(() => setCopiedZaloId(null), 2500);
  };

  if (assignments.length === 0) {
    return (
      <div className="rounded-3xl bg-cream/70 p-10 text-center border-2 border-dashed border-banana-soft flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">📝</span>
        <h4 className="text-base font-black text-ink">Chưa có bài tập nào được giao</h4>
        <p className="text-xs font-bold text-ink-soft max-w-md">
          Bấm nút <strong>&quot;+ Giao bài tập tuần&quot;</strong> để tạo bài tập, tích chọn câu hỏi trắc
          nghiệm hoặc từ vựng và gửi link Zalo cho học sinh làm bài.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((assign) => {
        const submissions = getSubmissionsFor(assign.id);
        return (
          <div
            key={assign.id}
            className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft flex flex-col justify-between hover:shadow-md transition-all gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
                      Tuần {assign.week}
                    </span>
                    <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-black text-ink border border-banana-soft">
                      Lớp: {assign.targetClass === 'all' ? 'Tất cả các lớp' : assign.targetClass}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-ink mt-1.5">{assign.title}</h4>
                </div>

                <button
                  type="button"
                  onClick={() => onDelete?.(assign.id)}
                  className="rounded-xl p-1.5 text-ink-soft hover:bg-peach-soft hover:text-peach-dark transition-all cursor-pointer"
                  title="Xóa bài tập này"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2.5 space-y-1 text-xs font-bold text-ink-soft bg-cream/60 p-3 rounded-2xl border border-banana-soft/60">
                <p>
                  🎯 <strong>Phạm vi giao:</strong>{' '}
                  {assign.scopeType === 'full_unit' && `Trọn bộ Unit ${assign.unitId} (7 trạm + Thử thách)`}
                  {assign.scopeType === 'skill' &&
                    `Kỹ năng: ${assign.selectedSkill?.toUpperCase()} (Unit ${assign.unitId})`}
                  {assign.scopeType === 'custom_words' &&
                    `${assign.selectedWordIds?.length || 0} từ vựng chỉ định (Unit ${assign.unitId})`}
                  {assign.scopeType === 'custom_questions' &&
                    `${
                      assign.questions?.length || assign.selectedQuestions?.length || 0
                    } câu hỏi trắc nghiệm đã giao (Unit ${assign.unitId})`}
                  {assign.scopeType === 'external_quiz' &&
                    `🚀 Đề tự soạn ngoài SGK (${assign.questions?.length || 0} câu${
                      assign.passage ? ' + Đoạn văn đọc hiểu' : ''
                    })`}
                </p>
                <p>
                  ⏰ <strong>Hạn nộp:</strong> {assign.deadline || 'Không giới hạn'}
                </p>
                {assign.note && <p className="italic">💬 &quot;{assign.note}&quot;</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-banana-soft">
              <div className="flex items-center justify-between text-xs font-black text-ink">
                <button
                  type="button"
                  onClick={() => onInspect?.(assign)}
                  className="flex items-center gap-1.5 text-mint-dark hover:underline cursor-pointer"
                >
                  <UserCheck className="h-4 w-4" /> Đã nộp: {submissions.length} học sinh (Xem chi tiết ↵)
                </button>
                <span className="font-mono text-[11px] bg-banana-soft px-2 py-0.5 rounded-lg text-ink">
                  Mã: {assign.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => copyLink(assign.code)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-banana px-3 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedId === assign.code ? '✓ Đã chép link' : 'Chép link bài'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyZaloMessage(assign)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-sky text-ink px-3 py-2 text-xs font-black shadow-[0_2px_0_var(--color-sky-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{copiedZaloId === assign.code ? '✓ Đã chép tin Zalo' : 'Tin nhắn Zalo'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
