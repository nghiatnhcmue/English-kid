import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listUnits } from '../utils/data.js';
import { store, totalStarsOf } from '../utils/storage.js';
import { streakOf } from '../utils/dates.js';
import { wordsByStatus } from '../utils/mastery.js';
import { playSfx } from '../utils/sfx.js';
import { Button3D } from '../components/ui.jsx';
import { t } from '../i18n/vi.js';

export default function HomePage() {
  const units = listUnits();
  const progress = store().getProgress();
  const hardCount = wordsByStatus(store().getMastery(), 'review').length;
  const streak = streakOf(progress.studyDays);
  const totalStars = totalStarsOf(progress);

  // Tìm bài học tiếp theo em nên học (bài đầu tiên chưa đạt đủ 12 sao hoặc bài 1)
  const nextUnit = useMemo(() => {
    const available = units.filter((u) => u.available);
    const unfinished = available.find((u) => {
      const stars = Object.values(progress.units[u.unitId]?.modes ?? {}).reduce((a, b) => a + b, 0);
      return stars < 12;
    });
    return unfinished || available[0];
  }, [units, progress]);

  return (
    <div className="flex flex-col gap-6">
      {/* Lời chào & Thống kê nhanh */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink">
            {t.appName} <span aria-hidden>📚</span>
          </h1>
          <p className="text-base sm:text-lg font-bold text-ink-soft">{t.home.hello}</p>
        </div>
        <div className="flex items-center gap-2 font-black md:hidden">
          <span className="flex items-center gap-1 rounded-2xl bg-white px-3.5 py-1.5 shadow-xs border border-banana-soft">
            <span aria-hidden>⭐</span> {totalStars}
          </span>
          <span className="flex items-center gap-1 rounded-2xl bg-white px-3.5 py-1.5 shadow-xs border border-banana-soft">
            <span aria-hidden>🔥</span> {streak}
          </span>
        </div>
      </header>

      {/* Thẻ Hero: HỌC TIẾP NGAY - Cực kỳ rõ ràng, học sinh không cần suy nghĩ */}
      {nextUnit && (
        <section aria-label="Bài học tiếp theo" className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-banana to-banana-soft p-6 sm:p-8 shadow-[0_8px_0_var(--color-banana-dark)] border-2 border-banana-dark/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-5xl shadow-md" aria-hidden>
                {nextUnit.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-white/80 px-3 py-0.5 text-xs font-black uppercase text-ink-soft mb-1">
                  Khuyên học hôm nay
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-ink truncate">
                  Unit {nextUnit.unitId}: {nextUnit.titleEn}
                </h2>
                <p className="text-base font-bold text-ink-soft truncate">{nextUnit.titleVi}</p>
              </div>
            </div>
            <Link
              to={`/unit/${nextUnit.unitId}`}
              onClick={() => playSfx('click')}
              className="inline-flex min-h-16 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-8 text-xl font-black text-white shadow-[0_5px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
            >
              <span>{t.home.startNow}</span>
            </Link>
          </div>
        </section>
      )}

      {/* Chuỗi ngày học liên tiếp */}
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 border border-banana-soft px-4 py-3 text-center text-base sm:text-lg font-black text-ink shadow-xs">
        <span className="text-2xl" aria-hidden>🔥</span>
        <span>{t.home.streak(streak)}</span>
      </div>

      {/* 2 Khối: Test tuần & Ôn từ khó */}
      <section aria-label={t.home.practiceArea}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button3D
            tone="peach"
            to="/test"
            className="min-h-24 flex-col items-start justify-center gap-1! p-5 text-left"
          >
            <span className="flex items-center gap-2 text-xl font-black">
              <span className="text-2xl" aria-hidden>📝</span>
              <span>{t.home.weeklyTest}</span>
            </span>
            <span className="text-sm font-bold opacity-90">{t.home.weeklyTestSub}</span>
          </Button3D>

          {hardCount > 0 ? (
            <Button3D
              tone="sky"
              to="/review/flashcard"
              className="min-h-24 flex-col items-start justify-center gap-1! p-5 text-left"
            >
              <span className="flex items-center gap-2 text-xl font-black">
                <span className="text-2xl" aria-hidden>🔴</span>
                <span>{t.home.hardWords(hardCount)}</span>
              </span>
              <span className="text-sm font-bold opacity-90">{t.home.hardWordsSub}</span>
            </Button3D>
          ) : (
            <div className="flex min-h-24 items-center justify-center rounded-3xl border-3 border-dashed border-banana/50 bg-white/70 px-5 text-center font-bold text-ink-soft">
              <span className="text-base sm:text-lg">🌱 {t.home.noHardWords}</span>
            </div>
          )}
        </div>
      </section>

      {/* 12 Bài học Unit */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-black text-ink">{t.home.units}</h2>
          <p className="text-sm sm:text-base font-bold text-ink-soft">{t.home.unitsSub}</p>
        </div>

        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {units.map((u) => {
            const stars = Object.values(progress.units[u.unitId]?.modes ?? {}).reduce((a, b) => a + b, 0);
            const content = (
              <>
                <span className="text-5xl my-1 select-none transition-transform group-hover:scale-110" aria-hidden>
                  {u.emoji}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black text-ink-soft">
                  Unit {u.unitId}
                </span>
                <span className="text-lg sm:text-xl font-black leading-snug text-ink">{u.titleEn}</span>
                <span className="text-xs sm:text-sm font-bold text-ink-soft line-clamp-1">{u.titleVi}</span>
                {u.available ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs sm:text-sm font-black text-ink shadow-xs">
                    <span>⭐</span>
                    <span>{stars}/12 sao</span>
                  </span>
                ) : (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-ink-soft">
                    <span>🔒</span>
                    <span>{t.common.comingSoon}</span>
                  </span>
                )}
              </>
            );

            const baseStyle =
              'group flex h-full min-h-48 flex-col items-center justify-center gap-1 rounded-3xl p-4 text-center transition-all';

            return (
              <li key={u.unitId}>
                {u.available ? (
                  <Link
                    to={`/unit/${u.unitId}`}
                    onClick={() => playSfx('click')}
                    className={`${baseStyle} shadow-[0_6px_0_rgb(0_0_0/0.07)] hover:-translate-y-1 hover:shadow-[0_10px_0_rgb(0_0_0/0.08)] active:translate-y-1 active:shadow-none cursor-pointer border border-black/5`}
                    style={{ background: u.color }}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    className={`${baseStyle} opacity-60 grayscale-[35%] cursor-not-allowed border border-black/5`}
                    style={{ background: u.color }}
                    aria-disabled
                  >
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
