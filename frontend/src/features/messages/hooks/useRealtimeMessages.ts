import { useEffect, useRef } from 'react';
import { useSocketContext } from '../../../contexts/SocketContext';
import { SocketEvents } from '../../../Service/socket/socketEvents';
import type { Message } from '../types/message.types';
import { mapBackendMessage } from '../../../hooks/useMessages';

export function useRealtimeMessages(
  onNewMessage: (message: Message) => void,
  onMessageUpdate?: (message: Message) => void,
  onMessageDelete?: (messageId: string) => void,
) {
  const { socket } = useSocketContext();
  const onNewRef = useRef(onNewMessage);
  const onUpdRef = useRef(onMessageUpdate);
  const onDelRef = useRef(onMessageDelete);

  useEffect(() => { onNewRef.current = onNewMessage; }, [onNewMessage]);
  useEffect(() => { onUpdRef.current = onMessageUpdate; }, [onMessageUpdate]);
  useEffect(() => { onDelRef.current = onMessageDelete; }, [onMessageDelete]);

  useEffect(() => {
    if (!socket) return;

    const handleNew = (payload: any) => {
      const mapped = mapBackendMessage(payload);
      mapped.status = 'sent';
      onNewRef.current(mapped);
    };
    const handleUpdated = (payload: any) => {
      if (!onUpdRef.current) return;
      onUpdRef.current(mapBackendMessage(payload));
    };
    const handleDeleted = (payload: { message_id: string }) => {
      if (!onDelRef.current) return;
      onDelRef.current(payload.message_id);
    };

    socket.on(SocketEvents.NEW_MESSAGE, handleNew);
    socket.on('message_updated', handleUpdated);
    socket.on('message_deleted', handleDeleted);

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE, handleNew);
      socket.off('message_updated', handleUpdated);
      socket.off('message_deleted', handleDeleted);
    };
  }, [socket]);

  return { broadcastMessage: (_: any) => {} };
}