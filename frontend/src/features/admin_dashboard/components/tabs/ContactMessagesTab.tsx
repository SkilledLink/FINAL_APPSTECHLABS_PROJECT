import React, { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  MessageSquare,
  Check,
  Reply,
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getContactMessages,
  markContactMessageAsRead,
  replyToContactMessage,
} from '../../../../api/Contact/ContactMessages';
import type { ContactMessage } from '../../../../api/Contact/ContactMessages';

interface ContactMessagesTabProps {
  onUnreadCountChange?: (count: number) => void;
}

const ContactMessagesTab: React.FC<ContactMessagesTabProps> = ({
  onUnreadCountChange,
}) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const loadMessages = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getContactMessages();

      setMessages(data);

      if (selectedMessage) {
        const updated = data.find(
          (message) => message.id === selectedMessage.id
        );

        if (updated) {
          setSelectedMessage(updated);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const unreadCount = useMemo(
    () => messages.filter((message) => !message.is_read).length,
    [messages]
  );

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const handleOpenMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setReply(message.admin_reply ?? '');

    if (!message.is_read) {
      try {
        const updated = await markContactMessageAsRead(message.id);

        setMessages((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item
          )
        );

        setSelectedMessage(updated);
      } catch (error) {
        console.error(error);
        toast.error('Failed to mark message as read');
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage) return;

    const trimmedReply = reply.trim();

    if (!trimmedReply) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setSendingReply(true);

      const updated = await replyToContactMessage(
        selectedMessage.id,
        trimmedReply
      );

      setMessages((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setSelectedMessage(updated);
      setReply(updated.admin_reply ?? '');

      toast.success('Reply sent successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Contact Messages
            </h2>

            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Messages submitted through the public contact form
          </p>
        </div>

        <button
          onClick={() => loadMessages(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-20 bg-gray-100 rounded-lg"
              />
            ))}
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4">
              <Mail size={28} />
            </div>

            <p className="font-semibold text-gray-900">
              No contact messages
            </p>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Messages submitted through the Contact Us form will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => handleOpenMessage(message)}
                className="w-full text-left p-4 sm:p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.is_read
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`truncate ${
                            message.is_read
                              ? 'font-medium text-gray-800'
                              : 'font-bold text-gray-900'
                          }`}
                        >
                          {message.name}
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                          {message.email}
                        </p>
                      </div>

                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(message.created_at)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {message.message}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          message.is_read
                            ? 'bg-gray-50 text-gray-600 border-gray-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {message.is_read ? (
                          <>
                            <Check className="w-3 h-3" />
                            Read
                          </>
                        ) : (
                          'Unread'
                        )}
                      </span>

                      {message.replied && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <Reply className="w-3 h-3" />
                          Replied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedMessage(null)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Contact Message
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Message #{selectedMessage.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  From
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedMessage.name}
                </p>

                <p className="text-sm text-blue-600">
                  {selectedMessage.email}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(selectedMessage.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Message
                </p>

                <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {selectedMessage.admin_reply && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Previous Reply
                  </p>

                  <div className="mt-2 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.admin_reply}
                  </div>

                  {selectedMessage.replied_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Replied {formatDate(selectedMessage.replied_at)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="contact-message-reply"
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Reply
                </label>

                <textarea
                  id="contact-message-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write your reply..."
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Close
                </button>

                <button
                  onClick={handleReply}
                  disabled={sendingReply || !reply.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Reply className="w-4 h-4" />
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesTab;