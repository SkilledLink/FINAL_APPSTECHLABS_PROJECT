// src/hooks/useMessages.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import { SocketEvents } from "../services/socket/socketEvents";
import type {
  Ack,
  SendMessagePayload,
  SocketMessage,
} from "../services/socket/socketTypes";

interface UseMessagesOptions {
  conversationId: string | null;
  initialMessages?: SocketMessage[];
}

interface SendResult {
  success: boolean;
  error?: string;
}

export function useMessages({
  conversationId,
  initialMessages = [],
}: UseMessagesOptions) {
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState<SocketMessage[]>(initialMessages);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  // Upsert by id (dedupes the ack-vs-broadcast race)
  const upsertMessage = useCallback((msg: SocketMessage) => {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages((prev) =>
      [...prev, msg].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    );
  }, []);

  // Sync when caller passes fresh history from REST
  useEffect(() => {
    seenIds.current = new Set(initialMessages.map((m) => m.id));
    setMessages(initialMessages);
  }, [initialMessages]);

  // Incoming messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    const onNewMessage = (msg: SocketMessage) => {
      if (msg.conversation_id !== conversationId) return;
      upsertMessage(msg);
    };

    socket.on(SocketEvents.NEW_MESSAGE, onNewMessage);
    return () => {
      socket.off(SocketEvents.NEW_MESSAGE, onNewMessage);
    };
  }, [socket, conversationId, upsertMessage]);

  // sendMessage returns a Promise that resolves when ack arrives.
  const sendMessage = useCallback(
    (payload: Omit<SendMessagePayload, "conversation_id">): Promise<SendResult> => {
      return new Promise((resolve) => {
        if (!socket || !conversationId) {
          setError("Not connected.");
          resolve({ success: false, error: "NOT_CONNECTED" });
          return;
        }

        setSending(true);
        setError(null);

        const full: SendMessagePayload = {
          ...payload,
          conversation_id: conversationId,
        };

        const ackTimeout = window.setTimeout(() => {
          setSending(false);
          setError("Timed out waiting for server.");
          resolve({ success: false, error: "TIMEOUT" });
        }, 15000);

        socket.emit(
          SocketEvents.SEND_MESSAGE,
          full,
          (ack: Ack<{ message: SocketMessage }>) => {
            window.clearTimeout(ackTimeout);
            setSending(false);

            if (ack && ack.success) {
              // Upsert immediately so the sender sees the message even before
              // the room broadcast arrives.
              upsertMessage(ack.data.message);
              resolve({ success: true });
            } else {
              const msg =
                ack && "error" in ack ? ack.error.message : "Send failed.";
              setError(msg);
              resolve({ success: false, error: msg });
            }
          }
        );
      });
    },
    [socket, conversationId, upsertMessage]
  );

  const markRead = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit(SocketEvents.MESSAGE_READ, { conversation_id: conversationId });
  }, [socket, conversationId]);

  const startTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit(SocketEvents.TYPING_START, { conversation_id: conversationId });
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit(SocketEvents.TYPING_STOP, { conversation_id: conversationId });
  }, [socket, conversationId]);

  return { messages, sending, error, sendMessage, markRead, startTyping, stopTyping };
}