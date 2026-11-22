import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listUnits } from '../utils/data.js';
import { store, totalStarsOf } from '../utils/storage.js';
import { streakOf } from '../utils/dates.js';
import { wordsByStatus } from '../utils/mastery.js';
import { playSfx } from '../utils/sfx.js';
import { Button3D } from '../components/ui.jsx';
import { t } from '../i18n/vi.js';
import { useSettings } from '../settings.jsx';
import { sayWord, speak } from '../utils/speech.js';
import PdfReaderModal from '../components/PdfReaderModal.jsx';
import multiGradeCurriculum from '../data/multiGradeCurriculum.json';

import StudentProfileModal from '../components/StudentProfileModal.jsx';
import AssignmentQuizModal from '../components/AssignmentQuizModal.jsx';
import { unitNumberOf } from '../utils/unitId.js';

const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const EDUCATION_LEVELS = [
  { id: 'primary', label: 'Tiểu học', sub: 'Lớp 1 – 5', icon: '🎒', grades: [1, 2, 3, 4, 5] },
  { id: 'secondary', label: 'THCS', sub: 'Lớp 6 – 9', icon: '🎓', grades: [6, 7, 8, 9] },
  { id: 'high', label: 'THPT', sub: 'Lớp 10 – 12', icon: '🏛️', grades: [10, 11, 12] },
];

export const speakWord = async (word) => {
  if (!word) return;
  return speak(word, { lang: 'en-GB', rate: 0.85 });
};

