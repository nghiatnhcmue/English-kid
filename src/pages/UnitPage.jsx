import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUnit } from '../utils/data.js';
import { store } from '../utils/storage.js';
import UnitSwitcher from '../components/UnitSwitcher.jsx';
import { statusOf } from '../utils/mastery.js';
import { playSfx } from '../utils/sfx.js';
import { PageHeader, Stars, Button3D } from '../components/ui.jsx';
import VocabCard from '../components/VocabCard.jsx';
import WordInspectorModal from '../components/WordInspectorModal.jsx';
import LessonVideo from '../components/LessonVideo.jsx';
import { t } from '../i18n/vi.js';

export const MODES = ['flashcard', 'listening', 'matching', 'spelling'];

const MODE_CONFIG = {
  flashcard: { tone: 'banana', step: 1, tag: 'Nên học trước' },
  listening: { tone: 'peach', step: 2 },
  matching: { tone: 'sky', step: 3 },
  spelling: { tone: 'mint', step: 4 },
};

export default function UnitPage() {
  const { unitId } = useParams();
  const unit = getUnit(unitId);
  const [query, setQuery] = useState('');
  const [inspectWord, setInspectWord] = useState(null);

  const unitProgress = store().getProgress().units[unit?.unitId];
  const modeStars = unitProgress?.modes ?? {};
  const mastery = store().getMastery();

  const filteredWords = useMemo(() => {
    if (!unit?.vocabularies) return [];
    const q = query.trim().toLowerCase();
    if (!q) return unit.vocabularies;
    return unit.vocabularies.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.phonetic?.toLowerCase().includes(q)
    );
  }, [unit, query]);

  if (!unit) {
    return (
      <div className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-2xl font-black">{t.unit.notFound}</p>
        <Button3D to="/">{t.common.backToHome}</Button3D>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${unit.emoji} Unit ${unit.unitId}: ${unit.titleEn}`}
        subtitle={unit.titleVi}
        backTo="/"
        backLabel={t.nav.home}
      />
      <UnitSwitcher className="flex w-full xl:hidden" />

      {/* 4 Bước học tập theo trình tự tối giản, dễ hiểu */}
      <section aria-label={t.unit.practice}>
        <div className="mb-3">
          <h2 className="text-2xl font-black text-ink">{t.unit.practice}</h2>
          <p className="text-sm sm:text-base font-bold text-ink-soft">{t.unit.practiceSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {MODES.map((m) => {
            const conf = MODE_CONFIG[m];
            const stars = modeStars[m] ?? 0;
            return (
              <Button3D
                key={m}
                tone={conf.tone}
                to={`/unit/${unit.unitId}/${m}`}
                className="min-h-36 flex-col items-start justify-center gap-1.5! p-5 text-left"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-ink">
                    Bước {conf.step} {conf.tag ? `· ${conf.tag}` : ''}
                  </span>
                  <Stars count={stars} className="text-lg" />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-4xl shrink-0" aria-hidden>
                    {t.modes[m].icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-black leading-tight">{t.modes[m].name}</h3>
                    <p className="text-sm font-bold opacity-85 leading-snug mt-0.5">{t.modes[m].desc}</p>
                  </div>
                </div>
              </Button3D>
            );
          })}
        </div>
      </section>

      {/* Lộ trình 5 trạm học tập toàn diện 4 kỹ năng & Ngữ pháp */}
      <section aria-label="Lộ trình 5 trạm học tập toàn diện" className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🚉</span>
            <h2 className="text-2xl font-black text-ink">Lộ trình học toàn diện 4 Kỹ năng</h2>
          </div>
          <p className="text-sm sm:text-base font-bold text-ink-soft">
            Chu trình 5 trạm tiếp thu tự nhiên: Từ vựng & 3D ➔ Ngữ pháp ➔ Nghe & Nói ➔ Đọc ➔ Viết
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Trạm 2: Ngữ pháp cốt lõi */}
          <Button3D
            tone="banana"
            to={`/unit/${unit.unitId}/grammar`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-ink">
              Trạm 2 · Ngữ pháp cốt lõi
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>📐</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-ink">
                  {unit.grammar?.title || 'Quy tắc ngữ pháp trọng tâm'}
                </h3>
                <p className="text-xs sm:text-sm font-bold opacity-85 mt-0.5">
                  Công thức cốt lõi, mẹo nhận biết & bài tập củng cố
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 3: Nghe & Nói */}
          <Button3D
            tone="peach"
            to={`/unit/${unit.unitId}/shadowing`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-white">
              Trạm 3 · Nghe & Nói (Shadowing)
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>🎙️</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-white">
                  Luyện Nghe & Nhại giọng nói
                </h3>
                <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                  Nghe đối thoại học đường & thu âm so sánh giọng mình
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 4: Đọc hiểu trực quan */}
          <Button3D
            tone="sky"
            to={`/unit/${unit.unitId}/reading`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-ink">
              Trạm 4 · Đọc hiểu trực quan
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>📖</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-ink">
                  Đọc hiểu đoạn văn A1
                </h3>
                <p className="text-xs sm:text-sm font-bold opacity-85 mt-0.5">
                  Đoạn văn ngắn 3-4 câu kèm loa đọc và câu hỏi trắc nghiệm
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 5: Viết câu có gợi ý */}
          <Button3D
            tone="mint"
            to={`/unit/${unit.unitId}/writing`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-white">
              Trạm 5 · Viết câu có gợi ý
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>✍️</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-white">
                  Sắp xếp khối từ thành câu
                </h3>
                <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                  Chạm xếp các khối từ thành câu đúng ngữ pháp
                </p>
              </div>
            </div>
          </Button3D>
        </div>
      </section>

      {/* Khối Video Hoạt hình & Bài giảng sinh động */}
      {unit.video && (
        <LessonVideo video={unit.video} unitTitle={unit.titleEn} />
      )}

      {/* Danh sách từ vựng trong bài + Ô tìm kiếm từ */}
      <section aria-label={t.unit.vocabList} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-ink">
              📖 {t.unit.vocabList} ({unit.vocabularies.length} {t.common.words})
            </h2>
          </div>

          {/* Ô tìm kiếm từ vựng đơn giản */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Tìm từ vựng trong bài..."
              className="w-full rounded-2xl bg-white px-4 py-2.5 text-base font-bold text-ink shadow-[0_3px_0_#efe3cc] border border-[#efe3cc] placeholder:text-ink-soft/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-ink-soft hover:text-ink cursor-pointer"
                title={t.unit.clearSearch}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredWords.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-lg font-bold text-ink-soft">
            {t.unit.noWordsFound}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredWords.map((w) => (
              <li key={w.id}>
                <VocabCard
                  word={w}
                  status={statusOf(mastery[w.id])}
                  onInspect={setInspectWord}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Hộp xem chi tiết mô hình 3D tương tác của từ vựng */}
      {inspectWord && (
        <WordInspectorModal
          word={inspectWord}
          onClose={() => setInspectWord(null)}
        />
      )}
    </div>
  );
}
