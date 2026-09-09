import { useState, useEffect, useCallback } from 'react';
import { conversationApi } from '../api/conversationApi';
import type { Conversation, ConversationCreate } from '../types/conversation';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await conversationApi.list();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (data: ConversationCreate) => {
    try {
      const conv = await conversationApi.create(data);
      setConversations(prev => [conv, ...prev]);
      return conv;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create conversation');
    }
  }, []);

  const getOrCreateDirect = useCallback(async (userId: string) => {
    try {
      const conv = await conversationApi.getOrCreateDirect(userId);
      // If the conversation is new, add to list; otherwise update existing
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === conv.id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = conv;
          return updated;
        }
        return [conv, ...prev];
      });
      return conv;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to get or create direct conversation');
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, fetchConversations, createConversation, getOrCreateDirect };
}