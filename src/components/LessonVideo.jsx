import { useState } from 'react';
import { Play, Eye, EyeOff, ExternalLink, HelpCircle, MessageSquareQuote } from 'lucide-react';
import { SpeakerButton } from './ui.jsx';
import { playSfx } from '../utils/sfx.js';

/**
 * Khối Video Hoạt hình & Bài giảng sinh động theo SGK Tiếng Anh 6 Global Success.
 * - Nhúng an toàn qua youtube-nocookie
 * - Kèm tóm tắt nội dung, các câu hội thoại then chốt có loa phát âm và câu hỏi gợi mở
 */
export default function LessonVideo({ video, unitTitle }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!video) return null;

  const youtubeWatchUrl = video.youtubeId
    ? `https://www.youtube.com/watch?v=${video.youtubeId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery || video.title)}`;

  return (
    <section aria-label="Video bài học" className="overflow-hidden rounded-[2.5rem] bg-white p-5 sm:p-7 shadow-[0_6px_0_#efe3cc] border-3 border-banana-soft">
      {/* Header Khối Video */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-banana-soft pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-soft to-peach text-2xl text-white shadow-xs" aria-hidden>
            🎬
          </span>
          <div>
            <span className="rounded-full bg-peach-soft px-3 py-0.5 text-xs font-black text-peach-dark">
              Video Bài Học & Hoạt Hình Chuẩn SGK
            </span>
            <h2 className="mt-1 text-xl sm:text-2xl font-black text-ink">
              {video.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              setIsOpen((o) => !o);
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-cream px-4 text-xs sm:text-sm font-black text-ink shadow-[0_2px_0_#efe3cc] hover:bg-banana transition-all cursor-pointer border border-[#efe3cc]"
          >
            {isOpen ? (
              <>
                <EyeOff className="h-4 w-4" /> <span>Thu gọn video</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> <span>Xem video</span>
              </>
            )}
          </button>
          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSfx('click')}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-peach px-4 text-xs sm:text-sm font-black text-white shadow-[0_2px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            title="Mở xem trên YouTube"
          >
            <span>Mở YouTube</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Nội dung video khi mở */}
      {isOpen && (
        <div className="mt-5 flex flex-col gap-5">
          {/* Khung nhúng YouTube 16:9 */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-ink/5 shadow-inner border-2 border-banana-soft">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full rounded-3xl border-0"
            />
          </div>

          {/* Tóm tắt nội dung bài học */}
          <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft/80 shadow-2xs">
            <p className="text-sm sm:text-base font-bold text-ink leading-relaxed">
              💡 <strong>Tóm tắt nội dung:</strong> {video.summaryVi}
            </p>
          </div>

          {/* Các câu thoại mẫu then chốt có loa phát âm */}
          {video.keySentences?.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-sm font-black uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <MessageSquareQuote className="h-4 w-4" />
                <span>Mẫu câu then chốt trong video (Bấm loa để luyện nghe & đọc theo):</span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {video.keySentences.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 shadow-2xs border border-[#efe3cc]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-black text-ink">&quot;{s.en}&quot;</p>
                      <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5">{s.vi}</p>
                    </div>
                    <SpeakerButton text={s.en} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Câu hỏi suy ngẫm sau khi xem */}
          {video.reflectionQuestion && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-sky-soft/40 p-4 border border-sky/30">
              <div className="flex items-center gap-2 text-ink">
                <HelpCircle className="h-5 w-5 text-sky-dark shrink-0" />
                <span className="text-sm sm:text-base font-black">
                  {video.reflectionQuestion}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setShowAnswer((a) => !a);
                }}
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-white px-3.5 text-xs font-black text-sky-dark shadow-xs hover:bg-sky-soft transition-all cursor-pointer border border-sky/40"
              >
                {showAnswer ? 'Ẩn gợi ý' : 'Xem gợi ý trả lời 💡'}
              </button>
              {showAnswer && (
                <div className="sm:hidden w-full text-xs font-bold text-ink-soft bg-white p-3 rounded-xl border border-sky/20">
                  Em hãy chú ý lắng nghe lại đoạn hội thoại ở phút đầu tiên nhé!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
