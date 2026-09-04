import React, { useState } from "react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "info" | "message";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New Message",
    message: "Sarah sent you a message regarding the latest project updates.",
    time: "5m ago",
    type: "message",
    read: false,
  },
  {
    id: "2",
    title: "System Update",
    message: "Your account settings have been updated successfully.",
    time: "1h ago",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "Security Alert",
    message: "A new login attempt was detected from an unrecognized browser.",
    time: "3h ago",
    type: "warning",
    read: false,
  },
  {
    id: "4",
    title: "Subscription Notice",
    message: "Your monthly subscription will auto-renew in 3 days.",
    time: "1d ago",
    type: "info",
    read: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const renderIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "message":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-gray-400 hover:text-red-600 transition ml-2"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 py-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "unread"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Unread
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No notifications found.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`group flex items-start gap-4 py-4 px-2 rounded-xl transition ${
                  !item.read ? "bg-blue-50/40" : "hover:bg-gray-50"
                }`}
              >
                {renderIcon(item.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${!item.read ? "text-gray-900" : "text-gray-700"}`}>
                      {item.title}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(item.id)}
                      className="h-2 w-2 rounded-full bg-blue-600 hover:scale-125 transition"
                      title="Mark as read"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition p-1"
                    aria-label="Remove"
                  >
                    
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}