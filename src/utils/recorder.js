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

  return {
    /** Bắt đầu ghi. Trả về { ok: true } hoặc { ok: false, message }. */
    async start() {
      if (!isRecordingSupported()) return { ok: false, message: MESSAGES.default };
      try {
        stream ??= await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        recorder.start();
        return { ok: true };
      } catch (err) {
        return { ok: false, message: MESSAGES[err?.name] ?? MESSAGES.default };
      }
    },
    /** Dừng ghi, trả về blob URL để phát lại (hoặc null). */
    stop() {
      return new Promise((resolve) => {
        if (!recorder || recorder.state === 'inactive') return resolve(null);
        recorder.onstop = () => {
          if (lastUrl) URL.revokeObjectURL(lastUrl);
          lastUrl = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })) : null;
          resolve(lastUrl);
        };
        recorder.stop();
      });
    },
    /** Tắt micro, giải phóng bộ nhớ. */
    release() {
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
