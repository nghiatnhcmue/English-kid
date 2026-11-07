import { useState } from 'react';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader, Button3D } from '../components/ui.jsx';
import ReadingStation from '../components/stations/ReadingStation.jsx';
import StationRunner from '../components/StationRunner.jsx';
import { playSfx } from '../utils/sfx.js';
import { BookOpen, Sparkles } from 'lucide-react';

export default function ReadingPage() {
  const units = listUnits();
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const currentUnit = getUnit(selectedUnitId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="📖 Phòng Luyện Đọc hiểu trực quan"
        subtitle="12 đoạn văn ngắn A1 chuẩn SGK Global Success 6 · Có loa đọc toàn văn & câu hỏi trắc nghiệm kiểm tra nắm ý"
        backTo="/"
        backLabel="Trang chủ"
      />

      {/* Hướng dẫn phương pháp Đọc hiểu cho học sinh mất gốc */}
      <section className="flex items-center gap-3.5 rounded-3xl bg-gradient-to-r from-sky-soft via-cream to-mint-soft p-4 sm:p-5 border-2 border-sky/30 shadow-xs">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs" aria-hidden>
          💡
        </span>
        <div className="flex-1 text-sm sm:text-base font-bold text-ink">
          <p className="font-black text-sky-dark">Phương pháp Đọc hiểu cho học sinh mất gốc:</p>
          <p className="text-ink-soft mt-0.5">
            1. Bấm nút <strong>Loa phát âm 🔊</strong> để nghe máy đọc mẫu toàn bộ đoạn văn $\rightarrow$ 2. Đọc thầm lại từng câu $\rightarrow$ 3. Đọc câu hỏi và chọn đáp án chính xác bên dưới!
          </p>
        </div>
      </section>

      {/* Thanh chọn 12 Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học đọc hiểu" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn Unit để đọc đoạn văn (12 bài học):
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
                    ? 'bg-sky text-ink shadow-[0_4px_0_var(--color-sky-dark)] scale-105 ring-2 ring-sky-dark/30'
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

      {/* Nội dung Đọc hiểu của Unit được chọn */}
      {currentUnit && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border-2 border-banana-soft">
            <div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-black text-ink-soft">
                Unit {currentUnit.unitId}: {currentUnit.titleEn}
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-ink">
                {currentUnit.titleVi}
              </h2>
            </div>
            <Button3D
              tone="mint"
              to={`/unit/${currentUnit.unitId}/writing`}
              className="px-4 py-2 text-sm sm:text-base"
            >
              <span>✍️ Luyện Viết câu Unit này →</span>
            </Button3D>
          </div>

          <StationRunner Station={ReadingStation} unit={currentUnit} mode="reading" />
        </div>
      )}
    </div>
  );
}

