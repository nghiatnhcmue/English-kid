import { useState, useRef, useEffect, useMemo } from 'react';
import { Mic, Volume2, RotateCcw, Check, Sparkles, MessageCircle, BookOpen, VolumeX, AlertCircle, Play, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button3D, SpeakerButton, SlowSpeakerButton, Stars } from '../ui.jsx';
import { createRecorder, isRecordingSupported } from '../../utils/recorder.js';
import { isSttSupported, recognizeOnce, speak } from '../../utils/speech.js';
import { similarity, speakingLevel } from '../../utils/scene.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';

/**
 * Hàm so sánh từng từ giữa câu mẫu và câu máy nghe được
 */
function compareWords(targetSentence, spokenSentence) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetWords = (targetSentence || '').split(/\s+/).filter(Boolean);
  const spokenWords = (spokenSentence || '').split(/\s+/).map(norm).filter(Boolean);

  return targetWords.map((origWord) => {
    const cleanOrig = norm(origWord);
    const isMatched = spokenWords.includes(cleanOrig);
    return {
      word: origWord,
      matched: isMatched,
    };
  });
}

export default function SpeakingStation({ unit, onFinish }) {
  const { settings } = useSettings();
  const speaking = unit?.speaking;
  const vocabularies = unit?.vocabularies || [];

  // Danh sách các câu luyện tập (Everyday English & Challenges)
  const challengeList = useMemo(() => {
    if (speaking?.challenges?.length) return speaking.challenges;
    // Fallback nếu không có challenges
    return [
      {
        id: 'spk-fallback',
        level: 'Mẫu câu cốt lõi',
        sentenceEn: speaking?.targetSentence || 'I love English.',
        phonetic: speaking?.phonetic || '',
        meaningVi: speaking?.meaningVi || '',
        tipsVi: 'Luyện đọc to rõ từng từ và ngữ điệu tự nhiên.',
      },
    ];
  }, [speaking]);

  // Tab: 'sentences' (Mẫu câu giao tiếp) | 'vocab' (Từ vựng)
  const [mode, setMode] = useState('sentences');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedVocabIdx, setSelectedVocabIdx] = useState(0);

  // Ghi âm và chấm điểm
  const recorder = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // 'idle' | 'recording' | 'evaluating' | 'done'
  const [audioUrl, setAudioUrl] = useState(null);
  const [recognizedText, setRecognizedText] = useState(null);
  const [scorePercent, setScorePercent] = useState(null);
  const [stars, setStars] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [micError, setMicError] = useState(null);
  const sttRun = useRef(0);

  useEffect(() => {
    recorder.current = createRecorder();
    return () => recorder.current?.release();
  }, []);

  // Mục tiêu luyện nói hiện tại (tuỳ theo mode)
  const currentTarget = useMemo(() => {
    if (mode === 'sentences') {
      const item = challengeList[selectedIdx] || challengeList[0];
      return {
        sentenceEn: item.sentenceEn,
        phonetic: item.phonetic,
        meaningVi: item.meaningVi,
        tipsVi: item.tipsVi,
        dialogue: item.dialogue,
        level: item.level,
      };
    } else {
      const v = vocabularies[selectedVocabIdx] || vocabularies[0];
      return {
        sentenceEn: v?.word || '',
        phonetic: v?.phonetic || '',
        meaningVi: v?.meaning || '',
        tipsVi: `Loại từ: [${v?.type || 'từ vựng'}] · Ví dụ: "${v?.example || ''}"`,
        dialogue: null,
        level: `Từ vựng ${selectedVocabIdx + 1}/${vocabularies.length}`,
      };
    }
  }, [mode, selectedIdx, selectedVocabIdx, challengeList, vocabularies]);

  // Reset trạng thái chấm điểm khi đổi câu/từ
  const handleSelectSentence = (idx) => {
    playSfx('click');
    setSelectedIdx(idx);
    resetState();
  };

  const handleSelectVocab = (idx) => {
    playSfx('click');
    setSelectedVocabIdx(idx);
    resetState();
  };

  const resetState = () => {
    setRecordingStatus('idle');
    setAudioUrl(null);
    setRecognizedText(null);
    setScorePercent(null);
    setMicError(null);
  };

  // Bắt đầu ghi âm
  const startRecord = async () => {
    playSfx('click');
    setAudioUrl(null);
    setRecognizedText(null);
    setScorePercent(null);
    setMicError(null);

    const res = await recorder.current?.start();
    if (!res.ok) {
      setMicError(res.message);
      setRecordingStatus('done');
      return;
    }
    setRecordingStatus('recording');

    // Nhận diện giọng nói STT
    if (isSttSupported()) {
      const run = ++sttRun.current;
      recognizeOnce({ lang: settings.lang || 'en-GB', timeoutMs: 10000 }).then(async (r) => {
        if (run !== sttRun.current) return;
        const url = await recorder.current?.stop();
        setAudioUrl(url);
        evaluateSpokenResult(r?.transcripts || []);
      });
    } else {
      // Trình duyệt không hỗ trợ Web Speech STT nhưng vẫn ghi âm được
      setTimeout(async () => {
        if (recordingStatus === 'recording') {
          const url = await recorder.current?.stop();
          setAudioUrl(url);
          setRecordingStatus('done');
          setScorePercent(85);
          setStars(3);
          setFeedback('Đã thu âm giọng nói của em! Bấm nghe lại để so sánh với bản xứ nhé!');
          playSfx('correct');
        }
      }, 5000);
    }
  };

  // Dừng ghi âm thủ công
  const stopRecord = async () => {
    const url = await recorder.current?.stop();
    setAudioUrl(url);
    if (!recognizedText && isSttSupported()) {
      setRecordingStatus('evaluating');
    } else {
      setRecordingStatus('done');
    }
  };

  // Đánh giá kết quả nhận diện giọng nói
  const evaluateSpokenResult = (transcripts) => {
    setRecordingStatus('done');
    const target = currentTarget.sentenceEn;

    if (!transcripts || !transcripts.length) {
      setRecognizedText('(Chưa nhận diện rõ âm thanh, em thử nói to và gần micro hơn nhé)');
      setScorePercent(40);
      setStars(1);
      setFeedback('Chưa nghe rõ giọng em. Đừng nản nhé, hãy nghe lại loa và thử lại!');
      playSfx('wrong');
      return;
    }

    // Tìm phương án phiên âm có độ tương đồng cao nhất
    const best = transcripts.reduce(
      (acc, tr) => {
        const s = similarity(tr, target);
        return s > acc.s ? { s, tr } : acc;
      },
      { s: -1, tr: transcripts[0] },
    );

    const percent = Math.round(best.s * 100);
    setRecognizedText(best.tr);
    setScorePercent(percent);

    if (percent >= 80) {
      setStars(3);
      setFeedback('🌟 Xuất sắc! Phát âm rất chuẩn và ngữ điệu vô cùng tự nhiên!');
      playSfx('victory');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else if (percent >= 50) {
      setStars(2);
      setFeedback('👍 Rất tốt! Em đã phát âm rõ hầu hết các từ quan trọng!');
      playSfx('correct');
    } else {
      setStars(1);
      setFeedback('💪 Cố gắng lên nhé! Nghe lại giọng bản xứ đọc chậm rồi thử lại nào!');
      playSfx('click');
    }
  };

  // Phân tích từng từ khi đã có recognizedText
  const wordAnalysis = useMemo(() => {
    if (!recognizedText || recordingStatus !== 'done') return null;
    return compareWords(currentTarget.sentenceEn, recognizedText);
  }, [currentTarget.sentenceEn, recognizedText, recordingStatus]);

  return (
    <div className="flex flex-col gap-6">
      {/* Khối Tiêu đề & Chọn Chế độ Luyện Nói */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[2rem] bg-gradient-to-r from-peach-soft via-cream to-banana-soft p-5 sm:p-6 shadow-[0_6px_0_#efe3cc] border-3 border-peach/30">
        <div>
          <span className="rounded-full bg-peach text-white px-3 py-1 text-xs font-black uppercase shadow-2xs">
            {speaking?.situationalTopic || 'Everyday English · Luyện Nói Giao Tiếp'}
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            🎙️ Phòng Luyện Nói & Chấm Điểm AI
          </h2>
          <p className="mt-1 text-sm sm:text-base font-bold text-ink-soft">
            Luyện nhại giọng (Shadowing), nghe đối chiếu bản xứ và xem máy phân tích từng từ
          </p>
        </div>

        {/* 2 Chế độ: Mẫu câu vs Từ vựng */}
        <div className="flex shrink-0 gap-1.5 rounded-2xl bg-white/90 p-1.5 border border-banana-soft shadow-xs">
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              setMode('sentences');
              resetState();
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-all cursor-pointer ${
              mode === 'sentences'
                ? 'bg-peach text-white shadow-xs'
                : 'text-ink-soft hover:bg-cream hover:text-ink'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Mẫu câu ({challengeList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              setMode('vocab');
              resetState();
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-all cursor-pointer ${
              mode === 'vocab'
                ? 'bg-banana text-ink shadow-xs'
                : 'text-ink-soft hover:bg-cream hover:text-ink'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Từ vựng ({vocabularies.length})</span>
          </button>
        </div>
      </div>

      {/* Danh sách các câu hoặc từ để chọn */}
      {mode === 'sentences' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {challengeList.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => handleSelectSentence(idx)}
                className={`flex flex-col items-start rounded-2xl p-3.5 text-left transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-peach text-white border-peach-dark shadow-[0_4px_0_var(--color-peach-dark)] scale-102'
                    : 'bg-white text-ink border-banana-soft hover:bg-cream hover:border-banana shadow-2xs'
                }`}
              >
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                  isSelected ? 'bg-white/30 text-white' : 'bg-cream text-ink-soft'
                }`}>
                  {item.level || `Câu ${idx + 1}`}
                </span>
                <span className="mt-1.5 text-sm font-black line-clamp-1 leading-snug">
                  {item.sentenceEn}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {vocabularies.map((v, idx) => {
            const isSelected = selectedVocabIdx === idx;
            return (
              <button
                key={v.id || idx}
                type="button"
                onClick={() => handleSelectVocab(idx)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-banana text-ink border-banana-dark shadow-[0_3px_0_#d8b13c] scale-105'
                    : 'bg-white text-ink-soft border-banana-soft hover:bg-cream hover:text-ink'
                }`}
              >
                <span>{v.emoji || '💬'}</span>
                <span>{v.word}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Thẻ Luyện Nói Chính */}
      <section aria-label="Khu vực luyện nói" className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col gap-6">
        {/* Lời gợi ý trong bối cảnh đối thoại (nếu có) */}
        {currentTarget.dialogue && (
          <div className="flex items-center gap-3 rounded-2xl bg-cream/90 p-4 border border-banana-soft text-sm sm:text-base font-bold text-ink">
            <span className="rounded-xl bg-banana px-3 py-1 font-black text-xs text-ink shrink-0">
              {currentTarget.dialogue.speaker || 'Gợi ý'}:
            </span>
            <span className="italic">&quot;{currentTarget.dialogue.prompt}&quot;</span>
          </div>
        )}

        {/* Câu / Từ mục tiêu cần nói */}
        <div className="flex flex-col items-center text-center gap-2">
          <span className="rounded-full bg-peach-soft px-3.5 py-1 text-xs font-black text-peach-dark uppercase">
            {currentTarget.level}
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-ink leading-tight">
            &quot;{currentTarget.sentenceEn}&quot;
          </h3>
          {currentTarget.phonetic && (
            <p className="font-mono text-lg sm:text-xl font-bold text-sky-dark">
              {currentTarget.phonetic}
            </p>
          )}
          <p className="text-base sm:text-lg font-bold text-ink-soft">
            ({currentTarget.meaningVi})
          </p>
        </div>

        {/* Mẹo phát âm tiếng Việt */}
        {currentTarget.tipsVi && (
          <div className="rounded-2xl bg-mint-soft/50 p-4 text-sm sm:text-base font-bold text-ink border border-mint/30 flex items-start gap-2.5">
            <span className="text-xl shrink-0" aria-hidden>💡</span>
            <div>
              <strong className="text-mint-dark">Mẹo phát âm:</strong> {currentTarget.tipsVi}
            </div>
          </div>
        )}

        {/* Các nút Nghe Mẫu Bản Xứ */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 rounded-2xl bg-cream p-2 border border-banana-soft shadow-xs">
            <SpeakerButton text={currentTarget.sentenceEn} audio={currentTarget.audio} size="lg" />
            <span className="text-xs sm:text-sm font-black text-ink pr-2">Nghe bản xứ chuẩn</span>
          </div>
          <button
            type="button"
            onClick={() => speak(currentTarget.sentenceEn, { rate: 0.65, audio: currentTarget.audio })}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm sm:text-base font-black text-ink shadow-sm border border-banana-soft hover:bg-cream active:translate-y-0.5 cursor-pointer"
          >
            <span>🐢 Nghe chậm từng từ</span>
          </button>
        </div>

        {/* KHU VỰC THU ÂM (MICRO) */}
        <div className="flex flex-col items-center gap-3 py-4 border-t-2 border-dashed border-banana-soft">
          {recordingStatus === 'recording' ? (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={stopRecord}
                className="animate-pulse inline-flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_6px_0_#b91c1c] hover:bg-rose-600 cursor-pointer transition-all"
                title="Bấm để kết thúc và xem điểm"
              >
                <div className="h-8 w-8 rounded-lg bg-white" />
              </button>
              <div className="flex items-center gap-2 text-rose-600 font-black text-base animate-pulse">
                <span className="h-3 w-3 rounded-full bg-rose-600" />
                <span>Đang thu âm... Em nói to vào micro nhé! Bấm lại để xem điểm.</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={startRecord}
                className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-peach text-white shadow-[0_7px_0_var(--color-peach-dark)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                title="Bấm vào để nói"
              >
                <Mic className="h-11 w-11" />
              </button>
              <span className="text-base font-black text-ink">
                Bấm vào chiếc Micro màu cam và đọc to câu trên
              </span>
              <span className="text-xs font-bold text-ink-soft">
                (Máy sẽ tự động lắng nghe và chấm điểm phát âm cho em)
              </span>
            </div>
          )}

          {micError && (
            <div className="rounded-2xl bg-rose-50 p-3 text-xs sm:text-sm font-bold text-rose-700 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* KẾT QUẢ CHẤM ĐIỂM AI & PHÂN TÍCH TỪNG TỪ */}
        {recordingStatus === 'done' && (
          <div className="rounded-3xl bg-gradient-to-br from-cream via-white to-peach-soft/30 p-6 border-2 border-banana flex flex-col gap-5 text-center animate-fade-in shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-banana-soft pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-peach" />
                <h4 className="text-xl sm:text-2xl font-black text-ink">Kết quả AI đánh giá</h4>
              </div>
              {scorePercent !== null && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-banana px-3 py-1 font-mono text-base font-black text-ink shadow-xs">
                    {scorePercent}% Chính xác
                  </span>
                  <Stars count={stars} className="text-2xl" />
                </div>
              )}
            </div>

            {/* Lời nhận xét */}
            <p className="text-base sm:text-lg font-black text-peach-dark">
              {feedback}
            </p>

            {/* Phân tích từng từ trong câu */}
            {wordAnalysis && (
              <div className="flex flex-col items-center gap-2 bg-white/80 p-4 rounded-2xl border border-banana-soft">
                <span className="text-xs font-black uppercase text-ink-soft">
                  Chi tiết từng từ máy nghe được:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {wordAnalysis.map((item, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-base font-black transition-all ${
                        item.matched
                          ? 'bg-mint-soft text-mint-dark ring-2 ring-mint border border-mint/40'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-300'
                      }`}
                    >
                      <span>{item.word}</span>
                      {item.matched && <CheckCircle2 className="h-4 w-4 text-mint-dark" />}
                    </span>
                  ))}
                </div>
                {recognizedText && (
                  <p className="text-xs font-bold text-ink-soft mt-1">
                    Máy nhận dạng âm thanh: &quot;{recognizedText}&quot;
                  </p>
                )}
              </div>
            )}

            {/* Nghe lại giọng thu của chính em */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {audioUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const a = new Audio(audioUrl);
                    a.play();
                  }}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-peach px-6 text-base font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none cursor-pointer"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>▶️ Nghe lại giọng của em</span>
                </button>
              )}
              <button
                type="button"
                onClick={startRecord}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-banana px-5 text-sm font-black text-ink shadow-[0_3px_0_#d8b13c] hover:bg-banana-dark hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" /> Nói lại lần nữa
              </button>
            </div>
          </div>
        )}

        {/* Nút Hoàn thành / Tiếp tục sang câu tiếp theo */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-banana-soft">
          <span className="text-xs sm:text-sm font-bold text-ink-soft">
            Mẹo: Luyện đọc to nhiều lần sẽ giúp phản xạ tiếng Anh tự nhiên hơn!
          </span>
          <div className="flex items-center gap-2">
            {mode === 'sentences' && selectedIdx + 1 < challengeList.length ? (
              <Button3D
                tone="peach"
                onClick={() => handleSelectSentence(selectedIdx + 1)}
                className="px-5 py-2.5 text-sm"
              >
                Sang câu tiếp theo →
              </Button3D>
            ) : (
              <Button3D
                tone="mint"
                onClick={() => {
                  playSfx('victory');
                  confetti({ particleCount: 50, spread: 60 });
                  onFinish?.(stars, 'Đã hoàn thành luyện Nói!');
                }}
                className="px-5 py-2.5 text-sm"
              >
                Hoàn thành xuất sắc 🌟
              </Button3D>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

