import { useState, useEffect, useRef } from 'react';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import { EDUCATION_LEVELS, getLevelIcon } from '../../constants/educationLevels.js';

export default function GradeSwitcher({ compact = false }) {
  const { settings, update } = useSettings();
  const currentGrade = settings?.selectedGrade || 6;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectGrade = (newGrade) => {
    update({ selectedGrade: newGrade });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grade-changed', { detail: { grade: newGrade } }));
    }
    playSfx('click');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => {
          playSfx('click');
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Đổi khối lớp học tập (Lớp 1 – 12)"
        className={`group inline-flex items-center gap-1.5 rounded-2xl bg-cream border-2 transition-all cursor-pointer select-none ${
          isOpen
            ? 'border-banana-dark shadow-sm bg-white'
            : 'border-banana-dark/40 shadow-xs hover:border-banana-dark hover:bg-white'
        } ${compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs lg:text-sm font-black text-ink'}`}
      >
        <span className="text-sm lg:text-base leading-none" aria-hidden>
          {getLevelIcon(currentGrade)}
        </span>
        <span className="font-black text-ink whitespace-nowrap">
          Lớp {currentGrade} {currentGrade === 6 ? '★' : ''}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-ink-soft transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Chọn khối lớp học"
          className="absolute left-0 mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-3xl bg-white p-3.5 shadow-2xl border-2 border-banana-soft animate-pop divide-y divide-banana-soft/60"
        >
          <div className="pb-2.5 px-1 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              Khối lớp học tập
            </span>
            <span className="text-[10px] font-black text-sky-dark bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Global Success
            </span>
          </div>

          {EDUCATION_LEVELS.map((lvl, idx) => (
            <div key={lvl.id} className={idx === EDUCATION_LEVELS.length - 1 ? 'pt-2.5' : 'py-2.5'}>
              <div className={`flex items-center justify-between text-[11px] font-black ${lvl.headerColor} mb-1.5 px-1`}>
                <span className="flex items-center gap-1">
                  <span>{lvl.icon}</span>
                  <span>
                    {lvl.label} ({lvl.sub})
                  </span>
                </span>
              </div>
              <div className={`grid ${lvl.gridCols} gap-1.5`}>
                {lvl.grades.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => selectGrade(g)}
                    className={`flex flex-col items-center justify-center rounded-xl py-1.5 text-xs font-black transition-all cursor-pointer ${
                      currentGrade === g ? lvl.activePillClass : lvl.idlePillClass
                    }`}
                  >
                    <span>
                      Lớp {g} {g === 6 ? '★' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
