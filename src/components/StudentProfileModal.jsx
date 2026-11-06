import { useState } from 'react';
import confetti from 'canvas-confetti';
import { User, School, Sparkles, X, Check, Smile } from 'lucide-react';
import { Button3D } from './ui.jsx';
import { store } from '../utils/storage.js';
import { playSfx } from '../utils/sfx.js';

const AVATARS = ['🦊', '🦁', '🐱', '🚀', '⭐', '🐼', '🐬', '🦄', '⚽', '📚', '🎒', '🎨'];

export default function StudentProfileModal({ onClose, onSave }) {
  const current = store().getStudentInfo();
  const [name, setName] = useState(current.name || '');
  const [className, setClassName] = useState(current.class || '');
  const [avatar, setAvatar] = useState(current.avatar || '🦊');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleanName = name.trim() || 'Học sinh';
    const cleanClass = className.trim() || '6A1';
    const savedInfo = store().saveStudentInfo({
      name: cleanName,
      class: cleanClass,
      avatar,
    });
    playSfx('victory');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setSaved(true);
    onSave?.(savedInfo);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hồ sơ học sinh"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl border-4 border-banana-soft flex flex-col gap-5 animate-pop">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-ink-soft hover:bg-rose-soft hover:text-peach-dark cursor-pointer transition-colors"
          title="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-banana text-3xl shadow-sm">
            {avatar}
          </div>
          <div>
            <span className="rounded-full bg-peach text-white px-2.5 py-0.5 text-xs font-black uppercase">
              Hồ sơ học sinh
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-ink mt-0.5">
              Thông Tin Của Em
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm font-bold text-ink-soft">
          Em điền tên và lớp để thầy cô xem được tiến độ học tập và điểm số của em nhé!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nhập Họ và tên */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-ink mb-1.5 flex items-center gap-1.5">
              <User className="h-4 w-4 text-peach" />
              <span>Họ và tên của em:</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full rounded-2xl bg-cream px-4 py-3 text-base font-bold text-ink border-2 border-banana-soft placeholder:text-ink-soft/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana"
            />
          </div>

          {/* Nhập Lớp */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-ink mb-1.5 flex items-center gap-1.5">
              <School className="h-4 w-4 text-sky-dark" />
              <span>Lớp:</span>
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ví dụ: 6A1, 6A2..."
              className="w-full rounded-2xl bg-cream px-4 py-3 text-base font-bold text-ink border-2 border-banana-soft placeholder:text-ink-soft/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana"
            />
          </div>

          {/* Chọn Avatar Emoji */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-ink mb-1.5 flex items-center gap-1.5">
              <Smile className="h-4 w-4 text-mint-dark" />
              <span>Chọn biểu tượng đại diện:</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    playSfx('click');
                    setAvatar(av);
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-banana ring-3 ring-peach scale-110 shadow-xs'
                      : 'bg-cream/70 hover:bg-cream border border-banana-soft/60'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Nút lưu */}
          <div className="pt-2">
            <Button3D
              type="submit"
              tone={saved ? 'mint' : 'peach'}
              className="w-full py-3.5 text-base"
            >
              {saved ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Lưu thông tin học sinh</span>
                </>
              )}
            </Button3D>
          </div>
        </form>
      </div>
    </div>
  );
}

