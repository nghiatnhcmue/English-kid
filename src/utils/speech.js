// Động cơ âm thanh nhiều tầng, mỗi lượt phát chỉ thử mỗi nguồn MỘT lần:
// 1. File MP3 thu sẵn trong /assets/audio/... (giọng Anh–Anh, chạy offline sau lần mở đầu)
// 2. Youdao (online) cho từ / cụm từ ngắn khi không có file
// 3. Web Speech API của trình duyệt (dự phòng cuối, chạy cả khi mất mạng)
//
// Mỗi lần bấm loa tạo một "lượt" mới. Lượt cũ bị hủy ngay (kể cả lần đọc chậm slowToo đang chờ),
// nên lướt thẻ nhanh không bao giờ làm từ cũ tự phát lại sau đó.

const getSynth = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) return window.speechSynthesis;
  if (typeof globalThis !== 'undefined' && globalThis.speechSynthesis) return globalThis.speechSynthesis;
  return undefined;
};

const getUtteranceClass = () => {
  if (typeof SpeechSynthesisUtterance !== 'undefined') return SpeechSynthesisUtterance;
  if (typeof window !== 'undefined' && window.SpeechSynthesisUtterance) return window.SpeechSynthesisUtterance;
  if (typeof globalThis !== 'undefined' && globalThis.SpeechSynthesisUtterance) return globalThis.SpeechSynthesisUtterance;
  return undefined;
};

export const isTtsSupported = () => !!getSynth() && !!getUtteranceClass();

const DEFAULT_RATE = 0.85; // tốc độ TTS mặc định trong Cài đặt
const SLOW_MP3_RATE = 0.7;
const SLOW_TTS_RATE = 0.65;
const CANCELLED = null; // kết quả khi lượt phát bị hủy (khác false = nguồn lỗi)

let generation = 0;
let currentAudio = null;
let settleCurrent = null; // resolve của nguồn đang phát (để hủy không bị treo)
let activeUtterance = null; // giữ tham chiếu tránh bị GC hủy giữa chừng (Chrome)

function haltCurrent() {
  const settle = settleCurrent;
  settleCurrent = null;
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      /* bỏ qua */
    }
    currentAudio = null;
  }
  try {
    const synth = getSynth();
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
  } catch {
    /* bỏ qua */
  }
  activeUtterance = null;
  if (settle) settle(CANCELLED);
}

/** Dừng mọi âm thanh đang phát và hủy các bước còn lại của lượt hiện tại. */
export function stopSpeaking() {
  generation += 1;
  haltCurrent();
}

/** Bắt đầu một lượt phát mới; trả về hàm kiểm tra lượt còn hiệu lực không. */
function beginTurn() {
  stopSpeaking();
  const mine = generation;
  return () => mine === generation;
}

