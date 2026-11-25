import { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { Button3D } from '../../ui.jsx';
import { changeTeacherPassword } from '../../../utils/api.js';

export default function TeacherPasswordPanel({ username, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    if (!oldPassword) return setError('Vui lòng nhập mật khẩu hiện tại!');
    if (newPassword.length < 8) return setError('Mật khẩu mới cần ít nhất 8 ký tự!');
    if (newPassword !== confirmPassword) return setError('Xác nhận mật khẩu không khớp!');

    const res = await changeTeacherPassword(oldPassword, newPassword);
    if (res.success) {
      setSuccess('🎉 Đã đổi mật khẩu. Các máy khác đang đăng nhập tài khoản này đã bị đăng xuất.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose?.();
      }, 2500);
    } else {
      setError(res.error);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border-2 border-banana-soft flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-banana-soft pb-3">
        <div>
          <h3 className="text-lg font-black text-ink flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-peach" />
            <span>Đổi mật khẩu (tài khoản: {username})</span>
          </h3>
          <p className="text-xs font-bold text-ink-soft mt-0.5">
            Đổi xong, các máy khác đang đăng nhập tài khoản này sẽ bị đăng xuất.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-black text-ink-soft hover:text-ink cursor-pointer"
        >
          ✕ Đóng
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['Mật khẩu hiện tại:', oldPassword, setOldPassword, 'current-password'],
            ['Mật khẩu mới (≥ 8 ký tự):', newPassword, setNewPassword, 'new-password'],
            ['Nhập lại mật khẩu mới:', confirmPassword, setConfirmPassword, 'new-password'],
          ].map(([label, value, setter, ac]) => (
            <label key={label} className="block text-xs font-black text-ink">
              <span className="mb-1 block">{label}</span>
              <input
                type="password"
                autoComplete={ac}
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  setError('');
                }}
                className="w-full rounded-2xl bg-cream px-3.5 py-2.5 text-sm font-bold text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
              />
            </label>
          ))}
        </div>

        {error && (
          <p className="text-xs font-black text-rose-600 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </p>
        )}
        {success && (
          <p className="text-xs font-black text-mint-dark flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{success}</span>
          </p>
        )}

        <div className="pt-1">
          <Button3D tone="mint" onClick={handleSubmit} className="min-h-11 py-2 px-5 text-sm">
            Lưu mật khẩu mới
          </Button3D>
        </div>
      </form>
    </section>
  );
}
