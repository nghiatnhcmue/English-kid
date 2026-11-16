// Ghi âm giọng nói của em để nghe lại. File chỉ nằm trong bộ nhớ trình duyệt, không lưu, không gửi đi.

export const isRecordingSupported = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

const MESSAGES = {
  NotAllowedError: 'Em cần cho phép dùng micro (bấm "Cho phép" trên trình duyệt) để ghi âm nhé.',
  NotFoundError: 'Không tìm thấy micro trên máy. Em vẫn có thể luyện nói to theo mẫu nhé!',
  default: 'Chưa ghi âm được. Em vẫn có thể luyện nói to theo mẫu nhé!',
};

export function createRecorder() {
  let stream = null;
  let recorder = null;
  let chunks = [];
  let lastUrl = null;
  let activeMimeType = null;
  let audioCtx = null;
  let analyser = null;
  let source = null;
  let vadInterval = null;
  let voiceStats = {
    hasVoice: false,
    peakVolume: 0,
    voiceFrames: 0,
    totalFrames: 0,
  };

  const setupVAD = (mediaStream) => {
    try {
      const AudioCtxClass =
        (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
        (typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext)) ||
        null;
      if (!AudioCtxClass || !mediaStream) return;

      if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new AudioCtxClass();
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume?.();
      }

      source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      voiceStats = {
        hasVoice: false,
        peakVolume: 0,
        voiceFrames: 0,
        totalFrames: 0,
      };

      if (vadInterval) clearInterval(vadInterval);
      vadInterval = setInterval(() => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        let maxVal = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          sum += val;
          if (val > maxVal) maxVal = val;
        }
        const avg = sum / bufferLength;
        voiceStats.totalFrames++;
        if (avg > voiceStats.peakVolume) {
          voiceStats.peakVolume = avg;
        }
        // Human voice directly into mic produces avg >= 12 or peak >= 45.
        // Background room silence is typically avg < 8, peak < 25.
        if (avg >= 12 || maxVal >= 45) {
          voiceStats.voiceFrames++;
        }
        if (voiceStats.voiceFrames >= 3) {
          voiceStats.hasVoice = true;
        }
      }, 50);
    } catch {
      // Graceful fallback if Web Audio API is unavailable
    }
  };

  const cleanupVAD = () => {
    if (vadInterval) {
      clearInterval(vadInterval);
      vadInterval = null;
    }
    if (source) {
      try { source.disconnect(); } catch {}
      source = null;
    }
    analyser = null;
  };

  return {
    /** Bắt đầu ghi. Trả về { ok: true } hoặc { ok: false, message }. */
    async start() {
      if (!isRecordingSupported()) return { ok: false, message: MESSAGES.default };
      try {
        const isLive = stream && stream.getAudioTracks().some((t) => t.readyState === 'live');
        if (!isLive) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        chunks = [];
        setupVAD(stream);
        const candidateTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/aac',
          'audio/ogg;codecs=opus',
        ];
        const mimeType = candidateTypes.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(t));
        activeMimeType = mimeType;
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        recorder.start();
        return { ok: true };
      } catch (err) {
        cleanupVAD();
        return { ok: false, message: MESSAGES[err?.name] ?? MESSAGES.default };
      }
    },
    /** Dừng ghi, trả về blob URL để phát lại (hoặc null). */
    stop() {
      cleanupVAD();
      return new Promise((resolve) => {
        if (!recorder || recorder.state === 'inactive') return resolve(null);
        recorder.onstop = () => {
          if (lastUrl) URL.revokeObjectURL(lastUrl);
          const type = recorder.mimeType || activeMimeType || 'audio/webm';
          lastUrl = chunks.length ? URL.createObjectURL(new Blob(chunks, { type })) : null;
          resolve(lastUrl);
        };
        recorder.stop();
      });
    },
    /** Lấy thống kê năng lượng âm thanh & nhận diện giọng nói (VAD). */
    getAudioStats() {
      return {
        hasVoice: voiceStats.hasVoice,
        peakVolume: voiceStats.peakVolume,
        voiceFrames: voiceStats.voiceFrames,
        totalFrames: voiceStats.totalFrames,
      };
    },
    /** Tắt micro, giải phóng bộ nhớ. */
    release() {
      cleanupVAD();
      if (audioCtx) {
        try { audioCtx.close?.(); } catch {}
        audioCtx = null;
      }
      try {
        if (recorder?.state === 'recording') recorder.stop();
      } catch {
        /* bỏ qua */
      }
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      if (lastUrl) URL.revokeObjectURL(lastUrl);
      lastUrl = null;
    },
  };
}
