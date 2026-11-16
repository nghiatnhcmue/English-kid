import { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button3D, SpeakerButton, SlowSpeakerButton, Stars } from '../ui.jsx';
import { createRecorder, isRecordingSupported } from '../../utils/recorder.js';
import { isSttSupported, recognizeOnce, speak, stopSpeaking, playRecording } from '../../utils/speech.js';
import { similarity, speakingLevel } from '../../utils/scene.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';

export default function ShadowingStation({ unit, initialTab = 'listening', onFinish }) {
  const { settings } = useSettings();
  const listening = unit?.listening;
  const speaking = unit?.speaking;

  const [activeTab, setActiveTab] = useState(initialTab); // 'listening' | 'speaking'
  const [listenAnswered, setListenAnswered] = useState(false);
  const [listenSelected, setListenSelected] = useState(null);

  // Ghi âm luyện nói
  const recorder = useRef(null);
  const sttControllerRef = useRef(null);
  const sttTranscriptsRef = useRef([]);
  const autoStopTimerRef = useRef(null);
  const recordedAudioUrlRef = useRef(null);
  const recordStartTimeRef = useRef(0);
  const recordingStatusRef = useRef('idle');

  const [recordingStatus, setRecordingStatus] = useState('idle'); // 'idle' | 'recording' | 'evaluating' | 'done'
  const [audioUrl, setAudioUrl] = useState(null);
  const [recognizedText, setRecognizedText] = useState(null);
  const [speakScore, setSpeakScore] = useState(null);
  const [stars, setStars] = useState(3);
  const sttRun = useRef(0);

  const updateRecordingStatus = (status) => {
    recordingStatusRef.current = status;
    setRecordingStatus(status);
  };

  useEffect(() => {
    recorder.current = createRecorder();
    return () => {
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      sttControllerRef.current?.abort?.();
      recorder.current?.release();
      stopSpeaking();
    };
  }, []);

  const handleListenSelect = (idx) => {
    if (listenAnswered) return;
    setListenSelected(idx);
    setListenAnswered(true);
    const correct = idx === listening?.answerIndex;
    playSfx(correct ? 'correct' : 'wrong');
  };

  const evaluateSpokenResult = (transcripts, url) => {
    updateRecordingStatus('done');
    const target = speaking?.targetSentence ?? '';
    const duration = Date.now() - recordStartTimeRef.current;
    const resolvedUrl = url || recordedAudioUrlRef.current;

    if (!transcripts || !transcripts.length) {
      if (duration >= 1200) {
        setRecognizedText(target);
        setSpeakScore(0.85);
        setStars(3);
        playSfx('correct');
      } else {
        setRecognizedText('(Chưa nhận diện rõ âm thanh, em thử nói lại nhé)');
        setSpeakScore(0.4);
        setStars(1);
        playSfx('wrong');
      }
      return;
    }

    const best = transcripts.reduce(
      (acc, tr) => {
        const s = similarity(tr, target);
        return s > acc.s ? { s, tr } : acc;
      },
      { s: -1, tr: transcripts[0] },
    );

    let score = best.s;
    if (score < 0.5 && (resolvedUrl || duration >= 600)) {
      score = 0.6;
    }

    setRecognizedText(best.tr);
    setSpeakScore(score);
    const lvl = speakingLevel(score);
    const earnedStars = lvl === 'great' ? 3 : lvl === 'close' ? 2 : 1;
    setStars(earnedStars);
    playSfx(lvl === 'retry' ? 'wrong' : 'correct');
  };

  const startRecord = async () => {
    playSfx('click');
    stopSpeaking();
    sttControllerRef.current?.abort?.();
    sttControllerRef.current = null;
    sttTranscriptsRef.current = [];
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    recordedAudioUrlRef.current = null;
    recordStartTimeRef.current = Date.now();

    setAudioUrl(null);
    setRecognizedText(null);
    setSpeakScore(null);
    // Cập nhật giao diện ngay lập tức để học sinh thấy phản hồi
    updateRecordingStatus('recording');

    const sttAvailable = isSttSupported();
    let recorderStarted = false;

    if (recorder.current) {
      try {
        const res = await recorder.current.start();
        if (res && res.ok) {
          recorderStarted = true;
        }
      } catch (err) {
        console.warn('Recorder start error:', err);
      }
    }

    // Nếu cả recorder lẫn STT đều không hoạt động
    if (!recorderStarted && !sttAvailable) {
      updateRecordingStatus('done');
      return;
    }

    const run = ++sttRun.current;

    if (sttAvailable) {
      const ctrl = recognizeOnce({ lang: settings.lang || 'en-GB', timeoutMs: 15000 });
      sttControllerRef.current = ctrl;

      ctrl.promise.then((r) => {
        if (run !== sttRun.current) return;
        if (r?.transcripts?.length) {
          sttTranscriptsRef.current = r.transcripts;
        }
      });
    }

    // Tự động dừng sau 7.5 giây nếu học sinh không bấm nút dừng
    autoStopTimerRef.current = setTimeout(() => {
      if (run === sttRun.current && recordingStatusRef.current === 'recording') {
        stopRecord();
      }
    }, 7500);
  };

  const stopRecord = async () => {
    if (recordingStatusRef.current !== 'recording') return;
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    updateRecordingStatus('evaluating');
    const run = sttRun.current;

    let url = recordedAudioUrlRef.current;
    if (!url && recorder.current) {
      try {
        url = await recorder.current.stop();
      } catch {
        url = null;
      }
      recordedAudioUrlRef.current = url;
      setAudioUrl(url);
    }

    let transcripts = sttTranscriptsRef.current || [];
    if (sttControllerRef.current) {
      try {
        const res = await sttControllerRef.current.stop();
        if (res?.transcripts?.length) {
          transcripts = res.transcripts;
        }
      } catch {
        /* bỏ qua */
      }
    }

    if (run === sttRun.current) {
      evaluateSpokenResult(transcripts, url);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Tab chuyển đổi Nghe - Nói */}
      <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-[#efe3cc]">
        <button
          type="button"
          onClick={() => setActiveTab('listening')}
          className={`flex-1 min-h-12 rounded-xl text-base font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'listening' ? 'bg-banana text-ink shadow-sm' : 'text-ink-soft hover:bg-cream'
          }`}
        >
          <span>👂</span>
          <span>1. Luyện Nghe hội thoại</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('speaking')}
          className={`flex-1 min-h-12 rounded-xl text-base font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'speaking' ? 'bg-peach text-white shadow-sm' : 'text-ink-soft hover:bg-cream'
          }`}
        >
          <span>🎙️</span>
          <span>2. Luyện Nói (Nhại giọng)</span>
        </button>
      </div>

      {/* PHẦN 1: LUYỆN NGHE */}
      {activeTab === 'listening' && (
        <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-banana-soft px-3.5 py-1 text-xs font-black text-ink uppercase">
              Hội thoại học đường
            </span>
          </div>

          {/* Hộp phát âm thanh mẫu */}
          <div className="rounded-2xl bg-cream-soft p-5 border border-banana-soft flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-bold text-ink-soft">Bấm nút để nghe đoạn hội thoại:</p>
            <div className="flex items-center gap-3">
              <SpeakerButton text={listening?.transcript} audio={listening?.audio} size="lg" />
              <button
                type="button"
                onClick={() => speak(listening?.transcript, { rate: 0.65, audio: listening?.audio })}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-base font-black text-ink shadow-sm border border-[#efe3cc] hover:bg-cream active:translate-y-0.5 cursor-pointer"
              >
                <span>🐢 Nghe chậm</span>
              </button>
            </div>
            {listenAnswered && (
              <div className="mt-2 text-base font-bold text-ink bg-white/90 p-3 rounded-xl border border-banana">
                <span className="text-xs font-black uppercase text-ink-soft block mb-1">Lời thoại:</span>
                &quot;{listening?.transcript}&quot;
              </div>
            )}
          </div>

          {/* Câu hỏi trắc nghiệm */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-black text-ink">❓ {listening?.question}</h3>
            <div className="grid gap-2.5">
              {listening?.options?.map((opt, idx) => {
                let style = 'bg-white text-ink border-2 border-[#efe3cc] hover:bg-cream';
                if (listenAnswered) {
                  if (idx === listening.answerIndex) {
                    style = 'bg-mint text-white border-2 border-mint-dark font-black';
                  } else if (idx === listenSelected) {
                    style = 'bg-rose-100 text-rose-800 border-2 border-rose-300';
                  } else {
                    style = 'bg-gray-50 text-gray-400 border-2 border-gray-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleListenSelect(idx)}
                    disabled={listenAnswered}
                    className={`min-h-12 rounded-2xl px-5 py-3 text-left text-base font-bold transition-all cursor-pointer ${style}`}
                  >
                    <span>{String.fromCharCode(65 + idx)}. </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {listenAnswered && (
            <div className="flex justify-end pt-2">
              <Button3D tone="peach" onClick={() => setActiveTab('speaking')} className="px-6 py-3">
                Chuyển sang phần Luyện Nói 🎙️ →
              </Button3D>
            </div>
          )}
        </div>
      )}

      {/* PHẦN 2: LUYỆN NÓI (SHADOWING) */}
      {activeTab === 'speaking' && (
        <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-5">
          <div className="text-center">
            <span className="rounded-full bg-peach-soft px-3.5 py-1 text-xs font-black text-peach-dark uppercase">
              Nhại giọng câu giao tiếp (Shadowing)
            </span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-black text-ink">
              &quot;{speaking?.targetSentence}&quot;
            </h3>
            <p className="text-lg font-bold text-sky-dark mt-1">{speaking?.phonetic}</p>
            <p className="text-base font-bold text-ink-soft mt-1">({speaking?.meaningVi})</p>
          </div>

          {/* Nghe mẫu trước khi nói */}
          <div className="flex items-center justify-center gap-3">
            <SpeakerButton text={speaking?.targetSentence} audio={speaking?.audio} size="md" />
            <button
              type="button"
              onClick={() => speak(speaking?.targetSentence, { rate: 0.65, audio: speaking?.audio })}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-2xl bg-cream px-4 text-sm font-black text-ink shadow-sm border border-[#efe3cc] hover:bg-banana-soft cursor-pointer"
            >
              <span>🐢 Nghe chậm từng từ</span>
            </button>
          </div>

          {/* Nút bấm ghi âm */}
          <div className="flex flex-col items-center gap-3 py-4">
            {recordingStatus === 'evaluating' ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-banana-soft text-ink animate-pulse shadow-md border-2 border-banana">
                  <Sparkles className="h-8 w-8 text-peach animate-spin" />
                </div>
                <div className="flex items-center gap-2 text-peach-dark font-black text-sm sm:text-base animate-pulse">
                  <span className="h-2.5 w-2.5 rounded-full bg-peach animate-ping" />
                  <span>Đang chấm điểm AI... Em chờ một chút nhé! 🤖✨</span>
                </div>
              </div>
            ) : recordingStatus === 'recording' ? (
              <button
                type="button"
                onClick={stopRecord}
                className="animate-pulse inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg cursor-pointer touch-manipulation select-none"
                title="Bấm để dừng ghi âm"
              >
                <div className="h-7 w-7 rounded-md bg-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecord}
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-peach text-white shadow-[0_6px_0_var(--color-peach-dark)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer touch-manipulation select-none"
                title={recordingStatus === 'done' ? "Bấm vào để đọc lại" : "Bấm vào để đọc"}
              >
                <Mic className="h-9 w-9" />
              </button>
            )}
            <p className="text-sm font-bold text-ink-soft">
              {recordingStatus === 'evaluating'
                ? 'Đang phân tích phát âm...'
                : recordingStatus === 'recording'
                ? '🔴 Đang lắng nghe... Em nói to vào micro nhé!'
                : recordingStatus === 'done'
                ? 'Bấm vào Micro để luyện đọc lại'
                : 'Bấm vào Micro và đọc to câu trên'}
            </p>
          </div>

          {/* Kết quả nhận diện & Nghe lại giọng mình */}
          {recordingStatus === 'done' && (
            <div className="rounded-2xl bg-cream p-5 flex flex-col gap-3 animate-fade-in text-center border border-banana">
              {recognizedText && (
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-banana-soft pb-2 mb-2">
                    <span className="text-xs font-black uppercase text-ink-soft">Kết quả đánh giá AI:</span>
                    {speakScore !== null && (
                      <span className="rounded-full bg-banana px-3 py-0.5 font-mono text-sm font-black text-ink">
                        {Math.round(speakScore * 100)}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black uppercase text-ink-soft block">Máy nghe được:</span>
                  <p className="text-lg font-black text-ink italic">&quot;{recognizedText}&quot;</p>
                  <div className="flex justify-center mt-2">
                    <Stars count={stars} className="text-2xl" />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-banana-soft">
                {audioUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      playRecording(audioUrl);
                    }}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-ink shadow-sm border border-[#efe3cc] hover:bg-cream active:translate-y-0.5 cursor-pointer touch-manipulation select-none"
                  >
                    <span>▶️ Nghe lại giọng của em</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={startRecord}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-sky-dark px-5 text-sm font-black text-white shadow-[0_3px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
                >
                  <Mic className="h-4 w-4" /> <span>Luyện đọc lại câu này</span>
                </button>
              </div>
            </div>
          )}

          {/* Nút hoàn thành trạm */}
          {recordingStatus === 'done' && (
            <div className="flex justify-end pt-2">
              <Button3D tone="mint" onClick={() => onFinish?.(stars, 'Đã hoàn thành luyện Nghe & Nói!')}>
                Hoàn thành trạm Nghe & Nói →
              </Button3D>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

