// src/features/notifications/hooks/useNotifications.ts
//
// Thin re-export of the notification context consumer. All state and
// side effects live in NotificationContext — the API calls go through
// apiClient (see src/api/client.ts), which reads VITE_API_URL.

export { useNotificationsContext as useNotifications } from '../context/NotificationContext';