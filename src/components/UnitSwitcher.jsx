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
      <span className="sr-only">{t.stage.chooseUnit}</span>
      <BookOpen className="pointer-events-none absolute left-3 h-5 w-5 text-ink-soft" aria-hidden />
      <select
        value={current}
        onChange={(e) => {
          playSfx('click');
          if (e.target.value) navigate(`/unit/${e.target.value}`);
        }}
        className="min-h-12 w-full cursor-pointer appearance-none rounded-2xl border-2 border-banana-soft bg-white py-2 pr-9 pl-10 text-base font-black text-ink shadow-[0_3px_0_#e9dcc4] focus-visible:ring-4 focus-visible:ring-banana focus-visible:outline-none"
      >
        <option value="">📚 {t.stage.chooseUnit}…</option>
        {units.map((u) => (
          <option key={u.unitId} value={u.unitId} disabled={!u.available}>
            {u.available ? '' : '🔒 '}Unit {u.unitId}: {u.titleEn}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-sm text-ink-soft" aria-hidden>
        ▼
      </span>
    </label>
  );
}
