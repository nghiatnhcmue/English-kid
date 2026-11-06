import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listUnits, getUnit } from '../utils/data.js';
import { PageHeader, Button3D } from '../components/ui.jsx';
import ListeningStation from '../components/stations/ListeningStation.jsx';
import { playSfx } from '../utils/sfx.js';
import { Headphones, Sparkles, Volume2, BookOpen } from 'lucide-react';

export default function ListeningPage() {
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
          title="👂 Phòng Luyện Nghe Hội Thoại SGK"
          subtitle="12 bài hội thoại học đường SGK Global Success 6 (Skills 2) · Có hỗ trợ nghe chậm 0.65x cho người mới học"
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

      {/* Hướng dẫn phương pháp nghe cho học sinh */}
      <section className="flex items-center gap-3.5 rounded-3xl bg-gradient-to-r from-sky-soft via-cream to-banana-soft p-4 sm:p-5 border-2 border-sky/30 shadow-xs">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs" aria-hidden>
          💡
        </span>
        <div className="flex-1 text-sm sm:text-base font-bold text-ink">
          <p className="font-black text-sky-dark">Mẹo luyện nghe tiếng Anh hiệu quả:</p>
          <p className="text-ink-soft mt-0.5">
            Lần 1: Bấm nút loa lớn để nghe tự nhiên toàn đoạn. Lần 2: Bấm nút <strong>&quot;🐢 Nghe chậm (0.65x)&quot;</strong> để nghe rõ từng âm đuôi (ending sounds) và chọn đáp án trắc nghiệm nhé!
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

      {/* Trạm Luyện Nghe của Unit được chọn */}
      {currentUnit && (
        <div className="flex flex-col gap-5">
          <ListeningStation unit={currentUnit} onFinish={() => {}} />
        </div>
      )}
    </div>
  );
}

