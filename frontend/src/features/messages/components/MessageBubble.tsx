import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, Check, CheckCheck, Mic, Reply, Smile, Copy,
  File, FileImage, FileText, Download,
} from 'lucide-react';
import type { Message } from '../types/message.types';

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSender,
  onReply,
  onReact,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(35);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
  };

  const getFileUrl = (path?: string) => {
    if (!path) return '';
    // If it's already a full URL (starts with http), return it as is
    if (path.startsWith('http')) return path;
    // Otherwise, assume it's a Supabase path
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/messages/${path}`;
  };

  const getStatusLabel = () => {
    if (!isSender) return null;
    if (message.status === 'sending') return 'Sending...';
    if (message.status === 'failed') return 'Failed';
    return 'Sent';
  };

  const statusLabel = getStatusLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className={`group relative flex flex-col ${isSender ? 'items-end' : 'items-start'} my-2 px-2`}
    >
      <div
        className={`absolute z-20 -top-3.5 ${isSender ? 'right-4' : 'left-4'} 
          opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out 
          transform group-hover:translate-y-0 translate-y-1 pointer-events-none group-hover:pointer-events-auto`}
      >
        <div className="flex items-center gap-0.5 p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-full shadow-lg shadow-black/5 text-slate-500 dark:text-slate-400">
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          )}
          {message.text && (
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onReact && (
            <button
              type="button"
              onClick={() => onReact(message.id, '❤️')}
              className="p-1.5 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`relative max-w-[85%] sm:max-w-[70%] px-5 py-3.5 text-[15px] leading-relaxed transition-all duration-200 ${
          isSender
            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-blue-500/20'
            : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl rounded-tl-sm shadow-sm shadow-slate-200/50 dark:shadow-slate-900/30'
        }`}
      >
        {/* IMAGE */}
        {message.type === 'image' && message.attachment_path && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg overflow-hidden max-w-[300px] cursor-pointer"
            onClick={() => {
              const url = getFileUrl(message.attachment_path);
              if (url) window.open(url, '_blank');
            }}
          >
            <img
              src={getFileUrl(message.attachment_path)}
              alt={message.fileDetails?.name || 'Image'}
              className="w-full h-auto object-cover rounded-lg hover:scale-[1.02] transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.textContent = 'Image failed to load';
                  fallback.className = 'p-4 text-sm text-slate-500 dark:text-slate-400';
                  parent.appendChild(fallback);
                }
              }}
            />
          </motion.div>
        )}

        {/* FILE */}
        {message.type === 'file' && message.attachment_path && (
          <div className="flex items-center gap-3 p-2 min-w-[180px]">
            <div className={`p-2 rounded-lg ${isSender ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {message.fileDetails?.icon === 'file-image' && <FileImage className="w-5 h-5" />}
              {message.fileDetails?.icon === 'file-pdf' && <FilePdf className="w-5 h-5" />}
              {message.fileDetails?.icon === 'file-word' && <FileText className="w-5 h-5" />}
              {!message.fileDetails?.icon && <File className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isSender ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                {message.fileDetails?.name || message.attachment_name || 'File'}
              </p>
              <p className={`text-xs ${isSender ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                {message.fileDetails?.size || (message.attachment_size ? `${(message.attachment_size / 1024).toFixed(1)} KB` : 'Unknown size')}
              </p>
            </div>
            <a
              href={getFileUrl(message.attachment_path)}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition ${isSender ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* VOICE */}
        {message.type === 'audio' && message.audioDetails && (
          <div className="flex items-center gap-4 min-w-[220px] sm:min-w-[260px]">
            <div className="relative">
              {isPlaying && (
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className={`absolute inset-0 rounded-full ${isSender ? 'bg-white/30' : 'bg-blue-500/30'}`}
                />
              )}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`relative z-10 p-2.5 rounded-full shrink-0 transition-shadow shadow-md ${
                  isSender
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-white/20'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-indigo-500/30'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </motion.button>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={`flex items-center gap-1.5 ${isSender ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  <Mic className={`w-3.5 h-3.5 ${isSender ? 'text-blue-200' : 'text-blue-500'}`} />
                  Voice Note
                </span>
                <span className={`font-mono text-[10px] ${isSender ? 'text-blue-200' : 'text-slate-400'}`}>
                  {message.audioDetails.duration}
                </span>
              </div>
              <div className="flex items-center gap-1 h-6 pt-1 cursor-pointer">
                {message.audioDetails.waveform.map((height, i) => {
                  const barPercentage = ((i + 1) / message.audioDetails.waveform.length) * 100;
                  const isPassed = barPercentage <= playbackProgress;
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => setPlaybackProgress(barPercentage)}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                      animate={
                        isPlaying
                          ? {
                              height: [
                                `${height}%`,
                                `${Math.max(20, (height + 50) % 100)}%`,
                                `${height}%`,
                              ],
                            }
                          : { height: `${height}%` }
                      }
                      transition={{
                        repeat: isPlaying ? Infinity : 0,
                        duration: 0.6,
                        delay: i * 0.04,
                      }}
                      className={`w-1 rounded-full transition-colors ${
                        hoveredBar === i
                          ? isSender
                            ? 'bg-white'
                            : 'bg-blue-600 dark:bg-blue-400'
                          : isPassed
                          ? isSender
                            ? 'bg-white'
                            : 'bg-blue-600 dark:bg-blue-400'
                          : isSender
                          ? 'bg-white/40'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TEXT */}
        {message.type === 'text' && (
          <p className="break-words font-medium leading-relaxed">{message.text || message.content}</p>
        )}

        {/* Timestamp & status */}
        <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] font-medium ${isSender ? 'text-blue-100/80' : 'text-slate-400 dark:text-slate-500'}`}>
          <span className="font-mono tracking-wide">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isSender && message.status === 'sent' && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
          {isSender && message.status === 'sending' && (
            <div className="w-3.5 h-3.5 border-2 border-blue-300/50 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {isSender && statusLabel && (
          <div
            className={`mt-1 text-right text-[10px] font-medium ${
              statusLabel === 'Failed' ? 'text-red-300' : statusLabel === 'Sending...' ? 'text-blue-200/70' : 'text-blue-200/80'
            }`}
          >
            {statusLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
};