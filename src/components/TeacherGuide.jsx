import { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Copy, HelpCircle, Layers, Lightbulb, Play, Send, Sparkles, UploadCloud } from 'lucide-react';

export default function TeacherGuide() {
  const [activeSection, setActiveSection] = useState('customize');
  const [copiedSample, setCopiedSample] = useState(false);

  const sampleZaloMsg = `Kính gửi Quý Phụ huynh và các em học sinh lớp 6,\nThầy/Cô gửi bài tập ôn luyện tuần này trên ứng dụng English-Kid:\n📌 Bài tập: Ôn luyện từ vựng & Luyện phát âm chuẩn\n⏰ Hạn hoàn thành: 21:00 Chủ Nhật tuần này\n👉 Link làm bài trực tiếp: https://english-kid.nghiaedu.workers.dev/#/?assign=TA6-W01-825\n(Các em học sinh bấm vào link là vào thẳng bài làm, không cần cài đặt phần mềm phức tạp).\nChúc các em học tập vui vẻ và đạt nhiều điểm 10!`;

  const copySampleMsg = () => {
    navigator.clipboard?.writeText(sampleZaloMsg);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Thanh chuyển các mục hướng dẫn */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        {[
          { id: 'customize', label: '1. Thêm từ & bài tập', icon: '✏️' },
          { id: 'assign', label: '2. Cách giao bài tuần', icon: '📅' },
          { id: 'share', label: '3. Gửi bài qua Zalo', icon: '📱' },
          { id: 'json', label: '4. Tùy biến sâu JSON', icon: '💻' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-sm font-black transition-all cursor-pointer ${
              activeSection === sec.id
                ? 'bg-peach text-white shadow-[0_4px_0_var(--color-peach-dark)] scale-[1.02]'
                : 'bg-white text-ink-soft hover:bg-cream border border-banana-soft/60'
            }`}
          >
            <span>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Mục 1: Cách chỉnh sửa và thêm từ vựng, audio, video */}
      {activeSection === 'customize' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
              Dành cho Giáo viên bộ môn
            </span>
            <h2 className="text-2xl font-black text-ink mt-2">
              📝 Hướng dẫn Thêm Từ vựng, Âm thanh & Video bài giảng
            </h2>
            <p className="text-sm font-bold text-ink-soft mt-1">
              Thầy cô có thể toàn quyền tùy biến bài học phù hợp với từng đối tượng học sinh của lớp mình.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <div className="flex items-center gap-2 text-peach font-black text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peach text-white text-xs">1</span>
                <span>Thêm Từ vựng & Câu ví dụ</span>
              </div>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Vào tab <strong>"Tùy biến Data"</strong> ➔ Chọn Unit cần sửa ➔ Bấm <strong>"+ Thêm từ vựng mới"</strong>. Thầy cô chỉ cần nhập từ tiếng Anh, loại từ, nghĩa tiếng Việt và câu ví dụ.
              </p>
            </div>

            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <div className="flex items-center gap-2 text-mint-dark font-black text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-white text-xs">2</span>
                <span>Âm thanh phát âm tự động</span>
              </div>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Hệ thống <strong>tự động nhận dạng và phát giọng đọc Anh - Anh chuẩn bản xứ</strong> từ Oxford/Cambridge qua Cloud TTS. Thầy cô cũng có thể chèn link file MP3 riêng nếu có.
              </p>
            </div>

            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sky-dark font-black text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky text-ink text-xs">3</span>
                <span>Nhúng Video YouTube</span>
              </div>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Thầy cô có bài giảng YouTube hay? Chỉ cần copy đường link (URL) YouTube dán vào tab <strong>"Video bài giảng"</strong>, học sinh sẽ xem trực tiếp ngay trong trạm học của Unit.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-banana-soft/40 p-4 border border-banana-soft">
            <h4 className="font-black text-ink text-sm flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-4 w-4 text-peach" /> Mẹo hay cho Thầy Cô:
            </h4>
            <p className="text-xs font-bold text-ink-soft leading-relaxed">
              Mọi thay đổi thầy cô lưu lại sẽ <strong>hiển thị ngay tức thì</strong> trên thiết bị. Thầy cô cũng có thể bấm nút <strong>"Khôi phục bài học gốc"</strong> bất kỳ lúc nào nếu muốn trở về bộ dữ liệu SGK ban đầu.
            </p>
          </div>
        </div>
      )}

      {/* Mục 2: Hướng dẫn giao bài tập theo tuần */}
      {activeSection === 'assign' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-black text-mint-dark">
              Linh hoạt theo trình độ
            </span>
            <h2 className="text-2xl font-black text-ink mt-2">
              📅 Cách Giao bài tập theo Tuần & Phân hóa học sinh
            </h2>
            <p className="text-sm font-bold text-ink-soft mt-1">
              Thầy cô có thể giao bài theo 4 hình thức linh hoạt tùy theo tiến độ trên lớp.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-cream p-4 border border-banana-soft flex items-start gap-3">
              <span className="text-2xl">🌟</span>
              <div>
                <h3 className="text-base font-black text-ink">Hình thức 1: Giao trọn bộ Unit (Full Unit)</h3>
                <p className="text-xs font-bold text-ink-soft mt-0.5 leading-relaxed">
                  Học sinh sẽ được giao trải nghiệm đủ 7 trạm của Unit: Từ vựng 3D, Phát âm, Ngữ pháp, Nghe, Nói, Đọc, Viết và làm bài Test Thử thách tổng hợp.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-cream p-4 border border-banana-soft flex items-start gap-3">
              <span className="text-2xl">🎙️</span>
              <div>
                <h3 className="text-base font-black text-ink">Hình thức 2: Giao theo kỹ năng cụ thể</h3>
                <p className="text-xs font-bold text-ink-soft mt-0.5 leading-relaxed">
                  Thầy cô có thể chỉ định riêng: <strong>Chỉ luyện Nói (Speaking Studio)</strong>, <strong>Chỉ luyện Nghe (Listening)</strong>, hoặc <strong>Chỉ làm trắc nghiệm Ngữ pháp</strong> khi lớp cần củng cố kỹ năng còn yếu.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-cream p-4 border border-banana-soft flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="text-base font-black text-ink">Hình thức 3: Tự chọn danh sách từ vựng cụ thể</h3>
                <p className="text-xs font-bold text-ink-soft mt-0.5 leading-relaxed">
                  Tích chọn 3 đến 5 từ vựng mà học sinh thường hay phát âm sai hoặc viết sai chính tả trên lớp để giao bài tập trọng tâm.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-cream p-4 border border-banana-soft flex items-start gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <h3 className="text-base font-black text-ink">Hình thức 4: Tự chọn các câu hỏi bài tập</h3>
                <p className="text-xs font-bold text-ink-soft mt-0.5 leading-relaxed">
                  Chọn lọc đúng các câu hỏi trắc nghiệm hoặc viết câu của Unit để giao bài kiểm tra 15 phút hoặc ôn tập trước kỳ thi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mục 3: Gửi bài qua Zalo cho phụ huynh và học sinh */}
      {activeSection === 'share' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-black text-sky-dark">
              1-Click Chia sẻ
            </span>
            <h2 className="text-2xl font-black text-ink mt-2">
              📱 Cách Gửi bài tập qua Zalo / Facebook cho Phụ huynh
            </h2>
            <p className="text-sm font-bold text-ink-soft mt-1">
              Sau khi tạo bài tập, mỗi bài sẽ có một **Mã bài tập** và **Đường link trực tiếp**.
            </p>
          </div>

          <div className="rounded-2xl bg-cream p-4 border-2 border-banana flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-ink text-sm flex items-center gap-1.5">
                💬 Tin nhắn mẫu gửi nhóm Zalo Phụ huynh:
              </span>
              <button
                onClick={copySampleMsg}
                className="flex items-center gap-1.5 rounded-xl bg-peach px-3 py-1.5 text-xs font-black text-white hover:bg-peach-dark transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedSample ? '✓ Đã sao chép tin nhắn!' : 'Sao chép tin nhắn'}
              </button>
            </div>
            <pre className="rounded-xl bg-white p-3.5 text-xs font-bold text-ink leading-relaxed whitespace-pre-wrap font-sans border border-banana-soft">
              {sampleZaloMsg}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-ink-soft">
            <div className="rounded-2xl bg-mint-soft/30 p-3.5 border border-mint/40">
              <p className="font-black text-mint-dark text-sm mb-1">✓ Học sinh mở bằng điện thoại hoặc máy tính:</p>
              <p>Phụ huynh chỉ cần nhấp vào link là ứng dụng tự mở bài tập thầy cô đã giao, không cần đăng ký tài khoản phức tạp.</p>
            </div>
            <div className="rounded-2xl bg-sky-soft/30 p-3.5 border border-sky/40">
              <p className="font-black text-sky-dark text-sm mb-1">✓ Tự động thu bài & gửi điểm về:</p>
              <p>Sau khi học sinh làm xong, điểm số và bài làm sẽ tự động cập nhật ngay trên Bảng điểm Giáo viên này.</p>
            </div>
          </div>
        </div>
      )}

      {/* Mục 4: Tùy biến sâu JSON (Chế độ Chuyên gia) */}
      {activeSection === 'json' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
              Dành cho Giáo viên Chuyên nghiệp
            </span>
            <h2 className="text-2xl font-black text-ink mt-2">
              💻 Hướng dẫn Tùy biến sâu vào Dữ liệu JSON
            </h2>
            <p className="text-sm font-bold text-ink-soft mt-1">
              Thầy cô am hiểu công nghệ có thể xuất toàn bộ giáo trình ra file JSON để lưu trữ hoặc chia sẻ cho các đồng nghiệp khác.
            </p>
          </div>

          <div className="space-y-3 text-xs font-bold text-ink-soft">
            <div className="rounded-2xl bg-cream p-4 border border-banana-soft">
              <h4 className="font-black text-ink text-sm mb-1">1. Sao lưu dữ liệu (Export JSON):</h4>
              <p className="leading-relaxed">
                Bấm nút <strong>"Tải file JSON sao lưu"</strong> trong tab Tùy biến Data. Thầy cô sẽ tải về 1 file chứa trọn vẹn toàn bộ các Unit, từ vựng, câu hỏi và video bài giảng đã chỉnh sửa.
              </p>
            </div>

            <div className="rounded-2xl bg-cream p-4 border border-banana-soft">
              <h4 className="font-black text-ink text-sm mb-1">2. Nhập dữ liệu mới (Import JSON):</h4>
              <p className="leading-relaxed">
                Khi cần chuyển giáo trình sang máy tính khác hoặc nạp bộ đề cương mới, thầy cô chỉ cần mở file JSON và bấm <strong>"Nạp dữ liệu từ file JSON"</strong>. Hệ thống sẽ tự động kiểm tra tính hợp lệ cú pháp trước khi áp dụng.
              </p>
            </div>

            <div className="rounded-2xl bg-cream p-4 border border-banana-soft">
              <h4 className="font-black text-ink text-sm mb-1">3. Khôi phục an toàn (Factory Reset):</h4>
              <p className="leading-relaxed">
                Bất kỳ lúc nào thầy cô cũng có thể nhấn nút <strong>"Khôi phục nguyên bản SGK Global Success"</strong> để hoàn tác mọi chỉnh sửa về trạng thái chuẩn ban đầu của Bộ Giáo Dục.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

