import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  Copy,
  Download,
  File,
  FileImage,
  FileText,
  Maximize2,
  Mic,
  Pause,
  Play,
  Reply,
  Smile,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Message } from '../types/message.types';

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSender,
  isFirstInGroup = true,
  isLastInGroup = true,
  onReply,
  onReact,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(35);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => (prev >= 100 ? 0 : prev + 2.5));
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleCopyText = () => {
    if (message.text || message.content) {
      navigator.clipboard.writeText(message.text || message.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/messages/${path}`;
  };

  const imageUrl =
    message.type === 'image' && message.attachment_path
      ? getFileUrl(message.attachment_path)
      : '';

  const openImagePreview = () => {
    if (imageUrl) {
      setPreviewImageUrl(imageUrl);
      setImageModalOpen(true);
    }
  };

  // Format timestamp
  const timestamp = new Date(
    message.created_at || Date.now()
  ).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Clean, modern pill bubble corner rounding logic
  const getBubbleRadius = () => {
    if (isSender) {
      if (isFirstInGroup && isLastInGroup)
        return 'rounded-[22px] rounded-br-[5px]';
      if (isFirstInGroup) return 'rounded-[22px] rounded-br-[6px]';
      if (isLastInGroup)
        return 'rounded-[22px] rounded-tr-[6px] rounded-br-[5px]';
      return 'rounded-[22px] rounded-tr-[6px] rounded-br-[6px]';
    } else {
      if (isFirstInGroup && isLastInGroup)
        return 'rounded-[22px] rounded-bl-[5px]';
      if (isFirstInGroup) return 'rounded-[22px] rounded-bl-[6px]';
      if (isLastInGroup)
        return 'rounded-[22px] rounded-tl-[6px] rounded-bl-[5px]';
      return 'rounded-[22px] rounded-tl-[6px] rounded-bl-[6px]';
    }
  };

  // Render Status Checkmarks
  const renderStatus = () => {
    if (!isSender) return null;

    if (message.status === 'sending') {
      return (
        <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-blue-400/50 border-t-transparent shrink-0" />
      );
    }
    if (message.status === 'failed') {
      return <span className="text-[10px] font-bold text-red-400">Failed</span>;
    }
    return (
      <CheckCheck
        className={`h-3.5 w-3.5 ${
          isSender ? 'text-blue-200' : 'text-blue-500'
        }`}
      />
    );
  };

  // Hover Quick Actions Menu
  const renderActionMenu = () => (
    <div className="flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-white/95 p-1 shadow-lg shadow-black/10 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/95 text-slate-600 dark:text-slate-300">
      {onReply && (
        <button
          type="button"
          onClick={() => onReply(message)}
          title="Reply"
          className="rounded-full p-1.5 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700/60 dark:hover:text-blue-400"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}
      {(message.text || message.content) && (
        <button
          type="button"
          onClick={handleCopyText}
          title="Copy text"
          className="rounded-full p-1.5 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700/60 dark:hover:text-blue-400"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      {onReact && (
        <button
          type="button"
          onClick={() => onReact(message.id, '❤️')}
          title="React"
          className="rounded-full p-1.5 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
        >
          <Smile className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`group relative flex flex-col ${
          isSender ? 'items-end' : 'items-start'
        } my-0.5 w-full`}
      >
        {/* Hover Action Menu */}
        <div
          className={`absolute -top-3 z-30 ${
            isSender ? 'right-2' : 'left-2'
          } pointer-events-none opacity-0 shadow-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100`}
        >
          {renderActionMenu()}
        </div>

        {/* ─── IMAGE MESSAGE TYPE ────────────────────────────── */}
        {message.type === 'image' && imageUrl ? (
          <div className="max-w-[280px] space-y-1 sm:max-w-[340px]">
            <div
              className={`group/image relative overflow-hidden border border-slate-200/80 bg-slate-100 shadow-sm cursor-pointer dark:border-slate-700/60 dark:bg-slate-800 ${getBubbleRadius()}`}
              onClick={openImagePreview}
            >
              <img
                src={imageUrl}
                alt={message.fileDetails?.name || 'Attachment'}
                className="max-h-[300px] w-full object-cover transition-transform duration-300 ease-out group-hover/image:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 opacity-0 transition-opacity group-hover/image:opacity-100">
                <div className="rounded-full bg-white/20 p-2.5 text-white shadow-lg backdrop-blur-md">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Image Meta & Timestamp */}
            <div
              className={`flex items-center justify-between px-1 text-[10px] font-medium ${
                isSender ? 'flex-row-reverse' : ''
              } text-slate-400 dark:text-slate-500`}
            >
              <span className="max-w-[180px] truncate">
                {message.fileDetails?.name ||
                  message.attachment_name ||
                  'Image'}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <span>{timestamp}</span>
                {renderStatus()}
              </div>
            </div>
          </div>
        ) : (
          /* ─── TEXT / FILE / AUDIO BUBBLE TYPE ──────────────── */
          <div
            className={`relative max-w-[85%] px-4 py-2.5 text-sm transition-all duration-200 sm:max-w-[75%] ${getBubbleRadius()} ${
              isSender
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15'
                : 'border border-slate-200/80 bg-white/90 text-slate-900 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-100'
            }`}
          >
            {/* FILE ATTACHMENT */}
            {message.type === 'file' && message.attachment_path && (
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-slate-900/10 bg-slate-900/5 p-2 dark:border-white/10 dark:bg-white/5">
                <div
                  className={`rounded-lg p-2.5 shrink-0 ${
                    isSender
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  }`}
                >
                  {message.fileDetails?.icon === 'file-image' ? (
                    <FileImage className="h-5 w-5" />
                  ) : message.fileDetails?.icon === 'file-word' ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <File className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">
                    {message.fileDetails?.name ||
                      message.attachment_name ||
                      'Attached File'}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isSender
                        ? 'text-blue-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {message.fileDetails?.size ||
                      (message.attachment_size
                        ? `${(message.attachment_size / 1024).toFixed(1)} KB`
                        : 'File')}
                  </p>
                </div>
                <a
                  href={getFileUrl(message.attachment_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-2 transition-colors ${
                    isSender
                      ? 'text-white hover:bg-white/20'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* AUDIO / VOICE NOTE */}
            {message.type === 'audio' && message.audioDetails && (
              <div className="mb-1 flex min-w-[200px] items-center gap-3 sm:min-w-[240px]">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`rounded-full p-2.5 shadow-md shrink-0 ${
                    isSender
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  )}
                </motion.button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={`flex items-center gap-1 ${
                        isSender
                          ? 'text-blue-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Mic className="h-3 w-3" /> Voice Note
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        isSender ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {message.audioDetails.duration}
                    </span>
                  </div>

                  {/* Waveform Bars */}
                  <div className="flex h-5 items-center gap-1 cursor-pointer">
                    {message.audioDetails.waveform.map((height, i) => {
                      const barPercentage =
                        ((i + 1) / message.audioDetails.waveform.length) * 100;
                      const isPassed = barPercentage <= playbackProgress;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPlaybackProgress(barPercentage)}
                          onMouseEnter={() => setHoveredBar(i)}
                          onMouseLeave={() => setHoveredBar(null)}
                          style={{ height: `${height}%` }}
                          className={`w-1 rounded-full transition-all ${
                            hoveredBar === i || isPassed
                              ? isSender
                                ? 'bg-white'
                                : 'bg-blue-600 dark:bg-blue-400'
                              : isSender
                              ? 'bg-white/40'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TEXT CONTENT */}
            {(message.type === 'text' || message.text || message.content) && (
              <p className="whitespace-pre-wrap break-words text-sm font-normal leading-relaxed">
                {message.text || message.content}
              </p>
            )}

            {/* TIMESTAMP AND STATUS INLINE FOOTER */}
            <div
              className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] font-medium ${
                isSender
                  ? 'text-blue-100/90'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span>{timestamp}</span>
              {renderStatus()}
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── FULL-SCREEN IMAGE PREVIEW MODAL ───────────────────────── */}
      <AnimatePresence>
        {imageModalOpen && previewImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-lg sm:p-6"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative flex max-h-[90vh] w-full max-w-5xl items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 rounded-full border border-white/10 bg-slate-950/60 p-2.5 text-white backdrop-blur-md transition-all hover:bg-slate-950/90"
                onClick={() => setImageModalOpen(false)}
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={previewImageUrl}
                alt="Full Preview"
                className="h-auto max-h-[85vh] w-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};