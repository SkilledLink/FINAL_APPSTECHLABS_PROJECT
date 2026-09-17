// src/features/messages/hooks/useSendMessage.ts
import { useState } from 'react';
import { useSocketContext } from '../../../contexts/SocketContext';
import { SocketEvents } from '../../../Service/socket/socketEvents';
import type { Message } from '../types/message.types';
import { mapBackendMessage } from '../../../hooks/useMessages';

interface SendResult {
  tempId: string;
  realMessage: Message | null;
  rawMessage: any | null;
  error?: string;
}

export function useSendMessage(conversationId: string | null) {
  const { socket } = useSocketContext();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = (
    clientMessageId: string,
    content: string | null,
    type: 'text' | 'voice' | 'file' | 'image' = 'text',
    attachmentPath?: string,
    durationSeconds?: number,
    attachmentName?: string,
    attachmentType?: string,
    attachmentSize?: number,
  ): Promise<SendResult> => {
    return new Promise((resolve) => {
      if (!conversationId || !socket) {
        resolve({
          tempId: clientMessageId,
          realMessage: null,
          rawMessage: null,
          error: 'Not connected',
        });
        return;
      }

      setSending(true);
      setError(null);

      const payload = {
        conversation_id: conversationId,
        client_message_id: clientMessageId,
        type,
        content: content || undefined,
        attachment_path: attachmentPath,
        duration_seconds: durationSeconds,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_size: attachmentSize,
      };

      const timeout = window.setTimeout(() => {
        setSending(false);
        setError(new Error('Send timed out'));
        resolve({
          tempId: clientMessageId,
          realMessage: null,
          rawMessage: null,
          error: 'Send timed out',
        });
      }, 15000);

      socket.emit(SocketEvents.SEND_MESSAGE, payload, (ack: any) => {
        window.clearTimeout(timeout);
        setSending(false);

        if (ack?.success && ack.data?.message) {
          const realMessage = mapBackendMessage(ack.data.message);
          realMessage.status = 'sent';
          resolve({ tempId: clientMessageId, realMessage, rawMessage: ack.data.message });
        } else {
          const msg = ack?.error?.message || 'Send failed';
          setError(new Error(msg));
          resolve({
            tempId: clientMessageId,
            realMessage: null,
            rawMessage: null,
            error: msg,
          });
        }
      });
    });
  };

  return { send, sending, error };
}