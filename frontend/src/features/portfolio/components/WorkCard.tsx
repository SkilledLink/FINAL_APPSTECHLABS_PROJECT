import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Camera, Calendar, MapPin, Users, Clock, Image as ImageIcon } from 'lucide-react';
import type{ Work } from '../../../api/portfolioApi';

interface WorkCardProps {
  work: Work;
  onEdit: () => void;
  onDelete: () => void;
  onUploadImages: (before?: File, after?: File) => Promise<void>;
}

export default function WorkCard({ work, onEdit, onDelete, onUploadImages }: WorkCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      if (type === 'before') {
        await onUploadImages(file, undefined);
      } else {
        await onUploadImages(undefined, file);
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-blue-400/20 dark:border-blue-400/20 p-4 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
    >
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={onEdit}
          className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pr-16">{work.title}</h3>
      {work.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{work.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
        {work.service_category && (
          <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center gap-1">
            <Clock size={12} /> {work.service_category}
          </span>
        )}
        {work.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {work.location}
          </span>
        )}
        {work.duration_value && work.duration_unit && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> {work.duration_value} {work.duration_unit}
          </span>
        )}
        {work.team_size && (
          <span className="flex items-center gap-1">
            <Users size={12} /> {work.team_size} people
          </span>
        )}
        {work.client_type && (
          <span className="flex items-center gap-1">
            <Users size={12} /> {work.client_type}
          </span>
        )}
      </div>

      {/* Images */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="relative group">
          <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
            {work.before_image_url ? (
              <img src={work.before_image_url} alt="Before" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                <ImageIcon size={24} />
              </div>
            )}
          </div>
          <button
            onClick={() => beforeInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm gap-1"
          >
            <Camera size={16} /> {work.before_image_url ? 'Replace' : 'Upload'} Before
          </button>
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'before')}
          />
          <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Before</span>
        </div>
        <div className="relative group">
          <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
            {work.after_image_url ? (
              <img src={work.after_image_url} alt="After" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                <ImageIcon size={24} />
              </div>
            )}
          </div>
          <button
            onClick={() => afterInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm gap-1"
          >
            <Camera size={16} /> {work.after_image_url ? 'Replace' : 'Upload'} After
          </button>
          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'after')}
          />
          <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">After</span>
        </div>
      </div>
    </motion.div>
  );
}