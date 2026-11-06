import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Headphones, Volume2, RotateCcw, CheckCircle2, XCircle, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Button3D, SpeakerButton } from '../ui.jsx';
import { speak } from '../../utils/speech.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import { store } from '../../utils/storage.js';

/**
 * Trạm Luyện Nghe (Skills 2 / Listening Comprehension):
 * - Hội thoại học đường chuẩn bản ngữ SGK Global Success 6
 * - Hỗ trợ nghe tốc độ chuẩn + Nghe chậm 0.65x cho học sinh nắm bắt âm
 * - Bài tập trắc nghiệm nghe hiểu có chấm điểm và lời giải
 * - Lời thoại (Transcript) và dịch nghĩa mở sau khi làm bài
 */
export default function ListeningStation({ unit, onFinish }) {
  const { settings } = useSettings();
  const listening = unit?.listening;

  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [slowPlaying, setSlowPlaying] = useState(false);

  const handlePlaySlow = async () => {
    if (slowPlaying) return;
    setSlowPlaying(true);
    try {
      await speak(listening.transcript, { rate: 0.65, audio: listening.audio });
    } finally {
      setSlowPlaying(false);
    }
  };

  if (!listening) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-ink-soft">
        Bài nghe của Unit này đang được cập nhật.
      </div>
    );
  }

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    const isCorrect = idx === listening.answerIndex;
    if (isCorrect) {
      playSfx('correct');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else {
      playSfx('wrong');
    }
    // Ghi nhận tiến độ làm bài nghe của học sinh và đồng bộ cho giáo viên
    store().recordStationProgress(unit.unitId, 'listenstation', {
      correct: isCorrect,
      score: isCorrect ? 10 : 5,
      stars: isCorrect ? 3 : 1,
    });
  };

  const handleReset = () => {
    setAnswered(false);
    setSelectedIdx(null);
    setShowTranscript(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Tiêu đề Trạm Nghe */}
      <div className="rounded-[2rem] bg-gradient-to-r from-sky-soft via-cream to-banana-soft p-5 sm:p-6 shadow-[0_6px_0_#efe3cc] border-3 border-sky/30">
        <span className="rounded-full bg-sky px-3 py-1 text-xs font-black uppercase text-ink shadow-2xs">
          Skills 2 · Luyện Nghe Hiểu Chuẩn Bản Ngữ
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-black text-ink">
          👂 Luyện Nghe Hội Thoại Học Đường
        </h2>
        <p className="mt-1 text-sm sm:text-base font-bold text-ink-soft">
          Nghe đoạn hội thoại thực tế của Unit {unit.unitId}, rèn luyện phản xạ bắt từ khóa và làm bài trắc nghiệm
        </p>
      </div>

      {/* Thẻ Phát Âm Thanh Đoạn Nghe */}
      <section aria-label="Khu vực nghe hội thoại" className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col items-center text-center gap-5">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
            Bấm nút loa để nghe hội thoại:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-cream p-2 border border-banana-soft shadow-xs">
              <SpeakerButton text={listening.transcript} audio={listening.audio} size="xl" />
              <span className="text-sm font-black text-ink pr-3">Nghe tốc độ chuẩn</span>
            </div>
            <button
              type="button"
              onClick={handlePlaySlow}
              disabled={slowPlaying}
              className={`inline-flex min-h-14 items-center gap-2 rounded-2xl px-5 text-base font-black transition-all cursor-pointer shadow-sm border ${
                slowPlaying
                  ? 'bg-sky-soft text-sky-dark border-sky ring-2 ring-sky/50 animate-pulse'
                  : 'bg-white text-ink border-banana-soft hover:bg-cream active:translate-y-0.5'
              }`}
            >
              <span>🐢 {slowPlaying ? 'Đang đọc chậm...' : 'Nghe chậm (0.65x)'}</span>
            </button>
          </div>
          <p className="text-xs font-bold text-ink-soft max-w-md">
            Mẹo: Nghe 2-3 lần. Lần đầu nghe nắm ý chính, lần sau nghe chậm để bắt rõ các từ quan trọng!
          </p>
        </div>

        {/* Câu hỏi trắc nghiệm nghe hiểu */}
        <div className="w-full flex flex-col gap-3 pt-4 border-t-2 border-banana-soft text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>❓</span>
            <h3 className="text-lg sm:text-xl font-black text-ink">
              {listening.question}
            </h3>
          </div>

          <div className="grid gap-3 pt-1">
            {listening.options?.map((opt, idx) => {
              let style = 'bg-cream/60 text-ink border-2 border-banana-soft hover:bg-banana/30 hover:border-banana';
              let icon = null;

              if (answered) {
                if (idx === listening.answerIndex) {
                  style = 'bg-mint text-white border-2 border-mint-dark font-black shadow-sm ring-2 ring-mint-dark/40';
                  icon = <CheckCircle2 className="h-5 w-5 text-white shrink-0" />;
                } else if (idx === selectedIdx) {
                  style = 'bg-rose-soft text-peach-dark border-2 border-rose-400 font-black';
                  icon = <XCircle className="h-5 w-5 text-peach-dark shrink-0" />;
                } else {
                  style = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={answered}
                  onClick={() => handleSelect(idx)}
                  className={`flex min-h-14 items-center justify-between rounded-2xl px-5 py-3 text-base sm:text-lg font-bold transition-all cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black">{String.fromCharCode(65 + idx)}.</span>
                    <span>{opt}</span>
                  </div>
                  {icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lời thoại Transcript và Lời giải (hiện sau khi làm hoặc khi bấm xem) */}
        {answered && (
          <div className="w-full rounded-2xl bg-cream p-5 text-left border border-banana flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-black uppercase text-ink">
                <FileText className="h-4 w-4 text-sky-dark" />
                <span>Lời thoại hội thoại (Transcript):</span>
              </span>
              <button
                type="button"
                onClick={() => speak(listening.transcript, { audio: listening.audio })}
                className="text-xs font-black text-sky-dark hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" /> Nghe lại
              </button>
            </div>
            <p className="text-base font-black text-ink italic bg-white p-3.5 rounded-xl border border-banana-soft">
              &quot;{listening.transcript}&quot;
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-banana-soft">
              <span className="text-xs font-bold text-ink-soft">
                {selectedIdx === listening.answerIndex
                  ? '🎉 Em đã nghe và chọn đáp án hoàn toàn chính xác!'
                  : '💡 Em hãy nghe lại và đối chiếu với lời thoại phía trên nhé!'}
              </span>
              <div className="flex items-center gap-2">
                <Button3D tone="banana" onClick={handleReset} className="px-4 py-2 text-sm">
                  <RotateCcw className="h-4 w-4" /> Làm lại
                </Button3D>
                <Button3D
                  tone="mint"
                  onClick={() => onFinish?.(selectedIdx === listening.answerIndex ? 3 : 1, 'Đã hoàn thành bài nghe!')}
                  className="px-5 py-2 text-sm"
                >
                  Hoàn thành trạm Nghe →
                </Button3D>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

