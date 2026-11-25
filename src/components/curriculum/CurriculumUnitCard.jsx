import { Link } from 'react-router-dom';
import { playSfx } from '../../utils/sfx.js';

export default function CurriculumUnitCard({
  unitData: u,
  gradeData,
  activeGrade,
  activeSpeakingWord = null,
  onSpeakWord,
  onOpenPdf,
}) {
  const targetPhonicsVal = u.targetPhonics || u.phonics;
  const bookToOpen = u.bookId || gradeData?.bookIds?.[0] || `sgk-${activeGrade}`;
  const targetUnitId = u.unitId || `g${activeGrade}_u${u.unit}`;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-3xl bg-white p-5 sm:p-6 border-2 border-banana-soft shadow-[0_4px_0_#efe3cc] hover:border-banana hover:shadow-[0_6px_0_#d8b13c] transition-all">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-xl bg-banana px-3 py-1 text-xs font-black text-ink shadow-2xs">
            Unit {u.unit}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-black text-ink-soft border border-banana-soft">
              Học kỳ {u.semester === 1 ? '1' : '2'}
            </span>
            {u.theme && (
              <span className="rounded-full bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 text-[11px] font-black">
                {u.theme}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-ink mt-2.5 leading-snug">{u.title}</h3>
        <p className="text-sm font-bold text-ink-soft mt-0.5">{u.titleVi}</p>

        <div className="mt-3.5 flex flex-col gap-2 rounded-2xl bg-cream/50 p-3 border border-banana-soft/60">
          {u.grammar && (
            <div className="flex items-start gap-2 text-xs">
              <span className="font-black text-ink shrink-0 bg-white px-2 py-0.5 rounded-lg border border-banana-soft">
                📐 Ngữ pháp:
              </span>
              <span className="font-extrabold text-ink-soft pt-0.5 leading-relaxed">{u.grammar}</span>
            </div>
          )}
          {targetPhonicsVal && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-ink shrink-0 bg-white px-2 py-0.5 rounded-lg border border-banana-soft">
                🎙️ Ngữ âm:
              </span>
              <span className="font-mono font-bold text-peach-dark bg-white px-2 py-0.5 rounded-lg border border-banana-soft">
                {targetPhonicsVal}
              </span>
            </div>
          )}
        </div>

        {u.keyVocab && u.keyVocab.length > 0 && (
          <div className="mt-3.5">
            <div className="text-xs font-black text-ink mb-1.5 flex items-center gap-1">
              <span>Từ vựng trọng tâm ({u.keyVocab.length} từ):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {u.keyVocab.map((word, idx) => {
                const isSpeaking = activeSpeakingWord === word;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSpeakWord?.(word);
                      playSfx('click');
                    }}
                    title={`Bấm để nghe phát âm Anh - Anh: "${word}"`}
                    className={`group inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-extrabold border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-peach text-white border-peach-dark scale-105 animate-pulse'
                        : 'bg-white text-ink border-banana-soft hover:bg-banana hover:border-banana-dark'
                    }`}
                  >
                    <span>{word}</span>
                    <span
                      className={`text-[11px] ${
                        isSpeaking ? 'text-white' : 'text-peach-dark group-hover:text-ink'
                      } transition-colors`}
                      aria-hidden
                    >
                      🔊
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 pt-3.5 border-t border-banana-soft/60 mt-3">
        <Link
          to={`/unit/${targetUnitId}`}
          onClick={() => playSfx('click')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-peach px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer"
        >
          <span className="text-base" aria-hidden>
            🚀
          </span>
          <span>Vào bài học (Đầy đủ 7 Trạm)</span>
        </Link>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <Link
            to={`/speaking?unit=${targetUnitId}`}
            onClick={() => playSfx('click')}
            className="flex items-center justify-center gap-1 rounded-xl bg-banana/80 border border-banana-dark/30 py-2 px-1 text-[11px] sm:text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:bg-banana hover:-translate-y-0.5 transition-all text-center"
            title="Luyện nói AI & Phân vai"
          >
            <span>🎙️</span>
            <span className="truncate">Nói AI</span>
          </Link>
          <Link
            to={`/grammar?unit=${targetUnitId}`}
            onClick={() => playSfx('click')}
            className="flex items-center justify-center gap-1 rounded-xl bg-sky-50 text-sky-900 border border-sky-300 py-2 px-1 text-[11px] sm:text-xs font-black shadow-[0_2px_0_#93c5fd] hover:bg-sky-100 hover:-translate-y-0.5 transition-all text-center"
            title="Ngữ pháp & Trắc nghiệm"
          >
            <span>📐</span>
            <span className="truncate">Ngữ pháp</span>
          </Link>
          <Link
            to={`/reading?unit=${targetUnitId}`}
            onClick={() => playSfx('click')}
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 py-2 px-1 text-[11px] sm:text-xs font-black shadow-[0_2px_0_#86efac] hover:bg-emerald-100 hover:-translate-y-0.5 transition-all text-center"
            title="Đọc hiểu & Dịch bài"
          >
            <span>📖</span>
            <span className="truncate">Đọc hiểu</span>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-ink-soft truncate max-w-[50%]">
            {gradeData?.title?.split('–')[0] || `Lớp ${activeGrade}`}
          </span>
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              onOpenPdf?.(bookToOpen);
            }}
            className="inline-flex items-center gap-1 text-xs font-black text-peach-dark hover:underline cursor-pointer shrink-0"
          >
            <span>📖 Mở SGK điện tử →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
