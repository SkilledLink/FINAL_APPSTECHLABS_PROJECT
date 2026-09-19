// src/features/notifications/components/NotificationList.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { Check, BellOff, Sparkles } from 'lucide-react';
import type { NotificationItemData } from '../types/notification.types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationItemData[];
  loading: boolean;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  filter: string;
  unreadCount: number;
}

export function NotificationList({
  notifications,
  loading,
  onRead,
  onDismiss,
  onMarkAllRead,
  filter,
  unreadCount,
}: NotificationListProps) {
  /* ── Loading skeleton ────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative flex gap-3.5 p-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl animate-pulse overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-200/70 dark:bg-white/10" />
            <div className="flex-1 space-y-2.5 pt-0.5">
              <div className="h-3.5 bg-slate-200/70 dark:bg-white/10 rounded-full w-3/4" />
              <div className="h-3 bg-slate-200/60 dark:bg-white/8 rounded-full w-full" />
              <div className="h-3 bg-slate-200/60 dark:bg-white/8 rounded-full w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Empty state ─────────────────────────────────── */
  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl p-10 sm:p-14 text-center shadow-xs"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/15 dark:bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BellOff className="w-7 h-7" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
        </div>

        <h3 className="relative text-base font-bold text-slate-900 dark:text-slate-100">
          {filter === 'unread' ? 'All caught up' : 'Quiet in here'}
        </h3>
        <p className="relative mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {filter === 'unread'
            ? "You've read everything. No unread notifications."
            : 'No notifications to show right now.'}
        </p>
      </motion.div>
    );
  }

  /* ── List ────────────────────────────────────────── */
  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-1 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {notifications.length} notification
          {notifications.length > 1 ? 's' : ''}
          {unreadCount > 0 && (
            <span className="ml-2 normal-case text-blue-600 dark:text-blue-400">
              • {unreadCount} unread
            </span>
          )}
        </p>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200/60 dark:border-blue-500/20 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all as read
          </motion.button>
        )}
      </div>

      {/* Items */}
      <AnimatePresence mode="popLayout" initial={false}>
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onRead={onRead}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}