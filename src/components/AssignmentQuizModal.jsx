import { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import { store } from '../utils/storage.js';
import { getUnit, getUnitRaw } from '../utils/data.js';
import { prepareItem } from '../utils/quiz.js';
import { submitAssignmentResult, submitTestScore } from '../utils/syncService.js';
import { playSfx } from '../utils/sfx.js';
import { Confetti, ProgressBar, SpeakerButton } from './ui.jsx';
import { normUnitId, isRealUnitId } from '../utils/unitId.js';
import {
  resolveQuestionType,
  extractScrambledWords,
  makeWordTokens,
  gradeQuestionAnswer,
  getExpectedAnswerText,
} from '../utils/questionGrading.js';
import QuestionTypeBadge from './questions/QuestionTypeBadge.jsx';
import MultipleChoiceOptions from './questions/MultipleChoiceOptions.jsx';
import FillBlankField from './questions/FillBlankField.jsx';
import WordUnscrambleBoard from './questions/WordUnscrambleBoard.jsx';

export default function AssignmentQuizModal({ assignment, isOpen, onClose, onCompleted }) {
  if (!isOpen || !assignment) return null;
  return (
    <AssignmentQuizBody
      key={assignment.id}
      assignment={assignment}
      onClose={onClose}
      onCompleted={onCompleted}
    />
  );
}

function AssignmentQuizBody({ assignment, onClose, onCompleted }) {
  const student = store().getStudentInfo();
  const hasUnit = isRealUnitId(assignment.unitId);
  const unit = useMemo(() => (hasUnit ? getUnit(assignment.unitId) : null), [assignment.unitId, hasUnit]);

  const questions = useMemo(() => {
    const salt = `as:${assignment.id}`;
    if (Array.isArray(assignment.questions) && assignment.questions.length > 0) {
      return assignment.questions.map((q) => prepareItem(q, salt));
    }
    const unitQuiz = unit?.grammar?.quiz || [];
    if (Array.isArray(assignment.selectedQuestions) && assignment.selectedQuestions.length > 0) {
      const rawQuiz = (hasUnit ? getUnitRaw(assignment.unitId) : null)?.grammar?.quiz || [];
      return assignment.selectedQuestions
        .map((idx) => rawQuiz[idx])
        .filter(Boolean)
        .map((q) => prepareItem(q, salt));
    }
    return unitQuiz;
  }, [assignment, unit, hasUnit]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const passage = assignment.passage || assignment.reading || null;
  const [showPassage, setShowPassage] = useState(Boolean(passage?.content || passage?.passage));
  const [showTranslation, setShowTranslation] = useState(false);

  const currentQ = questions[currentIndex] || null;
  const qType = resolveQuestionType(currentQ);

  const [unscrambleAvailable, setUnscrambleAvailable] = useState([]);
  const [unscrambleAssembled, setUnscrambleAssembled] = useState([]);

  useEffect(() => {
    if (!currentQ || qType !== 'unscramble') return;
    const existingAnswer = answers[currentIndex];
    const allWords = extractScrambledWords(currentQ);

    if (existingAnswer && typeof existingAnswer === 'string') {
      const assembledList = existingAnswer.split(/\s+/).filter(Boolean);
      setUnscrambleAssembled(assembledList.map((w, i) => ({ id: `asm_${i}_${w}`, word: w })));
      const remaining = [...allWords];
      assembledList.forEach((w) => {
        const idx = remaining.indexOf(w);
        if (idx >= 0) remaining.splice(idx, 1);
      });
      setUnscrambleAvailable(remaining.map((w, i) => ({ id: `avl_${i}_${w}`, word: w })));
    } else {
      setUnscrambleAvailable(makeWordTokens(allWords, 'avl'));
      setUnscrambleAssembled([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentQ, qType]);

  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null && String(answers[k]).trim() !== '',
  ).length;

  const setCurrentAnswer = (val) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: val }));
  };

  const handleAddWordToAssembled = (item) => {
    if (submitted) return;
    playSfx('click');
    const nextAvailable = unscrambleAvailable.filter((x) => x.id !== item.id);
    const nextAssembled = [...unscrambleAssembled, item];
    setUnscrambleAvailable(nextAvailable);
    setUnscrambleAssembled(nextAssembled);
    setCurrentAnswer(nextAssembled.map((x) => x.word).join(' '));
  };

  const handleRemoveWordFromAssembled = (item) => {
    if (submitted) return;
    playSfx('click');
    const nextAssembled = unscrambleAssembled.filter((x) => x.id !== item.id);
    const nextAvailable = [...unscrambleAvailable, item];
    setUnscrambleAssembled(nextAssembled);
    setUnscrambleAvailable(nextAvailable);
    setCurrentAnswer(nextAssembled.map((x) => x.word).join(' '));
  };

  const handleResetUnscramble = () => {
    if (submitted) return;
    playSfx('click');
    setUnscrambleAvailable(makeWordTokens(extractScrambledWords(currentQ), 'avl'));
    setUnscrambleAssembled([]);
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      const ok = window.confirm(
        `Em mới làm ${answeredCount}/${totalQuestions} câu. Em có chắc chắn muốn nộp bài ngay không?`,
      );
      if (!ok) return;
    }
    if (totalQuestions === 0) return;

    let correctCount = 0;
    const details = questions.map((q, idx) => {
      const userChoice = answers[idx];
      const type = resolveQuestionType(q);
      const isCorrect = gradeQuestionAnswer(q, userChoice);
      if (isCorrect) correctCount += 1;

      return {
        questionIndex: idx,
        type,
        question: q.question,
        prompt: q.prompt || '',
        userChoice,
        correctTarget: getExpectedAnswerText(q),
        options: q.options || [],
        answerIndex: q.answerIndex,
        explain: q.explain || '',
        isCorrect,
      };
    });

    const score = Math.round(((correctCount / totalQuestions) * 10) * 10) / 10;
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

    const subId = submissionEntry.id || `sub_${Date.now()}`;
    submitAssignmentResult({
      id: subId,
      assignmentId: assignment.id,
      score,
      detail: {
        code: assignment.code,
        title: assignment.title,
        correct: correctCount,
        total: totalQuestions,
        stars,
        answers: details,
      },
    });
    submitTestScore({
      id: subId,
      score,
      stars,
      correct: correctCount,
      total: totalQuestions,
      unitIds: hasUnit ? [normUnitId(assignment.unitId)] : [],
      answers: details,
    });

    setResult({ score, stars, correctCount, totalQuestions, details });
    setSubmitted(true);
    playSfx(stars >= 2 ? 'applause' : 'correct');
    onCompleted?.(submissionEntry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      {result && result.stars >= 2 && <Confetti show />}

      <div className="relative flex w-full max-w-3xl max-h-[94vh] flex-col rounded-[2.5rem] bg-white p-5 sm:p-7 shadow-2xl border-4 border-peach overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink hover:bg-peach hover:text-white transition-all cursor-pointer font-black"
        >
          <X className="h-5 w-5" />
        </button>

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
              <span className="text-xs font-bold text-ink-soft">⏰ Hạn: {assignment.deadline}</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-ink mt-1.5 leading-snug">
            {assignment.title}
          </h2>
          {assignment.note && (
            <p className="text-xs sm:text-sm font-bold text-ink-soft italic mt-0.5">
              💬 Lời dặn của Thầy/Cô: &quot;{assignment.note}&quot;
            </p>
          )}
        </header>

        {totalQuestions === 0 ? (
          <div className="my-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">📐</span>
            <h3 className="text-lg font-black text-ink">Bài tập này chưa có câu hỏi</h3>
            <p className="text-xs font-bold text-ink-soft">
              Vui lòng báo lại với Thầy/Cô để bổ sung câu hỏi nhé!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)]"
            >
              Quay lại
            </button>
          </div>
        ) : !submitted ? (
          <div className="flex flex-1 flex-col overflow-y-auto pt-3 gap-4">
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

            <div className="flex items-center justify-between text-xs font-black text-ink px-1">
              <span className="flex items-center gap-1.5">
                <span className="rounded-lg bg-peach px-2 py-0.5 text-white">
                  Câu {currentIndex + 1} / {totalQuestions}
                </span>
                <QuestionTypeBadge type={qType} />
              </span>
              <span className="text-peach-dark">
                Đã trả lời: <strong>{answeredCount}</strong>/{totalQuestions} câu
              </span>
            </div>
            <ProgressBar value={currentIndex + 1} max={totalQuestions} tone="bg-peach" />

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
                      <p className="text-xs font-bold text-ink-soft mt-1 italic">💡 {currentQ.prompt}</p>
                    )}
                  </div>
                  <SpeakerButton text={currentQ.question} size="sm" />
                </div>

                {qType === 'multiple_choice' && (
                  <MultipleChoiceOptions
                    options={currentQ.options || []}
                    selectedIndex={answers[currentIndex] ?? null}
                    answerIndex={currentQ.answerIndex}
                    onSelect={setCurrentAnswer}
                  />
                )}

                {qType === 'fill_blank' && (
                  <FillBlankField
                    sentence={currentQ.question?.includes('_') ? currentQ.question : ''}
                    value={answers[currentIndex] || ''}
                    options={currentQ.options}
                    onChange={setCurrentAnswer}
                    placeholder="Em hãy gõ từ cần điền vào đây..."
                  />
                )}

                {qType === 'unscramble' && (
                  <WordUnscrambleBoard
                    availableWords={unscrambleAvailable}
                    assembledWords={unscrambleAssembled}
                    onAddWord={handleAddWordToAssembled}
                    onRemoveWord={handleRemoveWordFromAssembled}
                    onReset={handleResetUnscramble}
                  />
                )}

                {qType === 'sentence_completion' && (
                  <FillBlankField
                    sentence=""
                    value={answers[currentIndex] || ''}
                    options={currentQ.options}
                    onChange={setCurrentAnswer}
                    placeholder="Em hãy gõ vế hoàn thành câu vào đây..."
                  />
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
              {questions.map((_, i) => {
                const isAnswered =
                  answers[i] !== undefined && answers[i] !== null && String(answers[i]).trim() !== '';
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

            <footer className="flex items-center justify-between gap-3 border-t border-banana-soft pt-3 mt-auto">
              <button
                type="button"
                onClick={() => currentIndex > 0 && setCurrentIndex((i) => i - 1)}
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
                    onClick={() => currentIndex < totalQuestions - 1 && setCurrentIndex((i) => i + 1)}
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
