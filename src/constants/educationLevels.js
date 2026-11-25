export const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const EDUCATION_LEVELS = [
  {
    id: 'primary',
    label: 'Tiểu học',
    sub: 'Lớp 1 – 5',
    fullLabel: '🎒 Cấp Tiểu học (Lớp 1 – 5)',
    icon: '🎒',
    grades: [1, 2, 3, 4, 5],
    gridCols: 'grid-cols-5',
    headerColor: 'text-emerald-800',
    activePillClass: 'bg-emerald-600 text-white shadow-xs scale-105 ring-2 ring-emerald-400',
    idlePillClass: 'bg-cream text-ink hover:bg-emerald-50 hover:text-emerald-800 border border-emerald-100/80 active:scale-95',
  },
  {
    id: 'secondary',
    label: 'THCS',
    sub: 'Lớp 6 – 9',
    fullLabel: '🎓 Cấp THCS (Lớp 6 – 9)',
    icon: '🎓',
    grades: [6, 7, 8, 9],
    gridCols: 'grid-cols-4',
    headerColor: 'text-banana-dark',
    activePillClass: 'bg-banana text-ink shadow-xs border-2 border-banana-dark scale-105 ring-2 ring-banana-dark/30',
    idlePillClass: 'bg-cream text-ink hover:bg-banana/30 border border-banana-soft active:scale-95',
  },
  {
    id: 'high',
    label: 'THPT',
    sub: 'Lớp 10 – 12',
    fullLabel: '🏛️ Cấp THPT (Lớp 10 – 12)',
    icon: '🏛️',
    grades: [10, 11, 12],
    gridCols: 'grid-cols-3',
    headerColor: 'text-rose-800',
    activePillClass: 'bg-rose-600 text-white shadow-xs scale-105 ring-2 ring-rose-400',
    idlePillClass: 'bg-cream text-ink hover:bg-rose-50 hover:text-rose-800 border border-rose-100/80 active:scale-95',
  },
];

export function getEducationLevel(grade) {
  const num = Number(grade) || 6;
  return EDUCATION_LEVELS.find((lvl) => lvl.grades.includes(num)) || EDUCATION_LEVELS[1];
}

export function getLevelIcon(grade) {
  return getEducationLevel(grade).icon;
}
