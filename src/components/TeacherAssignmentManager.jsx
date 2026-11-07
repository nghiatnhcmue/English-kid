import { useState, useMemo, useEffect } from 'react';
import { getUnitRaw, listUnits } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { fetchSubmissions } from '../utils/syncService.js';
import { parseBatchQuestions, parseBatchAny } from '../utils/questionParser.js';
import { 
  BookOpen,
  Calendar, 
  Check, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Clock, 
  Copy, 
  Edit,
  ExternalLink, 
  FileText,
  Filter, 
  HelpCircle,
  Layers, 
  ListChecks, 
  Plus, 
  Send, 
  Sparkles,
  Trash2, 
  UserCheck, 
  Users,
  X
} from 'lucide-react';

export default function TeacherAssignmentManager() {
  const units = listUnits();
  const [assignments, setAssignments] = useState(() => store().getAssignments());
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'question_bank'
  const [bankUnitId, setBankUnitId] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectAssignment, setInspectAssignment] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedZaloId, setCopiedZaloId] = useState(null);

  // Question editing & batch modals
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [questionModalUnitId, setQuestionModalUnitId] = useState(1);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    answerIndex: 0,
    explain: '',
  });

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchModalUnitId, setBatchModalUnitId] = useState(1);
  const [batchRawText, setBatchRawText] = useState('');
  const [batchPreviewList, setBatchPreviewList] = useState([]);

  // Assignment Form State
  const [week, setWeek] = useState(1);
  const [title, setTitle] = useState('');
  const [targetClass, setTargetClass] = useState('all');
  const [unitId, setUnitId] = useState(1);
  const [scopeType, setScopeType] = useState('full_unit'); // 'full_unit' | 'skill' | 'custom_words' | 'custom_questions' | 'external_quiz'
  const [selectedSkill, setSelectedSkill] = useState('speaking');
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);
  const [questionFilter, setQuestionFilter] = useState('all'); // 'all' | 'custom' | 'textbook'
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [note, setNote] = useState('Các em hoàn thành trước hạn nộp và cố gắng đạt điểm 10 nhé!');

  // Đề bài tập tự do / Đề ngoài SGK (External Quiz)
  const [externalQuestions, setExternalQuestions] = useState([]);
  const [externalPassage, setExternalPassage] = useState({ title: '', content: '', translation: '' });
  const [hasPassage, setHasPassage] = useState(false);
  const [showExternalQuestionModal, setShowExternalQuestionModal] = useState(false);
  const [editingExternalIndex, setEditingExternalIndex] = useState(-1);
  const [externalQuestionForm, setExternalQuestionForm] = useState({
    type: 'multiple_choice',
    question: '',
    prompt: '',
    blankWord: '',
    correctSentence: '',
    correctAnswer: '',
    options: ['', '', '', ''],
    answerIndex: 0,
    explain: '',
  });

  // Bài nộp từ mọi máy học sinh (máy chủ) + bài nộp thử trên chính máy này
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

  const activeUnit = useMemo(() => (unitId > 0 ? getUnitRaw(unitId) : null), [unitId]);
  const bankUnit = useMemo(() => getUnitRaw(bankUnitId), [bankUnitId]);

  // Lấy câu hỏi hiện tại của Unit đang chọn trong form tạo bài
  const [unitQuestions, setUnitQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);

  const refreshUnitQuestions = (uId = unitId) => {
    if (!uId || uId <= 0) {
      setUnitQuestions([]);
      return;
    }
    const u = getUnitRaw(uId);
    const baseQuiz = u?.grammar?.quiz || [];
    const qList = store().getUnitQuestions(uId, baseQuiz);
    setUnitQuestions(qList);
  };

  const refreshBankQuestions = (uId = bankUnitId) => {
    const u = getUnitRaw(uId);
    const baseQuiz = u?.grammar?.quiz || [];
    const qList = store().getUnitQuestions(uId, baseQuiz);
    setBankQuestions(qList);
  };

  useEffect(() => {
    refreshUnitQuestions(unitId);
  }, [unitId]);

  useEffect(() => {
    refreshBankQuestions(bankUnitId);
  }, [bankUnitId]);

  const reloadAssignments = () => {
    setAssignments(store().getAssignments());
  };

  const handleOpenCreate = (prefillUnitId = null, prefillScope = null) => {
    const targetUnit = prefillUnitId !== null ? prefillUnitId : unitId;
    if (prefillUnitId !== null) setUnitId(prefillUnitId);
    if (prefillScope) setScopeType(prefillScope);

    if (prefillScope === 'external_quiz' || targetUnit === 0) {
      setTitle(`Bài tập Tuần ${week}: Đề luyện tập ngoài SGK`);
    } else {
      setTitle(`Bài tập Tuần ${week}: Ôn tập Unit ${targetUnit}`);
    }

    setSelectedWordIds([]);
    setSelectedQuestionIndices([]);
    setExternalQuestions([]);
    setExternalPassage({ title: '', content: '', translation: '' });
    setHasPassage(false);
    refreshUnitQuestions(targetUnit);
    setShowCreateModal(true);
  };

  const handleToggleWord = (wId) => {
    setSelectedWordIds((prev) =>
      prev.includes(wId) ? prev.filter((id) => id !== wId) : [...prev, wId]
    );
  };

  const handleToggleQuestion = (qIdx) => {
    setSelectedQuestionIndices((prev) =>
      prev.includes(qIdx) ? prev.filter((idx) => idx !== qIdx) : [...prev, qIdx]
    );
  };

  const handleSelectAllWords = () => {
    if (selectedWordIds.length === (activeUnit?.vocabularies?.length || 0)) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds((activeUnit?.vocabularies || []).map((v) => v.id));
    }
  };

  const handleSelectAllQuestions = () => {
    if (selectedQuestionIndices.length === unitQuestions.length) {
      setSelectedQuestionIndices([]);
    } else {
      setSelectedQuestionIndices(unitQuestions.map((_, i) => i));
    }
  };

  // ---- Quản lý câu hỏi Đề ngoài SGK (External Quiz Questions) ----
  const handleOpenAddExternalQuestion = (type = 'multiple_choice') => {
    setEditingExternalIndex(-1);
    setExternalQuestionForm({
      type,
      question: '',
      prompt: '',
      blankWord: '',
      correctSentence: '',
      correctAnswer: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      explain: '',
    });
    setShowExternalQuestionModal(true);
  };

  const handleOpenEditExternalQuestion = (q, idx) => {
    setEditingExternalIndex(idx);
    const opts = Array.isArray(q.options) ? [...q.options] : [];
    while (opts.length < 4) opts.push('');
    setExternalQuestionForm({
      type: q.type || (q.question?.includes('_') ? 'fill_blank' : 'multiple_choice'),
      question: q.question || '',
      prompt: q.prompt || '',
      blankWord: q.blankWord || '',
      correctSentence: q.correctSentence || '',
      correctAnswer: q.correctAnswer || '',
      options: opts,
      answerIndex: Number(q.answerIndex) || 0,
      explain: q.explain || '',
    });
    setShowExternalQuestionModal(true);
  };

  const handleSaveExternalQuestion = (e) => {
    e.preventDefault();
    const qType = externalQuestionForm.type || 'multiple_choice';

    let qText = externalQuestionForm.question.trim();
    if (qType === 'unscramble') {
      if (!externalQuestionForm.correctSentence.trim()) {
        alert('Vui lòng nhập câu hoàn chỉnh để hệ thống xáo trộn từ!');
        return;
      }
      if (!qText) {
        qText = externalQuestionForm.prompt.trim() || 'Sắp xếp các từ sau thành câu đúng ngữ pháp:';
      }
    } else if (qType === 'sentence_completion') {
      if (!externalQuestionForm.prompt.trim() && !qText) {
        alert('Vui lòng nhập vế đầu câu hoặc câu hỏi!');
        return;
      }
      if (!qText) {
        qText = externalQuestionForm.prompt.trim();
      }
      if (!externalQuestionForm.correctAnswer.trim() && !externalQuestionForm.options.some((o) => o.trim())) {
        alert('Vui lòng nhập vế hoàn thành đúng cho câu!');
        return;
      }
    } else if (qType === 'fill_blank') {
      if (!qText) {
        alert('Vui lòng nhập câu chứa chỗ trống!');
        return;
      }
      if (!externalQuestionForm.blankWord.trim() && !externalQuestionForm.options.some((o) => o.trim())) {
        alert('Vui lòng nhập từ cần điền đúng vào chỗ trống!');
        return;
      }
    } else {
      if (!qText) {
        alert('Vui lòng nhập nội dung câu hỏi!');
        return;
      }
      const filteredOptions = externalQuestionForm.options.map((o) => o.trim()).filter(Boolean);
      if (filteredOptions.length < 2) {
        alert('Vui lòng nhập ít nhất 2 phương án trả lời trắc nghiệm!');
        return;
      }
    }

    const filteredOptions = externalQuestionForm.options.map((o) => o.trim()).filter(Boolean);
    const blankWord = externalQuestionForm.blankWord.trim() || (filteredOptions[externalQuestionForm.answerIndex] || '');
    const correctSentence = externalQuestionForm.correctSentence.trim() || qText;
    const correctAnswer = externalQuestionForm.correctAnswer.trim() || blankWord;

    const newQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: qType,
      question: qText,
      prompt: externalQuestionForm.prompt.trim() || qText,
      blankWord,
      correctSentence,
      correctAnswer,
      scrambledWords: correctSentence ? correctSentence.split(/\s+/).filter(Boolean) : [],
      options: filteredOptions,
      answerIndex: Number(externalQuestionForm.answerIndex) || 0,
      explain: externalQuestionForm.explain.trim(),
      isCustom: true,
    };

    if (editingExternalIndex >= 0) {
      setExternalQuestions((prev) => {
        const copy = [...prev];
        copy[editingExternalIndex] = newQuestion;
        return copy;
      });
    } else {
      setExternalQuestions((prev) => [...prev, newQuestion]);
    }

    setShowExternalQuestionModal(false);
  };

  const handleDeleteExternalQuestion = (idx) => {
    setExternalQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // ================= TẠO BÀI TẬP =================
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài tập.');
      return;
    }

    if (scopeType === 'custom_words' && selectedWordIds.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 từ vựng để giao bài.');
      return;
    }

    if (scopeType === 'custom_questions' && selectedQuestionIndices.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 câu hỏi bài tập.');
      return;
    }

    if (scopeType === 'external_quiz' && externalQuestions.length === 0) {
      alert('Vui lòng soạn hoặc dán ít nhất 1 câu hỏi vào đề ngoài SGK.');
      return;
    }

    // Trích xuất các câu hỏi đã chọn thành mảng câu hỏi trọn vẹn
    let chosenQuestions = [];
    if (scopeType === 'external_quiz') {
      chosenQuestions = externalQuestions;
    } else if (scopeType === 'custom_questions') {
      chosenQuestions = selectedQuestionIndices
        .map((idx) => unitQuestions[idx])
        .filter(Boolean);
    }

    const created = store().saveAssignment({
      week: Number(week),
      title: title.trim(),
      targetClass,
      scopeType,
      unitId: scopeType === 'external_quiz' && unitId === 0 ? 0 : Number(unitId),
      selectedSkill,
      selectedWordIds,
      selectedQuestions: selectedQuestionIndices,
      questions: chosenQuestions, // Lưu trực tiếp danh sách câu hỏi
      passage: scopeType === 'external_quiz' && hasPassage && externalPassage.content.trim() ? externalPassage : null,
      deadline,
      note: note.trim(),
    });

    setShowCreateModal(false);
    reloadAssignments();
    setInspectAssignment(created);
  };

  const handleDeleteAssignment = (id) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa bài tập này?')) return;
    store().deleteAssignment(id);
    reloadAssignments();
    if (inspectAssignment?.id === id) setInspectAssignment(null);
  };

  // Helper sinh URL
  const getAssignmentUrl = (code) => {
    const origin = window.location.origin;
    return `${origin}/#/?assign=${encodeURIComponent(code)}`;
  };

  const copyLink = (code) => {
    const url = getAssignmentUrl(code);
    navigator.clipboard?.writeText(url);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyZaloMessage = (assign) => {
    const url = getAssignmentUrl(assign.code);
    const msg = `Kính gửi Quý Phụ huynh và các em học sinh lớp ${assign.targetClass === 'all' ? '6' : assign.targetClass},\nThầy/Cô gửi bài tập tuần này trên ứng dụng English-Kid:\n📌 Bài: ${assign.title}\n⏰ Hạn nộp: ${assign.deadline || 'Chủ Nhật tuần này'}\n📝 Lời dặn: ${assign.note || 'Các em cố gắng hoàn thành tốt nhé!'}\n👉 Link làm bài trực tiếp: ${url}\n(Bấm vào link, chọn tên mình và nhập mã PIN thầy cô đã phát là làm được ngay).\nChúc các em học tập vui vẻ!`;
    navigator.clipboard?.writeText(msg);
    setCopiedZaloId(assign.code);
    setTimeout(() => setCopiedZaloId(null), 2500);
  };

  // ================= SOẠN CÂU HỎI ĐƠN LẺ =================
  const handleOpenAddQuestion = (targetUnitId = unitId) => {
    setQuestionModalUnitId(targetUnitId);
    setEditingQuestionIndex(-1);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      explain: '',
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (targetUnitId, index, questionObj) => {
    setQuestionModalUnitId(targetUnitId);
    setEditingQuestionIndex(index);
    setQuestionForm({
      question: questionObj.question || '',
      options: [...(questionObj.options || ['', '', '', ''])],
      answerIndex: questionObj.answerIndex || 0,
      explain: questionObj.explain || '',
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (continueNext = false) => {
    if (!questionForm.question.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }
    const validOptions = questionForm.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      alert('Vui lòng nhập ít nhất 2 đáp án lựa chọn (A, B).');
      return;
    }
    // Bỏ ô trống thì vị trí đáp án đúng phải dời theo (vd bỏ trống B, đáp án đúng là C → thành B)
    const keptIdx = questionForm.options.map((o, i) => (o.trim() ? i : -1)).filter((i) => i >= 0);
    const remappedAnswer = keptIdx.indexOf(Number(questionForm.answerIndex));
    if (remappedAnswer < 0) {
      alert('Đáp án đúng đang là một ô trống. Hãy chọn lại đáp án đúng.');
      return;
    }

    const targetU = getUnitRaw(questionModalUnitId);
    const baseQuiz = targetU?.grammar?.quiz || [];

    const updatedList = store().saveUnitQuestion(
      questionModalUnitId,
      {
        question: questionForm.question.trim(),
        options: validOptions.map((o) => o.trim()),
        answerIndex: remappedAnswer,
        explain: questionForm.explain.trim(),
      },
      editingQuestionIndex,
      baseQuiz
    );

    // Cập nhật lại danh sách câu hỏi
    if (questionModalUnitId === unitId) {
      setUnitQuestions(updatedList);
      // Tự động tích chọn câu hỏi mới vừa tạo
      if (editingQuestionIndex === -1) {
        setSelectedQuestionIndices((prev) => [...prev, updatedList.length - 1]);
      }
    }
    if (questionModalUnitId === bankUnitId) {
      setBankQuestions(updatedList);
    }

    if (continueNext) {
      // Tiếp tục câu tiếp theo: reset form và giữ modal
      setEditingQuestionIndex(-1);
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        answerIndex: 0,
        explain: '',
      });
    } else {
      setShowQuestionModal(false);
    }
  };

  const handleDeleteQuestion = (targetUnitId, index) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi bài học?')) return;
    const targetU = getUnitRaw(targetUnitId);
    const baseQuiz = targetU?.grammar?.quiz || [];
    const updated = store().deleteUnitQuestion(targetUnitId, index, baseQuiz);

    if (targetUnitId === unitId) {
      setUnitQuestions(updated);
      setSelectedQuestionIndices((prev) =>
        prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
      );
    }
    if (targetUnitId === bankUnitId) {
      setBankQuestions(updated);
    }
  };

  // ================= DÁN HÀNG LOẠT TỪ WORD =================
  const handleOpenBatchModal = (targetUnitId = unitId) => {
    setBatchModalUnitId(targetUnitId);
    setBatchRawText('');
    setBatchPreviewList([]);
    setShowBatchModal(true);
  };

  const handleBatchTextChange = (text) => {
    setBatchRawText(text);
    if (batchModalUnitId === 0 || scopeType === 'external_quiz') {
      const parsed = parseBatchAny(text);
      setBatchPreviewList(parsed);
    } else {
      const parsed = parseBatchQuestions(text);
      setBatchPreviewList(parsed);
    }
  };

  const handleImportBatchQuestions = () => {
    if (batchPreviewList.length === 0) {
      alert('Chưa có câu hỏi hợp lệ nào được nhận diện từ văn bản.');
      return;
    }

    if (batchModalUnitId === 0 || scopeType === 'external_quiz') {
      setExternalQuestions((prev) => [...prev, ...batchPreviewList]);
      setShowBatchModal(false);
      alert(`🎉 Đã nhận diện và thêm thành công ${batchPreviewList.length} câu hỏi vào đề ngoài SGK!`);
      return;
    }

    const targetU = getUnitRaw(batchModalUnitId);
    const baseQuiz = targetU?.grammar?.quiz || [];
    const prevCount = store().getUnitQuestions(batchModalUnitId, baseQuiz).length;

    const updated = store().batchAddUnitQuestions(batchModalUnitId, batchPreviewList, baseQuiz);

    if (batchModalUnitId === unitId) {
      setUnitQuestions(updated);
      // Tự động tích chọn tất cả các câu vừa thêm
      const newIndices = [];
      for (let i = prevCount; i < updated.length; i++) {
        newIndices.push(i);
      }
      setSelectedQuestionIndices((prev) => [...prev, ...newIndices]);
    }
    if (batchModalUnitId === bankUnitId) {
      setBankQuestions(updated);
    }

    setShowBatchModal(false);
    alert(`🎉 Đã thêm thành công ${batchPreviewList.length} câu hỏi vào Unit ${batchModalUnitId}!`);
  };

  // Lọc câu hỏi theo tab bộ lọc
  const filteredUnitQuestions = useMemo(() => {
    return unitQuestions.map((q, idx) => ({ ...q, originalIndex: idx })).filter((q) => {
      if (questionFilter === 'custom') return q.isCustom;
      if (questionFilter === 'textbook') return !q.isCustom;
      return true;
    });
  }, [unitQuestions, questionFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* THANH ĐIỀU HƯỚNG TAB PHỤ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft">
        <div>
          <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
            Phân phối & Soạn câu hỏi
          </span>
          <h2 className="text-2xl font-black text-ink mt-1">📅 Quản Lý & Giao Bài Tập Cho Học Sinh</h2>
          <p className="text-sm font-bold text-ink-soft mt-0.5">
            Giao bài linh hoạt theo Unit hoặc theo câu hỏi trắc nghiệm tự soạn. Thầy/Cô có thể dán nhanh từ Word.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenAddQuestion(unitId)}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-mint px-4 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Soạn câu hỏi mới</span>
          </button>

          <button
            onClick={() => handleOpenCreate()}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-peach px-5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>+ Giao bài tập tuần</span>
          </button>
        </div>
      </div>

      {/* TABS LỰA CHỌN */}
      <div className="flex gap-2 border-b-2 border-banana-soft pb-2 overflow-x-auto">
        <button
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

      {/* ================= TAB 1: DANH SÁCH BÀI TẬP ĐÃ GIAO ================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="rounded-3xl bg-cream/70 p-10 text-center border-2 border-dashed border-banana-soft flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">📝</span>
              <h4 className="text-base font-black text-ink">Chưa có bài tập nào được giao</h4>
              <p className="text-xs font-bold text-ink-soft max-w-md">
                Bấm nút <strong>"+ Giao bài tập tuần"</strong> để tạo bài tập, tích chọn câu hỏi trắc nghiệm hoặc từ vựng và gửi link Zalo cho học sinh làm bài.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assign) => {
                const submissions = subsFor(assign.id);
                return (
                  <div
                    key={assign.id}
                    className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft flex flex-col justify-between hover:shadow-md transition-all gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
                              Tuần {assign.week}
                            </span>
                            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-black text-ink border border-banana-soft">
                              Lớp: {assign.targetClass === 'all' ? 'Tất cả các lớp' : assign.targetClass}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-ink mt-1.5">{assign.title}</h4>
                        </div>

                        <button
                          onClick={() => handleDeleteAssignment(assign.id)}
                          className="rounded-xl p-1.5 text-ink-soft hover:bg-peach-soft hover:text-peach-dark transition-all cursor-pointer"
                          title="Xóa bài tập này"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2.5 space-y-1 text-xs font-bold text-ink-soft bg-cream/60 p-3 rounded-2xl border border-banana-soft/60">
                        <p>
                          🎯 <strong>Phạm vi giao:</strong>{' '}
                          {assign.scopeType === 'full_unit' && `Trọn bộ Unit ${assign.unitId} (7 trạm + Thử thách)`}
                          {assign.scopeType === 'skill' && `Kỹ năng: ${assign.selectedSkill?.toUpperCase()} (Unit ${assign.unitId})`}
                          {assign.scopeType === 'custom_words' && `${assign.selectedWordIds?.length || 0} từ vựng chỉ định (Unit ${assign.unitId})`}
                          {assign.scopeType === 'custom_questions' && `${assign.questions?.length || assign.selectedQuestions?.length || 0} câu hỏi trắc nghiệm đã giao (Unit ${assign.unitId})`}
                          {assign.scopeType === 'external_quiz' && `🚀 Đề tự soạn ngoài SGK (${assign.questions?.length || 0} câu${assign.passage ? ' + Đoạn văn đọc hiểu' : ''})`}
                        </p>
                        <p>
                          ⏰ <strong>Hạn nộp:</strong> {assign.deadline || 'Không giới hạn'}
                        </p>
                        {assign.note && <p className="italic">💬 "{assign.note}"</p>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t border-banana-soft">
                      {/* Thống kê học sinh đã làm */}
                      <div className="flex items-center justify-between text-xs font-black text-ink">
                        <button
                          type="button"
                          onClick={() => setInspectAssignment(assign)}
                          className="flex items-center gap-1.5 text-mint-dark hover:underline cursor-pointer"
                        >
                          <UserCheck className="h-4 w-4" /> Đã nộp: {submissions.length} học sinh (Xem chi tiết ↵)
                        </button>
                        <span className="font-mono text-[11px] bg-banana-soft px-2 py-0.5 rounded-lg text-ink">
                          Mã: {assign.code}
                        </span>
                      </div>

                      {/* Các nút sao chép link / gửi Zalo */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => copyLink(assign.code)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-banana px-3 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{copiedId === assign.code ? '✓ Đã chép link' : 'Chép link bài'}</span>
                        </button>

                        <button
                          onClick={() => copyZaloMessage(assign)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-sky text-ink px-3 py-2 text-xs font-black shadow-[0_2px_0_var(--color-sky-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>{copiedZaloId === assign.code ? '✓ Đã chép tin Zalo' : 'Tin nhắn Zalo'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: NGÂN HÀNG CÂU HỎI 12 UNIT ================= */}
      {activeTab === 'question_bank' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-ink">Chọn Unit:</label>
              <select
                value={bankUnitId}
                onChange={(e) => setBankUnitId(Number(e.target.value))}
                className="rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    Unit {u.unitId}: {u.title}
                  </option>
                ))}
              </select>
              <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-black text-mint-dark">
                {bankQuestions.length} câu hỏi
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenBatchModal(bankUnitId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-banana px-3.5 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>⚡ Dán từ Word</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddQuestion(bankUnitId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-mint px-4 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Soạn câu hỏi</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreate(bankUnitId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-peach px-4 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Giao bài tập Unit này</span>
              </button>
            </div>
          </div>

          {/* Danh sách câu hỏi của Unit */}
          <div className="space-y-3">
            {bankQuestions.length === 0 ? (
              <div className="p-8 text-center bg-cream/50 rounded-2xl border border-dashed border-banana-soft">
                <p className="text-sm font-bold text-ink-soft">Unit này chưa có câu hỏi trắc nghiệm nào.</p>
                <button
                  onClick={() => handleOpenAddQuestion(bankUnitId)}
                  className="mt-2 text-xs font-black text-peach hover:underline"
                >
                  + Thêm câu hỏi đầu tiên
                </button>
              </div>
            ) : (
              bankQuestions.map((q, idx) => (
                <div key={idx} className="rounded-2xl bg-cream/60 p-4 border border-banana-soft flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-peach text-white text-xs font-black">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-black text-ink">{q.question}</p>
                        <span className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full ${q.isCustom ? 'bg-mint-soft text-mint-dark' : 'bg-sky-soft text-sky-dark'}`}>
                          {q.isCustom ? '✏️ Thầy/Cô tự soạn' : '📘 Chuẩn SGK'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(bankUnitId, idx, q)}
                        className="rounded-xl p-1.5 text-ink-soft hover:bg-banana-soft hover:text-ink cursor-pointer"
                        title="Sửa câu hỏi"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(bankUnitId, idx)}
                        className="rounded-xl p-1.5 text-peach-dark hover:bg-peach-soft cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 đáp án */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {(q.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
                          oIdx === q.answerIndex
                            ? 'bg-mint-soft text-mint-dark border-mint font-black'
                            : 'bg-white text-ink border-banana-soft/60'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.answerIndex ? '✓ (Đáp án đúng)' : ''}
                      </div>
                    ))}
                  </div>

                  {q.explain && (
                    <p className="text-[11px] font-bold text-ink-soft bg-banana-soft/40 p-2 rounded-xl">
                      💡 Giải thích: {q.explain}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO BÀI TẬP MỚI ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-peach flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-ink">🚀 Thiết Kế Bài Tập Tuần Cho Học Sinh</h3>
                <p className="text-xs font-bold text-ink-soft">
                  Thầy cô chọn tuần, lớp và tùy chọn nội dung giao bài linh hoạt.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Tuần học:</label>
                  <select
                    value={week}
                    onChange={(e) => {
                      setWeek(Number(e.target.value));
                      setTitle(`Bài tập Tuần ${e.target.value}: Ôn tập Unit ${unitId}`);
                    }}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Tuần {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-ink mb-1">Áp dụng cho Lớp:</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    <option value="all">Tất cả các lớp (Toàn khối 6)</option>
                    <option value="6A1">Lớp 6A1</option>
                    <option value="6A2">Lớp 6A2</option>
                    <option value="6A3">Lớp 6A3</option>
                    <option value="6A4">Lớp 6A4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-ink mb-1">Bài học (Unit):</label>
                  <select
                    value={unitId}
                    onChange={(e) => {
                      const newUId = Number(e.target.value);
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
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    <option value={0}>🌐 Đề tự do ngoài SGK (Không theo Unit)</option>
                    {units.map((u) => (
                      <option key={u.unitId} value={u.unitId}>
                        Unit {u.unitId}: {u.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Tiêu đề bài tập (*):</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              {/* LỰA CHỌN PHẠM VI GIAO BÀI */}
              <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft">
                <label className="block text-xs font-black text-ink mb-2">Hình thức giao bài tập:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'full_unit', label: '🌟 Trọn bộ Unit', desc: 'Đủ 7 trạm + Test' },
                    { id: 'skill', label: '🎯 Theo kỹ năng', desc: 'Chỉ định 1 kỹ năng' },
                    { id: 'custom_words', label: '📝 Chọn từ vựng', desc: 'Tích chọn vài từ' },
                    { id: 'custom_questions', label: '📐 Chọn câu hỏi', desc: 'Câu hỏi của Unit' },
                    { id: 'external_quiz', label: '🚀 Đề ngoài SGK', desc: 'Đề riêng, Word, đọc hiểu' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setScopeType(s.id);
                        if (s.id === 'external_quiz' && !title.includes('ngoài SGK')) {
                          setTitle(`Bài tập Tuần ${week}: Đề luyện tập ngoài SGK`);
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all cursor-pointer border ${
                        scopeType === s.id
                          ? 'bg-peach text-white border-peach-dark shadow-sm font-black'
                          : 'bg-white text-ink border-banana-soft/60 hover:bg-banana-soft/30 font-bold'
                      }`}
                    >
                      <span className="text-xs">{s.label}</span>
                      <span className="text-[10px] opacity-80">{s.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Nếu chọn Theo Kỹ Năng */}
                {scopeType === 'skill' && (
                  <div className="mt-3 pt-3 border-t border-banana-soft">
                    <label className="block text-xs font-black text-ink mb-1.5">Chọn kỹ năng cụ thể:</label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full rounded-xl bg-white px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                    >
                      <option value="speaking">🎙️ Luyện Nói & Chấm Điểm AI (Speaking Studio)</option>
                      <option value="listening">👂 Luyện Nghe & Điền Từ (Listening Station)</option>
                      <option value="pronunciation">🗣️ Luyện Phát Âm Cặp Âm (Pronunciation Station)</option>
                      <option value="grammar">📐 Bài Tập Trắc Nghiệm Ngữ Pháp (A Closer Look 2)</option>
                      <option value="reading">📖 Bài Tập Đọc Hiểu (Skills 1)</option>
                      <option value="writing">✍️ Luyện Viết Ghép Câu (Skills 2)</option>
                      <option value="mastery">🏆 Bài Kiểm Tra Thử Thách Tổng Hợp (Unit Mastery)</option>
                    </select>
                  </div>
                )}

                {/* Nếu chọn Tích chọn vài từ vựng */}
                {scopeType === 'custom_words' && (
                  <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-ink">
                        Tích chọn từ vựng cần giao ({selectedWordIds.length}/{activeUnit?.vocabularies?.length || 0}):
                      </span>
                      <button
                        type="button"
                        onClick={handleSelectAllWords}
                        className="text-xs font-black text-peach hover:underline cursor-pointer"
                      >
                        {selectedWordIds.length === activeUnit?.vocabularies?.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                      {(activeUnit?.vocabularies || []).map((v) => {
                        const checked = selectedWordIds.includes(v.id);
                        return (
                          <label
                            key={v.id}
                            className={`flex items-center gap-2 rounded-xl p-2 text-xs font-bold border cursor-pointer select-none transition-all ${
                              checked ? 'bg-mint-soft border-mint text-mint-dark font-black' : 'bg-white border-banana-soft text-ink'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleWord(v.id)}
                              className="rounded accent-mint"
                            />
                            {v.image ? (
                              <img
                                src={v.image}
                                alt={v.word}
                                className="h-5 w-5 shrink-0 object-contain rounded-sm"
                              />
                            ) : v.emoji ? (
                              <span>{v.emoji}</span>
                            ) : null}
                            <span>{v.word}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ================= NẾU CHỌN TÍCH CHỌN CÂU HỎI TRẮC NGHIỆM ================= */}
                {scopeType === 'custom_questions' && (
                  <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-3">
                    {/* Thanh công cụ quản lý câu hỏi trong modal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-banana-soft">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-ink">
                          Đã chọn: <strong className="text-peach-dark">{selectedQuestionIndices.length}</strong> / {unitQuestions.length} câu
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setQuestionFilter('all')}
                            className={`px-2 py-0.5 rounded-lg ${questionFilter === 'all' ? 'bg-peach text-white font-black' : 'bg-cream text-ink'}`}
                          >
                            Tất cả ({unitQuestions.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestionFilter('custom')}
                            className={`px-2 py-0.5 rounded-lg ${questionFilter === 'custom' ? 'bg-peach text-white font-black' : 'bg-cream text-ink'}`}
                          >
                            Tự soạn ({unitQuestions.filter((q) => q.isCustom).length})
                          </button>
                        </div>
                      </div>

                      {/* Các nút bấm thêm câu hỏi cực kỳ dễ dàng */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenAddQuestion(unitId)}
                          className="flex items-center gap-1 rounded-xl bg-mint px-3 py-1.5 text-xs font-black text-white shadow-xs hover:bg-mint-dark transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Soạn câu mới</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenBatchModal(unitId)}
                          className="flex items-center gap-1 rounded-xl bg-banana px-3 py-1.5 text-xs font-black text-ink shadow-xs hover:bg-banana-dark transition-all cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>⚡ Dán từ Word</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSelectAllQuestions}
                          className="text-xs font-black text-peach hover:underline cursor-pointer ml-1"
                        >
                          {selectedQuestionIndices.length === unitQuestions.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                        </button>
                      </div>
                    </div>

                    {/* Danh sách câu hỏi có thể tích chọn */}
                    <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                      {filteredUnitQuestions.length === 0 ? (
                        <div className="text-center p-6 bg-white rounded-2xl border border-dashed border-banana-soft">
                          <p className="text-xs font-bold text-ink-soft">Chưa có câu hỏi nào theo bộ lọc này.</p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddQuestion(unitId)}
                            className="mt-1 text-xs font-black text-mint-dark hover:underline"
                          >
                            + Soạn câu hỏi ngay
                          </button>
                        </div>
                      ) : (
                        filteredUnitQuestions.map((q) => {
                          const realIdx = q.originalIndex;
                          const checked = selectedQuestionIndices.includes(realIdx);
                          return (
                            <div
                              key={realIdx}
                              className={`rounded-2xl p-3 border-2 transition-all flex flex-col gap-2 ${
                                checked
                                  ? 'bg-mint-soft/60 border-mint text-mint-dark'
                                  : 'bg-white border-banana-soft text-ink hover:border-banana'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <label className="flex items-start gap-2.5 flex-1 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleQuestion(realIdx)}
                                    className="mt-1 rounded accent-mint h-4 w-4"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-black text-peach-dark text-xs">
                                        Câu {realIdx + 1}:
                                      </span>
                                      <span className={`text-[10px] font-black px-2 py-0.2 rounded-full ${q.isCustom ? 'bg-mint text-white' : 'bg-sky-soft text-sky-dark'}`}>
                                        {q.isCustom ? '✏️ Tự soạn' : '📘 SGK'}
                                      </span>
                                    </div>
                                    <p className="text-xs font-bold text-ink mt-0.5 leading-relaxed">
                                      {q.question}
                                    </p>
                                  </div>
                                </label>

                                {/* Nút sửa / xóa câu hỏi tự soạn */}
                                {q.isCustom && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditQuestion(unitId, realIdx, q)}
                                      className="rounded-lg p-1 text-ink-soft hover:bg-banana-soft hover:text-ink cursor-pointer"
                                      title="Sửa câu hỏi"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuestion(unitId, realIdx)}
                                      className="rounded-lg p-1 text-peach-dark hover:bg-peach-soft cursor-pointer"
                                      title="Xóa câu hỏi"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Hiển thị tóm tắt các đáp án */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pl-6">
                                {(q.options || []).map((opt, oIdx) => (
                                  <span
                                    key={oIdx}
                                    className={`truncate rounded-lg px-2 py-1 text-[11px] font-bold border ${
                                      oIdx === q.answerIndex
                                        ? 'bg-mint text-white border-mint-dark font-black'
                                        : 'bg-white/80 text-ink-soft border-banana-soft/60'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ================= NẾU CHỌN ĐỀ TỰ SOẠN NGOÀI SGK ================= */}
                {scopeType === 'external_quiz' && (
                  <div className="mt-3 pt-3 border-t border-banana-soft flex flex-col gap-4">
                    {/* Phần 1: Tùy chọn đoạn văn đọc hiểu ngoài */}
                    <div className="rounded-2xl bg-white p-3.5 border border-banana-soft flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hasPassage}
                            onChange={(e) => setHasPassage(e.target.checked)}
                            className="rounded accent-peach h-4 w-4"
                          />
                          <span className="text-xs font-black text-ink">
                            📖 Đề bài có kèm theo Đoạn văn Đọc hiểu riêng (Passage ngoài)
                          </span>
                        </label>
                        <span className="text-[11px] font-bold text-ink-soft">
                          (Dành cho đề đọc hiểu 5 - 10 câu)
                        </span>
                      </div>

                      {hasPassage && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-banana-soft/60 animate-in fade-in">
                          <div>
                            <label className="block text-[11px] font-black text-ink mb-1">
                              Tiêu đề đoạn văn đọc hiểu:
                            </label>
                            <input
                              type="text"
                              value={externalPassage.title}
                              onChange={(e) =>
                                setExternalPassage({ ...externalPassage, title: e.target.value })
                              }
                              placeholder="Ví dụ: A Visit to Cuc Phuong National Park"
                              className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-ink mb-1">
                              Nội dung đoạn văn tiếng Anh (*):
                            </label>
                            <textarea
                              rows={3}
                              value={externalPassage.content}
                              onChange={(e) =>
                                setExternalPassage({ ...externalPassage, content: e.target.value })
                              }
                              placeholder="Dán hoặc nhập đoạn văn đọc hiểu tiếng Anh vào đây..."
                              className="w-full rounded-xl bg-cream px-3 py-2 text-xs font-bold border border-banana-soft resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-ink mb-1">
                              Bản dịch tiếng Việt tham khảo (Tùy chọn):
                            </label>
                            <textarea
                              rows={2}
                              value={externalPassage.translation}
                              onChange={(e) =>
                                setExternalPassage({ ...externalPassage, translation: e.target.value })
                              }
                              placeholder="Bản dịch tiếng Việt để hỗ trợ học sinh khi cần..."
                              className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phần 2: Quản lý danh sách câu hỏi của Đề ngoài */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-banana-soft">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-ink">
                            Câu hỏi trong đề: <strong className="text-peach-dark">{externalQuestions.length}</strong> câu
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenAddExternalQuestion('multiple_choice')}
                            className="inline-flex items-center gap-1 rounded-xl bg-mint px-2.5 py-1.5 text-xs font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Trắc nghiệm</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAddExternalQuestion('fill_blank')}
                            className="inline-flex items-center gap-1 rounded-xl bg-sky px-2.5 py-1.5 text-xs font-black text-ink hover:bg-sky-dark transition-all cursor-pointer shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Điền khuyết</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAddExternalQuestion('unscramble')}
                            className="inline-flex items-center gap-1 rounded-xl bg-peach px-2.5 py-1.5 text-xs font-black text-white hover:bg-peach-dark transition-all cursor-pointer shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Sắp xếp từ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAddExternalQuestion('sentence_completion')}
                            className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-2.5 py-1.5 text-xs font-black text-white hover:bg-purple-700 transition-all cursor-pointer shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Viết tiếp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenBatchModal(0)}
                            className="inline-flex items-center gap-1 rounded-xl bg-banana px-2.5 py-1.5 text-xs font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-xs"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Dán từ Word</span>
                          </button>
                        </div>
                      </div>

                      {/* Danh sách câu hỏi */}
                      {externalQuestions.length === 0 ? (
                        <div className="rounded-2xl bg-white p-6 text-center border-2 border-dashed border-banana-soft flex flex-col items-center gap-2">
                          <span className="text-3xl">📝</span>
                          <p className="text-xs font-black text-ink">Đề ngoài SGK này chưa có câu hỏi nào</p>
                          <p className="text-[11px] font-bold text-ink-soft max-w-sm">
                            Thầy cô hãy bấm các nút bên trên để tạo câu hỏi trắc nghiệm, điền khuyết, sắp xếp từ hoặc dán nhanh đề bài từ Word/PDF.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                          {externalQuestions.map((q, idx) => {
                            const itemType = q.type || (q.question?.includes('_') ? 'fill_blank' : 'multiple_choice');
                            return (
                              <div
                                key={idx}
                                className="rounded-2xl bg-white p-3 border-2 border-banana-soft flex flex-col gap-2 hover:border-banana transition-all"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className="rounded-lg bg-peach text-white px-2 py-0.5 text-xs font-black shrink-0">
                                      Câu {idx + 1}
                                    </span>
                                    <span
                                      className={`rounded-lg px-2 py-0.5 text-[11px] font-black shrink-0 ${
                                        itemType === 'multiple_choice'
                                          ? 'bg-mint-soft text-mint-dark'
                                          : itemType === 'fill_blank'
                                          ? 'bg-sky-soft text-sky-dark'
                                          : itemType === 'unscramble'
                                          ? 'bg-peach-soft text-peach-dark'
                                          : 'bg-purple-100 text-purple-700'
                                      }`}
                                    >
                                      {itemType === 'multiple_choice'
                                        ? '🏷️ Trắc nghiệm'
                                        : itemType === 'fill_blank'
                                        ? '✏️ Điền khuyết'
                                        : itemType === 'unscramble'
                                        ? '🧩 Sắp xếp từ'
                                        : '✍️ Viết tiếp câu'}
                                    </span>
                                    <p className="text-xs font-black text-ink mt-0.5 leading-snug">
                                      {q.question}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditExternalQuestion(q, idx)}
                                      className="rounded-lg p-1 text-ink-soft hover:bg-banana-soft hover:text-ink cursor-pointer"
                                      title="Sửa câu hỏi này"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteExternalQuestion(idx)}
                                      className="rounded-lg p-1 text-peach-dark hover:bg-peach-soft cursor-pointer"
                                      title="Xóa câu hỏi này"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {itemType === 'multiple_choice' && Array.isArray(q.options) && q.options.length > 0 && (
                                  <div className="grid grid-cols-2 gap-1 pl-4 text-[11px] font-bold text-ink-soft">
                                    {q.options.map((opt, oIdx) => (
                                      <span
                                        key={oIdx}
                                        className={`truncate px-2 py-0.5 rounded-lg border ${
                                          oIdx === q.answerIndex
                                            ? 'bg-mint-soft text-mint-dark border-mint font-black'
                                            : 'bg-cream/50 border-banana-soft/60'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIdx)}. {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {itemType === 'fill_blank' && (
                                  <div className="text-[11px] font-bold text-ink pl-4 flex items-center gap-1.5">
                                    <span className="text-ink-soft">Từ điền đúng:</span>
                                    <span className="rounded bg-sky-soft text-sky-dark px-2 py-0.5 font-black">
                                      {q.blankWord || (q.options ? q.options[q.answerIndex] : 'Chưa nhập')}
                                    </span>
                                  </div>
                                )}

                                {itemType === 'unscramble' && (
                                  <div className="text-[11px] font-bold text-ink pl-4 flex items-center gap-1.5">
                                    <span className="text-ink-soft">Câu hoàn chỉnh:</span>
                                    <span className="text-peach-dark font-black">
                                      {q.correctSentence || q.question}
                                    </span>
                                  </div>
                                )}

                                {itemType === 'sentence_completion' && (
                                  <div className="text-[11px] font-bold text-ink pl-4 flex items-center gap-1.5">
                                    <span className="text-ink-soft">Vế hoàn thành:</span>
                                    <span className="rounded bg-purple-100 text-purple-700 px-2 py-0.5 font-black">
                                      {q.correctAnswer || q.blankWord || (q.options ? q.options[q.answerIndex] : 'Chưa nhập')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Hạn chót nộp bài (Deadline):</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Lời nhắn / Dặn dò của Thầy Cô:</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Các em nhớ làm cẩn thận để lấy điểm 10 nhé!"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-peach px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  🚀 Tạo & Giao bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL SOẠN / SỬA CÂU HỎI THỦ CÔNG ================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-mint flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-xl font-black text-ink">
                  {editingQuestionIndex >= 0 ? '✏️ Chỉnh Sửa Câu Hỏi' : '➕ Soạn Câu Hỏi Mới'}
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Thêm vào Unit {questionModalUnitId} · Bấm vào chữ A, B, C hoặc D để chọn đáp án đúng.
                </p>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {/* Nội dung câu hỏi */}
              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Nội dung câu hỏi (*):
                </label>
                <textarea
                  rows={2}
                  required
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="Ví dụ: She usually ______ (go) to school by bicycle."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft focus:border-mint focus:outline-none"
                />
              </div>

              {/* 4 Đáp án A, B, C, D */}
              <div>
                <label className="block text-xs font-black text-ink mb-2">
                  Các lựa chọn đáp án (Bấm chữ cái để chọn đáp án đúng):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => {
                    const isCorrect = questionForm.answerIndex === idx;
                    return (
                      <div
                        key={letter}
                        className={`flex items-center gap-2 rounded-2xl p-2 border-2 transition-all ${
                          isCorrect
                            ? 'bg-mint-soft border-mint text-mint-dark shadow-xs'
                            : 'bg-white border-banana-soft text-ink'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setQuestionForm({ ...questionForm, answerIndex: idx })}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                            isCorrect
                              ? 'bg-mint text-white shadow-sm'
                              : 'bg-cream text-ink hover:bg-banana'
                          }`}
                          title={`Chọn đáp án ${letter} là đáp án đúng`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={questionForm.options[idx] || ''}
                          onChange={(e) => {
                            const newOpts = [...questionForm.options];
                            newOpts[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOpts });
                          }}
                          placeholder={`Đáp án ${letter}...`}
                          className="w-full bg-transparent text-xs font-bold focus:outline-none"
                        />
                        {isCorrect && (
                          <span className="text-[10px] font-black text-mint-dark shrink-0 mr-1">
                            ✓ Đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lời giải thích */}
              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Lời giải thích / Ghi chú (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={questionForm.explain}
                  onChange={(e) => setQuestionForm({ ...questionForm, explain: e.target.value })}
                  placeholder="Ví dụ: Chủ ngữ ngôi thứ ba số ít thêm -es sau đuôi o."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-xs font-bold border border-banana-soft focus:border-mint focus:outline-none"
                />
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-between pt-3 border-t border-banana-soft mt-1">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <div className="flex items-center gap-2">
                  {editingQuestionIndex === -1 && (
                    <button
                      type="button"
                      onClick={() => handleSaveQuestion(true)}
                      className="rounded-xl bg-banana px-4 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      💾 Lưu & Soạn câu tiếp theo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSaveQuestion(false)}
                    className="rounded-xl bg-mint px-5 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    ✓ Lưu & Hoàn tất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DÁN NHANH HÀNG LOẠT TỪ WORD ================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-banana flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-xl font-black text-ink">⚡ Dán Nhanh Câu Hỏi Từ Word / Zalo</h3>
                <p className="text-xs font-bold text-ink-soft">
                  Thầy cô copy toàn bộ đề trắc nghiệm và dán vào đây, hệ thống sẽ tự phân tích từng câu hỏi!
                </p>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-ink">
                    Dán văn bản đề trắc nghiệm vào đây:
                  </label>
                  <span className="text-[11px] font-bold text-peach-dark">
                    Đã nhận diện: <strong>{batchPreviewList.length}</strong> câu hỏi
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={batchRawText}
                  onChange={(e) => handleBatchTextChange(e.target.value)}
                  placeholder={`Mẫu định dạng chuẩn (Thêm dấu * sau đáp án đúng):\n1. She usually ______ to school by bus.\nA. go\nB. goes*\nC. is going\nD. went\n\n2. Where do they play football?\nA. In the classroom\nB. In the yard*\nC. At hospital\nD. In the river\n\n(Hoặc có dòng "Đáp án: B" ở cuối mỗi câu)`}
                  className="w-full font-mono rounded-2xl bg-cream p-3 text-xs font-bold border-2 border-banana-soft focus:border-banana focus:outline-none"
                />
              </div>

              {/* Bản xem trước các câu nhận diện được */}
              {batchPreviewList.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-ink">
                    Bản xem trước câu hỏi ({batchPreviewList.length} câu):
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {batchPreviewList.map((q, qIdx) => (
                      <div key={qIdx} className="rounded-xl bg-cream/70 p-3 border border-banana-soft text-xs font-bold">
                        <p className="font-black text-ink mb-1">
                          <span className="text-peach-dark mr-1">Câu {qIdx + 1}:</span> {q.question}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-1">
                          {q.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                const nextList = [...batchPreviewList];
                                nextList[qIdx].answerIndex = oIdx;
                                setBatchPreviewList(nextList);
                              }}
                              className={`truncate rounded-lg px-2 py-1 text-[11px] border text-left cursor-pointer transition-all ${
                                oIdx === q.answerIndex
                                  ? 'bg-mint text-white border-mint-dark font-black'
                                  : 'bg-white text-ink border-banana-soft/60 hover:bg-cream'
                              }`}
                              title="Bấm để đặt làm đáp án đúng"
                            >
                              {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.answerIndex ? '✓' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút hành động */}
              <div className="flex items-center justify-between pt-3 border-t border-banana-soft mt-1">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  disabled={batchPreviewList.length === 0}
                  onClick={handleImportBatchQuestions}
                  className="flex items-center gap-1.5 rounded-2xl bg-mint px-5 py-2.5 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>⚡ Thêm {batchPreviewList.length} câu hỏi vào Unit ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM CHI TIẾT BÀI NỘP HỌC SINH ================= */}
      {inspectAssignment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-sky flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div>
                <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
                  Tuần {inspectAssignment.week}
                </span>
                <h3 className="text-xl font-black text-ink mt-1">
                  📊 Danh Sách Học Sinh Nộp Bài: {inspectAssignment.title}
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Mã bài: {inspectAssignment.code} · Hạn: {inspectAssignment.deadline || 'Không giới hạn'}
                </p>
              </div>
              <button
                onClick={() => setInspectAssignment(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {(() => {
                const subs = subsFor(inspectAssignment.id);
                if (subs.length === 0) {
                  return (
                    <div className="py-12 text-center flex flex-col items-center gap-2">
                      <span className="text-3xl">⏳</span>
                      <p className="text-sm font-black text-ink">Chưa có học sinh nào nộp bài tập này.</p>
                      <p className="text-xs font-bold text-ink-soft">
                        Thầy/Cô hãy bấm "Tin nhắn Zalo" hoặc "Chép link bài" để gửi cho các em nhé!
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-ink-soft px-3 py-1">
                      <span>Học sinh</span>
                      <span>Điểm & Số câu đúng</span>
                    </div>
                    {subs.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-2xl bg-cream/70 p-3 border border-banana-soft"
                      >
                        <div>
                          <p className="text-sm font-black text-ink">{s.studentName || 'Học sinh'}</p>
                          <p className="text-xs font-bold text-ink-soft">
                            Lớp: {s.studentClass || '6'} · {s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : 'Mới nộp'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded-xl bg-mint px-3 py-1 text-sm font-black text-white shadow-2xs">
                            {s.score}/10 điểm
                          </span>
                          <p className="text-[11px] font-bold text-ink-soft mt-0.5">
                            {s.correct}/{s.total} câu ({'⭐'.repeat(s.stars || 1)})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-banana-soft">
              <button
                type="button"
                onClick={() => setInspectAssignment(null)}
                className="rounded-xl bg-cream px-5 py-2 text-xs font-black text-ink hover:bg-banana-soft cursor-pointer"
              >
                Đóng ↵
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL SOẠN / SỬA CÂU HỎI ĐỀ NGOÀI SGK ================= */}
      {showExternalQuestionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-peach flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div>
                <h3 className="text-xl font-black text-ink">
                  {editingExternalIndex >= 0 ? '✏️ Chỉnh Sửa Câu Hỏi Đề Ngoài' : '➕ Thêm Câu Hỏi Đề Ngoài'}
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Soạn câu hỏi tự do hoặc bài tập đọc hiểu không phụ thuộc vào SGK
                </p>
              </div>
              <button
                onClick={() => setShowExternalQuestionModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thanh chuyển đổi 4 loại câu hỏi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-cream border border-banana-soft">
              <button
                type="button"
                onClick={() => setExternalQuestionForm((prev) => ({ ...prev, type: 'multiple_choice' }))}
                className={`rounded-xl py-2 px-2 text-xs font-black transition-all cursor-pointer ${
                  (externalQuestionForm.type || 'multiple_choice') === 'multiple_choice'
                    ? 'bg-mint text-white shadow-xs'
                    : 'text-ink-soft hover:bg-white'
                }`}
              >
                🏷️ Trắc nghiệm
              </button>
              <button
                type="button"
                onClick={() => setExternalQuestionForm((prev) => ({ ...prev, type: 'fill_blank' }))}
                className={`rounded-xl py-2 px-2 text-xs font-black transition-all cursor-pointer ${
                  externalQuestionForm.type === 'fill_blank'
                    ? 'bg-sky text-ink shadow-xs'
                    : 'text-ink-soft hover:bg-white'
                }`}
              >
                ✏️ Điền khuyết
              </button>
              <button
                type="button"
                onClick={() => setExternalQuestionForm((prev) => ({ ...prev, type: 'unscramble' }))}
                className={`rounded-xl py-2 px-2 text-xs font-black transition-all cursor-pointer ${
                  externalQuestionForm.type === 'unscramble'
                    ? 'bg-peach text-white shadow-xs'
                    : 'text-ink-soft hover:bg-white'
                }`}
              >
                🧩 Sắp xếp từ
              </button>
              <button
                type="button"
                onClick={() => setExternalQuestionForm((prev) => ({ ...prev, type: 'sentence_completion' }))}
                className={`rounded-xl py-2 px-2 text-xs font-black transition-all cursor-pointer ${
                  externalQuestionForm.type === 'sentence_completion'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-ink-soft hover:bg-white'
                }`}
              >
                ✍️ Viết tiếp câu
              </button>
            </div>

            <form onSubmit={handleSaveExternalQuestion} className="flex flex-col gap-3 overflow-y-auto pr-1">
              {/* DẠNG 1: TRẮC NGHIỆM */}
              {(!externalQuestionForm.type || externalQuestionForm.type === 'multiple_choice') && (
                <>
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Nội dung câu hỏi (*):
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={externalQuestionForm.question}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, question: e.target.value })}
                      placeholder="Ví dụ: Which country is famous for the Eiffel Tower?"
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {externalQuestionForm.options.map((opt, i) => (
                      <div key={i}>
                        <label className="block text-[11px] font-black text-ink mb-0.5">
                          Đáp án {String.fromCharCode(65 + i)}:
                        </label>
                        <input
                          type="text"
                          required={i < 2}
                          value={opt}
                          onChange={(e) => {
                            const next = [...externalQuestionForm.options];
                            next[i] = e.target.value;
                            setExternalQuestionForm({ ...externalQuestionForm, options: next });
                          }}
                          placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                          className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-ink mb-1">Đáp án đúng (*):</label>
                    <select
                      value={externalQuestionForm.answerIndex}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, answerIndex: Number(e.target.value) })}
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                    >
                      {externalQuestionForm.options.map((opt, i) => (
                        <option key={i} value={i}>
                          {String.fromCharCode(65 + i)}: {opt || `Đáp án ${String.fromCharCode(65 + i)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* DẠNG 2: ĐIỀN KHUYẾT */}
              {externalQuestionForm.type === 'fill_blank' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Câu chứa chỗ trống (*):
                    </label>
                    <input
                      type="text"
                      required
                      value={externalQuestionForm.question}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, question: e.target.value })}
                      placeholder="Ví dụ: Mount Everest is the ______ mountain in the world."
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Từ cần điền đúng vào chỗ trống (*):
                    </label>
                    <input
                      type="text"
                      required
                      value={externalQuestionForm.blankWord}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, blankWord: e.target.value })}
                      placeholder="Ví dụ: highest"
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-ink mb-1">
                      Các lựa chọn gợi ý (Tùy chọn - nếu để trống học sinh sẽ gõ trực tiếp):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {externalQuestionForm.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...externalQuestionForm.options];
                            next[i] = e.target.value;
                            setExternalQuestionForm({ ...externalQuestionForm, options: next });
                          }}
                          placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                          className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* DẠNG 3: SẮP XẾP TỪ */}
              {externalQuestionForm.type === 'unscramble' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Yêu cầu / Gợi ý tiếng Việt:
                    </label>
                    <input
                      type="text"
                      value={externalQuestionForm.prompt}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, prompt: e.target.value })}
                      placeholder="Ví dụ: Sắp xếp các từ để hoàn chỉnh câu:"
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Câu hoàn chỉnh đúng ngữ pháp (*):
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={externalQuestionForm.correctSentence}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, correctSentence: e.target.value })}
                      placeholder="Ví dụ: We visited our grandparents last weekend."
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft resize-none"
                    />
                    <p className="text-[11px] font-bold text-peach-dark mt-1">
                      🧩 Hệ thống sẽ tự động tách các từ và xáo trộn để học sinh chạm ghép lại.
                    </p>
                  </div>
                </>
              )}

              {/* DẠNG 4: VIẾT TIẾP HOÀN THÀNH CÂU */}
              {externalQuestionForm.type === 'sentence_completion' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Vế đầu câu / Câu mồi (*):
                    </label>
                    <input
                      type="text"
                      required
                      value={externalQuestionForm.prompt}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, prompt: e.target.value })}
                      placeholder="Ví dụ: If it rains tomorrow, we..."
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Vế hoàn thành đúng (*):
                    </label>
                    <input
                      type="text"
                      required
                      value={externalQuestionForm.correctAnswer}
                      onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, correctAnswer: e.target.value })}
                      placeholder="Ví dụ: will stay at home"
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-ink mb-1">
                      Các lựa chọn gợi ý (Tùy chọn):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {externalQuestionForm.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...externalQuestionForm.options];
                            next[i] = e.target.value;
                            setExternalQuestionForm({ ...externalQuestionForm, options: next });
                          }}
                          placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                          className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* GIẢI THÍCH CHUNG */}
              <div>
                <label className="block text-xs font-black text-ink mb-1">Giải thích / Căn cứ:</label>
                <input
                  type="text"
                  value={externalQuestionForm.explain}
                  onChange={(e) => setExternalQuestionForm({ ...externalQuestionForm, explain: e.target.value })}
                  placeholder="Ví dụ: Kiến thức thì hiện tại đơn / Dựa vào đoạn văn..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowExternalQuestionModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-peach px-5 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  {editingExternalIndex >= 0 ? '✓ Lưu thay đổi' : '+ Thêm vào đề'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
