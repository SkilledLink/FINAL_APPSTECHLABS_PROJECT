// src/features/notifications/context/NotificationContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '../../../providers/AuthProvider';
import * as service from '../services/notificationService';
import type {
  NotificationDTO,
  NotificationFilter,
} from '../types/notification.types';

interface NotificationContextValue {
  notifications: NotificationDTO[];
  unreadCount: number;
  summary: Record<string, number>;
  loading: boolean;
  filter: NotificationFilter;
  setFilter: (f: NotificationFilter) => void;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

const POLL_INTERVAL_MS = 45_000;

function hasToken(): boolean {
  try {
    return Boolean(localStorage.getItem('access_token'));
  } catch {
    return false;
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!hasToken()) return;
    setLoading(true);
    try {
      const [count, sum, list] = await Promise.all([
        service.getUnreadCount(),
        service.getSummary(),
        service.listNotifications({ unread_only: false, skip: 0, limit: 20 }),
      ]);
      setUnreadCount(count);
      setSummary(sum);
      setNotifications(list.items);
    } catch {
      /* swallow — interceptor handles 401; other errors retried next tick */
    } finally {
      setLoading(false);
    }
  }, []);

  const pollCount = useCallback(async () => {
    if (!hasToken()) return;
    try {
      const [count, sum] = await Promise.all([
        service.getUnreadCount(),
        service.getSummary(),
      ]);
      setUnreadCount(count);
      setSummary(sum);
    } catch {
      /* swallow */
    }
  }, []);

  /* Initial fetch when the provider mounts */
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Refetch when auth state changes (login) */
  useEffect(() => {
    if (currentUser) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /* Interval polling — pauses when tab is hidden */
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        void pollCount();
      }
    };
    intervalRef.current = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [pollCount]);

  /* Refetch on window focus / tab visible */
  useEffect(() => {
    const onFocus = () => void pollCount();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void pollCount();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pollCount]);

  /* ─── Mutators (optimistic, revert on failure) ─── */

  const markAsRead = useCallback(
    async (id: string) => {
      const prevList = notifications;
      const prevCount = unreadCount;
      const target = notifications.find((n) => n.id === id);
      const wasUnread = !target?.read_at;

      setNotifications((ns) =>
        ns.map((n) =>
          n.id === id
            ? { ...n, read_at: n.read_at ?? new Date().toISOString() }
            : n,
        ),
      );
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await service.markRead(id);
        void pollCount();
      } catch {
        setNotifications(prevList);
        setUnreadCount(prevCount);
      }
    },
    [notifications, unreadCount, pollCount],
  );

  const markAsUnread = useCallback(
    async (id: string) => {
      const prevList = notifications;
      const prevCount = unreadCount;
      const target = notifications.find((n) => n.id === id);
      const wasRead = Boolean(target?.read_at);

      setNotifications((ns) =>
        ns.map((n) => (n.id === id ? { ...n, read_at: null } : n)),
      );
      if (wasRead) setUnreadCount((c) => c + 1);

      try {
        await service.markUnread(id);
        void pollCount();
      } catch {
        setNotifications(prevList);
        setUnreadCount(prevCount);
      }
    },
    [notifications, unreadCount, pollCount],
  );

  const markAllAsRead = useCallback(async () => {
    const prevList = notifications;
    const prevCount = unreadCount;
    const prevSummary = summary;
    const now = new Date().toISOString();

    setNotifications((ns) =>
      ns.map((n) => ({ ...n, read_at: n.read_at ?? now })),
    );
    setUnreadCount(0);
    setSummary({});

    try {
      await service.markAllRead();
    } catch {
      setNotifications(prevList);
      setUnreadCount(prevCount);
      setSummary(prevSummary);
    }
  }, [notifications, unreadCount, summary]);

  const dismiss = useCallback(
    async (id: string) => {
      const prevList = notifications;
      const prevCount = unreadCount;
      const target = notifications.find((n) => n.id === id);
      const wasUnread = target && !target.read_at;

      setNotifications((ns) => ns.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await service.deleteOne(id);
        void pollCount();
      } catch {
        setNotifications(prevList);
        setUnreadCount(prevCount);
      }
    },
    [notifications, unreadCount, pollCount],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      summary,
      loading,
      filter,
      setFilter,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      dismiss,
      refresh,
    }),
    [
      notifications,
      unreadCount,
      summary,
      loading,
      filter,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      dismiss,
      refresh,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotificationsContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return ctx;
}