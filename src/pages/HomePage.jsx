import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listUnits } from '../utils/data.js';
import { store, totalStarsOf } from '../utils/storage.js';
import { streakOf } from '../utils/dates.js';
import { wordsByStatus } from '../utils/mastery.js';
import { playSfx } from '../utils/sfx.js';
import { t } from '../i18n/vi.js';
import { useSettings } from '../settings.jsx';
import { speak } from '../utils/speech.js';
import PdfReaderModal from '../components/PdfReaderModal.jsx';
import StudentProfileModal from '../components/StudentProfileModal.jsx';
import AssignmentQuizModal from '../components/AssignmentQuizModal.jsx';
import GradeTierSelector from '../components/curriculum/GradeTierSelector.jsx';
import CurriculumUnitCard from '../components/curriculum/CurriculumUnitCard.jsx';
import AssignmentBanner from '../components/home/AssignmentBanner.jsx';
import Grade6HomeSection from '../components/home/Grade6HomeSection.jsx';
import multiGradeCurriculum from '../data/multiGradeCurriculum.json';

export const speakWord = async (word) => {
  if (!word) return;
  return speak(word, { lang: 'en-GB', rate: 0.85 });
};

export default function HomePage() {
  const units = listUnits(6);
  const progress = store().getProgress();
  const hardCount = wordsByStatus(store().getMastery(), 'review').length;
  const streak = streakOf(progress.studyDays);
  const totalStars = totalStarsOf(progress);
  const [student, setStudent] = useState(() => store().getStudentInfo());
  const [showProfile, setShowProfile] = useState(false);
  const [quizAssignmentModal, setQuizAssignmentModal] = useState(null);

  const { settings, update } = useSettings();
  const activeGrade = settings?.selectedGrade || 6;
  const [semesterFilter, setSemesterFilter] = useState('all');
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

  const gradeData = useMemo(
    () => multiGradeCurriculum.grades.find((g) => g.grade === activeGrade) || null,
    [activeGrade],
  );

  const filteredCurriculumUnits = useMemo(() => {
    if (!gradeData?.units) return [];
    if (semesterFilter === 'all') return gradeData.units;
    return gradeData.units.filter((u) => u.semester === Number(semesterFilter));
  }, [gradeData, semesterFilter]);

  const nextUnit = useMemo(() => {
    const available = units.filter((u) => u.available);
    const unfinished = available.find((u) => {
      const stars = Object.values(progress.units[u.unitId]?.modes ?? {}).reduce((a, b) => a + b, 0);
      return stars < 12;
    });
    return unfinished || available[0];
  }, [units, progress]);

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
      .filter(
        (a) =>
          !a.targetClass ||
          a.targetClass === 'all' ||
          !myClass ||
          String(a.targetClass).trim().toLowerCase() === myClass,
      )
      .filter(
        (a) => !/^\d{4}-\d{2}-\d{2}/.test(String(a.deadline || '')) || String(a.deadline).slice(0, 10) >= today,
      );
  }, [assignTick, student.class]);

  const assignedItem = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash || '';
    const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.replace('?', '');
    const assignCode = new URLSearchParams(queryPart).get('assign');
    if (assignCode) {
      return store().getAssignmentById(assignCode) || activeAssignments[0] || null;
    }
    return activeAssignments[0] || null;
  }, [activeAssignments]);

  const autoOpenedRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.replace('?', '');
    const assignCode = new URLSearchParams(queryPart).get('assign');
    if (assignCode && assignedItem && autoOpenedRef.current !== assignedItem.id) {
      autoOpenedRef.current = assignedItem.id;
      if (
        assignedItem.scopeType === 'external_quiz' ||
        assignedItem.scopeType === 'custom_questions' ||
        (Array.isArray(assignedItem.questions) && assignedItem.questions.length > 0)
      ) {
        setQuizAssignmentModal(assignedItem);
      }
    }
  }, [assignedItem]);

  const handleSelectGrade = (g) => {
    update({ selectedGrade: g });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grade-changed', { detail: { grade: g } }));
    }
  };

  const openBookReader = (bookId) => {
    setSelectedBookForReader(bookId);
    setShowPdfReaderModal(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink">
            {t.appName} <span aria-hidden>📚</span>
          </h1>
          <p className="text-base sm:text-lg font-bold text-ink-soft">
            {student.name ? (
              <>
                Chào em, <strong className="text-peach-dark">{student.name}</strong>{' '}
                {student.class ? `(Lớp ${student.class})` : ''}! Hôm nay mình cùng học tiếng Anh nhé!
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
        <StudentProfileModal onClose={() => setShowProfile(false)} onSave={(info) => setStudent(info)} />
      )}

      <GradeTierSelector activeGrade={activeGrade} onSelectGrade={handleSelectGrade} />

      <div className="relative w-full">
        <Link
          to="/search"
          onClick={() => playSfx('click')}
          className="group flex h-14 sm:h-16 w-full items-center justify-between rounded-3xl border-3 border-banana-soft bg-white px-5 sm:px-6 shadow-[0_4px_0_#efe3cc] hover:border-banana hover:shadow-[0_6px_0_#d8b13c] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 text-ink-soft group-hover:text-ink">
            <span className="text-xl sm:text-2xl" aria-hidden>
              🔍
            </span>
            <span className="text-sm sm:text-base font-black">
              Tìm kiếm từ vựng, ngữ pháp, bài đọc, câu nói... (
              {activeGrade === 6 ? `${units.length} Unit` : `${gradeData?.totalUnits || 12} Unit`})
            </span>
          </div>
          <span className="hidden sm:inline-flex rounded-xl bg-banana px-3 py-1.5 text-xs font-black text-ink shadow-2xs group-hover:scale-105 transition-transform">
            Tra cứu ngay ↵
          </span>
        </Link>
      </div>

      {activeGrade === 6 && (
        <>
          <AssignmentBanner assignedItem={assignedItem} onOpenQuizModal={setQuizAssignmentModal} />
          <Grade6HomeSection
            units={units}
            progress={progress}
            nextUnit={nextUnit}
            streak={streak}
            hardCount={hardCount}
          />
        </>
      )}

      {activeGrade !== 6 && gradeData && (
        <div className="flex flex-col gap-6">
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-banana/30 via-cream to-white p-6 sm:p-7 shadow-xs border-3 border-banana-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-banana to-banana-dark text-3xl shadow-sm border border-banana-dark/20"
                  aria-hidden
                >
                  📚
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-black shadow-2xs ${
                        gradeData.level === 'primary'
                          ? 'bg-emerald-600 text-white'
                          : gradeData.level === 'secondary'
                          ? 'bg-banana text-ink border border-banana-dark/30'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {gradeData.levelName}
                    </span>
                    <span className="rounded-full bg-white px-3 py-0.5 text-xs font-black text-ink border border-banana-soft shadow-2xs">
                      {gradeData.totalUnits} Units
                    </span>
                    <span className="rounded-full bg-sky-100 text-sky-900 border border-sky-300 px-3 py-0.5 text-xs font-black">
                      Global Success GDPT 2018
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-ink mt-1.5">{gradeData.title}</h2>
                  <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1 max-w-3xl leading-relaxed">
                    {gradeData.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {(gradeData.textbooks || []).map((tb) => (
                  <button
                    key={tb.bookId}
                    type="button"
                    onClick={() => {
                      openBookReader(tb.bookId);
                      playSfx('click');
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-peach px-5 py-3 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>📖 Mở SGK {tb.semester !== 'Cả năm' ? `(${tb.semester})` : 'Điện Tử'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-banana-soft/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-black text-ink">
                Phân phối bài học ({filteredCurriculumUnits.length} / {gradeData.totalUnits} Units)
              </div>
              <div className="inline-flex rounded-2xl bg-white p-1 border border-banana-soft shadow-2xs">
                {[
                  { id: 'all', label: `Tất cả (${gradeData.units.length})` },
                  { id: 1, label: 'Học kỳ 1' },
                  { id: 2, label: 'Học kỳ 2' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSemesterFilter(tab.id);
                      playSfx('click');
                    }}
                    className={`rounded-xl px-3.5 py-1 text-xs font-black transition-all cursor-pointer ${
                      semesterFilter === tab.id
                        ? 'bg-banana text-ink shadow-xs border border-banana-dark/30'
                        : 'text-ink-soft hover:bg-cream hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section aria-label={`Danh sách bài học ${gradeData.gradeName}`}>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCurriculumUnits.map((u) => (
                <CurriculumUnitCard
                  key={u.unit}
                  unitData={u}
                  gradeData={gradeData}
                  activeGrade={activeGrade}
                  activeSpeakingWord={activeSpeakingWord}
                  onSpeakWord={handleSpeakWord}
                  onOpenPdf={openBookReader}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {quizAssignmentModal && (
        <AssignmentQuizModal
          assignment={quizAssignmentModal}
          isOpen={!!quizAssignmentModal}
          onClose={() => setQuizAssignmentModal(null)}
          onCompleted={() => {}}
        />
      )}

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
