import { useState, useEffect } from 'react';
import { resolveQuestionType } from '../../../utils/questionGrading.js';

const TYPE_TABS = [
  { id: 'multiple_choice', label: '🏷️ Trắc nghiệm', activeCls: 'bg-mint text-white shadow-xs' },
  { id: 'fill_blank', label: '✏️ Điền khuyết', activeCls: 'bg-sky text-ink shadow-xs' },
  { id: 'unscramble', label: '🧩 Sắp xếp từ', activeCls: 'bg-peach text-white shadow-xs' },
  { id: 'sentence_completion', label: '✍️ Viết tiếp câu', activeCls: 'bg-purple-600 text-white shadow-xs' },
];

function makeInitialState(initialData, defaultType) {
  if (!initialData) {
    return {
      type: defaultType || 'multiple_choice',
      question: '',
      prompt: '',
      blankWord: '',
      correctSentence: '',
      correctAnswer: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      explain: '',
    };
  }
  const opts = Array.isArray(initialData.options) ? [...initialData.options] : [];
  while (opts.length < 4) opts.push('');
  return {
    type: resolveQuestionType(initialData),
    question: initialData.question || '',
    prompt: initialData.prompt || '',
    blankWord: initialData.blankWord || '',
    correctSentence: initialData.correctSentence || '',
    correctAnswer: initialData.correctAnswer || '',
    options: opts,
    answerIndex: Number(initialData.answerIndex) || 0,
    explain: initialData.explain || '',
  };
}

/**
 * Modal soạn / chỉnh sửa câu hỏi dùng chung cho:
 * - Ngân hàng câu hỏi & Giao bài tập (MCQ + Đề ngoài SGK 4 dạng)
 * - Biên tập Ngữ pháp & Đọc hiểu của Giáo viên
 */
