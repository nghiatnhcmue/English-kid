import { useState } from 'react';
import confetti from 'canvas-confetti';
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, ShieldCheck, User } from 'lucide-react';
import { Button3D, PageHeader } from '../../ui.jsx';
import { loginTeacher, setupTeacher } from '../../../utils/api.js';
import { playSfx } from '../../../utils/sfx.js';

export default function TeacherAuthGate({ authStatus, onAuthenticated }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSetup = authStatus.needsSetup;
  const inputCls =
    'w-full rounded-2xl bg-cream px-4 py-3 text-base font-black text-ink border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-banana';

  const finishSuccess = () => {
    setLoginError('');
    setPasswordInput('');
    setConfirmPassword('');
    setSetupCode('');
    playSfx('victory');
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch {
      /* bỏ qua */
    }
    onAuthenticated?.();
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await loginTeacher(usernameInput, passwordInput);
    setBusy(false);
    if (res.success) finishSuccess();
    else {
      playSfx('wrong');
      setLoginError(res.error);
    }
  };

  const handleSetup = async (e) => {
    e?.preventDefault();
    if (busy) return;
    if (passwordInput.length < 8) return setLoginError('Mật khẩu cần ít nhất 8 ký tự.');
    if (passwordInput !== confirmPassword) return setLoginError('Hai lần nhập mật khẩu chưa khớp.');
    setBusy(true);
    const res = await setupTeacher({
      setupCode,
      username: usernameInput,
      password: passwordInput,
      displayName,
    });
    setBusy(false);
    if (res.success) finishSuccess();
    else {
      playSfx('wrong');
      setLoginError(res.error);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto py-4">
      <PageHeader title="👨‍🏫 Cổng Quản Trị Giáo Viên" backTo="/" backLabel="Về trang chủ" />

      <div className="flex flex-col items-center gap-5 rounded-[2.5rem] bg-white p-7 sm:p-9 shadow-lg border-4 border-banana-soft">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-banana via-banana-light to-amber-200 text-4xl shadow-md border-2 border-banana-dark/20">
            👨‍🏫
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-peach text-white shadow-xs">
            <Lock className="h-4 w-4" />
          </span>
        </div>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-ink">
            {isSetup ? 'Tạo tài khoản giáo viên' : 'Đăng nhập giáo viên'}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-ink-soft mt-1">
            {isSetup
              ? 'Lần đầu dùng: tạo tài khoản quản trị. Cần mã cài đặt (ADMIN_SETUP_CODE) do người quản lý website đặt trên Cloudflare.'
              : 'Quản lý lớp học, giao bài, xem điểm và soạn nội dung. Tài khoản được kiểm tra trên máy chủ.'}
          </p>
        </div>

        {authStatus.offline && (
          <p className="w-full rounded-2xl bg-banana-soft p-3 text-xs font-black text-ink">
            📡 Chưa kết nối được máy chủ. Cổng giáo viên cần có mạng.
          </p>
        )}

        {isSetup && !authStatus.setupEnabled ? (
          <div className="w-full rounded-2xl bg-cream p-4 text-sm font-bold text-ink border-2 border-banana">
            <p className="font-black text-peach-dark">Máy chủ chưa có mã cài đặt.</p>
            <ol className="mt-2 list-decimal list-inside space-y-1 text-xs sm:text-sm">
              <li>
                Vào Cloudflare Dashboard → Workers &amp; Pages → <strong>english-kid</strong> → Settings →
                Variables and Secrets.
              </li>
              <li>
                Bấm <strong>Add</strong>, chọn loại <strong>Secret</strong>, tên{' '}
                <code>ADMIN_SETUP_CODE</code>, giá trị là một mã bí mật do thầy cô tự đặt.
              </li>
              <li>Lưu (Deploy) rồi tải lại trang này và nhập mã đó để tạo tài khoản.</li>
            </ol>
          </div>
        ) : (
          <form onSubmit={isSetup ? handleSetup : handleLogin} className="flex w-full flex-col gap-4">
            {isSetup && (
              <>
                <label className="text-xs font-black text-ink">
                  <span className="mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-mint-dark" /> Mã cài đặt (ADMIN_SETUP_CODE):
                  </span>
                  <input
                    type="password"
                    value={setupCode}
                    onChange={(e) => {
                      setSetupCode(e.target.value);
                      setLoginError('');
                    }}
                    className={inputCls}
                    autoComplete="off"
                  />
                </label>
                <label className="text-xs font-black text-ink">
                  <span className="mb-1.5 block">Tên hiển thị (vd: Cô Hiền):</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputCls}
                  />
                </label>
              </>
            )}
            <label className="text-xs font-black text-ink">
              <span className="mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-sky-dark" /> Tên đăng nhập:
              </span>
              <input
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setLoginError('');
                }}
                placeholder={isSetup ? 'vd: cohien (chữ thường, không dấu)' : ''}
                className={inputCls}
                autoFocus
              />
            </label>
            <label className="text-xs font-black text-ink">
              <span className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-peach" /> Mật khẩu
                  {isSetup ? ' (ít nhất 8 ký tự)' : ''}:
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-[11px] font-black text-ink-soft hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
                </button>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSetup ? 'new-password' : 'current-password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError('');
                }}
                className={inputCls}
              />
            </label>
            {isSetup && (
              <label className="text-xs font-black text-ink">
                <span className="mb-1.5 block">Nhập lại mật khẩu:</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setLoginError('');
                  }}
                  className={inputCls}
                />
              </label>
            )}

            {loginError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 border border-rose-200 text-xs sm:text-sm font-black text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <Button3D
              tone="peach"
              onClick={isSetup ? handleSetup : handleLogin}
              className="w-full py-4 text-base sm:text-lg mt-1 font-black"
            >
              {busy ? 'Đang kiểm tra…' : isSetup ? 'Tạo tài khoản 🚀' : 'Đăng nhập 🚀'}
            </Button3D>
          </form>
        )}

        <p className="text-xs font-bold text-ink-soft flex items-center gap-1.5 text-center">
          <ShieldCheck className="h-4 w-4 text-mint-dark" />
          <span>Quên mật khẩu? Người quản lý website có thể đặt lại tài khoản trong Cloudflare D1.</span>
        </p>
      </div>
    </div>
  );
}