export default function HomePage() {
  const units = listUnits();
  const progress = store().getProgress();
  const hardCount = wordsByStatus(store().getMastery(), 'review').length;
  const streak = streakOf(progress.studyDays);
  const totalStars = totalStarsOf(progress);
  const [student, setStudent] = useState(() => store().getStudentInfo());
  const [showProfile, setShowProfile] = useState(false);
  const [quizAssignmentModal, setQuizAssignmentModal] = useState(null);

  const { settings, update } = useSettings();
  const activeGrade = settings?.selectedGrade || 6;
  const [semesterFilter, setSemesterFilter] = useState('all'); // 'all' | 1 | 2
  const [showPdfReaderModal, setShowPdfReaderModal] = useState(false);
  const [selectedBookForReader, setSelectedBookForReader] = useState('tap1');
  const [activeSpeakingWord, setActiveSpeakingWord] = useState(null);

  const handleSpeakWord = async (word) => {
    if (!word) return;
    setActiveSpeakingWord(word);
    try {
      await speakWord(word);
    } finally {
      setActiveSpeakingWord(null);
    }
  };

  useEffect(() => {
    setSemesterFilter('all');
  }, [activeGrade]);

  const gradeData = useMemo(() => {
    return multiGradeCurriculum.grades.find((g) => g.grade === activeGrade) || null;
  }, [activeGrade]);

  const filteredCurriculumUnits = useMemo(() => {
    if (!gradeData || !gradeData.units) return [];
    if (semesterFilter === 'all') return gradeData.units;
    return gradeData.units.filter((u) => u.semester === Number(semesterFilter));
  }, [gradeData, semesterFilter]);

  // Tìm bài học tiếp theo em nên học (bài đầu tiên chưa đạt đủ 12 sao hoặc bài 1) - áp dụng cho Lớp 6
  const nextUnit = useMemo(() => {
    const available = units.filter((u) => u.available);
    const unfinished = available.find((u) => {
      const stars = Object.values(progress.units[u.unitId]?.modes ?? {}).reduce((a, b) => a + b, 0);
      return stars < 12;
    });
    return unfinished || available[0];
  }, [units, progress]);

  // Bài giao của thầy cô (tải từ máy chủ): chỉ bài đang mở, đúng lớp của em, còn hạn
  const [assignTick, setAssignTick] = useState(0);
  useEffect(() => {
    const bump = () => setAssignTick((n) => n + 1);
    window.addEventListener('assignment-updated', bump);
    return () => window.removeEventListener('assignment-updated', bump);
  }, []);
  const activeAssignments = useMemo(() => {
    const myClass = String(student.class || '').trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    return store()
      .getAssignments()
      .filter((a) => a.status !== 'closed')
      .filter((a) => !a.targetClass || a.targetClass === 'all' || !myClass || String(a.targetClass).trim().toLowerCase() === myClass)
      .filter((a) => !/^\d{4}-\d{2}-\d{2}/.test(String(a.deadline || '')) || String(a.deadline).slice(0, 10) >= today);
  }, [assignTick, student.class]);

  const assignedItem = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash || '';
    const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.replace('?', '');
    const params = new URLSearchParams(queryPart);
    const assignCode = params.get('assign');
    if (assignCode) {
      // Link có mã bài: mở đúng bài đó (kể cả khi quá hạn, để em vẫn làm bù được)
      return store().getAssignmentById(assignCode) || activeAssignments[0] || null;
    }
    return activeAssignments[0] || null;
  }, [activeAssignments]);

  // Tự động mở bài tập nếu học sinh mở link chia sẻ từ Thầy/Cô (?assign=CODE)
  const autoOpenedRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.replace('?', '');
    const params = new URLSearchParams(queryPart);
    const assignCode = params.get('assign');
    if (assignCode && assignedItem && autoOpenedRef.current !== assignedItem.id) {
      autoOpenedRef.current = assignedItem.id; // chỉ tự mở 1 lần cho mỗi link
      if (
        assignedItem.scopeType === 'external_quiz' ||
        assignedItem.scopeType === 'custom_questions' ||
        (Array.isArray(assignedItem.questions) && assignedItem.questions.length > 0)
      ) {
        setQuizAssignmentModal(assignedItem);
      }
    }
  }, [assignedItem]);

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
      const ids = (assignedItem.selectedWordIds || []).join(',');
      return `/unit/${assignedItem.unitId}/flashcard${ids ? `?words=${encodeURIComponent(ids)}` : ''}`;
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

      {/* Quick switcher buttons to easily jump between Lớp 1..12 */}
      <section aria-label="Bộ chọn khối lớp" className="rounded-3xl bg-white p-3.5 sm:p-5 border-2 border-banana-soft shadow-[0_4px_0_#efe3cc]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-banana-soft/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-banana text-xl shadow-2xs" aria-hidden>
              {activeGrade <= 5 ? '🎒' : activeGrade <= 9 ? '🎓' : '🏛️'}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-ink">
                  Chương trình 12 Khối Lớp
                </span>
                <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white shadow-2xs">
                  Đang học: Lớp {activeGrade} {activeGrade === 6 ? '★ 3D' : ''}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-ink-soft">
                {activeGrade <= 5 ? '🎒 Cấp Tiểu học (Lớp 1 – 5)' : activeGrade <= 9 ? '🎓 Cấp THCS (Lớp 6 – 9)' : '🏛️ Cấp THPT (Lớp 10 – 12)'}
                {activeGrade === 6 && ' • Giáo trình tương tác 3D chuẩn Bộ GD&ĐT'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] sm:text-xs font-bold text-ink-soft hidden md:inline">Cấp:</span>
            <div className="flex items-center gap-1 rounded-xl bg-cream p-1 border border-banana-soft">
              {EDUCATION_LEVELS.map((lvl) => {
                const isActive = lvl.grades.includes(activeGrade);
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      if (!isActive) {
                        const target = lvl.grades[0];
                        update({ selectedGrade: target });
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('grade-changed', { detail: { grade: target } }));
                        }
                        playSfx('click');
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-peach text-white shadow-2xs'
                        : 'text-ink-soft hover:bg-banana/30 hover:text-ink'
                    }`}
                  >
                    <span>{lvl.icon}</span> <span className="hidden sm:inline">{lvl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3 Tier Groups with Grade Pills - Responsive grid filling 100% width with no overflow */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {EDUCATION_LEVELS.map((lvl) => {
            const isLevelActive = lvl.grades.includes(activeGrade);
            const gridColsClass = lvl.id === 'primary' ? 'grid-cols-5' : lvl.id === 'secondary' ? 'grid-cols-4' : 'grid-cols-3';
            return (
              <div
                key={lvl.id}
                className={`rounded-2xl p-2.5 transition-all ${
                  isLevelActive
                    ? 'bg-peach-soft/20 border-2 border-peach/50 shadow-xs'
                    : 'bg-cream/40 border border-banana-soft/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-xs font-black text-ink flex items-center gap-1">
                    <span>{lvl.icon}</span> {lvl.label}
                  </span>
                  <span className="text-[10px] font-bold text-ink-soft">
                    {lvl.sub}
                  </span>
                </div>
                <div className={`grid ${gridColsClass} gap-1.5`}>
                  {lvl.grades.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        update({ selectedGrade: g });
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('grade-changed', { detail: { grade: g } }));
                        }
                        playSfx('click');
                      }}
                      className={`relative flex flex-col items-center justify-center rounded-xl py-1 text-xs font-black transition-all cursor-pointer ${
                        activeGrade === g
                          ? 'bg-peach text-white shadow-[0_2px_0_var(--color-peach-dark)] scale-105 z-10'
                          : 'bg-white text-ink-soft hover:bg-banana/30 hover:text-ink border border-banana-soft/70'
                      }`}
                    >
                      <span>Lớp {g}</span>
                      {g === 6 && (
                        <span className={`text-[9px] font-black -mt-0.5 ${activeGrade === g ? 'text-banana' : 'text-amber-500'}`}>
                          ★ 3D
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Khối Tìm kiếm nhanh toàn diện */}
      <div className="relative w-full">
        <Link
          to="/search"
          onClick={() => playSfx('click')}
          className="group flex h-14 sm:h-16 w-full items-center justify-between rounded-3xl border-3 border-banana-soft bg-white px-5 sm:px-6 shadow-[0_4px_0_#efe3cc] hover:border-banana hover:shadow-[0_6px_0_#d8b13c] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 text-ink-soft group-hover:text-ink">
            <span className="text-xl sm:text-2xl" aria-hidden>🔍</span>
            <span className="text-sm sm:text-base font-black">
              Tìm kiếm từ vựng, ngữ pháp, bài đọc, câu nói... ({activeGrade === 6 ? `${units.length} Unit` : `${gradeData?.totalUnits || 12} Unit`})
            </span>
          </div>
          <span className="hidden sm:inline-flex rounded-xl bg-banana px-3 py-1.5 text-xs font-black text-ink shadow-2xs group-hover:scale-105 transition-transform">
            Tra cứu ngay ↵
          </span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* GIAO DIỆN KHỐI LỚP 6: 12 BÀI HỌC TƯƠNG TÁC 3D, SAO, TRẠM HỌC */}
      {/* ============================================================ */}
      {activeGrade === 6 && (
        <>
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

                {assignedItem.scopeType === 'custom_questions' ||
                assignedItem.scopeType === 'external_quiz' ||
                (Array.isArray(assignedItem.questions) && assignedItem.questions.length > 0) ? (
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      setQuizAssignmentModal(assignedItem);
                    }}
                    className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-base font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer whitespace-nowrap text-center"
                  >
                    <span>Làm bài tập ngay 🚀</span>
                  </button>
                ) : (
                  <Link
                    to={assignmentTargetLink}
                    onClick={() => playSfx('click')}
                    className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-base font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer whitespace-nowrap text-center"
                  >
                    <span>Làm bài ngay 🚀</span>
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Modal làm bài tập trắc nghiệm trực tiếp */}
          {quizAssignmentModal && (
            <AssignmentQuizModal
              assignment={quizAssignmentModal}
              isOpen={!!quizAssignmentModal}
              onClose={() => setQuizAssignmentModal(null)}
              onCompleted={() => {
                // Đã nộp bài xong
              }}
            />
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

          {/* Chuỗi ngày học liên tiếp */}
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 border border-banana-soft px-4 py-3 text-center text-base sm:text-lg font-black text-ink shadow-xs">
            <span className="text-2xl" aria-hidden>🔥</span>
            <span>{t.home.streak(streak)}</span>
          </div>

          {/* 12 Bài học Unit */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-black text-ink">{t.home.units}</h2>
              <p className="text-sm sm:text-base font-bold text-ink-soft">{t.home.unitsSub}</p>
            </div>

            <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {units.map((u) => {
                const stars = Object.values(progress.units[u.unitId]?.modes ?? {}).reduce((a, b) => a + b, 0);
                const content = (
                  <>
                    <span className="text-5xl my-1 select-none transition-transform group-hover:scale-110" aria-hidden>
                      {u.emoji}
                    </span>
                    <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-black text-ink-soft">
                      Unit {unitNumberOf(u)}
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
        </>
      )}

      {/* ============================================================ */}
      {/* GIAO DIỆN CÁC KHỐI LỚP KHÁC (LỚP 1..5, 7..12) TỪ MULTI-GRADE CURRICULUM */}
      {/* ============================================================ */}
      {activeGrade !== 6 && gradeData && (
        <div className="flex flex-col gap-6">
          {/* Header banner của khối lớp */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-banana/30 via-cream to-white p-6 sm:p-7 shadow-xs border-3 border-banana-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-banana to-banana-dark text-3xl shadow-sm border border-banana-dark/20" aria-hidden>
                  📚
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-black shadow-2xs ${
                      gradeData.level === 'primary' ? 'bg-emerald-600 text-white' :
                      gradeData.level === 'secondary' ? 'bg-banana text-ink border border-banana-dark/30' :
                      'bg-rose-600 text-white'
                    }`}>
                      {gradeData.levelName}
                    </span>
                    <span className="rounded-full bg-white px-3 py-0.5 text-xs font-black text-ink border border-banana-soft shadow-2xs">
                      {gradeData.totalUnits} Units
                    </span>
                    <span className="rounded-full bg-sky-100 text-sky-900 border border-sky-300 px-3 py-0.5 text-xs font-black">
                      Global Success GDPT 2018
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-ink mt-1.5">
                    {gradeData.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1 max-w-3xl leading-relaxed">
                    {gradeData.description}
                  </p>
                </div>
              </div>

              {/* Nút Mở SGK điện tử trọn bộ */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {(gradeData.textbooks || []).map((tb) => (
                  <button
                    key={tb.bookId}
                    type="button"
                    onClick={() => {
                      setSelectedBookForReader(tb.bookId);
                      setShowPdfReaderModal(true);
                      playSfx('click');
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-peach px-5 py-3 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>📖 Mở SGK {tb.semester !== 'Cả năm' ? `(${tb.semester})` : 'Điện Tử'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bộ lọc Học kỳ (Tất cả, Học kỳ 1, Học kỳ 2) */}
            <div className="mt-5 pt-4 border-t border-banana-soft/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-black text-ink">
                Phân phối bài học ({filteredCurriculumUnits.length} / {gradeData.totalUnits} Units)
              </div>
              <div className="inline-flex rounded-2xl bg-white p-1 border border-banana-soft shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setSemesterFilter('all');
                    playSfx('click');
                  }}
                  className={`rounded-xl px-3.5 py-1 text-xs font-black transition-all cursor-pointer ${
                    semesterFilter === 'all'
                      ? 'bg-banana text-ink shadow-xs border border-banana-dark/30'
                      : 'text-ink-soft hover:bg-cream hover:text-ink'
                  }`}
                >
                  Tất cả ({gradeData.units.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSemesterFilter(1);
                    playSfx('click');
                  }}
                  className={`rounded-xl px-3.5 py-1 text-xs font-black transition-all cursor-pointer ${
                    semesterFilter === 1
                      ? 'bg-banana text-ink shadow-xs border border-banana-dark/30'
                      : 'text-ink-soft hover:bg-cream hover:text-ink'
                  }`}
                >
                  Học kỳ 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSemesterFilter(2);
                    playSfx('click');
                  }}
                  className={`rounded-xl px-3.5 py-1 text-xs font-black transition-all cursor-pointer ${
                    semesterFilter === 2
                      ? 'bg-banana text-ink shadow-xs border border-banana-dark/30'
                      : 'text-ink-soft hover:bg-cream hover:text-ink'
                  }`}
                >
                  Học kỳ 2
                </button>
              </div>
            </div>
          </section>

          {/* Danh sách thẻ bài học Unit */}
          <section aria-label={`Danh sách bài học ${gradeData.gradeName}`}>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCurriculumUnits.map((u) => {
                const targetPhonicsVal = u.targetPhonics || u.phonics;
                const bookToOpen = u.bookId || gradeData.bookIds?.[0] || `sgk-${activeGrade}`;
                const targetUnitId = u.unitId || `g${activeGrade}_u${u.unit}`;

                return (
                  <div
                    key={u.unit}
                    className="flex flex-col justify-between gap-4 rounded-3xl bg-white p-5 sm:p-6 border-2 border-banana-soft shadow-[0_4px_0_#efe3cc] hover:border-banana hover:shadow-[0_6px_0_#d8b13c] transition-all"
                  >
                    <div>
                      {/* Tiêu đề & Badges */}
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

                      {/* Tên bài học */}
                      <h3 className="text-xl sm:text-2xl font-black text-ink mt-2.5 leading-snug">
                        {u.title}
                      </h3>
                      <p className="text-sm font-bold text-ink-soft mt-0.5">
                        {u.titleVi}
                      </p>

                      {/* Chi tiết Ngữ pháp & Ngữ âm */}
                      <div className="mt-3.5 flex flex-col gap-2 rounded-2xl bg-cream/50 p-3 border border-banana-soft/60">
                        {u.grammar && (
                          <div className="flex items-start gap-2 text-xs">
                            <span className="font-black text-ink shrink-0 bg-white px-2 py-0.5 rounded-lg border border-banana-soft">
                              📐 Ngữ pháp:
                            </span>
                            <span className="font-extrabold text-ink-soft pt-0.5 leading-relaxed">
                              {u.grammar}
                            </span>
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

                      {/* Key Vocabulary Pills với nút loa nghe giọng Anh-Anh */}
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
                                    handleSpeakWord(word);
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

                    {/* Nút hành động học tập & Mở SGK */}
                    <div className="flex flex-col gap-2.5 pt-3.5 border-t border-banana-soft/60 mt-3">
                      {/* Nút chính: Toàn bộ 7 trạm học */}
                      <Link
                        to={`/unit/${targetUnitId}`}
                        onClick={() => playSfx('click')}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-peach px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer"
                      >
                        <span className="text-base" aria-hidden>🚀</span>
                        <span>Vào bài học (Đầy đủ 7 Trạm)</span>
                      </Link>

                      {/* 3 Nút kỹ năng chuyên sâu: Luyện nói, Ngữ pháp, Đọc hiểu - Grid 3 cột đều đẹp */}
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

                      {/* Footer bài học: Tên bộ sách & Nút mở SGK */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-ink-soft truncate max-w-[50%]">
                          {gradeData.title.split('–')[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookForReader(bookToOpen);
                            setShowPdfReaderModal(true);
                            playSfx('click');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-black text-peach-dark hover:underline cursor-pointer shrink-0"
                        >
                          <span>📖 Mở SGK điện tử →</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Modal Đọc Sách Giáo Khoa PDF Toàn Diện */}
      {showPdfReaderModal && (
        <PdfReaderModal
          isOpen={showPdfReaderModal}
          onClose={() => setShowPdfReaderModal(false)}
          initialBookId={selectedBookForReader}
        />
      )}
    </div>
  );
}
