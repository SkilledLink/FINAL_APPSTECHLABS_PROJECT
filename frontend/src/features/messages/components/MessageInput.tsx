import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip,
  Send,
  Mic,
  Square,
  Trash2,
  X,
  File,
  MapPin,
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendVoiceNote: (duration: string) => void;
  onSendFile?: (file: File) => void;
  onSendImage?: (file: File) => void;
  /** Opens the location-picker modal. If omitted, the button is hidden. */
  onShareLocation?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
  onTypingChange?: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendVoiceNote,
  onSendFile,
  onSendImage,
  onShareLocation,
  uploading = false,
  uploadProgress = 0,
  onTypingChange,
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const stopTypingNow = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current && onTypingChange) {
      isTypingRef.current = false;
      onTypingChange(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (!onTypingChange) return;

    if (value.length === 0) {
      stopTypingNow();
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChange(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingChange(false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopTypingNow();
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/') && onSendImage) {
        onSendImage(selectedFile);
      } else if (onSendFile) {
        onSendFile(selectedFile);
      }
      setSelectedFile(null);
      return;
    }
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  const stopAndSendRecording = () => {
    setIsRecording(false);
    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
    onSendVoiceNote(durationStr || '0:05');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = '';
  };

  return (
    <div className="px-4 py-3.5 bg-transparent relative">
      <div className="max-w-4xl mx-auto">
        {uploading && (
          <div className="mb-2.5 h-1 bg-slate-200/70 dark:bg-slate-700/70 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        )}

        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="mb-2.5 flex items-center gap-3 p-2.5 bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shadow-sm"
            >
              {selectedFile.type.startsWith('image/') ? (
                <div className="w-11 h-11 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 flex items-center justify-center overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 flex items-center justify-center">
                  <File className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[10.5px] text-slate-400 tabular-nums">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 rounded-full transition"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording-bar"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="flex items-center justify-between gap-4 p-2.5 pl-5 bg-gradient-to-r from-rose-500/10 via-red-500/10 to-amber-500/10 dark:from-rose-950/40 dark:via-red-950/40 dark:to-amber-950/30 border border-red-500/30 rounded-3xl backdrop-blur-xl shadow-lg shadow-red-500/5 ring-1 ring-red-500/20"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                    className="absolute w-4 h-4 rounded-full bg-red-500/50"
                  />
                  <span className="relative w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-red-600 dark:text-red-400">
                    Recording
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 tabular-nums">
                    {formatTimer(recordingSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="p-2.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-2xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={stopAndSendRecording}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-red-500/25 transition"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Send Voicemail</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="input-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onSubmit={handleSubmit}
              className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 rounded-3xl shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)] focus-within:border-slate-300 dark:focus-within:border-slate-700 focus-within:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.18)] transition-all duration-200"
            >
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 rounded-2xl transition ml-1"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {onShareLocation && (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={onShareLocation}
                    className="p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 rounded-2xl transition"
                    title="Share location"
                  >
                    <MapPin className="w-5 h-5" />
                  </motion.button>
                )}
              </div>

              <input
                type="text"
                placeholder={selectedFile ? 'File selected…' : 'Write a message…'}
                value={text}
                onChange={handleTextChange}
                disabled={!!selectedFile}
                className="flex-1 bg-transparent px-2 py-2.5 text-[13.5px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              />

              <div className="flex items-center gap-1.5 pr-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsRecording(true)}
                  className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 rounded-2xl transition"
                  title="Record voice note"
                >
                  <Mic className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={text.trim() || selectedFile ? { scale: 1.05 } : {}}
                  whileTap={text.trim() || selectedFile ? { scale: 0.95 } : {}}
                  type="submit"
                  disabled={!text.trim() && !selectedFile}
                  className="p-2.5 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 hover:opacity-95 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_12px_-4px_rgba(15,23,42,0.3)] dark:shadow-[0_4px_12px_-4px_rgba(255,255,255,0.15)] transition-all"
                  title="Send"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" strokeWidth={2.2} />
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};