// ID của Unit: Lớp 6 và Unit giáo viên tự tạo dùng số (1, 2, 13…),
// các khối lớp khác dùng chuỗi dạng 'g7_u1'. KHÔNG dùng Number() trực tiếp: Number('g7_u1') = NaN
// làm mọi Unit của 11 khối lớp bị ghi chung vào một ô "NaN".

/** Chuẩn hóa ID: chuỗi toàn chữ số → số; 'g7_u1' giữ nguyên; rỗng/null → null. */
export function normUnitId(id) {
  if (id === null || id === undefined) return null;
  if (typeof id === 'number') return Number.isFinite(id) ? id : null;
  const s = String(id).trim();
  if (!s) return null;
  return /^\d+$/.test(s) ? Number(s) : s;
}

/** ID hợp lệ trỏ tới một Unit thật (0 = "đề ngoài SGK", không phải Unit). */
export const isRealUnitId = (id) => {
  const n = normUnitId(id);
  return n !== null && n !== 0;
};

/** Mẫu ID dạng chuỗi được máy chủ chấp nhận. */
export const GRADE_UNIT_RE = /^g\d{1,2}_u\d{1,2}$/;

/** Số thứ tự Unit để hiển thị ("Unit 3"), kể cả với ID 'g7_u3'. */
export function unitNumberOf(u) {
  if (u?.unit != null) return u.unit;
  const m = String(u?.unitId ?? '').match(/_u(\d+)$/);
  return m ? Number(m[1]) : u?.unitId;
}
