import { useEffect, useState } from 'react';
import { useSocketContext } from '../../../contexts/SocketContext';
import { SocketEvents } from '../../../Service/socket/socketEvents';

export function usePresence(currentUserId: string) {
  const { socket } = useSocketContext();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !currentUserId) return;

    const onOnline = (p: { user_id: string }) => {
      if (p.user_id === currentUserId) return;
      setOnlineUsers((prev) => (prev.includes(p.user_id) ? prev : [...prev, p.user_id]));
    };

    const onOffline = (p: { user_id: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== p.user_id));
    };

    const onSnapshot = (p: { user_ids: string[] }) => {
      setOnlineUsers((p.user_ids || []).filter((id) => id !== currentUserId));
    };

    socket.on(SocketEvents.USER_ONLINE, onOnline);
    socket.on(SocketEvents.USER_OFFLINE, onOffline);
    socket.on('presence_snapshot', onSnapshot);

    return () => {
      socket.off(SocketEvents.USER_ONLINE, onOnline);
      socket.off(SocketEvents.USER_OFFLINE, onOffline);
      socket.off('presence_snapshot', onSnapshot);
    };
  }, [socket, currentUserId]);

  return { onlineUsers };
}