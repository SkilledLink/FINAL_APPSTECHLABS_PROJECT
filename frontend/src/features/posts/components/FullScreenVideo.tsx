import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface FullScreenVideoProps {
  videoUrl: string;
  onClose: () => void;
}

const FullScreenVideo: React.FC<FullScreenVideoProps> = ({
  videoUrl,
  onClose,
}) => {
  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 sm:p-6 md:p-10 select-none overflow-hidden"
    >
      {/* Ambient background glow filter */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-blue-600/10 via-transparent to-transparent blur-3xl opacity-60" />

      {/* Glassmorphic Close Button & ESC pill */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5">
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 backdrop-blur-md shadow-xs">
          Press <kbd className="font-mono text-white">ESC</kbd>
        </span>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close modal"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 shadow-xl backdrop-blur-xl transition-colors hover:bg-white/20 hover:text-white hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          <X className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Video Frame */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex items-center justify-center w-full max-w-6xl max-h-[85vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl border border-white/10 bg-black/60 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-md"
      >
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-2xl sm:rounded-3xl"
        />
      </motion.div>
    </motion.div>
  );
};

export default FullScreenVideo;