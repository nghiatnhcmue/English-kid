import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button3D } from '../../ui.jsx';
import { store, totalStarsOf } from '../../../utils/storage.js';
import { streakOf } from '../../../utils/dates.js';
import { wordsByStatus } from '../../../utils/mastery.js';
import { listUnits } from '../../../utils/data.js';
import { unitNumberOf } from '../../../utils/unitId.js';
import GradeTierSelector from '../../curriculum/GradeTierSelector.jsx';
import multiGradeCurriculum from '../../../data/multiGradeCurriculum.json';

export default function TeacherRoadmapTab({ onSwitchToEditor, onOpenPdf }) {
  const [selectedGrade, setSelectedGrade] = useState(6);
  const [semesterFilter, setSemesterFilter] = useState('all');

  const allUnits = listUnits(6);
  const currentStudent = store().getStudentInfo();
  const progress = store().getProgress();
  const mastery = store().getMastery();
  const studentStreak = streakOf(progress.studyDays);
  const studentTotalStars = totalStarsOf(progress);
  const masteredCount = wordsByStatus(mastery, 'mastered').length;

  const gradeData = multiGradeCurriculum.grades.find((g) => g.grade === selectedGrade);
  const filteredUnits = (gradeData?.units || []).filter((u) =>
    semesterFilter === 'all' ? true : u.semester === Number(semesterFilter),
  );

  const levelBadgeTone =
    gradeData?.level === 'primary'
      ? 'bg-emerald-500 text-white'
      : gradeData?.level === 'secondary'
      ? 'bg-banana text-ink border border-banana-dark/30'
      : 'bg-rose-500 text-white';

  return (
    <div className="flex flex-col gap-6">
      <GradeTierSelector
        activeGrade={selectedGrade}
        onSelectGrade={(g) => {
          setSelectedGrade(g);
          setSemesterFilter('all');
        }}
        title="Lộ Trình Học & Phân Phối Chương Trình (Lớp 1 – 12)"
        badgePrefix="Đang xem"
      />

      {selectedGrade === 6 ? (
        <>
          <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-banana text-4xl shadow-sm">
                {currentStudent.avatar || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-ink">
                    {currentStudent.name || 'Chưa đặt tên'}
                  </h3>
                  <span className="rounded-full bg-cream px-3 py-0.5 text-xs font-black text-ink-soft border border-banana-soft">
                    {currentStudent.class ? `Lớp ${currentStudent.class}` : 'Chưa chọn lớp'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">
                  Thiết bị học tập hiện tại · Tiến độ lưu an toàn trong hệ thống
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial rounded-2xl bg-cream p-3 text-center border border-banana-soft">
                <span className="text-xs font-black text-ink-soft block">Tổng số sao</span>
                <span className="text-xl font-black text-ink">⭐ {studentTotalStars}</span>
              </div>
              <div className="flex-1 sm:flex-initial rounded-2xl bg-cream p-3 text-center border border-banana-soft">
                <span className="text-xs font-black text-ink-soft block">Chuỗi học tập</span>
                <span className="text-xl font-black text-peach-dark">🔥 {studentStreak} ngày</span>
              </div>
              <div className="flex-1 sm:flex-initial rounded-2xl bg-cream p-3 text-center border border-banana-soft">
                <span className="text-xs font-black text-ink-soft block">Từ vựng đã thuộc</span>
                <span className="text-xl font-black text-mint-dark">✓ {masteredCount} từ</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-ink">
                  Tiến Độ Chi Tiết Các Unit ({allUnits.length} Bài học)
                </h3>
                <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">
                  Theo dõi học sinh đã hoàn thành những trạm kỹ năng nào trong từng bài học
                </p>
              </div>
              <button
                type="button"
                onClick={onSwitchToEditor}
                className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-2xl bg-mint px-4 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-mint-dark transition-all shadow-[0_3px_0_#58b292] active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <span>➕ Thêm / Chỉnh Sửa Unit</span>
              </button>
            </div>

            <div className="grid gap-3">
              {allUnits.map((u) => {
                const uProg = progress.units[u.unitId]?.modes || {};
                const badges = [
                  ['Từ vựng', (uProg.flashcard || 0) > 0, false],
                  ['Ngữ pháp', (uProg.grammar || 0) > 0, false],
                  ['Nghe', (uProg.listenstation || 0) > 0 || (uProg.listening || 0) > 0, false],
                  ['Nói', (uProg.speaking || 0) > 0, false],
                  ['Đọc', (uProg.reading || 0) > 0, false],
                  ['Viết', (uProg.writing || 0) > 0, false],
                  ['Bài tập Unit', (uProg.mastery || 0) > 0, true],
                ];
                const completedStations = badges.filter((b) => b[1]).length;

                return (
                  <div
                    key={u.unitId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-cream/50 p-4 border border-banana-soft hover:bg-cream transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl shrink-0" aria-hidden>
                        {u.emoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-ink">
                            Unit {unitNumberOf(u)}: {u.titleEn}
                          </h4>
                          <span className="text-xs font-bold text-ink-soft">({u.titleVi})</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {badges.map(([label, done, isMastery]) => (
                            <span
                              key={label}
                              className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${
                                done
                                  ? isMastery
                                    ? 'bg-peach text-white shadow-2xs'
                                    : 'bg-mint text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {done ? (isMastery ? '★' : '✓') : '○'} {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-black text-ink-soft block">Tiến độ trạm</span>
                        <span className="text-sm font-black text-ink">{completedStations} / 7 Trạm</span>
                      </div>
                      <Button3D tone="banana" to={`/unit/${u.unitId}`} className="px-3.5 py-1.5 text-xs">
                        Xem Unit →
                      </Button3D>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        gradeData && (
          <div className="flex flex-col gap-5">
            <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cream text-3xl shadow-sm border border-banana-soft">
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-ink">{gradeData.title}</h3>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-black ${levelBadgeTone}`}>
                      {gradeData.levelName}
                    </span>
                    <span className="rounded-full bg-cream px-3 py-0.5 text-xs font-black text-ink-soft border border-banana-soft">
                      {gradeData.totalUnits} Units
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1 max-w-2xl leading-relaxed">
                    {gradeData.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                {gradeData.textbooks.map((tb) => (
                  <button
                    key={tb.bookId}
                    type="button"
                    onClick={() => onOpenPdf?.(tb.bookId)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-peach px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Đọc {tb.title.replace('SGK ', '')} 📖</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-ink">
                    Phân Phối Bài Học – {gradeData.gradeName} ({filteredUnits.length} / {gradeData.totalUnits}{' '}
                    Unit)
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">
                    Khung chương trình chuẩn Bộ GD&amp;ĐT. Bấm &quot;Đọc SGK 📖&quot; để tra cứu sách giáo khoa
                    tương ứng.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {[
                    { id: 'all', label: `Tất cả (${gradeData.units.length})` },
                    { id: 1, label: 'Học kỳ I' },
                    { id: 2, label: 'Học kỳ II' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSemesterFilter(tab.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                        semesterFilter === tab.id
                          ? 'bg-banana text-ink shadow-xs'
                          : 'bg-cream text-ink-soft hover:bg-banana/30'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {filteredUnits.map((u) => (
                  <div
                    key={u.unit}
                    className="flex flex-col justify-between gap-3 rounded-2xl bg-cream/50 p-4 border border-banana-soft hover:bg-cream hover:border-banana transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-banana px-2.5 py-0.5 text-xs font-black text-ink">
                          Unit {u.unit}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-ink-soft border border-banana-soft">
                            Học kỳ {u.semester === 1 ? 'I' : 'II'}
                          </span>
                          <span className="rounded-full bg-mint/20 text-mint-dark px-2 py-0.5 text-[11px] font-black">
                            {u.theme}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-ink mt-2">{u.title}</h4>
                      <p className="text-xs font-bold text-ink-soft">{u.titleVi}</p>

                      <div className="mt-2 flex flex-col gap-1 text-xs">
                        {u.targetPhonics && (
                          <div className="flex items-center gap-1 text-ink-soft">
                            <span className="font-black text-ink">Ngữ âm:</span>
                            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-banana-soft text-peach-dark font-bold">
                              {u.targetPhonics}
                            </span>
                          </div>
                        )}
                        {u.grammar && (
                          <div className="flex items-start gap-1 text-ink-soft">
                            <span className="font-black text-ink shrink-0">Ngữ pháp:</span>
                            <span className="font-bold text-ink/80">{u.grammar}</span>
                          </div>
                        )}
                        {u.keyVocab && u.keyVocab.length > 0 && (
                          <div className="flex items-start gap-1 text-ink-soft">
                            <span className="font-black text-ink shrink-0">Từ vựng:</span>
                            <span className="font-medium text-ink-soft">{u.keyVocab.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-banana-soft/60">
                      <span className="text-[11px] font-bold text-ink-soft">
                        {gradeData.title.split('–')[0]}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenPdf?.(u.bookId)}
                        className="inline-flex items-center gap-1 rounded-xl bg-peach px-3 py-1.5 text-xs font-black text-white shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Đọc SGK 📖</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )
      )}
    </div>
  );
}
