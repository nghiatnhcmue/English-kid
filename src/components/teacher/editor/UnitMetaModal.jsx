import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const EMOJI_PRESETS = [
  '🤖', '🚀', '📚', '⚽', '🎨', '🎵', '🏥', '🔬', '🌍',
  '💡', '🏫', '🐾', '🍕', '🏕️', '💻', '🛸', '⭐', '🧩',
];

const COLOR_PRESETS = [
  { label: 'Vàng', hex: '#FFC83D' },
  { label: 'Xanh ngọc', hex: '#7ED6B5' },
  { label: 'Da trời', hex: '#8EC5FF' },
  { label: 'Cam đào', hex: '#FFB38A' },
  { label: 'Hồng', hex: '#FF9A9A' },
  { label: 'Tím', hex: '#C3A6FF' },
];

export default function UnitMetaModal({
  isOpen,
  isEditing = false,
  initialForm,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    () =>
      initialForm || {
        unitId: 13,
        titleEn: '',
        titleVi: '',
        topic: '',
        emoji: '🤖',
        color: '#FFC83D',
        description: '',
      },
  );

  useEffect(() => {
    if (isOpen && initialForm) {
      setForm(initialForm);
    }
  }, [isOpen, initialForm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-mint flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-banana-soft pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isEditing ? '✏️' : '🚀'}</span>
            <div>
              <h3 className="text-xl font-black text-ink">
                {isEditing ? `Chỉnh sửa Unit ${form.unitId}` : 'Tạo thêm Unit học mới'}
              </h3>
              <p className="text-xs font-bold text-ink-soft">
                {isEditing
                  ? 'Cập nhật tên bài học, emoji hoặc chủ đề'
                  : 'Mở rộng chương trình học theo nhu cầu riêng của lớp'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave?.(form);
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-ink mb-1">Số thứ tự Unit (*):</label>
              <input
                type="number"
                required
                min={13}
                max={99}
                disabled={isEditing}
                value={form.unitId}
                onChange={(e) => setForm({ ...form, unitId: Number(e.target.value) })}
                className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-black border border-banana-soft disabled:opacity-60"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-ink mb-1">Chủ đề (Topic):</label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
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
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              placeholder="Ví dụ: Robots in the Future"
              className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-black border border-banana-soft"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1">Tiêu đề Tiếng Việt (*):</label>
            <input
              type="text"
              required
              value={form.titleVi}
              onChange={(e) => setForm({ ...form, titleVi: e.target.value })}
              placeholder="Ví dụ: Robot trong tương lai"
              className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1.5 flex items-center justify-between">
              <span>Biểu tượng Unit (Emoji):</span>
              <span className="text-xl">{form.emoji || '📘'}</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-cream border border-banana-soft mb-2">
              {EMOJI_PRESETS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setForm({ ...form, emoji: em })}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-pointer ${
                    form.emoji === em ? 'bg-banana shadow-xs ring-2 ring-banana-dark' : 'bg-white'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              placeholder="Hoặc tự gõ emoji tùy ý..."
              className="w-full rounded-xl bg-cream px-3 py-1.5 text-xs font-bold border border-banana-soft"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1.5">Màu sắc thẻ bài học:</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.hex })}
                  className={`h-9 rounded-xl font-black text-xs flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                    form.color === c.hex
                      ? 'border-ink scale-105 shadow-xs'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex, color: '#2B231D' }}
                >
                  {form.color === c.hex && <span>✓</span>}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1">Mô tả tóm tắt nội dung bài học:</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ví dụ: Từ vựng và cấu trúc về các công nghệ thông minh, robot hỗ trợ con người..."
              className="w-full rounded-xl bg-cream px-3 py-2 text-xs font-bold border border-banana-soft resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-banana-soft">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-cream cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-mint px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_#58b292] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo Unit ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
