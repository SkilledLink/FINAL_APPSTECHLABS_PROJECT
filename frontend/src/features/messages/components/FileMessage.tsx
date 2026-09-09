import React from 'react';
import { motion } from 'framer-motion';
import { File, FileImage, FilePdf, FileText, FileVideo, FileAudio, Download, Archive, FileCode } from 'lucide-react';
import type { Message } from '../types/message.types';

interface FileMessageProps {
  message: Message;
  isSender: boolean;
}

export const FileMessage: React.FC<FileMessageProps> = ({ message, isSender }) => {
  const fileUrl = message.attachment_path
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/messages/${message.attachment_path}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 min-w-[200px] max-w-[280px] ${
        isSender
          ? 'bg-white/20 border-white/20 hover:border-white/40'
          : 'bg-white/90 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
      } shadow-sm hover:shadow-md`}
    >
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
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 rounded-full transition ${isSender ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
      >
        <Download className="w-4 h-4" />
      </a>
    </motion.div>
  );
};