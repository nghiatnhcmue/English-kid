import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { createRecorder } from '../utils/recorder.js';
import { isSttSupported, recognizeOnce, stopSpeaking } from '../utils/speech.js';
import { evaluateSpeechAttempt, compareWords } from '../utils/speechScoring.js';
import { playSfx } from '../utils/sfx.js';
import { useSettings } from '../settings.jsx';

/**
 * Hook quản lý trọn vẹn vòng đời Thu âm + Nhận diện giọng nói (STT) + VAD + Chấm điểm AI.
 * Chống chạm nhầm < 500ms, tự ngắt sau 7.5s, chống race-condition khi đổi câu giữa chừng.
 */
export function useSpeechEvaluator({ onEvaluated, enableConfetti = true } = {}) {
  const { settings } = useSettings();

  const recorder = useRef(null);
  const sttControllerRef = useRef(null);
  const sttTranscriptsRef = useRef([]);
  const autoStopTimerRef = useRef(null);
  const recordedAudioUrlRef = useRef(null);
  const recordStartTimeRef = useRef(0);
  const recordingStatusRef = useRef('idle');
  const activeTargetRef = useRef('');
  const sttRun = useRef(0);

  const [recordingStatus, setRecordingStatus] = useState('idle'); // 'idle' | 'recording' | 'evaluating' | 'done'
  const [audioUrl, setAudioUrl] = useState(null);
  const [recognizedText, setRecognizedText] = useState(null);
  const [score, setScore] = useState(null);
  const [scorePercent, setScorePercent] = useState(null);
  const [stars, setStars] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [wordAnalysis, setWordAnalysis] = useState(null);
  const [micError, setMicError] = useState(null);

  const updateRecordingStatus = useCallback((status) => {
    recordingStatusRef.current = status;
    setRecordingStatus(status);
  }, []);

  useEffect(() => {
    recorder.current = createRecorder();
    return () => {
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      sttControllerRef.current?.abort?.();
      recorder.current?.release();
      stopSpeaking();
    };
  }, []);

  const reset = useCallback(() => {
    sttRun.current += 1;
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    sttControllerRef.current?.abort?.();
    sttControllerRef.current = null;
    sttTranscriptsRef.current = [];
    recordedAudioUrlRef.current = null;

    if (recorder.current) {
      try {
        recorder.current.stop();
      } catch {
        /* bỏ qua */
      }
    }

    updateRecordingStatus('idle');
    setAudioUrl(null);
    setRecognizedText(null);
    setScore(null);
    setScorePercent(null);
    setFeedback('');
    setWordAnalysis(null);
    setMicError(null);
  }, [updateRecordingStatus]);

  const hydrateResult = useCallback(
    ({ scorePercent: pct, stars: st, spokenText, wordAnalysis: wa, audioUrl: url, targetSentence }) => {
      setScorePercent(pct ?? null);
      setScore(pct != null ? pct / 100 : null);
      setStars(st ?? 0);
      setRecognizedText(spokenText || null);
      setWordAnalysis(wa || (spokenText && targetSentence ? compareWords(targetSentence, spokenText) : null));
      setAudioUrl(url || null);
      updateRecordingStatus('done');
    },
    [updateRecordingStatus],
  );

  const stopRecord = useCallback(async () => {
    if (recordingStatusRef.current !== 'recording') return;
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    const elapsed = Date.now() - (recordStartTimeRef.current || 0);
    if (elapsed < 500) {
      await new Promise((r) => setTimeout(r, 500 - elapsed));
    }

    updateRecordingStatus('evaluating');
    const run = sttRun.current;
    const sentenceToEvaluate = activeTargetRef.current;

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

    if (run !== sttRun.current) return;

    const audioStats = recorder.current?.getAudioStats?.() || { hasVoice: false };
    const result = evaluateSpeechAttempt({
      transcripts,
      targetSentence: sentenceToEvaluate,
      audioStats,
    });

    updateRecordingStatus('done');
    setRecognizedText(result.recognizedText);
    setScore(result.score);
    setScorePercent(result.scorePercent);
    setStars(result.stars);
    setFeedback(result.feedback);
    setWordAnalysis(result.wordAnalysis);

    playSfx(result.sfx);
    if (enableConfetti && result.scorePercent >= 80) {
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.7 } });
    }

    onEvaluated?.({ ...result, audioUrl: url || recordedAudioUrlRef.current });
  }, [enableConfetti, onEvaluated, updateRecordingStatus]);

  const startRecord = useCallback(
    async (targetSentence, { onBeforeStart } = {}) => {
      playSfx('click');
      stopSpeaking();
      onBeforeStart?.();

      sttControllerRef.current?.abort?.();
      sttControllerRef.current = null;
      sttTranscriptsRef.current = [];
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
      recordedAudioUrlRef.current = null;
      recordStartTimeRef.current = Date.now();
      activeTargetRef.current = targetSentence || '';

      setAudioUrl(null);
      setRecognizedText(null);
      setScore(null);
      setScorePercent(null);
      setWordAnalysis(null);
      setMicError(null);
      updateRecordingStatus('recording');

      const sttAvailable = isSttSupported();
      let recorderStarted = false;
      let recErrorMsg = null;

      if (recorder.current) {
        try {
          const res = await recorder.current.start();
          if (res && res.ok) {
            recorderStarted = true;
          } else {
            recErrorMsg = res?.message || 'Không thể ghi âm giọng nói.';
          }
        } catch (err) {
          recErrorMsg = err?.message || 'Lỗi khởi động ghi âm.';
        }
      }

      if (!recorderStarted && !sttAvailable) {
        setMicError(
          recErrorMsg ||
            'Không thể truy cập micro. Em hãy kiểm tra quyền micro của trình duyệt và thử lại nhé!',
        );
        updateRecordingStatus('done');
        return;
      }

      if (!recorderStarted && sttAvailable) {
        setMicError(
          'Lưu ý: Không thể lưu file nghe lại, nhưng AI vẫn đang lắng nghe và chấm điểm phát âm cho em!',
        );
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

      autoStopTimerRef.current = setTimeout(() => {
        if (run === sttRun.current && recordingStatusRef.current === 'recording') {
          stopRecord();
        }
      }, 7500);
    },
    [settings.lang, stopRecord, updateRecordingStatus],
  );

  return {
    recordingStatus,
    audioUrl,
    recognizedText,
    score,
    scorePercent,
    stars,
    feedback,
    wordAnalysis,
    micError,
    startRecord,
    stopRecord,
    reset,
    hydrateResult,
  };
}
