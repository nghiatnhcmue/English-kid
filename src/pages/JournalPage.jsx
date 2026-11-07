import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listUnits, getUnit, getWord } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { wordsByStatus, statusOf } from '../utils/mastery.js';
import { formatViDate } from '../utils/dates.js';
import { testsToCsv, downloadText } from '../utils/report.js';
import { sayWord } from '../utils/speech.js';
import { useSettings } from '../settings.jsx';
import { Button3D, PageHeader, ProgressBar, Stars } from '../components/ui.jsx';
import { t } from '../i18n/vi.js';

/** Biểu đồ đường điểm số (thang 10) theo thời gian. */
function ScoreChart({ tests }) {
  const data = [...tests].reverse().slice(-12);
  if (data.length === 0) return null;
  const W = 600;
  const H = 220;
  const pad = { l: 36, r: 16, t: 16, b: 36 };
  const x = (i) =>
    pad.l + (data.length === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (data.length - 1));
  const y = (s) => pad.t + ((10 - s) / 10) * (H - pad.t - pad.b);
  const points = data.map((d, i) => `${x(i)},${y(d.score)}`).join(' ');

  return (
    <figure className="print-card rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft">
      <figcaption className="mb-3 text-lg font-black text-ink">📈 {t.journal.chart}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={t.journal.chart}>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(v)}
              y2={y(v)}
              stroke="#efe3cc"
              strokeWidth="2"
              strokeDasharray={v ? '6 6' : ''}
            />
            <text x={pad.l - 10} y={y(v) + 5} textAnchor="end" fontSize="14" fontWeight="800" fill="#6f6157">
              {v}
            </text>
          </g>
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-peach)"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <g key={d.id}>
            <circle
              cx={x(i)}
              cy={y(d.score)}
              r="8"
              fill="var(--color-banana)"
              stroke="var(--color-peach)"
              strokeWidth="3"
            >
              <title>{`${formatViDate(d.isoDate)}: ${d.score} điểm`}</title>
            </circle>
            <text x={x(i)} y={y(d.score) - 14} textAnchor="middle" fontSize="14" fontWeight="800" fill="#3a2e25">
              {d.score}
            </text>
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#6f6157">
              {formatViDate(d.isoDate).slice(0, 5)}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

