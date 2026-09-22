// src/features/messages/components/CallOverlay.tsx
import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import type { WebRTCCallApi } from '../hooks/useWebRTCCall';

interface Props {
  api: WebRTCCallApi;
  /** Display name of the other participant. */
  otherUserName?: string;
  /** Avatar URL of the other participant. */
  otherUserAvatar?: string;
}

export function CallOverlay({ api, otherUserName, otherUserAvatar }: Props) {
  const { call, localStream, remoteStream } = api;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, call?.media]);

  if (!call) return null;

  const isVideo = call.media === 'video';
  const showRemoteVideo = isVideo && !!remoteStream;
  const showLocalVideo = isVideo && !!localStream;

  const statusLabel = {
    incoming: 'Incoming call',
    outgoing: 'Calling…',
    connecting: 'Connecting…',
    active: 'Connected',
    ended: 'Call ended',
    idle: '',
  }[call.state];

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/95 text-white backdrop-blur-xl">
      <div className="relative flex-1 overflow-hidden">
        {showRemoteVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <audio ref={remoteAudioRef} autoPlay />
            <div className="flex h-full flex-col items-center justify-center gap-3">
              {otherUserAvatar ? (
                <img
                  src={otherUserAvatar}
                  alt={otherUserName ?? ''}
                  className="h-28 w-28 rounded-full border-2 border-white/20 object-cover shadow-2xl"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-4xl font-bold">
                  {(otherUserName ?? 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {otherUserName && (
                <p className="text-2xl font-semibold">{otherUserName}</p>
              )}
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                {statusLabel}
              </p>
            </div>
          </>
        )}

        {/* Local preview (video only) */}
        {showLocalVideo && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 h-40 w-32 rounded-xl border border-white/20 object-cover shadow-2xl"
          />
        )}

        {/* Status banner on top of remote video */}
        {showRemoteVideo && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70 drop-shadow-lg">
              {statusLabel}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 py-8">
        {call.state === 'incoming' ? (
          <>
            <button
              type="button"
              onClick={api.rejectCall}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 transition hover:bg-rose-500 active:scale-95"
              aria-label="Reject call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={api.acceptCall}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 transition hover:bg-emerald-500 active:scale-95"
              aria-label="Accept call"
            >
              <Phone className="h-6 w-6" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={api.toggleMute}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition active:scale-95 ${
                api.muted
                  ? 'bg-white text-slate-900'
                  : 'bg-white/15 hover:bg-white/25'
              }`}
              aria-label={api.muted ? 'Unmute' : 'Mute'}
            >
              {api.muted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            {isVideo && (
              <button
                type="button"
                onClick={api.toggleCamera}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition active:scale-95 ${
                  api.cameraOff
                    ? 'bg-white text-slate-900'
                    : 'bg-white/15 hover:bg-white/25'
                }`}
                aria-label={api.cameraOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {api.cameraOff ? (
                  <VideoOff className="h-5 w-5" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => api.endCall('HANGUP')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 transition hover:bg-rose-500 active:scale-95"
              aria-label="End call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {api.error && (
        <p className="pb-6 text-center text-sm text-rose-400">{api.error}</p>
      )}
    </div>
  );
}