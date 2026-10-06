// src/hooks/useConversations.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { conversationsApi } from '../api/conversations';
import type {
  Conversation,
  Message,
  MessageUser,
} from '../types/message.types';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function mapBackendConversation(
  backend: any,
  currentUserId?: string | null
): Conversation {
  const p = backend.participant;
  let participant: MessageUser | null = null;
  if (p) {
    participant = {
      id: p.id,
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User',
      avatar: p.profile_image_url || '/default-avatar.png',
      role:
        p.account_type === 'professional'
          ? 'Professional'
          : p.account_type === 'business'
          ? 'Business'
          : 'Client',
      isOnline: p.is_online || false,
      lastSeen: p.last_seen || undefined,
    };
  }

  let lastMessage: Message | undefined;
  if (backend.last_message) {
    const lm = backend.last_message;
    const isVoice = lm.type === 'voice';
    const attachmentUrl = lm.attachment_path?.startsWith('http')
      ? lm.attachment_path
      : lm.attachment_path
      ? `${SUPABASE_URL}/storage/v1/object/public/messages/${lm.attachment_path}`
      : '';

    lastMessage = {
      id: lm.id,
      conversation_id: backend.id,
      sender_id: lm.sender_id,
      client_message_id: lm.client_message_id,
      type: isVoice ? 'audio' : lm.type,
      content: lm.content,
      text: lm.content,
      attachment_path: lm.attachment_path,
      attachment_name: lm.attachment_name,
      attachment_size: lm.attachment_size,
      attachment_type: lm.attachment_type,
      duration_seconds: lm.duration_seconds,
      created_at: lm.created_at,
      edited_at: lm.edited_at,
      deleted_at: lm.deleted_at,
      audioDetails: isVoice
        ? {
            url: attachmentUrl,
            duration: lm.duration_seconds
              ? `${Math.floor(lm.duration_seconds)}s`
              : '0s',
            waveform: Array.from(
              { length: 15 },
              () => Math.floor(Math.random() * 75 + 25)
            ),
          }
        : undefined,
      fileDetails: lm.attachment_name
        ? {
            name: lm.attachment_name,
            size: formatFileSize(lm.attachment_size || 0),
            type: lm.attachment_type || 'application/octet-stream',
            icon: getFileIcon(lm.attachment_type || ''),
            extension: lm.attachment_name?.split('.').pop() || '',
          }
        : undefined,
    };
  }

  const status = (backend.status || 'active') as
    | 'active'
    | 'pending'
    | 'rejected';

  const isIncomingRequest =
    status === 'pending' &&
    !!currentUserId &&
    backend.created_by &&
    backend.created_by !== currentUserId;

  const isOutgoingRequest =
    status === 'pending' &&
    !!currentUserId &&
    backend.created_by === currentUserId;

  return {
    id: backend.id,
    type: backend.type,
    title: backend.title,
    status,
    created_by: backend.created_by,
    created_at: backend.created_at,
    updated_at: backend.updated_at,
    unreadCount: backend.unread_count || 0,
    participant,
    lastMessage,
    isIncomingRequest,
    isOutgoingRequest,
  };
}

export function useConversations() {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<Conversation[]>([]);
  const [sentRequests, setSentRequests] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

  const isAuthedRef = useRef(isAuthenticated);
  isAuthedRef.current = isAuthenticated;

  const userId = user?.id;

  const fetchConversations = useCallback(async () => {
    if (fetchingRef.current) {
      setLoading(false);
      return;
    }
    if (!userId || !isAuthedRef.current || !isAuthedRef.current()) {
      setLoading(false);
      return;
    }
    try {
      fetchingRef.current = true;
      setLoading(true);

      const [activeRaw, requestsRaw, sentRaw] = await Promise.all([
        conversationsApi.list(),
        conversationsApi.listRequests().catch(() => [] as any[]),
        conversationsApi.listSentRequests().catch(() => [] as any[]),
      ]);

      setConversations(
        activeRaw.map((c: any) => mapBackendConversation(c, userId))
      );
      setRequests(
        requestsRaw.map((c: any) => mapBackendConversation(c, userId))
      );
      setSentRequests(
        sentRaw.map((c: any) => mapBackendConversation(c, userId))
      );
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getOrCreateDirect = useCallback(
    async (otherUserId: string) => {
      const raw = await conversationsApi.getOrCreateDirect(otherUserId);
      const mapped = mapBackendConversation(raw, userId);

      if (mapped.status === 'active') {
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === mapped.id);
          return exists
            ? prev.map((c) => (c.id === mapped.id ? mapped : c))
            : [mapped, ...prev];
        });
      } else if (mapped.status === 'pending') {
        // Newly-sent request → appears in Sent tab immediately.
        setSentRequests((prev) => {
          const exists = prev.some((c) => c.id === mapped.id);
          return exists
            ? prev.map((c) => (c.id === mapped.id ? mapped : c))
            : [mapped, ...prev];
        });
      }
      return mapped;
    },
    [userId]
  );

  const acceptRequest = useCallback(
    async (conversationId: string) => {
      const raw = await conversationsApi.acceptRequest(conversationId);
      const mapped = mapBackendConversation(raw, userId);
      setRequests((prev) => prev.filter((r) => r.id !== conversationId));
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === mapped.id);
        return exists
          ? prev.map((c) => (c.id === mapped.id ? mapped : c))
          : [mapped, ...prev];
      });
      return mapped;
    },
    [userId]
  );

  const rejectRequest = useCallback(async (conversationId: string) => {
    await conversationsApi.rejectRequest(conversationId);
    setRequests((prev) => prev.filter((r) => r.id !== conversationId));
  }, []);

  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const applyIncomingMessage = useCallback(
    (
      message: Message,
      isActiveConversation: boolean,
      currentUserId: string
    ) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === message.conversation_id);
        if (idx === -1) return prev;

        const conv = prev[idx];
        const isFromSelf = message.sender_id === currentUserId;

        const updated: Conversation = {
          ...conv,
          lastMessage: message,
          updated_at: message.created_at,
          unreadCount:
            isActiveConversation || isFromSelf
              ? conv.unreadCount
              : (conv.unreadCount || 0) + 1,
        };

        const next = [...prev];
        next.splice(idx, 1);
        next.unshift(updated);
        return next;
      });
    },
    []
  );

  const clearUnread = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  return {
    conversations,
    requests,
    sentRequests,
    requestCount: requests.length,
    sentRequestCount: sentRequests.length,
    loading,
    error,
    refetch: fetchConversations,
    fetchConversations,
    getOrCreateDirect,
    acceptRequest,
    rejectRequest,
    updateConversation,
    applyIncomingMessage,
    clearUnread,
  };
}