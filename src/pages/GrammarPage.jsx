import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader } from '../components/ui.jsx';
import GrammarStation from '../components/stations/GrammarStation.jsx';
import StationRunner from '../components/StationRunner.jsx';
import { playSfx } from '../utils/sfx.js';

export default function GrammarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get('unit');
  const units = listUnits();

  const initialId = rawParam && (units.some((u) => String(u.unitId) === String(rawParam)) || getUnit(rawParam))
    ? rawParam
    : (units[0]?.unitId || 1);
  const [selectedUnitId, setSelectedUnitId] = useState(initialId);
  const currentUnit = getUnit(selectedUnitId);

  useEffect(() => {
    if (rawParam && rawParam !== selectedUnitId && (units.some((u) => String(u.unitId) === String(rawParam)) || getUnit(rawParam))) {
      setSelectedUnitId(rawParam);
    }
  }, [rawParam, selectedUnitId, units]);

  const handleSelectUnit = (unitId) => {
    playSfx('click');
    setSelectedUnitId(unitId);
    setSearchParams({ unit: String(unitId) });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="📐 Sổ tay Ngữ pháp cốt lõi"
        subtitle={`${units.length} chủ điểm ngữ pháp chuẩn SGK Global Success · Công thức tinh gọn & Mẹo nhớ nhanh`}
        backTo="/"
        backLabel="Trang chủ"
      />

      {/* Thanh chọn Unit dạng cuộn ngang / lưới nút bấm */}
      <nav aria-label="Chọn bài học ngữ pháp" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn bài học ngữ pháp ({units.length} bài học):
        </span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {units.map((u) => {
            const isSelected = selectedUnitId === u.unitId;
            return (
              <button
                key={u.unitId}
                type="button"
                onClick={() => handleSelectUnit(u.unitId)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm sm:text-base font-black transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-banana text-ink shadow-[0_4px_0_var(--color-banana-dark)] scale-105 ring-2 ring-banana-dark/30'
                    : 'bg-white text-ink-soft hover:bg-cream hover:text-ink shadow-xs border border-banana-soft'
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>{u.emoji}</span>
                <span>Unit {u.unit || u.unitId}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Nội dung Ngữ pháp của Unit được chọn */}
      {currentUnit && (
        <section aria-label={`Ngữ pháp Unit ${currentUnit.unit || currentUnit.unitId}`} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border-2 border-banana-soft">
            <div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-black text-ink-soft">
                Unit {currentUnit.unit || currentUnit.unitId}: {currentUnit.titleEn}
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-ink">
                {currentUnit.grammar?.title || 'Chủ điểm ngữ pháp trọng tâm'}
              </h2>
            </div>
            <span className="text-4xl shrink-0" aria-hidden>{currentUnit.emoji}</span>
          </div>

          <StationRunner Station={GrammarStation} unit={currentUnit} mode="grammar" />
        </section>
      )}
    </div>
  );
}

