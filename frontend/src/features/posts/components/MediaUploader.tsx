import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Film, Image as ImageIcon, Plus, Sparkles } from 'lucide-react';

interface MediaUploaderProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
}

interface MediaItem {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFileSelect,
  multiple = false,
  accept = 'image/*,video/*',
  maxFiles = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  // Sync internal state changes back to parent
  const updateFiles = useCallback(
    (newItems: MediaItem[]) => {
      setItems(newItems);
      onFileSelect(newItems.map((item) => item.file));
    },
    [onFileSelect]
  );

  // File Processing Handler
  const processFiles = useCallback(
    (incomingFiles: File[]) => {
      if (incomingFiles.length === 0) return;

      const validFiles = incomingFiles.filter((file) => {
        if (accept.includes('image/*') && file.type.startsWith('image/')) return true;
        if (accept.includes('video/*') && file.type.startsWith('video/')) return true;
        return accept.split(',').some((type) => file.type.match(type.trim()));
      });

      const availableSlots = multiple ? maxFiles - items.length : 1;
      const filesToProcess = validFiles.slice(0, Math.max(0, availableSlots));

      const newMediaItems: MediaItem[] = filesToProcess.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
      }));

      if (multiple) {
        updateFiles([...items, ...newMediaItems]);
      } else {
        // Clean up previous URLs if single file mode
        items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        updateFiles(newMediaItems);
      }
    },
    [accept, items, maxFiles, multiple, updateFiles]
  );

  // Input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = '';
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  // Remove preview item
  const removeMedia = (idToRemove: string) => {
    const itemToRemove = items.find((item) => item.id === idToRemove);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    const updated = items.filter((item) => item.id !== idToRemove);
    updateFiles(updated);
  };

  const isMaxReached = multiple && items.length >= maxFiles;

  return (
    <div className="w-full space-y-3">
      {/* ─── Hidden File Input ───────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ─── Drag & Dropzone Box ─────────────────────────── */}
      {!isMaxReached && (
        <motion.div
          whileHover={{ scale: 0.995 }}
          whileTap={{ scale: 0.985 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed
            p-5 sm:p-6 text-center backdrop-blur-xl transition-all duration-200 select-none
            ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 shadow-lg shadow-blue-500/10'
                : 'border-slate-300/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-500/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 shadow-2xs'
            }
          `}
        >
          {/* Subtle Ambient Background Highlight */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl dark:bg-blue-400/10" />

          <div className="relative flex flex-col items-center justify-center gap-2.5">
            <div
              className={`
              flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200
              ${
                isDragging
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
              }
            `}
            >
              {isDragging ? (
                <Sparkles className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {isDragging ? (
                  <span className="text-blue-600 dark:text-blue-400">Drop your files here</span>
                ) : (
                  <span>
                    Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
                  </span>
                )}
              </p>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {accept.includes('image') && accept.includes('video')
                  ? 'PNG, JPG, MP4 or WebM'
                  : accept}
                {multiple ? ` (Up to ${maxFiles} files)` : ''}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Media Previews Grid ─────────────────────────── */}
      {items.length > 0 && (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-950/80 shadow-xs backdrop-blur-md"
              >
                {/* Image or Video Preview */}
                {item.isVideo ? (
                  <div className="relative h-full w-full">
                    <video
                      src={item.previewUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md shadow-md">
                        <Film className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.previewUrl}
                    alt={`Upload preview ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* Subtle Gradient Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                {/* File Type Badge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md">
                  {item.isVideo ? (
                    <>
                      <Film className="h-3 w-3 text-blue-400" />
                      <span>VIDEO</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-3 w-3 text-emerald-400" />
                      <span>IMG</span>
                    </>
                  )}
                </div>

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(item.id);
                  }}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/20 transition-colors hover:bg-rose-600 hover:text-white"
                  aria-label="Remove media"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              </motion.div>
            ))}

            {/* Add More Tile inside grid if multiple & not maxed out */}
            {multiple && !isMaxReached && (
              <motion.button
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500/60 transition-all backdrop-blur-sm"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[11px] font-semibold">Add More</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MediaUploader;