import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { listUnits } from '../utils/data.js';
import { playSfx } from '../utils/sfx.js';
import { t } from '../i18n/vi.js';

/**
 * Dropdown chọn Unit (12 Unit Global Success 6). Unit chưa có dữ liệu thì bị khóa.
 * className quyết định cả kiểu hiển thị (vd "flex lg:hidden" hoặc "hidden lg:flex").
 */
export default function UnitSwitcher({ className = 'flex' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = pathname.match(/^\/unit\/(\d+)/)?.[1] ?? '';
  const units = listUnits();

  return (
    <label className={`relative items-center ${className}`}>
      <span className="sr-only">Chọn bài học</span>
      <BookOpen className="pointer-events-none absolute left-3 h-4 w-4 text-ink-soft shrink-0" aria-hidden />
      <select
        value={current}
        onChange={(e) => {
          playSfx('click');
          if (e.target.value) navigate(`/unit/${e.target.value}`);
        }}
        className="h-10 w-full cursor-pointer appearance-none rounded-2xl border border-banana-soft bg-white py-1.5 pr-8 pl-9 text-xs lg:text-sm font-extrabold text-ink shadow-[0_2px_0_#e9dcc4] hover:border-banana-dark/40 focus-visible:ring-3 focus-visible:ring-banana focus-visible:outline-none transition-all truncate"
      >
        <option value="">📚 Chọn bài học…</option>
        {units.map((u) => (
          <option key={u.unitId} value={u.unitId} disabled={!u.available}>
            {u.available ? '' : '🔒 '}Unit {u.unitId}: {u.titleEn}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-xs text-ink-soft" aria-hidden>
        ▼
      </span>
    </label>
  );
}
