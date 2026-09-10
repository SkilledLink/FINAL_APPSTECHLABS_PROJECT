import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Check,
  CheckCheck,
  Mic,
  Reply,
  Smile,
  Copy,
  File,
  FileImage,
  FileText,
  Download,
  X,
  Maximize2,
} from 'lucide-react';
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

  const imageUrl = message.type === 'image' && message.attachment_path ? getFileUrl(message.attachment_path) : '';

  const openImagePreview = () => {
    if (imageUrl) {
      setPreviewImageUrl(imageUrl);
      setImageModalOpen(true);
    }
  };

  // Format timestamp
  const timestamp = new Date(message.created_at || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Dynamic bubble corner rounding logic
  const getBubbleRadius = () => {
    if (isSender) {
      if (isFirstInGroup && isLastInGroup) return 'rounded-3xl rounded-br-lg';
      if (isFirstInGroup) return 'rounded-3xl rounded-tr-md rounded-br-md';
      if (isLastInGroup) return 'rounded-3xl rounded-tr-md rounded-br-lg';
      return 'rounded-3xl rounded-tr-md rounded-br-md';
    } else {
      if (isFirstInGroup && isLastInGroup) return 'rounded-3xl rounded-bl-lg';
      if (isFirstInGroup) return 'rounded-3xl rounded-tl-md rounded-bl-md';
      if (isLastInGroup) return 'rounded-3xl rounded-tl-md rounded-bl-lg';
      return 'rounded-3xl rounded-tl-md rounded-bl-md';
    }
  };

  // Render Status Checkmarks
  const renderStatus = () => {
    if (!isSender) return null;

    if (message.status === 'sending') {
      return <div className="w-2.5 h-2.5 border-2 border-blue-400/50 border-t-transparent rounded-full animate-spin shrink-0" />;
    }
    if (message.status === 'failed') {
      return <span className="text-[10px] font-bold text-red-400">Failed</span>;
    }
    return <CheckCheck className={`w-3.5 h-3.5 ${isSender ? 'text-blue-200' : 'text-blue-500'}`} />;
  };

  // Hover Quick Actions Menu
  const renderActionMenu = () => (
    <div className="flex items-center gap-0.5 p-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full shadow-lg shadow-black/10 text-slate-600 dark:text-slate-300">
      {onReply && (
        <button
          type="button"
          onClick={() => onReply(message)}
          title="Reply"
          className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-full transition-colors"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>
      )}
      {(message.text || message.content) && (
        <button
          type="button"
          onClick={handleCopyText}
          title="Copy text"
          className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-full transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
      {onReact && (
        <button
          type="button"
          onClick={() => onReact(message.id, '❤️')}
          title="React"
          className="p-1.5 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors"
        >
          <Smile className="w-3.5 h-3.5" />
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
        className={`group relative flex flex-col ${isSender ? 'items-end' : 'items-start'} my-1 w-full`}
      >
        {/* Hover Action Menu */}
        <div
          className={`absolute z-30 -top-3 ${
            isSender ? 'right-2' : 'left-2'
          } opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto shadow-md`}
        >
          {renderActionMenu()}
        </div>

        {/* ─── IMAGE MESSAGE TYPE ────────────────────────────── */}
        {message.type === 'image' && imageUrl ? (
          <div className="max-w-[280px] sm:max-w-[340px] space-y-1">
            <div
              className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm cursor-pointer group/image"
              onClick={openImagePreview}
            >
              <img
                src={imageUrl}
                alt={message.fileDetails?.name || 'Attachment'}
                className="w-full max-h-[300px] object-cover group-hover/image:scale-105 transition-transform duration-300 ease-out"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Image Meta & Timestamp */}
            <div className={`flex items-center justify-between px-1 text-[10px] ${isSender ? 'flex-row-reverse' : ''} text-slate-400 dark:text-slate-500 font-medium`}>
              <span className="truncate max-w-[180px]">
                {message.fileDetails?.name || message.attachment_name || 'Image'}
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
            className={`relative max-w-[85%] sm:max-w-[75%] px-4 py-3 text-sm transition-all duration-200 ${getBubbleRadius()} ${
              isSender
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15'
                : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 shadow-xs'
            }`}
          >
            {/* FILE ATTACHMENT */}
            {message.type === 'file' && message.attachment_path && (
              <div className="flex items-center gap-3 mb-2 p-2 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10">
                <div className={`p-2.5 rounded-lg shrink-0 ${isSender ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                  {message.fileDetails?.icon === 'file-image' ? (
                    <FileImage className="w-5 h-5" />
                  ) : message.fileDetails?.icon === 'file-word' ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <File className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">
                    {message.fileDetails?.name || message.attachment_name || 'Attached File'}
                  </p>
                  <p className={`text-[10px] ${isSender ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {message.fileDetails?.size || (message.attachment_size ? `${(message.attachment_size / 1024).toFixed(1)} KB` : 'File')}
                  </p>
                </div>
                <a
                  href={getFileUrl(message.attachment_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition-colors ${
                    isSender
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* AUDIO / VOICE NOTE */}
            {message.type === 'audio' && message.audioDetails && (
              <div className="flex items-center gap-3 min-w-[200px] sm:min-w-[240px] mb-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-2.5 rounded-full shrink-0 shadow-md ${
                    isSender
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </motion.button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={`flex items-center gap-1 ${isSender ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      <Mic className="w-3 h-3" /> Voice Note
                    </span>
                    <span className={`font-mono text-[10px] ${isSender ? 'text-blue-100' : 'text-slate-400'}`}>
                      {message.audioDetails.duration}
                    </span>
                  </div>

                  {/* Waveform Bars */}
                  <div className="flex items-center gap-1 h-5 cursor-pointer">
                    {message.audioDetails.waveform.map((height, i) => {
                      const barPercentage = ((i + 1) / message.audioDetails.waveform.length) * 100;
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
              <p className="break-words font-normal leading-relaxed text-sm whitespace-pre-wrap">
                {message.text || message.content}
              </p>
            )}

            {/* TIMESTAMP AND STATUS INLINE FOOTER */}
            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-medium ${isSender ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
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
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 p-2.5 bg-slate-950/60 hover:bg-slate-950/90 rounded-full text-white backdrop-blur-md transition-all border border-white/10"
                onClick={() => setImageModalOpen(false)}
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewImageUrl}
                alt="Full Preview"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};