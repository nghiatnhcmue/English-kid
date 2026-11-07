import { useState } from 'react';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader } from '../components/ui.jsx';
import PronunciationStation from '../components/stations/PronunciationStation.jsx';
import StationRunner from '../components/StationRunner.jsx';
import { playSfx } from '../utils/sfx.js';

export default function PronunciationPage() {
  const units = listUnits();
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const currentUnit = getUnit(selectedUnitId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="🗣️ Phòng Luyện Phát Âm & Ngữ Âm"
        subtitle="12 cặp âm chuẩn SGK Global Success 6 (A Closer Look 1) · Khẩu hình tiếng Việt & Trắc nghiệm phân biệt âm"
        backTo="/"
        backLabel="Trang chủ"
      />

      {/* Thanh chọn 12 Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học phát âm" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn Unit để luyện phát âm (12 bài học):
        </span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {units.map((u) => {
            const isSelected = selectedUnitId === u.unitId;
            return (
              <button
                key={u.unitId}
                type="button"
                onClick={() => {
                  playSfx('click');
                  setSelectedUnitId(u.unitId);
                }}
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
        <StationRunner Station={PronunciationStation} unit={currentUnit} mode="pronunciation" />
      )}
    </div>
  );
}

