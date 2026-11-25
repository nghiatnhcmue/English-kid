import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { store } from '../../../utils/storage.js';
import { videoEmbedUrl } from '../../../utils/video.js';

export default function VideoEditorTab({ unitId, videos = [], onReload, onNotify }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    url: '',
    channel: 'Tiếng Anh 6 - Thầy Cô',
    duration: '10:00',
    skill: 'Toàn diện',
    description: '',
  });

  const openAdd = () => {
    setForm({
      id: `vid_${Date.now()}`,
      title: '',
      url: '',
      channel: 'Tiếng Anh 6 - Thầy Cô',
      duration: '10:00',
      skill: 'Toàn diện',
      description: '',
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      alert('Vui lòng nhập tiêu đề và đường link YouTube.');
      return;
    }
    store().saveCustomUnit(unitId, { videos: [...videos, form] });
    setShowModal(false);
    onReload?.();
    onNotify?.('Đã thêm video bài giảng mới!');
  };

  const handleDelete = (vidId) => {
    if (!window.confirm('Thầy/Cô có chắc muốn xóa video này?')) return;
    store().saveCustomUnit(unitId, { videos: videos.filter((v) => v.id !== vidId) });
    onReload?.();
    onNotify?.('Đã xóa video khỏi bài học.', 'peach');
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
        <div>
          <h3 className="text-xl font-black text-ink">
            🎬 Video bài giảng Unit {unitId} ({videos.length} video)
          </h3>
          <p className="text-xs font-bold text-ink-soft mt-0.5">
            Nhúng các video YouTube bài giảng chất lượng cao để học sinh xem trực tiếp.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-mint px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-mint-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Thêm video YouTube</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded-full bg-peach-soft px-2 py-0.5 text-[11px] font-black text-peach-dark">
                    {vid.skill || 'Toàn diện'}
                  </span>
                  <h4 className="text-base font-black text-ink mt-1">{vid.title}</h4>
                  <p className="text-xs font-bold text-ink-soft">
                    Kênh: {vid.channel} · {vid.duration}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(vid.id)}
                  className="rounded-xl p-1.5 text-peach-dark hover:bg-peach-soft transition-all cursor-pointer"
                  title="Xóa video"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {vid.description && (
                <p className="mt-2 text-xs font-bold text-ink-soft leading-relaxed">{vid.description}</p>
              )}

              {videoEmbedUrl(vid.url) ? (
                <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black/10">
                  <iframe
                    src={videoEmbedUrl(vid.url)}
                    title={vid.title}
                    className="h-full w-full border-0"
                    allowFullScreen
                  />
                </div>
              ) : (
                vid.url && (
                  <p className="mt-2 text-xs font-bold text-peach-dark">
                    ⚠️ Chỉ nhúng được link YouTube hoặc Vimeo.
                  </p>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-banana flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-banana-soft pb-3">
              <h3 className="text-xl font-black text-ink">🎬 Thêm Video YouTube bài giảng</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-black text-ink hover:bg-peach hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-black text-ink mb-1">Tiêu đề video (*):</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Ôn tập ngữ pháp thì Hiện tại đơn"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Đường link YouTube (URL) (*):</label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Kênh giảng dạy:</label>
                  <input
                    type="text"
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink mb-1">Kỹ năng chính:</label>
                  <select
                    value={form.skill}
                    onChange={(e) => setForm({ ...form, skill: e.target.value })}
                    className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft cursor-pointer"
                  >
                    <option value="Từ vựng & Phát âm">Từ vựng &amp; Phát âm</option>
                    <option value="Ngữ pháp">Ngữ pháp</option>
                    <option value="Luyện nghe">Luyện nghe</option>
                    <option value="Luyện nói">Luyện nói</option>
                    <option value="Đọc & Viết">Đọc &amp; Viết</option>
                    <option value="Toàn diện">Toàn diện</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1">Ghi chú tóm tắt bài giảng:</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ví dụ: Xem kỹ phần quy tắc thêm -s/-es ở phút 04:30"
                  className="w-full rounded-xl bg-cream px-3 py-2 text-sm font-bold border border-banana-soft"
                />
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
                  Thêm video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
