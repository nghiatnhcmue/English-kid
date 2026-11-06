import { useState, useMemo, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2, ChevronRight, Clock, RefreshCw, Search, Sparkles, User, Users, Check, X } from 'lucide-react';
import { Button3D } from './ui.jsx';
import { store, totalStarsOf } from '../utils/storage.js';
import { listUnits } from '../utils/data.js';
import { fetchTeacherScores } from '../utils/syncService.js';
import { playSfx } from '../utils/sfx.js';

export default function TeacherClassProgress() {
  const allUnits = listUnits();
  const students = store().getStudents();
  const allProgress = store().getAllStudentsProgress();

  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [remoteScores, setRemoteScores] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Danh sách các lớp
  const classList = useMemo(() => {
    const set = new Set();
    students.forEach((s) => s.class && set.add(s.class));
    return ['all', ...Array.from(set).sort()];
  }, [students]);

  // Đồng bộ điểm từ Cloudflare D1
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    playSfx('click');
    try {
      const res = await fetchTeacherScores(selectedClass);
      setRemoteScores(res.data || []);
      playSfx('correct');
    } catch {
      /* bỏ qua */
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    handleSyncCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    let list = students;
    if (selectedClass !== 'all') {
      list = list.filter((s) => s.class === selectedClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.username?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, selectedClass, searchQuery]);

  // Tính trạng thái hoàn thành Unit của 1 học sinh
  const getStudentUnitStatus = (student, unitId) => {
    const numId = Number(unitId);
    const stuProg = allProgress[student.id]?.units?.[numId] || {};
    const modes = stuProg.modes || {};

    // Tìm trong kết quả đồng bộ remote xem có bài thi hay bài tập của học sinh này không
    const studentRemote = remoteScores.filter(
      (r) =>
        r.studentName?.toLowerCase() === student.name?.toLowerCase() &&
        Array.isArray(r.unitIds) &&
        r.unitIds.includes(numId)
    );

    const hasVocab = (modes.flashcard || 0) > 0 || (modes.matching || 0) > 0;
    const hasListening = (modes.listenstation || 0) > 0 || (modes.listening || 0) > 0;
    const hasSpeaking = (modes.speaking || 0) > 0;
    const hasGrammar = (modes.grammar || 0) > 0;
    const hasMastery = (modes.mastery || 0) > 0 || studentRemote.length > 0;

    const completedStations = [hasVocab, hasListening, hasSpeaking, hasGrammar, hasMastery].filter(Boolean).length;
    return {
      completedStations,
      totalStations: 5,
      isFullyDone: completedStations >= 4,
      isPartiallyDone: completedStations > 0 && completedStations < 4,
      hasVocab,
      hasListening,
      hasSpeaking,
      hasGrammar,
      hasMastery,
      latestScore: studentRemote[0]?.score ?? null,
    };
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Thẻ Tiêu đề & Nút đồng bộ */}
      <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-mint text-white px-3 py-1 text-xs font-black uppercase shadow-xs">
            Theo dõi tiến độ học tập
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-ink mt-2">
            Ma Trận Tiến Độ Hoàn Thành 12 Unit
          </h2>
          <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
            Xem chi tiết từng học sinh đã hoàn thành các trạm Từ vựng, Nghe, Nói, Ngữ pháp, Test tuần của từng bài hay chưa.
          </p>
        </div>

        <Button3D
          tone="peach"
          onClick={handleSyncCloud}
          disabled={isSyncing}
          className="px-4 py-2.5 text-sm shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Đang cập nhật...' : 'Cập nhật từ Cloud'}</span>
        </Button3D>
      </section>

      {/* Bộ Lọc Theo Lớp & Tìm Kiếm */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-banana-soft shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-black text-ink-soft shrink-0">Lớp:</span>
          {classList.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => {
                playSfx('click');
                setSelectedClass(cls);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
                selectedClass === cls
                  ? 'bg-peach text-white shadow-xs'
                  : 'bg-cream text-ink-soft hover:bg-banana-soft hover:text-ink border border-banana-soft'
              }`}
            >
              {cls === 'all' ? `Tất cả (${students.length})` : `Lớp ${cls}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full rounded-2xl bg-cream pl-10 pr-4 py-2 text-xs sm:text-sm font-bold text-ink border border-banana-soft placeholder:text-ink-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
          />
        </div>
      </div>

      {/* Bảng Ma Trận Tiến Độ Toàn Bộ 12 Unit */}
      <section className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-ink-soft">Chưa có học sinh nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-banana-soft text-[11px] font-black uppercase text-ink-soft">
                  <th className="py-3 px-3 sticky left-0 bg-white z-10 min-w-[160px]">Học sinh</th>
                  {allUnits.map((u) => (
                    <th key={u.unitId} className="py-3 px-2 text-center min-w-[70px]">
                      <span className="block">{u.emoji}</span>
                      <span>U{u.unitId}</span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-banana-soft/50">
                {filteredStudents.map((stu) => {
                  return (
                    <tr key={stu.id} className="hover:bg-cream/60 transition-colors">
                      {/* Cột tên học sinh (sticky bên trái) */}
                      <td className="py-3 px-3 sticky left-0 bg-white hover:bg-cream/60 z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-xl shrink-0">{stu.avatar || '🦁'}</span>
                          <div className="min-w-0">
                            <span className="font-black text-ink text-sm block truncate">
                              {stu.name}
                            </span>
                            <span className="text-[10px] font-bold text-ink-soft">
                              {stu.class}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 12 Cột tương ứng 12 Unit */}
                      {allUnits.map((u) => {
                        const st = getStudentUnitStatus(stu, u.unitId);
                        let badgeStyle = 'bg-gray-100 text-gray-400 border border-gray-200';
                        let badgeText = 'Chưa';

                        if (st.isFullyDone) {
                          badgeStyle = 'bg-mint text-white font-black shadow-2xs';
                          badgeText = '✓ Đạt';
                        } else if (st.isPartiallyDone) {
                          badgeStyle = 'bg-banana-soft text-amber-900 border border-banana font-black';
                          badgeText = `${st.completedStations}/5`;
                        }

                        return (
                          <td key={u.unitId} className="py-3 px-1 text-center">
                            <div
                              title={`Unit ${u.unitId}: Đã làm ${st.completedStations}/5 trạm (Từ vựng: ${st.hasVocab ? '✓' : '✗'}, Nghe: ${st.hasListening ? '✓' : '✗'}, Nói: ${st.hasSpeaking ? '✓' : '✗'}, Ngữ pháp: ${st.hasGrammar ? '✓' : '✗'})`}
                              className={`mx-auto inline-block rounded-xl px-1.5 py-0.5 text-[10px] sm:text-xs cursor-pointer select-none transition-transform hover:scale-110 ${badgeStyle}`}
                            >
                              {badgeText}
                            </div>
                          </td>
                        );
                      })}

                      {/* Nút xem chi tiết */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            playSfx('click');
                            setSelectedStudentDetail(stu);
                          }}
                          className="rounded-xl bg-cream px-2.5 py-1 text-xs font-black text-sky-dark hover:bg-banana cursor-pointer transition-colors"
                        >
                          Xem bài làm
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL CHI TIẾT TIẾN ĐỘ 1 HỌC SINH */}
      {selectedStudentDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-6 shadow-2xl border-4 border-banana-soft flex flex-col gap-4 max-h-[90dvh] overflow-y-auto animate-pop">
            <button
              type="button"
              onClick={() => setSelectedStudentDetail(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-ink-soft hover:bg-rose-soft hover:text-peach-dark cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b-2 border-banana-soft pb-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-banana text-3xl shadow-xs">
                {selectedStudentDetail.avatar || '🦁'}
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-ink">
                  {selectedStudentDetail.name}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-ink-soft">
                  Lớp: <strong>{selectedStudentDetail.class}</strong> · Mã học sinh: <strong className="font-mono">{selectedStudentDetail.username}</strong>
                </p>
              </div>
            </div>

            {/* Chi tiết 12 Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {allUnits.map((u) => {
                const st = getStudentUnitStatus(selectedStudentDetail, u.unitId);
                return (
                  <div
                    key={u.unitId}
                    className="p-3.5 rounded-2xl border-2 border-banana-soft bg-cream/50 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-ink text-sm">
                        {u.emoji} Unit {u.unitId}: {u.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          st.isFullyDone
                            ? 'bg-mint text-white'
                            : st.isPartiallyDone
                              ? 'bg-banana text-ink'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {st.completedStations}/5 trạm
                      </span>
                    </div>

                    {/* 5 Trạm */}
                    <div className="grid grid-cols-5 gap-1 text-[11px] font-bold text-center">
                      <div className={`p-1 rounded-lg ${st.hasVocab ? 'bg-mint-soft text-mint-dark font-black' : 'bg-white text-gray-300'}`}>
                        📖 Từ
                      </div>
                      <div className={`p-1 rounded-lg ${st.hasListening ? 'bg-mint-soft text-mint-dark font-black' : 'bg-white text-gray-300'}`}>
                        👂 Nghe
                      </div>
                      <div className={`p-1 rounded-lg ${st.hasSpeaking ? 'bg-mint-soft text-mint-dark font-black' : 'bg-white text-gray-300'}`}>
                        🎙️ Nói
                      </div>
                      <div className={`p-1 rounded-lg ${st.hasGrammar ? 'bg-mint-soft text-mint-dark font-black' : 'bg-white text-gray-300'}`}>
                        📐 Ngữ
                      </div>
                      <div className={`p-1 rounded-lg ${st.hasMastery ? 'bg-mint-soft text-mint-dark font-black' : 'bg-white text-gray-300'}`}>
                        📝 Test
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