function WordChips({ ids, tone }) {
  const { settings } = useSettings();
  if (ids.length === 0) return <p className="font-bold text-ink-soft">{t.journal.none}</p>;

  return (
    <ul className="flex flex-wrap gap-2.5">
      {ids
        .map(getWord)
        .filter(Boolean)
        .map((w) => (
          <li
            key={w.id}
            onClick={() => sayWord(w, settings)}
            title="Bấm để nghe phát âm"
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-black cursor-pointer shadow-xs border border-black/5 hover:scale-105 active:scale-95 transition-all select-none ${tone}`}
          >
            <span className="text-xl" aria-hidden>{w.emoji}</span>
            <span className="text-base">{w.word}</span>
            <span className="text-sm font-bold opacity-80">({w.meaning})</span>
            <span className="text-sm opacity-60">🔊</span>
          </li>
        ))}
    </ul>
  );
}

export default function JournalPage() {
  const tests = store().getTestHistory();
  const mastery = store().getMastery();
  const progress = store().getProgress();
  const review = wordsByStatus(mastery, 'review');
  const mastered = wordsByStatus(mastery, 'mastered');

  const unitRows = useMemo(
    () =>
      listUnits()
        .filter((u) => u.available)
        .map((u) => {
          const vocab = getUnit(u.unitId).vocabularies;
          const modes = progress.units[u.unitId]?.modes ?? {};
          return {
            ...u,
            modeStars: Object.values(modes).reduce((a, b) => a + b, 0),
            masteredCount: vocab.filter((w) => statusOf(mastery[w.id]) === 'mastered').length,
            total: vocab.length,
          };
        }),
    [progress, mastery],
  );

  const exportCsv = () => {
    downloadText(
      `bang-diem-tieng-anh-6_${new Date().toISOString().slice(0, 10)}.csv`,
      testsToCsv(tests, getWord)
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`📒 ${t.journal.title}`} backTo="/" backLabel={t.nav.home} />

      <div className="print-only">
        <h1 className="text-3xl font-black">{t.journal.reportFor}</h1>
        <p className="font-bold text-ink-soft">
          {t.journal.printedAt}: {formatViDate(new Date().toISOString())}
        </p>
      </div>

      {/* Tải báo cáo / In điểm */}
      <section className="no-print rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft">
        <h2 className="mb-3 text-lg font-black text-ink">{t.journal.exportTitle}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button3D tone="white" onClick={exportCsv} disabled={tests.length === 0} className="min-h-14">
            ⬇️ {t.journal.exportCsv}
          </Button3D>
          <Button3D tone="white" onClick={() => window.print()} className="min-h-14">
            🖨️ {t.journal.print}
          </Button3D>
        </div>
      </section>

      {tests.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 sm:p-10 text-center shadow-xs border-2 border-banana-soft">
          <span className="text-6xl" aria-hidden>📝</span>
          <p className="text-xl font-black text-ink">{t.journal.empty}</p>
          <Button3D tone="peach" to="/test" className="px-8 py-4">
            🚀 {t.home.weeklyTest}
          </Button3D>
        </div>
      ) : (
        <ScoreChart tests={tests} />
      )}

      {/* Từ vựng cần ôn lại */}
      <section className="print-card rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-rose-soft">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-2xl font-black text-ink">{t.journal.review} ({review.length})</h2>
          {review.length > 0 && (
            <Link
              to="/review/flashcard"
              className="no-print rounded-2xl bg-sky px-5 py-2.5 text-base font-black text-ink shadow-[0_3px_0_var(--color-sky-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
            >
              🔁 Ôn ngay
            </Link>
          )}
        </div>
        <p className="mb-4 text-sm sm:text-base font-bold text-ink-soft">{t.journal.reviewHint}</p>
        <WordChips ids={review} tone="bg-rose-soft text-peach-dark" />
      </section>

      {/* Từ vựng đã ghi nhớ */}
      <section className="print-card rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-mint-soft">
        <h2 className="mb-2 text-2xl font-black text-ink">{t.journal.mastered} ({mastered.length})</h2>
        <p className="mb-4 text-sm sm:text-base font-bold text-ink-soft">{t.journal.masteredHint}</p>
        <WordChips ids={mastered} tone="bg-mint-soft text-mint-dark" />
      </section>

      {/* Tiến độ theo Unit */}
      <section>
        <h2 className="mb-3 text-2xl font-black text-ink">{t.journal.unitProgress}</h2>
        <ul className="flex flex-col gap-3">
          {unitRows.map((u) => (
            <li key={u.unitId} className="print-card rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft">
              <p className="text-lg font-black text-ink">
                {u.emoji} Unit {u.unitId}: {u.titleEn}
              </p>
              <div className="mt-3 grid gap-3 text-sm font-bold text-ink-soft sm:grid-cols-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>{t.journal.modesDone}:</span>
                    <span className="font-black text-ink">⭐ {u.modeStars}/12</span>
                  </div>
                  <ProgressBar value={u.modeStars} max={12} tone="bg-banana" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>{t.journal.wordsMastered}:</span>
                    <span className="font-black text-ink">{u.masteredCount}/{u.total}</span>
                  </div>
                  <ProgressBar value={u.masteredCount} max={u.total} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Danh sách các bài test đã làm */}
      {tests.length > 0 && (
        <section>
          <h2 className="mb-3 text-2xl font-black text-ink">{t.journal.tests}</h2>
          <ul className="flex flex-col gap-3">
            {tests.map((test) => {
              const wrong = [...new Set((test.answers || []).filter((a) => !a.correct).map((a) => a.wordId))];
              return (
                <li
                  key={test.id}
                  className="print-card flex flex-col gap-1.5 rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-black text-ink">
                      {formatViDate(test.isoDate)} · {t.journal.week} {test.week.split('-W')[1]}
                    </span>
                    <Stars count={test.stars} className="text-2xl" />
                  </div>
                  <p className="text-base font-bold text-ink-soft">
                    Unit {test.unitIds.join(', ')} · {t.test.correctCount(test.correct, test.total)} ·{' '}
                    <strong className="text-xl font-black text-peach">{test.score} điểm</strong>
                  </p>
                  {wrong.length > 0 && (
                    <p className="text-sm font-bold text-peach-dark mt-1">
                      🔴 Cần ôn lại:{' '}
                      <span className="font-normal">
                        {wrong.map((id) => getWord(id)?.word ?? id).join(', ')}
                      </span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
