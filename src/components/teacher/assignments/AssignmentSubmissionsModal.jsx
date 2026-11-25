export default function AssignmentSubmissionsModal({ assignment, submissions = [], onClose }) {
  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-sky flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3">
          <div>
            <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
              Tuần {assignment.week}
            </span>
            <h3 className="text-xl font-black text-ink mt-1">
              📊 Danh Sách Học Sinh Nộp Bài: {assignment.title}
            </h3>
            <p className="text-xs font-bold text-ink-soft">
              Mã bài: {assignment.code} · Hạn: {assignment.deadline || 'Không giới hạn'}
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

        <div className="flex-1 overflow-y-auto">
          {submissions.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-2">
              <span className="text-3xl">⏳</span>
              <p className="text-sm font-black text-ink">Chưa có học sinh nào nộp bài tập này.</p>
              <p className="text-xs font-bold text-ink-soft">
                Thầy/Cô hãy bấm &quot;Tin nhắn Zalo&quot; hoặc &quot;Chép link bài&quot; để gửi cho các em nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-ink-soft px-3 py-1">
                <span>Học sinh</span>
                <span>Điểm &amp; Số câu đúng</span>
              </div>
              {submissions.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl bg-cream/70 p-3 border border-banana-soft"
                >
                  <div>
                    <p className="text-sm font-black text-ink">{s.studentName || 'Học sinh'}</p>
                    <p className="text-xs font-bold text-ink-soft">
                      Lớp: {s.studentClass || '6'} ·{' '}
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : 'Mới nộp'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-xl bg-mint px-3 py-1 text-sm font-black text-white shadow-2xs">
                      {s.score}/10 điểm
                    </span>
                    <p className="text-[11px] font-bold text-ink-soft mt-0.5">
                      {s.correct}/{s.total} câu ({'⭐'.repeat(s.stars || 1)})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-banana-soft">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-cream px-5 py-2 text-xs font-black text-ink hover:bg-banana-soft cursor-pointer"
          >
            Đóng ↵
          </button>
        </div>
      </div>
    </div>
  );
}
