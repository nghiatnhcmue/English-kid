# TỔNG HỢP NGUỒN TÀI NGUYÊN MỞ, PHƯƠNG THỨC CHẤM PHÁT ÂM & CƠ CHẾ TƯƠNG TÁC TRỰC QUAN

Tài liệu kỹ thuật và thiết kế tương tác dành cho web app học tiếng Anh **English-Kid (SGK Tiếng Anh 6 Global Success)**.

---

## 1. NGUỒN TẢI TÀI NGUYÊN TRỰC TIẾP (MIỄN PHÍ & CHUẨN WEB)

| Loại tài nguyên | Nguồn tải uy tín & Chuẩn giáo dục | Định dạng tối ưu | Cách tìm & Tối ưu |
| :--- | :--- | :---: | :--- |
| **Giọng đọc bản xứ (Voice / Audio)** | • **Oxford & Cambridge Open Audio** (`oxfordlearnersdictionaries.com`, `dictionary.cambridge.org`)<br>• **Youdao Oxford/Cambridge API** (`dict.youdao.com/dictvoice`)<br>• **Wikimedia Commons / LinguaLibre** (`commons.wikimedia.org`)<br>• **Microsoft Edge Neural TTS / Google Speech** | `.mp3` | Tải về lưu trữ cục bộ trong dự án (`/assets/audio/unit[X]/[slug].mp3`) để chạy offline 100%, độ trễ 0ms, không phụ thuộc kết nối mạng. Dự phòng qua Youdao API và Web Speech API nội hợp. |
| **Video bài học & Hoạt hình (Video Resources)** | • **NXB Giáo Dục Việt Nam (Global Success)**<br>• **VTV7 Kids (Kênh TH Giáo dục Quốc gia)**<br>• **British Council LearnEnglish Kids**<br>• **ZIM Education / VietJack / Loigiaihay** | `YouTube Embed` (No-cookie) | Nhúng qua chuẩn bảo mật trẻ em: `https://www.youtube-nocookie.com/embed/{id}`. Tích hợp phụ đề song ngữ, câu hỏi suy ngẫm sau khi xem và nút mở trực tiếp trên YouTube. |
| **Mô hình 3D** | • **Poly Pizza** (`poly.pizza`)<br>• **Kenney Assets** (`kenney.nl`)<br>• **Quaternius** (`quaternius.com`) | `.glb` | Gõ từ vựng tiếng Anh (ví dụ: `calculator`, `backpack`, `sofa`). Chọn mẫu low-poly dưới **1 MB**, tối ưu texture bằng `glTF-Transform` để hiển thị mượt mà trên web và điện thoại. |
| **Âm thanh hiệu ứng (SFX)** | • **WebAudio Synthesizer** (nội hợp không cần file)<br>• **Mixkit Game SFX** (`mixkit.co/free-sound-effects/game`) | `.mp3` / WebAudio | Sử dụng 4 âm thanh thiết yếu:<br>1. `correct` (ting ting tươi vui)<br>2. `wrong` (tiếng cộc nhẹ nhàng, không chói tai)<br>3. `click` (tiếng lách cách bấm nút tự nhiên)<br>4. `victory` (tiếng pháo hoa chúc mừng hoàn thành). |
| **Hình ảnh 2D minh họa** | • **Flaticon** (`flaticon.com`)<br>• **Freepik Vector**<br>• **Custom SVG Studio** | `.svg` / `.webp` | Ưu tiên ảnh vector `.svg` siêu nhẹ (< 8KB) hoặc ảnh `.webp` nén qua Squoosh (kích thước tối đa $512 \times 512$, dung lượng dưới $30\text{ KB}$). |

---

## 2. PHƯƠNG THỨC NHẬN DIỆN GIỌNG NÓI & CHẤM PHÁT ÂM (SPEAKING ASSESSMENT)

Đối với học sinh lớp 6 mất gốc và trẻ nhỏ, hệ thống ưu tiên sự tự tin, tạo động lực và phản xạ tự nhiên hơn là bắt bẻ khắt khe về mặt phát âm.

### Cách 1: Web Speech API nội hợp (Khuyên dùng - 100% Client-side, không cần server)
- **Cơ chế:** Sử dụng trực tiếp `webkitSpeechRecognition` tích hợp sẵn trong trình duyệt Google Chrome, Edge, Safari.
- **Quy trình hoạt động:**
  1. Học sinh bấm nút **"Ghi âm"** 🎙️ $\rightarrow$ Đọc to từ/câu hiển thị trên màn hình.
  2. Trình duyệt nhận diện âm thanh và chuyển thành văn bản (`transcript`).
  3. Thuật toán so khớp chuỗi **Levenshtein Distance** tính toán độ tương đồng:

$$\text{Độ chính xác} = \left(1 - \frac{\text{Levenshtein}(S_{\text{chuẩn}}, S_{\text{học sinh}})}{\max(\text{len}(S_{\text{chuẩn}}), \text{len}(S_{\text{học sinh}}))}\right) \times 100\%$$

- **Chấm điểm động viên:**
  * **Khớp $\ge 80\%$ (hoặc $\ge 60\%$ với câu dài):** 3 sao ⭐⭐⭐ kèm lời khen *"Tuyệt vời! / Xuất sắc!"*.
  * **Khớp $50\% - 79\%$:** 2 sao ⭐⭐ kèm lời khen *"Gần đúng rồi, thử lại nhé!"*.
  * **Khớp $< 50\%$:** 1 sao ⭐ kèm gợi ý bấm loa nghe lại âm mẫu.

```javascript
// Đoạn mã nhận diện giọng nói gọn nhẹ trên trình duyệt
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-GB';
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript.toLowerCase().trim();
    const targetWord = "calculator";
    
    if (spokenText.includes(targetWord)) {
      playSuccessSound(); // Bật âm thanh chúc mừng
    } else {
      playTryAgainSound();
    }
  };
}
```

### Cách 2: Ghi âm so sánh trực quan (Audio Waveform Comparison)
- Sử dụng API `MediaRecorder` và `AudioContext` của trình duyệt.
- Học sinh bấm giữ mic để nói, sau khi thả mic thì web vẽ 2 đường sóng âm:
  * **Sóng 1:** Sóng âm mẫu chuẩn của người bản ngữ.
  * **Sóng 2:** Sóng âm thực tế của học sinh.
- Nút **"Nghe lại giọng mình"** (Replay recorded voice) cho phép học sinh tự nghe lại để phát hiện âm đuôi (*ending sounds* như `/s/`, `/t/`, `/d/`, `/k/`) mà không tạo áp lực sợ bị chấm điểm kém.

---

## 3. CÁC CƠ CHẾ TƯƠNG TÁC TRỰC QUAN (INTERACTIVE MECHANICS)

### 1. Thao tác 3D đa điểm chạm (3D Hotspots)
- Tích hợp thẻ `<model-viewer>` của Google.
- Trên các mô hình 3D (ví dụ: chiếc cặp sách `school bag`), gắn các điểm ghim (Hotspots) tọa độ 3D:
  * Bấm vào điểm ghim ở ngăn trước $\rightarrow$ Loa đọc *"pocket"*.
  * Bấm vào quai đeo $\rightarrow$ Loa đọc *"strap"*.
  * Bấm vào khóa kéo $\rightarrow$ Loa đọc *"zipper"*.

### 2. Kéo - Thả vào bối cảnh (Drag & Drop Context)
- Hiển thị mô phỏng một góc bàn học hoặc chiếc balo mở nắp.
- Xung quanh là các đồ vật thuộc nhiều môn học khác nhau.
- Đề bài: *"Hôm nay có tiết Toán, em hãy chọn com-pa và máy tính bỏ vào bàn học!"*
- Khi học sinh bấm/chọn đúng: Đồ vật bay vào vị trí kèm hiệu ứng sáng. Chọn sai đồ vật sẽ lắc lư nhẹ và nhắc nhở vui nhộn.

### 3. Đổi vật liệu thời gian thực (Dynamic Texture/Coloring)
- Khi học sinh bấm vào bảng màu sắc (`#EF4444` đỏ, `#3B82F6` xanh dương, `#22C55E` xanh lá...), thuộc tính `pbrMetallicRoughness.setBaseColorFactor` của mô hình 3D đổi ngay lập tức sang màu tương ứng.
- Đồng thời loa phát âm câu kết hợp: *"A red school bag"* $\rightarrow$ Giúp học sinh vừa học từ vựng đồ vật, vừa ôn tập tính từ chỉ màu sắc.

### 4. Phản hồi tức thì không gây nản chí (Positive Feedback Loop)
- **Khi làm đúng:** Kích hoạt hiệu ứng tung pháo hoa giấy (`canvas-confetti`), âm thanh ting ting ngắn (`correct.mp3`), tăng sao tích lũy và cập nhật tiến độ bài học.
- **Khi làm sai:** Vật thể chỉ lắc lư nhẹ (*shake animation* 0.3 giây), phát âm thanh gõ nhẹ (`wrong.mp3`). Tuyệt đối không dùng dấu gạch chéo đỏ lớn hay âm thanh còi báo động để tránh gây tâm lý sợ sai cho học sinh mất gốc.

