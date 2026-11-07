import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader, Button3D } from '../components/ui.jsx';
import SpeakingStation from '../components/stations/SpeakingStation.jsx';
import StationRunner from '../components/StationRunner.jsx';
import { playSfx } from '../utils/sfx.js';
import { BookOpen } from 'lucide-react';

export default function SpeakingPage() {
  const units = listUnits();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramUnit = parseInt(searchParams.get('unit'), 10);

  const initialId = Number.isFinite(paramUnit) && paramUnit >= 1 && units.some((u) => u.unitId === paramUnit) ? paramUnit : 1;
  const [selectedUnitId, setSelectedUnitId] = useState(initialId);
  const currentUnit = getUnit(selectedUnitId);

  useEffect(() => {
    if (Number.isFinite(paramUnit) && paramUnit >= 1 && units.some((u) => u.unitId === paramUnit) && paramUnit !== selectedUnitId) {
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
          title="🎙️ Phòng Luyện Nói & Chấm Điểm AI"
          subtitle="Luyện nhại giọng (Shadowing) · Mẫu câu giao tiếp SGK & Từ vựng · Thu âm và so sánh giọng bản xứ"
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

      {/* Hướng dẫn phương pháp Luyện Nói cho học sinh */}
      <section className="flex items-center gap-3.5 rounded-3xl bg-gradient-to-r from-peach-soft via-cream to-banana-soft p-4 sm:p-5 border-2 border-peach/30 shadow-xs">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs" aria-hidden>
          🎙️
        </span>
        <div className="flex-1 text-sm sm:text-base font-bold text-ink">
          <p className="font-black text-peach-dark">Phương pháp Nhại giọng (Shadowing) hiệu quả:</p>
          <p className="text-ink-soft mt-0.5">
            1. Bấm loa nghe bản xứ đọc mẫu ➔ 2. Bấm Micro đọc to, tự tin theo phiên âm ➔ 3. Xem AI phân tích từng từ và bấm <strong>&quot;▶️ Nghe lại giọng của em&quot;</strong> để so sánh!
          </p>
        </div>
      </section>

      {/* Thanh chọn 12 Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học luyện nói" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn bài học để luyện nói (12 Unit Global Success):
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

      {/* Trạm Luyện Nói của Unit được chọn */}
      {currentUnit && (
        <StationRunner Station={SpeakingStation} unit={currentUnit} mode="speaking" />
      )}
    </div>
  );
}


