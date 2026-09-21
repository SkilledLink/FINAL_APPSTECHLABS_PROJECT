import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus,
  Video,
  X,
  Hash,
  Sparkles,
  Upload,
  Globe,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useFeedMutations } from '../hooks/useFeedMutations';
import { useAuth } from '../../auth/hooks/useAuth';
import type {
  Post,
  PostCreatePayload,
  PostMedia,
  Hashtag,
} from '../types/post.types';

interface PostComposerProps {
  onOptimisticCreate?: (post: Post, retry: () => void) => void;
  onCreateSuccess?: (tempId: string, realPost: Post) => void;
  onCreateError?: (tempId: string, error: Error) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  onOptimisticCreate,
  onCreateSuccess,
  onCreateError,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { createPost, loading } = useFeedMutations();
  const { user } = useAuth();

  const payloadMapRef = useRef<Map<string, PostCreatePayload>>(new Map());
  const tempIdCounterRef = useRef(0);

  // ─── Media helpers ──────────────────────────────────────
  const validateAndSetFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      toast.error('Unsupported file format. Please select an image or video.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setIsExpanded(true);
  };

  const handleMediaSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    validateAndSetFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  /**
   * Clears the form. NOTE: intentionally does NOT revoke `mediaPreview` —
   * the optimistic card in the list still references that blob URL until
   * the real post replaces it.
   */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setHashtagsInput('');
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setIsExpanded(false);
  };

  const parsedHashtags = hashtagsInput
    .split(/[,\s]+/)
    .map((h) => h.replace(/^#/, '').trim())
    .filter(Boolean);

  // ─── Build optimistic Post ──────────────────────────────
  const buildTempPost = useCallback(
    (tempId: string, payload: PostCreatePayload): Post => {
      const now = new Date().toISOString();

      const tempMedia: PostMedia[] = mediaPreview
        ? [
            {
              id: `${tempId}-media`,
              media_url: mediaPreview,
              media_type: mediaType === 'video' ? 'video' : 'image',
              thumbnail_url: null,
              width: null,
              height: null,
              duration_seconds: null,
              file_size: mediaFile?.size ?? null,
            },
          ]
        : [];

      const tempHashtags: Hashtag[] =
        payload.hashtags?.map((name, i) => ({
          id: `${tempId}-tag-${i}`,
          name,
          usage_count: 0,
        })) ?? [];

      return {
        id: tempId,
        title: payload.title,
        description: payload.description,
        status: 'pending_moderation',
        is_public: true,
        user_id: user?.id ?? 'me',
        is_deleted: false,
        created_at: now,
        updated_at: now,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        user: user
          ? {
              id: user.id,
              first_name: user.first_name ?? '',
              last_name: user.last_name ?? '',
              profile_image_url: user.profile_image_url ?? null,
              account_type: user.account_type,
            }
          : null,
        media: tempMedia,
        hashtags: tempHashtags,
        comments: [],
        moderation: null,
        _clientStatus: 'uploading',
        _tempId: tempId,
      };
    },
    [mediaPreview, mediaType, mediaFile, user],
  );

  // ─── Fire the request (used for initial submit + retry) ─
  const submitPayload = useCallback(
    async (tempId: string, payload: PostCreatePayload) => {
      try {
        const realPost = await createPost(payload);
        payloadMapRef.current.delete(tempId);
        onCreateSuccess?.(tempId, realPost);
      } catch (err) {
        const e =
          err instanceof Error ? err : new Error('Failed to create post');
        onCreateError?.(tempId, e);
      }
    },
    [createPost, onCreateSuccess, onCreateError],
  );

  // ─── Post click ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please write something');
      return;
    }

    const payload: PostCreatePayload = {
      title: title.trim() || description.trim().slice(0, 80),
      description: description.trim(),
      hashtags: parsedHashtags,
      media: mediaFile,
      is_public: true,
    };

    const tempId = `temp-${++tempIdCounterRef.current}`;

    const tempPost = buildTempPost(tempId, payload);
    payloadMapRef.current.set(tempId, payload);

    // 1) Show the optimistic card instantly.
    onOptimisticCreate?.(tempPost, () => {
      submitPayload(tempId, payload);
    });

    // 2) Clear the form.
    resetForm();

    // 3) Yield one tick so React paints the optimistic card before we
    //    hit the network. This is the line that guarantees the
    //    placeholder is visible immediately.
    await new Promise((r) => setTimeout(r, 0));

    // 4) Fire the request.
    await submitPayload(tempId, payload);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border transition-all duration-300 backdrop-blur-2xl p-4 sm:p-5 ${
        isDragging
          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-4 ring-blue-500/10'
          : 'border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80'
      }`}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 backdrop-blur-md border-2 border-dashed border-blue-500 pointer-events-none"
          >
            <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce mb-2" />
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Drop media file to attach
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/60"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Public Post</span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-bold bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <textarea
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          rows={isExpanded ? 4 : 2}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800/80 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500/80 dark:focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
        />
      </div>

      <AnimatePresence>
        {mediaPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.96, height: 0 }}
            className="mt-3 relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-black/90 shadow-sm"
          >
            {mediaType === 'video' ? (
              <video
                src={mediaPreview}
                controls
                className="w-full max-h-80 object-cover"
              />
            ) : (
              <img
                src={mediaPreview}
                alt="Upload preview"
                className="w-full max-h-80 object-cover"
              />
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={removeMedia}
              type="button"
              className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center bg-black/70 hover:bg-black text-white rounded-full backdrop-blur-md border border-white/20 transition-all shadow-lg"
              aria-label="Remove media"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 border border-slate-200/50 dark:border-slate-700/50">
              <Hash className="w-4 h-4 text-blue-500 shrink-0" />
              <input
                type="text"
                placeholder="Add hashtags (comma separated)..."
                value={hashtagsInput}
                onChange={(e) => setHashtagsInput(e.target.value)}
                className="w-full bg-transparent text-xs outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {parsedHashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-1">
                {parsedHashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <hr className="border-slate-100 dark:border-slate-800 my-3.5" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 disabled:opacity-50"
          >
            <ImagePlus className="w-4 h-4 text-blue-500" />
            <span>Photo</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50 disabled:opacity-50"
          >
            <Video className="w-4 h-4 text-purple-500" />
            <span>Video</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleSubmit}
          disabled={!description.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-full shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Post</span>
        </motion.button>
      </div>

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