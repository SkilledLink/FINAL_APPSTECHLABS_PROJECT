import { Check, BellOff } from 'lucide-react';
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
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/50 animate-pulse">
            <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <BellOff className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">All caught up</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {filter === 'unread'
            ? "You've read everything. No unread notifications."
            : 'No notifications to show right now.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {notifications.length} notification{notifications.length > 1 ? 's' : ''}
          {unreadCount > 0 && (
            <span className="ml-1 text-brand-600 dark:text-brand-400 font-medium">({unreadCount} unread)</span>
          )}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onRead={onRead}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
