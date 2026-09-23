// src/features/notifications/index.ts

export * from './types/notification.types';
export { NotificationProvider } from './context/NotificationContext';
export { useNotifications } from './hooks/useNotifications';
export { NotificationBell } from './components/NotificationBell';
export { NotificationDropdown } from './components/NotificationDropdown';
export { default as NotificationsPage } from './pages/NotificationsPage';

export {
  getNamespace,
  getNotificationTypeConfig,
  NAMESPACE_CONFIG,
  SIDEBAR_NAMESPACES,
} from './services/notificationService';