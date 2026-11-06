import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../settings.jsx';
import { hasEnglishVoice, speak, isTtsSupported } from '../utils/speech.js';
import { store } from '../utils/storage.js';
import { Button3D, PageHeader } from '../components/ui.jsx';
import { t } from '../i18n/vi.js';
import credits from '../data/credits.json';

export default function SettingsPage() {
  const { settings, update } = useSettings();
  const [voiceOk, setVoiceOk] = useState(null);
  const [testingVoice, setTestingVoice] = useState(false);

  const savedStudent = store().getStudentInfo();
  const [studentName, setStudentName] = useState(savedStudent.name || '');
  const [studentClass, setStudentClass] = useState(savedStudent.class || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isTtsSupported()) return setVoiceOk(false);
    hasEnglishVoice().then(setVoiceOk);
  }, []);

  const handleTestVoice = async () => {
    if (testingVoice) return;
    setTestingVoice(true);
    try {
      const isUS = (settings.lang || '').toLowerCase().includes('us');
      const audioFile = isUS ? '/assets/audio/test-voice-us.mp3' : '/assets/audio/test-voice-uk.mp3';
      await speak('Hello! Welcome to English 6. Have fun learning!', {
        ...settings,
        audio: audioFile,
      });
    } finally {
      setTestingVoice(false);
    }
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    store().saveStudentInfo({ name: studentName, class: studentClass });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

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

      {/* Dành cho Giáo viên */}
      <section className="rounded-3xl bg-gradient-to-r from-peach to-peach-dark p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-black uppercase tracking-wider">
              Dành cho Thầy Cô
            </span>
            <h2 className="text-2xl font-black mt-1">👨‍🏫 Bảng Điểm & Quản Lý Học Sinh</h2>
            <p className="text-sm font-bold opacity-90 mt-0.5">
              Xem điểm số của học sinh qua Cloudflare D1, theo dõi từ hay sai và xuất file Excel.
            </p>
          </div>
          <Link
            to="/teacher"
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-black text-peach-dark shadow-md hover:bg-cream active:scale-95 transition-all text-center"
          >
            Mở Bảng Điểm 🔓
          </Link>
        </div>
      </section>

      {/* Thông tin học sinh */}
      <section className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft">
        <h2 className="text-2xl font-black text-ink mb-1">👤 Thông tin học sinh của máy này</h2>
        <p className="text-sm font-bold text-ink-soft mb-4">
          Tên và lớp sẽ tự động đính kèm khi nộp bài test để gửi điểm cho thầy cô.
        </p>

        <form onSubmit={handleSaveStudent} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-black text-ink mb-1">Họ và tên:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full rounded-2xl bg-cream px-4 py-2.5 text-base font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-ink mb-1">Lớp:</label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Ví dụ: 6A1"
                className="w-full rounded-2xl bg-cream px-4 py-2.5 text-base font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <button
              type="submit"
              className="rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              Lưu thông tin
            </button>
            {savedSuccess && (
              <span className="text-sm font-black text-mint-dark">✓ Đã lưu thành công!</span>
            )}
          </div>
        </form>
      </section>

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
          sound={false}
          disabled={testingVoice}
          onClick={handleTestVoice}
          className={`w-full py-4 text-lg ${testingVoice ? 'animate-pulse' : ''}`}
        >
          {testingVoice ? '🔊 Đang đọc thử...' : `🔊 ${t.settings.testVoice}`}
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
        <details className="mt-4 rounded-2xl bg-cream p-4">
          <summary className="cursor-pointer font-black text-ink">🧊 {t.credits.title} ({credits.length})</summary>
          <p className="mt-2 text-sm font-bold text-ink-soft">{t.credits.intro}</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {credits.map((c) => (
              <li key={c.file}>
                <a href={c.source} target="_blank" rel="noopener noreferrer" className="font-black text-sky-dark underline">
                  {c.title}
                </a>{' '}
                – {c.author} ·{' '}
                <a
                  href={c.license.startsWith('CC0') ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/licenses/by/3.0/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {c.license}
                </a>
              </li>
            ))}
          </ul>
        </details>
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
