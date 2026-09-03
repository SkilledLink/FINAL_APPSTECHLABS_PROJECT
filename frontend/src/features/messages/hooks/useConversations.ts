import { useState, useEffect, useCallback } from 'react';
import { conversationsApi } from '../../../api/conversations';
import type { Conversation } from '../types/message.types';

// Map backend conversation to frontend Conversation
const mapBackendConversation = (backendConv: any): Conversation => {
  const participant = backendConv.participant || {
    id: 'unknown',
    name: 'User',
    avatar: 'https://ui-avatars.com/api/?name=User',
    role: 'Professional',
    isOnline: false,
  };

  return {
    id: backendConv.id,
    participant,
    lastMessage: backendConv.last_message
      ? {
          id: backendConv.last_message.id,
          conversationId: backendConv.id,
          senderId: backendConv.last_message.sender_id,
          type: backendConv.last_message.type === 'voice' ? 'audio' : 'text',
          text: backendConv.last_message.content,
          audioDetails: backendConv.last_message.duration_seconds
            ? {
                url: '',
                duration: `${Math.floor(backendConv.last_message.duration_seconds)}s`,
                waveform: [40, 60, 80, 50, 90, 70, 30, 85, 100, 45, 65, 75, 55, 95, 35],
              }
            : undefined,
          createdAt: new Date(backendConv.last_message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isRead: true,
        }
      : undefined,
    unreadCount: backendConv.unread_count || 0,
    updatedAt: new Date(backendConv.updated_at).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }),
  };
};

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await conversationsApi.list();
      const mapped = data.map(mapBackendConversation);
      setConversations(mapped);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const updateConversation = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, ...updates } : c))
    );
  }, []);

  return { conversations, loading, error, refetch: fetchConversations, updateConversation };
}