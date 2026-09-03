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

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`conversation:${conversationId}`);

    channel
      .on('broadcast', { event: 'message_created' }, ({ payload }) => {
        const mapped = mapBackendMessage(payload.message);
        onNewMessage(mapped);
      })
      .on('broadcast', { event: 'message_updated' }, ({ payload }) => {
        if (onMessageUpdate) {
          const mapped = mapBackendMessage(payload.message);
          onMessageUpdate(mapped);
        }
      })
      .on('broadcast', { event: 'message_deleted' }, ({ payload }) => {
        if (onMessageDelete) onMessageDelete(payload.messageId);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conversationId, onNewMessage, onMessageUpdate, onMessageDelete]);

  const broadcastMessage = (message: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'message_created',
        payload: { message },
      });
    }
  };

  return { broadcastMessage };
}