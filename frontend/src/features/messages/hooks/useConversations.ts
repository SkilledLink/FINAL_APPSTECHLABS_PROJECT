// src/hooks/useConversations.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { conversationsApi } from '../api/conversations';
import type { Conversation, Message, MessageUser } from '../types/message.types';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function mapBackendConversation(backend: any): Conversation {
  const p = backend.participant;
  let participant: MessageUser | null = null;
  if (p) {
    participant = {
      id: p.id,
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User',
      avatar: p.profile_image_url || '/default-avatar.png',
      role: p.account_type || 'User',
      isOnline: false,
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
            waveform: Array.from({ length: 15 }, () =>
              Math.floor(Math.random() * 75 + 25),
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

  return {
    id: backend.id,
    type: backend.type,
    title: backend.title,
    created_by: backend.created_by,
    created_at: backend.created_at,
    updated_at: backend.updated_at,
    unreadCount: backend.unread_count || 0,
    participant,
    lastMessage,
  };
}

export function useConversations() {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

  // ── List ──────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated() || !user || fetchingRef.current) {
      setLoading(false);
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      const data = await conversationsApi.list();
      setConversations(data.map(mapBackendConversation));
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Direct conversation (used by UsersPage / UserCard) ────
  const getOrCreateDirect = useCallback(async (userId: string) => {
    const raw = await conversationsApi.getOrCreateDirect(userId);
    const mapped = mapBackendConversation(raw);

    // Merge into local state so the list updates immediately
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === mapped.id);
      return exists ? prev : [mapped, ...prev];
    });

    return mapped;
  }, []);

  // ── Update one in place (used by MessagesPage) ────────────
  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [],
  );

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    fetchConversations,
    getOrCreateDirect,   // ← now available to UsersPage / UserCard
    updateConversation,
  };
}