/** Link audio từ điển Youdao cho từ vựng (type=1 Anh–Anh, type=2 Anh–Mỹ) */
export function getCloudTtsUrl(text, lang = 'en-GB') {
  const clean = (text || '').trim();
  const isUS = (lang || '').toLowerCase().includes('us');
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&type=${isUS ? '2' : '1'}`;
}

let voicesPromise;
export function loadVoices() {
  if (!isTtsSupported()) return Promise.resolve([]);
  if (voicesPromise) return voicesPromise;
  const synth = getSynth();
  voicesPromise = new Promise((resolve) => {
    const now = synth?.getVoices?.() || [];
    if (now.length) return resolve(now);
    const done = () => resolve(synth?.getVoices?.() || []);
    synth?.addEventListener?.('voiceschanged', done, { once: true });
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
  if (!english.length) return null;
  const exact = english.filter((v) => norm(v.lang) === norm(lang));
  const candidates = exact.length ? exact : english;
  // Ưu tiên giọng natural/google (khi online), sau đó giọng cài sẵn trong máy
  const natural = online ? candidates.find((v) => /natural|enhanced|google/i.test(v.name)) : null;
  const local = candidates.find((v) => v.localService);
  return natural || local || candidates[0] || null;
}

export async function hasEnglishVoice() {
  const voices = await loadVoices();
  return !!pickVoice(voices, 'en-GB', true);
}

/** Tốc độ phát file mp3: mặc định đúng 1.0 (tỉ lệ theo Cài đặt), chế độ chậm 0.7 */
export function mp3Rate({ slow = false, rate = DEFAULT_RATE } = {}) {
  if (slow) return SLOW_MP3_RATE;
  return Math.min(1.25, Math.max(0.75, (rate || DEFAULT_RATE) / DEFAULT_RATE));
}

// Trình duyệt tải audio theo từng đoạn (206) nên service worker không lưu được. Sau lần phát đầu,
// tải ngầm bản đầy đủ (200) của file mp3 trong app để lần sau phát được cả khi mất mạng.
const warmed = new Set();
function warmCache(src) {
  try {
    if (typeof fetch !== 'function' || typeof window === 'undefined') return;
    const url = new URL(src, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/assets/audio/')) return;
    if (warmed.has(url.pathname)) return;
    warmed.add(url.pathname);
    fetch(url.pathname).catch(() => warmed.delete(url.pathname));
  } catch {
    /* bỏ qua */
  }
}

/** Phát một file / stream. Kết quả: true (xong), false (lỗi nguồn), null (bị hủy) */
export function playAudioFile(src, playbackRate = 1) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }
    haltCurrent();

    const isRemote = /^https?:\/\//i.test(src);
    const a = new Audio(src);
    currentAudio = a;
    let timer = null;
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      if (settleCurrent === finish) settleCurrent = null;
      clearTimeout(timer);
      if (currentAudio === a) currentAudio = null;
      try {
        a.pause();
      } catch {
        /* bỏ qua */
      }
      resolve(value);
    };
    settleCurrent = finish;

    const applyRate = () => {
      try {
        a.playbackRate = Math.min(2, Math.max(0.5, playbackRate));
      } catch {
        /* bỏ qua */
      }
    };
    applyRate();
    // Chờ tải tối đa: URL từ xa (Youdao...) chờ tối đa 2200ms để fallback nhanh sang TTS; file nội bộ (/assets/audio/...) chờ 6000ms
    timer = setTimeout(() => finish(false), isRemote ? 2200 : 6000);
    a.addEventListener('loadedmetadata', () => {
      applyRate();
      if (Number.isFinite(a.duration) && a.duration > 0) {
        clearTimeout(timer);
        timer = setTimeout(() => finish(true), (a.duration / (a.playbackRate || 1)) * 1000 + 2000);
      }
    });
    a.addEventListener('ended', () => {
      warmCache(src);
      finish(true);
    });
    a.addEventListener('error', () => finish(false));
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => finish(false));
  });
}

/** Đọc bằng Web Speech API. Kết quả: true / false / null (bị hủy) */
async function speakTts(text, { lang = 'en-GB', rate = DEFAULT_RATE } = {}, alive = () => true) {
  if (!isTtsSupported() || !text) return false;
  const synth = getSynth();
  const Utterance = getUtteranceClass();
  let voices = synth?.getVoices?.() || [];
  if (!voices.length) voices = await loadVoices();
  if (!alive()) return CANCELLED;
  haltCurrent();
  // Fix Chromium synth.cancel() bug: khi hủy lượt phát trước, synth giải phóng bất đồng bộ.
  // Thêm một khoảng chờ 40ms trước synth.speak(u) để Chrome không tự động hủy utterance mới.
  await new Promise((r) => setTimeout(r, 40));
  if (!alive()) return CANCELLED;

  return new Promise((resolve) => {
    const u = new Utterance(text);
    activeUtterance = u;
    const voice = pickVoice(voices, lang);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? lang;
    u.rate = Math.min(1.5, Math.max(0.5, rate));

    let timer = null;
    let keepAliveTimer = null;
    let done = false;

    const cleanup = () => {
      clearTimeout(timer);
      clearInterval(keepAliveTimer);
      timer = null;
      keepAliveTimer = null;
      if (u) {
        u.onstart = null;
        u.onend = null;
        u.onerror = null;
      }
    };

    const finish = (value) => {
      if (done) return;
      done = true;
      cleanup();
      if (settleCurrent === finish) settleCurrent = null;
      if (activeUtterance === u) activeUtterance = null;
      resolve(value);
    };
    settleCurrent = finish;

    // Giữ kết nối TTS trên Chrome: các đoạn đọc dài (>15s) thường bị Chrome tự động tạm dừng.
    // Interval 2000ms gọi resume() duy trì mạch phát đến khi onend/onerror.
    u.onstart = () => {
      if (done) return;
      clearInterval(keepAliveTimer);
      keepAliveTimer = setInterval(() => {
        try {
          const s = getSynth();
          if (s && s.paused) s.resume();
        } catch {
          /* bỏ qua */
        }
      }, 2000);
    };

    u.onend = () => finish(true);
    u.onerror = (e) => finish(e?.error === 'interrupted' || e?.error === 'canceled' ? CANCELLED : false);

    try {
      if (synth && synth.paused) synth.resume();
      synth.speak(u);
    } catch {
      finish(false);
      return;
    }
    // Phòng khi trình duyệt không bắn onend: ~80ms/ký tự ở tốc độ 1, tối thiểu 3 giây
    timer = setTimeout(() => finish(true), Math.max(3000, (text.length * 80) / u.rate + 1500));
  });
}

const isShort = (text) => text.trim().split(/\s+/).length <= 3;

/**
 * Đọc câu / đoạn văn: file mp3 (nếu có) → Youdao (cụm ≤ 3 từ) → TTS.
 * `slow: true` hoặc rate ≤ 0.7 = đọc chậm.
 */
export async function speak(text, { lang = 'en-GB', rate = DEFAULT_RATE, audio = null, slow = false, sound = true } = {}) {
  if (sound === false) return false;
  const clean = (text || '').trim();
  if (!clean && !audio) return false;
  const alive = beginTurn();
  const isSlow = slow || rate <= 0.7;

  if (audio) {
    const r = await playAudioFile(audio, mp3Rate({ slow: isSlow, rate }));
    if (r !== false || !alive()) return r === true;
  }
  if (!clean) return false;
  if (isShort(clean)) {
    const r = await playAudioFile(getCloudTtsUrl(clean, lang), mp3Rate({ slow: isSlow, rate }));
    if (r !== false || !alive()) return r === true;
  }
  const r = await speakTts(clean, { lang, rate: isSlow ? Math.min(rate, SLOW_TTS_RATE) : rate }, alive);
  return r === true;
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Đọc một từ vựng: file mp3 của TỪ (không bao giờ lấy file câu ví dụ) → Youdao → TTS.
 * slowToo: đọc thường xong đọc chậm thêm một lần; bị hủy giữa chừng thì không đọc lần 2.
 */
export async function sayWord(word, settings = {}, { slowToo = false, slow = false } = {}) {
  if (settings && settings.sound === false) return false;
  const text = (typeof word === 'string' ? word : word?.word || '').trim();
  const audio = typeof word === 'object' ? word?.audio || null : null;
  if (!text && !audio) return false;
  const lang = settings?.lang || 'en-GB';
  const rate = settings?.rate || DEFAULT_RATE;
  const alive = beginTurn();

  const sources = [audio, text && getCloudTtsUrl(text, lang)].filter(Boolean);
  for (const src of sources) {
    const r = await playAudioFile(src, mp3Rate({ slow, rate }));
    if (!alive() || r === CANCELLED) return false;
    if (r === true) {
      if (slowToo && !slow) {
        await pause(350);
        if (!alive()) return true;
        await playAudioFile(src, SLOW_MP3_RATE);
      }
      return true;
    }
  }

  const r = await speakTts(text, { lang, rate: slow ? SLOW_TTS_RATE : rate }, alive);
  if (r === true && slowToo && !slow && alive()) {
    await pause(350);
    if (alive()) await speakTts(text, { lang, rate: SLOW_TTS_RATE }, alive);
  }
  return r === true;
}

/** Phát bản ghi âm của học sinh qua cùng bộ điều phối (dừng loa khác, không chồng tiếng). */
export async function playRecording(url) {
  const alive = beginTurn();
  const r = await playAudioFile(url, 1);
  return alive() && r === true;
}

// ---- Nhận dạng giọng nói (STT cho Stage 3D) ----
const getRecognition = () => {
  const scope = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : undefined;
  return scope ? scope.SpeechRecognition || scope.webkitSpeechRecognition : undefined;
};

export const isSttSupported = () => !!getRecognition();

/**
 * Nhận dạng giọng nói một lần (STT) với bộ điều khiển hỗ trợ kết quả tạm thời (interim results)
 * và phương thức `.stop()` theo yêu cầu.
 * Trả về controller có `.promise`, `.stop()`, `.abort()` đồng thời là thenable (await được).
 */
export function recognizeOnce({ lang = 'en-GB', timeoutMs = 8000 } = {}) {
  const Recognition = getRecognition();
  let rec = null;
  let done = false;
  let timer = null;
  let stopTimer = null;
  let latestTranscripts = [];

  let resolvePromise;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  const finish = (value, shouldAbort = false) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    clearTimeout(stopTimer);
    if (shouldAbort) {
      try {
        rec?.abort();
      } catch {
        /* bỏ qua */
      }
    }
    resolvePromise(value);
  };

  const stop = () => {
    if (done) return promise;
    // Gọi rec.stop() để engine xả và phát ra transcript cuối cùng (thay vì rec.abort làm mất dữ liệu)
    try {
      if (rec) {
        rec.stop();
      }
    } catch {
      finish(latestTranscripts.length ? { transcripts: latestTranscripts } : null);
    }
    // Bộ đếm an toàn chờ onresult / onend xả xong trong vòng 1.2s
    stopTimer = setTimeout(() => {
      finish(latestTranscripts.length ? { transcripts: latestTranscripts } : null);
    }, 1200);
    return promise;
  };

  const abort = () => {
    finish(null, true);
  };

  const controller = {
    promise,
    stop,
    abort,
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
    catch: (onRejected) => promise.catch(onRejected),
    finally: (onFinally) => promise.finally(onFinally),
  };

  if (!Recognition) {
    resolvePromise(null);
    return controller;
  }

  try {
    rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.maxAlternatives = 5;

    rec.onresult = (e) => {
      if (!e?.results) return;
      let finalAccum = '';
      let interimAccum = '';
      const alts = [];

      for (let i = 0; i < e.results.length; ++i) {
        const res = e.results[i];
        if (res.isFinal) {
          finalAccum += (res[0]?.transcript || '') + ' ';
        } else {
          interimAccum += (res[0]?.transcript || '') + ' ';
        }
      }
      const combined = (finalAccum + interimAccum).trim();
      if (combined) {
        alts.push(combined);
      }

      // Thu thập thêm các giả thuyết thay thế (alternatives)
      for (let i = 0; i < e.results.length; ++i) {
        const res = e.results[i];
        for (let j = 0; j < (res?.length || 0); ++j) {
          const t = res[j]?.transcript?.trim();
          if (t && !alts.includes(t)) {
            alts.push(t);
          }
        }
      }

      if (alts.length) {
        latestTranscripts = alts;
      }
    };

    rec.onerror = () => {
      // Nếu đã thu được một phần transcript trước đó, giữ lại thay vì hủy hoàn toàn
      if (latestTranscripts.length) {
        finish({ transcripts: latestTranscripts });
      } else {
        finish(null);
      }
    };

    rec.onend = () => {
      finish(latestTranscripts.length ? { transcripts: latestTranscripts } : null);
    };

    timer = setTimeout(() => {
      if (latestTranscripts.length) {
        finish({ transcripts: latestTranscripts });
      } else {
        finish(null);
      }
    }, timeoutMs);

    rec.start();
  } catch {
    finish(null);
  }

  return controller;
}
