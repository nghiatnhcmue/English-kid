import { useState, useMemo } from 'react';
import { getUnit, listUnits } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { speak, getCloudTtsUrl } from '../utils/speech.js';
import { 
  AlertCircle, 
  BookOpen, 
  Check, 
  Code2, 
  Download, 
  FileEdit, 
  Headphones, 
  Pencil, 
  Plus, 
  RefreshCw, 
  RotateCcw, 
  Save, 
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

  // ---- TỪ VỰNG ----
  const handleOpenAddWord = () => {
    const nextNum = (currentUnit?.vocabularies?.length || 0) + 1;
    setWordForm({
      id: `u${selectedUnitId}_custom_${Date.now().toString().slice(-4)}`,
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
    setEditingWord(null);
    setShowAddWordModal(true);
  };

  const handleEditWord = (w) => {
    setEditingWord(w);
    setWordForm({ ...w });
    setShowAddWordModal(true);
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
      <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                Unit {u.unitId}: {u.title} ({u.titleVi})
              </option>
            ))}
          </select>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
              isCustomized
                ? 'bg-peach text-white shadow-xs'
                : 'bg-mint-soft text-mint-dark'
            }`}
          >
            {isCustomized ? '✏️ Đã có dữ liệu tùy biến riêng' : '📖 Dữ liệu gốc SGK'}
          </span>
        </div>

        {/* Các nút thao tác nhanh: Tải JSON / Khôi phục */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportUnitJson}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-cream px-3.5 py-2 text-xs font-black text-ink hover:bg-banana-soft transition-all cursor-pointer border border-banana-soft"
          >
            <Download className="h-4 w-4 text-sky-dark" />
            <span>Tải JSON Unit</span>
          </button>

          {isCustomized && (
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
          { id: 'reading', label: 'Bài Đọc hiểu', icon: '📖' },
          { id: 'writing', label: 'Bài Viết câu', icon: '✍️' },
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
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{v.emoji || '📝'}</span>
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
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
          <h3 className="text-xl font-black text-ink border-b border-banana-soft pb-3">
            📖 Bài tập Đọc hiểu Skills 1
          </h3>
          <div>
            <label className="block text-sm font-black text-ink mb-1">Đoạn văn đọc hiểu (Passage):</label>
            <textarea
              rows={5}
              defaultValue={currentUnit?.reading?.passage || ''}
              onBlur={(e) => {
                const reading = { ...(currentUnit?.reading || {}), passage: e.target.value };
                store().saveCustomUnit(selectedUnitId, { reading });
                reloadData();
                showNotification('Đã cập nhật đoạn văn đọc hiểu!');
              }}
              className="w-full rounded-2xl bg-cream p-4 text-sm font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
            />
            <span className="text-xs font-bold text-ink-soft">Mẹo: Bấm ra ngoài ô nhập để tự động lưu đoạn văn.</span>
          </div>

          <div className="space-y-2 mt-3">
            <h4 className="font-black text-sm text-ink">Câu hỏi đọc hiểu ({currentUnit?.reading?.questions?.length || 0}):</h4>
            {(currentUnit?.reading?.questions || []).map((q, idx) => (
              <div key={idx} className="rounded-2xl bg-cream p-3 border border-banana-soft text-xs font-bold text-ink">
                <span className="font-black text-peach">Câu {idx + 1}:</span> {q.question}
                <div className="mt-1 flex flex-wrap gap-2 text-ink-soft">
                  {q.options?.map((opt, oIdx) => (
                    <span key={oIdx} className={oIdx === q.answerIndex ? 'text-mint-dark font-black underline' : ''}>
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: VIẾT CÂU (WRITING) ================= */}
      {activeSubTab === 'writing' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
          <h3 className="text-xl font-black text-ink border-b border-banana-soft pb-3">
            ✍️ Bài tập Viết câu ghép từ Skills 2
          </h3>
          <div className="rounded-2xl bg-cream p-4 border border-banana-soft space-y-3">
            <div>
              <label className="block text-xs font-black text-ink mb-1">Nghĩa tiếng Việt:</label>
              <input
                type="text"
                defaultValue={currentUnit?.writing?.meaningVi || ''}
                onBlur={(e) => {
                  const writing = { ...(currentUnit?.writing || {}), meaningVi: e.target.value };
                  store().saveCustomUnit(selectedUnitId, { writing });
                  reloadData();
                  showNotification('Đã lưu nghĩa tiếng Việt bài viết!');
                }}
                className="w-full rounded-xl bg-white px-3 py-2 text-sm font-bold border border-banana-soft"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-ink mb-1">Câu hoàn chỉnh đúng ngữ pháp:</label>
              <input
                type="text"
                defaultValue={currentUnit?.writing?.correctSentence || ''}
                onBlur={(e) => {
                  const writing = { ...(currentUnit?.writing || {}), correctSentence: e.target.value };
                  store().saveCustomUnit(selectedUnitId, { writing });
                  reloadData();
                  showNotification('Đã lưu câu chuẩn ngữ pháp!');
                }}
                className="w-full rounded-xl bg-white px-3 py-2 text-sm font-bold border border-banana-soft"
              />
            </div>
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

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Biểu tượng (Emoji):</label>
                  <input
                    type="text"
                    value={wordForm.emoji}
                    onChange={(e) => setWordForm({ ...wordForm, emoji: e.target.value })}
                    placeholder="Ví dụ: 🔭"
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
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
    </div>
  );
}
