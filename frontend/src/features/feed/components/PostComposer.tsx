import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Video, X, Hash, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFeedMutations } from '../hooks/useFeedMutations';

interface PostComposerProps {
  onPosted?: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onPosted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { createFeed, loading } = useFeedMutations();

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Max 50MB');
      return;
    }

    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
    setIsExpanded(true);
    e.target.value = '';
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setHashtagsInput('');
    removeMedia();
    setIsExpanded(false);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please write something');
      return;
    }

    try {
      const hashtags = hashtagsInput
        .split(/[,\s]+/)
        .map((h) => h.replace(/^#/, '').trim())
        .filter(Boolean);

      const feed = await createFeed({
        title: title.trim() || description.slice(0, 100),
        description: description.trim(),
        hashtags,
        media: mediaFile,
        is_public: true,
      });

      toast.success('Post created!');
      resetForm();
      onPosted?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-4">
      {/* Title (optional) */}
      {isExpanded && (
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 px-3 py-2 text-sm font-semibold bg-transparent border-b border-gray-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
        />
      )}

      {/* Description */}
      <textarea
        placeholder="What are you working on?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        rows={isExpanded ? 4 : 1}
        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all"
      />

      {/* Media Preview */}
      <AnimatePresence>
        {mediaPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 relative"
          >
            {mediaType === 'video' ? (
              <video
                src={mediaPreview}
                controls
                className="w-full max-h-80 rounded-lg object-cover"
              />
            ) : (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full max-h-80 rounded-lg object-cover"
              />
            )}
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hashtags input */}
      {isExpanded && (
        <div className="mt-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="hashtags (comma separated)"
            value={hashtagsInput}
            onChange={(e) => setHashtagsInput(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
          />
        </div>
      )}

      <hr className="border-gray-100 dark:border-slate-700 my-3" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition"
          >
            <ImagePlus className="w-4 h-4 text-blue-500" />
            Photo
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition"
          >
            <Video className="w-4 h-4 text-purple-500" />
            Video
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !description.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Post
            </>
          )}
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleMediaSelect(e, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleMediaSelect(e, 'video')}
      />
    </div>
  );
};

export default PostComposer;