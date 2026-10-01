import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Maximize2,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  SwitchCamera,
} from 'lucide-react';
import type { WebRTCCallApi } from '../hooks/useWebRTCCall';

interface Props {
  api: WebRTCCallApi;
  otherUserName?: string;
  otherUserAvatar?: string;
  onExpand: () => void;
}

function useCallDuration(active: boolean): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return seconds;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export function MinimizedCallBubble({
  api,
  otherUserName,
  otherUserAvatar,
  onExpand,
}: Props) {
  const { call, remoteStream } = api;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const duration = useCallDuration(call?.state === 'active');

  // Local state for the flip button — shows a spinner during the switch.
  const [switchingCamera, setSwitchingCamera] = useState(false);

  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      if (!el || !remoteStream) return;
      el.srcObject = remoteStream;
      el.play().catch(() => {});
    },
    [remoteStream]
  );

  const handleSwitchCamera = useCallback(async () => {
    if (!api.switchCamera) return;
    setSwitchingCamera(true);
    try {
      await api.switchCamera();
    } catch {
      /* swallow — the hook logs its own errors */
    } finally {
      setSwitchingCamera(false);
    }
  }, [api]);

  if (!call) return null;

  const isVideo = call.media === 'video';
  const showRemoteVideo = isVideo && !!remoteStream;
  const displayName = otherUserName ?? 'Unknown';
  const canSwitchCamera =
    isVideo && !!api.switchCamera && !api.cameraOff;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="fixed bottom-4 right-4 z-[99998] w-72 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/95 dark:text-white"
    >
      {/* Preview area */}
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
        {showRemoteVideo ? (
          <video
            ref={setVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {otherUserAvatar ? (
              <img
                src={otherUserAvatar}
                alt={displayName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-700 dark:bg-white/10 dark:text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Duration overlay */}
        <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono font-semibold text-white">
          {call.state === 'active' ? formatDuration(duration) : 'Connecting…'}
        </div>
      </div>

      {/* Name + controls */}
      <div className="px-3 py-2.5">
        <p className="truncate text-sm font-semibold">{displayName}</p>

        <div className="mt-2 flex items-center justify-between gap-1.5">
          {/* Mute */}
          <button
            type="button"
            onClick={api.toggleMute}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              api.muted
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/15 dark:text-white dark:hover:bg-white/25'
            }`}
            aria-label={api.muted ? 'Unmute' : 'Mute'}
          >
            {api.muted ? (
              <MicOff className="h-3.5 w-3.5" />
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Video toggle */}
          {isVideo && (
            <button
              type="button"
              onClick={api.toggleCamera}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                api.cameraOff
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/15 dark:text-white dark:hover:bg-white/25'
              }`}
              aria-label={api.cameraOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {api.cameraOff ? (
                <VideoOff className="h-3.5 w-3.5" />
              ) : (
                <Video className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* ✅ Switch camera (front/back) — video only, camera on */}
          {canSwitchCamera && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              disabled={switchingCamera}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
              aria-label="Switch camera"
              title="Switch camera"
            >
              {switchingCamera ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <SwitchCamera className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Expand */}
          <button
            type="button"
            onClick={onExpand}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
            aria-label="Expand call"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* End call */}
          <button
            type="button"
            onClick={() => api.endCall('HANGUP')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-500"
            aria-label="End call"
          >
            <PhoneOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}