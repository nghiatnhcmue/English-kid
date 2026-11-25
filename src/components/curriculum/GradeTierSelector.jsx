import { playSfx } from '../../utils/sfx.js';
import { EDUCATION_LEVELS, getEducationLevel } from '../../constants/educationLevels.js';

export default function GradeTierSelector({
  activeGrade = 6,
  onSelectGrade,
  title = 'Chương trình 12 Khối Lớp',
  badgePrefix = 'Đang học',
}) {
  const currentLevel = getEducationLevel(activeGrade);

  const handlePick = (grade) => {
    playSfx('click');
    onSelectGrade?.(grade);
  };

  return (
    <section
      aria-label="Bộ chọn khối lớp"
      className="rounded-3xl bg-white p-3.5 sm:p-5 border-2 border-banana-soft shadow-[0_4px_0_#efe3cc]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-banana-soft/60">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-banana text-xl shadow-2xs"
            aria-hidden
          >
            {currentLevel.icon}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-ink">{title}</span>
              <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white shadow-2xs">
                {badgePrefix}: Lớp {activeGrade} {activeGrade === 6 ? '★ 3D' : ''}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-ink-soft">
              {currentLevel.fullLabel}
              {activeGrade === 6 && ' • Giáo trình tương tác 3D chuẩn Bộ GD&ĐT'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] sm:text-xs font-bold text-ink-soft hidden md:inline">Cấp:</span>
          <div className="flex items-center gap-1 rounded-xl bg-cream p-1 border border-banana-soft">
            {EDUCATION_LEVELS.map((lvl) => {
              const isActive = lvl.grades.includes(activeGrade);
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    if (!isActive) handlePick(lvl.grades[0]);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-peach text-white shadow-2xs'
                      : 'text-ink-soft hover:bg-banana/30 hover:text-ink'
                  }`}
                >
                  <span>{lvl.icon}</span> <span className="hidden sm:inline">{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {EDUCATION_LEVELS.map((lvl) => {
          const isLevelActive = lvl.grades.includes(activeGrade);
          return (
            <div
              key={lvl.id}
              className={`rounded-2xl p-2.5 transition-all ${
                isLevelActive
                  ? 'bg-peach-soft/20 border-2 border-peach/50 shadow-xs'
                  : 'bg-cream/40 border border-banana-soft/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-xs font-black text-ink flex items-center gap-1">
                  <span>{lvl.icon}</span> {lvl.label}
                </span>
                <span className="text-[10px] font-bold text-ink-soft">{lvl.sub}</span>
              </div>
              <div className={`grid ${lvl.gridCols} gap-1.5`}>
                {lvl.grades.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handlePick(g)}
                    className={`relative flex flex-col items-center justify-center rounded-xl py-1 text-xs font-black transition-all cursor-pointer ${
                      activeGrade === g
                        ? 'bg-peach text-white shadow-[0_2px_0_var(--color-peach-dark)] scale-105 z-10'
                        : 'bg-white text-ink-soft hover:bg-banana/30 hover:text-ink border border-banana-soft/70'
                    }`}
                  >
                    <span>Lớp {g}</span>
                    {g === 6 && (
                      <span
                        className={`text-[9px] font-black -mt-0.5 ${
                          activeGrade === g ? 'text-banana' : 'text-amber-500'
                        }`}
                      >
                        ★ 3D
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
