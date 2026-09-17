// src/hooks/useNotifications.ts
import { useEffect, useState } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import { SocketEvents } from "../services/socket/socketEvents";
import type { SocketNotification } from "../services/socket/socketTypes";

export function useNotifications() {
  const { socket } = useSocketContext();
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onNew = (n: SocketNotification) => {
      setNotifications((prev) =>
        prev.some((x) => x.id === n.id) ? prev : [n, ...prev]
      );
    };

    socket.on(SocketEvents.NEW_NOTIFICATION, onNew);
    return () => {
      socket.off(SocketEvents.NEW_NOTIFICATION, onNew);
    };
  }, [socket]);

  return { notifications, setNotifications };
}