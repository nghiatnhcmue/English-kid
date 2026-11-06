import { useState } from 'react';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader, Button3D } from '../components/ui.jsx';
import ShadowingStation from '../components/stations/ShadowingStation.jsx';
import { playSfx } from '../utils/sfx.js';
import { Headphones, Sparkles, Volume2 } from 'lucide-react';

export default function ListeningPage() {
  const units = listUnits();
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const currentUnit = getUnit(selectedUnitId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="👂 Phòng Luyện Nghe & Nói chuẩn bản ngữ"
        subtitle="12 bài hội thoại học đường SGK Global Success 6 · Có hỗ trợ nghe chậm 0.65x cho người mất gốc"
        backTo="/"
        backLabel="Trang chủ"
      />

      {/* Hướng dẫn phương pháp nghe cho học sinh mất gốc */}
      <section className="flex items-center gap-3.5 rounded-3xl bg-gradient-to-r from-sky-soft via-cream to-banana-soft p-4 sm:p-5 border-2 border-sky/30 shadow-xs">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs" aria-hidden>
          💡
        </span>
        <div className="flex-1 text-sm sm:text-base font-bold text-ink">
          <p className="font-black text-sky-dark">Mẹo luyện nghe cho người mất gốc:</p>
          <p className="text-ink-soft mt-0.5">
            Lần 1: Bấm nút loa lớn để nghe tự nhiên. Lần 2: Bấm nút <strong>&quot;Nghe chậm 🐢&quot;</strong> để nghe rõ từng âm đuôi (ending sounds) và nhấn trọng âm nhé!
          </p>
        </div>
      </section>

      {/* Thanh chọn 12 Unit dạng cuộn ngang */}
      <nav aria-label="Chọn bài học luyện nghe" className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
          Chọn Unit để luyện nghe (12 bài học):
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

      {/* 2 Lựa chọn Luyện Nghe theo bài */}
      {currentUnit && (
        <div className="flex flex-col gap-5">
          {/* Header Unit hiện tại + nút tắt vào làm Nghe chọn hình */}
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
              tone="banana"
              to={`/unit/${currentUnit.unitId}/listening`}
              className="px-4 py-2 text-sm sm:text-base"
            >
              <span>👂 Nghe chọn hình (Trắc nghiệm) →</span>
            </Button3D>
          </div>

          {/* Trạm Luyện Nghe & Nói (ShadowingStation) */}
          <ShadowingStation unit={currentUnit} onFinish={() => {}} />
        </div>
      )}
    </div>
  );
}

