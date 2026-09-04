// src/features/messages/components/FileMessage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  File,
  FileImage,
  FilePdf,
  FileText,
  FileVideo,
  FileAudio,
  Download,
  Archive,
  FileCode,
} from 'lucide-react';
import type { Message } from '../types/message.types';

interface FileMessageProps {
  message: Message;
  isSender: boolean;
}

const fileIcons: Record<string, React.ReactNode> = {
  'file-image': <FileImage className="w-5 h-5" />,
  'file-pdf': <FilePdf className="w-5 h-5" />,
  'file-word': <FileText className="w-5 h-5" />,
  'file-excel': <FileText className="w-5 h-5" />,
  'file-video': <FileVideo className="w-5 h-5" />,
  'file-audio': <FileAudio className="w-5 h-5" />,
  'file-archive': <Archive className="w-5 h-5" />,
  'file-code': <FileCode className="w-5 h-5" />,
};

const getIconColor = (icon: string): string => {
  const colors: Record<string, string> = {
    'file-image': 'text-purple-500',
    'file-pdf': 'text-red-500',
    'file-word': 'text-blue-500',
    'file-excel': 'text-green-500',
    'file-video': 'text-pink-500',
    'file-audio': 'text-orange-500',
    'file-archive': 'text-amber-500',
    'file-code': 'text-indigo-500',
  };
  return colors[icon] || 'text-slate-500';
};

export const FileMessage: React.FC<FileMessageProps> = ({ message, isSender }) => {
  const fileUrl = message.attachment_path
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/messages/${message.attachment_path}`
    : '';

  const icon = fileIcons[message.fileDetails?.icon || 'file-alt'] || <File className="w-5 h-5" />;
  const iconColor = getIconColor(message.fileDetails?.icon || 'file-alt');

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
      <div className={`p-2 rounded-lg ${isSender ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isSender ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
          {message.fileDetails?.name || 'File'}
        </p>
        <p className={`text-xs ${isSender ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
          {message.fileDetails?.size || 'Unknown size'}
        </p>
      </div>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 rounded-full transition ${
          isSender
            ? 'hover:bg-white/20 text-white/80 hover:text-white'
            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
        title="Download"
      >
        <Download className="w-4 h-4" />
      </a>
    </motion.div>
  );
};