// src/features/messages/pages/MessagesPage.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { CallOverlay } from '../components/CallOverlay';
import { useWebRTCCall } from '../hooks/useWebRTCCall';
import { useConversations } from '../../../hooks/useConversations';
import { useMessages } from '../../../hooks/useMessages';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { useVoiceUpload } from '../hooks/useVoiceUpload';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAuth } from '../hooks/useAuth';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';
import { useSocketContext } from '../../../contexts/SocketContext';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { normalizeId } from '../utils/idUtils';

export const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocketContext();

  /* ── URL param: /messages/:conversationId (optional) ── */
  const { conversationId: urlConversationId } = useParams<{
    conversationId?: string;
  }>();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(urlConversationId ?? null);
  const [displayConversations, setDisplayConversations] = useState<any[]>([]);

  const { conversations, loading: convLoading, error: convError } =
    useConversations();

  useEffect(() => {
    setDisplayConversations(conversations);
  }, [conversations]);

  /*
   * Sync active conversation when the URL param changes (deep links and
   * back/forward). We don't clear on param removal so an internal "back to
   * list" on mobile isn't reversed by the effect.
   */
  useEffect(() => {
    if (urlConversationId && urlConversationId !== activeConversationId) {
      setActiveConversationId(urlConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlConversationId]);

  const { messages, setMessages, confirmMessage, addOptimistic } =
    useMessages(activeConversationId);
  const { send } = useSendMessage(activeConversationId);
  const { uploadVoice, uploading: voiceUploading } = useVoiceUpload();
  const { uploadFile, uploading: fileUploading, progress: uploadProgress } =
    useFileUpload();

  const isUploading = voiceUploading || fileUploading;
  const currentUserId = normalizeId(user?.id);

  // ── Presence + typing (single declaration each) ─────────
  const { onlineUsers } = usePresence(currentUserId);
  const { typingUsers, sendTyping } = useTyping(
    activeConversationId,
    currentUserId
  );

  // ── Calling ──────────────────────────────────────────────
  const callApi = useWebRTCCall(socket);

  /* ── Realtime: new messages land here for both the sidebar and the
   *    active conversation. ──────────────────────────────────── */
  const handleGlobalNewMessage = useCallback(
    (newMsg: any) => {
      const isActive = newMsg.conversation_id === activeConversationId;

      setDisplayConversations((prev) => {
        const index = prev.findIndex(
          (conversation) => conversation.id === newMsg.conversation_id
        );
        if (index < 0) return prev;

        const updated = {
          ...prev[index],
          lastMessage: newMsg,
          last_message: newMsg,
          unreadCount: isActive
            ? 0
            : (prev[index].unreadCount ?? prev[index].unread_count ?? 0) + 1,
          unread_count: isActive
            ? 0
            : (prev[index].unread_count ?? prev[index].unreadCount ?? 0) + 1,
        };
        return [
          updated,
          ...prev.filter((_, itemIndex) => itemIndex !== index),
        ];
      });

      if (isActive) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const withoutTemp = prev.filter(
            (m) =>
              m.id !== newMsg.id &&
              !(
                typeof m.id === 'string' &&
                m.id.startsWith('temp-') &&
                m.client_message_id === newMsg.client_message_id
              )
          );
          return [...withoutTemp, newMsg];
        });

        if (socket) {
          socket.emit('message_read', {
            conversation_id: newMsg.conversation_id,
          });
        }
      }
    },
    [activeConversationId, setMessages, socket]
  );

  useRealtimeMessages(handleGlobalNewMessage);

  /* ── Mark as read when active conversation changes ──────── */
  useEffect(() => {
    if (!activeConversationId || !socket) return;
    setDisplayConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, unreadCount: 0, unread_count: 0 }
          : conversation
      )
    );
    socket.emit('message_read', { conversation_id: activeConversationId });
  }, [activeConversationId, socket]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  // ── Send Text ────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;
      const clientMessageId = crypto.randomUUID();
      const tempId = `temp-${clientMessageId}`;

      const tempMessage: any = {
        id: tempId,
        conversation_id: activeConversationId,
        sender_id: currentUserId,
        client_message_id: clientMessageId,
        type: 'text',
        content: text,
        text: text,
        created_at: new Date().toISOString(),
        status: 'sending',
        isRead: false,
      };
      addOptimistic(tempMessage);

      const { realMessage, error } = await send(
        clientMessageId,
        text,
        'text'
      );
      if (realMessage) {
        confirmMessage(realMessage);
      } else if (error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  content: '❌ Failed to send',
                  text: '❌ Failed to send',
                  status: 'failed',
                }
              : m
          )
        );
      }
    },
    [
      activeConversationId,
      send,
      confirmMessage,
      setMessages,
      addOptimistic,
      currentUserId,
    ]
  );

  // ── Send File / Image ────────────────────────────────────
  const handleSendFile = useCallback(
    async (file: File) => {
      if (!activeConversationId) return;
      try {
        const { publicUrl, name, size, type } = await uploadFile(file);
        const clientMessageId = crypto.randomUUID();
        const tempId = `temp-${clientMessageId}`;
        const isImage = type.startsWith('image/');

        const tempMessage: any = {
          id: tempId,
          conversation_id: activeConversationId,
          sender_id: currentUserId,
          client_message_id: clientMessageId,
          type: isImage ? 'image' : 'file',
          attachment_path: publicUrl,
          attachment_name: name,
          attachment_size: size,
          attachment_type: type,
          created_at: new Date().toISOString(),
          status: 'sending',
          isRead: false,
          fileDetails: {
            name,
            size: formatFileSize(size),
            type,
            icon: getFileIcon(type),
            extension: name.split('.').pop() || '',
          },
        };
        addOptimistic(tempMessage);

        const { realMessage, error } = await send(
          clientMessageId,
          null,
          isImage ? 'image' : 'file',
          publicUrl,
          undefined,
          name,
          type,
          size
        );

        if (realMessage) {
          confirmMessage(realMessage);
        } else if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, attachment_path: undefined, status: 'failed' }
                : m
            )
          );
        }
      } catch (err) {
        console.error('File upload failed', err);
      }
    },
    [
      activeConversationId,
      uploadFile,
      send,
      confirmMessage,
      setMessages,
      addOptimistic,
      currentUserId,
    ]
  );

  const handleSendImage = useCallback(
    async (file: File) => {
      await handleSendFile(file);
    },
    [handleSendFile]
  );

  // ── Send Voice Note ──────────────────────────────────────
  const handleSendVoiceNote = useCallback(
    async (duration: string) => {
      if (!activeConversationId) return;
      const blob = new Blob(['dummy audio'], { type: 'audio/webm' });
      const file = new File([blob], 'recording.webm', {
        type: 'audio/webm',
      });
      const durationNum = parseInt(duration.split(':')[1]) || 5;

      try {
        const { publicUrl } = await uploadVoice(file, durationNum);
        const clientMessageId = crypto.randomUUID();
        const tempId = `temp-${clientMessageId}`;

        const tempMessage: any = {
          id: tempId,
          conversation_id: activeConversationId,
          sender_id: currentUserId,
          client_message_id: clientMessageId,
          type: 'audio',
          attachment_path: publicUrl,
          duration_seconds: durationNum,
          created_at: new Date().toISOString(),
          status: 'sending',
          isRead: false,
          audioDetails: {
            url: publicUrl,
            duration: `${durationNum}s`,
            waveform: Array.from({ length: 15 }, () =>
              Math.floor(Math.random() * 75 + 25)
            ),
          },
        };
        addOptimistic(tempMessage);

        const { realMessage, error } = await send(
          clientMessageId,
          null,
          'voice',
          publicUrl,
          durationNum
        );

        if (realMessage) {
          confirmMessage(realMessage);
        } else if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, attachment_path: undefined, status: 'failed' }
                : m
            )
          );
        }
      } catch (err) {
        console.error('Voice upload failed', err);
      }
    },
    [
      activeConversationId,
      uploadVoice,
      send,
      confirmMessage,
      setMessages,
      addOptimistic,
      currentUserId,
    ]
  );

  /* ── Enrich conversations with live presence ───────────── */
  const conversationsWithPresence = useMemo(() => {
    return displayConversations.map((c) => {
      if (!c.participant) return c;
      const isOnline = onlineUsers.includes(c.participant.id);
      return { ...c, participant: { ...c.participant, isOnline } };
    });
  }, [displayConversations, onlineUsers]);

  const activeConversation = useMemo(
    () =>
      conversationsWithPresence.find((c) => c.id === activeConversationId) ||
      null,
    [conversationsWithPresence, activeConversationId]
  );

  /* ── Call handlers ──────────────────────────────────────── */
  const handleStartCall = useCallback(() => {
    if (!activeConversationId || !activeConversation?.participant?.id) return;
    callApi.startCall(
      activeConversationId,
      activeConversation.participant.id,
      'audio'
    );
  }, [activeConversationId, activeConversation, callApi]);

  const handleStartVideoCall = useCallback(() => {
    if (!activeConversationId || !activeConversation?.participant?.id) return;
    callApi.startCall(
      activeConversationId,
      activeConversation.participant.id,
      'video'
    );
  }, [activeConversationId, activeConversation, callApi]);

  if (authLoading || convLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading conversations...
      </div>
    );
  }
  if (convError) {
    return <div className="text-red-500 p-4">Error: {convError}</div>;
  }

  return (
    <>
      <div className="h-screen w-full flex overflow-hidden border-x border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl">
        <div
          className={`${
            activeConversationId ? 'hidden lg:block' : 'w-full'
          } lg:w-auto h-full shrink-0 transition-all duration-300 ease-in-out`}
        >
          <ConversationList
            conversations={conversationsWithPresence as any}
            activeId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
        <div
          className={`${
            !activeConversationId ? 'hidden lg:flex' : 'flex'
          } flex-1 h-full transition-all duration-300 ease-in-out`}
        >
          <ChatWindow
            conversation={activeConversation as any}
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
            onSendVoiceNote={handleSendVoiceNote}
            onSendFile={handleSendFile}
            onSendImage={handleSendImage}
            uploading={isUploading}
            uploadProgress={uploadProgress}
            onBack={() => setActiveConversationId(null)}
            onTypingChange={sendTyping}
            typingUsers={typingUsers}
            onCall={handleStartCall}
            onVideoCall={handleStartVideoCall}
            callDisabled={!!callApi.call}
          />
        </div>
      </div>

      {/* Global call overlay — sits above everything */}
      <CallOverlay
        api={callApi}
        otherUserName={
          callApi.call
            ? conversationsWithPresence.find(
                (c) => c.id === callApi.call?.conversationId
              )?.participant?.name
            : undefined
        }
        otherUserAvatar={
          callApi.call
            ? conversationsWithPresence.find(
                (c) => c.id === callApi.call?.conversationId
              )?.participant?.avatar
            : undefined
        }
      />
    </>
  );
};

export default MessagesPage;