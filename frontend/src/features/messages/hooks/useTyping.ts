// src/features/messages/hooks/useTyping.ts
import { useEffect, useRef, useState } from 'react';
import { useSocketContext } from '../../../contexts/SocketContext';
import { SocketEvents } from '../../../Service/socket/socketEvents';

export function useTyping(conversationId: string | null, currentUserId: string) {
  const { socket } = useSocketContext();
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!socket || !conversationId) return;

    const onStart = (p: { user_id: string }) => {
      if (p.user_id === currentUserId) return;
      setTypingUsers((prev) => ({ ...prev, [p.user_id]: true }));

      // Auto-clear after 3s of no typing_stop (safety net).
      if (timeoutsRef.current[p.user_id]) clearTimeout(timeoutsRef.current[p.user_id]);
      timeoutsRef.current[p.user_id] = setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [p.user_id]: false }));
      }, 3000);
    };

    const onStop = (p: { user_id: string }) => {
      if (p.user_id === currentUserId) return;
      setTypingUsers((prev) => ({ ...prev, [p.user_id]: false }));
    };

    socket.on(SocketEvents.TYPING_START, onStart);
    socket.on(SocketEvents.TYPING_STOP, onStop);

    return () => {
      socket.off(SocketEvents.TYPING_START, onStart);
      socket.off(SocketEvents.TYPING_STOP, onStop);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {};
    };
  }, [socket, conversationId, currentUserId]);

  const sendTyping = (isTyping: boolean) => {
    if (!socket || !conversationId) return;
    socket.emit(
      isTyping ? SocketEvents.TYPING_START : SocketEvents.TYPING_STOP,
      { conversation_id: conversationId },
    );
  };

  return { typingUsers, sendTyping };
}