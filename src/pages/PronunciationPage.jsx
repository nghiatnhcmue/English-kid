import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader, Button3D } from '../components/ui.jsx';
import PronunciationStation from '../components/stations/PronunciationStation.jsx';
import { playSfx } from '../utils/sfx.js';
import { BookOpen } from 'lucide-react';

export default function PronunciationPage() {
  const units = listUnits();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramUnit = parseInt(searchParams.get('unit'), 10);
  
  const initialId = Number.isFinite(paramUnit) && paramUnit >= 1 && paramUnit <= 12 ? paramUnit : 1;
  const [selectedUnitId, setSelectedUnitId] = useState(initialId);
  const currentUnit = getUnit(selectedUnitId);

  useEffect(() => {
    if (Number.isFinite(paramUnit) && paramUnit >= 1 && paramUnit <= 12 && paramUnit !== selectedUnitId) {
      setSelectedUnitId(paramUnit);
    }
  }, [paramUnit, selectedUnitId]);

  const handleSelectUnit = (unitId) => {
    playSfx('click');
    setSelectedUnitId(unitId);
    setSearchParams({ unit: String(unitId) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="🗣️ Phòng Luyện Phát Âm & Ngữ Âm"
          subtitle="12 cặp âm chuẩn SGK Global Success 6 (A Closer Look 1) · Khẩu hình tiếng Việt & Trắc nghiệm phân biệt âm"
          backTo={`/unit/${selectedUnitId}`}
          backLabel={`Về Unit ${selectedUnitId}`}
        />
        <Button3D
          to={`/unit/${selectedUnitId}`}
          tone="banana"
          className="px-4 py-2 text-sm hidden sm:inline-flex"
        >
          <BookOpen className="h-4 w-4" />
          <span>Về bài học Unit {selectedUnitId}</span>
        </Button3D>
      </div>

      {/* Thanh chọn 12 Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học phát âm" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn bài học (12 Unit Global Success):
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
                <span>Unit {u.unitId}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Nội dung Ngữ âm của Unit được chọn */}
      {currentUnit && (
        <PronunciationStation unit={currentUnit} onFinish={() => {}} />
      )}
    </div>
  );
}
