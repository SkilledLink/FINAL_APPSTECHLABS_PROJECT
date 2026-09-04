// src/hooks/useSendMessage.ts
import { useState } from 'react';
import { messagesApi } from '../api/messages';
import type { Message } from '../types/message.types';
import { mapBackendMessage } from './useMessages';

export function useSendMessage(conversationId: string | null) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = async (
    content: string | null,
    type: 'text' | 'voice' | 'file' | 'image' = 'text',
    attachmentPath?: string,
    durationSeconds?: number,
    attachmentName?: string,
    attachmentType?: string,
    attachmentSize?: number
  ): Promise<{
    tempId: string;
    realMessage: Message | null;
    rawMessage: any | null;
    error?: string;
  }> => {
    if (!conversationId) return { tempId: '', realMessage: null, rawMessage: null, error: 'No conversation' };

    const clientMessageId = crypto.randomUUID();

    setSending(true);
    setError(null);

    try {
      const backendMessage = await messagesApi.send(conversationId, {
        client_message_id: clientMessageId,
        type: type === 'text' ? 'text' : type,
        content: content || undefined,
        attachment_path: attachmentPath,
        duration_seconds: durationSeconds,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_size: attachmentSize,
      });

      const realMessage = mapBackendMessage(backendMessage);
      setSending(false);
      return { tempId: clientMessageId, realMessage, rawMessage: backendMessage };
    } catch (err) {
      setError(err as Error);
      setSending(false);
      return { tempId: clientMessageId, realMessage: null, rawMessage: null, error: (err as Error).message };
    }
  };

  return { send, sending, error };
}