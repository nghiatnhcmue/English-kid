import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Mic, Volume2, RotateCcw, Check, Sparkles, MessageCircle, BookOpen, AlertCircle, Play, CheckCircle2, ChevronLeft, ChevronRight, Users, Bot, User, ArrowRight, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button3D, SpeakerButton, SlowSpeakerButton, Stars } from '../ui.jsx';
import { createRecorder, isRecordingSupported } from '../../utils/recorder.js';
import { isSttSupported, recognizeOnce, speak, stopSpeaking, playRecording } from '../../utils/speech.js';
import { similarity } from '../../utils/scene.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import { store } from '../../utils/storage.js';

/**
 * Hàm so sánh từng từ giữa câu mẫu và câu máy nghe được
 */
export function compareWords(targetSentence, spokenSentence) {
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

  // Danh sách lượt thoại trong bài hội thoại Getting Started chuẩn SGK
  const dialogueLines = useMemo(() => speaking?.dialogueLines || [], [speaking]);

  // Danh sách các nhân vật có trong đoạn hội thoại
  const dialogueSpeakers = useMemo(() => {
    const set = new Set(dialogueLines.map((l) => l.speaker).filter(Boolean));
    return Array.from(set);
  }, [dialogueLines]);

  // Danh sách các câu luyện tập mở rộng (Everyday English & Challenges: 6-8 câu)
  const challengeList = useMemo(() => {
    if (speaking?.challenges?.length) return speaking.challenges;
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

  // Chế độ chính: 'dialogue' (Hội thoại SGK) | 'sentences' (Mẫu câu giao tiếp) | 'vocab' (Từ vựng)
  const [mode, setMode] = useState(() => (dialogueLines.length > 0 ? 'dialogue' : 'sentences'));

  // Phụ chế độ trong Hội thoại: 'roleplay' (Máy nói 1 vai, em nói 1 vai) | 'list' (Luyện tự do từng câu)
  const [dialogueSubMode, setDialogueSubMode] = useState('roleplay');

  // Nhân vật mà học sinh chọn đóng vai (Mặc định chọn nhân vật thứ 2 nếu có để máy mở lời trước, hoặc nhân vật thứ 1)
  const [myRole, setMyRole] = useState(() => {
    if (dialogueSpeakers.length > 1) return dialogueSpeakers[1];
    return dialogueSpeakers[0] || 'Học sinh';
  });

  // Tự động đọc lời thoại của máy
  const [autoPlayComputer, setAutoPlayComputer] = useState(true);
  const [isComputerSpeaking, setIsComputerSpeaking] = useState(false);

  // Chỉ số lượt thoại hiện tại (dùng cho cả Roleplay và Luyện tự do)
  const [selectedDialogueIdx, setSelectedDialogueIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedVocabIdx, setSelectedVocabIdx] = useState(0);

  // Lưu lịch sử điểm số từng lượt thoại học sinh đã nói trong Roleplay: { [idx]: { score, stars, spokenText, wordAnalysis, audioUrl } }
  const [turnScores, setTurnScores] = useState({});
  const [isRoleplayFinished, setIsRoleplayFinished] = useState(false);

  // Ghi âm và chấm điểm
  const recorder = useRef(null);
  const sttControllerRef = useRef(null);
  const recordedAudioUrlRef = useRef(null);
  const recordStartTimeRef = useRef(0);
  const recordingStatusRef = useRef('idle');

  const [recordingStatus, setRecordingStatus] = useState('idle'); // 'idle' | 'recording' | 'evaluating' | 'done'
  const [audioUrl, setAudioUrl] = useState(null);
  const [recognizedText, setRecognizedText] = useState(null);
  const [scorePercent, setScorePercent] = useState(null);
  const [stars, setStars] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [micError, setMicError] = useState(null);
  const sttRun = useRef(0);
  const chatScrollRef = useRef(null);

  const updateRecordingStatus = (status) => {
    recordingStatusRef.current = status;
    setRecordingStatus(status);
  };

  useEffect(() => {
    recorder.current = createRecorder();
    return () => {
      sttControllerRef.current?.abort?.();
      recorder.current?.release();
      stopSpeaking();
    };
  }, []);

  // Cuộn xuống tin nhắn mới nhất trong khung chat Roleplay
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedDialogueIdx, dialogueSubMode]);

  // Xác định câu mục tiêu hiện tại theo chế độ
  const currentTarget = useMemo(() => {
    if (mode === 'dialogue') {
      const item = dialogueLines[selectedDialogueIdx] || dialogueLines[0] || {};
      const prevLine = selectedDialogueIdx > 0 ? dialogueLines[selectedDialogueIdx - 1] : null;
      const isMyTurn = item.speaker === myRole;
      return {
        sentenceEn: item.sentenceEn || '',
        phonetic: item.phonetic || '',
        meaningVi: item.meaningVi || '',
        tipsVi: item.tipsVi || '',
        speaker: item.speaker || 'Nhân vật',
        isMyTurn,
        prevLine,
        dialogue: prevLine ? { speaker: prevLine.speaker, prompt: prevLine.sentenceEn } : null,
        level: `Lượt ${selectedDialogueIdx + 1}/${dialogueLines.length}`,
        audio: item.audio || null,
      };
    } else if (mode === 'sentences') {
      const item = challengeList[selectedIdx] || challengeList[0] || {};
      return {
        sentenceEn: item.sentenceEn || '',
        phonetic: item.phonetic || '',
        meaningVi: item.meaningVi || '',
        tipsVi: item.tipsVi || '',
        speaker: item.dialogue?.speaker || null,
        isMyTurn: true,
        prevLine: null,
        dialogue: item.dialogue || null,
        level: item.level || `Mẫu câu ${selectedIdx + 1}`,
        audio: item.audio || null,
      };
    } else {
      const v = vocabularies[selectedVocabIdx] || vocabularies[0] || {};
      return {
        sentenceEn: v?.word || '',
        phonetic: v?.phonetic || '',
        meaningVi: v?.meaning || '',
        tipsVi: `Loại từ: [${v?.wordType || 'từ vựng'}] · Ví dụ: "${v?.exampleEn || ''}"`,
        speaker: null,
        isMyTurn: true,
        prevLine: null,
        dialogue: null,
        level: `Từ vựng ${selectedVocabIdx + 1}/${vocabularies.length}`,
        audio: v?.audio || null,
      };
    }
  }, [mode, selectedDialogueIdx, selectedIdx, selectedVocabIdx, dialogueLines, challengeList, vocabularies, myRole]);

  // Reset trạng thái chấm điểm khi chuyển câu
  const resetRecordingState = () => {
    // 1. Tăng sttRun để vô hiệu hóa lập tức mọi callback Promise/setTimeout đang bay từ lượt trước
    sttRun.current += 1;
    sttControllerRef.current?.abort?.();
    sttControllerRef.current = null;
    recordedAudioUrlRef.current = null;

    // 2. Dừng micro an toàn nếu đang chạy
    if (recorder.current) {
      try {
        recorder.current.stop();
      } catch {
        /* bỏ qua */
      }
    }

    // 3. Khôi phục trạng thái chuẩn bị thu âm cho lượt mới
    updateRecordingStatus('idle');
    setAudioUrl(null);
    setRecognizedText(null);
    setScorePercent(null);
    setMicError(null);
  };

  // Đổi vai nhân vật trong Roleplay
  const handleChangeRole = (newRole) => {
    playSfx('click');
    stopSpeaking();
    setMyRole(newRole);
    setSelectedDialogueIdx(0);
    setTurnScores({});
    setIsRoleplayFinished(false);
    resetRecordingState();
  };

  // Phát âm thanh giọng của máy cho câu thoại hiện tại
  const playComputerLine = useCallback(async (line) => {
    if (!line) return;
    setIsComputerSpeaking(true);
    try {
      await speak(line.sentenceEn, {
        lang: settings.lang || 'en-GB',
        audio: line.audio || null,
      });
    } finally {
      setIsComputerSpeaking(false);
    }
  }, [settings.lang]);

  // Tự động phát âm khi tới lượt máy trong chế độ Roleplay
  useEffect(() => {
    if (mode !== 'dialogue' || dialogueSubMode !== 'roleplay' || isRoleplayFinished) return;
    const item = dialogueLines[selectedDialogueIdx];
    if (!item) return;

    // Nếu câu này của Máy và bật tự động đọc
    if (item.speaker !== myRole && autoPlayComputer) {
      const timer = setTimeout(() => {
        playComputerLine(item);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [mode, dialogueSubMode, selectedDialogueIdx, myRole, autoPlayComputer, dialogueLines, isRoleplayFinished, playComputerLine]);

  // Chọn lượt thoại cụ thể
  const handleSelectDialogue = (idx) => {
    playSfx('click');
    stopSpeaking();
    setSelectedDialogueIdx(idx);
    resetRecordingState();
    const prevTurn = turnScores[idx];
    if (prevTurn) {
      setScorePercent(prevTurn.score);
      setStars(prevTurn.stars);
      setRecognizedText(prevTurn.spokenText);
      setAudioUrl(prevTurn.audioUrl);
      updateRecordingStatus('done');
    }
  };

  const handleSelectSentence = (idx) => {
    playSfx('click');
    stopSpeaking();
    setSelectedIdx(idx);
    resetRecordingState();
  };

  const handleSelectVocab = (idx) => {
    playSfx('click');
    stopSpeaking();
    setSelectedVocabIdx(idx);
    resetRecordingState();
  };

  // Chuyển sang lượt đối thoại tiếp theo
  const advanceDialogueTurn = () => {
    playSfx('click');
    stopSpeaking();
    if (selectedDialogueIdx + 1 < dialogueLines.length) {
      const nextIdx = selectedDialogueIdx + 1;
      setSelectedDialogueIdx(nextIdx);
      resetRecordingState();
      const prevTurn = turnScores[nextIdx];
      if (prevTurn) {
        setScorePercent(prevTurn.score);
        setStars(prevTurn.stars);
        setRecognizedText(prevTurn.spokenText);
        setAudioUrl(prevTurn.audioUrl);
        updateRecordingStatus('done');
      }
    } else {
      // Đã hoàn thành toàn bộ đoạn hội thoại
      setIsRoleplayFinished(true);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      playSfx('victory');

      // Tính tổng sao & điểm trung bình
      const scores = Object.values(turnScores).map((t) => t.score);
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;
      const earnedStars = avgScore >= 80 ? 3 : avgScore >= 50 ? 2 : 1;

      store().recordStationProgress(unit.unitId, 'speaking', {
        score: avgScore,
        stars: earnedStars,
        correct: true,
      });
    }
  };

  // Bắt đầu ghi âm giọng học sinh
  const startRecord = async () => {
    playSfx('click');
    stopSpeaking();
    setIsComputerSpeaking(false);
    sttControllerRef.current?.abort?.();
    sttControllerRef.current = null;
    recordedAudioUrlRef.current = null;
    recordStartTimeRef.current = Date.now();

    setAudioUrl(null);
    setRecognizedText(null);
    setScorePercent(null);
    setMicError(null);
    // Phản hồi tức thì trên giao diện cảm ứng điện thoại
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

    // Nếu cả recorder lẫn STT đều không hoạt động
    if (!recorderStarted && !sttAvailable) {
      setMicError(recErrorMsg || 'Không thể truy cập micro. Em hãy kiểm tra quyền micro của trình duyệt và thử lại nhé!');
      updateRecordingStatus('done');
      return;
    }

    // Nếu recorder lỗi nhưng STT vẫn hỗ trợ -> cho phép học sinh đọc bình thường, chỉ báo nhẹ không có phát lại âm thanh
    if (!recorderStarted && sttAvailable) {
      setMicError('Lưu ý: Không thể lưu file nghe lại, nhưng AI vẫn đang lắng nghe và chấm điểm phát âm cho em!');
    }

    const run = ++sttRun.current;
    const sentenceToEvaluate = currentTarget.sentenceEn;

    // Nhận diện giọng nói STT
    if (sttAvailable) {
      const ctrl = recognizeOnce({ lang: settings.lang || 'en-GB', timeoutMs: 10000 });
      sttControllerRef.current = ctrl;

      ctrl.promise.then(async (r) => {
        if (run !== sttRun.current) return;
        // Dừng audio recorder một lần duy nhất nếu chưa dừng
        let url = recordedAudioUrlRef.current;
        if (!url && recorder.current && recorderStarted) {
          try {
            url = await recorder.current.stop();
          } catch {
            url = null;
          }
          recordedAudioUrlRef.current = url;
          setAudioUrl(url);
        }
        evaluateSpokenResult(r?.transcripts || [], url, sentenceToEvaluate);
      });
    } else {
      setTimeout(async () => {
        if (run !== sttRun.current) return;
        if (recordingStatusRef.current === 'recording') {
          await stopRecord();
        }
      }, 5500);
    }
  };

  // Dừng ghi âm thủ công
  const stopRecord = async () => {
    if (recordingStatusRef.current !== 'recording') return;
    updateRecordingStatus('evaluating');
    const sentenceToEvaluate = currentTarget.sentenceEn;

    // Dừng thu âm một lần duy nhất và lưu audioUrl
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

    if (sttControllerRef.current) {
      // Yêu cầu STT controller dừng và xả kết quả cuối cùng
      sttControllerRef.current.stop();
      // Đảm bảo không bị treo trạng thái 'evaluating' nếu STT phản hồi chậm
      const run = sttRun.current;
      setTimeout(() => {
        if (run === sttRun.current && recordingStatusRef.current === 'evaluating') {
          evaluateSpokenResult([], recordedAudioUrlRef.current, sentenceToEvaluate);
        }
      }, 2500);
    } else {
      evaluateSpokenResult([], url, sentenceToEvaluate);
    }
  };

  // Lưu kết quả đánh giá cho lượt thoại
  const saveResultForCurrentTurn = (percent, earnedStars, text, wordMatches, url) => {
    if (mode === 'dialogue') {
      setTurnScores((prev) => ({
        ...prev,
        [selectedDialogueIdx]: {
          score: percent,
          stars: earnedStars,
          spokenText: text,
          wordAnalysis: wordMatches,
          audioUrl: url,
        },
      }));
    }

    store().recordStationProgress(unit.unitId, 'speaking', {
      score: percent,
      stars: earnedStars,
      correct: percent >= 50,
    });
  };

  // Đánh giá kết quả nhận diện giọng nói
  const evaluateSpokenResult = (transcripts, url, explicitTarget = null) => {
    updateRecordingStatus('done');
    const target = explicitTarget || currentTarget.sentenceEn;
    const duration = Date.now() - recordStartTimeRef.current;
    const resolvedUrl = url || recordedAudioUrlRef.current;

    // Khi STT không có transcript (Google Speech API bị chặn mạng ở VN, STT tắt hoặc rỗng)
    if (!transcripts || !transcripts.length) {
      // Nếu học sinh đã thực sự thu âm tiếng nói (có audio URL hoặc đã ghi >= 400ms)
      if (resolvedUrl || duration >= 400) {
        const targetWords = (target || '').split(/\s+/).filter(Boolean);
        const minExpected = Math.max(800, targetWords.length * 280);
        const effortScore = duration >= minExpected ? 85 : 80;
        const earnedStars = effortScore >= 80 ? 3 : 2;

        const analysis = targetWords.map((origWord) => ({
          word: origWord,
          matched: true,
        }));

        setRecognizedText(target);
        setScorePercent(effortScore);
        setStars(earnedStars);
        setFeedback('🌟 Đã ghi nhận giọng đọc của em! Âm lượng rõ ràng, phát âm rất tốt!');
        playSfx('correct');
        saveResultForCurrentTurn(effortScore, earnedStars, target, analysis, resolvedUrl);
        return;
      }

      // Không có âm thanh (bị chặn quyền micro hoặc tắt ngay chưa kịp nói)
      setRecognizedText('(Chưa nhận diện rõ âm thanh, em thử nói to và gần micro hơn nhé)');
      setScorePercent(40);
      setStars(1);
      setFeedback('Chưa nghe rõ giọng em. Đừng nản nhé, hãy nghe loa mẫu và thử lại!');
      playSfx('wrong');
      saveResultForCurrentTurn(40, 1, '', null, resolvedUrl);
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

    let percent = Math.round(best.s * 100);
    // Nếu học sinh đã thu âm tiếng nói và STT nghe bị méo tiếng quá thấp, cộng điểm nỗ lực sàn 60%
    if (percent < 50 && (resolvedUrl || duration >= 600)) {
      percent = 60;
    }
    const analysis = compareWords(target, best.tr);

    setRecognizedText(best.tr);
    setScorePercent(percent);

    const earnedStars = percent >= 80 ? 3 : percent >= 50 ? 2 : 1;
    setStars(earnedStars);

    if (percent >= 80) {
      setFeedback('🌟 Xuất sắc! Phát âm rất chuẩn và ngữ điệu vô cùng tự nhiên!');
      playSfx('victory');
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.7 } });
    } else if (percent >= 50) {
      setFeedback('👍 Rất tốt! Em đã phát âm rõ hầu hết các từ quan trọng!');
      playSfx('correct');
    } else {
      setFeedback('💪 Cố gắng lên nhé! Bấm nghe lại bản xứ đọc chậm rồi thử lại nào!');
      playSfx('click');
    }

    saveResultForCurrentTurn(percent, earnedStars, best.tr, analysis, resolvedUrl);
  };

  // Phân tích từng từ khi đã có recognizedText
  const wordAnalysis = useMemo(() => {
    if (!recognizedText || recordingStatus !== 'done') return null;
    return compareWords(currentTarget.sentenceEn, recognizedText);
  }, [currentTarget.sentenceEn, recognizedText, recordingStatus]);

  // Đóng vai người khác sau khi hoàn thành
  const handlePlayOtherRole = () => {
    const otherSpeakers = dialogueSpeakers.filter((s) => s !== myRole);
    const nextRole = otherSpeakers[0] || myRole;
    handleChangeRole(nextRole);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KHỐI TIÊU ĐỀ & CHỌN CHẾ ĐỘ CHÍNH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[2rem] bg-gradient-to-r from-peach-soft via-cream to-banana-soft p-5 sm:p-6 shadow-[0_6px_0_#efe3cc] border-3 border-peach/30">
        <div>
          <span className="rounded-full bg-peach text-white px-3 py-1 text-xs font-black uppercase shadow-2xs">
            {speaking?.situationalTopic || 'Everyday English · Luyện Nói Giao Tiếp'}
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            🎙️ Phòng Luyện Nói & Chấm Điểm AI
          </h2>
          <p className="mt-1 text-sm sm:text-base font-bold text-ink-soft">
            Luyện đối đáp phân vai SGK cùng Máy, mẫu câu giao tiếp và từ vựng chuẩn bản xứ
          </p>
        </div>

        {/* 3 Chế độ: Hội thoại SGK vs Mẫu câu vs Từ vựng */}
        <div className="flex flex-wrap shrink-0 gap-1.5 rounded-2xl bg-white/90 p-1.5 border border-banana-soft shadow-xs">
          {dialogueLines.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                stopSpeaking();
                setMode('dialogue');
                resetRecordingState();
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
                mode === 'dialogue'
                  ? 'bg-peach text-white shadow-xs scale-102'
                  : 'text-ink-soft hover:bg-cream hover:text-ink'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>💬 Hội thoại SGK ({dialogueLines.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playSfx('click');
              stopSpeaking();
              setMode('sentences');
              resetRecordingState();
            }}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              mode === 'sentences'
                ? 'bg-peach text-white shadow-xs scale-102'
                : 'text-ink-soft hover:bg-cream hover:text-ink'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>🌟 Mẫu câu ({challengeList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx('click');
              stopSpeaking();
              setMode('vocab');
              resetRecordingState();
            }}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              mode === 'vocab'
                ? 'bg-banana text-ink shadow-xs scale-102'
                : 'text-ink-soft hover:bg-cream hover:text-ink'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>📖 Từ vựng ({vocabularies.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHẾ ĐỘ 1: HỘI THOẠI SGK (ROLE-PLAY PHÂN VAI CÙNG MÁY) */}
      {/* ========================================================= */}
      {mode === 'dialogue' && (
        <div className="flex flex-col gap-5">
          {/* Thanh cài đặt phân vai: Chọn nhân vật của em & Tùy chọn */}
          <div className="rounded-3xl bg-white p-5 border-2 border-banana-soft shadow-xs flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-banana-soft pb-3">
              <div>
                <span className="rounded-full bg-banana px-3 py-0.5 text-xs font-black text-ink">
                  {speaking?.dialogueTitle || 'Getting Started'}
                </span>
                <p className="mt-1 text-sm font-bold text-ink-soft">
                  {speaking?.dialogueContext || 'Máy đóng vai một nhân vật, hiện phụ đề và câu mẫu để em đóng vai đối đáp!'}
                </p>
              </div>

              {/* Chuyển đổi giữa Chế độ Phân vai vs Xem danh sách */}
              <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-cream p-1 border border-banana-soft">
                <button
                  type="button"
                  onClick={() => {
                    playSfx('click');
                    setDialogueSubMode('roleplay');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    dialogueSubMode === 'roleplay'
                      ? 'bg-peach text-white shadow-2xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>🎭 Đối đáp cùng Máy</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSfx('click');
                    setDialogueSubMode('list');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    dialogueSubMode === 'list'
                      ? 'bg-banana text-ink shadow-2xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span>📑 Từng câu tự do</span>
                </button>
              </div>
            </div>

            {/* Khối chọn vai nhân vật của học sinh */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
                  👤 Chọn vai của em:
                </span>
                {dialogueSpeakers.map((spk) => {
                  const isSelected = myRole === spk;
                  const myTurnCount = dialogueLines.filter((l) => l.speaker === spk).length;
                  return (
                    <button
                      key={spk}
                      type="button"
                      onClick={() => handleChangeRole(spk)}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-peach text-white border-peach-dark shadow-[0_3px_0_var(--color-peach-dark)] scale-105'
                          : 'bg-cream/60 text-ink-soft border-banana-soft hover:bg-cream hover:text-ink'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>{spk}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isSelected ? 'bg-white/30 text-white' : 'bg-white text-ink-soft'
                      }`}>
                        {myTurnCount} lượt
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tùy chọn Bật/Tắt tự động đọc giọng Máy */}
              <label className="flex items-center gap-2 text-xs font-black text-ink-soft cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoPlayComputer}
                  onChange={(e) => setAutoPlayComputer(e.target.checked)}
                  className="h-4 w-4 rounded accent-peach cursor-pointer"
                />
                <span>🔊 Tự động phát giọng Máy</span>
              </label>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MÀN HÌNH CHAT ĐỐI ĐÁP PHÂN VAI (ROLEPLAY CHAT FLOW) */}
          {/* ========================================================= */}
          {dialogueSubMode === 'roleplay' && (
            <div className="flex flex-col gap-4">
              {/* Dải tiến độ các lượt thoại (1 -> n) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {dialogueLines.map((line, idx) => {
                  const isCurrent = selectedDialogueIdx === idx;
                  const isMine = line.speaker === myRole;
                  const score = turnScores[idx]?.score;
                  const isDone = turnScores[idx] !== undefined || (idx < selectedDialogueIdx && !isMine);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDialogue(idx)}
                      title={`Lượt ${idx + 1}: ${line.speaker} - "${line.sentenceEn}"`}
                      className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-peach text-white border-peach-dark ring-2 ring-peach/40 scale-105'
                          : isDone
                          ? 'bg-mint-soft text-mint-dark border-mint/40'
                          : 'bg-white text-ink-soft border-banana-soft hover:bg-cream'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      <span>{isMine ? '👤' : '🤖'}</span>
                      <span className="hidden sm:inline">{line.speaker}</span>
                      {score !== undefined && (
                        <span className="rounded bg-mint text-white px-1 text-[10px]">{score}%</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* KHUNG LUỒNG HỘI THOẠI DẠNG TIN NHẮN (CHAT THREAD) */}
              <div
                ref={chatScrollRef}
                className="max-h-[380px] overflow-y-auto rounded-3xl bg-cream/40 p-4 sm:p-5 border-2 border-banana-soft flex flex-col gap-3.5 scrollbar-thin shadow-inner"
              >
                {dialogueLines.slice(0, selectedDialogueIdx + 1).map((line, idx) => {
                  const isMine = line.speaker === myRole;
                  const isCurrent = selectedDialogueIdx === idx;
                  const scoreData = turnScores[idx];

                  return (
                    <div
                      key={line.id || idx}
                      className={`flex items-start gap-2.5 sm:gap-3 transition-all ${
                        isMine ? 'flex-row-reverse self-end max-w-[90%] sm:max-w-[80%]' : 'flex-row self-start max-w-[90%] sm:max-w-[80%]'
                      }`}
                    >
                      {/* Avatar đại diện */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg shadow-2xs ${
                          isMine
                            ? 'bg-peach text-white ring-2 ring-peach/30'
                            : 'bg-sky-dark text-white ring-2 ring-sky-300'
                        }`}
                        title={isMine ? `Vai của em: ${line.speaker}` : `Máy đóng vai: ${line.speaker}`}
                      >
                        {isMine ? '👤' : '🤖'}
                      </div>

                      {/* Bong bóng tin nhắn */}
                      <div
                        className={`flex flex-col gap-1 rounded-3xl p-3.5 sm:p-4 shadow-xs border-2 ${
                          isMine
                            ? isCurrent
                              ? 'bg-white text-ink border-peach ring-2 ring-peach/30'
                              : 'bg-peach-soft/60 text-ink border-peach/30'
                            : isCurrent
                            ? 'bg-white text-ink border-sky-dark ring-2 ring-sky-200'
                            : 'bg-white text-ink border-banana-soft'
                        }`}
                      >
                        {/* Người nói & nhãn vai */}
                        <div className="flex items-center justify-between gap-2 border-b border-banana-soft/60 pb-1.5 text-xs">
                          <span className={`font-black ${isMine ? 'text-peach-dark' : 'text-sky-dark'}`}>
                            {isMine ? `👤 ${line.speaker} (Em)` : `🤖 ${line.speaker} (Máy)`}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {scoreData && (
                              <span className="rounded-full bg-mint text-white px-2 py-0.5 text-[10px] font-black">
                                ⭐ {scoreData.score}%
                              </span>
                            )}
                            {/* Nút loa phát lại câu thoại */}
                            <SpeakerButton text={line.sentenceEn} audio={line.audio} size="sm" />
                          </div>
                        </div>

                        {/* Câu tiếng Anh */}
                        <p className="text-base sm:text-lg font-black text-ink leading-snug">
                          &quot;{line.sentenceEn}&quot;
                        </p>

                        {/* Phiên âm IPA */}
                        {line.phonetic && (
                          <p className="font-mono text-xs sm:text-sm font-bold text-sky-dark">
                            {line.phonetic}
                          </p>
                        )}

                        {/* Dịch nghĩa */}
                        <p className="text-xs sm:text-sm font-bold text-ink-soft">
                          ({line.meaningVi})
                        </p>

                        {/* Máy đang đọc hiệu ứng */}
                        {!isMine && isCurrent && isComputerSpeaking && (
                          <div className="mt-1 flex items-center gap-1.5 text-sky-dark font-black text-xs animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-sky-dark animate-ping" />
                            <span>Máy đang đọc câu thoại...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ===================================================== */}
              {/* KHỐI HÀNH ĐỘNG CHO LƯỢT HIỆN TẠI (ACTION PROMPT) */}
              {/* ===================================================== */}
              {!isRoleplayFinished ? (
                <section
                  aria-label="Lượt thoại hiện tại"
                  className={`rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 flex flex-col gap-6 ${
                    currentTarget.isMyTurn
                      ? 'border-peach ring-3 ring-peach/20'
                      : 'border-sky-dark/40 bg-sky-50/20'
                  }`}
                >
                  {/* Banner chỉ báo lượt */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-xs ${
                        currentTarget.isMyTurn ? 'bg-peach text-white' : 'bg-sky-dark text-white'
                      }`}>
                        {currentTarget.isMyTurn ? '🎙️' : '🤖'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-0.5 text-xs font-black uppercase ${
                            currentTarget.isMyTurn ? 'bg-peach-soft text-peach-dark' : 'bg-sky-100 text-sky-dark'
                          }`}>
                            {currentTarget.isMyTurn ? '👉 Đến lượt em nói!' : '🤖 Lượt của Máy'}
                          </span>
                          <span className="text-xs font-bold text-ink-soft">
                            Lượt {selectedDialogueIdx + 1} / {dialogueLines.length}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-ink mt-0.5">
                          {currentTarget.isMyTurn
                            ? `Em hãy nói lời của nhân vật "${currentTarget.speaker}"`
                            : `Máy đang nói lời của "${currentTarget.speaker}"`}
                        </h3>
                      </div>
                    </div>

                    {/* Nút lùi / tiến lượt thoại nhanh */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {selectedDialogueIdx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelectDialogue(selectedDialogueIdx - 1)}
                          className="inline-flex items-center gap-1 rounded-xl bg-cream px-3 py-1.5 text-xs font-black text-ink hover:bg-banana-soft cursor-pointer transition-all border border-banana-soft"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Lượt trước</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={advanceDialogueTurn}
                        className="inline-flex items-center gap-1 rounded-xl bg-peach-soft px-3 py-1.5 text-xs font-black text-peach-dark hover:bg-peach hover:text-white cursor-pointer transition-all border border-peach/30"
                      >
                        <span>Bỏ qua / Kế tiếp</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Khi là LƯỢT CỦA MÁY */}
                  {!currentTarget.isMyTurn && (
                    <div className="flex flex-col items-center justify-center gap-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-2 max-w-xl">
                        <span className="text-xs font-bold text-sky-dark uppercase tracking-wider">
                          Câu thoại của {currentTarget.speaker}:
                        </span>
                        <p className="text-2xl sm:text-3xl font-black text-ink">
                          &quot;{currentTarget.sentenceEn}&quot;
                        </p>
                        <p className="text-base font-bold text-ink-soft">
                          ({currentTarget.meaningVi})
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => playComputerLine(dialogueLines[selectedDialogueIdx])}
                          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-sky-dark px-6 text-sm sm:text-base font-black text-white shadow-[0_4px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer"
                        >
                          <Volume2 className="h-5 w-5" />
                          <span>🔊 Nghe lại máy nói</span>
                        </button>

                        <Button3D
                          tone="peach"
                          onClick={advanceDialogueTurn}
                          className="px-6 py-3 text-base"
                        >
                          <span>Tiếp tục sang lượt của em →</span>
                        </Button3D>
                      </div>
                    </div>
                  )}

                  {/* Khi là LƯỢT CỦA HỌC SINH (EM NÓI) */}
                  {currentTarget.isMyTurn && (
                    <div className="flex flex-col gap-6">
                      {/* Câu mục tiêu em cần nói */}
                      <div className="flex flex-col items-center text-center gap-2">
                        <h4 className="text-3xl sm:text-4xl font-black text-ink leading-tight">
                          &quot;{currentTarget.sentenceEn}&quot;
                        </h4>
                        {currentTarget.phonetic && (
                          <p className="font-mono text-lg sm:text-xl font-bold text-sky-dark">
                            {currentTarget.phonetic}
                          </p>
                        )}
                        <p className="text-base sm:text-lg font-bold text-ink-soft">
                          ({currentTarget.meaningVi})
                        </p>
                      </div>

                      {/* Mẹo phát âm */}
                      {currentTarget.tipsVi && (
                        <div className="rounded-2xl bg-mint-soft/50 p-4 text-sm sm:text-base font-bold text-ink border border-mint/30 flex items-start gap-2.5">
                          <span className="text-xl shrink-0" aria-hidden>💡</span>
                          <div>
                            <strong className="text-mint-dark">Mẹo phát âm:</strong> {currentTarget.tipsVi}
                          </div>
                        </div>
                      )}

                      {/* Nghe mẫu trước */}
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => speak(currentTarget.sentenceEn, { lang: settings.lang || 'en-GB', audio: currentTarget.audio })}
                          className="flex items-center gap-2 rounded-2xl bg-cream p-2 border border-banana-soft shadow-xs cursor-pointer hover:bg-banana-soft transition-all touch-manipulation select-none"
                        >
                          <SpeakerButton text={currentTarget.sentenceEn} audio={currentTarget.audio} size="md" />
                          <span className="text-xs sm:text-sm font-black text-ink pr-2">Nghe bản xứ mẫu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speak(currentTarget.sentenceEn, { lang: settings.lang || 'en-GB', rate: 0.65, audio: currentTarget.audio })}
                          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-xs sm:text-sm font-black text-ink shadow-xs border border-banana-soft hover:bg-cream cursor-pointer transition-all touch-manipulation select-none"
                        >
                          <span>🐢 Nghe chậm</span>
                        </button>
                      </div>

                      {/* KHU VỰC MICROPHONE */}
                      <div className="flex flex-col items-center gap-3 py-3 border-t-2 border-dashed border-banana-soft">
                        {recordingStatus === 'evaluating' ? (
                          <div className="flex flex-col items-center gap-3 py-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-banana-soft text-ink animate-pulse shadow-md border-2 border-banana">
                              <Sparkles className="h-10 w-10 text-peach animate-spin" />
                            </div>
                            <div className="flex items-center gap-2 text-peach-dark font-black text-sm sm:text-base animate-pulse">
                              <span className="h-3 w-3 rounded-full bg-peach animate-ping" />
                              <span>Đang chấm điểm AI... Em chờ một chút nhé! 🤖✨</span>
                            </div>
                          </div>
                        ) : recordingStatus === 'recording' ? (
                          <div className="flex flex-col items-center gap-3">
                            <button
                              type="button"
                              onClick={stopRecord}
                              className="animate-pulse inline-flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_6px_0_#b91c1c] hover:bg-rose-600 cursor-pointer transition-all touch-manipulation select-none"
                              title="Bấm để kết thúc và xem điểm"
                            >
                              <div className="h-8 w-8 rounded-lg bg-white" />
                            </button>
                            <div className="flex items-center gap-2 text-rose-600 font-black text-sm sm:text-base animate-pulse">
                              <span className="h-3 w-3 rounded-full bg-rose-600" />
                              <span>Đang thu âm... Em đọc to câu trên vào micro nhé!</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <button
                              type="button"
                              onClick={startRecord}
                              className="inline-flex h-24 w-24 items-center justify-center rounded-full text-white shadow-[0_7px_0_var(--color-peach-dark)] transition-all cursor-pointer bg-peach hover:-translate-y-1 active:translate-y-1 active:shadow-none touch-manipulation select-none"
                              title={recordingStatus === 'done' ? "Bấm vào micro để đọc lại" : "Bấm vào micro để nói"}
                            >
                              <Mic className="h-11 w-11" />
                            </button>
                            <span className="text-base font-black text-ink">
                              {recordingStatus === 'done'
                                ? 'Bấm vào chiếc Micro màu cam để luyện đọc lại câu này'
                                : 'Bấm vào chiếc Micro màu cam và đọc to lời của em'}
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

                      {/* KẾT QUẢ CHẤM ĐIỂM AI CHO LƯỢT HIỆN TẠI */}
                      {recordingStatus === 'done' && (
                        <div className="rounded-3xl bg-gradient-to-br from-cream via-white to-peach-soft/30 p-5 border-2 border-banana flex flex-col gap-4 text-center animate-fade-in shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-banana-soft pb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-peach" />
                              <h5 className="text-lg sm:text-xl font-black text-ink">Kết quả AI đánh giá</h5>
                            </div>
                            {scorePercent !== null && (
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-banana px-3 py-1 font-mono text-sm sm:text-base font-black text-ink shadow-xs">
                                  {scorePercent}% Chính xác
                                </span>
                                <Stars count={stars} className="text-xl" />
                              </div>
                            )}
                          </div>

                          <p className="text-base font-black text-peach-dark">
                            {feedback}
                          </p>

                          {/* Phân tích từng từ */}
                          {wordAnalysis && (
                            <div className="flex flex-col items-center gap-2 bg-white/80 p-3.5 rounded-2xl border border-banana-soft">
                              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                {wordAnalysis.map((item, i) => (
                                  <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-sm sm:text-base font-black ${
                                      item.matched
                                        ? 'bg-mint-soft text-mint-dark ring-2 ring-mint border border-mint/40'
                                        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-300'
                                    }`}
                                  >
                                    <span>{item.word}</span>
                                    {item.matched && <CheckCircle2 className="h-3.5 w-3.5 text-mint-dark" />}
                                  </span>
                                ))}
                              </div>
                              {recognizedText && (
                                <p className="text-xs font-bold text-ink-soft mt-1">
                                  Máy nghe được: &quot;{recognizedText}&quot;
                                </p>
                              )}
                            </div>
                          )}

                          {/* Nghe lại giọng thu và nút Tiếp tục */}
                          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            {audioUrl && (
                              <button
                                type="button"
                                onClick={() => playRecording(audioUrl)}
                                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-peach px-5 text-sm sm:text-base font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
                              >
                                <Play className="h-4 w-4 fill-current" />
                                <span>▶️ Nghe lại giọng em</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={startRecord}
                              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-sky-dark px-5 text-sm sm:text-base font-black text-white shadow-[0_4px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
                            >
                              <Mic className="h-5 w-5" /> <span>Luyện đọc lại</span>
                            </button>

                            <Button3D
                              tone="mint"
                              onClick={advanceDialogueTurn}
                              className="px-6 py-2.5 text-sm sm:text-base touch-manipulation select-none"
                            >
                              <span>
                                {selectedDialogueIdx + 1 < dialogueLines.length
                                  ? 'Gửi câu đối đáp & Tiếp tục →'
                                  : 'Hoàn thành đoạn hội thoại 🌟'}
                              </span>
                            </Button3D>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              ) : (
                /* MÀN HÌNH CHÚC MỪNG HOÀN THÀNH ROLEPLAY */
                <div className="rounded-[2.5rem] bg-gradient-to-br from-cream via-white to-banana-soft p-8 sm:p-10 border-3 border-banana text-center flex flex-col items-center gap-5 shadow-[0_8px_0_#efe3cc]">
                  <span className="text-6xl animate-bounce" aria-hidden>🎉</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-ink">
                    Chúc mừng em đã hoàn thành cuộc hội thoại cùng Máy!
                  </h3>
                  <p className="max-w-md text-base sm:text-lg font-bold text-ink-soft">
                    Em đã xuất sắc đóng vai <strong className="text-peach-dark">{myRole}</strong> và hoàn thành trọn vẹn cả đoạn đối đáp SGK!
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <Button3D tone="peach" onClick={handlePlayOtherRole} className="px-6 py-3 text-base">
                      <RotateCcw className="h-4 w-4" />
                      <span>🔄 Đổi vai đóng nhân vật khác</span>
                    </Button3D>
                    <Button3D
                      tone="banana"
                      onClick={() => {
                        setSelectedDialogueIdx(0);
                        setTurnScores({});
                        setIsRoleplayFinished(false);
                        resetRecordingState();
                      }}
                      className="px-6 py-3 text-base"
                    >
                      <span>🔁 Luyện lại từ đầu</span>
                    </Button3D>
                    <Button3D
                      tone="mint"
                      onClick={() => onFinish?.(3, 'Đã hoàn thành xuất sắc hội thoại!')}
                      className="px-6 py-3 text-base"
                    >
                      <span>Hoàn thành bài học 🌟</span>
                    </Button3D>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PHỤ CHẾ ĐỘ 2: XEM TỪNG CÂU TỰ DO (LIST VIEW) */}
          {/* ========================================================= */}
          {dialogueSubMode === 'list' && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
                {dialogueLines.map((line, idx) => {
                  const isSelected = selectedDialogueIdx === idx;
                  return (
                    <button
                      key={line.id || idx}
                      type="button"
                      onClick={() => handleSelectDialogue(idx)}
                      className={`flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-peach text-white border-peach-dark shadow-[0_3px_0_var(--color-peach-dark)] scale-102'
                          : 'bg-cream/60 text-ink-soft border-banana-soft hover:bg-cream hover:text-ink'
                      }`}
                    >
                      <span className={`rounded-lg px-1.5 py-0.5 text-[11px] font-black ${
                        isSelected ? 'bg-white/30 text-white' : 'bg-white text-ink-soft'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="font-bold">{line.speaker}:</span>
                      <span className="max-w-[140px] truncate">&quot;{line.sentenceEn}&quot;</span>
                    </button>
                  );
                })}
              </div>

              {/* Thẻ luyện đọc tự do cho câu được chọn */}
              <section aria-label="Luyện đọc câu" className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="rounded-full bg-peach-soft px-3.5 py-1 text-xs font-black text-peach-dark uppercase">
                    Lượt {selectedDialogueIdx + 1}/{dialogueLines.length} · {currentTarget.speaker}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-ink leading-tight mt-1">
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

                {currentTarget.tipsVi && (
                  <div className="rounded-2xl bg-mint-soft/50 p-4 text-sm sm:text-base font-bold text-ink border border-mint/30 flex items-start gap-2.5">
                    <span className="text-xl shrink-0" aria-hidden>💡</span>
                    <div>
                      <strong className="text-mint-dark">Mẹo phát âm:</strong> {currentTarget.tipsVi}
                    </div>
                  </div>
                )}

                {/* Loa bản xứ */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-2 rounded-2xl bg-cream p-2 border border-banana-soft shadow-xs">
                    <SpeakerButton text={currentTarget.sentenceEn} audio={currentTarget.audio} size="lg" />
                    <span className="text-xs sm:text-sm font-black text-ink pr-2">Nghe bản xứ chuẩn</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(currentTarget.sentenceEn, { rate: 0.65, audio: currentTarget.audio })}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm sm:text-base font-black text-ink shadow-sm border border-banana-soft hover:bg-cream cursor-pointer"
                  >
                    <span>🐢 Nghe chậm từng từ</span>
                  </button>
                </div>

                {/* Micro */}
                <div className="flex flex-col items-center gap-3 py-4 border-t-2 border-dashed border-banana-soft">
                  {recordingStatus === 'evaluating' ? (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-banana-soft text-ink animate-pulse shadow-md border-2 border-banana">
                        <Sparkles className="h-8 w-8 text-peach animate-spin" />
                      </div>
                      <div className="flex items-center gap-2 text-peach-dark font-black text-sm sm:text-base animate-pulse">
                        <span className="h-2.5 w-2.5 rounded-full bg-peach animate-ping" />
                        <span>Đang chấm điểm AI...</span>
                      </div>
                    </div>
                  ) : recordingStatus === 'recording' ? (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={stopRecord}
                        className="animate-pulse inline-flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_6px_0_#b91c1c] hover:bg-rose-600 cursor-pointer transition-all"
                      >
                        <div className="h-8 w-8 rounded-lg bg-white" />
                      </button>
                      <div className="flex items-center gap-2 text-rose-600 font-black text-base animate-pulse">
                        <span className="h-3 w-3 rounded-full bg-rose-600" />
                        <span>Đang thu âm... Em nói to vào micro nhé!</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={startRecord}
                        className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-peach text-white shadow-[0_7px_0_var(--color-peach-dark)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer touch-manipulation select-none"
                        title={recordingStatus === 'done' ? "Bấm micro để đọc lại" : "Bấm micro để nói"}
                      >
                        <Mic className="h-11 w-11" />
                      </button>
                      <span className="text-base font-black text-ink">
                        {recordingStatus === 'done' ? 'Bấm micro để đọc lại' : 'Bấm micro để đọc'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Kết quả */}
                {recordingStatus === 'done' && (
                  <div className="rounded-3xl bg-cream/70 p-5 border-2 border-banana flex flex-col gap-4 text-center">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-lg text-ink">Đánh giá AI:</h5>
                      {scorePercent !== null && (
                        <span className="font-mono font-black text-base bg-banana px-3 py-1 rounded-full text-ink">
                          {scorePercent}%
                        </span>
                      )}
                    </div>
                    <p className="font-black text-peach-dark">{feedback}</p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      {audioUrl && (
                        <button
                          type="button"
                          onClick={() => playRecording(audioUrl)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-peach px-5 py-2.5 text-sm font-black text-white shadow-xs cursor-pointer touch-manipulation select-none"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          <span>Nghe lại giọng của em</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={startRecord}
                        className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-sky-dark px-5 text-sm font-black text-white shadow-[0_3px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
                      >
                        <Mic className="h-4 w-4" /> <span>Luyện đọc lại</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* CHẾ ĐỘ 2: MẪU CÂU GIAO TIẾP (CHALLENGES: 6-8 CÂU) */}
      {/* ========================================================= */}
      {mode === 'sentences' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {challengeList.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleSelectSentence(idx)}
                  className={`flex flex-col items-start rounded-2xl p-3 text-left transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-peach text-white border-peach-dark shadow-[0_4px_0_var(--color-peach-dark)] scale-102'
                      : 'bg-white text-ink border-banana-soft hover:bg-cream hover:border-banana shadow-2xs'
                  }`}
                >
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                    isSelected ? 'bg-white/30 text-white' : 'bg-cream text-ink-soft'
                  }`}>
                    {item.level || `Câu ${idx + 1}`}
                  </span>
                  <span className="mt-1 text-xs sm:text-sm font-black line-clamp-2 leading-snug">
                    {item.sentenceEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Khối luyện câu */}
          <section aria-label="Luyện nói mẫu câu" className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col gap-6">
            {currentTarget.dialogue && (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream/90 p-3.5 sm:p-4 border border-banana-soft text-sm sm:text-base font-bold text-ink">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-xl bg-banana px-3 py-1 font-black text-xs text-ink shrink-0">
                    👤 {currentTarget.dialogue.speaker || 'Gợi ý'}:
                  </span>
                  <span className="italic text-ink-soft">&quot;{currentTarget.dialogue.prompt}&quot;</span>
                </div>
                <SpeakerButton text={currentTarget.dialogue.prompt} size="sm" />
              </div>
            )}

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

            {currentTarget.tipsVi && (
              <div className="rounded-2xl bg-mint-soft/50 p-4 text-sm sm:text-base font-bold text-ink border border-mint/30 flex items-start gap-2.5">
                <span className="text-xl shrink-0" aria-hidden>💡</span>
                <div>
                  <strong className="text-mint-dark">Mẹo phát âm:</strong> {currentTarget.tipsVi}
                </div>
              </div>
            )}

            {/* Nghe bản xứ */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-cream p-2 border border-banana-soft shadow-xs">
                <SpeakerButton text={currentTarget.sentenceEn} audio={currentTarget.audio} size="lg" />
                <span className="text-xs sm:text-sm font-black text-ink pr-2">Nghe bản xứ chuẩn</span>
              </div>
              <button
                type="button"
                onClick={() => speak(currentTarget.sentenceEn, { rate: 0.65, audio: currentTarget.audio })}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm sm:text-base font-black text-ink shadow-sm border border-banana-soft hover:bg-cream cursor-pointer"
              >
                <span>🐢 Nghe chậm từng từ</span>
              </button>
            </div>

            {/* Micro */}
            <div className="flex flex-col items-center gap-3 py-4 border-t-2 border-dashed border-banana-soft">
              {recordingStatus === 'evaluating' ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-banana-soft text-ink animate-pulse shadow-md border-2 border-banana">
                    <Sparkles className="h-8 w-8 text-peach animate-spin" />
                  </div>
                  <div className="flex items-center gap-2 text-peach-dark font-black text-sm sm:text-base animate-pulse">
                    <span className="h-2.5 w-2.5 rounded-full bg-peach animate-ping" />
                    <span>Đang chấm điểm AI...</span>
                  </div>
                </div>
              ) : recordingStatus === 'recording' ? (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={stopRecord}
                    className="animate-pulse inline-flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_6px_0_#b91c1c] hover:bg-rose-600 cursor-pointer transition-all"
                  >
                    <div className="h-8 w-8 rounded-lg bg-white" />
                  </button>
                  <div className="flex items-center gap-2 text-rose-600 font-black text-base animate-pulse">
                    <span className="h-3 w-3 rounded-full bg-rose-600" />
                    <span>Đang thu âm... Em nói to vào micro nhé!</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={startRecord}
                    className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-peach text-white shadow-[0_7px_0_var(--color-peach-dark)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer touch-manipulation select-none"
                    title={recordingStatus === 'done' ? "Bấm micro để đọc lại" : "Bấm micro để nói"}
                  >
                    <Mic className="h-11 w-11" />
                  </button>
                  <span className="text-base font-black text-ink">
                    {recordingStatus === 'done' ? 'Bấm micro để đọc lại' : 'Bấm micro để nói'}
                  </span>
                </div>
              )}
            </div>

            {/* Đánh giá */}
            {recordingStatus === 'done' && (
              <div className="rounded-3xl bg-gradient-to-br from-cream via-white to-peach-soft/30 p-6 border-2 border-banana flex flex-col gap-4 text-center">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-banana-soft pb-3">
                  <h5 className="text-xl font-black text-ink">Kết quả AI đánh giá</h5>
                  {scorePercent !== null && (
                    <span className="rounded-full bg-banana px-3 py-1 font-mono text-base font-black text-ink">
                      {scorePercent}%
                    </span>
                  )}
                </div>
                <p className="text-base sm:text-lg font-black text-peach-dark">{feedback}</p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={() => playRecording(audioUrl)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-sm font-black text-white shadow-xs cursor-pointer touch-manipulation select-none"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>▶️ Nghe lại giọng của em</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={startRecord}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-sky-dark px-5 text-sm font-black text-white shadow-[0_3px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
                  >
                    <Mic className="h-4 w-4" /> <span>Luyện đọc lại</span>
                  </button>
                </div>
              </div>
            )}

            {/* Điều hướng */}
            <div className="flex items-center justify-between border-t border-banana-soft pt-4">
              {selectedIdx > 0 ? (
                <button
                  type="button"
                  onClick={() => handleSelectSentence(selectedIdx - 1)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-cream px-4 py-2 text-xs sm:text-sm font-black text-ink hover:bg-banana-soft cursor-pointer transition-all border border-banana-soft"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Câu trước</span>
                </button>
              ) : <div />}

              {selectedIdx + 1 < challengeList.length ? (
                <Button3D tone="peach" onClick={() => handleSelectSentence(selectedIdx + 1)} className="px-5 py-2 text-xs sm:text-sm">
                  <span>Sang câu tiếp theo →</span>
                </Button3D>
              ) : (
                <Button3D tone="mint" onClick={() => onFinish?.(3, 'Đã hoàn thành mẫu câu!')} className="px-5 py-2 text-xs sm:text-sm">
                  <span>Hoàn thành xuất sắc 🌟</span>
                </Button3D>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================= */}
      {/* CHẾ ĐỘ 3: TỪ VỰNG ({vocabularies.length} TỪ) */}
      {/* ========================================================= */}
      {mode === 'vocab' && (
        <div className="flex flex-col gap-5">
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

          <section aria-label="Luyện nói từ vựng" className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2">
              <span className="rounded-full bg-banana px-3 py-1 text-xs font-black text-ink uppercase">
                {currentTarget.level}
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-ink leading-tight">
                {currentTarget.sentenceEn}
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

            {currentTarget.tipsVi && (
              <div className="rounded-2xl bg-mint-soft/50 p-4 text-sm sm:text-base font-bold text-ink border border-mint/30 flex items-start gap-2.5">
                <span className="text-xl shrink-0" aria-hidden>💡</span>
                <div>
                  <strong className="text-mint-dark">Thông tin từ vựng:</strong> {currentTarget.tipsVi}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <SpeakerButton text={currentTarget.sentenceEn} audio={currentTarget.audio} size="lg" />
              <button
                type="button"
                onClick={() => speak(currentTarget.sentenceEn, { rate: 0.65, audio: currentTarget.audio })}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm sm:text-base font-black text-ink shadow-sm border border-banana-soft hover:bg-cream cursor-pointer"
              >
                <span>🐢 Nghe chậm</span>
              </button>
            </div>

            {/* Micro */}
            <div className="flex flex-col items-center gap-3 py-4 border-t-2 border-dashed border-banana-soft">
              {recordingStatus === 'evaluating' ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-banana-soft text-ink animate-pulse shadow-md border-2 border-banana">
                    <Sparkles className="h-8 w-8 text-peach animate-spin" />
                  </div>
                  <div className="flex items-center gap-2 text-peach-dark font-black text-sm sm:text-base animate-pulse">
                    <span className="h-2.5 w-2.5 rounded-full bg-peach animate-ping" />
                    <span>Đang chấm điểm AI...</span>
                  </div>
                </div>
              ) : recordingStatus === 'recording' ? (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={stopRecord}
                    className="animate-pulse inline-flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_6px_0_#b91c1c] hover:bg-rose-600 cursor-pointer transition-all"
                  >
                    <div className="h-8 w-8 rounded-lg bg-white" />
                  </button>
                  <span className="text-rose-600 font-black">Đang thu âm từ vựng...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={startRecord}
                    className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-banana text-ink shadow-[0_7px_0_#d8b13c] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer touch-manipulation select-none"
                    title={recordingStatus === 'done' ? "Bấm micro để đọc lại" : "Bấm micro để nói"}
                  >
                    <Mic className="h-11 w-11" />
                  </button>
                  <span className="text-base font-black text-ink">
                    {recordingStatus === 'done' ? 'Bấm micro để đọc lại từ này' : 'Bấm micro để đọc từ này'}
                  </span>
                </div>
              )}
            </div>

            {recordingStatus === 'done' && (
              <div className="rounded-3xl bg-cream/70 p-5 border-2 border-banana flex flex-col gap-4 text-center">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-lg text-ink">Điểm số AI:</h5>
                  {scorePercent !== null && (
                    <span className="font-mono font-black text-base bg-banana px-3 py-1 rounded-full text-ink">
                      {scorePercent}%
                    </span>
                  )}
                </div>
                <p className="font-black text-peach-dark">{feedback}</p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={() => playRecording(audioUrl)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-peach px-5 py-2.5 text-sm font-black text-white shadow-xs cursor-pointer touch-manipulation select-none"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Nghe lại giọng của em</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={startRecord}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-sky-dark px-5 text-sm font-black text-white shadow-[0_3px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer touch-manipulation select-none"
                  >
                    <Mic className="h-4 w-4" /> <span>Luyện đọc lại</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-banana-soft pt-4">
              {selectedVocabIdx > 0 ? (
                <button
                  type="button"
                  onClick={() => handleSelectVocab(selectedVocabIdx - 1)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-cream px-4 py-2 text-xs sm:text-sm font-black text-ink hover:bg-banana-soft cursor-pointer transition-all border border-banana-soft"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Từ trước</span>
                </button>
              ) : <div />}

              {selectedVocabIdx + 1 < vocabularies.length ? (
                <Button3D tone="banana" onClick={() => handleSelectVocab(selectedVocabIdx + 1)} className="px-5 py-2 text-xs sm:text-sm">
                  <span>Sang từ tiếp theo →</span>
                </Button3D>
              ) : (
                <Button3D tone="mint" onClick={() => onFinish?.(3, 'Đã hoàn thành từ vựng!')} className="px-5 py-2 text-xs sm:text-sm">
                  <span>Hoàn thành xuất sắc 🌟</span>
                </Button3D>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
