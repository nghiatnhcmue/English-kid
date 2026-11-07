import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { SpeakerButton, SlowSpeakerButton, Button3D } from '../ui.jsx';
import { speak } from '../../utils/speech.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';

/**
 * Trạm Luyện Phát Âm & Ngữ Âm chuẩn SGK Global Success 6 (A Closer Look 1):
 * - Hướng dẫn khẩu hình, đặt lưỡi & độ rung thanh quản bằng tiếng Việt
 * - Cặp âm mục tiêu với từ ví dụ có highlight chữ cái
 * - Trò chơi phân biệt âm (Sound Sorter Quiz) có chấm điểm & thưởng sao
 * - Câu luyện cơ miệng (Tongue Twister)
 */
export default function PronunciationStation({ unit, onFinish }) {
  const { settings } = useSettings();
  const pron = unit?.pronunciation;
  // Từ nào trùng từ vựng của Unit thì dùng file mp3 thu sẵn (chạy offline), còn lại mới đọc online/TTS
  const audioFor = useMemo(() => {
    const map = new Map((unit?.vocabularies || []).map((v) => [v.word.toLowerCase(), v.audio]));
    return (text) => map.get(String(text || '').toLowerCase()) || null;
  }, [unit]);

  // Trạng thái phần luyện tập trắc nghiệm phân biệt âm
  const quizList = useMemo(() => pron?.practiceQuiz || [], [pron]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!pron) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-ink-soft">
        Bài học này đang được chuẩn bị ngữ âm.
      </div>
    );
  }

  const currentQuiz = quizList[quizIndex];

  const handleChoose = (opt) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(opt);

    const isCorrect = opt === currentQuiz.correctSound;
    if (isCorrect) {
      playSfx('correct');
      setScore((s) => s + 1);
    } else {
      playSfx('wrong');
    }

    setTimeout(() => {
      if (quizIndex + 1 < quizList.length) {
        setQuizIndex((i) => i + 1);
        setSelectedOpt(null);
      } else {
        setIsCompleted(true);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        playSfx('victory');
        onFinish?.();
      }
    }, 1200);
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setSelectedOpt(null);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Thẻ Tiêu đề bài học phát âm */}
      <div className="rounded-[2rem] bg-gradient-to-r from-banana via-cream to-peach-soft p-5 sm:p-6 shadow-[0_6px_0_#efe3cc] border-3 border-banana-soft">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase text-peach-dark shadow-2xs">
          A Closer Look 1 · Ngữ âm chuẩn SGK
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-black text-ink">
          {pron.title}
        </h2>
        <p className="mt-1 text-sm sm:text-base font-bold text-ink-soft">
          Học cách đặt khẩu hình miệng, phân biệt cặp âm qua từ vựng thực tế và bài tập nghe phản xạ
        </p>
      </div>

      {/* 2 Khối Cặp âm đối xứng */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Âm 1 */}
        <section aria-label={pron.sound1.name} className="flex flex-col justify-between rounded-3xl bg-white p-5 sm:p-6 shadow-[0_5px_0_#efe3cc] border-2 border-banana-soft">
          <div>
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <span className="rounded-2xl bg-banana px-4 py-1.5 font-mono text-2xl sm:text-3xl font-black text-ink shadow-xs">
                {pron.sound1.symbol}
              </span>
              <span className="text-sm font-black text-ink-soft">{pron.sound1.name}</span>
            </div>

            <p className="mt-3 text-sm font-bold text-ink bg-cream p-3 rounded-2xl border border-[#efe3cc]">
              💡 <strong>Khẩu hình:</strong> {pron.sound1.guideVi}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-black uppercase text-ink-soft">Ví dụ (bấm để nghe):</span>
              <div className="grid grid-cols-2 gap-2">
                {pron.sound1.words.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => speak(w.word, { ...settings, audio: audioFor(w.word) })}
                    className="group flex flex-col items-start rounded-2xl bg-cream/70 p-3 text-left hover:bg-banana hover:shadow-xs transition-all cursor-pointer border border-[#efe3cc]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base font-black text-ink group-hover:text-ink">
                        {w.word}
                      </span>
                      <Volume2 className="h-4 w-4 text-ink-soft group-hover:text-ink" />
                    </div>
                    <span className="text-xs font-bold text-ink-soft group-hover:text-ink/80 mt-0.5">
                      ({w.meaning})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Âm 2 */}
        <section aria-label={pron.sound2.name} className="flex flex-col justify-between rounded-3xl bg-white p-5 sm:p-6 shadow-[0_5px_0_#ffd2bf] border-2 border-peach/30">
          <div>
            <div className="flex items-center justify-between border-b border-peach/20 pb-3">
              <span className="rounded-2xl bg-peach px-4 py-1.5 font-mono text-2xl sm:text-3xl font-black text-white shadow-xs">
                {pron.sound2.symbol}
              </span>
              <span className="text-sm font-black text-peach-dark">{pron.sound2.name}</span>
            </div>

            <p className="mt-3 text-sm font-bold text-ink bg-peach-soft/40 p-3 rounded-2xl border border-peach/20">
              💡 <strong>Khẩu hình:</strong> {pron.sound2.guideVi}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-black uppercase text-peach-dark">Ví dụ (bấm để nghe):</span>
              <div className="grid grid-cols-2 gap-2">
                {pron.sound2.words.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => speak(w.word, { ...settings, audio: audioFor(w.word) })}
                    className="group flex flex-col items-start rounded-2xl bg-peach-soft/30 p-3 text-left hover:bg-peach hover:text-white hover:shadow-xs transition-all cursor-pointer border border-peach/30"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base font-black text-ink group-hover:text-white">
                        {w.word}
                      </span>
                      <Volume2 className="h-4 w-4 text-peach-dark group-hover:text-white" />
                    </div>
                    <span className="text-xs font-bold text-ink-soft group-hover:text-white/90 mt-0.5">
                      ({w.meaning})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Trò chơi Trắc nghiệm phân biệt âm */}
      <section aria-label="Thử thách phân biệt âm" className="rounded-[2.5rem] bg-white p-6 sm:p-7 shadow-[0_6px_0_#efe3cc] border-3 border-banana-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-banana-soft pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden>🎮</span>
            <h3 className="text-xl sm:text-2xl font-black text-ink">
              Thử thách: Nghe và chọn đúng âm
            </h3>
          </div>
          <span className="rounded-full bg-cream px-3 py-1 text-xs sm:text-sm font-black text-ink-soft border border-banana-soft">
            Câu {quizIndex + 1} / {quizList.length}
          </span>
        </div>

        {!isCompleted ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-5 text-center">
            <p className="text-sm sm:text-base font-bold text-ink-soft">
              Bấm vào chiếc loa to để nghe từ phát âm, sau đó chọn âm tương ứng nhé:
            </p>

            {/* Nút loa phát âm từ trắc nghiệm */}
            <div className="flex flex-col items-center gap-2">
              <SpeakerButton
                text={currentQuiz.word}
                audio={audioFor(currentQuiz.word)}
                size="xl"
                className="shadow-[0_6px_0_var(--color-peach-dark)]"
              />
              <span className="text-xs font-bold text-ink-soft">Bấm để nghe lại</span>
            </div>

            <div className="text-center">
              <h4 className="text-3xl font-black text-ink">{currentQuiz.word}</h4>
              <p className="text-sm font-bold text-ink-soft mt-0.5">({currentQuiz.meaning})</p>
            </div>

            {/* 2 Lựa chọn âm */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-2">
              {currentQuiz.options.map((opt) => {
                const isSelected = selectedOpt === opt;
                const isRight = isSelected && opt === currentQuiz.correctSound;
                const isWrong = isSelected && opt !== currentQuiz.correctSound;

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={selectedOpt !== null}
                    onClick={() => handleChoose(opt)}
                    className={`min-h-20 rounded-3xl font-mono text-2xl sm:text-3xl font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                      isRight
                        ? 'bg-mint text-white ring-4 ring-mint-dark scale-105'
                        : isWrong
                          ? 'bg-rose-soft text-peach-dark ring-4 ring-rose-500'
                          : 'bg-cream text-ink hover:bg-banana hover:-translate-y-0.5 active:translate-y-1'
                    }`}
                  >
                    <span>{opt}</span>
                    {isRight && <CheckCircle2 className="h-6 w-6" />}
                    {isWrong && <XCircle className="h-6 w-6" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center gap-4 text-center py-4">
            <span className="text-5xl" aria-hidden>🎉</span>
            <h4 className="text-2xl sm:text-3xl font-black text-ink">
              Em đã hoàn thành xuất sắc thử thách!
            </h4>
            <p className="text-base font-bold text-ink-soft">
              Kết quả: <strong className="text-mint-dark text-xl">{score} / {quizList.length}</strong> câu chính xác.
            </p>
            <Button3D tone="banana" onClick={restartQuiz} className="px-6 py-3 text-base">
              <RotateCcw className="h-4 w-4" /> <span>Luyện tập lại</span>
            </Button3D>
          </div>
        )}
      </section>

      {/* Câu luyện cơ miệng (Tongue Twister) */}
      {pron.tongueTwister && (
        <section aria-label="Câu luyện đọc cơ miệng" className="rounded-3xl bg-cream/70 p-5 sm:p-6 border-2 border-banana-soft shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="rounded-full bg-banana px-3 py-0.5 text-xs font-black text-ink">
                👅 Tongue Twister · Câu vè luyện cơ miệng
              </span>
              <p className="mt-2 text-lg sm:text-xl font-black text-ink">
                &quot;{pron.tongueTwister.en}&quot;
              </p>
              <p className="mt-1 text-sm font-bold text-ink-soft">
                ({pron.tongueTwister.vi})
              </p>
            </div>
            <SpeakerButton text={pron.tongueTwister.en} size="md" />
          </div>
        </section>
      )}
    </div>
  );
}

