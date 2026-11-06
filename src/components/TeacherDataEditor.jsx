import { useState, useMemo, useEffect } from 'react';
import { getUnit, listUnits } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { speak, getCloudTtsUrl } from '../utils/speech.js';
import { parseBatchQuestions, parseBatchWriting } from '../utils/questionParser.js';
import { 
  AlertCircle, 
  BookOpen, 
  Check, 
  CheckCircle2,
  ClipboardList,
  Code2, 
  Download, 
  FileEdit, 
  Headphones, 
  HelpCircle,
  Pencil, 
  Plus, 
  RefreshCw, 
  RotateCcw, 
  Save, 
  Sparkles,
  Trash2, 
  Upload, 
  Video, 
  Volume2, 
  Youtube 
} from 'lucide-react';

export default function TeacherDataEditor() {
  const units = listUnits();
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState('vocab'); // 'vocab' | 'videos' | 'grammar' | 'reading' | 'writing' | 'raw_json'

  // Load merged unit data
  const [refreshKey, setRefreshKey] = useState(0);
  const currentUnit = useMemo(() => getUnit(selectedUnitId), [selectedUnitId, refreshKey]);
  const isCustomized = useMemo(() => !!store().getCustomUnit(selectedUnitId), [selectedUnitId, refreshKey]);

  // Form states
  const [editingWord, setEditingWord] = useState(null); // null or word object
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [wordForm, setWordForm] = useState({
    id: '',
    word: '',
    phonetic: '',
    wordType: 'Danh từ',
    meaning: '',
    hint: '',
    exampleEn: '',
    exampleVi: '',
    emoji: '📝',
    audio: '',
  });

  // Video form states
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videoForm, setVideoForm] = useState({
    id: '',
    title: '',
    url: '',
    channel: 'Tiếng Anh 6 Thầy Cô',
    duration: '10:00',
    skill: 'Từ vựng & Phát âm',
    description: '',
  });

  // Grammar form states
  const [showAddGrammarQuestionModal, setShowAddGrammarQuestionModal] = useState(false);
  const [grammarQuestionForm, setGrammarQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    answerIndex: 0,
    explain: '',
  });

  // Unit modal states (Tạo / Sửa Unit mới)
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unitId: 13,
    titleEn: '',
    titleVi: '',
    topic: '',
    emoji: '🤖',
    color: '#FFC83D',
    description: '',
  });

  // Reading comprehension states
  const [passageText, setPassageText] = useState('');
  const [passageTitle, setPassageTitle] = useState('');
  const [passageTranslation, setPassageTranslation] = useState('');
  const [showReadingQuestionModal, setShowReadingQuestionModal] = useState(false);
  const [editingReadingQuestionIndex, setEditingReadingQuestionIndex] = useState(-1);
  const [readingQuestionForm, setReadingQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    answerIndex: 0,
    explain: '',
  });

  // Batch reading questions import modal
  const [showBatchReadingModal, setShowBatchReadingModal] = useState(false);
  const [batchReadingText, setBatchReadingText] = useState('');
  const [batchReadingPreview, setBatchReadingPreview] = useState([]);

  // Writing & Fill-in-the-blank states
  const [showWritingModal, setShowWritingModal] = useState(false);
  const [editingWritingIndex, setEditingWritingIndex] = useState(-1);
  const [writingForm, setWritingForm] = useState({
    type: 'unscramble', // 'unscramble' | 'fill_blank'
    sentence: '',
    correctSentence: '',
    blankWord: '',
    options: ['', '', '', ''],
    meaningVi: '',
    hint: '',
  });

  // Batch writing import modal
  const [showBatchWritingModal, setShowBatchWritingModal] = useState(false);
  const [batchWritingText, setBatchWritingText] = useState('');
  const [batchWritingPreview, setBatchWritingPreview] = useState([]);

  // Lấy danh sách câu viết chuẩn hóa
  const writingData = useMemo(() => {
    return store().getUnitWriting(selectedUnitId, currentUnit?.writing);
  }, [selectedUnitId, currentUnit?.writing, refreshKey]);

  const writingItems = useMemo(() => {
    return writingData?.items || [];
  }, [writingData]);

  // Đồng bộ passage khi đổi Unit
  useEffect(() => {
    setPassageText(currentUnit?.reading?.passage || '');
    setPassageTitle(currentUnit?.reading?.title || '');
    setPassageTranslation(currentUnit?.reading?.translation || '');
  }, [selectedUnitId, currentUnit?.reading?.passage, currentUnit?.reading?.title, currentUnit?.reading?.translation]);

  // Raw JSON state
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [jsonSuccess, setJsonSuccess] = useState(false);

  // Status banners
  const [notify, setNotify] = useState(null);

  const showNotification = (msg, tone = 'mint') => {
    setNotify({ msg, tone });
    setTimeout(() => setNotify(null), 3000);
  };

  const reloadData = () => {
    setRefreshKey((k) => k + 1);
  };

  // ---- THÊM / SỬA / XÓA UNIT ----
  const handleOpenCreateUnit = () => {
    const existingIds = units.map((u) => u.unitId);
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 13;
    setUnitForm({
      unitId: nextId,
      titleEn: '',
      titleVi: '',
      topic: '',
      emoji: '🤖',
      color: '#FFC83D',
      description: '',
    });
    setIsEditingUnit(false);
    setShowUnitModal(true);
  };

  const handleOpenEditUnit = (unit) => {
    setUnitForm({
      unitId: unit.unitId,
      titleEn: unit.titleEn || unit.title || '',
      titleVi: unit.titleVi || '',
      topic: unit.topic || '',
      emoji: unit.emoji || '📘',
      color: unit.color || '#FFC83D',
      description: unit.description || '',
    });
    setIsEditingUnit(true);
    setShowUnitModal(true);
  };

  const handleSaveUnit = (e) => {
    e.preventDefault();
    if (!unitForm.titleEn.trim() || !unitForm.titleVi.trim()) {
      showNotification('Vui lòng nhập đầy đủ tiêu đề Tiếng Anh và Tiếng Việt cho Unit!', 'peach');
      return;
    }
    const saved = store().saveCreatedUnit({
      ...unitForm,
      unitId: Number(unitForm.unitId),
    });
    setSelectedUnitId(saved.unitId);
    setShowUnitModal(false);
    reloadData();
    showNotification(
      isEditingUnit
        ? `✅ Đã cập nhật thành công thông tin Unit ${saved.unitId}!`
        : `🎉 Đã tạo thành công Unit ${saved.unitId}: ${saved.titleEn}! Thầy cô có thể thêm từ vựng, video và bài tập ngay bây giờ.`,
      'mint'
    );
  };

  const handleDeleteCustomUnit = (unitId, unitTitle) => {
    if (
      window.confirm(
        `Thầy cô có chắc chắn muốn xóa vĩnh viễn Unit ${unitId} (${unitTitle || 'Tự tạo'}) không?\n\nToàn bộ từ vựng, video bài giảng và câu hỏi trắc nghiệm của Unit này sẽ bị xóa.`
      )
    ) {
      store().deleteCreatedUnit(unitId);
      const remaining = listUnits();
      setSelectedUnitId(remaining[0]?.unitId || 1);
      reloadData();
      showNotification(`🗑️ Đã xóa thành công Unit ${unitId}!`, 'mint');
    }
  };

  // ---- BÀI ĐỌC HIỂU (READING) ----
  const handleSaveReadingPassage = () => {
    store().saveUnitReadingPassage(
      selectedUnitId,
      {
        title: passageTitle,
        passage: passageText,
        translation: passageTranslation,
      },
      currentUnit?.reading
    );
    reloadData();
    showNotification('💾 Đã lưu thành công đoạn văn đọc hiểu!', 'mint');
  };

  const handleOpenAddReadingQuestion = () => {
    setReadingQuestionForm({
      question: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      explain: '',
    });
    setEditingReadingQuestionIndex(-1);
    setShowReadingQuestionModal(true);
  };

  const handleOpenEditReadingQuestion = (q, idx) => {
    const opts = Array.isArray(q.options) ? [...q.options] : [];
    while (opts.length < 4) opts.push('');
    setReadingQuestionForm({
      question: q.question || '',
      options: opts,
      answerIndex: Number(q.answerIndex) || 0,
      explain: q.explain || '',
    });
    setEditingReadingQuestionIndex(idx);
    setShowReadingQuestionModal(true);
  };

  const handleSaveReadingQuestion = (e) => {
    e.preventDefault();
    if (!readingQuestionForm.question.trim()) {
      showNotification('Vui lòng nhập nội dung câu hỏi!', 'peach');
      return;
    }
    const filteredOptions = readingQuestionForm.options.map((o) => o.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      showNotification('Vui lòng nhập ít nhất 2 phương án trả lời!', 'peach');
      return;
    }
    store().saveReadingQuestion(
      selectedUnitId,
      {
        ...readingQuestionForm,
        options: filteredOptions,
      },
      editingReadingQuestionIndex,
      currentUnit?.reading
    );
    setShowReadingQuestionModal(false);
    reloadData();
    showNotification(
      editingReadingQuestionIndex >= 0
        ? '✅ Đã cập nhật câu hỏi đọc hiểu!'
        : '🎉 Đã thêm câu hỏi đọc hiểu mới!',
      'mint'
    );
  };

  const handleDeleteReadingQuestion = (idx) => {
    if (window.confirm('Thầy cô có chắc chắn muốn xóa câu hỏi đọc hiểu này?')) {
      store().deleteReadingQuestion(selectedUnitId, idx, currentUnit?.reading);
      reloadData();
      showNotification('🗑️ Đã xóa câu hỏi đọc hiểu!', 'mint');
    }
  };

  const handleOpenBatchReadingModal = () => {
    setBatchReadingText('');
    setBatchReadingPreview([]);
    setShowBatchReadingModal(true);
  };

  const handlePreviewBatchReading = () => {
    const parsed = parseBatchQuestions(batchReadingText);
    setBatchReadingPreview(parsed);
  };

  const handleApplyBatchReading = () => {
    const questionsToImport = batchReadingPreview.length > 0
      ? batchReadingPreview
      : parseBatchQuestions(batchReadingText);

    if (!questionsToImport.length) {
      showNotification('Không tìm thấy câu hỏi hợp lệ trong văn bản dán vào!', 'peach');
      return;
    }

    store().batchAddReadingQuestions(selectedUnitId, questionsToImport, currentUnit?.reading);
    setShowBatchReadingModal(false);
    reloadData();
    showNotification(`🎉 Đã thêm thành công ${questionsToImport.length} câu hỏi đọc hiểu vào bài!`, 'mint');
  };

  // ---- BÀI TẬP VIẾT CÂU & ĐIỀN KHUYẾT (WRITING & CLOZE) ----
  const handleOpenAddWriting = (type = 'unscramble') => {
    setWritingForm({
      type,
      sentence: '',
      correctSentence: '',
      blankWord: '',
      options: ['', '', '', ''],
      meaningVi: '',
      hint: '',
    });
    setEditingWritingIndex(-1);
    setShowWritingModal(true);
  };

  const handleOpenEditWriting = (item, idx) => {
    const opts = Array.isArray(item.options) ? [...item.options] : [];
    while (opts.length < 4) opts.push('');
    setWritingForm({
      type: item.type || 'unscramble',
      sentence: item.sentence || item.correctSentence || '',
      correctSentence: item.correctSentence || item.sentence || '',
      blankWord: item.blankWord || '',
      options: opts,
      meaningVi: item.meaningVi || '',
      hint: item.hint || '',
    });
    setEditingWritingIndex(idx);
    setShowWritingModal(true);
  };

  const handleSaveWritingItem = (e) => {
    e.preventDefault();
    const isFill = writingForm.type === 'fill_blank';
    const mainSentence = isFill ? writingForm.sentence.trim() : writingForm.correctSentence.trim();
    if (!mainSentence) {
      showNotification(isFill ? 'Vui lòng nhập câu có chỗ trống!' : 'Vui lòng nhập câu tiếng Anh hoàn chỉnh!', 'peach');
      return;
    }
    if (isFill && !writingForm.blankWord.trim()) {
      showNotification('Vui lòng nhập từ cần điền đúng vào chỗ trống!', 'peach');
      return;
    }

    const filteredOptions = writingForm.options.map((o) => o.trim()).filter(Boolean);
    if (isFill && writingForm.blankWord.trim() && !filteredOptions.includes(writingForm.blankWord.trim())) {
      filteredOptions.unshift(writingForm.blankWord.trim());
    }

    store().saveWritingItem(
      selectedUnitId,
      {
        ...writingForm,
        sentence: mainSentence,
        correctSentence: isFill ? mainSentence.replace(/_{2,}/g, writingForm.blankWord.trim()).replace(/\[|\]/g, '') : mainSentence,
        options: filteredOptions,
      },
      editingWritingIndex,
      currentUnit?.writing
    );

    setShowWritingModal(false);
    reloadData();
    showNotification(
      editingWritingIndex >= 0
        ? '✅ Đã cập nhật bài tập viết / điền khuyết!'
        : '🎉 Đã thêm bài tập viết / điền khuyết mới!',
      'mint'
    );
  };

  const handleDeleteWritingItem = (idx) => {
    if (window.confirm('Thầy cô có chắc chắn muốn xóa bài tập này?')) {
      store().deleteWritingItem(selectedUnitId, idx, currentUnit?.writing);
      reloadData();
      showNotification('🗑️ Đã xóa bài tập viết!', 'mint');
    }
  };

  const handleOpenBatchWritingModal = () => {
    setBatchWritingText('');
    setBatchWritingPreview([]);
    setShowBatchWritingModal(true);
  };

  const handlePreviewBatchWriting = () => {
    const parsed = parseBatchWriting(batchWritingText);
    setBatchWritingPreview(parsed);
  };

  const handleApplyBatchWriting = () => {
    const itemsToImport = batchWritingPreview.length > 0
      ? batchWritingPreview
      : parseBatchWriting(batchWritingText);

    if (!itemsToImport.length) {
      showNotification('Không tìm thấy câu hợp lệ trong văn bản dán vào!', 'peach');
      return;
    }

    store().batchAddWritingItems(selectedUnitId, itemsToImport, currentUnit?.writing);
    setShowBatchWritingModal(false);
    reloadData();
    showNotification(`🎉 Đã thêm thành công ${itemsToImport.length} bài tập viết vào Unit!`, 'mint');
  };

  // ---- TỪ VỰNG ----
  const handleOpenAddWord = () => {
    setWordForm({
      id: `u${selectedUnitId}_custom_${Date.now().toString().slice(-4)}`,
      word: '',
      phonetic: '',
      wordType: 'Danh từ',
      meaning: '',
      hint: '',
      exampleEn: '',
      exampleVi: '',
      image: '',
      emoji: '',
      audio: '',
    });
    setEditingWord(null);
    setShowAddWordModal(true);
  };

  const handleEditWord = (w) => {
    setEditingWord(w);
    setWordForm({
      ...w,
      image: w.image || '',
      emoji: w.emoji || '',
    });
    setShowAddWordModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new globalThis.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/webp', 0.85);
        setWordForm((prev) => ({
          ...prev,
          image: compressed,
          emoji: '',
        }));
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWord = (e) => {
    e.preventDefault();
    if (!wordForm.word.trim() || !wordForm.meaning.trim()) {
      alert('Vui lòng nhập từ tiếng Anh và nghĩa tiếng Việt.');
      return;
    }

    const currentVocab = [...(currentUnit?.vocabularies || [])];
    const cleanWord = {
      ...wordForm,
      word: wordForm.word.trim(),
      phonetic: wordForm.phonetic.trim()
        ? wordForm.phonetic.startsWith('/')
          ? wordForm.phonetic.trim()
          : `/${wordForm.phonetic.trim()}/`
        : `/${wordForm.word.trim().toLowerCase()}/`,
      meaning: wordForm.meaning.trim(),
      image: wordForm.image?.trim() || '',
      emoji: wordForm.emoji?.trim() || '',
      exampleEn: wordForm.exampleEn.trim() || `${wordForm.word.trim()} is very interesting.`,
      exampleVi: wordForm.exampleVi.trim() || `${wordForm.meaning.trim()} rất thú vị.`,
      audio: wordForm.audio.trim() || getCloudTtsUrl(wordForm.word.trim(), 'en-GB'),
      audioExample: `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-GB&client=tw-ob&q=${encodeURIComponent(
        wordForm.exampleEn.trim() || `${wordForm.word.trim()} is very interesting.`
      )}`,
    };

    if (editingWord) {
      const idx = currentVocab.findIndex((v) => v.id === editingWord.id);
      if (idx >= 0) currentVocab[idx] = cleanWord;
    } else {
      currentVocab.push(cleanWord);
    }

    store().saveCustomUnit(selectedUnitId, { vocabularies: currentVocab });
    setShowAddWordModal(false);
    reloadData();
    showNotification(`Đã lưu từ vựng "${cleanWord.word}" thành công!`);
  };

  const handleDeleteWord = (wordId) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa từ vựng này khỏi bài học?')) return;
    const currentVocab = (currentUnit?.vocabularies || []).filter((v) => v.id !== wordId);
    store().saveCustomUnit(selectedUnitId, { vocabularies: currentVocab });
    reloadData();
    showNotification('Đã xóa từ vựng thành công!', 'peach');
  };

  // ---- VIDEO BÀI GIẢNG ----
  const handleOpenAddVideo = () => {
    setVideoForm({
      id: `vid_${Date.now()}`,
      title: '',
      url: '',
      channel: 'Tiếng Anh 6 - Thầy Cô',
      duration: '10:00',
      skill: 'Toàn diện',
      description: '',
    });
    setShowAddVideoModal(true);
  };

  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.url.trim()) {
      alert('Vui lòng nhập tiêu đề và đường link YouTube.');
      return;
    }
    const currentVideos = [...(currentUnit?.videos || [])];
    currentVideos.push(videoForm);
    store().saveCustomUnit(selectedUnitId, { videos: currentVideos });
    setShowAddVideoModal(false);
    reloadData();
    showNotification(`Đã thêm video bài giảng mới!`);
  };

  const handleDeleteVideo = (vidId) => {
    if (!window.confirm('Thầy/Cô có chắc muốn xóa video này?')) return;
    const currentVideos = (currentUnit?.videos || []).filter((v) => v.id !== vidId);
    store().saveCustomUnit(selectedUnitId, { videos: currentVideos });
    reloadData();
    showNotification('Đã xóa video khỏi bài học.', 'peach');
  };

  // ---- NGỮ PHÁP (GRAMMAR QUIZ) ----
  const handleOpenAddGrammarQuestion = () => {
    setGrammarQuestionForm({
      question: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      explain: '',
    });
    setShowAddGrammarQuestionModal(true);
  };

  const handleSaveGrammarQuestion = (e) => {
    e.preventDefault();
    if (!grammarQuestionForm.question.trim() || grammarQuestionForm.options.some((o) => !o.trim())) {
      alert('Vui lòng nhập câu hỏi và đủ 4 lựa chọn đáp án.');
      return;
    }

    const currentGrammar = { ...(currentUnit?.grammar || {}) };
    const currentQuiz = [...(currentGrammar.quiz || [])];
    currentQuiz.push({
      question: grammarQuestionForm.question.trim(),
      options: grammarQuestionForm.options.map((o) => o.trim()),
      answerIndex: Number(grammarQuestionForm.answerIndex) || 0,
      explain: grammarQuestionForm.explain.trim() || 'Áp dụng quy tắc ngữ pháp bài học.',
    });

    currentGrammar.quiz = currentQuiz;
    store().saveCustomUnit(selectedUnitId, { grammar: currentGrammar });
    setShowAddGrammarQuestionModal(false);
    reloadData();
    showNotification('Đã thêm câu hỏi trắc nghiệm ngữ pháp!');
  };

  const handleDeleteGrammarQuestion = (index) => {
    if (!window.confirm('Xóa câu hỏi trắc nghiệm này?')) return;
    const currentGrammar = { ...(currentUnit?.grammar || {}) };
    const currentQuiz = (currentGrammar.quiz || []).filter((_, i) => i !== index);
    currentGrammar.quiz = currentQuiz;
    store().saveCustomUnit(selectedUnitId, { grammar: currentGrammar });
    reloadData();
    showNotification('Đã xóa câu hỏi ngữ pháp.', 'peach');
  };

  // ---- RAW JSON EDITOR ----
  const handleSwitchToJson = () => {
    setActiveSubTab('raw_json');
    setRawJsonText(JSON.stringify(currentUnit, null, 2));
    setJsonError(null);
  };

  const handleSaveRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Dữ liệu JSON phải là một đối tượng hợp lệ.');
      }
      store().saveCustomUnit(selectedUnitId, parsed);
      setJsonError(null);
      setJsonSuccess(true);
      setTimeout(() => setJsonSuccess(false), 2500);
      reloadData();
      showNotification('Đã lưu cấu trúc JSON tùy biến thành công!');
    } catch (err) {
      setJsonError(`Lỗi cú pháp JSON: ${err.message}`);
    }
  };

  // Khôi phục bài học gốc
  const handleResetUnit = () => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn KHÔI PHỤC Unit ${selectedUnitId} về dữ liệu gốc SGK? Các từ và bài tập thầy/cô tự thêm ở Unit này sẽ được xóa.`)) {
      store().resetUnit(selectedUnitId);
      reloadData();
      showNotification(`Đã khôi phục Unit ${selectedUnitId} về nguyên bản SGK!`);
    }
  };

  // Xuất file JSON
  const handleExportUnitJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUnit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `unit${selectedUnitId}_custom.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Thông báo thao tác */}
      {notify && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-sm font-black shadow-md transition-all ${
            notify.tone === 'mint' ? 'bg-mint text-white' : 'bg-peach text-white'
          }`}
        >
          <span>✓ {notify.msg}</span>
          <button onClick={() => setNotify(null)} className="opacity-75 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Thanh chọn Unit & Trạng thái tùy biến */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-base font-black text-ink whitespace-nowrap">Chọn Unit cần chỉnh sửa:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => {
                setSelectedUnitId(Number(e.target.value));
                setJsonError(null);
              }}
              className="rounded-2xl bg-cream px-4 py-2.5 text-base font-black text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.unitId} value={u.unitId}>
                  Unit {u.unitId}: {u.title || u.titleEn} ({u.titleVi}) {u.isCustomUnit ? '🌟 [Tự tạo]' : ''}
                </option>
              ))}
            </select>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
              currentUnit?.isCustomUnit
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : isCustomized
                ? 'bg-peach text-white shadow-xs'
                : 'bg-mint-soft text-mint-dark'
            }`}
          >
            {currentUnit?.isCustomUnit
              ? '🌟 Unit Thầy Cô tự tạo'
              : isCustomized
              ? '✏️ Đã có dữ liệu tùy biến riêng'
              : '📖 Dữ liệu gốc SGK'}
          </span>

          {/* Các nút thao tác với Unit: Thêm / Sửa / Xóa */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenCreateUnit}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-3.5 py-2 text-xs sm:text-sm font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-[0_3px_0_#58b292] active:translate-y-0.5 active:shadow-none"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Unit Mới</span>
            </button>

            {currentUnit?.isCustomUnit && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenEditUnit(currentUnit)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-banana px-3 py-2 text-xs sm:text-sm font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-xs"
                  title="Sửa tên, biểu tượng, mô tả của Unit này"
                >
                  <FileEdit className="h-4 w-4" />
                  <span>Sửa Unit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomUnit(currentUnit.unitId, currentUnit.titleEn || currentUnit.title)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-soft px-3 py-2 text-xs sm:text-sm font-black text-rose-700 hover:bg-rose-500 hover:text-white transition-all cursor-pointer border border-rose-200"
                  title="Xóa Unit tự tạo này"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa Unit</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Các nút thao tác nhanh: Tải JSON / Khôi phục */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportUnitJson}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-cream px-3.5 py-2 text-xs font-black text-ink hover:bg-banana-soft transition-all cursor-pointer border border-banana-soft"
          >
            <Download className="h-4 w-4 text-sky-dark" />
            <span>Tải JSON Unit</span>
          </button>

          {!currentUnit?.isCustomUnit && isCustomized && (
            <button
              onClick={handleResetUnit}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-peach-soft px-3.5 py-2 text-xs font-black text-peach-dark hover:bg-peach hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Khôi phục SGK gốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Thanh tab các phần nội dung của Unit */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'vocab', label: `Từ vựng (${currentUnit?.vocabularies?.length || 0})`, icon: '📝' },
          { id: 'videos', label: `Video bài giảng (${currentUnit?.videos?.length || 0})`, icon: '🎬' },
          { id: 'grammar', label: `Ngữ pháp & Trắc nghiệm (${currentUnit?.grammar?.quiz?.length || 0})`, icon: '📐' },
          { id: 'reading', label: `Bài Đọc hiểu (${currentUnit?.reading?.questions?.length || 0} câu)`, icon: '📖' },
          { id: 'writing', label: `Bài Viết & Điền khuyết (${writingItems.length} câu)`, icon: '✍️' },
          { id: 'raw_json', label: 'Chuyên gia: Soạn JSON thô', icon: '💻' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'raw_json') handleSwitchToJson();
              else setActiveSubTab(tab.id);
            }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-banana text-ink shadow-[0_3px_0_var(--color-banana-dark)] scale-[1.02]'
                : 'bg-white text-ink-soft hover:bg-cream border border-banana-soft/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: TỪ VỰNG ================= */}
      {activeSubTab === 'vocab' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
            <div>
              <h3 className="text-xl font-black text-ink">
                📚 Danh sách Từ vựng Unit {selectedUnitId} ({currentUnit?.vocabularies?.length || 0} từ)
              </h3>
              <p className="text-xs font-bold text-ink-soft mt-0.5">
                Thầy cô có thể thêm từ vựng mới, sửa nghĩa, câu ví dụ hoặc âm thanh tùy ý.
              </p>
            </div>
            <button
              onClick={handleOpenAddWord}
              className="inline-flex items-center gap-2 rounded-2xl bg-mint px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Thêm từ vựng mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(currentUnit?.vocabularies || []).map((v) => (
              <div
                key={v.id}
                className="flex flex-col justify-between rounded-2xl bg-cream/70 p-4 border border-banana-soft hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {v.image ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-banana-soft shadow-xs">
                          <img
                            src={v.image}
                            alt={v.word}
                            className="h-full w-full object-contain rounded-lg"
                          />
                        </div>
                      ) : v.emoji ? (
                        <span className="text-2xl">{v.emoji}</span>
                      ) : null}
                      <div>
                        <h4 className="text-lg font-black text-ink">{v.word}</h4>
                        <span className="text-xs font-bold text-peach-dark">{v.phonetic}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(v.word, { audio: v.audio })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-banana text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-xs"
                      title="Bấm nghe phát âm"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <p className="text-sm font-black text-ink">
                      <span className="rounded-md bg-banana-soft px-1.5 py-0.5 text-[11px] text-ink-soft mr-1.5">
                        {v.wordType || 'Từ vựng'}
                      </span>
                      {v.meaning}
                    </p>
                    {v.exampleEn && (
                      <div className="flex items-center justify-between gap-2 mt-1 rounded-xl bg-white p-2 border border-banana-soft/60">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-ink-soft italic">"{v.exampleEn}"</p>
                          {v.exampleVi && (
                            <p className="text-[11px] font-bold text-ink-soft/80">({v.exampleVi})</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => speak(v.exampleEn, { audio: v.audioExample })}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-peach text-white hover:bg-peach-dark transition-all cursor-pointer shadow-xs"
                          title="Bấm nghe phát âm câu ví dụ"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 border-t border-banana-soft/60 pt-2.5">
                  <button
                    onClick={() => handleEditWord(v)}
                    className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-sky-dark border border-banana-soft hover:bg-cream transition-all cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" /> Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteWord(v.id)}
                    className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-peach-dark border border-peach-soft hover:bg-peach-soft transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: VIDEO BÀI GIẢNG ================= */}
      {activeSubTab === 'videos' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
            <div>
              <h3 className="text-xl font-black text-ink">
                🎬 Video bài giảng Unit {selectedUnitId} ({currentUnit?.videos?.length || 0} video)
              </h3>
              <p className="text-xs font-bold text-ink-soft mt-0.5">
                Nhúng các video YouTube bài giảng chất lượng cao để học sinh xem trực tiếp.
              </p>
            </div>
            <button
              onClick={handleOpenAddVideo}
              className="inline-flex items-center gap-2 rounded-2xl bg-mint px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Thêm video YouTube</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentUnit?.videos || []).map((vid) => (
              <div key={vid.id} className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-peach-soft px-2 py-0.5 text-[11px] font-black text-peach-dark">
                        {vid.skill || 'Toàn diện'}
                      </span>
                      <h4 className="text-base font-black text-ink mt-1">{vid.title}</h4>
                      <p className="text-xs font-bold text-ink-soft">Kênh: {vid.channel} · {vid.duration}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="rounded-xl p-1.5 text-peach-dark hover:bg-peach-soft transition-all cursor-pointer"
                      title="Xóa video"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {vid.description && (
                    <p className="mt-2 text-xs font-bold text-ink-soft leading-relaxed">{vid.description}</p>
                  )}

                  {/* Nhúng YouTube xem thử */}
                  {vid.url && (
                    <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black/10">
                      <iframe
                        src={vid.url.replace('watch?v=', 'embed/')}
                        title={vid.title}
                        className="h-full w-full border-0"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: NGỮ PHÁP & TRẮC NGHIỆM ================= */}
      {activeSubTab === 'grammar' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
            <div>
              <h3 className="text-xl font-black text-ink">
                📐 Ngữ pháp & Trắc nghiệm Unit {selectedUnitId}
              </h3>
              <p className="text-xs font-bold text-ink-soft mt-0.5">
                Chủ điểm: {currentUnit?.grammar?.title || 'Chưa cập nhật'}
              </p>
            </div>
            <button
              onClick={handleOpenAddGrammarQuestion}
              className="inline-flex items-center gap-2 rounded-2xl bg-mint px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Thêm câu hỏi trắc nghiệm</span>
            </button>
          </div>

          <div className="space-y-3">
            {(currentUnit?.grammar?.quiz || []).map((q, idx) => (
              <div key={idx} className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-black text-ink">
                    <span className="text-peach-dark mr-1">Câu {idx + 1}:</span> {q.question}
                  </p>
                  <button
                    onClick={() => handleDeleteGrammarQuestion(idx)}
                    className="rounded-xl p-1 text-peach-dark hover:bg-peach-soft cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {q.options?.map((opt, oIdx) => (
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
                  <p className="text-[11px] font-bold text-ink-soft bg-banana-soft/50 p-2 rounded-xl mt-1">
                    💡 Giải thích: {q.explain}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ĐỌC HIỂU (READING) ================= */}
      {activeSubTab === 'reading' && (
        <div className="flex flex-col gap-6">
          {/* KHỐI 1: SOẠN ĐOẠN VĂN ĐỌC HIỂU */}
          <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-black text-ink flex items-center gap-2">
                  <span>📖</span>
                  <span>Đoạn Văn Đọc Hiểu Skills 1 (Unit {selectedUnitId})</span>
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Bài đọc chính để học sinh luyện đọc thầm, nghe đọc mẫu và trả lời câu hỏi nắm ý
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!passageText.trim()) {
                      showNotification('Vui lòng nhập đoạn văn trước khi nghe thử!', 'peach');
                      return;
                    }
                    speak(passageText, { lang: 'en-GB', rate: 0.85 });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-soft px-3.5 py-2 text-xs font-black text-sky-dark hover:bg-sky hover:text-ink transition-all cursor-pointer"
                  title="Nghe máy đọc thử toàn bộ đoạn văn tiếng Anh"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Nghe thử bài đọc</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveReadingPassage}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-4 py-2 text-xs font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-[0_3px_0_#58b292] active:translate-y-0.5 active:shadow-none"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu đoạn văn</span>
                </button>
              </div>
            </div>

            {/* Tiêu đề đoạn văn */}
            <div>
              <label className="block text-xs font-black text-ink mb-1">
                Tiêu đề bài đọc (Title - Tuỳ chọn):
              </label>
              <input
                type="text"
                value={passageTitle}
                onChange={(e) => setPassageTitle(e.target.value)}
                placeholder="Ví dụ: My New School, A Special Day..."
                className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold text-ink border border-banana-soft"
              />
            </div>

            {/* Đoạn văn tiếng Anh */}
            <div>
              <label className="block text-xs font-black text-ink mb-1 flex items-center justify-between">
                <span>Nội dung đoạn văn tiếng Anh (Passage) (*):</span>
                <span className="text-[11px] font-bold text-ink-soft">
                  {passageText.trim().split(/\s+/).filter(Boolean).length} từ
                </span>
              </label>
              <textarea
                rows={6}
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                onBlur={handleSaveReadingPassage}
                placeholder="Nhập hoặc dán đoạn văn tiếng Anh vào đây..."
                className="w-full rounded-2xl bg-cream p-4 text-sm font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana leading-relaxed"
              />
              <span className="text-[11px] font-bold text-ink-soft mt-1 block">
                💡 Mẹo: Bấm nút <strong>"Lưu đoạn văn"</strong> hoặc bấm ra ngoài ô nhập để tự động lưu lại.
              </span>
            </div>

            {/* Bản dịch nghĩa tiếng Việt */}
            <div>
              <label className="block text-xs font-black text-ink mb-1">
                Bản dịch nghĩa tiếng Việt (Dành cho học sinh đối chiếu khi cần):
              </label>
              <textarea
                rows={3}
                value={passageTranslation}
                onChange={(e) => setPassageTranslation(e.target.value)}
                onBlur={handleSaveReadingPassage}
                placeholder="Nhập bản dịch nghĩa tiếng Việt của đoạn văn..."
                className="w-full rounded-2xl bg-cream p-3 text-xs font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana resize-none"
              />
            </div>
          </div>

          {/* KHỐI 2: QUẢN LÝ CÂU HỎI ĐỌC HIỂU */}
          <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-black text-ink flex items-center gap-2">
                  <span>❓</span>
                  <span>Câu hỏi Đọc hiểu ({currentUnit?.reading?.questions?.length || 0} câu)</span>
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Các câu hỏi trắc nghiệm kiểm tra độ hiểu bài, bắt ý chính và chi tiết của đoạn văn
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenAddReadingQuestion}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-3.5 py-2 text-xs font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-[0_3px_0_#58b292] active:translate-y-0.5 active:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm câu hỏi đọc hiểu</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenBatchReadingModal}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-banana px-3.5 py-2 text-xs font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-[0_3px_0_var(--color-banana-dark)] active:translate-y-0.5 active:shadow-none"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Dán từ Word / Văn bản</span>
                </button>
              </div>
            </div>

            {/* Danh sách câu hỏi */}
            {(!currentUnit?.reading?.questions || currentUnit.reading.questions.length === 0) ? (
              <div className="rounded-2xl border-2 border-dashed border-banana-soft p-8 text-center flex flex-col items-center gap-3 bg-cream/40">
                <span className="text-4xl">📝</span>
                <p className="text-base font-black text-ink">Chưa có câu hỏi đọc hiểu nào cho Unit này</p>
                <p className="text-xs font-bold text-ink-soft max-w-md">
                  Thầy cô hãy bấm nút <strong>"+ Thêm câu hỏi đọc hiểu"</strong> để tự tạo câu hỏi hoặc <strong>"Dán từ Word"</strong> để nhập nhanh đề bài có sẵn.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleOpenAddReadingQuestion}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-4 py-2 text-xs font-black text-white hover:bg-mint-dark cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Thêm câu hỏi ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {currentUnit.reading.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-cream/60 p-4 border border-banana-soft hover:bg-cream transition-colors flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className="rounded-lg bg-banana px-2 py-0.5 text-xs font-black text-ink shrink-0">
                          Câu {idx + 1}
                        </span>
                        <h4 className="text-sm font-black text-ink leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditReadingQuestion(q, idx)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-ink hover:bg-banana transition-all cursor-pointer shadow-2xs border border-banana-soft"
                          title="Sửa câu hỏi này"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReadingQuestion(idx)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-rose-600 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-2xs border border-rose-200"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.answerIndex;
                        return (
                          <div
                            key={oIdx}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
                              isCorrect
                                ? 'bg-mint-soft text-mint-dark border-mint font-black ring-1 ring-mint'
                                : 'bg-white text-ink border-banana-soft/60'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. </span>
                            <span>{opt}</span>
                            {isCorrect && <span className="ml-1 text-[11px] font-black">✓ (Đáp án đúng)</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explain && (
                      <div className="rounded-xl bg-banana-soft/60 px-3 py-1.5 text-[11px] font-bold text-ink-soft flex items-center gap-1.5">
                        <span>💡</span>
                        <span>Căn cứ bài đọc / Giải thích: {q.explain}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: VIẾT CÂU & ĐIỀN KHUYẾT (WRITING & CLOZE) ================= */}
      {activeSubTab === 'writing' && (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-black text-ink flex items-center gap-2">
                  <span>✍️</span>
                  <span>Bài tập Viết câu & Điền khuyết Skills 2 ({writingItems.length} câu)</span>
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Rèn luyện phản xạ ngữ pháp qua dạng bài Ghép từ xáo trộn thành câu và Điền từ vào chỗ trống
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenAddWriting('unscramble')}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-3.5 py-2 text-xs font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-[0_3px_0_#58b292] active:translate-y-0.5 active:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm câu ghép từ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAddWriting('fill_blank')}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-sky px-3.5 py-2 text-xs font-black text-ink hover:bg-sky-dark hover:text-white transition-all cursor-pointer shadow-[0_3px_0_var(--color-sky-dark)] active:translate-y-0.5 active:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm câu điền khuyết</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenBatchWritingModal}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-banana px-3.5 py-2 text-xs font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-[0_3px_0_var(--color-banana-dark)] active:translate-y-0.5 active:shadow-none"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Dán từ Word / Văn bản</span>
                </button>
              </div>
            </div>

            {/* Danh sách câu hỏi Viết & Điền khuyết */}
            {writingItems.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-banana-soft p-8 text-center flex flex-col items-center gap-3 bg-cream/40">
                <span className="text-4xl">✍️</span>
                <p className="text-base font-black text-ink">Chưa có bài tập viết câu nào cho Unit này</p>
                <p className="text-xs font-bold text-ink-soft max-w-md">
                  Thầy cô hãy bấm nút <strong>"+ Thêm câu ghép từ"</strong> hoặc <strong>"+ Thêm câu điền khuyết"</strong> để tạo bài tập thực hành viết cho học sinh.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAddWriting('unscramble')}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-4 py-2 text-xs font-black text-white hover:bg-mint-dark cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Thêm câu ghép từ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddWriting('fill_blank')}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-sky px-4 py-2 text-xs font-black text-ink hover:bg-sky-dark hover:text-white cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Thêm câu điền khuyết</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {writingItems.map((item, idx) => {
                  const isFill = item.type === 'fill_blank';
                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl bg-cream/60 p-4 border border-banana-soft hover:bg-cream transition-colors flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="rounded-lg bg-banana px-2 py-0.5 text-xs font-black text-ink shrink-0">
                            Câu {idx + 1}
                          </span>
                          <span
                            className={`rounded-lg px-2 py-0.5 text-xs font-black shrink-0 ${
                              isFill
                                ? 'bg-sky-soft text-sky-dark border border-sky/30'
                                : 'bg-mint-soft text-mint-dark border border-mint/30'
                            }`}
                          >
                            {isFill ? '✏️ Điền khuyết (Fill-in-the-blank)' : '🧩 Ghép từ thành câu (Unscramble)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditWriting(item, idx)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-ink hover:bg-banana transition-all cursor-pointer shadow-2xs border border-banana-soft"
                            title="Sửa câu này"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWritingItem(idx)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-rose-600 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-2xs border border-rose-200"
                            title="Xóa câu này"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Hiển thị câu */}
                      <div className="rounded-xl bg-white p-3 border border-banana-soft flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-ink-soft">Câu bài tập:</span>
                          <span className="text-sm font-black text-ink font-mono">
                            {isFill ? item.sentence : item.correctSentence}
                          </span>
                        </div>

                        {isFill && item.blankWord && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-mint-dark">Từ cần điền đúng:</span>
                            <span className="rounded-lg bg-mint-soft px-2 py-0.5 text-xs font-black text-mint-dark font-mono border border-mint">
                              {item.blankWord}
                            </span>
                          </div>
                        )}

                        {!isFill && item.scrambledWords?.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-ink-soft">Khối từ xáo trộn:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.scrambledWords.map((w, wIdx) => (
                                <span
                                  key={wIdx}
                                  className="rounded-lg bg-cream px-2 py-0.5 text-xs font-bold text-ink border border-banana-soft"
                                >
                                  {w}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {isFill && item.options?.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-ink-soft">Lựa chọn gợi ý:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.options.map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className={`rounded-lg px-2 py-0.5 text-xs font-bold border ${
                                    opt === item.blankWord
                                      ? 'bg-mint-soft text-mint-dark border-mint font-black'
                                      : 'bg-cream text-ink border-banana-soft'
                                  }`}
                                >
                                  {opt} {opt === item.blankWord ? '✓' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.meaningVi && (
                          <div className="text-xs font-bold text-ink-soft border-t border-banana-soft/60 pt-1.5 mt-0.5">
                            💡 Nghĩa tiếng Việt: &quot;{item.meaningVi}&quot;
                          </div>
                        )}

                        {item.hint && (
                          <div className="text-[11px] font-bold text-ink-soft">
                            📌 Gợi ý cho học sinh: {item.hint}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 6: CHUYÊN GIA SOẠN JSON ================= */}
      {activeSubTab === 'raw_json' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-3">
            <div>
              <h3 className="text-xl font-black text-ink flex items-center gap-2">
                <Code2 className="h-5 w-5 text-peach" /> Chế độ Chuyên gia: Chỉnh sửa JSON Thô Unit {selectedUnitId}
              </h3>
              <p className="text-xs font-bold text-ink-soft">
                Thầy cô có thể copy toàn bộ dữ liệu, chỉnh sửa trực tiếp và dán vào đây để cập nhật.
              </p>
            </div>
            <button
              onClick={handleSaveRawJson}
              className="inline-flex items-center gap-2 rounded-2xl bg-peach px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Lưu thay đổi JSON</span>
            </button>
          </div>

          {jsonError && (
            <div className="rounded-2xl bg-peach-soft p-4 text-xs font-black text-peach-dark border border-peach/30 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          {jsonSuccess && (
            <div className="rounded-2xl bg-mint-soft p-3 text-xs font-black text-mint-dark">
              ✓ Cú pháp JSON hợp lệ! Dữ liệu đã được áp dụng trực tiếp cho Unit {selectedUnitId}.
            </div>
          )}

          <textarea
            rows={18}
            value={rawJsonText}
            onChange={(e) => {
              setRawJsonText(e.target.value);
              setJsonError(null);
            }}
            spellCheck={false}
            className="w-full rounded-2xl bg-ink p-4 font-mono text-xs text-mint leading-relaxed border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
          />
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA TỪ VỰNG ================= */}
      {showAddWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-banana flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <h3 className="text-xl font-black text-ink">
                {editingWord ? '✏️ Chỉnh sửa từ vựng' : '✨ Thêm từ vựng mới vào Unit ' + selectedUnitId}
              </h3>
              <button
                onClick={() => setShowAddWordModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWord} className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-ink">Từ tiếng Anh (*):</label>
                    {wordForm.word.trim() && (
                      <button
                        type="button"
                        onClick={() => speak(wordForm.word.trim(), { audio: wordForm.audio })}
                        className="inline-flex items-center gap-1 text-[11px] font-black text-peach hover:underline cursor-pointer"
                      >
                        <Volume2 className="h-3 w-3" /> Nghe thử từ
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={wordForm.word}
                    onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })}
                    placeholder="Ví dụ: telescope"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Phiên âm IPA:</label>
                  <input
                    type="text"
                    value={wordForm.phonetic}
                    onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })}
                    placeholder="Ví dụ: /ˈtelɪskəʊp/"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Loại từ:</label>
                <select
                  value={wordForm.wordType}
                  onChange={(e) => setWordForm({ ...wordForm, wordType: e.target.value })}
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                >
                  <option value="Danh từ">Danh từ (Noun)</option>
                  <option value="Động từ">Động từ (Verb)</option>
                  <option value="Tính từ">Tính từ (Adjective)</option>
                  <option value="Trạng từ">Trạng từ (Adverb)</option>
                  <option value="Cụm từ">Cụm từ (Phrase)</option>
                </select>
              </div>

              {/* KHU VỰC TẢI ẢNH MINH HỌA (HOẶC ĐỂ TRỐNG NẾU KHÔNG CÓ) */}
              <div className="rounded-2xl bg-cream/70 p-3.5 border-2 border-banana-soft flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-ink">
                      🖼️ Ảnh minh họa từ vựng:
                    </label>
                    <p className="text-[11px] font-bold text-ink-soft">
                      (Không bắt buộc - Nếu không tải ảnh thì từ này sẽ để trống ảnh, không cần biểu tượng)
                    </p>
                  </div>
                  {wordForm.image && (
                    <button
                      type="button"
                      onClick={() => setWordForm({ ...wordForm, image: '', emoji: '' })}
                      className="text-[11px] font-black text-peach-dark hover:underline cursor-pointer"
                    >
                      ✕ Xóa ảnh (để trống)
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Xem trước ảnh */}
                  {wordForm.image ? (
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-1 border-2 border-banana shadow-sm">
                      <img
                        src={wordForm.image}
                        alt="Xem trước"
                        className="h-full w-full object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/70 border-2 border-dashed border-banana-soft text-ink-soft/60 text-center p-1">
                      <span className="text-xl">🖼️</span>
                      <span className="text-[10px] font-bold">Để trống ảnh</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    {/* Nút tải ảnh từ máy tính */}
                    <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-banana px-4 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <span>📁 Tải ảnh từ máy tính / điện thoại</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Hoặc dán link ảnh */}
                    <input
                      type="text"
                      value={wordForm.image?.startsWith('data:') ? '(Ảnh đã tải từ máy tính)' : (wordForm.image || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWordForm({ ...wordForm, image: val, emoji: '' });
                      }}
                      placeholder="Hoặc dán đường link ảnh mạng (https://...)"
                      className="w-full rounded-xl bg-white px-3 py-1.5 text-xs font-bold border border-banana-soft placeholder:text-ink-soft/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Nghĩa tiếng Việt (*):</label>
                <input
                  type="text"
                  required
                  value={wordForm.meaning}
                  onChange={(e) => setWordForm({ ...wordForm, meaning: e.target.value })}
                  placeholder="Ví dụ: Kính thiên văn"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Gợi ý cho học sinh:</label>
                <input
                  type="text"
                  value={wordForm.hint}
                  onChange={(e) => setWordForm({ ...wordForm, hint: e.target.value })}
                  placeholder="Ví dụ: Dụng cụ ngắm nhìn các vì sao ban đêm"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-ink">Câu ví dụ tiếng Anh:</label>
                  {wordForm.exampleEn.trim() && (
                    <button
                      type="button"
                      onClick={() => speak(wordForm.exampleEn.trim())}
                      className="inline-flex items-center gap-1 text-[11px] font-black text-peach hover:underline cursor-pointer"
                    >
                      <Volume2 className="h-3 w-3" /> Nghe thử câu ví dụ
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={wordForm.exampleEn}
                  onChange={(e) => setWordForm({ ...wordForm, exampleEn: e.target.value })}
                  placeholder="Ví dụ: I look at the stars with a telescope."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Dịch nghĩa câu ví dụ:</label>
                <input
                  type="text"
                  value={wordForm.exampleVi}
                  onChange={(e) => setWordForm({ ...wordForm, exampleVi: e.target.value })}
                  placeholder="Ví dụ: Tôi ngắm các vì sao bằng kính thiên văn."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Đường dẫn Audio (Để trống để tự dùng Cloud TTS chuẩn Anh - Anh):
                </label>
                <input
                  type="text"
                  value={wordForm.audio}
                  onChange={(e) => setWordForm({ ...wordForm, audio: e.target.value })}
                  placeholder="Tự động phát hiện hoặc nhập link /assets/audio/..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowAddWordModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  Lưu từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM VIDEO YOUTUBE ================= */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-banana flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <h3 className="text-xl font-black text-ink">🎬 Thêm Video YouTube bài giảng</h3>
              <button
                onClick={() => setShowAddVideoModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-black text-ink mb-1">Tiêu đề video (*):</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="Ví dụ: Ôn tập ngữ pháp thì Hiện tại đơn"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Đường link YouTube (URL) (*):</label>
                <input
                  type="url"
                  required
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Kênh giảng dạy:</label>
                  <input
                    type="text"
                    value={videoForm.channel}
                    onChange={(e) => setVideoForm({ ...videoForm, channel: e.target.value })}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Kỹ năng chính:</label>
                  <select
                    value={videoForm.skill}
                    onChange={(e) => setVideoForm({ ...videoForm, skill: e.target.value })}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    <option value="Từ vựng & Phát âm">Từ vựng & Phát âm</option>
                    <option value="Ngữ pháp">Ngữ pháp</option>
                    <option value="Luyện nghe">Luyện nghe</option>
                    <option value="Luyện nói">Luyện nói</option>
                    <option value="Đọc & Viết">Đọc & Viết</option>
                    <option value="Toàn diện">Toàn diện</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Ghi chú tóm tắt bài giảng:</label>
                <textarea
                  rows={2}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Ví dụ: Xem kỹ phần quy tắc thêm -s/-es ở phút 04:30"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  Thêm video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM CÂU HỎI TRẮC NGHIỆM ================= */}
      {showAddGrammarQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-banana flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <h3 className="text-xl font-black text-ink">📐 Thêm câu hỏi trắc nghiệm</h3>
              <button
                onClick={() => setShowAddGrammarQuestionModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrammarQuestion} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-black text-ink mb-1">Nội dung câu hỏi (*):</label>
                <input
                  type="text"
                  required
                  value={grammarQuestionForm.question}
                  onChange={(e) => setGrammarQuestionForm({ ...grammarQuestionForm, question: e.target.value })}
                  placeholder="Ví dụ: Look! The boys ______ football in the schoolyard."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {grammarQuestionForm.options.map((opt, i) => (
                  <div key={i}>
                    <label className="block text-[11px] font-black text-ink mb-0.5">
                      Đáp án {String.fromCharCode(65 + i)}:
                    </label>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const next = [...grammarQuestionForm.options];
                        next[i] = e.target.value;
                        setGrammarQuestionForm({ ...grammarQuestionForm, options: next });
                      }}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                      className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Đáp án đúng:</label>
                  <select
                    value={grammarQuestionForm.answerIndex}
                    onChange={(e) => setGrammarQuestionForm({ ...grammarQuestionForm, answerIndex: Number(e.target.value) })}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    <option value={0}>A ({grammarQuestionForm.options[0] || 'Đáp án A'})</option>
                    <option value={1}>B ({grammarQuestionForm.options[1] || 'Đáp án B'})</option>
                    <option value={2}>C ({grammarQuestionForm.options[2] || 'Đáp án C'})</option>
                    <option value={3}>D ({grammarQuestionForm.options[3] || 'Đáp án D'})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Giải thích đáp án:</label>
                  <input
                    type="text"
                    value={grammarQuestionForm.explain}
                    onChange={(e) => setGrammarQuestionForm({ ...grammarQuestionForm, explain: e.target.value })}
                    placeholder="Ví dụ: Dấu hiệu 'Look!' dùng thì HTTD"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowAddGrammarQuestionModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA UNIT */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-mint flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{isEditingUnit ? '✏️' : '🚀'}</span>
                <div>
                  <h3 className="text-xl font-black text-ink">
                    {isEditingUnit ? `Chỉnh sửa Unit ${unitForm.unitId}` : 'Tạo thêm Unit học mới'}
                  </h3>
                  <p className="text-xs font-bold text-ink-soft">
                    {isEditingUnit
                      ? 'Cập nhật tên bài học, emoji hoặc chủ đề'
                      : 'Mở rộng chương trình học theo nhu cầu riêng của lớp'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUnitModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Số thứ tự Unit (*):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={99}
                    disabled={isEditingUnit}
                    value={unitForm.unitId}
                    onChange={(e) => setUnitForm({ ...unitForm, unitId: Number(e.target.value) })}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-black border border-banana-soft disabled:opacity-60"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-ink mb-1">Chủ đề (Topic):</label>
                  <input
                    type="text"
                    value={unitForm.topic}
                    onChange={(e) => setUnitForm({ ...unitForm, topic: e.target.value })}
                    placeholder="Ví dụ: Future Technology, Robots..."
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Tiêu đề Tiếng Anh (*):</label>
                <input
                  type="text"
                  required
                  value={unitForm.titleEn}
                  onChange={(e) => setUnitForm({ ...unitForm, titleEn: e.target.value })}
                  placeholder="Ví dụ: Robots in the Future"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-black border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Tiêu đề Tiếng Việt (*):</label>
                <input
                  type="text"
                  required
                  value={unitForm.titleVi}
                  onChange={(e) => setUnitForm({ ...unitForm, titleVi: e.target.value })}
                  placeholder="Ví dụ: Robot trong tương lai"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              {/* Chọn Biểu tượng Emoji */}
              <div>
                <label className="block text-xs font-black text-ink mb-1.5 flex items-center justify-between">
                  <span>Biểu tượng Unit (Emoji):</span>
                  <span className="text-xl">{unitForm.emoji || '📘'}</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-cream border border-banana-soft mb-2">
                  {['🤖', '🚀', '📚', '⚽', '🎨', '🎵', '🏥', '🔬', '🌍', '💡', '🏫', '🐾', '🍕', '🏕️', '💻', '🛸', '⭐', '🧩'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setUnitForm({ ...unitForm, emoji: em })}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-pointer ${
                        unitForm.emoji === em ? 'bg-banana shadow-xs ring-2 ring-banana-dark' : 'bg-white'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={unitForm.emoji}
                  onChange={(e) => setUnitForm({ ...unitForm, emoji: e.target.value })}
                  placeholder="Hoặc tự gõ emoji tùy ý..."
                  className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                />
              </div>

              {/* Màu sắc thẻ bài học */}
              <div>
                <label className="block text-xs font-black text-ink mb-1.5">Màu sắc thẻ bài học:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Vàng', hex: '#FFC83D' },
                    { label: 'Xanh ngọc', hex: '#7ED6B5' },
                    { label: 'Da trời', hex: '#8EC5FF' },
                    { label: 'Cam đào', hex: '#FFB38A' },
                    { label: 'Hồng', hex: '#FF9A9A' },
                    { label: 'Tím', hex: '#C3A6FF' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setUnitForm({ ...unitForm, color: c.hex })}
                      className={`h-9 rounded-xl font-black text-xs flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                        unitForm.color === c.hex
                          ? 'border-ink scale-105 shadow-xs'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex, color: '#2B231D' }}
                    >
                      {unitForm.color === c.hex && <span>✓</span>}
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Mô tả tóm tắt nội dung bài học:</label>
                <textarea
                  rows={2}
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  placeholder="Ví dụ: Từ vựng và cấu trúc về các công nghệ thông minh, robot hỗ trợ con người..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-xs font-bold border border-banana-soft resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowUnitModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_#58b292] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>{isEditingUnit ? 'Lưu thay đổi' : 'Tạo Unit ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA CÂU HỎI ĐỌC HIỂU */}
      {showReadingQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-banana flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editingReadingQuestionIndex >= 0 ? '✏️' : '📖'}</span>
                <div>
                  <h3 className="text-xl font-black text-ink">
                    {editingReadingQuestionIndex >= 0
                      ? `Sửa câu hỏi đọc hiểu ${editingReadingQuestionIndex + 1}`
                      : 'Thêm câu hỏi đọc hiểu mới'}
                  </h3>
                  <p className="text-xs font-bold text-ink-soft">
                    Unit {selectedUnitId} · Đoạn văn đọc hiểu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReadingQuestionModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReadingQuestion} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Nội dung câu hỏi đọc hiểu (*):
                </label>
                <input
                  type="text"
                  required
                  value={readingQuestionForm.question}
                  onChange={(e) => setReadingQuestionForm({ ...readingQuestionForm, question: e.target.value })}
                  placeholder="Ví dụ: Where does Mai go to school?"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {readingQuestionForm.options.map((opt, i) => (
                  <div key={i}>
                    <label className="block text-[11px] font-black text-ink mb-0.5">
                      Đáp án {String.fromCharCode(65 + i)}:
                    </label>
                    <input
                      type="text"
                      required={i < 2}
                      value={opt}
                      onChange={(e) => {
                        const next = [...readingQuestionForm.options];
                        next[i] = e.target.value;
                        setReadingQuestionForm({ ...readingQuestionForm, options: next });
                      }}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                      className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Đáp án đúng (*):</label>
                  <select
                    value={readingQuestionForm.answerIndex}
                    onChange={(e) => setReadingQuestionForm({ ...readingQuestionForm, answerIndex: Number(e.target.value) })}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    {readingQuestionForm.options.map((opt, i) => (
                      <option key={i} value={i}>
                        {String.fromCharCode(65 + i)}: {opt || `Đáp án ${String.fromCharCode(65 + i)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-ink mb-1">Căn cứ bài đọc / Giải thích:</label>
                  <input
                    type="text"
                    value={readingQuestionForm.explain}
                    onChange={(e) => setReadingQuestionForm({ ...readingQuestionForm, explain: e.target.value })}
                    placeholder="Ví dụ: Dựa vào câu 'I go to a boarding school...'"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowReadingQuestionModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  {editingReadingQuestionIndex >= 0 ? 'Lưu thay đổi' : 'Thêm câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DÁN CÂU HỎI ĐỌC HIỂU TỪ WORD */}
      {showBatchReadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border-4 border-banana flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-xl font-black text-ink">
                    Dán câu hỏi đọc hiểu hàng loạt từ Word
                  </h3>
                  <p className="text-xs font-bold text-ink-soft">
                    Hệ thống tự động phân tách câu hỏi, 4 phương án A, B, C, D và đáp án đúng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchReadingModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-cream/70 p-3 border border-banana-soft text-xs font-bold text-ink-soft leading-relaxed">
                <span className="font-black text-ink">💡 Định dạng mẫu Word hỗ trợ:</span>
                <pre className="mt-1 font-mono text-[11px] text-ink bg-white p-2 rounded-xl border border-banana-soft/60">
{`Câu 1: Where does Mai go to school?
A. Hanoi
B. Da Nang
C. Ho Chi Minh City
Đáp án: B

Câu 2: What does Mai like studying?
A. Maths and art
B. History and music
C. Science and english
Đáp án: A`}
                </pre>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Dán nội dung câu hỏi từ Word vào đây (*):
                </label>
                <textarea
                  rows={8}
                  value={batchReadingText}
                  onChange={(e) => {
                    setBatchReadingText(e.target.value);
                    const parsed = parseBatchQuestions(e.target.value);
                    setBatchReadingPreview(parsed);
                  }}
                  placeholder="Dán câu hỏi vào đây..."
                  className="w-full rounded-2xl bg-cream p-4 font-mono text-xs font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
                />
              </div>

              {/* Xem trước kết quả nhận diện */}
              {batchReadingPreview.length > 0 && (
                <div className="rounded-2xl bg-mint-soft/50 p-3 border border-mint text-xs">
                  <div className="flex items-center gap-2 font-black text-mint-dark">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đã nhận diện thành công {batchReadingPreview.length} câu hỏi trắc nghiệm!</span>
                  </div>
                  <div className="mt-2 max-h-36 overflow-y-auto space-y-1">
                    {batchReadingPreview.map((q, i) => (
                      <div key={i} className="text-ink font-bold bg-white/80 p-2 rounded-lg border border-mint/30">
                        <span className="text-peach font-black">Câu {i + 1}:</span> {q.question}
                        <span className="ml-2 text-mint-dark font-black">
                          (Đáp án đúng: {String.fromCharCode(65 + q.answerIndex)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowBatchReadingModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchReading}
                  disabled={!batchReadingText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_#58b292] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Check className="h-4 w-4" />
                  <span>Nhập {batchReadingPreview.length > 0 ? `${batchReadingPreview.length} câu` : 'câu hỏi'} vào Unit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA BÀI VIẾT CÂU & ĐIỀN KHUYẾT */}
      {showWritingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-mint flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{writingForm.type === 'fill_blank' ? '✏️' : '🧩'}</span>
                <div>
                  <h3 className="text-xl font-black text-ink">
                    {editingWritingIndex >= 0
                      ? `Sửa bài viết câu ${editingWritingIndex + 1}`
                      : writingForm.type === 'fill_blank'
                      ? 'Thêm câu hỏi điền khuyết mới'
                      : 'Thêm câu ghép từ xáo trộn mới'}
                  </h3>
                  <p className="text-xs font-bold text-ink-soft">
                    Unit {selectedUnitId} · Bài tập Viết & Luyện câu Skills 2
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWritingModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chọn dạng bài */}
            <div className="flex items-center gap-2 p-1.5 bg-cream rounded-2xl border border-banana-soft">
              <button
                type="button"
                onClick={() => setWritingForm({ ...writingForm, type: 'unscramble' })}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  writingForm.type === 'unscramble'
                    ? 'bg-mint text-white shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                🧩 Ghép từ xáo trộn thành câu
              </button>
              <button
                type="button"
                onClick={() => setWritingForm({ ...writingForm, type: 'fill_blank' })}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  writingForm.type === 'fill_blank'
                    ? 'bg-sky text-ink shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                ✏️ Điền từ vào chỗ trống
              </button>
            </div>

            <form onSubmit={handleSaveWritingItem} className="flex flex-col gap-3">
              {writingForm.type === 'unscramble' ? (
                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Câu hoàn chỉnh đúng ngữ pháp (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={writingForm.correctSentence}
                    onChange={(e) => setWritingForm({ ...writingForm, correctSentence: e.target.value })}
                    placeholder="Ví dụ: This is my new calculator"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                  <span className="text-[11px] font-bold text-ink-soft mt-1 block">
                    💡 Hệ thống sẽ tự động tách câu thành các khối từ và xáo trộn ngẫu nhiên cho học sinh chạm ghép.
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Câu có chỗ trống (Dùng ______ hoặc [từ_cần_điền]) (*):
                    </label>
                    <input
                      type="text"
                      required
                      value={writingForm.sentence}
                      onChange={(e) => setWritingForm({ ...writingForm, sentence: e.target.value })}
                      placeholder="Ví dụ: She ______ to school by bus every day."
                      className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-ink mb-1">
                        Từ cần điền đúng (*):
                      </label>
                      <input
                        type="text"
                        required
                        value={writingForm.blankWord}
                        onChange={(e) => setWritingForm({ ...writingForm, blankWord: e.target.value })}
                        placeholder="Ví dụ: goes"
                        className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-black border border-banana-soft text-mint-dark"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-ink mb-1">
                        Các từ gợi ý / Lựa chọn:
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(writingForm.options) ? writingForm.options.join(', ') : ''}
                        onChange={(e) => {
                          const opts = e.target.value.split(',').map((o) => o.trim());
                          setWritingForm({ ...writingForm, options: opts });
                        }}
                        placeholder="Ví dụ: go, goes, going"
                        className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Nghĩa tiếng Việt của câu (*):
                </label>
                <input
                  type="text"
                  required
                  value={writingForm.meaningVi}
                  onChange={(e) => setWritingForm({ ...writingForm, meaningVi: e.target.value })}
                  placeholder="Ví dụ: Đây là chiếc máy tính cầm tay mới của mình."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Gợi ý cho học sinh (Tuỳ chọn):
                </label>
                <input
                  type="text"
                  value={writingForm.hint}
                  onChange={(e) => setWritingForm({ ...writingForm, hint: e.target.value })}
                  placeholder="Ví dụ: Bắt đầu bằng đại từ chỉ định This..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowWritingModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_#58b292] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  {editingWritingIndex >= 0 ? 'Lưu thay đổi' : 'Thêm câu bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DÁN BÀI TẬP VIẾT TỪ WORD */}
      {showBatchWritingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border-4 border-mint flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-xl font-black text-ink">
                    Dán bài tập Viết & Điền khuyết hàng loạt từ Word
                  </h3>
                  <p className="text-xs font-bold text-ink-soft">
                    Hỗ trợ dán câu sắp xếp xáo trộn hoặc câu điền từ vào chỗ trống
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchWritingModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-cream/70 p-3 border border-banana-soft text-xs font-bold text-ink-soft leading-relaxed">
                <span className="font-black text-ink">💡 Định dạng mẫu Word hỗ trợ:</span>
                <pre className="mt-1 font-mono text-[11px] text-ink bg-white p-2 rounded-xl border border-banana-soft/60">
{`// Dạng 1: Ghép câu
1. This / is / my / new / calculator
-> Đây là chiếc máy tính cầm tay mới của mình.

2. I do my homework after dinner.
Nghĩa: Em làm bài tập sau bữa tối.

// Dạng 2: Điền khuyết
3. She ______ to school by bus every day.
A. go
B. goes
C. going
Đáp án: B`}
                </pre>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Dán nội dung từ Word vào đây (*):
                </label>
                <textarea
                  rows={8}
                  value={batchWritingText}
                  onChange={(e) => {
                    setBatchWritingText(e.target.value);
                    const parsed = parseBatchWriting(e.target.value);
                    setBatchWritingPreview(parsed);
                  }}
                  placeholder="Dán câu hỏi vào đây..."
                  className="w-full rounded-2xl bg-cream p-4 font-mono text-xs font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
                />
              </div>

              {/* Xem trước kết quả nhận diện */}
              {batchWritingPreview.length > 0 && (
                <div className="rounded-2xl bg-mint-soft/50 p-3 border border-mint text-xs">
                  <div className="flex items-center gap-2 font-black text-mint-dark">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đã nhận diện thành công {batchWritingPreview.length} câu bài tập!</span>
                  </div>
                  <div className="mt-2 max-h-36 overflow-y-auto space-y-1">
                    {batchWritingPreview.map((item, i) => (
                      <div key={i} className="text-ink font-bold bg-white/80 p-2 rounded-lg border border-mint/30 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-peach font-black">Câu {i + 1} ({item.type === 'fill_blank' ? 'Điền khuyết' : 'Ghép câu'}):</span> {item.sentence || item.correctSentence}
                        </div>
                        {item.blankWord && (
                          <span className="text-mint-dark font-black shrink-0">
                            (Từ điền: {item.blankWord})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowBatchWritingModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  onClick={handleApplyBatchWriting}
                  disabled={!batchWritingText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_#58b292] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Check className="h-4 w-4" />
                  <span>Nhập {batchWritingPreview.length > 0 ? `${batchWritingPreview.length} câu` : 'câu'} vào Unit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
