import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUnit } from '../utils/data.js';
import { store } from '../utils/storage.js';
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

      {/* Huy hiệu đối chiếu Sách giáo khoa chuẩn Bộ GD&ĐT */}
      <aside aria-label="Sách giáo khoa tương ứng" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-xs border-2 border-banana-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-banana text-ink shadow-2xs text-lg font-black" aria-hidden>
            📄
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-black text-ink-soft">
                SGK Tiếng Anh 6 Global Success · {unit.bookVolume === 2 ? 'Tập 2' : 'Tập 1'}
              </span>
              <strong className="text-sm sm:text-base font-black text-peach-dark">
                {unit.bookPages || 'Trang 6 – 15'}
              </strong>
            </div>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">
              Khớp chuẩn 100% các phần: Getting Started · A Closer Look 1 & 2 · Skills 1 & 2 · Looking Back
            </p>
          </div>
        </div>
        <a
          href={unit.bookVolume === 2 ? "https://hoclieu.vn" : "https://hanhtrangso.nxbgd.vn"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-cream px-3.5 text-xs font-black text-ink-soft hover:bg-banana hover:text-ink transition-all cursor-pointer border border-[#efe3cc]"
        >
          <span>Mở SGK điện tử ↗</span>
        </a>
      </aside>

      {/* KHỐI 1: BÀI TẬP TỔNG HỢP TOÀN DIỆN UNIT (4 Kỹ Năng + Từ Vựng + Ngữ Pháp) */}
      <section aria-label="Bài tập tổng hợp toàn diện" className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-banana via-cream to-peach-soft p-6 sm:p-7 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm" aria-hidden>
              🏆
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-peach text-white px-3 py-0.5 text-xs font-black uppercase shadow-2xs">
                  Bài tập tổng hợp toàn Unit
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-ink shadow-2xs">
                  Đủ 4 Kỹ Năng + Từ Vựng + Ngữ Pháp
                </span>
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Thử Thách Toàn Diện Unit {unit.unitId}
              </h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">
                Bài tập kiểm tra tích hợp gom đủ: Từ vựng, Cặp âm phát âm, Ngữ pháp, Nghe hiểu, Đọc hiểu và Viết câu!
              </p>
            </div>
          </div>
          <Button3D
            tone="peach"
            to={`/unit/${unit.unitId}/mastery`}
            className="min-h-14 px-8 text-lg font-black shrink-0"
          >
            <span>Làm Bài Tập Tổng Hợp →</span>
          </Button3D>
        </div>
      </section>

      {/* KHỐI 2: LỘ TRÌNH 7 TRẠM HỌC TẬP TOÀN DIỆN CỦA UNIT */}
      <section aria-label="Lộ trình học tập toàn diện" className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🗺️</span>
            <h2 className="text-2xl font-black text-ink">Lộ Trình Học Tập Toàn Diện (4 Kỹ Năng + Từ Vựng + Ngữ Pháp)</h2>
          </div>
          <p className="text-sm sm:text-base font-bold text-ink-soft">
            Chu trình 7 trạm chuẩn SGK: Từ vựng & 3D ➔ Phát âm ➔ Ngữ pháp ➔ Nghe ➔ Nói ➔ Đọc ➔ Viết
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Trạm 1: Từ vựng & Mô hình 3D */}
          <Button3D
            tone="banana"
            to={`/unit/${unit.unitId}/flashcard`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-ink">
              Trạm 1 · Từ vựng & 3D
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>🔤</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-ink">
                  {unit.vocabularies.length} Từ vựng & Thẻ 3D
                </h3>
                <p className="text-xs sm:text-sm font-bold opacity-85 mt-0.5">
                  Xoay 360°, đổi màu và 4 bước ôn tập
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 2: Phát âm & Ngữ âm (A Closer Look 1) */}
          <Button3D
            tone="peach"
            to={`/unit/${unit.unitId}/pronunciation`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-white">
              Trạm 2 · Phát âm & Ngữ âm
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>🗣️</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-white">
                  Cặp âm {unit.pronunciation?.pair || 'chuẩn SGK'}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                  Khẩu hình tiếng Việt & game phân biệt âm
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 3: Ngữ pháp cốt lõi (A Closer Look 2) */}
          <Button3D
            tone="banana"
            to={`/unit/${unit.unitId}/grammar`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-ink">
              Trạm 3 · Ngữ pháp cốt lõi
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>📐</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-ink">
                  {unit.grammar?.title || 'Quy tắc ngữ pháp'}
                </h3>
                <p className="text-xs sm:text-sm font-bold opacity-85 mt-0.5">
                  Công thức đóng khung & bài tập trắc nghiệm
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 4: Kỹ năng Nghe (Skills 2) */}
          <Button3D
            tone="sky"
            to={`/unit/${unit.unitId}/listenstation`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-ink">
              Trạm 4 · Kỹ năng Nghe
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>👂</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-ink">
                  Hội thoại học đường SGK
                </h3>
                <p className="text-xs sm:text-sm font-bold opacity-85 mt-0.5">
                  Nghe bản xứ chuẩn, nghe chậm & trắc nghiệm
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 5: Kỹ năng Nói & Shadowing (Skills 1) */}
          <Button3D
            tone="peach"
            to={`/unit/${unit.unitId}/speaking`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-white">
              Trạm 5 · Kỹ năng Nói
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>🎙️</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-white">
                  Luyện Nói & Chấm Điểm AI
                </h3>
                <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                  4 cấp độ câu, thu âm & nghe lại giọng mình
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 6: Kỹ năng Đọc hiểu (Skills 1) */}
          <Button3D
            tone="sky"
            to={`/unit/${unit.unitId}/reading`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-ink">
              Trạm 6 · Kỹ năng Đọc hiểu
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>📖</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-ink">
                  Đoạn văn đọc hiểu A1
                </h3>
                <p className="text-xs sm:text-sm font-bold opacity-85 mt-0.5">
                  Loa đọc toàn bài & câu hỏi trắc nghiệm
                </p>
              </div>
            </div>
          </Button3D>

          {/* Trạm 7: Kỹ năng Viết (Skills 2) */}
          <Button3D
            tone="mint"
            to={`/unit/${unit.unitId}/writing`}
            className="min-h-32 flex-col items-start justify-center gap-1.5! p-5 text-left sm:col-span-2 lg:col-span-3"
          >
            <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black uppercase text-white">
              Trạm 7 · Kỹ năng Viết
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl shrink-0" aria-hidden>✍️</span>
              <div>
                <h3 className="text-lg font-black leading-tight text-white">
                  Luyện Viết Câu (Guided Writing)
                </h3>
                <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                  Sắp xếp các khối từ xáo trộn thành câu hoàn chỉnh đúng ngữ pháp
                </p>
              </div>
            </div>
          </Button3D>
        </div>
      </section>

      {/* 4 Bước luyện tập từ vựng chuyên sâu */}
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
