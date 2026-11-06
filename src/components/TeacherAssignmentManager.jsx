import { useState, useMemo } from 'react';
import { getUnit, listUnits } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { 
  Calendar, 
  Check, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ExternalLink, 
  Filter, 
  Layers, 
  ListChecks, 
  Plus, 
  Send, 
  Trash2, 
  UserCheck, 
  Users 
} from 'lucide-react';

export default function TeacherAssignmentManager() {
  const units = listUnits();
  const [assignments, setAssignments] = useState(() => store().getAssignments());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectAssignment, setInspectAssignment] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedZaloId, setCopiedZaloId] = useState(null);

  // Form State
  const [week, setWeek] = useState(1);
  const [title, setTitle] = useState('');
  const [targetClass, setTargetClass] = useState('all');
  const [unitId, setUnitId] = useState(1);
  const [scopeType, setScopeType] = useState('full_unit'); // 'full_unit' | 'skill' | 'custom_words' | 'custom_questions'
  const [selectedSkill, setSelectedSkill] = useState('speaking'); // 'speaking' | 'listening' | 'pronunciation' | 'grammar' | 'reading' | 'writing' | 'mastery'
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [note, setNote] = useState('Các em hoàn thành trước hạn nộp và cố gắng đạt điểm 10 nhé!');

  const activeUnit = useMemo(() => getUnit(unitId), [unitId]);

  const reloadAssignments = () => {
    setAssignments(store().getAssignments());
  };

  const handleOpenCreate = () => {
    setTitle(`Bài tập Tuần ${week}: Ôn tập Unit ${unitId}`);
    setSelectedWordIds([]);
    setSelectedQuestionIndices([]);
    setShowCreateModal(true);
  };

  const handleToggleWord = (wId) => {
    setSelectedWordIds((prev) =>
      prev.includes(wId) ? prev.filter((id) => id !== wId) : [...prev, wId]
    );
  };

  const handleToggleQuestion = (qIdx) => {
    setSelectedQuestionIndices((prev) =>
      prev.includes(qIdx) ? prev.filter((idx) => idx !== qIdx) : [...prev, qIdx]
    );
  };

  const handleSelectAllWords = () => {
    if (selectedWordIds.length === (activeUnit?.vocabularies?.length || 0)) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds((activeUnit?.vocabularies || []).map((v) => v.id));
    }
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài tập.');
      return;
    }

    if (scopeType === 'custom_words' && selectedWordIds.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 từ vựng để giao bài.');
      return;
    }

    if (scopeType === 'custom_questions' && selectedQuestionIndices.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 câu hỏi bài tập.');
      return;
    }

    const created = store().saveAssignment({
      week: Number(week),
      title: title.trim(),
      targetClass,
      scopeType,
      unitId: Number(unitId),
      selectedSkill,
      selectedWordIds,
      selectedQuestions: selectedQuestionIndices,
      deadline,
      note: note.trim(),
    });

    setShowCreateModal(false);
    reloadAssignments();
    setInspectAssignment(created);
  };

  const handleDeleteAssignment = (id) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa bài tập này?')) return;
    store().deleteAssignment(id);
    reloadAssignments();
    if (inspectAssignment?.id === id) setInspectAssignment(null);
  };

  // Helper sinh URL
  const getAssignmentUrl = (code) => {
    const origin = window.location.origin;
    return `${origin}/#/?assign=${encodeURIComponent(code)}`;
  };

  const copyLink = (code) => {
    const url = getAssignmentUrl(code);
    navigator.clipboard?.writeText(url);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyZaloMessage = (assign) => {
    const url = getAssignmentUrl(assign.code);
    const msg = `Kính gửi Quý Phụ huynh và các em học sinh lớp ${assign.targetClass === 'all' ? '6' : assign.targetClass},\nThầy/Cô gửi bài tập tuần này trên ứng dụng English-Kid:\n📌 Bài: ${assign.title}\n⏰ Hạn nộp: ${assign.deadline || 'Chủ Nhật tuần này'}\n📝 Lời dặn: ${assign.note || 'Các em cố gắng hoàn thành tốt nhé!'}\n👉 Link làm bài trực tiếp: ${url}\n(Bấm vào link là làm được ngay, không cần đăng nhập phức tạp).\nChúc các em học tập vui vẻ!`;
    navigator.clipboard?.writeText(msg);
    setCopiedZaloId(assign.code);
    setTimeout(() => setCopiedZaloId(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tiêu đề & Nút Tạo bài tập mới */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
            Phân phối theo Tuần học
          </span>
          <h2 className="text-2xl font-black text-ink mt-1">📅 Quản Lý & Giao Bài Tập Cho Học Sinh</h2>
          <p className="text-sm font-bold text-ink-soft mt-0.5">
            Giao bài linh hoạt: Trọn bộ Unit, từng kỹ năng (Nói/Nghe/Ngữ pháp), hoặc chọn lọc từ vựng/câu hỏi cụ thể.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-base font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>+ Giao bài tập mới</span>
        </button>
      </div>

      {/* Danh sách bài tập đã giao */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-ink flex items-center gap-2">
            <span>📋 Các bài tập đã giao</span>
            <span className="rounded-full bg-banana px-2.5 py-0.5 text-xs font-black text-ink">
              {assignments.length}
            </span>
          </h3>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-3xl bg-cream/70 p-10 text-center border-2 border-dashed border-banana-soft flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">📝</span>
            <h4 className="text-base font-black text-ink">Chưa có bài tập nào được giao</h4>
            <p className="text-xs font-bold text-ink-soft max-w-md">
              Bấm nút <strong>"+ Giao bài tập mới"</strong> để tạo bài tập tuần, chọn từ vựng hoặc câu hỏi và gửi link Zalo cho học sinh làm bài.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((assign) => {
              const submissions = store().getAssignmentSubmissions(assign.id);
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
                        onClick={() => handleDeleteAssignment(assign.id)}
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
                        {assign.scopeType === 'skill' && `Kỹ năng: ${assign.selectedSkill?.toUpperCase()} (Unit ${assign.unitId})`}
                        {assign.scopeType === 'custom_words' && `${assign.selectedWordIds?.length || 0} từ vựng chỉ định (Unit ${assign.unitId})`}
                        {assign.scopeType === 'custom_questions' && `${assign.selectedQuestions?.length || 0} câu hỏi trắc nghiệm chỉ định (Unit ${assign.unitId})`}
                      </p>
                      <p>
                        ⏰ <strong>Hạn nộp:</strong> {assign.deadline || 'Không giới hạn'}
                      </p>
                      {assign.note && <p className="italic">💬 "{assign.note}"</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-banana-soft">
                    {/* Thống kê học sinh đã làm */}
                    <div className="flex items-center justify-between text-xs font-black text-ink">
                      <span className="flex items-center gap-1.5 text-mint-dark">
                        <UserCheck className="h-4 w-4" /> Đã nộp: {submissions.length} học sinh
                      </span>
                      <span className="font-mono text-[11px] bg-banana-soft px-2 py-0.5 rounded-lg text-ink">
                        Mã: {assign.code}
                      </span>
                    </div>

                    {/* Các nút sao chép link / gửi Zalo */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => copyLink(assign.code)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-banana px-3 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copiedId === assign.code ? '✓ Đã chép link' : 'Chép link bài'}</span>
                      </button>

                      <button
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
        )}
      </div>

      {/* ================= MODAL TẠO BÀI TẬP MỚI ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border-4 border-peach flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-2xl font-black text-ink">🚀 Thiết Kế Bài Tập Tuần Cho Học Sinh</h3>
                <p className="text-xs font-bold text-ink-soft">
                  Thầy cô chọn tuần, lớp và tùy chọn nội dung giao bài linh hoạt.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Tuần học:</label>
                  <select
                    value={week}
                    onChange={(e) => {
                      setWeek(Number(e.target.value));
                      setTitle(`Bài tập Tuần ${e.target.value}: Ôn tập Unit ${unitId}`);
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
                    onChange={(e) => {
                      setUnitId(Number(e.target.value));
                      setSelectedWordIds([]);
                      setSelectedQuestionIndices([]);
                      setTitle(`Bài tập Tuần ${week}: Ôn tập Unit ${e.target.value}`);
                    }}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.unitId} value={u.unitId}>
                        Unit {u.unitId}: {u.title}
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

              {/* LỰA CHỌN PHẠM VI GIAO BÀI */}
              <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft">
                <label className="block text-xs font-black text-ink mb-2">Hình thức giao bài tập:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'full_unit', label: '🌟 Trọn bộ Unit', desc: 'Đủ 7 trạm + Test' },
                    { id: 'skill', label: '🎯 Theo kỹ năng', desc: 'Chỉ định 1 kỹ năng' },
                    { id: 'custom_words', label: '📝 Chọn từ vựng', desc: 'Tích chọn vài từ' },
                    { id: 'custom_questions', label: '📐 Chọn câu hỏi', desc: 'Tích chọn bài tập' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setScopeType(s.id)}
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

                {/* Nếu chọn Theo Kỹ Năng */}
                {scopeType === 'skill' && (
                  <div className="mt-3 pt-3 border-t border-banana-soft">
                    <label className="block text-xs font-black text-ink mb-1.5">Chọn kỹ năng cụ thể:</label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full rounded-xl bg-white px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                    >
                      <option value="speaking">🎙️ Luyện Nói & Chấm Điểm AI (Speaking Studio)</option>
                      <option value="listening">👂 Luyện Nghe & Điền Từ (Listening Station)</option>
                      <option value="pronunciation">🗣️ Luyện Phát Âm Cặp Âm (Pronunciation Station)</option>
                      <option value="grammar">📐 Bài Tập Trắc Nghiệm Ngữ Pháp (A Closer Look 2)</option>
                      <option value="reading">📖 Bài Tập Đọc Hiểu (Skills 1)</option>
                      <option value="writing">✍️ Luyện Viết Ghép Câu (Skills 2)</option>
                      <option value="mastery">🏆 Bài Kiểm Tra Thử Thách Tổng Hợp (Unit Mastery)</option>
                    </select>
                  </div>
                )}

                {/* Nếu chọn Tích chọn vài từ vựng */}
                {scopeType === 'custom_words' && (
                  <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-ink">
                        Tích chọn từ vựng cần giao ({selectedWordIds.length}/{activeUnit?.vocabularies?.length || 0}):
                      </span>
                      <button
                        type="button"
                        onClick={handleSelectAllWords}
                        className="text-xs font-black text-peach hover:underline cursor-pointer"
                      >
                        {selectedWordIds.length === activeUnit?.vocabularies?.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                      {(activeUnit?.vocabularies || []).map((v) => {
                        const checked = selectedWordIds.includes(v.id);
                        return (
                          <label
                            key={v.id}
                            className={`flex items-center gap-2 rounded-xl p-2 text-xs font-bold border cursor-pointer select-none transition-all ${
                              checked ? 'bg-mint-soft border-mint text-mint-dark font-black' : 'bg-white border-banana-soft text-ink'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleWord(v.id)}
                              className="rounded accent-mint"
                            />
                            <span>{v.emoji} {v.word}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nếu chọn Tích chọn câu hỏi trắc nghiệm */}
                {scopeType === 'custom_questions' && (
                  <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-2">
                    <span className="text-xs font-black text-ink">
                      Tích chọn câu hỏi trắc nghiệm ({selectedQuestionIndices.length}/{activeUnit?.grammar?.quiz?.length || 0}):
                    </span>
                    <div className="space-y-2 max-h-44 overflow-y-auto p-1">
                      {(activeUnit?.grammar?.quiz || []).map((q, idx) => {
                        const checked = selectedQuestionIndices.includes(idx);
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-2 rounded-xl p-2.5 text-xs font-bold border cursor-pointer select-none transition-all ${
                              checked ? 'bg-mint-soft border-mint text-mint-dark' : 'bg-white border-banana-soft text-ink'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleQuestion(idx)}
                              className="mt-0.5 rounded accent-mint"
                            />
                            <div>
                              <span className="font-black text-peach">Câu {idx + 1}:</span> {q.question}
                            </div>
                          </label>
                        );
                      })}
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
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-peach px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  🚀 Tạo & Giao bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
