import { motion } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import type { WebRTCCallApi } from '../hooks/useWebRTCCall';

interface Props {
  api: WebRTCCallApi;
  otherUserName?: string;
  otherUserAvatar?: string;
}

export function IncomingCallNotification({
  api,
  otherUserName,
  otherUserAvatar,
}: Props) {
  const call = api.call;
  if (!call || call.state !== 'incoming') return null;

  const isVideo = call.media === 'video';
  const displayName = otherUserName ?? 'Unknown';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-center text-slate-900 shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/95 dark:text-white"
      >
        {/* Pulsing avatar */}
        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full bg-indigo-500/30"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute inset-0 rounded-full bg-indigo-500/20"
            animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.4,
            }}
          />
          {otherUserAvatar ? (
            <img
              src={otherUserAvatar}
              alt={displayName}
              className="relative h-24 w-24 rounded-full border-2 border-white object-cover shadow-xl dark:border-slate-900"
            />
          ) : (
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/20 text-4xl font-bold text-indigo-600 dark:bg-indigo-500/30 dark:text-indigo-200">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-300">
          Incoming {isVideo ? 'video' : 'voice'} call
        </p>
        <h3 className="mt-2 text-2xl font-bold">{displayName}</h3>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={api.rejectCall}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-500 active:scale-95"
              aria-label="Ignore call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
              Ignore
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={api.acceptCall}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 active:scale-95"
              aria-label="Accept call"
            >
              {isVideo ? (
                <Video className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
              Accept
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}