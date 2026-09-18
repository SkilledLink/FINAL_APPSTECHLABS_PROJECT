import { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Inbox,
  Mail,
  CheckCheck,
  Filter,
  UserPlus,
  Briefcase,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import type { NotificationFilter, NotificationType } from '../types/notification.types';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from '../components/NotificationList';
import { getNotificationTypeConfig } from '../services/notificationService';

const tabs: { key: NotificationFilter; label: string; icon: typeof Inbox }[] = [
  { key: 'all', label: 'All', icon: Inbox },
  { key: 'unread', label: 'Unread', icon: Mail },
];

const sidebarCategories: { type: NotificationType; label: string }[] = [
  { type: 'follower', label: 'Followers' },
  { type: 'job_alert', label: 'Job Alerts' },
  { type: 'message', label: 'Messages' },
  { type: 'local_job', label: 'Local Jobs' },
];

interface NotificationsPageProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function NotificationsPage({
  theme = 'light',
  onToggleTheme = () => {},
}: NotificationsPageProps = {}) {
  const {
    notifications,
    allNotifications,
    unreadCount,
    loading,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    dismiss,
  } = useNotifications();

  const [activeCategory, setActiveCategory] = useState<NotificationType | null>(null);

  const visibleNotifications = activeCategory
    ? notifications.filter((n) => n.type === activeCategory)
    : notifications;

  const categoryCounts = sidebarCategories.reduce(
    (acc, cat) => {
      acc[cat.type] = allNotifications.filter((n) => n.type === cat.type && !n.read).length;
      return acc;
    },
    {} as Record<NotificationType, number>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    
      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - desktop only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                Categories
              </p>
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeCategory === null
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <span className="flex items-center gap-2.5">
                  <Filter className="w-4 h-4" />
                  All Categories
                </span>
              </button>
              {sidebarCategories.map((cat) => {
                const config = getNotificationTypeConfig(cat.type);
                const Icon = config.icon;
                const count = categoryCounts[cat.type];
                return (
                  <button
                    key={cat.type}
                    onClick={() => setActiveCategory(cat.type)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${activeCategory === cat.type
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${activeCategory === cat.type ? config.iconColor : ''}`} />
                      {cat.label}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Mark all read in sidebar */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-4 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all border border-brand-200 dark:border-brand-800"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Page title */}
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Stay updated on your professional network activity.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                      ${isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.key === 'unread' && unreadCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25' : 'bg-red-500 text-white'}`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Mark all read - mobile */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="lg:hidden ml-auto flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all whitespace-nowrap"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Category chips - mobile */}
            <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                  ${activeCategory === null
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
              >
                All
              </button>
              {sidebarCategories.map((cat) => {
                const config = getNotificationTypeConfig(cat.type);
                const Icon = config.icon;
                return (
                  <button
                    key={cat.type}
                    onClick={() => setActiveCategory(cat.type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                      ${activeCategory === cat.type
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Notification list */}
            <NotificationList
              notifications={visibleNotifications}
              loading={loading}
              onRead={markAsRead}
              onDismiss={dismiss}
              onMarkAllRead={markAllAsRead}
              filter={filter}
              unreadCount={unreadCount}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
