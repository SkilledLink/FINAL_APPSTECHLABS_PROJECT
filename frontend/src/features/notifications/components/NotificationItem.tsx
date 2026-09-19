// src/features/notifications/components/NotificationItem.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type {
  NotificationItemData,
  NotificationAction,
} from '../types/notification.types';
import { getNotificationTypeConfig } from '../services/notificationService';
import { formatRelativeTime } from '../utils/time';

interface NotificationItemProps {
  notification: NotificationItemData;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

function actionClasses(variant: NotificationAction['variant']): string {
  switch (variant) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/25 active:scale-[0.97]';
    case 'secondary':
      return 'border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md active:scale-[0.97]';
    default:
      return '';
  }
}

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: NotificationItemProps) {
  const [exiting, setExiting] = useState(false);
  const config = getNotificationTypeConfig(notification.type);
  const Icon = config.icon;
  const isUnread = !notification.read;

  const handleClick = () => {
    if (isUnread) onRead(notification.id);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExiting(true);
    setTimeout(() => onDismiss(notification.id), 220);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{
        opacity: exiting ? 0 : 1,
        y: exiting ? -4 : 0,
        scale: exiting ? 0.97 : 1,
        x: exiting ? 40 : 0,
      }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      onClick={handleClick}
      className={`
        group relative flex gap-3.5 p-4 rounded-2xl cursor-pointer
        border transition-all duration-200 overflow-hidden
        ${
          isUnread
            ? 'bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl border-blue-300/50 dark:border-blue-400/20 shadow-md shadow-blue-500/5'
            : 'bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border-white/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }
        hover:shadow-lg hover:shadow-blue-500/5
      `}
    >
      {/* Glass shine */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5" />

      {/* Unread accent bar */}
      {isUnread && (
        <motion.span
          layoutId={`unread-${notification.id}`}
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500"
        />
      )}

      {/* Icon */}
      <div
        className={`relative z-10 flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/50 dark:border-white/10 ${config.accent}`}
      >
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        {isUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm leading-snug truncate ${
                isUnread
                  ? 'font-bold text-slate-900 dark:text-white'
                  : 'font-semibold text-slate-700 dark:text-slate-300'
              }`}
            >
              {notification.title}
            </p>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actor role chip */}
        {notification.actorRole && (
          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-white/60 dark:border-white/10">
            {notification.actorRole}
          </span>
        )}

        {/* Actions */}
        {notification.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {notification.actions.map((action) => (
              <button
                key={action.label}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isUnread) onRead(notification.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${actionClasses(
                  action.variant,
                )}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2.5">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>
    </motion.article>
  );
}