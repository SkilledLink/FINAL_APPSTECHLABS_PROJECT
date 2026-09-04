// src/features/messages/components/MessageInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Mic, Square, Trash2, X, File, Image } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendVoiceNote: (duration: string) => void;
  onSendFile?: (file: File) => void;
  onSendImage?: (file: File) => void;
  uploading?: boolean;
  uploadProgress?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendVoiceNote,
  onSendFile,
  onSendImage,
  uploading = false,
  uploadProgress = 0,
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      // Determine if image or file
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
    if (file) {
      setSelectedFile(file);
    }
    e.target.value = '';
  };

  return (
    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 relative">
      <div className="max-w-4xl mx-auto">
        {/* Upload progress bar */}
        {uploading && (
          <div className="mb-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* File preview banner */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              {selectedFile.type.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <File className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
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
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="flex items-center justify-between gap-4 p-2.5 pl-5 bg-gradient-to-r from-rose-500/10 via-red-500/10 to-amber-500/10 dark:from-rose-950/40 dark:via-red-950/40 dark:to-amber-950/30 border border-red-500/30 rounded-3xl backdrop-blur-xl shadow-lg shadow-red-500/5 ring-1 ring-red-500/20"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="absolute w-4 h-4 rounded-full bg-red-500/50"
                  />
                  <span className="relative w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-red-600 dark:text-red-400">Recording</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-300">
                    {formatTimer(recordingSeconds)}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 h-5 flex-1 max-w-xs pl-4">
                  {[40, 70, 25, 90, 60, 30, 85, 100, 45, 65, 80, 35, 50, 95, 20].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        height: [`${h}%`, `${Math.max(15, (h + 50) % 100)}%`, `${h}%`],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5,
                        delay: i * 0.03,
                      }}
                      className="w-1 rounded-full bg-red-500/60 dark:bg-red-400/70"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="p-2.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-2xl transition"
                  title="Discard Recording"
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
              className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all duration-200"
            >
              {/* Attachment Button */}
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition ml-1"
                  title="Attach File"
                >
                  <Paperclip className="w-5 h-5" />
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Text Input */}
              <input
                type="text"
                placeholder={selectedFile ? 'File selected...' : 'Write a message...'}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!!selectedFile}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none disabled:opacity-50"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pr-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsRecording(true)}
                  className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-2xl transition"
                  title="Record Voicemail"
                >
                  <Mic className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={text.trim() || selectedFile ? { scale: 1.05 } : {}}
                  whileTap={text.trim() || selectedFile ? { scale: 0.95 } : {}}
                  type="submit"
                  disabled={!text.trim() && !selectedFile}
                  className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
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