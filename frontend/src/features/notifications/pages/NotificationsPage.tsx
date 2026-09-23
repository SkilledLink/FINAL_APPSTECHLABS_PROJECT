// src/features/notifications/pages/NotificationsPage.tsx

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Inbox, Mail, CheckCheck, Filter } from 'lucide-react';

import type { NotificationFilter, NotificationNamespace } from '../types/notification.types';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from '../components/NotificationList';
import {
  NAMESPACE_CONFIG,
  SIDEBAR_NAMESPACES,
  getNamespace,
} from '../services/notificationService';

const tabs: { key: NotificationFilter; label: string; icon: typeof Inbox }[] = [
  { key: 'all', label: 'All', icon: Inbox },
  { key: 'unread', label: 'Unread', icon: Mail },
];

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    summary,
    loading,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    dismiss,
  } = useNotifications();

  const [activeCategory, setActiveCategory] =
    useState<NotificationNamespace | null>(null);

  const visibleNotifications = useMemo(
    () =>
      activeCategory
        ? notifications.filter((n) => getNamespace(n.type) === activeCategory)
        : notifications,
    [notifications, activeCategory],
  );

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl shadow-lg shadow-slate-200/30 dark:shadow-black/30 p-5 sm:p-6 mb-5"
        >
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/20 dark:bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-500/15 dark:bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-950 shadow-md">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Stay updated on your professional network activity.
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 px-4 py-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {unreadCount} unread
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* MAIN LAYOUT */}
        <div className="flex gap-5">
          {/* SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1.5">
              <div className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl p-3 shadow-md shadow-slate-200/30 dark:shadow-black/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2 mb-2">
                  Categories
                </p>

                <button
                  onClick={() => setActiveCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeCategory === null
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Filter className="w-4 h-4" />
                    All Categories
                  </span>
                </button>

                {SIDEBAR_NAMESPACES.map((ns) => {
                  const config = NAMESPACE_CONFIG[ns];
                  const Icon = config.icon;
                  const count = summary[ns] ?? 0;
                  const isActive = activeCategory === ns;

                  return (
                    <button
                      key={ns}
                      onClick={() => setActiveCategory(ns)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : config.iconColor
                          }`}
                        />
                        {config.label}
                      </span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {unreadCount > 0 && (
                  <button
                    onClick={() => void markAllAsRead()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-3 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1 min-w-0">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.key === 'unread' && unreadCount > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllAsRead()}
                  className="lg:hidden ml-auto flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 whitespace-nowrap transition-all"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all
                </button>
              )}
            </motion.div>

            {/* Category chips — mobile */}
            <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === null
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              {SIDEBAR_NAMESPACES.map((ns) => {
                const config = NAMESPACE_CONFIG[ns];
                const Icon = config.icon;
                const isActive = activeCategory === ns;
                return (
                  <button
                    key={ns}
                    onClick={() => setActiveCategory(ns)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </button>
                );
              })}
            </div>

            <NotificationList
              notifications={visibleNotifications}
              loading={loading && visibleNotifications.length === 0}
              onRead={(id) => void markAsRead(id)}
              onDismiss={(id) => void dismiss(id)}
              onMarkAllRead={() => void markAllAsRead()}
              filter={filter}
              unreadCount={unreadCount}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;