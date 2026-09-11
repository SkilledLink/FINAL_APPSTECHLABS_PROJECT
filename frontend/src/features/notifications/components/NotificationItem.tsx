import { useState } from 'react';
import { X } from 'lucide-react';
import type { NotificationItemData, NotificationAction } from '../types/notification.types';
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
      return 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600';
    case 'secondary':
      return 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800';
  }
}

export function NotificationItem({ notification, onRead, onDismiss }: NotificationItemProps) {
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
    setTimeout(() => onDismiss(notification.id), 250);
  };

  return (
    <article
      onClick={handleClick}
      className={`group relative flex gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200
        ${exiting ? 'animate-slide-out' : 'animate-fade-in'}
        ${isUnread
          ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800/50'
          : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
      {/* Unread dot */}
      {isUnread && (
        <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${config.dotColor} animate-pulse-dot`} />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${config.accent}`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          </div>
          {/* Dismiss on hover */}
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actor role */}
        {notification.actorRole && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.actorRole}</p>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${actionClasses(action.variant)}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>
    </article>
  );
}
