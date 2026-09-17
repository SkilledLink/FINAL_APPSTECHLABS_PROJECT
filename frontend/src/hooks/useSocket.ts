// src/hooks/useSocket.ts
import { useEffect } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import type { SocketEventName } from "../services/socket/socketEvents";

export function useSocket() {
  return useSocketContext();
}

/** Subscribe to a server event for the lifetime of the component. */
export function useSocketEvent<E = unknown>(
  event: SocketEventName,
  handler: (payload: E) => void
) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on(event as string, handler as (...args: unknown[]) => void);
    return () => {
      socket.off(event as string, handler as (...args: unknown[]) => void);
    };
  }, [socket, event, handler]);
}