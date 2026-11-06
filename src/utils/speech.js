// Phát âm bằng Web Speech API của trình duyệt, có file mp3 dự phòng (trường "audio" trong dữ liệu).

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

export const isTtsSupported = () => !!synth && typeof SpeechSynthesisUtterance !== 'undefined';

let voicesPromise;
export function loadVoices() {
  if (!isTtsSupported()) return Promise.resolve([]);
  if (voicesPromise) return voicesPromise;
  voicesPromise = new Promise((resolve) => {
    const now = synth.getVoices();
    if (now.length) return resolve(now);
    const done = () => resolve(synth.getVoices());
    synth.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, 1500); // một số trình duyệt không bắn sự kiện
  }).then((voices) => {
    if (!voices.length) voicesPromise = undefined; // thử lại lần sau
    return voices;
  });
  return voicesPromise;
}

/** Chọn giọng tiếng Anh phù hợp; khi offline ưu tiên giọng cài sẵn trên máy (localService). */
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

export function stopSpeaking() {
  try {
    synth?.cancel();
  } catch {
    /* bỏ qua */
  }
}

/** Đọc một đoạn văn bản, trả về Promise khi đọc xong. */
export async function speak(text, { lang = 'en-GB', rate = 0.85 } = {}) {
  if (!isTtsSupported() || !text) return false;
  const voices = await loadVoices();
  return new Promise((resolve) => {
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(voices, lang);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? lang;
    u.rate = rate;
    u.onend = () => resolve(true);
    u.onerror = () => resolve(false);
    synth.speak(u);
    // Phòng trường hợp trình duyệt không gọi onend
    setTimeout(() => resolve(true), Math.max(2500, text.length * 180));
  });
}

function playFile(src) {
  return new Promise((resolve) => {
    const a = new Audio(src);
    a.onended = () => resolve(true);
    a.onerror = () => resolve(false);
    a.play().catch(() => resolve(false));
  });
}

/** Đọc từ vựng: dùng file mp3 nếu có, nếu không dùng giọng máy. slowToo: đọc thêm lần chậm. */
export async function sayWord(word, settings = {}, { slowToo = false } = {}) {
  const text = typeof word === 'string' ? word : word.word;
  const audio = typeof word === 'object' ? word.audio : null;
  if (audio && (await playFile(audio))) {
    if (slowToo) await playFile(audio);
    return true;
  }
  const ok = await speak(text, settings);
  if (ok && slowToo) {
    await new Promise((r) => setTimeout(r, 350));
    await speak(text, { ...settings, rate: 0.6 });
  }
  return ok;
}

// ---- Nhận dạng giọng nói (chấm nói nhẹ nhàng). Safari/iOS thường không hỗ trợ → trả null. ----
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

export const isSttSupported = () => !!Recognition;

/**
 * Nghe 1 câu. Trả về { transcripts: string[] } hoặc null nếu không hỗ trợ / lỗi / hết giờ.
 * Không bao giờ ném lỗi, để giao diện luôn có đường lui (tự đánh giá).
 */
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
      } catch {
        /* bỏ qua */
      }
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
