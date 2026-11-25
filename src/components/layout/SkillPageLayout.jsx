import { BookOpen } from 'lucide-react';
import { PageHeader, Button3D } from '../ui.jsx';
import StationRunner from '../StationRunner.jsx';
import { useSelectedUnit } from '../../hooks/useSelectedUnit.js';

const PILL_TONES = {
  banana: 'bg-banana text-ink shadow-[0_4px_0_var(--color-banana-dark)] scale-105 ring-2 ring-banana-dark/30',
  peach: 'bg-peach text-white shadow-[0_4px_0_var(--color-peach-dark)] scale-105 ring-2 ring-peach-dark/30',
  sky: 'bg-sky text-ink shadow-[0_4px_0_var(--color-sky-dark)] scale-105 ring-2 ring-sky-dark/30',
  mint: 'bg-mint text-white shadow-[0_4px_0_var(--color-mint-dark)] scale-105 ring-2 ring-mint-dark/30',
};

const TIP_THEMES = {
  sky: {
    box: 'from-sky-soft via-cream to-mint-soft border-sky/30',
    iconBg: 'bg-white text-ink',
    title: 'text-sky-dark',
  },
  mint: {
    box: 'from-mint-soft via-cream to-banana-soft border-mint/30',
    iconBg: 'bg-white text-ink',
    title: 'text-mint-dark',
  },
  peach: {
    box: 'from-peach-soft via-cream to-banana-soft border-peach/30',
    iconBg: 'bg-peach text-white',
    title: 'text-peach-dark',
  },
};

/**
 * Khung giao diện chuẩn hóa cho cả 6 trang kỹ năng chuyên sâu:
 * Ngữ pháp, Đọc hiểu, Viết câu, Luyện nghe, Luyện nói AI, Phát âm.
 */
export default function SkillPageLayout({
  title,
  subtitle,
  backToHome = false,
  showBackToUnitAction = false,
  tip,
  navAriaLabel = 'Chọn bài học',
  navLabel,
  pillTone = 'peach',
  unitCardSubtitle,
  unitCardAction,
  Station,
  mode,
}) {
  const { units, selectedUnitId, currentUnit, selectUnit } = useSelectedUnit();
  const unitNum = currentUnit?.unit || selectedUnitId;
  const resolvedSubtitle = typeof subtitle === 'function' ? subtitle(units.length) : subtitle;
  const resolvedNavLabel =
    typeof navLabel === 'function'
      ? navLabel(units.length)
      : navLabel || `Chọn bài học (${units.length} bài học):`;

  const backTo = backToHome ? '/' : `/unit/${selectedUnitId}`;
  const backLabel = backToHome ? 'Trang chủ' : `Về Unit ${unitNum}`;
  const activePillCls = PILL_TONES[pillTone] || PILL_TONES.peach;
  const tipTheme = TIP_THEMES[tip?.tone || 'sky'] || TIP_THEMES.sky;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title={title}
          subtitle={resolvedSubtitle}
          backTo={backTo}
          backLabel={backLabel}
        />
        {showBackToUnitAction && (
          <Button3D
            to={`/unit/${selectedUnitId}`}
            tone="banana"
            className="px-4 py-2 text-sm hidden sm:inline-flex"
          >
            <BookOpen className="h-4 w-4" />
            <span>Về bài học Unit {unitNum}</span>
          </Button3D>
        )}
      </div>

      {tip && (
        <section
          className={`flex items-center gap-3.5 rounded-3xl bg-gradient-to-r p-4 sm:p-5 border-2 shadow-xs ${tipTheme.box}`}
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-xs ${tipTheme.iconBg}`}
            aria-hidden
          >
            {tip.icon || '💡'}
          </span>
          <div className="flex-1 text-sm sm:text-base font-bold text-ink">
            <p className={`font-black ${tipTheme.title}`}>{tip.title}</p>
            <p className="text-ink-soft mt-0.5">{tip.body}</p>
          </div>
        </section>
      )}

      <nav aria-label={navAriaLabel} className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          {resolvedNavLabel}
        </span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {units.map((u) => {
            const isSelected = String(selectedUnitId) === String(u.unitId);
            return (
              <button
                key={u.unitId}
                type="button"
                onClick={() => selectUnit(u.unitId)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm sm:text-base font-black transition-all cursor-pointer select-none ${
                  isSelected
                    ? activePillCls
                    : 'bg-white text-ink-soft hover:bg-cream hover:text-ink shadow-xs border border-banana-soft'
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {u.emoji}
                </span>
                <span>Unit {u.unit || u.unitId}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {currentUnit && (
        <div className="flex flex-col gap-5">
          {(unitCardSubtitle || unitCardAction) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border-2 border-banana-soft">
              <div>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-black text-ink-soft">
                  Unit {currentUnit.unit || currentUnit.unitId}: {currentUnit.titleEn}
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-black text-ink">
                  {typeof unitCardSubtitle === 'function'
                    ? unitCardSubtitle(currentUnit)
                    : currentUnit.titleVi}
                </h2>
              </div>
              {typeof unitCardAction === 'function' ? unitCardAction(currentUnit) : unitCardAction}
            </div>
          )}

          <StationRunner Station={Station} unit={currentUnit} mode={mode} />
        </div>
      )}
    </div>
  );
}
