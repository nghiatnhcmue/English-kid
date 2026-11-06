import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { User, Lock, KeyRound, Sparkles, X, Check, School, LogOut, ArrowRight, Delete } from 'lucide-react';
import { Button3D } from './ui.jsx';
import { store } from '../utils/storage.js';
import { playSfx } from '../utils/sfx.js';

export default function StudentAuthModal({ isOpen, onClose, onLoginSuccess, forceLogin = false }) {
  const currentStudent = store().getCurrentStudent();
  const allStudents = store().getStudents();

  // Danh sách các lớp
  const classList = useMemo(() => {
    const set = new Set();
    allStudents.forEach((s) => s.class && set.add(s.class));
    const arr = Array.from(set).sort();
    return arr.length ? arr : ['6A1'];
  }, [allStudents]);

  const [selectedClass, setSelectedClass] = useState(classList[0] || '6A1');
  const [activeTab, setActiveTab] = useState('oneclick'); // 'oneclick' | 'manual'
  
  // Trạng thái chọn học sinh trong tab 1-click
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Trạng thái tab thủ công
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  if (!isOpen) return null;

  // Lọc học sinh theo lớp
  const filteredStudents = allStudents.filter(
    (s) => !selectedClass || s.class === selectedClass
  );

  // Xử lý khi chọn học sinh
  const handleSelectStudent = (stu) => {
    playSfx('click');
    setSelectedStudent(stu);
    setPinInput('');
    setErrorMsg('');
  };

  // Nhập số PIN trên bàn phím ảo
  const handlePinPress = (num) => {
    playSfx('click');
    if (pinInput.length < 8) {
      setPinInput((prev) => prev + String(num));
      setErrorMsg('');
    }
  };

  const handlePinDelete = () => {
    playSfx('click');
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  // Xác nhận đăng nhập từ tab 1-click
  const handleConfirmPinLogin = (e) => {
    e?.preventDefault();
    if (!selectedStudent) return;

    const res = store().loginStudent(selectedStudent.id, pinInput);
    if (res.success) {
      playSfx('victory');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setSuccessMsg(`Xin chào ${res.student.name}!`);
      setTimeout(() => {
        onLoginSuccess?.(res.student);
        onClose?.();
      }, 700);
    } else {
      playSfx('wrong');
      setErrorMsg(res.error || 'Mật khẩu chưa đúng, em thử lại nhé!');
      setPinInput('');
    }
  };

  // Xác nhận đăng nhập từ tab thủ công
  const handleManualLogin = (e) => {
    e?.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg('Vui lòng nhập mã học sinh hoặc tên của em.');
      return;
    }

    const res = store().loginStudent(usernameInput.trim(), passwordInput.trim());
    if (res.success) {
      playSfx('victory');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setSuccessMsg(`Xin chào ${res.student.name}!`);
      setTimeout(() => {
        onLoginSuccess?.(res.student);
        onClose?.();
      }, 700);
    } else {
      playSfx('wrong');
      setErrorMsg(res.error || 'Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  // Xử lý đăng xuất (khi học sinh đang đăng nhập mở modal này)
  const handleLogout = () => {
    playSfx('click');
    store().logoutStudent();
    setSelectedStudent(null);
    setPinInput('');
    setErrorMsg('');
    setSuccessMsg('');
    onLoginSuccess?.(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập học sinh"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-5 sm:p-7 shadow-2xl border-4 border-banana-soft flex flex-col gap-4 max-h-[92dvh] overflow-y-auto animate-pop">
        
        {/* Nút đóng (Chỉ hiện nếu không bị bắt buộc đăng nhập) */}
        {!forceLogin && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-ink-soft hover:bg-rose-soft hover:text-peach-dark cursor-pointer transition-colors"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> CHỈ HIỆN THÔNG TIN VÀ NÚT ĐĂNG XUẤT (KHÔNG CHO ĐỔI MẬT KHẨU) */}
        {currentStudent ? (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-banana text-5xl shadow-md border-2 border-banana-dark/20 animate-bounce">
              {currentStudent.avatar || '🦁'}
            </div>
            <div>
              <span className="rounded-full bg-mint text-white px-3 py-1 text-xs font-black uppercase shadow-xs">
                Đang đăng nhập
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-ink mt-2">
                {currentStudent.name}
              </h3>
              <p className="text-sm font-bold text-ink-soft mt-1">
                Lớp {currentStudent.class} · Mã học sinh: <span className="font-mono font-black text-ink">{currentStudent.username || currentStudent.id}</span>
              </p>
            </div>

            <div className="w-full rounded-2xl bg-cream p-4 border border-banana-soft text-left text-xs sm:text-sm font-bold text-ink-soft flex items-center gap-2.5">
              <span className="text-xl">ℹ️</span>
              <span>
                Tài khoản của em do thầy cô quản lý. Toàn bộ tiến độ và điểm số được tự động đồng bộ để thầy cô theo dõi.
              </span>
            </div>

            {/* Nút đăng xuất duy nhất */}
            <div className="w-full pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-soft px-5 py-3.5 text-base font-black text-peach-dark border-2 border-rose-300 hover:bg-rose-100 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất tài khoản này</span>
              </button>
              
              {!forceLogin && (
                <Button3D tone="banana" onClick={onClose} className="w-full py-3 text-base">
                  <span>Tiếp tục học bài</span>
                </Button3D>
              )}
            </div>
          </div>
        ) : (
          /* TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP -> KHUNG ĐĂNG NHẬP ĐƠN GIẢN */
          <div className="flex flex-col gap-4">
            {/* Tiêu đề */}
            <div className="text-center">
              <span className="rounded-full bg-peach text-white px-3.5 py-1 text-xs font-black uppercase shadow-xs inline-block">
                Chào mừng em đến với English-Kid
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-ink mt-2">
                Đăng Nhập Học Bài
              </h2>
              <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
                Em chọn tên mình trong danh sách để bắt đầu học và lưu điểm nhé!
              </p>
            </div>

            {/* Chuyển đổi tab chế độ đăng nhập */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-cream border border-banana-soft">
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setActiveTab('oneclick');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'oneclick'
                    ? 'bg-banana text-ink shadow-[0_2px_0_#d8b13c]'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <span>👆 Chọn tên 1-chạm</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setActiveTab('manual');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-banana text-ink shadow-[0_2px_0_#d8b13c]'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <span>⌨️ Nhập mã & Mật khẩu</span>
              </button>
            </div>

            {/* Thông báo lỗi / thành công */}
            {errorMsg && (
              <div className="rounded-2xl bg-rose-soft p-3 text-center text-xs sm:text-sm font-black text-peach-dark border border-rose-300 animate-shake">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="rounded-2xl bg-mint-soft p-3 text-center text-sm font-black text-mint-dark border border-mint animate-pop">
                🎉 {successMsg}
              </div>
            )}

            {/* CHẾ ĐỘ 1: CHỌN TÊN 1-CHẠM (DÀNH CHO HỌC SINH YẾU MÁY TÍNH) */}
            {activeTab === 'oneclick' && (
              <div className="flex flex-col gap-3">
                {/* Chọn Lớp */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-black text-ink-soft shrink-0">Lớp:</span>
                  {classList.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setSelectedClass(cls);
                        setSelectedStudent(null);
                        setPinInput('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                        selectedClass === cls
                          ? 'bg-sky-dark text-white shadow-xs'
                          : 'bg-cream text-ink-soft hover:bg-white border border-banana-soft'
                      }`}
                    >
                      Lớp {cls}
                    </button>
                  ))}
                </div>

                {/* Danh sách học sinh dạng lưới thẻ to */}
                {!selectedStudent ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black text-ink-soft">
                      Bấm vào tên của em trong danh sách:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {filteredStudents.map((stu) => (
                        <button
                          key={stu.id}
                          type="button"
                          onClick={() => handleSelectStudent(stu)}
                          className="flex items-center gap-2.5 p-3 rounded-2xl bg-cream/70 hover:bg-banana-soft active:scale-95 border-2 border-banana-soft hover:border-banana text-left transition-all cursor-pointer shadow-xs"
                        >
                          <span className="text-2xl sm:text-3xl shrink-0 leading-none">
                            {stu.avatar || '🦁'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-black text-ink truncate">
                              {stu.name}
                            </span>
                            <span className="block text-[11px] font-bold text-ink-soft">
                              Mã: {stu.username || stu.id}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* KHI ĐÃ BẤM CHỌN HỌC SINH -> HIỆN BÀN PHÍM SỐ BẤM MÃ PIN */
                  <div className="flex flex-col items-center gap-3 bg-cream p-4 rounded-3xl border-2 border-banana-soft animate-pop">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{selectedStudent.avatar || '🦁'}</span>
                        <div className="text-left">
                          <span className="block text-sm font-black text-ink">
                            {selectedStudent.name}
                          </span>
                          <span className="block text-xs font-bold text-ink-soft">
                            Lớp {selectedStudent.class}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(null)}
                        className="text-xs font-black text-sky-dark hover:underline cursor-pointer"
                      >
                        Chọn bạn khác
                      </button>
                    </div>

                    {/* Ô hiển thị mã PIN */}
                    <div className="w-full flex flex-col items-center gap-1.5 pt-1">
                      <span className="text-xs font-bold text-ink-soft">
                        Nhập mật khẩu (Mặc định: <strong>123</strong>):
                      </span>
                      <div className="flex items-center justify-center gap-2 h-12 w-full max-w-[220px] rounded-2xl bg-white border-2 border-banana px-4 shadow-inner">
                        {pinInput ? (
                          <span className="font-mono text-2xl tracking-[0.4em] font-black text-ink">
                            {'•'.repeat(pinInput.length)}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-ink-soft/50">
                            Bấm số bên dưới
                          </span>
                        )}
                      </div>
                    </div>

                    {/* BÀN PHÍM SỐ CẢM ỨNG / BẤM CHUỘT TO ĐÙNG */}
                    <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handlePinPress(num)}
                          className="h-12 rounded-2xl bg-white hover:bg-banana text-lg font-black text-ink shadow-[0_3px_0_#e2d6c2] active:translate-y-0.5 active:shadow-none border border-banana-soft transition-all cursor-pointer"
                        >
                          {num}
                        </button>
                      ))}
                      <div />
                      <button
                        type="button"
                        onClick={() => handlePinPress(0)}
                        className="h-12 rounded-2xl bg-white hover:bg-banana text-lg font-black text-ink shadow-[0_3px_0_#e2d6c2] active:translate-y-0.5 active:shadow-none border border-banana-soft transition-all cursor-pointer"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handlePinDelete}
                        className="h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 text-peach-dark flex items-center justify-center shadow-[0_3px_0_#f4c3be] active:translate-y-0.5 active:shadow-none border border-rose-200 transition-all cursor-pointer"
                        title="Xóa số"
                      >
                        <Delete className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Nút xác nhận đăng nhập */}
                    <div className="w-full pt-1">
                      <Button3D
                        type="button"
                        onClick={handleConfirmPinLogin}
                        tone="peach"
                        className="w-full py-3.5 text-base"
                      >
                        <span>Vào học ngay</span>
                        <ArrowRight className="h-5 w-5" />
                      </Button3D>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CHẾ ĐỘ 2: NHẬP MÃ & MẬT KHẨU BẰNG BÀN PHÍM */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualLogin} className="flex flex-col gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-black text-ink mb-1 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-peach" />
                    <span>Mã học sinh hoặc Tên của em:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Ví dụ: an6a1 hoặc Nguyễn Văn An"
                    className="w-full rounded-2xl bg-cream px-4 py-3 text-base font-bold text-ink border-2 border-banana-soft placeholder:text-ink-soft/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-ink mb-1 flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-sky-dark" />
                    <span>Mật khẩu:</span>
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu (Mặc định: 123)"
                    className="w-full rounded-2xl bg-cream px-4 py-3 text-base font-bold text-ink border-2 border-banana-soft placeholder:text-ink-soft/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana"
                  />
                </div>

                <div className="pt-2">
                  <Button3D type="submit" tone="peach" className="w-full py-3.5 text-base">
                    <span>Đăng nhập</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button3D>
                </div>
              </form>
            )}

            {/* Chuyển nhanh dành cho Giáo viên */}
            <div className="pt-2 border-t border-banana-soft text-center">
              <a
                href="#/teacher"
                onClick={onClose}
                className="text-xs font-bold text-sky-dark hover:underline inline-flex items-center gap-1"
              >
                <span>👨‍🏫 Thầy cô đăng nhập quản lý lớp học tại đây</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
