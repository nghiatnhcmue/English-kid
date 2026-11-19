import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader } from '../components/ui.jsx';
import PronunciationStation from '../components/stations/PronunciationStation.jsx';
import StationRunner from '../components/StationRunner.jsx';
import { playSfx } from '../utils/sfx.js';

export default function PronunciationPage() {
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
        title="🗣️ Phòng Luyện Phát Âm & Ngữ Âm"
        subtitle={`${units.length} cặp âm chuẩn SGK Global Success (A Closer Look 1) · Khẩu hình tiếng Việt & Trắc nghiệm phân biệt âm`}
        backTo={`/unit/${selectedUnitId}`}
        backLabel={`Về Unit ${currentUnit?.unit || selectedUnitId}`}
      />

      {/* Thanh chọn Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học phát âm" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn bài học để luyện phát âm ({units.length} bài học):
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
                    ? 'bg-peach text-white shadow-[0_4px_0_var(--color-peach-dark)] scale-105 ring-2 ring-peach-dark/30'
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

      {/* Nội dung Ngữ âm của Unit được chọn */}
      {currentUnit && (
        <StationRunner Station={PronunciationStation} unit={currentUnit} mode="pronunciation" />
      )}
    </div>
  );
}

