import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Check,
  CheckCheck,
  Mic,
  Reply,
  Smile,
  Copy,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`group relative flex flex-col ${
        isSender ? 'items-end' : 'items-start'
      } my-2.5 px-2`}
    >
      {/* Floating Action Menu on Hover */}
      <div
        className={`absolute z-20 -top-3.5 ${
          isSender ? 'right-4' : 'left-4'
        } opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out transform group-hover:translate-y-0 translate-y-1 pointer-events-none group-hover:pointer-events-auto`}
      >
        <div className="flex items-center gap-0.5 p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full shadow-lg shadow-slate-900/10 text-slate-500 dark:text-slate-400">
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          )}
          {message.text && (
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
              title="Copy Text"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onReact && (
            <button
              type="button"
              onClick={() => onReact(message.id, '❤️')}
              className="p-1.5 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
              title="React"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Message Bubble */}
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] p-4 text-sm transition-all duration-200 ${
          isSender
            ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white rounded-3xl rounded-tr-md shadow-md shadow-indigo-500/15 ring-1 ring-white/20'
            : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-3xl rounded-tl-md shadow-sm shadow-slate-900/5'
        }`}
      >
        {message.type === 'audio' && message.audioDetails ? (
          <div className="flex items-center gap-3.5 min-w-[250px] sm:min-w-[290px]">
            {/* Play/Pause Button with Pulsing Glow Ring */}
            <div className="relative">
              {isPlaying && (
                <motion.span
                  animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  className={`absolute inset-0 rounded-full ${
                    isSender ? 'bg-white/40' : 'bg-indigo-500/40'
                  }`}
                />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`relative z-10 p-3 rounded-full shrink-0 transition-shadow shadow-md ${
                  isSender
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-black/10'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:opacity-95 shadow-indigo-500/20'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </motion.button>
            </div>

            {/* Audio Info & Interactive Waveform */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide">
                <span
                  className={`inline-flex items-center gap-1.5 ${
                    isSender ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isSender ? 'text-indigo-200' : 'text-indigo-500'}`} />
                  Voice Note
                </span>
                <span
                  className={`font-mono text-[10px] ${
                    isSender ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {message.audioDetails.duration}
                </span>
              </div>

              {/* Scrubbable Waveform Bars with Progress Indicator */}
              <div className="flex items-center gap-1 h-7 pt-1 cursor-pointer">
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
                                `${Math.max(25, (height + 40) % 100)}%`,
                                `${height}%`,
                              ],
                            }
                          : { height: `${height}%` }
                      }
                      transition={{
                        repeat: isPlaying ? Infinity : 0,
                        duration: 0.5,
                        delay: i * 0.03,
                      }}
                      className={`w-1 rounded-full transition-colors ${
                        hoveredBar === i
                          ? isSender
                            ? 'bg-white'
                            : 'bg-indigo-600 dark:bg-indigo-400'
                          : isPassed
                          ? isSender
                            ? 'bg-white'
                            : 'bg-indigo-600 dark:bg-indigo-400'
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
        ) : (
          <p className="leading-relaxed break-words text-[14.5px] font-normal tracking-wide">
            {message.text}
          </p>
        )}

        {/* Timestamp & Delivery Status Indicator */}
        <div
          className={`flex items-center justify-end gap-1 text-[10px] font-medium mt-1.5 ${
            isSender ? 'text-indigo-100/90' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <span>{message.createdAt}</span>
          {isSender && (
            <CheckCheck
              className={`w-3.5 h-3.5 ${
                message.isRead ? 'text-sky-300' : 'text-indigo-200/60'
              }`}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};