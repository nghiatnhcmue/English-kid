import { useState, useMemo, useEffect } from 'react';
import { Plus, Send } from 'lucide-react';
import { getUnitRaw, listUnits } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { fetchSubmissions } from '../utils/syncService.js';
import { parseBatchQuestions, parseBatchAny } from '../utils/questionParser.js';
import { normUnitId, isRealUnitId } from '../utils/unitId.js';
import AssignmentListTab from './teacher/assignments/AssignmentListTab.jsx';
import QuestionBankTab from './teacher/assignments/QuestionBankTab.jsx';
import CreateAssignmentModal from './teacher/assignments/CreateAssignmentModal.jsx';
import AssignmentSubmissionsModal from './teacher/assignments/AssignmentSubmissionsModal.jsx';
import QuestionFormModal from './teacher/shared/QuestionFormModal.jsx';
import BatchImportModal from './teacher/shared/BatchImportModal.jsx';

export default function TeacherAssignmentManager() {
  const units = listUnits();
  const [assignments, setAssignments] = useState(() => store().getAssignments());
  const [activeTab, setActiveTab] = useState('assignments');
  const [bankUnitId, setBankUnitId] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectAssignment, setInspectAssignment] = useState(null);

  // Modal câu hỏi (dùng chung cho Ngân hàng Unit & Đề ngoài SGK)
  const [questionModal, setQuestionModal] = useState({
    open: false,
    mode: 'unit', // 'unit' | 'external'
    unitId: 1,
    editIndex: -1,
    initialData: null,
    defaultType: 'multiple_choice',
  });

  // Modal dán hàng loạt từ Word
  const [batchModal, setBatchModal] = useState({
    open: false,
    unitId: 1,
  });

  // Form tạo bài tập tuần
  const [week, setWeek] = useState(1);
  const [title, setTitle] = useState('');
  const [targetClass, setTargetClass] = useState('all');
  const [unitId, setUnitId] = useState(1);
  const [scopeType, setScopeType] = useState('full_unit');
  const [selectedSkill, setSelectedSkill] = useState('speaking');
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [note, setNote] = useState('Các em hoàn thành trước hạn nộp và cố gắng đạt điểm 10 nhé!');

  const [externalQuestions, setExternalQuestions] = useState([]);
  const [externalPassage, setExternalPassage] = useState({ title: '', content: '', translation: '' });
  const [hasPassage, setHasPassage] = useState(false);

  const [remoteSubs, setRemoteSubs] = useState([]);
  useEffect(() => {
    fetchSubmissions().then((list) => list && setRemoteSubs(list));
  }, []);

  const subsFor = (assignmentId) => {
    const remote = remoteSubs
      .filter((x) => x.assignmentId === assignmentId)
      .map((x) => ({
        id: x.id,
        assignmentId: x.assignmentId,
        studentName: x.studentName,
        studentClass: x.studentClass,
        submittedAt: x.submittedAt,
        score: x.score,
        stars: x.detail?.stars ?? (x.score >= 9 ? 3 : x.score >= 7 ? 2 : 1),
        total: x.detail?.total ?? 0,
        correct: x.detail?.correct ?? 0,
        detail: x.detail?.answers || x.detail || null,
        remote: true,
      }));
    return [...remote, ...store().getAssignmentSubmissions(assignmentId)];
  };

  const activeUnit = useMemo(() => (isRealUnitId(unitId) ? getUnitRaw(unitId) : null), [unitId]);
  const [unitQuestions, setUnitQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);

  const refreshUnitQuestions = (uId = unitId) => {
    if (!isRealUnitId(uId)) {
      setUnitQuestions([]);
      return;
    }
    const baseQuiz = getUnitRaw(uId)?.grammar?.quiz || [];
    setUnitQuestions(store().getUnitQuestions(uId, baseQuiz));
  };

  const refreshBankQuestions = (uId = bankUnitId) => {
    const baseQuiz = getUnitRaw(uId)?.grammar?.quiz || [];
    setBankQuestions(store().getUnitQuestions(uId, baseQuiz));
  };

  useEffect(() => {
    refreshUnitQuestions(unitId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  useEffect(() => {
    refreshBankQuestions(bankUnitId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankUnitId]);

  const handleOpenCreate = (prefillUnitId = null, prefillScope = null) => {
    const targetUnit = prefillUnitId !== null ? prefillUnitId : unitId;
    if (prefillUnitId !== null) setUnitId(prefillUnitId);
    if (prefillScope) setScopeType(prefillScope);

    setTitle(
      prefillScope === 'external_quiz' || targetUnit === 0
        ? `Bài tập Tuần ${week}: Đề luyện tập ngoài SGK`
        : `Bài tập Tuần ${week}: Ôn tập Unit ${targetUnit}`,
    );
    setSelectedWordIds([]);
    setSelectedQuestionIndices([]);
    setExternalQuestions([]);
    setExternalPassage({ title: '', content: '', translation: '' });
    setHasPassage(false);
    refreshUnitQuestions(targetUnit);
    setShowCreateModal(true);
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Vui lòng nhập tiêu đề bài tập.');
    if (scopeType === 'custom_words' && selectedWordIds.length === 0) {
      return alert('Vui lòng tích chọn ít nhất 1 từ vựng để giao bài.');
    }
    if (scopeType === 'custom_questions' && selectedQuestionIndices.length === 0) {
      return alert('Vui lòng tích chọn ít nhất 1 câu hỏi bài tập.');
    }
    if (scopeType === 'external_quiz' && externalQuestions.length === 0) {
      return alert('Vui lòng soạn hoặc dán ít nhất 1 câu hỏi vào đề ngoài SGK.');
    }

    const chosenQuestions =
      scopeType === 'external_quiz'
        ? externalQuestions
        : scopeType === 'custom_questions'
        ? selectedQuestionIndices.map((idx) => unitQuestions[idx]).filter(Boolean)
        : [];

    const created = store().saveAssignment({
      week: Number(week),
      title: title.trim(),
      targetClass,
      scopeType,
      unitId: scopeType === 'external_quiz' && unitId === 0 ? 0 : normUnitId(unitId),
      selectedSkill,
      selectedWordIds,
      selectedQuestions: selectedQuestionIndices,
      questions: chosenQuestions,
      passage:
        scopeType === 'external_quiz' && hasPassage && externalPassage.content.trim()
          ? externalPassage
          : null,
      deadline,
      note: note.trim(),
    });

    setShowCreateModal(false);
    setAssignments(store().getAssignments());
    setInspectAssignment(created);
  };

  const handleDeleteAssignment = (id) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa bài tập này?')) return;
    store().deleteAssignment(id);
    setAssignments(store().getAssignments());
    if (inspectAssignment?.id === id) setInspectAssignment(null);
  };

  const handleDeleteUnitQuestion = (targetUnitId, index) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi bài học?')) return;
    const baseQuiz = getUnitRaw(targetUnitId)?.grammar?.quiz || [];
    const updated = store().deleteUnitQuestion(targetUnitId, index, baseQuiz);
    if (targetUnitId === unitId) {
      setUnitQuestions(updated);
      setSelectedQuestionIndices((prev) =>
        prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
      );
    }
    if (targetUnitId === bankUnitId) setBankQuestions(updated);
  };

  const handleSaveQuestionModal = (payload) => {
    if (questionModal.mode === 'external') {
      if (questionModal.editIndex >= 0) {
        setExternalQuestions((prev) => {
          const copy = [...prev];
          copy[questionModal.editIndex] = payload;
          return copy;
        });
      } else {
        setExternalQuestions((prev) => [...prev, payload]);
      }
      return;
    }

    const targetUnitId = questionModal.unitId;
    const baseQuiz = getUnitRaw(targetUnitId)?.grammar?.quiz || [];
    const updatedList = store().saveUnitQuestion(
      targetUnitId,
      payload,
      questionModal.editIndex,
      baseQuiz,
    );

    if (targetUnitId === unitId) {
      setUnitQuestions(updatedList);
      if (questionModal.editIndex === -1) {
        setSelectedQuestionIndices((prev) => [...prev, updatedList.length - 1]);
      }
    }
    if (targetUnitId === bankUnitId) setBankQuestions(updatedList);
  };

  const isExternalBatch = batchModal.unitId === 0 || (showCreateModal && scopeType === 'external_quiz');

  const handleBatchImport = (list) => {
    if (isExternalBatch) {
      setExternalQuestions((prev) => [...prev, ...list]);
      alert(`🎉 Đã nhận diện và thêm thành công ${list.length} câu hỏi vào đề ngoài SGK!`);
      return;
    }

    const targetUnitId = batchModal.unitId;
    const baseQuiz = getUnitRaw(targetUnitId)?.grammar?.quiz || [];
    const prevCount = store().getUnitQuestions(targetUnitId, baseQuiz).length;
    const updated = store().batchAddUnitQuestions(targetUnitId, list, baseQuiz);

    if (targetUnitId === unitId) {
      setUnitQuestions(updated);
      const addedIdx = [];
      for (let i = prevCount; i < updated.length; i++) addedIdx.push(i);
      setSelectedQuestionIndices((prev) => [...prev, ...addedIdx]);
    }
    if (targetUnitId === bankUnitId) setBankQuestions(updated);
    alert(`🎉 Đã thêm thành công ${list.length} câu hỏi vào Unit ${targetUnitId}!`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft">
        <div>
          <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
            Phân phối &amp; Soạn câu hỏi
          </span>
          <h2 className="text-2xl font-black text-ink mt-1">📅 Quản Lý &amp; Giao Bài Tập Cho Học Sinh</h2>
          <p className="text-sm font-bold text-ink-soft mt-0.5">
            Giao bài linh hoạt theo Unit hoặc theo câu hỏi trắc nghiệm tự soạn. Thầy/Cô có thể dán nhanh từ Word.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              setQuestionModal({
                open: true,
                mode: 'unit',
                unitId: activeTab === 'question_bank' ? bankUnitId : unitId,
                editIndex: -1,
                initialData: null,
                defaultType: 'multiple_choice',
              })
            }
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-mint px-4 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Soạn câu hỏi mới</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreate()}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-peach px-5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>+ Giao bài tập tuần</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b-2 border-banana-soft pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-peach text-white shadow-sm'
              : 'bg-white text-ink-soft hover:bg-cream hover:text-ink border border-banana-soft'
          }`}
        >
          <span>📋 Bài tập đã giao ({assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('question_bank')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer ${
            activeTab === 'question_bank'
              ? 'bg-peach text-white shadow-sm'
              : 'bg-white text-ink-soft hover:bg-cream hover:text-ink border border-banana-soft'
          }`}
        >
          <span>📚 Ngân hàng câu hỏi 12 Unit ({bankQuestions.length} câu)</span>
        </button>
      </div>

      {activeTab === 'assignments' && (
        <AssignmentListTab
          assignments={assignments}
          getSubmissionsFor={subsFor}
          onInspect={setInspectAssignment}
          onDelete={handleDeleteAssignment}
        />
      )}

      {activeTab === 'question_bank' && (
        <QuestionBankTab
          units={units}
          bankUnitId={bankUnitId}
          setBankUnitId={setBankUnitId}
          bankQuestions={bankQuestions}
          onOpenBatch={(uId) => setBatchModal({ open: true, unitId: uId })}
          onAddQuestion={(uId) =>
            setQuestionModal({
              open: true,
              mode: 'unit',
              unitId: uId,
              editIndex: -1,
              initialData: null,
              defaultType: 'multiple_choice',
            })
          }
          onEditQuestion={(uId, idx, q) =>
            setQuestionModal({
              open: true,
              mode: 'unit',
              unitId: uId,
              editIndex: idx,
              initialData: q,
              defaultType: 'multiple_choice',
            })
          }
          onDeleteQuestion={handleDeleteUnitQuestion}
          onCreateAssignmentForUnit={(uId) => handleOpenCreate(uId)}
        />
      )}

      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        units={units}
        week={week}
        setWeek={setWeek}
        title={title}
        setTitle={setTitle}
        targetClass={targetClass}
        setTargetClass={setTargetClass}
        unitId={unitId}
        onChangeUnitId={(newUId) => {
          setUnitId(newUId);
          setSelectedWordIds([]);
          setSelectedQuestionIndices([]);
          if (newUId === 0) {
            setScopeType('external_quiz');
            setTitle(`Bài tập Tuần ${week}: Đề luyện tập ngoài SGK`);
          } else {
            setTitle(`Bài tập Tuần ${week}: Ôn tập Unit ${newUId}`);
          }
          refreshUnitQuestions(newUId);
        }}
        scopeType={scopeType}
        setScopeType={setScopeType}
        selectedSkill={selectedSkill}
        setSelectedSkill={setSelectedSkill}
        activeUnit={activeUnit}
        selectedWordIds={selectedWordIds}
        setSelectedWordIds={setSelectedWordIds}
        unitQuestions={unitQuestions}
        selectedQuestionIndices={selectedQuestionIndices}
        setSelectedQuestionIndices={setSelectedQuestionIndices}
        externalQuestions={externalQuestions}
        onOpenAddExternalQuestion={(type) =>
          setQuestionModal({
            open: true,
            mode: 'external',
            unitId: 0,
            editIndex: -1,
            initialData: null,
            defaultType: type,
          })
        }
        onOpenEditExternalQuestion={(q, idx) =>
          setQuestionModal({
            open: true,
            mode: 'external',
            unitId: 0,
            editIndex: idx,
            initialData: q,
            defaultType: q.type || 'multiple_choice',
          })
        }
        onDeleteExternalQuestion={(idx) =>
          setExternalQuestions((prev) => prev.filter((_, i) => i !== idx))
        }
        externalPassage={externalPassage}
        setExternalPassage={setExternalPassage}
        hasPassage={hasPassage}
        setHasPassage={setHasPassage}
        deadline={deadline}
        setDeadline={setDeadline}
        note={note}
        setNote={setNote}
        onOpenAddUnitQuestion={(uId) =>
          setQuestionModal({
            open: true,
            mode: 'unit',
            unitId: uId,
            editIndex: -1,
            initialData: null,
            defaultType: 'multiple_choice',
          })
        }
        onOpenEditUnitQuestion={(uId, idx, q) =>
          setQuestionModal({
            open: true,
            mode: 'unit',
            unitId: uId,
            editIndex: idx,
            initialData: q,
            defaultType: 'multiple_choice',
          })
        }
        onDeleteUnitQuestion={handleDeleteUnitQuestion}
        onOpenBatchImport={(uId) => setBatchModal({ open: true, unitId: uId })}
        onSubmit={handleCreateAssignment}
      />

      <AssignmentSubmissionsModal
        assignment={inspectAssignment}
        submissions={inspectAssignment ? subsFor(inspectAssignment.id) : []}
        onClose={() => setInspectAssignment(null)}
      />

      <QuestionFormModal
        isOpen={questionModal.open}
        onClose={() => setQuestionModal((prev) => ({ ...prev, open: false }))}
        title={
          questionModal.editIndex >= 0
            ? '✏️ Chỉnh Sửa Câu Hỏi'
            : questionModal.mode === 'external'
            ? '➕ Thêm Câu Hỏi Đề Ngoài'
            : `➕ Soạn Câu Hỏi Mới (Unit ${questionModal.unitId})`
        }
        subtitle={
          questionModal.mode === 'external'
            ? 'Soạn câu hỏi tự do hoặc bài tập đọc hiểu không phụ thuộc vào SGK'
            : 'Bấm vào chữ A, B, C hoặc D để chọn đáp án đúng'
        }
        initialData={questionModal.initialData}
        defaultType={questionModal.defaultType}
        allowedTypes={
          questionModal.mode === 'external'
            ? ['multiple_choice', 'fill_blank', 'unscramble', 'sentence_completion']
            : ['multiple_choice']
        }
        allowSaveAndNext={questionModal.mode === 'unit'}
        onSave={handleSaveQuestionModal}
      />

      <BatchImportModal
        isOpen={batchModal.open}
        onClose={() => setBatchModal((prev) => ({ ...prev, open: false }))}
        parser={isExternalBatch ? parseBatchAny : parseBatchQuestions}
        onImport={handleBatchImport}
        placeholder={`Mẫu định dạng chuẩn (Thêm dấu * sau đáp án đúng):\n1. She usually ______ to school by bus.\nA. go\nB. goes*\nC. is going\nD. went\n\n(Hoặc có dòng "Đáp án: B" ở cuối mỗi câu)`}
        confirmText={(n) =>
          isExternalBatch
            ? `⚡ Thêm ${n} câu hỏi vào đề ngoài SGK`
            : `⚡ Thêm ${n} câu hỏi vào Unit ${batchModal.unitId}`
        }
      />
    </div>
  );
}
