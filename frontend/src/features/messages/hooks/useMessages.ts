// src/features/messages/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '../api/messages';
import type { Message } from '../types/message.types';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const mapBackendMessage = (backendMsg: any): Message => {
  const isVoice = backendMsg.type === 'voice';
  const isFile =
    backendMsg.type === 'file' || backendMsg.type === 'image';

  return {
    id: backendMsg.id,
    conversation_id: backendMsg.conversation_id,
    sender_id: backendMsg.sender_id,
    client_message_id: backendMsg.client_message_id,
    type: isVoice ? 'audio' : backendMsg.type,
    content: backendMsg.content,
    text: backendMsg.content,
    attachment_path: backendMsg.attachment_path,
    attachment_name: backendMsg.attachment_name,
    attachment_size: backendMsg.attachment_size,
    attachment_type: backendMsg.attachment_type,
    duration_seconds: backendMsg.duration_seconds,
    created_at: backendMsg.created_at,
    edited_at: backendMsg.edited_at,
    deleted_at: backendMsg.deleted_at,
    status: 'sent',
    audioDetails: isVoice
      ? {
          url: backendMsg.attachment_path?.startsWith('http')
            ? backendMsg.attachment_path
            : backendMsg.attachment_path
            ? `${SUPABASE_URL}/storage/v1/object/public/messages/${backendMsg.attachment_path}`
            : '',
          duration: backendMsg.duration_seconds
            ? `${Math.floor(backendMsg.duration_seconds)}s`
            : '0s',
          waveform: Array.from(
            { length: 15 },
            () => Math.floor(Math.random() * 75 + 25)
          ),
        }
      : undefined,
    fileDetails: isFile
      ? {
          name: backendMsg.attachment_name || 'file',
          size: formatFileSize(backendMsg.attachment_size || 0),
          type: backendMsg.attachment_type || 'application/octet-stream',
          icon: getFileIcon(backendMsg.attachment_type || ''),
          extension: backendMsg.attachment_name?.split('.').pop() || '',
        }
      : undefined,
  };
};

// Named export — matches `import { useMessages } from '...'` in MessagesPage.
export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMessages = useCallback(
    async (before?: string) => {
      if (!conversationId) return;
      try {
        setLoading(true);
        const data = await messagesApi.get(conversationId, before, 50);
        const mapped = data.map(mapBackendMessage).reverse();
        setMessages((prev) => (before ? [...mapped, ...prev] : mapped));
        if (data.length < 50) setHasMore(false);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setHasMore(true);
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  const addOptimistic = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, { ...msg, status: 'sending' }]);
  }, []);

  const confirmMessage = useCallback((real: Message) => {
    setMessages((prev) => {
      const tempIdx = prev.findIndex(
        (m) => m.client_message_id === real.client_message_id
      );
      if (tempIdx !== -1) {
        const next = [...prev];
        next[tempIdx] = { ...real, status: 'sent' };
        return next;
      }
      // Broadcast already arrived — don't duplicate.
      if (prev.some((m) => m.id === real.id)) return prev;
      return [...prev, { ...real, status: 'sent' }];
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (messages.length > 0 && hasMore) {
      const oldest = messages[0];
      await loadMessages(oldest.created_at);
    }
  }, [messages, hasMore, loadMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    addOptimistic,
    confirmMessage,
    setMessages,
  };
}

// Kept for backward compatibility — safe to remove once nothing imports the default.
export default useMessages;