import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader, Button3D } from '../components/ui.jsx';
import WritingStation from '../components/stations/WritingStation.jsx';
import StationRunner from '../components/StationRunner.jsx';
import { playSfx } from '../utils/sfx.js';
import { PenTool } from 'lucide-react';

export default function WritingPage() {
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
        title="✍️ Phòng Luyện Viết & Sắp xếp câu"
        subtitle={`${units.length} bài tập sắp xếp khối từ xáo trộn thành câu hoàn chỉnh · Củng cố cấu trúc ngữ pháp chuẩn SGK`}
        backTo={`/unit/${selectedUnitId}`}
        backLabel={`Về Unit ${currentUnit?.unit || selectedUnitId}`}
      />

      {/* Hướng dẫn phương pháp Luyện Viết cho học sinh mất gốc */}
      <section className="flex items-center gap-3.5 rounded-3xl bg-gradient-to-r from-mint-soft via-cream to-banana-soft p-4 sm:p-5 border-2 border-mint/30 shadow-xs">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs" aria-hidden>
          ✍️
        </span>
        <div className="flex-1 text-sm sm:text-base font-bold text-ink">
          <p className="font-black text-mint-dark">Cách làm bài sắp xếp câu:</p>
          <p className="text-ink-soft mt-0.5">
            Bấm vào từng khối từ để đưa lên dòng kẻ theo đúng thứ tự câu tiếng Anh (Chủ ngữ $\rightarrow$ Động từ $\rightarrow$ Vị ngữ). Nếu chọn nhầm, bấm lại vào từ đó để gỡ xuống nhé!
          </p>
        </div>
      </section>

      {/* Thanh chọn Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học luyện viết" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn bài học luyện viết câu ({units.length} bài học):
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
                    ? 'bg-mint text-white shadow-[0_4px_0_var(--color-mint-dark)] scale-105 ring-2 ring-mint-dark/30'
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

      {/* Nội dung Luyện Viết của Unit được chọn */}
      {currentUnit && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border-2 border-banana-soft">
            <div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-black text-ink-soft">
                Unit {currentUnit.unit || currentUnit.unitId}: {currentUnit.titleEn}
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-ink">
                {currentUnit.titleVi}
              </h2>
            </div>
            <Button3D
              tone="sky"
              to={`/unit/${currentUnit.unitId}/reading`}
              className="px-4 py-2 text-sm sm:text-base"
            >
              <span>📖 Đọc đoạn văn Unit này →</span>
            </Button3D>
          </div>

          <StationRunner Station={WritingStation} unit={currentUnit} mode="writing" />
        </div>
      )}
    </div>
  );
}

