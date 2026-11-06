import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Users, UserPlus, KeyRound, Pencil, Trash2, Printer, Check, X, Sparkles, School, Search, FileText, Lock } from 'lucide-react';
import { Button3D } from './ui.jsx';
import { store } from '../utils/storage.js';
import { playSfx } from '../utils/sfx.js';

const AVATARS = ['🦁', '🦊', '🐱', '🐼', '🚀', '🦄', '⚽', '🎨', '📚', '🎒', '⭐', '🐬'];

export default function TeacherStudentManager() {
  const [students, setStudents] = useState(() => store().getStudents());
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Thêm / Sửa học sinh
  const [editingStudent, setEditingStudent] = useState(null); // null = đóng, {} = thêm mới, { id, ... } = sửa
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form thêm / sửa
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('6A1');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('123');
  const [formAvatar, setFormAvatar] = useState('🦁');

  // Form batch import
  const [batchClass, setBatchClass] = useState('6A1');
  const [batchDefaultPassword, setBatchDefaultPassword] = useState('123');
  const [batchNamesText, setBatchNamesText] = useState('');

  // Danh sách các lớp
  const classList = useMemo(() => {
    const set = new Set();
    students.forEach((s) => s.class && set.add(s.class));
    return ['all', ...Array.from(set).sort()];
  }, [students]);

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    let list = students;
    if (selectedClass !== 'all') {
      list = list.filter((s) => s.class === selectedClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.username?.toLowerCase().includes(q) ||
          s.class?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, selectedClass, searchQuery]);

  // Mở modal thêm mới
  const handleOpenAddModal = () => {
    playSfx('click');
    setEditingStudent({});
    setFormName('');
    setFormClass(selectedClass !== 'all' ? selectedClass : '6A1');
    setFormUsername('');
    setFormPassword('123');
    setFormAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  };

  // Mở modal sửa
  const handleOpenEditModal = (stu) => {
    playSfx('click');
    setEditingStudent(stu);
    setFormName(stu.name || '');
    setFormClass(stu.class || '6A1');
    setFormUsername(stu.username || '');
    setFormPassword(stu.password || '123');
    setFormAvatar(stu.avatar || '🦁');
  };

  // Lưu học sinh
  const handleSaveStudent = (e) => {
    e?.preventDefault();
    if (!formName.trim()) return;

    const isNew = !editingStudent.id;
    const cleanUsername = formUsername.trim() || 
      (isNew ? `${formName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')}${formClass.toLowerCase()}` : editingStudent.username);

    const saved = store().saveStudent({
      id: editingStudent.id,
      name: formName.trim(),
      class: formClass.trim() || '6A1',
      username: cleanUsername,
      password: formPassword.trim() || '123',
      avatar: formAvatar,
    });

    setStudents(store().getStudents());
    setEditingStudent(null);
    playSfx('victory');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  // Xóa học sinh
  const handleDeleteStudent = (stu) => {
    if (window.confirm(`Thầy cô có chắc chắn muốn xóa tài khoản học sinh "${stu.name}" (${stu.class}) không?`)) {
      playSfx('click');
      store().deleteStudent(stu.id);
      setStudents(store().getStudents());
    }
  };

  // Nhập hàng loạt cả lớp
  const handleBatchImport = (e) => {
    e?.preventDefault();
    if (!batchNamesText.trim()) return;

    const added = store().batchImportStudents(batchNamesText, batchClass, batchDefaultPassword);
    setStudents(store().getStudents());
    setShowBatchModal(false);
    setBatchNamesText('');
    playSfx('victory');
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    alert(`🎉 Đã tạo thành công ${added.length} tài khoản học sinh cho Lớp ${batchClass}!`);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Thẻ điều khiển & Thống kê */}
      <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border-2 border-banana-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-peach text-white px-3 py-1 text-xs font-black uppercase shadow-xs">
            Quản lý tài khoản học sinh
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-ink mt-2">
            Danh Sách & Mật Khẩu Học Sinh
          </h2>
          <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
            Giáo viên quản lý toàn quyền: thêm, sửa, xóa, cấp lại mật khẩu. Học sinh chỉ cần chọn tên hoặc nhập mã để vào học.
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Button3D tone="mint" onClick={handleOpenAddModal} className="px-4 py-2.5 text-sm">
            <UserPlus className="h-4 w-4" />
            <span>Thêm học sinh</span>
          </Button3D>

          <Button3D tone="banana" onClick={() => setShowBatchModal(true)} className="px-4 py-2.5 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Thêm nhanh cả lớp</span>
          </Button3D>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-cream px-4 py-2.5 text-xs sm:text-sm font-black text-ink border border-banana-soft hover:bg-white shadow-xs cursor-pointer transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>In thẻ đăng nhập</span>
          </button>
        </div>
      </section>

      {/* Bộ Lọc Theo Lớp & Tìm Kiếm */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-banana-soft shadow-xs">
        {/* Bộ lọc lớp */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-black text-ink-soft shrink-0">Lớp:</span>
          {classList.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => {
                playSfx('click');
                setSelectedClass(cls);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
                selectedClass === cls
                  ? 'bg-peach text-white shadow-xs'
                  : 'bg-cream text-ink-soft hover:bg-banana-soft hover:text-ink border border-banana-soft'
              }`}
            >
              {cls === 'all' ? `Tất cả (${students.length})` : `Lớp ${cls}`}
            </button>
          ))}
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã HS..."
            className="w-full rounded-2xl bg-cream pl-10 pr-4 py-2 text-xs sm:text-sm font-bold text-ink border border-banana-soft placeholder:text-ink-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
          />
        </div>
      </div>

      {/* Bảng Danh Sách Học Sinh */}
      <section className="rounded-3xl bg-white p-5 shadow-xs border-2 border-banana-soft overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-ink-soft flex flex-col items-center gap-2">
            <span className="text-4xl">👨‍🎓</span>
            <p className="font-bold text-base">Chưa có học sinh nào phù hợp.</p>
            <Button3D tone="mint" onClick={handleOpenAddModal} className="mt-2 px-4 py-2 text-sm">
              <UserPlus className="h-4 w-4" /> Thêm học sinh đầu tiên
            </Button3D>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-banana-soft text-xs font-black uppercase text-ink-soft">
                  <th className="py-3 px-3">Học sinh</th>
                  <th className="py-3 px-3">Lớp</th>
                  <th className="py-3 px-3">Mã đăng nhập (Username)</th>
                  <th className="py-3 px-3">Mật khẩu</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-banana-soft/50">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-cream/60 transition-colors">
                    {/* Tên & Avatar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-banana text-2xl shadow-xs shrink-0">
                          {stu.avatar || '🦁'}
                        </span>
                        <div>
                          <span className="font-black text-ink text-base block">
                            {stu.name}
                          </span>
                          <span className="text-[11px] font-bold text-ink-soft">
                            ID: {stu.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Lớp */}
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-cream px-3 py-1 text-xs font-black text-ink border border-banana-soft">
                        {stu.class || '6A1'}
                      </span>
                    </td>

                    {/* Mã đăng nhập */}
                    <td className="py-3 px-3 font-mono font-black text-sky-dark text-sm">
                      {stu.username || stu.id}
                    </td>

                    {/* Mật khẩu */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-xl bg-banana-soft/60 px-2.5 py-1 font-mono font-black text-ink text-sm border border-banana">
                          {stu.password || '123'}
                        </span>
                      </div>
                    </td>

                    {/* Nút hành động */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(stu)}
                          className="flex items-center gap-1 rounded-xl bg-cream px-2.5 py-1.5 text-xs font-black text-ink hover:bg-banana hover:text-ink cursor-pointer transition-colors shadow-2xs border border-banana-soft"
                          title="Sửa thông tin hoặc đổi mật khẩu"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(stu)}
                          className="flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-black text-peach-dark hover:bg-rose-100 cursor-pointer transition-colors border border-rose-200"
                          title="Xóa học sinh này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL THÊM / SỬA HỌC SINH */}
      {editingStudent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl border-4 border-banana-soft flex flex-col gap-4 animate-pop">
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-ink-soft hover:bg-rose-soft hover:text-peach-dark cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-banana text-3xl shadow-xs">
                {formAvatar}
              </span>
              <div>
                <h3 className="text-xl font-black text-ink">
                  {editingStudent.id ? 'Sửa Tài Khoản Học Sinh' : 'Thêm Học Sinh Mới'}
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Giáo viên cài đặt thông tin và mật khẩu cho học sinh
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveStudent} className="flex flex-col gap-3.5 pt-1">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Họ và tên học sinh:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold text-ink border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
                />
              </div>

              {/* Lớp & Mã đăng nhập */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Lớp:
                  </label>
                  <input
                    type="text"
                    required
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="Ví dụ: 6A1"
                    className="w-full rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold text-ink border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Mã đăng nhập:
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Tự sinh nếu trống"
                    className="w-full rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold text-ink border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana font-mono"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Mật khẩu học sinh (Mặc định: 123):
                </label>
                <input
                  type="text"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Nhập mật khẩu (ví dụ: 123 hoặc 1234)"
                  className="w-full rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold text-ink border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana font-mono"
                />
              </div>

              {/* Chọn Avatar */}
              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Chọn biểu tượng đại diện:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setFormAvatar(av)}
                      className={`h-10 rounded-xl text-xl transition-all cursor-pointer flex items-center justify-center ${
                        formAvatar === av
                          ? 'bg-banana ring-2 ring-peach scale-105'
                          : 'bg-cream hover:bg-cream-dark/60'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button3D type="submit" tone="mint" className="flex-1 py-3 text-sm">
                  <Check className="h-4 w-4" />
                  <span>{editingStudent.id ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
                </Button3D>
                <Button3D
                  type="button"
                  tone="banana"
                  onClick={() => setEditingStudent(null)}
                  className="py-3 px-5 text-sm"
                >
                  <span>Hủy</span>
                </Button3D>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM NHANH CẢ LỚP (BATCH IMPORT) */}
      {showBatchModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-6 shadow-2xl border-4 border-banana-soft flex flex-col gap-4 animate-pop">
            <button
              type="button"
              onClick={() => setShowBatchModal(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-ink-soft hover:bg-rose-soft hover:text-peach-dark cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-banana text-3xl shadow-xs">
                ⚡
              </span>
              <div>
                <h3 className="text-xl font-black text-ink">
                  Thêm Nhanh Cả Lớp (Batch Import)
                </h3>
                <p className="text-xs font-bold text-ink-soft">
                  Dán danh sách tên học sinh (mỗi dòng 1 tên) để tạo hàng loạt tài khoản
                </p>
              </div>
            </div>

            <form onSubmit={handleBatchImport} className="flex flex-col gap-3.5 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Lớp áp dụng:
                  </label>
                  <input
                    type="text"
                    required
                    value={batchClass}
                    onChange={(e) => setBatchClass(e.target.value)}
                    placeholder="Ví dụ: 6A2"
                    className="w-full rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold text-ink border-2 border-banana-soft"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Mật khẩu mặc định:
                  </label>
                  <input
                    type="text"
                    required
                    value={batchDefaultPassword}
                    onChange={(e) => setBatchDefaultPassword(e.target.value)}
                    placeholder="Mặc định: 123"
                    className="w-full rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold text-ink border-2 border-banana-soft font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1 flex items-center justify-between">
                  <span>Dán danh sách tên học sinh (mỗi dòng 1 tên):</span>
                  <span className="text-ink-soft font-normal">
                    {batchNamesText.split('\n').filter((l) => l.trim()).length} học sinh
                  </span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={batchNamesText}
                  onChange={(e) => setBatchNamesText(e.target.value)}
                  placeholder={`Nguyễn Văn An\nTrần Thị Bình\nLê Hoàng Duy\nPhạm Quỳnh Chi...`}
                  className="w-full rounded-2xl bg-cream p-3 text-sm font-bold text-ink border-2 border-banana-soft placeholder:text-ink-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana font-mono"
                />
              </div>

              <div className="rounded-2xl bg-banana-soft/50 p-3 text-xs font-bold text-ink-soft flex items-center gap-2">
                <span>💡</span>
                <span>Hệ thống sẽ tự động tạo mã đăng nhập và gắn avatar ngẫu nhiên cho từng em.</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button3D type="submit" tone="mint" className="flex-1 py-3 text-sm">
                  <Check className="h-4 w-4" />
                  <span>Tạo danh sách tài khoản ngay</span>
                </Button3D>
                <Button3D
                  type="button"
                  tone="banana"
                  onClick={() => setShowBatchModal(false)}
                  className="py-3 px-5 text-sm"
                >
                  <span>Hủy</span>
                </Button3D>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IN DANH SÁCH THẺ ĐĂNG NHẬP */}
      {showPrintModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-6 shadow-2xl border-4 border-banana-soft flex flex-col gap-4 max-h-[90dvh] overflow-y-auto animate-pop">
            <button
              type="button"
              onClick={() => setShowPrintModal(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-ink-soft hover:bg-rose-soft hover:text-peach-dark cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b-2 border-banana-soft pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🖨️</span>
                <div>
                  <h3 className="text-xl font-black text-ink">
                    Danh Sách Thẻ Đăng Nhập {selectedClass !== 'all' ? `Lớp ${selectedClass}` : 'Toàn Trường'}
                  </h3>
                  <p className="text-xs font-bold text-ink-soft">
                    Thầy cô có thể in ra hoặc gửi cho học sinh dán vào vở học tập
                  </p>
                </div>
              </div>

              <Button3D
                tone="peach"
                onClick={() => window.print()}
                className="py-2 px-4 text-xs shrink-0"
              >
                <Printer className="h-4 w-4" /> In ngay
              </Button3D>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
              {filteredStudents.map((stu) => (
                <div
                  key={stu.id}
                  className="p-3 rounded-2xl border-2 border-dashed border-banana-dark/40 bg-cream/50 flex flex-col gap-1 text-center"
                >
                  <span className="text-2xl">{stu.avatar || '🦁'}</span>
                  <span className="font-black text-ink text-sm truncate">{stu.name}</span>
                  <span className="text-[11px] font-bold text-ink-soft">Lớp: {stu.class}</span>
                  <div className="mt-1 pt-1 border-t border-banana-soft/60 text-left text-[11px] font-mono">
                    <div>Mã: <strong className="text-sky-dark">{stu.username || stu.id}</strong></div>
                    <div>Pass: <strong className="text-peach-dark">{stu.password || '123'}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

