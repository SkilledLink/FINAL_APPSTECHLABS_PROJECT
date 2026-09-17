// src/features/profile/components/MediaLightbox.tsx

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Layers } from 'lucide-react';
import type { FeedThumbnail } from '../types/profile.types';

interface MediaLightboxProps {
  item: FeedThumbnail | null;
  onClose: () => void;
  onViewPost?: (feedId: string) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  item,
  onClose,
  onViewPost,
}) => {
  // Lock body scroll while open
  useEffect(() => {
    if (!item) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [item]);

  // ESC to close
  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={item.feedId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 sm:p-6 md:p-10 select-none"
        >
          {/* Top bar */}
          <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-md min-w-0">
              <span className="text-xs font-medium text-white/90 truncate max-w-[50vw]">
                {item.title}
              </span>
              {item.mediaCount > 1 && (
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90 shrink-0">
                  <Layers className="h-3 w-3" />
                  {item.mediaCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onViewPost && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPost(item.feedId);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View post
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Media */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center justify-center w-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden"
          >
            {item.mediaType === 'video' ? (
              <video
                src={item.mediaUrl}
                poster={item.thumbnailUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[85vh] object-contain rounded-2xl bg-black"
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full max-h-[85vh] object-contain rounded-2xl"
              />
            )}
          </motion.div>

          {/* Mobile "View post" */}
          {onViewPost && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center sm:hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewPost(item.feedId);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View full post
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaLightbox;