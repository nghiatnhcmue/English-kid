/**
 * Danh mục 14 Sách Giáo Khoa Tiếng Anh (Global Success) chính thức
 * Bao gồm đầy đủ các khối lớp từ Tiểu học (Lớp 1-5), THCS (Lớp 6-8), THPT (Lớp 10-12).
 */

export const SCHOOL_LEVELS = [
  { id: 'all', label: 'Tất cả', shortLabel: 'Tất cả (14)', tone: 'bg-ink text-white' },
  { id: 'primary', label: 'Tiểu học', shortLabel: 'Tiểu học (Lớp 1-5)', tone: 'bg-emerald-600 text-white', grades: [1, 2, 3, 4, 5] },
  { id: 'secondary', label: 'THCS', shortLabel: 'THCS (Lớp 6-8)', tone: 'bg-banana text-ink', grades: [6, 7, 8] },
  { id: 'high', label: 'THPT', shortLabel: 'THPT (Lớp 10-12)', tone: 'bg-rose-600 text-white', grades: [10, 11, 12] },
];

export const OFFICIAL_BOOKS = [
  // ==========================================
  // TIỂU HỌC (LỚP 1 - LỚP 5)
  // ==========================================
  {
    id: 'sgk-1',
    code: 'sgk-1',
    aliases: ['sgk-1', 'lop1', 'g1'],
    grade: 1,
    schoolLevel: 'primary',
    title: 'SGK Tiếng Anh 1 – Global Success',
    shortTitle: 'Lớp 1',
    semester: 'Cả năm',
    badgeTone: 'bg-emerald-500 text-white',
    desc: 'Chương trình Tiếng Anh 1 Global Success. Làm quen tiếng Anh tự nhiên qua bài hát, hình ảnh sinh động và các trò chơi tương tác vui nhộn.',
    src: '/pdf/sgk-tieng-anh-1.pdf',
    downloadName: 'SGK-Tieng-Anh-1-Global-Success.pdf',
    fileSize: '47.3 MB',
    pages: '77 trang',
  },
  {
    id: 'sgk-2',
    code: 'sgk-2',
    aliases: ['sgk-2', 'lop2', 'g2'],
    grade: 2,
    schoolLevel: 'primary',
    title: 'SGK Tiếng Anh 2 – Global Success',
    shortTitle: 'Lớp 2',
    semester: 'Cả năm',
    badgeTone: 'bg-emerald-600 text-white',
    desc: 'Chương trình Tiếng Anh 2 Global Success. Tiếp nối rèn luyện phát âm chữ cái, mở rộng vốn từ vựng cơ bản và mẫu câu chào hỏi thường nhật.',
    src: '/pdf/sgk-tieng-anh-2.pdf',
    downloadName: 'SGK-Tieng-Anh-2-Global-Success.pdf',
    fileSize: '55.4 MB',
    pages: '77 trang',
  },
  {
    id: 'sgk-3-tap2',
    code: 'sgk-3-tap2',
    aliases: ['sgk-3-tap2', 'lop3-tap2', 'g3-t2'],
    grade: 3,
    schoolLevel: 'primary',
    title: 'SGK Tiếng Anh 3 – Tập 2 (Global Success)',
    shortTitle: 'Lớp 3 – T2',
    semester: 'Học kỳ II',
    badgeTone: 'bg-teal-500 text-white',
    desc: 'Chương trình Tiếng Anh 3 Tập 2 (Unit 11 đến Unit 20 và Review). Luyện tập các chủ đề gia đình, phòng ốc, trường học, bạn bè và thế giới quanh em.',
    src: '/pdf/sgk-tieng-anh-3-tap-2.pdf',
    downloadName: 'SGK-Tieng-Anh-3-Tap-2-Global-Success.pdf',
    fileSize: '11.1 MB',
    pages: '78 trang',
  },
  {
    id: 'sgk-4-tap1',
    code: 'sgk-4-tap1',
    aliases: ['sgk-4-tap1', 'lop4-tap1', 'g4-t1'],
    grade: 4,
    schoolLevel: 'primary',
    title: 'SGK Tiếng Anh 4 – Tập 1 (Global Success)',
    shortTitle: 'Lớp 4 – T1',
    semester: 'Học kỳ I',
    badgeTone: 'bg-cyan-500 text-white',
    desc: 'Chương trình Tiếng Anh 4 Tập 1 (Unit 1 đến Unit 10 và Review). Phát triển toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết bậc Tiểu học.',
    src: '/pdf/sgk-tieng-anh-4-tap-1.pdf',
    downloadName: 'SGK-Tieng-Anh-4-Tap-1-Global-Success.pdf',
    fileSize: '12.6 MB',
    pages: '83 trang',
  },
  {
    id: 'sgk-4-tap2',
    code: 'sgk-4-tap2',
    aliases: ['sgk-4-tap2', 'lop4-tap2', 'g4-t2'],
    grade: 4,
    schoolLevel: 'primary',
    title: 'SGK Tiếng Anh 4 – Tập 2 (Global Success)',
    shortTitle: 'Lớp 4 – T2',
    semester: 'Học kỳ II',
    badgeTone: 'bg-cyan-600 text-white',
    desc: 'Chương trình Tiếng Anh 4 Tập 2 (Unit 11 đến Unit 20 và Review). Nâng cao năng lực phản xạ tiếng Anh qua các tình huống giao tiếp lớp học và đời sống.',
    src: '/pdf/sgk-tieng-anh-4-tap-2.pdf',
    downloadName: 'SGK-Tieng-Anh-4-Tap-2-Global-Success.pdf',
    fileSize: '12.3 MB',
    pages: '79 trang',
  },
  {
    id: 'sgk-5-tap1',
    code: 'sgk-5-tap1',
    aliases: ['sgk-5-tap1', 'lop5-tap1', 'g5-t1'],
    grade: 5,
    schoolLevel: 'primary',
    title: 'SGK Tiếng Anh 5 – Tập 1 (Global Success)',
    shortTitle: 'Lớp 5 – T1',
    semester: 'Học kỳ I',
    badgeTone: 'bg-sky-500 text-white',
    desc: 'Chương trình Tiếng Anh 5 Tập 1 (Unit 1 đến Unit 10 và Review). Củng cố kiến thức ngữ pháp và mở rộng vốn từ vựng học tập phong phú.',
    src: '/pdf/sgk-tieng-anh-5-tap-1.pdf',
    downloadName: 'SGK-Tieng-Anh-5-Tap-1-Global-Success.pdf',
    fileSize: '13.1 MB',
    pages: '83 trang',
  },
  {
    id: 'sgk-5-tap2',
    code: 'sgk-5-tap2',
    aliases: ['sgk-5-tap2', 'lop5-tap2', 'g5-t2'],
    grade: 5,
    schoolLevel: 'primary',
    title: 'SGK Tiếng Anh 5 – Tập 2 (Global Success)',
    shortTitle: 'Lớp 5 – T2',
    semester: 'Học kỳ II',
    badgeTone: 'bg-sky-600 text-white',
    desc: 'Chương trình Tiếng Anh 5 Tập 2 (Unit 11 đến Unit 20 và Review). Hoàn thiện chuẩn đầu ra bậc 1 (A1) khung năng lực ngoại ngữ Việt Nam.',
    src: '/pdf/sgk-tieng-anh-5-tap-2.pdf',
    downloadName: 'SGK-Tieng-Anh-5-Tap-2-Global-Success.pdf',
    fileSize: '45.7 MB',
    pages: '78 trang',
  },

  // ==========================================
  // THCS (LỚP 6 - LỚP 8)
  // ==========================================
  {
    id: 'tap1',
    code: 'sgk-6-tap1',
    aliases: ['sgk-6-tap1', 'tap1', 'lop6-tap1', 'g6-t1'],
    grade: 6,
    schoolLevel: 'secondary',
    title: 'SGK Tiếng Anh 6 – Tập 1 (Global Success)',
    shortTitle: 'Lớp 6 – T1',
    semester: 'Học kỳ I',
    badgeTone: 'bg-banana text-ink',
    desc: 'Unit 1 đến Unit 6 và Review 1 – 2 (sách in trang 6 – 71). Đã tích hợp đầy đủ hệ thống bài học tương tác, 3D, từ vựng và bài tập trắc nghiệm.',
    src: '/pdf/sgk-tieng-anh-6-tap-1.pdf',
    downloadName: 'SGK-Tieng-Anh-6-Tap-1-Global-Success.pdf',
    fileSize: '16.0 MB',
    pages: '73 trang',
  },
  {
    id: 'tap2',
    code: 'sgk-6-tap2',
    aliases: ['sgk-6-tap2', 'tap2', 'lop6-tap2', 'g6-t2'],
    grade: 6,
    schoolLevel: 'secondary',
    title: 'SGK Tiếng Anh 6 – Tập 2 (Global Success)',
    shortTitle: 'Lớp 6 – T2',
    semester: 'Học kỳ II',
    badgeTone: 'bg-sky text-ink',
    desc: 'Unit 7 đến Unit 12 và Review 3 – 4 (sách in trang 6 – 71). Đã tích hợp đầy đủ hệ thống bài học tương tác, 3D, từ vựng và bài tập trắc nghiệm.',
    src: '/pdf/sgk-tieng-anh-6-tap-2.pdf',
    downloadName: 'SGK-Tieng-Anh-6-Tap-2-Global-Success.pdf',
    fileSize: '15.8 MB',
    pages: '73 trang',
  },
  {
    id: 'sgk-7',
    code: 'sgk-7',
    aliases: ['sgk-7', 'lop7', 'g7'],
    grade: 7,
    schoolLevel: 'secondary',
    title: 'SGK Tiếng Anh 7 – Global Success',
    shortTitle: 'Lớp 7',
    semester: 'Cả năm',
    badgeTone: 'bg-blue-600 text-white',
    desc: 'Trọn bộ SGK Tiếng Anh 7 Global Success (Unit 1 đến Unit 12, Review 1–4). Mở rộng kiến thức văn hóa, xã hội, ngữ pháp và dự án thực hành tiếng Anh.',
    src: '/pdf/sgk-tieng-anh-7.pdf',
    downloadName: 'SGK-Tieng-Anh-7-Global-Success.pdf',
    fileSize: '76.1 MB',
    pages: '143 trang',
  },
  {
    id: 'sgk-8',
    code: 'sgk-8',
    aliases: ['sgk-8', 'lop8', 'g8'],
    grade: 8,
    schoolLevel: 'secondary',
    title: 'SGK Tiếng Anh 8 – Global Success',
    shortTitle: 'Lớp 8',
    semester: 'Cả năm',
    badgeTone: 'bg-indigo-600 text-white',
    desc: 'Trọn bộ SGK Tiếng Anh 8 Global Success (Unit 1 đến Unit 12, Review 1–4). Nâng cao năng lực ngữ pháp, từ vựng học thuật và kỹ năng giao tiếp tự tin.',
    src: '/pdf/sgk-tieng-anh-8.pdf',
    downloadName: 'SGK-Tieng-Anh-8-Global-Success.pdf',
    fileSize: '35.1 MB',
    pages: '141 trang',
  },

  // ==========================================
  // THPT (LỚP 10 - LỚP 12)
  // ==========================================
  {
    id: 'sgk-10',
    code: 'sgk-10',
    aliases: ['sgk-10', 'lop10', 'g10'],
    grade: 10,
    schoolLevel: 'high',
    title: 'SGK Tiếng Anh 10 – Global Success',
    shortTitle: 'Lớp 10',
    semester: 'Cả năm',
    badgeTone: 'bg-violet-600 text-white',
    desc: 'Trọn bộ SGK Tiếng Anh 10 Global Success (Unit 1 đến Unit 10, Review 1–4). Khởi đầu bậc THPT theo chương trình GDPT 2018 với các chủ đề toàn cầu hóa.',
    src: '/pdf/sgk-tieng-anh-10.pdf',
    downloadName: 'SGK-Tieng-Anh-10-Global-Success.pdf',
    fileSize: '24.7 MB',
    pages: '134 trang',
  },
  {
    id: 'sgk-11',
    code: 'sgk-11',
    aliases: ['sgk-11', 'lop11', 'g11'],
    grade: 11,
    schoolLevel: 'high',
    title: 'SGK Tiếng Anh 11 – Global Success',
    shortTitle: 'Lớp 11',
    semester: 'Cả năm',
    badgeTone: 'bg-purple-600 text-white',
    desc: 'Trọn bộ SGK Tiếng Anh 11 Global Success (Unit 1 đến Unit 10, Review 1–4). Chuyên đề học thuật, tư duy phản biện và dự án tiếng Anh thực tế.',
    src: '/pdf/sgk-tieng-anh-11.pdf',
    downloadName: 'SGK-Tieng-Anh-11-Global-Success.pdf',
    fileSize: '27.5 MB',
    pages: '135 trang',
  },
  {
    id: 'sgk-12',
    code: 'sgk-12',
    aliases: ['sgk-12', 'lop12', 'g12'],
    grade: 12,
    schoolLevel: 'high',
    title: 'SGK Tiếng Anh 12 – Global Success',
    shortTitle: 'Lớp 12',
    semester: 'Cả năm',
    badgeTone: 'bg-rose-600 text-white',
    desc: 'Trọn bộ SGK Tiếng Anh 12 Global Success (Unit 1 đến Unit 10, Review 1–4). Ôn luyện tổng thể chuẩn bị tốt nghiệp THPT và chuẩn đầu ra bậc 3 (B1).',
    src: '/pdf/sgk-tieng-anh-12.pdf',
    downloadName: 'SGK-Tieng-Anh-12-Global-Success.pdf',
    fileSize: '32.1 MB',
    pages: '159 trang',
  },
];

/**
 * Tìm sách chính thức theo id, code hoặc alias
 */
export function findOfficialBook(idOrCode) {
  if (!idOrCode) return OFFICIAL_BOOKS[0];
  const query = String(idOrCode).trim().toLowerCase();
  const found = OFFICIAL_BOOKS.find(
    (b) =>
      b.id.toLowerCase() === query ||
      b.code?.toLowerCase() === query ||
      b.aliases?.some((a) => a.toLowerCase() === query)
  );
  return found || OFFICIAL_BOOKS[0];
}

/**
 * Lọc danh sách sách theo cấp học
 */
export function getBooksBySchoolLevel(level) {
  if (!level || level === 'all') return OFFICIAL_BOOKS;
  return OFFICIAL_BOOKS.filter((b) => b.schoolLevel === level);
}

/**
 * Lọc danh sách sách theo khối lớp
 */
export function getBooksByGrade(grade) {
  const g = Number(grade);
  if (!g) return OFFICIAL_BOOKS;
  return OFFICIAL_BOOKS.filter((b) => b.grade === g);
}