export default function QuestionFormModal({
  isOpen,
  onClose,
  title = '➕ Soạn Câu Hỏi Mới',
  subtitle = '',
  initialData = null,
  defaultType = 'multiple_choice',
  allowedTypes = ['multiple_choice', 'fill_blank', 'unscramble', 'sentence_completion'],
  allowSaveAndNext = false,
  onSave,
  onError,
}) {
  const [form, setForm] = useState(() => makeInitialState(initialData, defaultType));

  useEffect(() => {
    if (isOpen) {
      setForm(makeInitialState(initialData, defaultType));
    }
  }, [isOpen, initialData, defaultType]);

  if (!isOpen) return null;

  const qType = allowedTypes.includes(form.type) ? form.type : allowedTypes[0];
  const notifyError = (msg) => {
    if (onError) onError(msg);
    else alert(msg);
  };

  const submitForm = (continueNext = false) => {
    let qText = form.question.trim();

    if (qType === 'unscramble') {
      if (!form.correctSentence.trim()) {
        return notifyError('Vui lòng nhập câu hoàn chỉnh để hệ thống xáo trộn từ!');
      }
      if (!qText) {
        qText = form.prompt.trim() || 'Sắp xếp các từ sau thành câu đúng ngữ pháp:';
      }
    } else if (qType === 'sentence_completion') {
      if (!form.prompt.trim() && !qText) {
        return notifyError('Vui lòng nhập vế đầu câu hoặc câu hỏi!');
      }
      if (!qText) qText = form.prompt.trim();
      if (!form.correctAnswer.trim() && !form.options.some((o) => o.trim())) {
        return notifyError('Vui lòng nhập vế hoàn thành đúng cho câu!');
      }
    } else if (qType === 'fill_blank') {
      if (!qText) {
        return notifyError('Vui lòng nhập câu chứa chỗ trống!');
      }
      if (!form.blankWord.trim() && !form.options.some((o) => o.trim())) {
        return notifyError('Vui lòng nhập từ cần điền đúng vào chỗ trống!');
      }
    } else {
      if (!qText) {
        return notifyError('Vui lòng nhập nội dung câu hỏi!');
      }
      const validOpts = form.options.map((o) => o.trim()).filter(Boolean);
      if (validOpts.length < 2) {
        return notifyError('Vui lòng nhập ít nhất 2 phương án trả lời trắc nghiệm!');
      }
      const keptIdx = form.options.map((o, i) => (o.trim() ? i : -1)).filter((i) => i >= 0);
      if (keptIdx.indexOf(Number(form.answerIndex)) < 0) {
        return notifyError('Đáp án đúng đang là một ô trống. Hãy chọn lại đáp án đúng.');
      }
    }

    const keptIdx = form.options.map((o, i) => (o.trim() ? i : -1)).filter((i) => i >= 0);
    const filteredOptions = form.options.map((o) => o.trim()).filter(Boolean);
    const remappedAnswer =
      qType === 'multiple_choice'
        ? Math.max(0, keptIdx.indexOf(Number(form.answerIndex)))
        : Number(form.answerIndex) || 0;

    const blankWord = form.blankWord.trim() || filteredOptions[remappedAnswer] || '';
    const correctSentence = form.correctSentence.trim() || qText;
    const correctAnswer = form.correctAnswer.trim() || blankWord;

    const payload = {
      id: initialData?.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: qType,
      question: qText,
      prompt: form.prompt.trim() || qText,
      blankWord,
      correctSentence,
      correctAnswer,
      scrambledWords: correctSentence ? correctSentence.split(/\s+/).filter(Boolean) : [],
      options: filteredOptions,
      answerIndex: remappedAnswer,
      explain: form.explain.trim(),
      isCustom: true,
    };

    onSave?.(payload, { continueNext });

    if (continueNext) {
      setForm(makeInitialState(null, qType));
    } else {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-banana flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3">
          <div>
            <h3 className="text-xl font-black text-ink">{title}</h3>
            {subtitle && <p className="text-xs font-bold text-ink-soft">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {allowedTypes.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-cream border border-banana-soft">
            {TYPE_TABS.filter((t) => allowedTypes.includes(t.id)).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: t.id }))}
                className={`rounded-xl py-2 px-2 text-xs font-black transition-all cursor-pointer ${
                  qType === t.id ? t.activeCls : 'text-ink-soft hover:bg-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitForm(false);
          }}
          className="flex flex-col gap-3"
        >
          {qType === 'multiple_choice' && (
            <>
              <div>
                <label className="block text-xs font-black text-ink mb-1">Nội dung câu hỏi (*):</label>
                <textarea
                  rows={2}
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Ví dụ: She usually ______ to school by bicycle."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-2">
                  Các lựa chọn đáp án (Bấm chữ A, B, C, D để chọn đáp án đúng):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => {
                    const isCorrect = form.answerIndex === idx;
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
                          onClick={() => setForm({ ...form, answerIndex: idx })}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                            isCorrect ? 'bg-mint text-white shadow-sm' : 'bg-cream text-ink hover:bg-banana'
                          }`}
                          title={`Chọn đáp án ${letter} là đáp án đúng`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={form.options[idx] || ''}
                          onChange={(e) => {
                            const next = [...form.options];
                            next[idx] = e.target.value;
                            setForm({ ...form, options: next });
                          }}
                          placeholder={`Đáp án ${letter}...`}
                          className="w-full bg-transparent text-xs font-bold focus:outline-none"
                        />
                        {isCorrect && (
                          <span className="text-[10px] font-black text-mint-dark shrink-0 mr-1">✓ Đúng</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {qType === 'fill_blank' && (
            <>
              <div>
                <label className="block text-xs font-black text-ink mb-1">Câu chứa chỗ trống (*):</label>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Ví dụ: Mount Everest is the ______ mountain in the world."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
                <p className="text-[11px] font-bold text-ink-soft mt-1">
                  💡 Dùng dấu gạch dưới <code>______</code> để biểu thị chỗ trống.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Từ cần điền đúng vào chỗ trống (*):
                </label>
                <input
                  type="text"
                  required
                  value={form.blankWord}
                  onChange={(e) => setForm({ ...form, blankWord: e.target.value })}
                  placeholder="Ví dụ: highest"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink mb-1">
                  Các lựa chọn gợi ý (Tùy chọn - để trống nếu học sinh tự gõ):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {form.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...form.options];
                        next[i] = e.target.value;
                        setForm({ ...form, options: next });
                      }}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                      className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {qType === 'unscramble' && (
            <>
              <div>
                <label className="block text-xs font-black text-ink mb-1">Yêu cầu / Gợi ý tiếng Việt:</label>
                <input
                  type="text"
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
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
                  value={form.correctSentence}
                  onChange={(e) => setForm({ ...form, correctSentence: e.target.value })}
                  placeholder="Ví dụ: We visited our grandparents last weekend."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft resize-none"
                />
                <p className="text-[11px] font-bold text-peach-dark mt-1">
                  🧩 Hệ thống sẽ tự động tách các từ và xáo trộn để học sinh chạm ghép lại.
                </p>
              </div>
            </>
          )}

          {qType === 'sentence_completion' && (
            <>
              <div>
                <label className="block text-xs font-black text-ink mb-1">Vế đầu câu / Câu gợi ý (*):</label>
                <input
                  type="text"
                  required
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  placeholder="Ví dụ: If it rains tomorrow, we..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Vế hoàn thành đúng (*):</label>
                <input
                  type="text"
                  required
                  value={form.correctAnswer}
                  onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                  placeholder="Ví dụ: will stay at home"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink mb-1">
                  Các lựa chọn gợi ý (Tùy chọn):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {form.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...form.options];
                        next[i] = e.target.value;
                        setForm({ ...form, options: next });
                      }}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                      className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-ink mb-1">Giải thích / Căn cứ (Tùy chọn):</label>
            <input
              type="text"
              value={form.explain}
              onChange={(e) => setForm({ ...form, explain: e.target.value })}
              placeholder="Ví dụ: Áp dụng quy tắc thì hiện tại đơn / Dựa vào đoạn văn..."
              className="w-full rounded-xl bg-cream px-3 py-2 text-xs font-bold border border-banana-soft"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-banana-soft mt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-ink-soft hover:bg-cream cursor-pointer"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-2">
              {allowSaveAndNext && !initialData && (
                <button
                  type="button"
                  onClick={() => submitForm(true)}
                  className="rounded-xl bg-banana px-4 py-2 text-xs font-black text-ink shadow-[0_2px_0_var(--color-banana-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  💾 Lưu &amp; Soạn câu tiếp
                </button>
              )}
              <button
                type="submit"
                className="rounded-xl bg-mint px-5 py-2 text-xs font-black text-white shadow-[0_2px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
              >
                {initialData ? '✓ Lưu thay đổi' : '✓ Lưu câu hỏi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
