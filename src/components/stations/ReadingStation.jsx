import { useState, useEffect } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Button3D, ProgressBar, Confetti } from '../ui.jsx';
import { playSfx } from '../../utils/sfx.js';
import {
  resolveQuestionType,
  extractScrambledWords,
  makeWordTokens,
  gradeQuestionAnswer,
  getExpectedAnswerText,
} from '../../utils/questionGrading.js';
import QuestionTypeBadge from '../questions/QuestionTypeBadge.jsx';
import MultipleChoiceOptions from '../questions/MultipleChoiceOptions.jsx';
import FillBlankField from '../questions/FillBlankField.jsx';
import WordUnscrambleBoard from '../questions/WordUnscrambleBoard.jsx';
import ReadingPassageCard from '../questions/ReadingPassageCard.jsx';

export default function ReadingStation({ unit, onFinish }) {
  const reading = unit?.reading;
  const questions = reading?.questions ?? [];

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [filledWord, setFilledWord] = useState('');
  const [availableWords, setAvailableWords] = useState([]);
  const [assembledWords, setAssembledWords] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQ = questions[index];
  const qType = resolveQuestionType(currentQ);
  const isLast = index === questions.length - 1;

  useEffect(() => {
    if (!currentQ) return;
    setAnswered(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setFilledWord('');

    if (qType === 'unscramble') {
      setAvailableWords(makeWordTokens(extractScrambledWords(currentQ), 'rd'));
      setAssembledWords([]);
    }
  }, [index, currentQ, qType]);

  if (!reading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
        <span className="text-5xl" aria-hidden>
          📖
        </span>
        <p className="text-xl font-black text-ink">Bài đọc hiểu đang được cập nhật!</p>
        <Button3D onClick={() => onFinish?.(3, 'Đã đọc bài!')}>Tiếp tục bài học</Button3D>
      </div>
    );
  }

  const addWord = (item) => {
    if (answered) return;
    playSfx('click');
    setAvailableWords((prev) => prev.filter((x) => x.id !== item.id));
    setAssembledWords((prev) => [...prev, item]);
  };

  const removeWord = (item) => {
    if (answered) return;
    playSfx('click');
    setAssembledWords((prev) => prev.filter((x) => x.id !== item.id));
    setAvailableWords((prev) => [...prev, item]);
  };

  const resetUnscramble = () => {
    if (answered) return;
    playSfx('click');
    setAvailableWords(makeWordTokens(extractScrambledWords(currentQ), 'rd'));
    setAssembledWords([]);
  };

  const getActiveAnswer = () => {
    if (qType === 'multiple_choice') return selectedOption;
    if (qType === 'unscramble') return assembledWords.map((x) => x.word).join(' ').trim();
    if (qType === 'sentence_completion' && selectedOption !== null && currentQ.options?.length) {
      return selectedOption;
    }
    return filledWord;
  };

  const handleCheck = () => {
    if (answered) return;
    const correct = gradeQuestionAnswer(currentQ, getActiveAnswer());
    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      playSfx('correct');
    } else {
      playSfx('wrong');
    }
  };

  const handleNext = () => {
    if (isLast) {
      const total = questions.length;
      const finalStars = score >= total ? 3 : score >= Math.ceil(total / 2) ? 2 : 1;
      onFinish?.(finalStars, `Đọc hiểu đúng ${score}/${total} câu hỏi!`);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const canCheck = () => {
    if (answered) return false;
    if (qType === 'multiple_choice') return selectedOption !== null;
    if (qType === 'fill_blank') return filledWord.trim().length > 0;
    if (qType === 'unscramble') return assembledWords.length > 0;
    if (qType === 'sentence_completion') return selectedOption !== null || filledWord.trim().length > 0;
    return false;
  };

  return (
    <div className="flex flex-col gap-6">
      <Confetti show={answered && isCorrect} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <ReadingPassageCard
          title={reading.title}
          passage={reading.passage}
          translation={reading.translation}
          sticky
          className="lg:col-span-5 xl:col-span-5"
        />

        <section className="lg:col-span-7 xl:col-span-7 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-banana-soft shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">❓</span>
              <span className="text-sm font-black text-ink">
                Câu hỏi {index + 1}/{questions.length}
              </span>
            </div>

            <div className="flex-1 max-w-[200px]">
              <ProgressBar value={index + 1} max={questions.length} tone="bg-sky" />
            </div>

            <span className="rounded-full bg-cream px-3 py-0.5 text-xs font-black text-ink-soft border border-banana-soft">
              ⭐ {score} điểm
            </span>
          </div>

          <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-5">
            <div>
              <QuestionTypeBadge type={qType} />
              <h3 className="text-xl sm:text-2xl font-black text-ink leading-relaxed mt-2.5">
                {currentQ.question}
              </h3>
            </div>

            {qType === 'multiple_choice' && (
              <MultipleChoiceOptions
                options={currentQ.options || []}
                selectedIndex={selectedOption}
                answerIndex={currentQ.answerIndex}
                locked={answered}
                showResult={answered}
                onSelect={setSelectedOption}
              />
            )}

            {qType === 'fill_blank' && (
              <FillBlankField
                sentence={currentQ.question}
                value={filledWord}
                options={currentQ.options}
                locked={answered}
                showResult={answered}
                isCorrect={isCorrect}
                onChange={setFilledWord}
                placeholder="Gõ từ cần điền vào đây..."
              />
            )}

            {qType === 'unscramble' && (
              <WordUnscrambleBoard
                availableWords={availableWords}
                assembledWords={assembledWords}
                locked={answered}
                showResult={answered}
                isCorrect={isCorrect}
                onAddWord={addWord}
                onRemoveWord={removeWord}
                onReset={resetUnscramble}
              />
            )}

            {qType === 'sentence_completion' && (
              <div className="flex flex-col gap-4">
                {currentQ.prompt && (
                  <div className="p-4 rounded-2xl bg-cream-soft border border-banana-soft text-base sm:text-lg font-bold text-ink">
                    <span className="font-black text-peach-dark block text-xs uppercase mb-1">
                      Vế câu cho sẵn:
                    </span>
                    &quot;{currentQ.prompt}&quot;
                  </div>
                )}

                {currentQ.options?.length > 0 ? (
                  <MultipleChoiceOptions
                    options={currentQ.options.map((opt) => `... ${opt}`)}
                    selectedIndex={selectedOption}
                    answerIndex={currentQ.answerIndex}
                    locked={answered}
                    showResult={answered}
                    onSelect={setSelectedOption}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-ink-soft">Nhập vế câu hoàn thiện:</label>
                    <textarea
                      rows={3}
                      disabled={answered}
                      value={filledWord}
                      onChange={(e) => setFilledWord(e.target.value)}
                      placeholder="Nhập phần viết tiếp của câu vào đây..."
                      className="w-full rounded-2xl bg-cream p-3.5 text-sm font-bold text-ink border border-banana-soft"
                    />
                  </div>
                )}
              </div>
            )}

            {answered && (
              <div
                className={`rounded-2xl p-4 text-center font-bold text-base sm:text-lg animate-fade-in ${
                  isCorrect ? 'bg-mint text-white' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isCorrect ? (
                  <div className="flex flex-col items-center gap-1 font-black">
                    <span>🎉 Tuyệt vời! Em đã trả lời hoàn toàn chính xác!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-black">Chưa chính xác rồi, đáp án đúng là:</span>
                    <span className="font-mono text-base underline font-black">
                      {qType === 'multiple_choice' && currentQ.options
                        ? `${String.fromCharCode(65 + currentQ.answerIndex)}. ${getExpectedAnswerText(currentQ)}`
                        : getExpectedAnswerText(currentQ)}
                    </span>
                  </div>
                )}

                {currentQ.explain && (
                  <div className="mt-2 text-xs font-bold opacity-90 border-t border-white/20 pt-2 text-left">
                    💡 Căn cứ bài đọc: {currentQ.explain}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {qType === 'unscramble' && !answered ? (
                <Button3D tone="white" onClick={resetUnscramble} className="px-4 py-2.5 text-sm">
                  <RotateCcw className="h-4 w-4 mr-1" /> Làm lại
                </Button3D>
              ) : (
                <div />
              )}

              {!answered ? (
                <Button3D
                  tone="sky"
                  onClick={handleCheck}
                  disabled={!canCheck()}
                  className="px-8 py-3 text-base sm:text-lg"
                >
                  <Check className="h-5 w-5 mr-1" /> Kiểm tra câu này
                </Button3D>
              ) : (
                <Button3D
                  tone={isLast ? 'peach' : 'mint'}
                  onClick={handleNext}
                  className="px-8 py-3 text-base sm:text-lg"
                >
                  {isLast ? 'Hoàn thành bài đọc 📖 →' : 'Câu tiếp theo →'}
                </Button3D>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
