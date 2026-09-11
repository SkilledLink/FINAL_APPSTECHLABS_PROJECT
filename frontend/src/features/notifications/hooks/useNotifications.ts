import { useCallback, useEffect, useState } from 'react';
import type { NotificationFilter, NotificationItemData } from '../types/notification.types';
import { fetchNotifications } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  useEffect(() => {
    let active = true;
    fetchNotifications().then((data) => {
      if (active) {
        setNotifications(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications: filtered,
    allNotifications: notifications,
    unreadCount,
    loading,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    dismiss,
  };
}
