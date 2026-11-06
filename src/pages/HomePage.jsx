import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listUnits } from '../utils/data.js';
import { store, totalStarsOf } from '../utils/storage.js';
import { streakOf } from '../utils/dates.js';
import { wordsByStatus } from '../utils/mastery.js';
import { playSfx } from '../utils/sfx.js';
import { Button3D } from '../components/ui.jsx';
import { t } from '../i18n/vi.js';

import StudentProfileModal from '../components/StudentProfileModal.jsx';

export default function HomePage() {
  const units = listUnits();
  const progress = store().getProgress();
  const hardCount = wordsByStatus(store().getMastery(), 'review').length;
  const streak = streakOf(progress.studyDays);
  const totalStars = totalStarsOf(progress);
  const [student, setStudent] = useState(() => store().getStudentInfo());
  const [showProfile, setShowProfile] = useState(false);

  // Tìm bài học tiếp theo em nên học (bài đầu tiên chưa đạt đủ 12 sao hoặc bài 1)
  const nextUnit = useMemo(() => {
    const available = units.filter((u) => u.available);
    const unfinished = available.find((u) => {
      const stars = Object.values(progress.units[u.unitId]?.modes ?? {}).reduce((a, b) => a + b, 0);
      return stars < 12;
    });
    return unfinished || available[0];
  }, [units, progress]);

  // Kiểm tra bài tập được Giáo viên giao
  const activeAssignments = useMemo(() => {
    return store().getAssignments().filter((a) => a.status !== 'closed');
  }, []);

  const assignedItem = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash || '';
    const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.replace('?', '');
    const params = new URLSearchParams(queryPart);
    const assignCode = params.get('assign');
    if (assignCode) {
      return store().getAssignmentById(assignCode) || activeAssignments[0] || null;
    }
    return activeAssignments[0] || null;
  }, [activeAssignments]);

  const assignmentTargetLink = useMemo(() => {
    if (!assignedItem) return '/';
    if (assignedItem.scopeType === 'skill') {
      if (assignedItem.selectedSkill === 'speaking') return `/speaking?unit=${assignedItem.unitId}`;
      if (assignedItem.selectedSkill === 'listening') return `/listening?unit=${assignedItem.unitId}`;
      if (assignedItem.selectedSkill === 'pronunciation') return `/pronunciation?unit=${assignedItem.unitId}`;
      if (assignedItem.selectedSkill === 'grammar') return `/grammar?unit=${assignedItem.unitId}`;
      if (assignedItem.selectedSkill === 'reading') return `/reading?unit=${assignedItem.unitId}`;
      if (assignedItem.selectedSkill === 'writing') return `/writing?unit=${assignedItem.unitId}`;
      return `/unit/${assignedItem.unitId}`;
    }
    if (assignedItem.scopeType === 'custom_words') {
      return `/practice/${assignedItem.unitId}`;
    }
    return `/unit/${assignedItem.unitId}`;
  }, [assignedItem]);

  return (
    <div className="flex flex-col gap-6">
      {/* Lời chào & Thống kê nhanh */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink">
            {t.appName} <span aria-hidden>📚</span>
          </h1>
          <p className="text-base sm:text-lg font-bold text-ink-soft">
            {student.name ? (
              <>
                Chào em, <strong className="text-peach-dark">{student.name}</strong> {student.class ? `(Lớp ${student.class})` : ''}! Hôm nay mình cùng học tiếng Anh nhé!
              </>
            ) : (
              'Chào em! Hôm nay mình cùng học tiếng Anh nhé!'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 font-black md:hidden">
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 shadow-xs border border-banana-soft text-xs font-black text-ink cursor-pointer"
          >
            <span>{student.avatar || '👤'}</span>
            <span className="max-w-24 truncate">{student.name || 'Đặt tên'}</span>
          </button>
          <span className="flex items-center gap-1 rounded-2xl bg-white px-3 py-1.5 shadow-xs border border-banana-soft text-xs">
            <span aria-hidden>⭐</span> {totalStars}
          </span>
          <span className="flex items-center gap-1 rounded-2xl bg-white px-3 py-1.5 shadow-xs border border-banana-soft text-xs">
            <span aria-hidden>🔥</span> {streak}
          </span>
        </div>
      </header>

      {showProfile && (
        <StudentProfileModal
          onClose={() => setShowProfile(false)}
          onSave={(info) => setStudent(info)}
        />
      )}

      {/* Khối Tìm kiếm nhanh toàn diện 12 Unit */}
      <div className="relative w-full">
        <Link
          to="/search"
          onClick={() => playSfx('click')}
          className="group flex h-14 sm:h-16 w-full items-center justify-between rounded-3xl border-3 border-banana-soft bg-white px-5 sm:px-6 shadow-[0_4px_0_#efe3cc] hover:border-banana hover:shadow-[0_6px_0_#d8b13c] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 text-ink-soft group-hover:text-ink">
            <span className="text-xl sm:text-2xl" aria-hidden>🔍</span>
            <span className="text-sm sm:text-base font-black">
              Tìm kiếm từ vựng, ngữ pháp, bài đọc, câu nói... (12 Unit)
            </span>
          </div>
          <span className="hidden sm:inline-flex rounded-xl bg-banana px-3 py-1.5 text-xs font-black text-ink shadow-2xs group-hover:scale-105 transition-transform">
            Tra cứu ngay ↵
          </span>
        </Link>
      </div>

      {/* Banner Bài tập Giáo viên giao */}
      {assignedItem && (
        <section
          aria-label="Bài tập được giao"
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-peach-soft to-peach/20 p-6 sm:p-7 shadow-md border-3 border-peach"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-peach text-white text-3xl shadow-xs">
                🎯
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
                    Bài tập Tuần {assignedItem.week}
                  </span>
                  {assignedItem.deadline && (
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-peach-dark border border-peach/30">
                      ⏰ Hạn nộp: {assignedItem.deadline}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-ink mt-1">
                  {assignedItem.title}
                </h3>
                {assignedItem.note && (
                  <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5 italic">
                    💬 Lời dặn của Thầy Cô: "{assignedItem.note}"
                  </p>
                )}
              </div>
            </div>

            <Link
              to={assignmentTargetLink}
              onClick={() => playSfx('click')}
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-base font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer whitespace-nowrap text-center"
            >
              <span>Làm bài ngay 🚀</span>
            </Link>
          </div>
        </section>
      )}

      {/* Thẻ Hero: HỌC TIẾP NGAY - Cực kỳ rõ ràng, học sinh không cần suy nghĩ */}
      {nextUnit && (
        <section aria-label="Bài học tiếp theo" className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-banana to-banana-soft p-6 sm:p-8 shadow-[0_8px_0_var(--color-banana-dark)] border-2 border-banana-dark/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-5xl shadow-md" aria-hidden>
                {nextUnit.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-white/80 px-3 py-0.5 text-xs font-black uppercase text-ink-soft mb-1">
                  Khuyên học hôm nay
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-ink truncate">
                  Unit {nextUnit.unitId}: {nextUnit.titleEn}
                </h2>
                <p className="text-base font-bold text-ink-soft truncate">{nextUnit.titleVi}</p>
              </div>
            </div>
            <Link
              to={`/unit/${nextUnit.unitId}`}
              onClick={() => playSfx('click')}
              className="inline-flex min-h-16 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-8 text-xl font-black text-white shadow-[0_5px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
            >
              <span>{t.home.startNow}</span>
            </Link>
          </div>
        </section>
      )}

      {/* Khối Banner: Sổ tay Ngữ pháp cốt lõi 12 Unit */}
      <section aria-label="Sổ tay Ngữ pháp" className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-banana-soft via-cream to-mint-soft p-6 sm:p-7 shadow-[0_6px_0_#efe3cc] border-2 border-banana-dark/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm" aria-hidden>
              📐
            </span>
            <div>
              <span className="rounded-full bg-banana px-3 py-1 text-xs font-black text-ink shadow-xs">
                Chuyên biệt cho người mất gốc
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Sổ tay Ngữ pháp 12 Unit
              </h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">
                Công thức cốt lõi đóng khung, mẹo nhận biết nhanh và 36 câu trắc nghiệm có lời giải chi tiết
              </p>
            </div>
          </div>
          <Link
            to="/grammar"
            onClick={() => playSfx('click')}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-banana px-6 text-lg font-black text-ink shadow-[0_4px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
          >
            <span>Học Ngữ pháp →</span>
          </Link>
        </div>
      </section>

      {/* Khối Banner: Phòng Luyện Nghe & Nói chuẩn bản ngữ */}
      <section aria-label="Phòng Luyện Nghe" className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-peach-soft via-cream to-sky-soft p-6 sm:p-7 shadow-[0_6px_0_#ffd2bf] border-2 border-peach/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm" aria-hidden>
              👂
            </span>
            <div>
              <span className="rounded-full bg-peach text-white px-3 py-1 text-xs font-black shadow-xs">
                Âm thanh bản xứ chuẩn US/UK
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Phòng Luyện Nghe & Nói 12 Unit
              </h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">
                Nghe đối thoại học đường, trắc nghiệm nghe hiểu, chế độ nghe chậm 0.65x và luyện nói nhại giọng (Shadowing)
              </p>
            </div>
          </div>
          <Link
            to="/listening"
            onClick={() => playSfx('click')}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-lg font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
          >
            <span>Vào Luyện Nghe →</span>
          </Link>
        </div>
      </section>

      {/* Khối Banner: Phòng Luyện Nói & Chấm điểm phát âm AI */}
      <section aria-label="Phòng Luyện Nói" className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-mint-soft via-cream to-peach-soft p-6 sm:p-7 shadow-[0_6px_0_#bfe6d6] border-2 border-mint-dark/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm" aria-hidden>
              🎙️
            </span>
            <div>
              <span className="rounded-full bg-mint text-white px-3 py-1 text-xs font-black shadow-xs">
                Chấm điểm phát âm AI
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Phòng Luyện Nói & Shadowing
              </h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">
                Luyện nhại giọng câu giao tiếp SGK, bấm micro thu âm, nhận diện giọng nói và nghe lại chính mình
              </p>
            </div>
          </div>
          <Link
            to="/speaking"
            onClick={() => playSfx('click')}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-mint px-6 text-lg font-black text-white shadow-[0_4px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
          >
            <span>Vào Luyện Nói →</span>
          </Link>
        </div>
      </section>

      {/* Khối Banner: Phòng Luyện Phát Âm & Ngữ Âm 12 Unit */}
      <section aria-label="Phòng Luyện Phát Âm" className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-peach-soft via-cream to-banana-soft p-6 sm:p-7 shadow-[0_6px_0_#ffd2bf] border-2 border-peach/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm" aria-hidden>
              🗣️
            </span>
            <div>
              <span className="rounded-full bg-peach text-white px-3 py-1 text-xs font-black shadow-xs">
                A Closer Look 1 · 12 Cặp Âm Chuẩn SGK
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Phòng Luyện Phát Âm 12 Unit
              </h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">
                Khẩu hình tiếng Việt, từ ví dụ có highlight, trắc nghiệm phân biệt âm và vè luyện cơ miệng
              </p>
            </div>
          </div>
          <Link
            to="/pronunciation"
            onClick={() => playSfx('click')}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-lg font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
          >
            <span>Luyện Phát Âm →</span>
          </Link>
        </div>
      </section>

      {/* Khối Banner: Phòng Luyện Đọc hiểu trực quan */}
      <section aria-label="Phòng Luyện Đọc hiểu" className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-sky-soft via-cream to-mint-soft p-6 sm:p-7 shadow-[0_6px_0_#c4dcf7] border-2 border-sky/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm" aria-hidden>
              📖
            </span>
            <div>
              <span className="rounded-full bg-sky text-ink px-3 py-1 text-xs font-black shadow-xs">
                Đoạn văn A1 chuẩn SGK Global Success
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Phòng Luyện Đọc hiểu 12 Unit
              </h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">
                Đoạn văn ngắn có loa đọc toàn văn, câu hỏi trắc nghiệm kiểm tra nắm ý và bài tập sắp xếp câu
              </p>
            </div>
          </div>
          <Link
            to="/reading"
            onClick={() => playSfx('click')}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-sky px-6 text-lg font-black text-ink shadow-[0_4px_0_var(--color-sky-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
          >
            <span>Vào Luyện Đọc →</span>
          </Link>
        </div>
      </section>

      {/* Khối Banner: Phòng Luyện Viết & Sắp xếp câu */}
      <section aria-label="Phòng Luyện Viết" className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-mint-soft via-cream to-banana-soft p-6 sm:p-7 shadow-[0_6px_0_#bfe6d6] border-2 border-mint-dark/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm" aria-hidden>
              ✍️
            </span>
            <div>
              <span className="rounded-full bg-mint text-white px-3 py-1 text-xs font-black shadow-xs">
                Guided Writing · Xếp khối từ
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Phòng Luyện Viết 12 Unit
              </h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">
                Sắp xếp các khối từ xáo trộn thành câu hoàn chỉnh đúng ngữ pháp, có dịch nghĩa và chấm điểm tức thì
              </p>
            </div>
          </div>
          <Link
            to="/writing"
            onClick={() => playSfx('click')}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-mint px-6 text-lg font-black text-white shadow-[0_4px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
          >
            <span>Vào Luyện Viết →</span>
          </Link>
        </div>
      </section>

      {/* Chuỗi ngày học liên tiếp */}
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 border border-banana-soft px-4 py-3 text-center text-base sm:text-lg font-black text-ink shadow-xs">
        <span className="text-2xl" aria-hidden>🔥</span>
        <span>{t.home.streak(streak)}</span>
      </div>

      {/* 2 Khối: Test tuần & Ôn từ khó */}
      <section aria-label={t.home.practiceArea}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button3D
            tone="peach"
            to="/test"
            className="min-h-24 flex-col items-start justify-center gap-1! p-5 text-left"
          >
            <span className="flex items-center gap-2 text-xl font-black">
              <span className="text-2xl" aria-hidden>📝</span>
              <span>{t.home.weeklyTest}</span>
            </span>
            <span className="text-sm font-bold opacity-90">{t.home.weeklyTestSub}</span>
          </Button3D>

          {hardCount > 0 ? (
            <Button3D
              tone="sky"
              to="/review/flashcard"
              className="min-h-24 flex-col items-start justify-center gap-1! p-5 text-left"
            >
              <span className="flex items-center gap-2 text-xl font-black">
                <span className="text-2xl" aria-hidden>🔴</span>
                <span>{t.home.hardWords(hardCount)}</span>
              </span>
              <span className="text-sm font-bold opacity-90">{t.home.hardWordsSub}</span>
            </Button3D>
          ) : (
            <div className="flex min-h-24 items-center justify-center rounded-3xl border-3 border-dashed border-banana/50 bg-white/70 px-5 text-center font-bold text-ink-soft">
              <span className="text-base sm:text-lg">🌱 {t.home.noHardWords}</span>
            </div>
          )}
        </div>
      </section>

      {/* 12 Bài học Unit */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-black text-ink">{t.home.units}</h2>
          <p className="text-sm sm:text-base font-bold text-ink-soft">{t.home.unitsSub}</p>
        </div>

        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {units.map((u) => {
            const stars = Object.values(progress.units[u.unitId]?.modes ?? {}).reduce((a, b) => a + b, 0);
            const content = (
              <>
                <span className="text-5xl my-1 select-none transition-transform group-hover:scale-110" aria-hidden>
                  {u.emoji}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black text-ink-soft">
                  Unit {u.unitId}
                </span>
                <span className="text-lg sm:text-xl font-black leading-snug text-ink">{u.titleEn}</span>
                <span className="text-xs sm:text-sm font-bold text-ink-soft line-clamp-1">{u.titleVi}</span>
                {u.available ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs sm:text-sm font-black text-ink shadow-xs">
                    <span>⭐</span>
                    <span>{stars}/12 sao</span>
                  </span>
                ) : (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-ink-soft">
                    <span>🔒</span>
                    <span>{t.common.comingSoon}</span>
                  </span>
                )}
              </>
            );

            const baseStyle =
              'group flex h-full min-h-48 flex-col items-center justify-center gap-1 rounded-3xl p-4 text-center transition-all';

            return (
              <li key={u.unitId}>
                {u.available ? (
                  <Link
                    to={`/unit/${u.unitId}`}
                    onClick={() => playSfx('click')}
                    className={`${baseStyle} shadow-[0_6px_0_rgb(0_0_0/0.07)] hover:-translate-y-1 hover:shadow-[0_10px_0_rgb(0_0_0/0.08)] active:translate-y-1 active:shadow-none cursor-pointer border border-black/5`}
                    style={{ background: u.color }}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    className={`${baseStyle} opacity-60 grayscale-[35%] cursor-not-allowed border border-black/5`}
                    style={{ background: u.color }}
                    aria-disabled
                  >
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
