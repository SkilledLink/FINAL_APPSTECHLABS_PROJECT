// src/features/messages/hooks/useWebRTCCall.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { SocketEvents } from '../../../Service/socket/socketEvents';

export type CallMedia = 'audio' | 'video';

export type CallState =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connecting'
  | 'active'
  | 'ended';

export interface ActiveCall {
  callId: string;
  conversationId: string;
  otherUserId: string;
  media: CallMedia;
  state: CallState;
  isCaller: boolean;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTCCall(socket: Socket | null) {
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingOffersRef = useRef<Record<string, RTCSessionDescriptionInit>>({});
  const currentCallIdRef = useRef<string | null>(null);
  const callRef = useRef<ActiveCall | null>(null);

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  const cleanupPeer = useCallback(() => {
    try {
      pcRef.current?.close();
    } catch {
      /* ignore */
    }
    pcRef.current = null;
    pendingIceRef.current = [];
    pendingOffersRef.current = {};
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    currentCallIdRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setMuted(false);
    setCameraOff(false);
  }, []);

  const getLocalMedia = useCallback(async (media: CallMedia) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video:
        media === 'video'
          ? { width: { ideal: 640 }, height: { ideal: 480 } }
          : false,
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const buildPeer = useCallback(
    (callId: string, _otherUserId: string) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket?.emit(SocketEvents.WEBRTC_ICE, {
            call_id: callId,
            candidate: e.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (e) => {
        const stream = e.streams[0];
        if (stream) {
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setCall((c) =>
            c && c.callId === callId ? { ...c, state: 'active' } : c
          );
        }
        if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'disconnected'
        ) {
          socket?.emit(SocketEvents.CALL_END, {
            call_id: callId,
            reason: 'PEER_LOST',
          });
        }
      };

      pcRef.current = pc;
      currentCallIdRef.current = callId;
      return pc;
    },
    [socket]
  );

  /* ── Caller: initiate ──────────────────────────────────── */
  const startCall = useCallback(
    async (
      conversationId: string,
      calleeId: string,
      media: CallMedia = 'audio'
    ): Promise<void> => {
      if (!socket) return;
      setError(null);

      if (callRef.current) {
        setError('You are already in a call.');
        return;
      }

      try {
        const stream = await getLocalMedia(media);

        const ack: any = await new Promise((resolve) =>
          socket.emit(
            SocketEvents.CALL_INITIATE,
            {
              conversation_id: conversationId,
              callee_id: calleeId,
              media,
            },
            resolve
          )
        );

        if (!ack?.success) {
          stream.getTracks().forEach((t) => t.stop());
          localStreamRef.current = null;
          setLocalStream(null);
          setError(ack?.error?.message ?? 'Could not start the call.');
          return;
        }

        const callId: string = ack.data.call_id;

        const pc = buildPeer(callId, calleeId);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        setCall({
          callId,
          conversationId,
          otherUserId: calleeId,
          media,
          state: 'outgoing',
          isCaller: true,
        });
      } catch (e: any) {
        setError(
          e?.name === 'NotAllowedError'
            ? 'Please allow microphone/camera access.'
            : e?.message ?? 'Could not start the call.'
        );
      }
    },
    [socket, getLocalMedia, buildPeer]
  );

  /* ── Callee: accept ────────────────────────────────────── */
  const acceptCall = useCallback(async (): Promise<void> => {
    const current = callRef.current;
    if (!socket || !current || current.isCaller) return;
    setError(null);

    try {
      const stream = await getLocalMedia(current.media);

      // CRITICAL: build the peer and attach local tracks BEFORE emitting
      // CALL_ACCEPT. Otherwise the caller's WEBRTC_OFFER can arrive before
      // pcRef.current is set, and onOffer() silently drops it — leaving
      // the call stuck at "Connecting…".
      const pc = buildPeer(current.callId, current.otherUserId);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const ack: any = await new Promise((resolve) =>
        socket.emit(
          SocketEvents.CALL_ACCEPT,
          { call_id: current.callId },
          resolve
        )
      );

      if (!ack?.success) {
        cleanupPeer();
        setError(ack?.error?.message ?? 'Could not accept the call.');
        return;
      }

      setCall((c) => (c ? { ...c, state: 'connecting' } : c));

      // Drain any offer that raced in before buildPeer finished.
      const buffered = pendingOffersRef.current[current.callId];
      if (buffered) {
        delete pendingOffersRef.current[current.callId];
        try {
          await pc.setRemoteDescription(buffered);
          for (const c of pendingIceRef.current) {
            try {
              await pc.addIceCandidate(c);
            } catch {
              /* ignore */
            }
          }
          pendingIceRef.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit(SocketEvents.WEBRTC_ANSWER, {
            call_id: current.callId,
            sdp: answer,
          });
        } catch {
          setError('Failed to negotiate WebRTC offer.');
        }
      }
    } catch (e: any) {
      setError(
        e?.name === 'NotAllowedError'
          ? 'Please allow microphone/camera access.'
          : e?.message ?? 'Could not accept the call.'
      );
    }
  }, [socket, getLocalMedia, buildPeer, cleanupPeer]);

  /* ── Callee: reject ────────────────────────────────────── */
  const rejectCall = useCallback((): void => {
    const current = callRef.current;
    if (!socket || !current) return;
    socket.emit(SocketEvents.CALL_REJECT, { call_id: current.callId });
    cleanupPeer();
    setCall(null);
  }, [socket, cleanupPeer]);

  /* ── Either: end ───────────────────────────────────────── */
  const endCall = useCallback(
    (reason = 'HANGUP'): void => {
      const current = callRef.current;
      if (!socket || !current) return;
      socket.emit(SocketEvents.CALL_END, {
        call_id: current.callId,
        reason,
      });
      cleanupPeer();
      setCall(null);
    },
    [socket, cleanupPeer]
  );

  const toggleMute = useCallback((): void => {
    const s = localStreamRef.current;
    if (!s) return;
    s.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMuted((m) => !m);
  }, []);

  const toggleCamera = useCallback((): void => {
    const s = localStreamRef.current;
    if (!s) return;
    s.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCameraOff((c) => !c);
  }, []);

  /* ── Socket subscriptions ──────────────────────────────── */
  useEffect(() => {
    if (!socket) return;

    const onIncoming = (p: {
      call_id: string;
      conversation_id: string;
      caller_id: string;
      media: CallMedia;
    }) => {
      if (callRef.current) {
        socket.emit(SocketEvents.CALL_REJECT, { call_id: p.call_id });
        return;
      }
      setCall({
        callId: p.call_id,
        conversationId: p.conversation_id,
        otherUserId: p.caller_id,
        media: p.media,
        state: 'incoming',
        isCaller: false,
      });
    };

    const onAccepted = async () => {
      const pc = pcRef.current;
      const callId = currentCallIdRef.current;
      if (!pc || !callId) return;
      setCall((c) => (c ? { ...c, state: 'connecting' } : c));
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit(SocketEvents.WEBRTC_OFFER, {
          call_id: callId,
          sdp: offer,
        });
      } catch {
        setError('Failed to create WebRTC offer.');
      }
    };

    const clearAll = () => {
      cleanupPeer();
      setCall(null);
    };

    const onOffer = async ({
      call_id,
      sdp,
    }: {
      call_id: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      const pc = pcRef.current;
      if (!pc || currentCallIdRef.current !== call_id) {
        // Peer not ready yet — buffer the offer so acceptCall can drain it.
        pendingOffersRef.current[call_id] = sdp;
        return;
      }
      await pc.setRemoteDescription(sdp);
      for (const c of pendingIceRef.current) {
        try {
          await pc.addIceCandidate(c);
        } catch {
          /* ignore */
        }
      }
      pendingIceRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit(SocketEvents.WEBRTC_ANSWER, { call_id, sdp: answer });
    };

    const onAnswer = async ({
      call_id,
      sdp,
    }: {
      call_id: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      const pc = pcRef.current;
      if (!pc || currentCallIdRef.current !== call_id) return;
      await pc.setRemoteDescription(sdp);
      for (const c of pendingIceRef.current) {
        try {
          await pc.addIceCandidate(c);
        } catch {
          /* ignore */
        }
      }
      pendingIceRef.current = [];
    };

    const onIce = async ({
      call_id,
      candidate,
    }: {
      call_id: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (currentCallIdRef.current !== call_id) return;
      const pc = pcRef.current;
      if (!pc || !pc.remoteDescription) {
        pendingIceRef.current.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* stale candidate */
      }
    };

    socket.on(SocketEvents.CALL_INCOMING, onIncoming);
    socket.on(SocketEvents.CALL_ACCEPTED, onAccepted);
    socket.on(SocketEvents.CALL_REJECTED, clearAll);
    socket.on(SocketEvents.CALL_ENDED, clearAll);
    socket.on(SocketEvents.CALL_MISSED, clearAll);
    socket.on(SocketEvents.WEBRTC_OFFER, onOffer);
    socket.on(SocketEvents.WEBRTC_ANSWER, onAnswer);
    socket.on(SocketEvents.WEBRTC_ICE, onIce);

    return () => {
      socket.off(SocketEvents.CALL_INCOMING, onIncoming);
      socket.off(SocketEvents.CALL_ACCEPTED, onAccepted);
      socket.off(SocketEvents.CALL_REJECTED, clearAll);
      socket.off(SocketEvents.CALL_ENDED, clearAll);
      socket.off(SocketEvents.CALL_MISSED, clearAll);
      socket.off(SocketEvents.WEBRTC_OFFER, onOffer);
      socket.off(SocketEvents.WEBRTC_ANSWER, onAnswer);
      socket.off(SocketEvents.WEBRTC_ICE, onIce);
    };
  }, [socket, cleanupPeer]);

  return {
    call,
    localStream,
    remoteStream,
    muted,
    cameraOff,
    error,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}

export type WebRTCCallApi = ReturnType<typeof useWebRTCCall>;