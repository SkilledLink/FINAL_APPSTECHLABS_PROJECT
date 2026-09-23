// src/features/notifications/components/NotificationDropdown.tsx

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCheck, ExternalLink } from 'lucide-react';

import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { getNamespace } from '../services/notificationService';
import type { NotificationDTO } from '../types/notification.types';

interface Props {
  onClose: () => void;
}

function resolveTarget(n: NotificationDTO): string | null {
  const p = (n.payload ?? {}) as Record<string, unknown>;

  if (n.type === 'social.message' && typeof p.conversation_id === 'string') {
    return `/home/messages/${p.conversation_id}`;
  }
  if (
    n.type === 'social.follow' &&
    Array.isArray(p.actor_ids) &&
    typeof p.actor_ids[0] === 'string'
  ) {
    return `/home/profile/${p.actor_ids[0]}`;
  }
  if (p.target_type === 'feed' && typeof p.target_id === 'string') {
    return `/home/feed/${p.target_id}`;
  }
  if (p.target_type === 'job' && typeof p.target_id === 'string') {
    return `/home/jobs/${p.target_id}`;
  }
  if (typeof p.feed_id === 'string') return `/home/feed/${p.feed_id}`;
  if (typeof p.professional_id === 'string') {
    return `/home/portfolio/${p.professional_id}`;
  }
  return null;
}

export function NotificationDropdown({ onClose }: Props) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismiss,
  } = useNotifications();
  const navigate = useNavigate();

  const items = notifications.slice(0, 6);
  const ns = items[0] ? getNamespace(items[0].type) : null;

  const handleItemClick = (n: NotificationDTO) => {
    if (!n.read_at) void markAsRead(n.id);
    const target = resolveTarget(n);
    if (target) {
      onClose();
      navigate(target);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 z-[9998] w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/70 px-4 py-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Notifications
        </p>
        {unreadCount > 0 && (
          <button
            onClick={() => void markAllAsRead()}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all
          </button>
        )}
      </div>

      {/* Scrollable list */}
      <div className="max-h-[420px] overflow-y-auto px-3 py-3">
        {items.length === 0 && !loading ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              You're all caught up
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              No notifications to show.
            </p>
          </div>
        ) : (
          <NotificationList
            notifications={items}
            loading={loading && items.length === 0}
            onRead={(id) => void markAsRead(id)}
            onDismiss={(id) => void dismiss(id)}
            onMarkAllRead={() => void markAllAsRead()}
            filter="all"
            unreadCount={unreadCount}
          />
        )}
      </div>

      {/* Footer */}
      <Link
        to="/home/notifications"
        onClick={onClose}
        className="flex items-center justify-center gap-2 border-t border-slate-200/70 dark:border-slate-800/70 px-4 py-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-500/5 transition-colors"
      >
        See all notifications
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}