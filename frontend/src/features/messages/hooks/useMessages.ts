import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '../../../api/messages';
import type { Message } from '../types/message.types';

export const mapBackendMessage = (backendMsg: any): Message => {
  return {
    id: backendMsg.id,
    conversationId: backendMsg.conversation_id,
    senderId: backendMsg.sender_id,
    type: backendMsg.type === 'voice' ? 'audio' : 'text',
    text: backendMsg.content || undefined,
    audioDetails: backendMsg.duration_seconds
      ? {
          url: backendMsg.attachment_path
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/messages/${backendMsg.attachment_path}`
            : '',
          duration: `${Math.floor(backendMsg.duration_seconds)}s`,
          waveform: Array.from({ length: 15 }, () => Math.floor(Math.random() * 75 + 25)),
        }
      : undefined,
    createdAt: new Date(backendMsg.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    isRead: false,
  };
};

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMessages = useCallback(async (before?: string) => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const data = await messagesApi.get(conversationId, before, 50);
      const mapped = data.map(mapBackendMessage).reverse();
      setMessages(prev => (before ? [...mapped, ...prev] : mapped));
      if (data.length < 50) setHasMore(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setHasMore(true);
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  const addOptimisticMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const confirmMessage = useCallback((realMessage: Message) => {
    setMessages(prev =>
      prev.map(m => (m.id === realMessage.id ? realMessage : m))
    );
  }, []);

  const loadMore = useCallback(async () => {
    if (messages.length > 0 && hasMore) {
      const oldest = messages[0];
      await loadMessages(oldest.createdAt);
    }
  }, [messages, hasMore, loadMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    addOptimisticMessage,
    confirmMessage,
    setMessages,
  };
}