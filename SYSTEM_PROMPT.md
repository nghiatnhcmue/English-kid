# SYSTEM PROMPT: ỨNG DỤNG HỌC TIẾNG ANH 3D GLOBAL SUCCESS 6 (PWA)

> **Mô tả:** Hệ thống học từ vựng tiếng Anh bám sát SGK Global Success 6 (Bộ GD&ĐT), thiết kế chuyên biệt cho học sinh mất gốc và trẻ nhỏ.
> **Ngôn ngữ:** 100% Tiếng Việt thân thiện, ấm áp, không gây áp lực học tập.

---

## 1. TECH STACK & KIẾN TRÚC KỸ THUẬT
- **Framework:** React (Vite) + Tailwind CSS + Lucide Icons + Canvas-Confetti.
- **Hiển thị 3D & AR:** Tích hợp thư viện Google `@google/model-viewer` để nhúng file `.glb` siêu nhẹ (dưới 1MB), hỗ trợ xoay 360°, đổi màu vật thể, gắn thẻ điểm ghim (Hotspots) và chế độ AR trên điện thoại.
- **Phát âm (TTS & Audio):** Hệ thống âm thanh 3 lớp chống lỗi:
  1. Âm thanh MP3 chất lượng cao tải sẵn (Anh - Anh) cho cả từ vựng và câu ví dụ.
  2. Cloud TTS fallback khi thiếu file MP3.
  3. Web Speech API (`window.speechSynthesis`) với giọng chuẩn bản ngữ US/UK (`en-US`), hỗ trợ nút bấm tùy chỉnh tốc độ đọc chậm 0.8x cho người mất gốc.
- **Quản lý dữ liệu & Offline:**
  - Lưu toàn bộ tiến độ, chuỗi ngày học (streak), số sao đạt được và lịch sử bài kiểm tra hàng tuần trực tiếp vào `localStorage` của trình duyệt.
  - Không yêu cầu backend bắt buộc, không cần đăng nhập/tạo tài khoản, ứng dụng hoạt động mượt mà offline dưới dạng PWA.

---

## 2. BỐ CỤC GIAO DIỆN & TRẢI NGHIỆM (UI/UX)
- **Phong cách thẩm mỹ:** Đồ họa tròn trịa, màu sắc tươi sáng dịu mắt (pastel blue, vàng chuối, cam đào, xanh mint), bo góc mềm (`rounded-2xl`, `rounded-3xl`), font chữ tròn nét to (Nunito).
- **Thanh tiêu đề (Header):**
  - Dropdown chọn chủ đề học (12 Unit của Global Success 6, khởi tạo mặc định với Unit 1: My New School).
  - Huy hiệu hiển thị: Chuỗi ngày học liên tục (🔥 Streak), tổng số sao đạt được (⭐ Stars), và nút chuyển đổi âm thanh (🔊/🔇).
- **Sân khấu tương tác trung tâm (Main Interactive Stage):**
  - Khung chiếu 3D tương tác dạng mô phỏng theo ngữ cảnh (phòng học, tủ đồ, bối cảnh thời tiết).
  - Mỗi khi click/chọn một món đồ: Hiển thị thẻ từ vựng nổi bật (Từ tiếng Anh - Phiên âm IPA - Nghĩa tiếng Việt - Nút loa phát âm chuẩn).
  - Bảng dải màu sắc (Color Palette) bên dưới: Bấm đổi màu trực tiếp của đồ vật 3D tương ứng.
- **Thanh công cụ chức năng (Tool Dock):**
  - Nút "Bất ngờ" (Surprise Me / Xúc xắc): Tự động phối ngẫu nhiên đồ vật để tạo tình huống luyện nói (Speaking challenge).
  - Nút "Chấm điểm bối cảnh" (Context Evaluation): So khớp danh sách đồ vật đã chọn với bối cảnh hiện tại (ví dụ: mùa đông / tiết học Toán) để tính điểm, tặng sao và hiện lời khen ("Tuyệt vời!", "Thử lại nhé!").

