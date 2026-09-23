import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSocketContext } from '../../../contexts/SocketContext';
import { useWebRTCCall, type WebRTCCallApi } from '../hooks/useWebRTCCall';
import { useRingtone } from '../hooks/useRingtone';
import { useTabAttention } from '../hooks/useTabAttention';
import { CallOverlay } from '../components/CallOverlay';
import { IncomingCallNotification } from '../components/IncomingCallNotification';
import { MinimizedCallBubble } from '../components/MinimizedCallBubble';

export interface CallParticipantInfo {
  name?: string;
  avatar?: string;
}

interface CallContextValue extends WebRTCCallApi {
  /** True when the active call has been minimized to the floating bubble. */
  minimized: boolean;
  minimize: () => void;
  maximize: () => void;
  /** Resolved display info for the call's remote participant, if known. */
  participant: CallParticipantInfo | undefined;
  /** Register/update display info for a conversation's participant. */
  setCallParticipant: (
    conversationId: string,
    info: CallParticipantInfo
  ) => void;
}

const CallContext = createContext<CallContextValue | null>(null);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { socket } = useSocketContext();
  const api = useWebRTCCall(socket);

  const [minimized, setMinimized] = useState(false);
  const [participants, setParticipants] = useState<
    Record<string, CallParticipantInfo>
  >({});

  const call = api.call;
  const isIncoming = call?.state === 'incoming';
  const isVideoCall = call?.media === 'video';

  // Ringtone + tab attention while ringing
  useRingtone(isIncoming);
  useTabAttention(
    isIncoming,
    isVideoCall ? '📹 Incoming video call…' : '📞 Incoming call…'
  );

  // Reset minimize whenever the call ends or a new call begins.
  useEffect(() => {
    if (!call) {
      setMinimized(false);
      return;
    }
    if (call.state === 'outgoing' || call.state === 'incoming') {
      setMinimized(false);
    }
  }, [call]);

  const setCallParticipant = useCallback(
    (conversationId: string, info: CallParticipantInfo) => {
      setParticipants((prev) => {
        const existing = prev[conversationId];
        if (
          existing &&
          existing.name === info.name &&
          existing.avatar === info.avatar
        ) {
          return prev;
        }
        return { ...prev, [conversationId]: info };
      });
    },
    []
  );

  const minimize = useCallback(() => setMinimized(true), []);
  const maximize = useCallback(() => setMinimized(false), []);

  const participant = call ? participants[call.conversationId] : undefined;

  const value = useMemo<CallContextValue>(
    () => ({
      ...api,
      minimized,
      minimize,
      maximize,
      participant,
      setCallParticipant,
    }),
    [api, minimized, minimize, maximize, participant, setCallParticipant]
  );

  const showNotification = !!call && call.state === 'incoming';
  const showOverlay = !!call && call.state !== 'incoming' && !minimized;
  const showBubble = !!call && call.state !== 'incoming' && minimized;

  return (
    <CallContext.Provider value={value}>
      {children}

      {showNotification && (
        <IncomingCallNotification
          api={api}
          otherUserName={participant?.name}
          otherUserAvatar={participant?.avatar}
        />
      )}

      {showOverlay && (
        <CallOverlay
          api={api}
          otherUserName={participant?.name}
          otherUserAvatar={participant?.avatar}
          onMinimize={minimize}
        />
      )}

      {showBubble && (
        <MinimizedCallBubble
          api={api}
          otherUserName={participant?.name}
          otherUserAvatar={participant?.avatar}
          onExpand={maximize}
        />
      )}
    </CallContext.Provider>
  );
};

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return ctx;
}