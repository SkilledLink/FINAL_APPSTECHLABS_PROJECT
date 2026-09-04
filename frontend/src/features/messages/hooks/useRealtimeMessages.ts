// src/hooks/useRealtimeMessages.ts
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '../types/message.types';
import { mapBackendMessage } from './useMessages';

export function useRealtimeMessages(
  conversationId: string | null,
  onNewMessage: (message: Message) => void,
  onMessageUpdate?: (message: Message) => void,
  onMessageDelete?: (messageId: string) => void
) {
  const channelRef = useRef<any>(null);
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageUpdateRef = useRef(onMessageUpdate);
  const onMessageDeleteRef = useRef(onMessageDelete);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);
  useEffect(() => {
    onMessageUpdateRef.current = onMessageUpdate;
  }, [onMessageUpdate]);
  useEffect(() => {
    onMessageDeleteRef.current = onMessageDelete;
  }, [onMessageDelete]);

  useEffect(() => {
    if (!conversationId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(`conversation:${conversationId}`);

    channel
      .on('broadcast', { event: 'message_created' }, ({ payload }) => {
        console.log('📨 Broadcast received:', payload);
        const mapped = mapBackendMessage(payload.message);
        console.log('📨 Mapped message:', mapped);
        onNewMessageRef.current(mapped);
      })
      .on('broadcast', { event: 'message_updated' }, ({ payload }) => {
        if (onMessageUpdateRef.current) {
          const mapped = mapBackendMessage(payload.message);
          onMessageUpdateRef.current(mapped);
        }
      })
      .on('broadcast', { event: 'message_deleted' }, ({ payload }) => {
        if (onMessageDeleteRef.current) {
          onMessageDeleteRef.current(payload.messageId);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR') {
          console.log(`🔌 Realtime status for ${conversationId}: ${status}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log(`🔌 Unsubscribing from ${conversationId}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  const broadcastMessage = (message: any) => {
    if (channelRef.current) {
      console.log('📤 Broadcasting message:', message);
      channelRef.current.send({
        type: 'broadcast',
        event: 'message_created',
        payload: { message },
      });
    } else {
      console.warn('⚠️ No active channel to broadcast');
    }
  };

  return { broadcastMessage };
}