---

## 3. CÁC CHẾ ĐỘ ÔN TẬP TỪ VỰNG (4 TẦNG HỌC TẬP)
Hệ thống 4 tab ôn tập linh hoạt cho mỗi Unit:
1. **Học từ mới (3D Flashcard):** Xoay ngắm mô hình 3D hoặc ảnh minh họa sắc nét, bấm loa nghe phát âm chuẩn/chậm, bấm lật mặt sau xem nghĩa tiếng Việt và câu ví dụ song ngữ học đường. Phím tắt: `Space` lật thẻ, `←` / `→` chuyển từ.
2. **Nối từ (Matching Game):** Giao diện 2 cột (Từ vựng tiếng Anh - Nghĩa tiếng Việt / Hình ảnh), click nối cặp đúng kèm hiệu ứng âm thanh và pháo hoa.
3. **Điền chữ khuyết (Spelling Quiz):** Hiển thị hình ảnh 3D và khung chữ bị khuyết (ví dụ: `c_mp_ss`), các bong bóng chữ cái bên dưới để học sinh chạm chọn ghép từ.
4. **Luyện phản xạ Nghe (Listening Challenge):** Nghe máy đọc từ vựng và chọn 1 trong 4 hình ảnh đại diện đúng nhất.

---

## 4. MODULE BÀI KIỂM TRA HÀNG TUẦN (WEEKLY TEST & SỔ TAY TIẾN ĐỘ)
- **Đề kiểm tra định kỳ:** Bộ 15 - 20 câu hỏi trắc nghiệm tổng hợp (Nhìn hình đoán từ, nghe chọn nghĩa, điền chữ vào câu miêu tả đơn giản).
- **Chấm điểm & Đánh giá:** Thang điểm 10 kèm số sao (1-3 sao). Kết thúc bài test bắn pháo hoa chúc mừng nếu đạt điểm cao.
- **Lưu trữ & Quản lý:**
  - Tự động ghi lại kết quả (Ngày làm bài, Điểm số, Số câu đúng/sai, Tên Unit) vào `localStorage`.
  - Mục "Sổ tay từ cần ôn lại": Tự động gom các từ làm sai trong bài kiểm tra vào danh sách riêng để học sinh click vào học lại ngay lập tức.
  - Tab "Lịch sử tuần": Hiển thị biểu đồ đường tiến độ điểm số (Score Trendline) của các tuần học đã qua.

---

## 5. CẤU TRÚC DỮ LIỆU MẪU (JSON SCHEMA)
Schema từ vựng chuẩn hóa (`src/data/unit1.json` và `unit2.json`):
```json
{
  "id": "u1_05",
  "word": "calculator",
  "phonetic": "/ˈkælkjuleɪtə/",
  "meaning": "Máy tính cầm tay",
  "wordType": "Danh từ",
  "hint": "Máy tính bỏ túi điện tử cầm tay dùng để tính toán nhanh trong giờ Toán",
  "exampleEn": "I use a calculator in maths lessons.",
  "exampleVi": "Em dùng máy tính cầm tay trong tiết Toán.",
  "image": "/assets/images/unit1/calculator.svg",
  "audio": "/assets/audio/unit1/calculator.mp3",
  "audioExample": "/assets/audio/unit1/calculator-example.mp3"
}
```

---

## 6. GÓC DÀNH CHO GIÁO VIÊN (TEACHER DASHBOARD)
- PIN bảo vệ: `1234`.
- Quản lý điểm bài kiểm tra theo lớp (Lớp 6A, 6B, 6C...).
- Phân tích Top từ học sinh hay sai nhất để giáo viên giảng lại trên lớp.
- Xuất báo cáo điểm bảng tính Excel/CSV chỉ với 1 click.
- Kết nối tự động Cloudflare D1 Database khi triển khai online.

