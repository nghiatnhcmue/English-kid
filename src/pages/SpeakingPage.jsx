import { useState } from 'react';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader, Button3D } from '../components/ui.jsx';
import ShadowingStation from '../components/stations/ShadowingStation.jsx';
import { playSfx } from '../utils/sfx.js';
import { Mic, Sparkles } from 'lucide-react';

export default function SpeakingPage() {
  const units = listUnits();
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const currentUnit = getUnit(selectedUnitId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="🎙️ Phòng Luyện Nói & Chấm điểm AI"
        subtitle="12 bài luyện phát âm & nhại giọng chuẩn bản xứ (Shadowing) · Thu âm so sánh với giọng mẫu"
        backTo="/"
        backLabel="Trang chủ"
      />

      {/* Hướng dẫn phương pháp Luyện Nói cho học sinh mất gốc */}
      <section className="flex items-center gap-3.5 rounded-3xl bg-gradient-to-r from-peach-soft via-cream to-banana-soft p-4 sm:p-5 border-2 border-peach/30 shadow-xs">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs" aria-hidden>
          🎙️
        </span>
        <div className="flex-1 text-sm sm:text-base font-bold text-ink">
          <p className="font-black text-peach-dark">Phương pháp Nhại giọng (Shadowing) hiệu quả:</p>
          <p className="text-ink-soft mt-0.5">
            1. Bấm loa nghe người bản xứ đọc mẫu $\rightarrow$ 2. Bấm Micro đọc to, tự tin theo phiên âm $\rightarrow$ 3. Xem AI chấm điểm và bấm <strong>&quot;Nghe lại giọng của em&quot;</strong> để so sánh!
          </p>
        </div>
      </section>

      {/* Thanh chọn 12 Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học luyện nói" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn Unit để luyện nói (12 bài học):
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

      {/* Nội dung Luyện Nói của Unit được chọn */}
      {currentUnit && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border-2 border-banana-soft">
            <div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-black text-ink-soft">
                Unit {currentUnit.unitId}: {currentUnit.titleEn}
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-ink">
                Luyện câu: &quot;{currentUnit.speaking?.targetSentence}&quot;
              </h2>
            </div>
            <Button3D
              tone="mint"
              to={`/unit/${currentUnit.unitId}/stage`}
              className="px-4 py-2 text-sm sm:text-base"
            >
              <span>🎭 Nói cùng Sân khấu 3D →</span>
            </Button3D>
          </div>

          <ShadowingStation unit={currentUnit} initialTab="speaking" onFinish={() => {}} />
        </div>
      )}
    </div>
  );
}
