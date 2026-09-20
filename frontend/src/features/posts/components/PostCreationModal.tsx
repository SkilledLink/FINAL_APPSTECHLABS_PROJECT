import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Camera,
  MapPin,
  Hash,
  ArrowLeft,
  Check,
  Film,
} from 'lucide-react';

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (data: {
    title: string;
    content: string;
    hashtags: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    thumbnailUrl?: string;
    location?: string;
  }) => void;
  initialMediaType: 'image' | 'video' | null;
}

export const PostCreationModal: React.FC<PostCreationModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  initialMediaType,
}) => {
  const [step, setStep] = useState<'details' | 'thumbnail'>('details');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(initialMediaType);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined);
  const [videoTime, setVideoTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Defer the reset until after the effect completes to avoid a synchronous
    // cascading render when the modal opens.
    const resetId = window.setTimeout(() => {
      setMediaType(initialMediaType);
      setStep('details');
      setMediaUrl(undefined);
      setThumbnailUrl(undefined);
      setTitle('');
      setContent('');
      setHashtags('');
      setLocation('');
      setVideoTime(0);
      setVideoDuration(0);
      setErrorMessage(null);
    }, 0);

    return () => window.clearTimeout(resetId);
  }, [isOpen, initialMediaType]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const processFile = useCallback(
    (file: File) => {
      setErrorMessage(null);

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) {
        setErrorMessage('Unsupported file type. Please upload an image or video.');
        return;
      }

      if (mediaType === 'video' && !isVideo) {
        setErrorMessage('Please select a valid video file.');
        return;
      }

      if (mediaType === 'image' && !isImage) {
        setErrorMessage('Please select a valid image file.');
        return;
      }

      const activeMediaType = isVideo ? 'video' : 'image';
      setMediaType(activeMediaType);

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
        setStep('details');
      };
      reader.readAsDataURL(file);
    },
    [mediaType]
  );

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleThumbnailFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image for the thumbnail.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setThumbnailUrl(reader.result as string);
    reader.readAsDataURL(file);
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
    if (file) processFile(file);
  };

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setThumbnailUrl(dataUrl);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 0);
      videoRef.current.currentTime = videoTime;
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setVideoTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handlePublish = () => {
    if (!content.trim()) return;

    const parsedTags = hashtags
      .split(/[\s,]+/)
      .filter((tag) => tag.trim())
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

    onPublish({
      title: title.trim(),
      content: content.trim(),
      hashtags: parsedTags,
      mediaUrl,
      mediaType: mediaType || undefined,
      thumbnailUrl,
      location: location.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative flex flex-col w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {step === 'thumbnail' && (
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {step === 'thumbnail' ? 'Select Video Thumbnail' : 'Create New Post'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Inline Error Notice */}
          {errorMessage && (
            <div className="px-5 py-2.5 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/50 text-xs font-medium text-red-600 dark:text-red-400 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {step === 'details' && (
              <>
                {/* Title Input */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a title (optional)"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Caption / Content Textarea */}
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a caption... (required)"
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-all"
                  />
                </div>

                {/* Hashtags Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="Add hashtags (e.g. Electrician, Work)"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Optional Location Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (optional)"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Drag and Drop Media Upload Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  {mediaUrl ? (
                    <div className="relative rounded-lg overflow-hidden bg-black/90">
                      {mediaType === 'video' ? (
                        <video src={mediaUrl} className="w-full max-h-48 object-contain mx-auto" />
                      ) : (
                        <img src={mediaUrl} alt="Preview" className="w-full max-h-48 object-contain mx-auto" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMediaUrl(undefined);
                          setThumbnailUrl(undefined);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-slate-500 dark:text-slate-400">
                      <Upload className="w-8 h-8 mb-2 text-slate-400 animate-pulse" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Click or drag to upload {mediaType === 'video' ? 'video' : mediaType === 'image' ? 'image' : 'file'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, MP4, MOV</p>
                    </div>
                  )}
                </div>

                {/* Video Thumbnail Action Button */}
                {mediaType === 'video' && mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setStep('thumbnail')}
                    className="w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Film className="w-4 h-4 text-purple-500" />
                    <span>{thumbnailUrl ? 'Change Selected Thumbnail' : 'Set Custom Thumbnail'}</span>
                    {thumbnailUrl && <Check className="w-3.5 h-3.5 text-green-500 ml-auto" />}
                  </button>
                )}

                <input
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : mediaType === 'image' ? 'image/*' : 'image/*,video/*'}
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </>
            )}

            {step === 'thumbnail' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Scrub through the video to pick a video frame or upload a custom image.
                </p>

                {/* Video Frame Extractor Stage */}
                <div className="rounded-xl overflow-hidden bg-black p-2 border border-slate-800">
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    crossOrigin="anonymous"
                    controls
                    className="w-full max-h-56 object-contain mx-auto rounded"
                    onLoadedMetadata={handleVideoLoaded}
                    onTimeUpdate={(e) => setVideoTime(e.currentTarget.currentTime)}
                  />
                </div>

                {/* Video Scrubber Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{videoTime.toFixed(1)}s</span>
                    <span>{videoDuration.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={videoDuration || 100}
                    step="0.1"
                    value={videoTime}
                    onChange={handleTimeChange}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Capture Frame Button */}
                <button
                  type="button"
                  onClick={handleCaptureFrame}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Current Frame</span>
                </button>

                {/* Thumbnail Display Preview */}
                {thumbnailUrl && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Active Thumbnail:
                    </p>
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail Preview"
                      className="max-h-36 rounded-lg mx-auto object-contain border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}

                {/* Custom File Upload Option */}
                <button
                  type="button"
                  onClick={() => thumbFileInputRef.current?.click()}
                  className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Upload Custom Image File</span>
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={thumbFileInputRef}
                  onChange={handleThumbnailFileUpload}
                  className="hidden"
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Step Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    {thumbnailUrl ? 'Confirm Thumbnail' : 'Done'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer (Details Step) */}
          {step === 'details' && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!content.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
              >
                Publish Post
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PostCreationModal;