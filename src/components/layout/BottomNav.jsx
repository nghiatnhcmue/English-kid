import { NavLink } from 'react-router-dom';
import { playSfx } from '../../utils/sfx.js';

const MOBILE_NAV = [
  { to: '/', label: 'Bài học', icon: '📚', end: true },
  { to: '/search', label: 'Tìm kiếm', icon: '🔍' },
  { to: '/test', label: 'Test tuần', icon: '📝' },
  { to: '/journal', label: 'Nhật ký', icon: '📒' },
  { to: '/teacher', label: 'Giáo viên', icon: '👨‍🏫' },
];

export default function BottomNav() {
  return (
    <nav
      className="no-print md:hidden fixed inset-x-0 bottom-0 z-30 border-t-2 border-banana-soft bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur"
      aria-label="Điều hướng điện thoại"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {MOBILE_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={() => playSfx('click')}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 text-[10px] font-black transition-colors ${
                  isActive ? 'text-peach' : 'text-ink-soft'
                }`
              }
            >
              <span className="text-xl leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
