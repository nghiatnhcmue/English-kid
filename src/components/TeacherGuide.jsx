import { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  FileText, 
  HelpCircle, 
  Image as ImageIcon, 
  Layers, 
  Lightbulb, 
  Play, 
  Send, 
  Sparkles, 
  Upload, 
  UserCheck, 
  Users 
} from 'lucide-react';

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
    <div className="flex flex-col gap-5">
      {/* Thanh 5 chuyển các mục hướng dẫn */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'customize', label: '1. Thêm từ & tải ảnh', icon: '✏️' },
          { id: 'assign', label: '2. Giao bài & Dán Word', icon: '📅' },
          { id: 'students', label: '3. Quản lý học sinh', icon: '👥' },
          { id: 'share', label: '4. Gửi bài qua Zalo', icon: '📱' },
          { id: 'json', label: '5. Tùy biến sâu JSON', icon: '💻' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center justify-center gap-1.5 rounded-2xl p-3 text-xs sm:text-sm font-black transition-all cursor-pointer ${
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

      {/* Mục 1: Thêm từ vựng & tải ảnh */}
      {activeSection === 'customize' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
              Dành cho Giáo viên bộ môn
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink mt-2">
              📝 Hướng dẫn Thêm Từ Vựng, Tải Ảnh & Video bài giảng
            </h2>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
              Thầy cô có thể toàn quyền tùy biến bài học phù hợp với từng đối tượng học sinh của lớp mình.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <div className="flex items-center gap-2 text-mint-dark font-black text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-white text-xs">1</span>
                <span>Thêm Unit học mới</span>
              </div>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Bấm nút <strong>"+ Thêm Unit Mới"</strong> cạnh ô chọn Unit. Thầy cô có thể tạo thêm Unit 13, 14... hoặc các chuyên đề ôn tập riêng. Unit mới sẽ hiển thị ngay trên Trang chủ và giao bài cho học sinh!
              </p>
            </div>

            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <div className="flex items-center gap-2 text-peach font-black text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peach text-white text-xs">2</span>
                <span>Tải ảnh từ máy tính</span>
              </div>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Vào tab <strong>"Tùy biến Data"</strong> ➔ Bấm <strong>"+ Thêm từ vựng mới"</strong>. Bấm nút <strong>"📁 Tải ảnh từ máy tính"</strong> hoặc dán link ảnh. <em>Nếu không có ảnh thì từ vựng sẽ để trống ảnh, không cần tìm emoji.</em>
              </p>
            </div>

            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sky-dark font-black text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky text-ink text-xs">3</span>
                <span>Âm thanh phát âm chuẩn</span>
              </div>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Hệ thống <strong>tự động nhận dạng và phát giọng đọc Anh - Anh chuẩn bản xứ</strong> từ Oxford/Cambridge qua Cloud TTS. Thầy cô cũng có thể <strong>tải trực tiếp file âm thanh (MP3, M4A)</strong> từ máy tính hoặc bấm <strong>Microphone để ghi âm trực tiếp giọng đọc</strong> của mình!
              </p>
            </div>

            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <div className="flex items-center gap-2 text-purple-700 font-black text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white text-xs">4</span>
                <span>Nhúng Video YouTube</span>
              </div>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Thầy cô có bài giảng YouTube hay? Chỉ cần copy đường link YouTube dán vào tab <strong>"Video bài giảng"</strong>, học sinh sẽ xem trực tiếp ngay trong trạm học của Unit.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-banana-soft/40 p-4 border border-banana-soft">
            <h4 className="font-black text-ink text-sm flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-4 w-4 text-peach" /> Mẹo hay cho Thầy Cô:
            </h4>
            <p className="text-xs font-bold text-ink-soft leading-relaxed">
              Mọi thay đổi thầy cô lưu lại sẽ <strong>hiển thị ngay tức thì</strong> trên thiết bị của học sinh. Thầy cô cũng có thể bấm nút <strong>"Khôi phục bài học gốc"</strong> bất kỳ lúc nào nếu muốn trở về bộ dữ liệu SGK ban đầu.
            </p>
          </div>
        </div>
      )}

      {/* Mục 2: Hướng dẫn giao bài tập theo tuần & dán từ Word */}
      {activeSection === 'assign' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-black text-mint-dark">
              Linh hoạt theo tuần học
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink mt-2">
              📅 Cách Giao Bài Tập Tuần & Dán Nhanh Từ Word
            </h2>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
              Giao bài trọn bộ Unit, theo từng kỹ năng, hoặc tự soạn câu hỏi trắc nghiệm cực nhanh bằng Word.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-cream p-4 border border-banana-soft flex flex-col gap-2">
              <h3 className="text-sm font-black text-ink flex items-center gap-2">
                <span>⚡ Dán nhanh câu hỏi từ Word (Hàng loạt)</span>
              </h3>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Trong modal giao bài, chọn <strong>"📐 Chọn câu hỏi"</strong> ➔ Bấm <strong>"⚡ Dán từ Word"</strong>. Dán toàn bộ đề trắc nghiệm vào, thêm dấu <strong>*</strong> sau đáp án đúng (ví dụ: <code>B. wears*</code>) hoặc có dòng <code>Đáp án: B</code> ở cuối câu. Hệ thống tự nhận diện 10 - 20 câu chỉ trong 2 giây!
              </p>
            </div>

            <div className="rounded-2xl bg-cream p-4 border border-banana-soft flex flex-col gap-2">
              <h3 className="text-sm font-black text-ink flex items-center gap-2">
                <span>➕ Soạn từng câu hỏi trắc nghiệm</span>
              </h3>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Bấm <strong>"+ Soạn câu mới"</strong>: Nhập câu hỏi, 4 đáp án A, B, C, D. Bấm trực tiếp vào chữ cái [A] [B] [C] [D] để chọn đáp án đúng. Bấm <strong>"Lưu & Soạn câu tiếp theo"</strong> để nhập liên tục mà không bị đóng form.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-sky-soft/40 p-4 border border-sky/30 text-xs font-bold text-ink-soft">
            <p className="font-black text-sky-dark text-sm mb-1">🎯 5 hình thức giao bài tập linh hoạt:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Trọn bộ Unit:</strong> Học sinh luyện đủ 7 trạm và làm bài Test Thử thách tổng hợp.</li>
              <li><strong>Theo kỹ năng:</strong> Chỉ định riêng luyện Nói AI, Luyện Nghe, hoặc Ngữ pháp.</li>
              <li><strong>Tự chọn từ vựng:</strong> Tích chọn 3 - 5 từ vựng cần học sinh luyện lại.</li>
              <li><strong>Tự chọn câu hỏi:</strong> Giao đúng các câu hỏi trắc nghiệm thầy cô đã chọn hoặc tự biên soạn.</li>
              <li><strong>🚀 Đề ngoài SGK:</strong> Giao đề thi tự do bên ngoài chương trình SGK, hỗ trợ kèm đoạn văn đọc hiểu 5-10 câu hỏi, điền khuyết, sắp xếp từ và viết lại câu!</li>
            </ul>
          </div>
        </div>
      )}

      {/* Mục 3: Quản lý học sinh */}
      {activeSection === 'students' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
              Đơn giản hóa tuyệt đối
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink mt-2">
              👥 Hướng Dẫn Quản Lý Tài Khoản Học Sinh (Mã PIN 4 số)
            </h2>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
              Học sinh lớp 6 yếu tin học chỉ cần bấm vào hình Avatar và gõ 4 số PIN là đăng nhập được ngay!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <span className="text-2xl">👤</span>
              <h4 className="text-sm font-black text-ink">1. Thêm & Cấp mã PIN cho học sinh</h4>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Vào tab <strong>"Tài Khoản Học Sinh"</strong> ➔ Bấm <strong>"+ Thêm học sinh"</strong> hoặc <strong>"⚡ Nhập danh sách cả lớp"</strong> (dán từ Excel). Mỗi em sẽ có 1 mã PIN 4 số dễ nhớ (ví dụ: 1234, 0001).
              </p>
            </div>

            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <span className="text-2xl">🖨️</span>
              <h4 className="text-sm font-black text-ink">2. In thẻ tài khoản phát cho học sinh</h4>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Bấm nút <strong>"🖨️ In Thẻ Cả Lớp"</strong> để in thẻ đăng nhập nhỏ gọn (có họ tên, lớp, mã PIN). Phát cho học sinh dán vào bìa sách tiếng Anh để không bao giờ quên.
              </p>
            </div>

            <div className="rounded-2xl bg-cream/70 p-4 border border-banana-soft flex flex-col gap-2">
              <span className="text-2xl">🚀</span>
              <h4 className="text-sm font-black text-ink">3. Tự động đăng nhập từ lần sau</h4>
              <p className="text-xs font-bold text-ink-soft leading-relaxed">
                Lần đầu vào thiết bị, học sinh gõ PIN một lần. Từ lần thứ 2 trở đi, hệ thống <strong>tự động ghi nhớ tài khoản</strong>, học sinh mở web là vào học ngay mà không cần làm gì thêm!
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-sky-soft/40 p-4 border border-sky/30 text-xs font-bold text-ink-soft">
            <p className="font-black text-sky-dark text-sm mb-1">🔐 Tài khoản Cổng Quản Trị Giáo Viên:</p>
            <p>
              Tài khoản quản trị dành riêng cho thầy cô: Mã GV: <strong className="text-peach-dark">GV01</strong> | Mật khẩu: <strong className="text-mint-dark">123456789</strong>. Thầy cô có thể chủ động đổi mật khẩu mới bất cứ lúc nào qua nút <strong>"🔑 Đổi Mật Khẩu"</strong> ở góc trên trang.
            </p>
          </div>
        </div>
      )}

      {/* Mục 4: Gửi bài qua Zalo */}
      {activeSection === 'share' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-black text-sky-dark">
              1-Click Chia sẻ
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink mt-2">
              📱 Cách Gửi Bài Tập Qua Zalo / Facebook Cho Phụ Huynh
            </h2>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
              Mỗi bài tập tạo ra đều có nút sao chép link và tin nhắn mẫu để thầy cô gửi nhanh vào nhóm lớp.
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

      {/* Mục 5: Tùy biến sâu JSON */}
      {activeSection === 'json' && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-5">
          <div className="border-b border-banana-soft pb-4">
            <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-black text-peach-dark">
              Dành cho Giáo viên Chuyên nghiệp
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink mt-2">
              💻 Hướng dẫn Tùy biến sâu vào Dữ liệu JSON & Sao lưu
            </h2>
            <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
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
