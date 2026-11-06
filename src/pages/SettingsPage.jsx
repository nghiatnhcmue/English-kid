import { useEffect, useState } from 'react';
import { useSettings } from '../settings.jsx';
import { hasEnglishVoice, speak, isTtsSupported } from '../utils/speech.js';
import { store } from '../utils/storage.js';
import { Button3D, PageHeader } from '../components/ui.jsx';
import { t } from '../i18n/vi.js';

export default function SettingsPage() {
  const { settings, update } = useSettings();
  const [voiceOk, setVoiceOk] = useState(null);

  useEffect(() => {
    if (!isTtsSupported()) return setVoiceOk(false);
    hasEnglishVoice().then(setVoiceOk);
  }, []);

  const reset = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      store().clearAll();
      update({});
      window.location.hash = '#/';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`⚙️ ${t.settings.title}`} backTo="/" backLabel={t.nav.home} />

      {/* Cài đặt giọng đọc tiếng Anh */}
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft">
        <h2 className="text-2xl font-black text-ink">🗣️ {t.settings.voice}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['en-GB', t.settings.gb],
            ['en-US', t.settings.us],
          ].map(([lang, label]) => (
            <button
              key={lang}
              type="button"
              onClick={() => update({ lang })}
              aria-pressed={settings.lang === lang}
              className={`min-h-16 rounded-2xl px-4 text-base font-black transition-all cursor-pointer ${
                settings.lang === lang
                  ? 'bg-banana text-ink shadow-[0_4px_0_var(--color-banana-dark)] border-2 border-banana-dark/30'
                  : 'bg-cream text-ink-soft hover:bg-banana-soft/50 border-2 border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tốc độ đọc */}
        <div className="flex flex-col gap-2 font-black text-ink mt-2">
          <div className="flex items-center justify-between text-base">
            <span>{t.settings.rate}:</span>
            <span className="rounded-full bg-banana-soft px-3 py-0.5 text-sm font-black text-ink">
              {settings.rate < 0.75 ? '🐢 Chậm' : settings.rate > 0.95 ? '⚡ Nhanh' : 'Chuẩn'} ({settings.rate.toFixed(2)}×)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-ink-soft">{t.settings.slow}</span>
            <input
              type="range"
              min="0.5"
              max="1.1"
              step="0.05"
              value={settings.rate}
              onChange={(e) => update({ rate: Number(e.target.value) })}
              className="h-10 flex-1 accent-peach cursor-pointer"
            />
            <span className="text-sm font-bold text-ink-soft">{t.settings.fast}</span>
          </div>
        </div>

        <Button3D
          tone="peach"
          onClick={() => speak('Hello! Welcome to English 6. Have fun learning!', settings)}
          className="w-full py-4 text-lg"
        >
          🔊 {t.settings.testVoice}
        </Button3D>

        {voiceOk === false && (
          <p className="rounded-2xl bg-peach-soft p-4 font-bold text-peach-dark">
            ⚠️ {t.settings.noVoice}
          </p>
        )}
        {voiceOk === true && (
          <p className="font-black text-mint-dark text-base">
            ✓ {t.settings.voiceOk}
          </p>
        )}
      </section>

      {/* Cài đặt âm thanh hiệu ứng */}
      <section className="flex items-center justify-between gap-3 rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft">
        <div>
          <h2 className="text-2xl font-black text-ink">🔔 {t.settings.sound}</h2>
          <p className="text-sm font-bold text-ink-soft mt-0.5">Tiếng chuông khi làm đúng hoặc sai</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={settings.sound}
          aria-label={t.settings.sound}
          onClick={() => update({ sound: !settings.sound })}
          className={`relative h-12 w-22 shrink-0 rounded-full cursor-pointer transition-colors ${
            settings.sound ? 'bg-mint' : 'bg-ink-soft/25'
          }`}
        >
          <span
            className={`absolute top-1 h-10 w-10 rounded-full bg-white shadow-md transition-all ${
              settings.sound ? 'left-11' : 'left-1'
            }`}
          />
        </button>
      </section>

      {/* Giới thiệu ứng dụng */}
      <section className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft">
        <h2 className="mb-2 text-2xl font-black text-ink">ℹ️ {t.settings.about}</h2>
        <p className="text-base font-bold text-ink-soft leading-relaxed">{t.settings.aboutText}</p>
      </section>

      {/* Xóa dữ liệu học tập */}
      <div className="pt-2">
        <Button3D tone="white" onClick={reset} className="w-full text-peach-dark py-4 text-base">
          🗑️ {t.settings.reset}
        </Button3D>
      </div>
    </div>
  );
}
