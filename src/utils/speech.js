// Động cơ âm thanh thông minh đa tầng:
// 1. File MP3 chuẩn bản xứ chất lượng cao (đã tải sẵn offline trong /assets/audio/...)
// 2. Cloud TTS trực tuyến chất lượng phòng thu (Youdao UK/US voice + Google TTS)
// 3. Web Speech API tích hợp của trình duyệt (dự phòng khi mất mạng hoàn toàn)

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

export const isTtsSupported = () => !!synth && typeof SpeechSynthesisUtterance !== 'undefined';

let currentAudio = null;
let activeUtterance = null; // Giữ tham chiếu toàn cục tránh bị V8 Garbage Collection hủy giữa chừng

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      /* bỏ qua */
    }
    currentAudio = null;
  }
  try {
    if (synth && (synth.speaking || synth.pending)) {
      synth.cancel();
    }
  } catch {
    /* bỏ qua */
  }
}

/** Tạo link audio từ điển Youdao chất lượng cao cho từ vựng */
export function getCloudTtsUrl(text, lang = 'en-GB') {
  const clean = (text || '').trim();
  const isUS = (lang || '').toLowerCase().includes('us');
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&type=${isUS ? '2' : '1'}`;
}

let voicesPromise;
export function loadVoices() {
  if (!isTtsSupported()) return Promise.resolve([]);
  if (voicesPromise) return voicesPromise;
  voicesPromise = new Promise((resolve) => {
    const now = synth.getVoices();
    if (now.length) return resolve(now);
    const done = () => resolve(synth.getVoices());
    synth.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, 1500);
  }).then((voices) => {
    if (!voices.length) voicesPromise = undefined;
    return voices;
  });
  return voicesPromise;
}

export function pickVoice(voices, lang = 'en-GB', online = typeof navigator === 'undefined' || navigator.onLine) {
  const norm = (l) => (l || '').replace('_', '-').toLowerCase();
  const english = voices.filter((v) => norm(v.lang).startsWith('en'));
  const usable = online ? english : english.filter((v) => v.localService);
  const pool = usable.length ? usable : english;
  const exact = pool.filter((v) => norm(v.lang) === norm(lang));
  const candidates = exact.length ? exact : pool;
  return candidates.find((v) => /google|natural|enhanced|premium/i.test(v.name)) ?? candidates[0] ?? null;
}

export async function hasEnglishVoice() {
  const voices = await loadVoices();
  return !!pickVoice(voices, 'en-GB', true);
}

/** Phát một file âm thanh hoặc đường dẫn stream online */
function playAudioFile(src, rate = 1) {
  return new Promise((resolve) => {
    stopSpeaking();
    if (!src) return resolve(false);

    const a = new Audio(src);
    currentAudio = a;
    try {
      a.playbackRate = Math.min(2, Math.max(0.5, rate));
    } catch {}

    const cleanup = () => {
      if (currentAudio === a) currentAudio = null;
    };

    a.onended = () => {
      cleanup();
      resolve(true);
    };
    a.onerror = () => {
      cleanup();
      resolve(false);
    };

    a.play().catch(() => {
      cleanup();
      resolve(false);
    });

    // Timeout an toàn phòng trường hợp audio bị kẹt mạng
    setTimeout(() => {
      if (currentAudio === a) {
        cleanup();
        resolve(true);
      }
    }, 15000);
  });
}

/** Đọc văn bản/câu nói (Ưu tiên file âm thanh -> Online Cloud TTS cho từ vựng -> Web Speech API cho câu dài) */
export async function speak(text, { lang = 'en-GB', rate = 0.85, audio = null } = {}) {
  if (!text) return false;
  stopSpeaking();

  // 1. Nếu có file âm thanh sẵn (ví dụ câu ví dụ trong dữ liệu)
  if (audio) {
    const ok = await playAudioFile(audio, rate);
    if (ok) return true;
  }

  const clean = text.trim();
  const wordCount = clean.split(/\s+/).length;

  // 2. Với từ đơn hoặc cụm từ ngắn (1-2 từ): Thử phát online Youdao Oxford/Cambridge
  if (wordCount <= 2) {
    try {
      const isUS = (lang || '').toLowerCase().includes('us');
      const cloudUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&type=${isUS ? '2' : '1'}`;
      const ok = await playAudioFile(cloudUrl, rate);
      if (ok) return true;
    } catch {
      /* bỏ qua sang fallback */
    }
  }

  // 2b. Thử phát Google TTS trực tuyến chuẩn giọng bản xứ UK/US
  try {
    const isUS = (lang || '').toLowerCase().includes('us');
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${isUS ? 'en-US' : 'en-GB'}&client=tw-ob&q=${encodeURIComponent(clean)}`;
    const ok = await playAudioFile(googleTtsUrl, rate);
    if (ok) return true;
  } catch {
    /* bỏ qua sang Web Speech API */
  }

  // 3. Với câu văn dài hoặc khi ngoại tuyến hoàn toàn:
  // Dùng trực tiếp Web Speech API tích hợp của trình duyệt
  if (isTtsSupported()) {
    try {
      if (synth.paused) synth.resume();
      let voices = synth.getVoices();
      if (!voices.length) {
        voices = await loadVoices();
      }
      return new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(clean);
        activeUtterance = u;
        if (typeof window !== 'undefined') window.__activeUtterance = u;

        const voice = pickVoice(voices, lang);
        if (voice) u.voice = voice;
        u.lang = voice?.lang ?? lang;
        u.rate = Math.min(1.5, Math.max(0.6, rate));
        u.pitch = 1;
        u.volume = 1;

        let finished = false;
        const cleanup = () => {
          if (finished) return;
          finished = true;
          activeUtterance = null;
          if (typeof window !== 'undefined') window.__activeUtterance = null;
        };

        u.onend = () => {
          cleanup();
          resolve(true);
        };
        u.onerror = () => {
          cleanup();
          resolve(false);
        };

        synth.speak(u);
        setTimeout(() => {
          cleanup();
          resolve(true);
        }, Math.max(3000, clean.length * 150));
      });
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Đọc từ vựng tiếng Anh chuẩn xác:
 * - Ưu tiên file mp3 gốc trong dữ liệu (/assets/audio/...)
 * - Hỗ trợ chế độ đọc chậm (slow) hoặc đọc 2 lần (slowToo)
 */
export async function sayWord(word, settings = {}, { slowToo = false, slow = false } = {}) {
  const text = typeof word === 'string' ? word : word?.word;
  const audio = typeof word === 'object' ? (word.audio || word.audioExample) : null;
  const lang = settings.lang || 'en-GB';
  const targetRate = slow ? 0.65 : (settings.rate || 1.0);

  // 1. Thử phát file mp3 đã lưu sẵn trong project
  if (audio) {
    const ok = await playAudioFile(audio, targetRate);
    if (ok) {
      if (slowToo) {
        await new Promise((r) => setTimeout(r, 350));
        await playAudioFile(audio, 0.65);
      }
      return true;
    }
  }

  // 2. Thử phát online cloud TTS
  try {
    const cloudUrl = getCloudTtsUrl(text, lang);
    const ok = await playAudioFile(cloudUrl, targetRate);
    if (ok) {
      if (slowToo) {
        await new Promise((r) => setTimeout(r, 350));
        await playAudioFile(cloudUrl, 0.65);
      }
      return true;
    }
  } catch {}

  // 3. Fallback sang Web Speech API
  const ok = await speak(text, { ...settings, rate: targetRate });
  if (ok && slowToo) {
    await new Promise((r) => setTimeout(r, 350));
    await speak(text, { ...settings, rate: 0.6 });
  }
  return ok;
}

// ---- Nhận dạng giọng nói (STT cho Stage 3D) ----
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

export const isSttSupported = () => !!Recognition;

export function recognizeOnce({ lang = 'en-GB', timeoutMs = 8000 } = {}) {
  if (!Recognition) return Promise.resolve(null);
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        rec.abort();
      } catch {}
      resolve(value);
    };
    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.onresult = (e) => {
      const alts = [...(e.results?.[0] ?? [])].map((r) => r.transcript);
      finish(alts.length ? { transcripts: alts } : null);
    };
    rec.onerror = () => finish(null);
    rec.onend = () => finish(null);
    const timer = setTimeout(() => finish(null), timeoutMs);
    try {
      rec.start();
    } catch {
      finish(null);
    }
  });
}
