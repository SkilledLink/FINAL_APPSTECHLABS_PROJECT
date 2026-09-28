// src/features/notifications/components/NotificationBell.tsx

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';

import { useNotifications } from '../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [coords, setCoords] = useState<{ top: number; right: number } | null>(
    null,
  );

  /* Recompute the dropdown's fixed position from the bell */
  useEffect(() => {
    if (!open) return;

    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  /* Close on outside click + Escape */
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (wrapRef.current?.contains(target)) return;
      if (target.closest('[data-notification-dropdown]')) return;
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <>
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50/60 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-200/50 dark:hover:border-slate-700/50"
          aria-label="Notifications"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-md">
              {badgeText}
            </span>
          )}
        </button>
      </div>

      {open &&
        coords &&
        createPortal(
          <NotificationDropdown
            onClose={() => setOpen(false)}
            style={{ top: coords.top, right: coords.right }}
          />,
          document.body,
        )}
    </>
  );
}