// Âm thanh hiệu ứng tổng hợp bằng WebAudio: không cần file, không lo bản quyền, chạy offline.
let ctx;
let enabled = true;

export function setSfxEnabled(on) {
  enabled = on;
}

function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, duration, { type = 'sine', gain = 0.18 } = {}) {
  const c = audioCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

const SOUNDS = {
  click: () => tone(660, 0, 0.08, { type: 'triangle', gain: 0.12 }),
  correct: () => {
    tone(784, 0, 0.15);
    tone(1175, 0.1, 0.25);
  },
  // Tiếng "cộc" nhẹ, không gây sợ
  wrong: () => tone(220, 0, 0.18, { type: 'triangle', gain: 0.12 }),
  victory: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, { gain: 0.15 })),
};

export function playSfx(name) {
  if (!enabled) return;
  try {
    SOUNDS[name]?.();
  } catch {
    /* bỏ qua lỗi âm thanh */
  }
}
