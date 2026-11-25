import { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2, Upload, Volume2 } from 'lucide-react';
import { store } from '../../../utils/storage.js';
import { speak } from '../../../utils/speech.js';
import { readAudioFileAsDataUrl, compressImageToWebpDataUrl } from './mediaHelpers.js';

export default function VocabEditorTab({
  unitId,
  vocabularies = [],
  onReload,
  onNotify,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [wordForm, setWordForm] = useState({
    id: '',
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
  const [audioFileName, setAudioFileName] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(
    () => () => {
      if (audioRecorder && audioRecorder.state === 'recording') audioRecorder.stop();
    },
    [audioRecorder],
  );

  useEffect(() => {
    if (!isRecordingAudio) {
      setRecordingSeconds(0);
      return undefined;
    }
    const id = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecordingAudio]);

  const openAddWord = () => {
    setEditingWord(null);
    setWordForm({
      id: `u${unitId}_custom_${Date.now().toString().slice(-4)}`,
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
    setAudioFileName('');
    setIsRecordingAudio(false);
    setShowModal(true);
  };

  const openEditWord = (w) => {
    setEditingWord(w);
    setWordForm({ ...w, image: w.image || '', emoji: w.emoji || '' });
    setAudioFileName(
      w.audio && !w.audio.includes('dictvoice')
        ? w.audio.startsWith('data:')
          ? 'File âm thanh đã chèn'
          : w.audio
        : '',
    );
    setIsRecordingAudio(false);
    setShowModal(true);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, fileName } = await readAudioFileAsDataUrl(file);
      setAudioFileName(fileName);
      setWordForm((prev) => ({ ...prev, audio: dataUrl }));
      onNotify?.(`Đã tải file âm thanh "${fileName}"!`, 'mint');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Trình duyệt của thầy/cô chưa hỗ trợ micro thu âm trực tiếp.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        if (blob.size > 300 * 1024) {
          alert('Bản thu quá dài. Hãy thu lại thật ngắn (chỉ đọc từ hoặc câu ví dụ).');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setWordForm((prev) => ({ ...prev, audio: reader.result }));
          setAudioFileName('Bản thu âm trực tiếp');
          onNotify?.('Đã thu âm giọng đọc thành công!', 'mint');
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      setAudioRecorder(mediaRecorder);
      setIsRecordingAudio(true);
    } catch {
      alert('Không thể mở micro. Thầy/Cô vui lòng cấp quyền cho phép truy cập micro trên trình duyệt nhé!');
    }
  };

  const handleStopRecording = () => {
    if (audioRecorder && isRecordingAudio) {
      audioRecorder.stop();
      setIsRecordingAudio(false);
      setAudioRecorder(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToWebpDataUrl(file);
      setWordForm((prev) => ({ ...prev, image: compressed, emoji: '' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveWord = (e) => {
    e.preventDefault();
    if (!wordForm.word.trim() || !wordForm.meaning.trim()) {
      alert('Vui lòng nhập từ tiếng Anh và nghĩa tiếng Việt.');
      return;
    }

    const currentVocab = [...vocabularies];
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
      audio: (() => {
        const a = (wordForm.audio || '').trim();
        const wordChanged =
          editingWord && editingWord.word.trim().toLowerCase() !== wordForm.word.trim().toLowerCase();
        if (wordChanged && a === (editingWord.audio || '').trim()) return '';
        return a.includes('dictvoice') ? '' : a;
      })(),
      audioExample:
        editingWord &&
        (editingWord.exampleEn || '').trim() === wordForm.exampleEn.trim() &&
        !String(editingWord.audioExample || '').includes('translate_tts')
          ? editingWord.audioExample || ''
          : '',
    };

    if (editingWord) {
      const idx = currentVocab.findIndex((v) => v.id === editingWord.id);
      if (idx >= 0) currentVocab[idx] = cleanWord;
    } else {
      currentVocab.push(cleanWord);
    }

    store().saveCustomUnit(unitId, { vocabularies: currentVocab });
    setShowModal(false);
    onReload?.();
    onNotify?.(`Đã lưu từ vựng "${cleanWord.word}" thành công!`);
  };

  const handleDeleteWord = (wordId) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa từ vựng này khỏi bài học?')) return;
    const next = vocabularies.filter((v) => v.id !== wordId);
    store().saveCustomUnit(unitId, { vocabularies: next });
    onReload?.();
    onNotify?.('Đã xóa từ vựng thành công!', 'peach');
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
        <div>
          <h3 className="text-xl font-black text-ink">
            📚 Danh sách Từ vựng Unit {unitId} ({vocabularies.length} từ)
          </h3>
          <p className="text-xs font-bold text-ink-soft mt-0.5">
            Thầy cô có thể thêm từ vựng mới, sửa nghĩa, câu ví dụ hoặc âm thanh tùy ý.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddWord}
          className="inline-flex items-center gap-2 rounded-2xl bg-mint px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Thêm từ vựng mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {vocabularies.map((v) => (
          <div
            key={v.id}
            className="flex flex-col justify-between rounded-2xl bg-cream/70 p-4 border border-banana-soft hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {v.image ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-banana-soft shadow-xs">
                      <img src={v.image} alt={v.word} className="h-full w-full object-contain rounded-lg" />
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
                      <p className="text-xs font-bold text-ink-soft italic">&quot;{v.exampleEn}&quot;</p>
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
                type="button"
                onClick={() => openEditWord(v)}
                className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-sky-dark border border-banana-soft hover:bg-cream transition-all cursor-pointer"
              >
                <Pencil className="h-3 w-3" /> Sửa
              </button>
              <button
                type="button"
                onClick={() => handleDeleteWord(v.id)}
                className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-peach-dark border border-peach-soft hover:bg-peach-soft transition-all cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-banana flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <h3 className="text-xl font-black text-ink">
                {editingWord ? '✏️ Chỉnh sửa từ vựng' : `✨ Thêm từ vựng mới vào Unit ${unitId}`}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
                        <Volume2 className="h-3 w-3" /> Nghe thử
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

              <div className="rounded-2xl bg-cream/70 p-3.5 border-2 border-banana-soft flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-ink">🖼️ Ảnh minh họa từ vựng:</label>
                    <p className="text-[11px] font-bold text-ink-soft">
                      (Không bắt buộc - Tự động nén WebP siêu nhẹ khi tải lên)
                    </p>
                  </div>
                  {wordForm.image && (
                    <button
                      type="button"
                      onClick={() => setWordForm({ ...wordForm, image: '', emoji: '' })}
                      className="text-[11px] font-black text-peach-dark hover:underline cursor-pointer"
                    >
                      ✕ Xóa ảnh
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {wordForm.image ? (
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-1 border-2 border-banana shadow-sm">
                      <img src={wordForm.image} alt="Xem trước" className="h-full w-full object-contain rounded-xl" />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/70 border-2 border-dashed border-banana-soft text-ink-soft/60 text-center p-1">
                      <span className="text-xl">🖼️</span>
                      <span className="text-[10px] font-bold">Chưa có ảnh</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-banana px-4 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <span>📁 Tải ảnh từ máy tính / điện thoại</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      value={wordForm.image?.startsWith('data:') ? '(Ảnh đã tải từ máy tính)' : wordForm.image || ''}
                      onChange={(e) => setWordForm({ ...wordForm, image: e.target.value, emoji: '' })}
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
                      <Volume2 className="h-3 w-3" /> Nghe thử câu
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

              <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-black text-ink">🎙️ Âm thanh phát âm của từ:</label>
                  {wordForm.audio && (
                    <button
                      type="button"
                      onClick={() => {
                        setWordForm({ ...wordForm, audio: '' });
                        setAudioFileName('');
                      }}
                      className="text-[11px] font-black text-peach-dark hover:underline cursor-pointer"
                    >
                      ✕ Xóa file (Dùng giọng AI tự động)
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white border border-banana-soft">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-2xl shrink-0">{wordForm.audio ? '🔊' : '🤖'}</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-ink truncate">
                        {wordForm.audio
                          ? audioFileName || 'File âm thanh riêng của từ'
                          : 'Giọng đọc AI chuẩn bản ngữ Anh - Anh (Oxford/Cambridge)'}
                      </p>
                      <p className="text-[11px] font-bold text-ink-soft">
                        {wordForm.audio
                          ? 'Đã chèn file âm thanh riêng cho từ vựng này'
                          : 'Tự động phát âm chuẩn bản ngữ khi học sinh bấm loa'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (wordForm.audio) {
                        speak(wordForm.word.trim() || 'preview', { audio: wordForm.audio });
                      } else if (wordForm.word.trim()) {
                        speak(wordForm.word.trim(), { lang: 'en-GB' });
                      } else {
                        alert('Vui lòng nhập từ tiếng Anh trước để nghe thử.');
                      }
                    }}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-banana px-3 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Nghe thử</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-3.5 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>📁 Tải file âm thanh (MP3, WAV, M4A)</span>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>

                  {!isRecordingAudio ? (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-black text-peach-dark border border-peach shadow-2xs hover:bg-peach hover:text-white transition-all cursor-pointer"
                    >
                      <span>🎙️ Thu âm micro</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-black text-white shadow-2xs animate-pulse cursor-pointer"
                    >
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      <span>⏹️ Dừng thu ({recordingSeconds}s)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-banana px-6 py-2.5 text-sm font-black text-ink shadow-[0_3px_0_var(--color-banana-dark)] cursor-pointer"
                >
                  Lưu từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
