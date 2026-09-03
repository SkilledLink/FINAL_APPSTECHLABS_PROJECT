import { useState } from 'react';
import { messagesApi } from '../../../api/messages';
import type { Message } from '../types/message.types';
import { mapBackendMessage } from './useMessages';

export function useSendMessage(conversationId: string | null) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = async (
    content: string | null,
    type: 'text' | 'audio' = 'text',
    attachmentPath?: string,
    durationSeconds?: number
  ): Promise<{ tempId: string; realMessage: Message | null; error?: string }> => {
    if (!conversationId) return { tempId: '', realMessage: null, error: 'No conversation' };

    const clientMessageId = crypto.randomUUID();
    const tempMessage: Message = {
      id: `temp-${clientMessageId}`,
      conversationId,
      senderId: 'me',
      type,
      text: content || undefined,
      audioDetails: type === 'audio' && durationSeconds
        ? {
            url: attachmentPath
              ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/messages/${attachmentPath}`
              : '',
            duration: `${Math.floor(durationSeconds)}s`,
            waveform: Array.from({ length: 15 }, () => Math.floor(Math.random() * 75 + 25)),
          }
        : undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setSending(true);
    setError(null);

    try {
      const backendMessage = await messagesApi.send(conversationId, {
        client_message_id: clientMessageId,
        type: type === 'audio' ? 'voice' : 'text',
        content: content || undefined,
        attachment_path: attachmentPath,
        duration_seconds: durationSeconds,
      });

      const realMessage = mapBackendMessage(backendMessage);
      setSending(false);
      return { tempId: clientMessageId, realMessage };
    } catch (err) {
      setError(err as Error);
      setSending(false);
      return { tempId: clientMessageId, realMessage: null, error: (err as Error).message };
    }
  };

  return { send, sending, error };
}