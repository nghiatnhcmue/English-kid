import { useState, useMemo, useEffect } from 'react';
import { store } from '../utils/storage.js';
import { getUnit } from '../utils/data.js';
import { submitTestScore } from '../utils/syncService.js';
import { playSfx } from '../utils/sfx.js';
import { Confetti, ProgressBar, SpeakerButton } from './ui.jsx';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Star, 
  Trophy, 
  X,
  BookOpen,
  Volume2
} from 'lucide-react';

export default function AssignmentQuizModal({ assignment, isOpen, onClose, onCompleted }) {
  if (!isOpen || !assignment) return null;

  const student = store().getStudentInfo();
  const hasUnit = Number(assignment.unitId) > 0;
  const unit = useMemo(() => (hasUnit ? getUnit(assignment.unitId) : null), [assignment.unitId, hasUnit]);

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
  const [answers, setAnswers] = useState({}); // { [qIndex]: value }
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // Trạng thái cho đoạn văn đọc hiểu (nếu có)
  const passage = assignment.passage || assignment.reading || null;
  const [showPassage, setShowPassage] = useState(Boolean(passage?.content || passage?.passage));
  const [showTranslation, setShowTranslation] = useState(false);

  // Trạng thái cho dạng bài sắp xếp từ (unscramble)
  const currentQ = questions[currentIndex] || null;
  const qType = currentQ?.type || (currentQ?.question?.includes('_') ? 'fill_blank' : 'multiple_choice');

  const [unscrambleAvailable, setUnscrambleAvailable] = useState([]);
  const [unscrambleAssembled, setUnscrambleAssembled] = useState([]);

  // Đồng bộ trạng thái khi chuyển câu
  useEffect(() => {
    if (!currentQ) return;
    if (qType === 'unscramble') {
      const existingAnswer = answers[currentIndex];
      const allWords = Array.isArray(currentQ.scrambledWords) && currentQ.scrambledWords.length > 0
        ? currentQ.scrambledWords
        : (currentQ.correctSentence || '').split(/\s+/).filter(Boolean);

      if (existingAnswer && typeof existingAnswer === 'string') {
        const assembledList = existingAnswer.split(/\s+/).filter(Boolean);
        setUnscrambleAssembled(assembledList.map((w, i) => ({ id: `asm_${i}_${w}`, word: w })));
        // Tính các từ còn lại trong kho
        const remaining = [...allWords];
        assembledList.forEach((w) => {
          const idx = remaining.indexOf(w);
          if (idx >= 0) remaining.splice(idx, 1);
        });
        setUnscrambleAvailable(remaining.map((w, i) => ({ id: `avl_${i}_${w}`, word: w })));
      } else {
        setUnscrambleAvailable(allWords.map((w, i) => ({ id: `avl_${i}_${w}_${Date.now()}`, word: w })));
        setUnscrambleAssembled([]);
      }
    }
  }, [currentIndex, currentQ, qType]);

  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null && String(answers[k]).trim() !== ''
  ).length;

  // Xử lý chọn đáp án trắc nghiệm
  const handleSelectOption = (optIndex) => {
    if (submitted) return;
    playSfx('click');
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  // Xử lý điền từ (fill_blank / sentence_completion)
  const handleInputAnswer = (val) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: val,
    }));
  };

  // Xử lý ghép từ cho unscramble
  const handleAddWordToAssembled = (item) => {
    if (submitted) return;
    playSfx('click');
    const nextAvailable = unscrambleAvailable.filter((x) => x.id !== item.id);
    const nextAssembled = [...unscrambleAssembled, item];
    setUnscrambleAvailable(nextAvailable);
    setUnscrambleAssembled(nextAssembled);
    const sentence = nextAssembled.map((x) => x.word).join(' ');
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: sentence,
    }));
  };

  const handleRemoveWordFromAssembled = (item) => {
    if (submitted) return;
    playSfx('click');
    const nextAssembled = unscrambleAssembled.filter((x) => x.id !== item.id);
    const nextAvailable = [...unscrambleAvailable, item];
    setUnscrambleAssembled(nextAssembled);
    setUnscrambleAvailable(nextAvailable);
    const sentence = nextAssembled.map((x) => x.word).join(' ');
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: sentence,
    }));
  };

  const handleResetUnscramble = () => {
    if (submitted) return;
    playSfx('click');
    const allWords = Array.isArray(currentQ.scrambledWords) && currentQ.scrambledWords.length > 0
      ? currentQ.scrambledWords
      : (currentQ.correctSentence || '').split(/\s+/).filter(Boolean);
    setUnscrambleAvailable(allWords.map((w, i) => ({ id: `avl_${i}_${w}_${Date.now()}`, word: w })));
    setUnscrambleAssembled([]);
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
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

  const norm = (s) => String(s || '').toLowerCase().replace(/[.!?,]/g, '').trim();

  // Nộp bài & Chấm điểm
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
      const type = q.type || (q.question?.includes('_') ? 'fill_blank' : 'multiple_choice');
      let isCorrect = false;

      if (type === 'multiple_choice') {
        isCorrect = userChoice === q.answerIndex;
      } else if (type === 'fill_blank') {
        const target = q.blankWord || (q.options ? q.options[q.answerIndex] : '');
        isCorrect = norm(userChoice) === norm(target);
      } else if (type === 'unscramble') {
        const target = q.correctSentence || '';
        isCorrect = norm(userChoice) === norm(target);
      } else if (type === 'sentence_completion') {
        if (typeof userChoice === 'number' && q.options) {
          isCorrect = userChoice === q.answerIndex;
        } else {
          const target = q.correctAnswer || q.blankWord || (q.options ? q.options[q.answerIndex] : '');
          isCorrect = norm(userChoice) === norm(target) || norm(userChoice) === norm(q.correctSentence);
        }
      }

      if (isCorrect) correctCount += 1;

      details.push({
        questionIndex: idx,
        type,
        question: q.question,
        prompt: q.prompt || '',
        userChoice,
        correctTarget:
          type === 'multiple_choice'
            ? q.options?.[q.answerIndex] || String.fromCharCode(65 + (q.answerIndex || 0))
            : type === 'fill_blank'
            ? q.blankWord || q.options?.[q.answerIndex] || ''
            : type === 'unscramble'
            ? q.correctSentence || ''
            : q.correctAnswer || q.options?.[q.answerIndex] || '',
        options: q.options || [],
        answerIndex: q.answerIndex,
        explain: q.explain || '',
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

    // Đồng bộ điểm số lên Cloudflare D1
    try {
      await submitTestScore({
        id: submissionEntry.id || `sub_${Date.now()}`,
        studentName: student.name || 'Học sinh',
        studentClass: student.class || '6',
        score,
        stars,
        correct: correctCount,
        total: totalQuestions,
        unitIds: [Number(assignment.unitId) || 1],
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

      <div className="relative flex w-full max-w-3xl max-h-[94vh] flex-col rounded-[2.5rem] bg-white p-5 sm:p-7 shadow-2xl border-4 border-peach overflow-hidden">
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
            {hasUnit ? (
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-black text-ink border border-banana-soft">
                Unit {assignment.unitId}: {unit?.title || ''}
              </span>
            ) : (
              <span className="rounded-full bg-purple-100 text-purple-700 px-2.5 py-0.5 text-xs font-black border border-purple-200">
                🚀 Đề luyện tập ngoài SGK
              </span>
            )}
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
            <h3 className="text-lg font-black text-ink">Bài tập này chưa có câu hỏi</h3>
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
          <div className="flex flex-1 flex-col overflow-y-auto pt-3 gap-4">
            {/* KHỐI ĐOẠN VĂN ĐỌC HIỂU (NẾU ĐỀ BÀI CÓ ĐOẠN VĂN RIÊNG) */}
            {passage && (passage.content || passage.passage) && (
              <div className="rounded-2xl bg-amber-50/80 p-4 border-2 border-amber-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📖</span>
                    <h3 className="text-sm sm:text-base font-black text-ink">
                      {passage.title || 'Đoạn văn đọc hiểu của đề bài'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <SpeakerButton text={passage.content || passage.passage} size="sm" />
                    {passage.translation && (
                      <button
                        type="button"
                        onClick={() => setShowTranslation((v) => !v)}
                        className="rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-ink border border-amber-300 hover:bg-amber-100 cursor-pointer"
                      >
                        {showTranslation ? 'Ẩn dịch' : 'Dịch nghĩa 🇻🇳'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassage((v) => !v)}
                      className="text-xs font-black text-peach-dark hover:underline cursor-pointer"
                    >
                      {showPassage ? 'Thu gọn bài đọc ▲' : 'Xem bài đọc ▼'}
                    </button>
                  </div>
                </div>

                {showPassage && (
                  <div className="text-xs sm:text-sm font-bold text-ink leading-relaxed max-h-48 overflow-y-auto bg-white/80 p-3 rounded-xl border border-amber-200">
                    <p className="whitespace-pre-line">{passage.content || passage.passage}</p>
                    {showTranslation && passage.translation && (
                      <p className="mt-2 pt-2 border-t border-amber-200 text-ink-soft italic whitespace-pre-line">
                        🇻🇳 {passage.translation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Thanh tiến độ & Số câu đã làm */}
            <div className="flex items-center justify-between text-xs font-black text-ink px-1">
              <span className="flex items-center gap-1.5">
                <span className="rounded-lg bg-peach px-2 py-0.5 text-white">
                  Câu {currentIndex + 1} / {totalQuestions}
                </span>
                <span
                  className={`rounded-lg px-2 py-0.5 ${
                    qType === 'multiple_choice'
                      ? 'bg-mint-soft text-mint-dark'
                      : qType === 'fill_blank'
                      ? 'bg-sky-soft text-sky-dark'
                      : qType === 'unscramble'
                      ? 'bg-peach-soft text-peach-dark'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {qType === 'multiple_choice'
                    ? '🏷️ Trắc nghiệm'
                    : qType === 'fill_blank'
                    ? '✏️ Điền khuyết'
                    : qType === 'unscramble'
                    ? '🧩 Sắp xếp từ'
                    : '✍️ Viết tiếp câu'}
                </span>
              </span>
              <span className="text-peach-dark">
                Đã trả lời: <strong>{answeredCount}</strong>/{totalQuestions} câu
              </span>
            </div>
            <ProgressBar value={currentIndex + 1} max={totalQuestions} tone="bg-peach" />

            {/* Khung câu hỏi tương tác */}
            {currentQ && (
              <div className="rounded-3xl bg-cream/70 p-5 sm:p-6 border-2 border-banana-soft flex flex-col gap-4">
                <div className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-peach text-white text-xs font-black">
                    {currentIndex + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-base sm:text-lg font-black text-ink leading-relaxed">
                      {currentQ.question}
                    </p>
                    {currentQ.prompt && currentQ.prompt !== currentQ.question && (
                      <p className="text-xs font-bold text-ink-soft mt-1 italic">
                        💡 {currentQ.prompt}
                      </p>
                    )}
                  </div>
                  <SpeakerButton text={currentQ.question} size="sm" />
                </div>

                {/* DẠNG 1: TRẮC NGHIỆM A/B/C/D */}
                {qType === 'multiple_choice' && (
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
                )}

                {/* DẠNG 2: ĐIỀN KHUYẾT (FILL IN THE BLANK) */}
                {qType === 'fill_blank' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={answers[currentIndex] || ''}
                        onChange={(e) => handleInputAnswer(e.target.value)}
                        placeholder="Em hãy gõ từ cần điền vào đây..."
                        className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-bold border-2 border-banana-soft focus:border-sky focus:outline-none"
                      />
                    </div>

                    {/* Nếu có các lựa chọn gợi ý */}
                    {Array.isArray(currentQ.options) && currentQ.options.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-black text-ink-soft">Hoặc chọn nhanh từ gợi ý:</span>
                        {currentQ.options.map((opt, oIdx) => {
                          const isPicked = answers[currentIndex] === opt;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleInputAnswer(opt)}
                              className={`rounded-xl px-3.5 py-1.5 text-xs font-black border transition-all cursor-pointer ${
                                isPicked
                                  ? 'bg-sky text-ink border-sky-dark shadow-xs'
                                  : 'bg-white text-ink border-banana-soft hover:bg-cream'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* DẠNG 3: SẮP XẾP TỪ THÀNH CÂU (UNSCRAMBLE) */}
                {qType === 'unscramble' && (
                  <div className="flex flex-col gap-3">
                    {/* Khung chứa các từ đã ghép */}
                    <div className="min-h-16 rounded-2xl bg-white p-3.5 border-2 border-dashed border-peach/50 flex flex-wrap items-center gap-2">
                      {unscrambleAssembled.length === 0 ? (
                        <span className="text-xs font-bold text-ink-soft italic">
                          Chạm các từ bên dưới để ghép thành câu hoàn chỉnh...
                        </span>
                      ) : (
                        unscrambleAssembled.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleRemoveWordFromAssembled(item)}
                            className="rounded-xl bg-peach px-3 py-1.5 text-xs font-black text-white shadow-xs hover:bg-peach-dark transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>{item.word}</span>
                            <span className="text-[10px] opacity-70">✕</span>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Kho từ còn lại */}
                    <div className="flex flex-wrap items-center gap-2">
                      {unscrambleAvailable.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddWordToAssembled(item)}
                          className="rounded-xl bg-cream px-3 py-1.5 text-xs font-bold text-ink border border-banana-soft hover:bg-banana shadow-2xs transition-all cursor-pointer"
                        >
                          {item.word}
                        </button>
                      ))}

                      {unscrambleAssembled.length > 0 && (
                        <button
                          type="button"
                          onClick={handleResetUnscramble}
                          className="ml-auto inline-flex items-center gap-1 text-xs font-black text-peach-dark hover:underline cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Làm lại</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* DẠNG 4: VIẾT TIẾP HOÀN THÀNH CÂU (SENTENCE COMPLETION) */}
                {qType === 'sentence_completion' && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={answers[currentIndex] || ''}
                      onChange={(e) => handleInputAnswer(e.target.value)}
                      placeholder="Em hãy gõ vế hoàn thành câu vào đây..."
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold border-2 border-banana-soft focus:border-purple-500 focus:outline-none"
                    />

                    {Array.isArray(currentQ.options) && currentQ.options.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-black text-ink-soft">Hoặc chọn phương án:</span>
                        {currentQ.options.map((opt, oIdx) => {
                          const isPicked = answers[currentIndex] === opt || answers[currentIndex] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleInputAnswer(opt)}
                              className={`rounded-xl px-3.5 py-1.5 text-xs font-black border transition-all cursor-pointer ${
                                isPicked
                                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                                  : 'bg-white text-ink border-banana-soft hover:bg-cream'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dãy chấm chọn nhanh câu hỏi (Dot bar) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
              {questions.map((_, i) => {
                const isAnswered = answers[i] !== undefined && answers[i] !== null && String(answers[i]).trim() !== '';
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-peach text-white shadow-sm ring-2 ring-peach-soft scale-110'
                        : isAnswered
                        ? 'bg-mint text-white'
                        : 'bg-cream text-ink-soft hover:bg-banana-soft'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Thanh điều hướng câu & Nút nộp bài */}
            <footer className="flex items-center justify-between gap-3 border-t border-banana-soft pt-3 mt-auto">
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
              {result.details.map((item, qIdx) => {
                const isCorrect = item.isCorrect;
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
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-peach-dark font-black mr-1">Câu {qIdx + 1}:</span>
                        <div>
                          <p className="font-black text-sm">{item.question}</p>
                          {item.prompt && item.prompt !== item.question && (
                            <p className="text-[11px] font-bold text-ink-soft italic">{item.prompt}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-black shrink-0 ${
                          isCorrect ? 'bg-mint text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {isCorrect ? '✓ Đúng' : '✗ Chưa đúng'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-white/80 p-3 flex flex-col gap-1 border border-banana-soft/60 mt-1">
                      <p>
                        <span className="text-ink-soft">Câu trả lời của em: </span>
                        <strong className={isCorrect ? 'text-mint-dark' : 'text-rose-600'}>
                          {item.type === 'multiple_choice' && typeof item.userChoice === 'number'
                            ? `${String.fromCharCode(65 + item.userChoice)}. ${item.options[item.userChoice] || ''}`
                            : item.userChoice || '(Chưa điền)'}
                        </strong>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="text-ink-soft">Đáp án chuẩn: </span>
                          <strong className="text-mint-dark">{item.correctTarget}</strong>
                        </p>
                      )}
                    </div>

                    {item.explain && (
                      <p className="text-[11px] font-bold text-ink-soft bg-white/70 p-2 rounded-xl mt-1">
                        💡 Giải thích: {item.explain}
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

