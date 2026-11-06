import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Volume2, ArrowRight, BookOpen } from 'lucide-react';
import { searchCurriculum } from '../utils/search.js';
import { PageHeader, SpeakerButton, SlowSpeakerButton, WordImage, Button3D } from '../components/ui.jsx';
import { playSfx } from '../utils/sfx.js';

const QUICK_TAGS = [
  'com-pa',
  'máy tính',
  'hiện tại đơn',
  'so sánh hơn',
  'must',
  'should',
  'thể thao',
  'quá khứ',
  'vịnh hạ long',
  'robot',
  'tết',
  'năng lượng',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'vocab' | 'grammar' | 'reading' | 'speaking' | 'listening'

  const results = useMemo(() => searchCurriculum(query), [query]);

  const totalCount =
    results.vocab.length +
    results.grammar.length +
    results.reading.length +
    results.speaking.length +
    results.listening.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="🔍 Tìm kiếm nội dung học chi tiết"
        subtitle="Tra cứu nhanh từ vựng, quy tắc ngữ pháp, bài đọc và đoạn hội thoại trên toàn bộ 12 Unit"
        backTo="/"
        backLabel="Trang chủ"
      />

      {/* Ô tìm kiếm to rõ, phản hồi tức thì */}
      <div className="relative w-full">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-ink-soft" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ vựng, ngữ pháp, nghĩa tiếng Việt (vd: calculator, so sánh hơn, com-pa)..."
          className="h-16 w-full rounded-3xl border-3 border-banana-soft bg-white pl-13 pr-12 text-base sm:text-lg font-black text-ink shadow-[0_4px_0_#efe3cc] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-banana placeholder:font-bold placeholder:text-ink-soft/60"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-cream p-1.5 text-ink-soft hover:bg-banana-soft hover:text-ink cursor-pointer"
            title="Xóa tìm kiếm"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Gợi ý tìm nhanh */}
      {!query && (
        <div className="flex flex-col gap-2 rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft">
          <span className="text-xs font-black uppercase tracking-wider text-ink-soft">
            Gợi ý từ khóa tìm kiếm nhanh:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  playSfx('click');
                  setQuery(tag);
                }}
                className="rounded-xl bg-cream px-3 py-1.5 text-sm font-extrabold text-ink hover:bg-banana transition-all cursor-pointer shadow-2xs border border-[#efe3cc]"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bộ lọc phân loại kết quả */}
      {query && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-banana-soft pb-2">
            <span className="text-sm sm:text-base font-black text-ink">
              Tìm thấy <strong className="text-peach-dark">{totalCount}</strong> kết quả cho &quot;{query}&quot;
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs sm:text-sm font-black">
              {[
                { id: 'all', label: `Tất cả (${totalCount})` },
                { id: 'vocab', label: `🔤 Từ vựng (${results.vocab.length})` },
                { id: 'grammar', label: `📐 Ngữ pháp (${results.grammar.length})` },
                { id: 'speaking', label: `🎙️ Nói (${results.speaking.length})` },
                { id: 'reading', label: `📖 Đọc (${results.reading.length})` },
                { id: 'listening', label: `👂 Nghe (${results.listening.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playSfx('click');
                    setActiveTab(tab.id);
                  }}
                  className={`rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-banana text-ink shadow-[0_2px_0_var(--color-banana-dark)]'
                      : 'bg-white text-ink-soft hover:bg-cream border border-[#efe3cc]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {totalCount === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-8 text-center shadow-xs border-2 border-banana-soft">
              <span className="text-4xl" aria-hidden>🔍</span>
              <p className="text-lg font-black text-ink">Không tìm thấy nội dung phù hợp với &quot;{query}&quot;</p>
              <p className="text-sm font-bold text-ink-soft">
                Em thử tìm bằng từ tiếng Anh (như <em>book</em>, <em>lamp</em>) hoặc tên thì (như <em>hiện tại đơn</em>) nhé!
              </p>
            </div>
          )}

          {/* 1. KẾT QUẢ TỪ VỰNG */}
          {(activeTab === 'all' || activeTab === 'vocab') && results.vocab.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-ink flex items-center gap-2">
                <span>🔤 Từ vựng liên quan</span>
                <span className="rounded-full bg-banana-soft px-2.5 py-0.5 text-xs">
                  {results.vocab.length}
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.vocab.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_3px_0_#efe3cc] border border-[#efe3cc]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream">
                        <WordImage word={w} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-lg font-black text-ink">{w.word}</h3>
                          <span className="text-xs font-bold text-sky-dark">{w.phonetic}</span>
                        </div>
                        <p className="text-base font-black text-ink truncate">{w.meaning}</p>
                        <span className="text-xs font-bold text-ink-soft block mt-0.5">
                          {w.unitTitle} · {w.wordType}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <SpeakerButton word={w} size="sm" />
                      <Link
                        to={`/unit/${w.unitId}`}
                        onClick={() => playSfx('click')}
                        className="rounded-xl bg-cream p-2 text-ink-soft hover:bg-banana hover:text-ink transition-all cursor-pointer"
                        title="Vào bài học này"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. KẾT QUẢ NGỮ PHÁP */}
          {(activeTab === 'all' || activeTab === 'grammar') && results.grammar.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-ink flex items-center gap-2">
                <span>📐 Chủ điểm Ngữ pháp</span>
                <span className="rounded-full bg-banana-soft px-2.5 py-0.5 text-xs">
                  {results.grammar.length}
                </span>
              </h2>
              <div className="grid gap-3">
                {results.grammar.map((g) => (
                  <div
                    key={g.unitId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_3px_0_#efe3cc] border-2 border-banana-soft"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="rounded-full bg-banana-soft px-3 py-0.5 text-xs font-black text-ink-soft">
                        {g.emoji} {g.unitTitle}
                      </span>
                      <h3 className="mt-1 text-xl font-black text-ink">{g.title}</h3>
                      <p className="mt-1 text-sm font-bold text-ink-soft">{g.ruleVi}</p>
                      <div className="mt-2 rounded-xl bg-cream p-2.5 font-mono text-sm font-black text-sky-dark border border-banana-soft">
                        {g.formula}
                      </div>
                    </div>
                    <Link
                      to={`/unit/${g.unitId}/grammar`}
                      onClick={() => playSfx('click')}
                      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-banana px-5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-1 transition-all"
                    >
                      <span>Học ngữ pháp này →</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. KẾT QUẢ LUYỆN NÓI */}
          {(activeTab === 'all' || activeTab === 'speaking') && results.speaking.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-ink flex items-center gap-2">
                <span>🎙️ Câu Luyện Nói & Giao tiếp</span>
                <span className="rounded-full bg-peach-soft px-2.5 py-0.5 text-xs">
                  {results.speaking.length}
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.speaking.map((s) => (
                  <div
                    key={s.unitId}
                    className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_3px_0_#ffd2bf] border border-peach/30"
                  >
                    <div>
                      <span className="rounded-full bg-peach-soft px-3 py-0.5 text-xs font-black text-peach-dark">
                        {s.emoji} {s.unitTitle}
                      </span>
                      <p className="mt-2 text-lg font-black text-ink">&quot;{s.sentence}&quot;</p>
                      <p className="text-xs font-bold text-sky-dark">{s.phonetic}</p>
                      <p className="text-sm font-bold text-ink-soft mt-1">({s.meaningVi})</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-peach/20">
                      <SpeakerButton text={s.sentence} size="sm" />
                      <Link
                        to={`/unit/${s.unitId}/shadowing`}
                        onClick={() => playSfx('click')}
                        className="rounded-xl bg-peach px-3 py-1.5 text-xs font-black text-white hover:bg-peach-dark transition-all"
                      >
                        Luyện nói câu này →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. KẾT QUẢ ĐỌC HIỂU */}
          {(activeTab === 'all' || activeTab === 'reading') && results.reading.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-ink flex items-center gap-2">
                <span>📖 Đoạn văn Đọc hiểu</span>
                <span className="rounded-full bg-sky-soft px-2.5 py-0.5 text-xs">
                  {results.reading.length}
                </span>
              </h2>
              <div className="grid gap-3">
                {results.reading.map((r) => (
                  <div
                    key={r.unitId}
                    className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_3px_0_#c4dcf7] border border-sky/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-sky-soft px-3 py-0.5 text-xs font-black text-sky-dark">
                        {r.emoji} {r.unitTitle}
                      </span>
                      <SpeakerButton text={r.passage} size="sm" />
                    </div>
                    <p className="text-base font-bold text-ink bg-cream p-4 rounded-xl border border-banana-soft">
                      &quot;{r.passage}&quot;
                    </p>
                    <div className="flex justify-end">
                      <Link
                        to={`/unit/${r.unitId}/reading`}
                        onClick={() => playSfx('click')}
                        className="rounded-xl bg-sky px-4 py-2 text-xs font-black text-ink hover:bg-sky-dark hover:text-white transition-all"
                      >
                        Làm bài đọc hiểu này →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
