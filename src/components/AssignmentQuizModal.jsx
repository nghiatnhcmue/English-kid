import { useState, useMemo } from 'react';
import { store } from '../utils/storage.js';
import { getUnit } from '../utils/data.js';
import { submitTestScore } from '../utils/syncService.js';
import { playSfx } from '../utils/sfx.js';
import { Confetti, ProgressBar } from './ui.jsx';
import { CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Send, Star, Trophy, X } from 'lucide-react';

export default function AssignmentQuizModal({ assignment, isOpen, onClose, onCompleted }) {
  if (!isOpen || !assignment) return null;

  const student = store().getStudentInfo();
  const unit = useMemo(() => getUnit(assignment.unitId), [assignment.unitId]);

  // Lấy danh sách câu hỏi của bài tập
  const questions = useMemo(() => {
    if (Array.isArray(assignment.questions) && assignment.questions.length > 0) {
      return assignment.questions;
    }
    const unitQuiz = unit?.grammar?.quiz || [];
    if (Array.isArray(assignment.selectedQuestions) && assignment.selectedQuestions.length > 0) {
      return assignment.selectedQuestions.map((idx) => unitQuiz[idx]).filter(Boolean);
    }
    return unitQuiz;
  }, [assignment, unit]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex] || null;
  const isLast = currentIndex === totalQuestions - 1;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (optIndex) => {
    if (submitted) return;
    playSfx('click');
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `Em mới làm ${answeredCount}/${totalQuestions} câu. Em có chắc chắn muốn nộp bài ngay không?`
      );
      if (!confirmSubmit) return;
    }

    let correctCount = 0;
    const details = [];

    questions.forEach((q, idx) => {
      const userChoice = answers[idx];
      const isCorrect = userChoice === q.answerIndex;
      if (isCorrect) correctCount += 1;
      details.push({
        questionIndex: idx,
        question: q.question,
        userChoice,
        answerIndex: q.answerIndex,
        isCorrect,
      });
    });

    const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 10;
    const score = Math.round(rawScore * 10) / 10;
    const stars = score >= 9 ? 3 : score >= 7 ? 2 : 1;

    const submissionEntry = store().submitAssignment(assignment.id, {
      assignmentCode: assignment.code,
      score,
      stars,
      total: totalQuestions,
      correct: correctCount,
      studentName: student.name || 'Học sinh',
      studentClass: student.class || '6',
      detail: details,
    });

    // Đồng bộ lên Cloudflare D1
    try {
      await submitTestScore({
        id: submissionEntry.id || `sub_${Date.now()}`,
        studentName: student.name || 'Học sinh',
        studentClass: student.class || '6',
        score,
        stars,
        correct: correctCount,
        total: totalQuestions,
        unitIds: [assignment.unitId || 1],
        wrongWords: [],
        answers: details,
        isoDate: new Date().toISOString(),
      });
    } catch {
      // Ignored if network or offline
    }

    setResult({
      score,
      stars,
      correctCount,
      totalQuestions,
      details,
    });
    setSubmitted(true);
    playSfx(stars >= 2 ? 'applause' : 'correct');
    onCompleted?.(submissionEntry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      {result && result.stars >= 2 && <Confetti />}

      <div className="relative flex w-full max-w-2xl max-h-[92vh] flex-col rounded-[2.5rem] bg-white p-5 sm:p-7 shadow-2xl border-4 border-peach overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink hover:bg-peach hover:text-white transition-all cursor-pointer font-black"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tiêu đề & Thông tin bài */}
        <header className="border-b border-banana-soft pb-4 pr-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
              Tuần {assignment.week}
            </span>
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-black text-ink border border-banana-soft">
              Unit {assignment.unitId}: {unit?.title || ''}
            </span>
            {assignment.deadline && (
              <span className="text-xs font-bold text-ink-soft">
                ⏰ Hạn: {assignment.deadline}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-ink mt-1.5 leading-snug">
            {assignment.title}
          </h2>
          {assignment.note && (
            <p className="text-xs sm:text-sm font-bold text-ink-soft italic mt-0.5">
              💬 Lời dặn của Thầy/Cô: "{assignment.note}"
            </p>
          )}
        </header>

        {/* KHÔNG CÓ CÂU HỎI */}
        {totalQuestions === 0 ? (
          <div className="my-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">📐</span>
            <h3 className="text-lg font-black text-ink">Bài tập này chưa có câu hỏi trắc nghiệm</h3>
            <p className="text-xs font-bold text-ink-soft">
              Vui lòng báo lại với Thầy/Cô để bổ sung câu hỏi nhé!
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)]"
            >
              Quay lại
            </button>
          </div>
        ) : !submitted ? (
          /* ================= GIAO DIỆN LÀM BÀI ================= */
          <div className="flex flex-1 flex-col justify-between overflow-y-auto pt-4 gap-5">
            {/* Thanh tiến độ */}
            <div className="flex items-center justify-between text-xs font-black text-ink">
              <span>
                Câu {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="text-peach-dark">
                Đã làm: {answeredCount}/{totalQuestions} câu
              </span>
            </div>
            <ProgressBar value={currentIndex + 1} max={totalQuestions} tone="bg-peach" />

            {/* Nội dung câu hỏi */}
            {currentQ && (
              <div className="rounded-3xl bg-cream/70 p-5 sm:p-6 border-2 border-banana-soft flex flex-col gap-4">
                <div className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-peach text-white text-xs font-black">
                    {currentIndex + 1}
                  </span>
                  <p className="text-base sm:text-lg font-black text-ink leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* Các lựa chọn đáp án */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {(currentQ.options || []).map((opt, oIdx) => {
                    const isSelected = answers[currentIndex] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(oIdx)}
                        className={`flex items-center gap-3 rounded-2xl p-3.5 text-left text-sm font-bold transition-all cursor-pointer border-2 ${
                          isSelected
                            ? 'bg-peach text-white border-peach-dark shadow-sm scale-[1.01] font-black'
                            : 'bg-white text-ink border-banana-soft hover:bg-cream hover:border-banana active:scale-98'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${
                            isSelected ? 'bg-white text-peach-dark' : 'bg-cream text-ink'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thanh điều hướng câu & Nút nộp bài */}
            <footer className="flex items-center justify-between gap-3 border-t border-banana-soft pt-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-2xl bg-cream px-4 py-2.5 text-xs font-black text-ink hover:bg-banana-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Câu trước</span>
              </button>

              <div className="flex items-center gap-2">
                {!isLast ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1 rounded-2xl bg-banana px-5 py-2.5 text-xs font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    <span>Câu tiếp</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer animate-pulse"
                  >
                    <Send className="h-4 w-4" />
                    <span>Nộp bài ngay</span>
                  </button>
                )}
              </div>
            </footer>
          </div>
        ) : (
          /* ================= GIAO DIỆN KẾT QUẢ ================= */
          <div className="flex flex-1 flex-col overflow-y-auto pt-4 gap-5">
            <div className="rounded-3xl bg-gradient-to-br from-banana/40 to-peach/30 p-6 text-center border-2 border-banana flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                🏆
              </div>
              <h3 className="text-2xl font-black text-ink">
                {result.score >= 9
                  ? '🎉 Xuất sắc! Chúc mừng em!'
                  : result.score >= 7
                  ? '👏 Rất tốt! Em đã làm bài rất chăm chỉ!'
                  : '💪 Cố gắng thêm nhé, em có thể làm lại bài này!'}
              </h3>
              <p className="text-base font-black text-peach-dark">
                Điểm số: {result.score}/10 điểm ({result.correctCount}/{result.totalQuestions} câu đúng)
              </p>
              <div className="flex items-center gap-1 text-2xl text-amber-500">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i}>{i < result.stars ? '⭐' : '☆'}</span>
                ))}
              </div>
              <p className="text-xs font-bold text-mint-dark mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Kết quả bài làm đã được lưu và gửi trực tiếp cho Thầy/Cô!
              </p>
            </div>

            {/* Chi tiết từng câu */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-ink">Xem lại chi tiết bài làm:</h4>
              {questions.map((q, qIdx) => {
                const userChoice = answers[qIdx];
                const isCorrect = userChoice === q.answerIndex;
                return (
                  <div
                    key={qIdx}
                    className={`rounded-2xl p-4 border-2 text-xs font-bold flex flex-col gap-2 ${
                      isCorrect
                        ? 'bg-mint-soft/50 border-mint/40 text-ink'
                        : 'bg-rose-50 border-rose-200 text-ink'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black text-sm">
                        <span className="text-peach-dark mr-1">Câu {qIdx + 1}:</span> {q.question}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-black shrink-0 ${
                          isCorrect ? 'bg-mint text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {isCorrect ? '✓ Đúng' : '✗ Chưa đúng'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {q.options?.map((opt, oIdx) => {
                        let style = 'bg-white border-gray-200 text-ink';
                        if (oIdx === q.answerIndex) {
                          style = 'bg-mint text-white border-mint-dark font-black';
                        } else if (oIdx === userChoice && !isCorrect) {
                          style = 'bg-rose-100 text-rose-800 border-rose-300 font-black';
                        }
                        return (
                          <div key={oIdx} className={`rounded-xl px-3 py-1.5 border ${style}`}>
                            {String.fromCharCode(65 + oIdx)}. {opt}{' '}
                            {oIdx === q.answerIndex && '✓ (Đáp án chuẩn)'}
                            {oIdx === userChoice && !isCorrect && '✗ (Lựa chọn của em)'}
                          </div>
                        );
                      })}
                    </div>

                    {q.explain && (
                      <p className="text-[11px] font-bold text-ink-soft bg-white/70 p-2 rounded-xl mt-1">
                        💡 Giải thích: {q.explain}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-banana-soft">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-peach px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] cursor-pointer"
              >
                Hoàn thành & Đóng ↵
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
