// src/features/posts/components/PostCreationModal.tsx
import React, { useState, useRef, useEffect } from 'react';

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

const PostCreationModal: React.FC<PostCreationModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  initialMediaType
}) => {
  const [step, setStep] = useState<'details' | 'thumbnail'>('details');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(initialMediaType);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined);
  const [videoTime, setVideoTime] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMediaType(initialMediaType);
      setStep('details');
      setMediaUrl(undefined);
      setThumbnailUrl(undefined);
      setTitle('');
      setContent('');
      setHashtags('');
      setVideoTime(1);
    }
  }, [isOpen, initialMediaType]);

  if (!isOpen) return null;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
      setStep('details');
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image for the thumbnail.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailUrl(reader.result as string);
    reader.readAsDataURL(file);
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setThumbnailUrl(dataUrl);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
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
      .split(' ')
      .filter(tag => tag.trim())
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    onPublish({
      title: title.trim(),
      content,
      hashtags: parsedTags,
      mediaUrl,
      mediaType: mediaType || undefined,
      thumbnailUrl,
      location: "Austin, TX"
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {step === 'thumbnail' ? 'Select Video Thumbnail' : 'Create New Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 'details' && (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title (optional)"
                className="w-full bg-gray-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 mb-3"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a caption... (required)"
                rows={3}
                className="w-full bg-gray-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 mb-3 resize-none"
              />

              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="Add hashtags (e.g. #Electrician #Work)"
                className="w-full bg-gray-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 mb-4"
              />

              {/* Media Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {mediaUrl ? (
                  mediaType === 'video' ? (
                    <video src={mediaUrl} className="w-full max-h-40 rounded-lg mx-auto" />
                  ) : (
                    <img src={mediaUrl} alt="Preview" className="w-full max-h-40 rounded-lg mx-auto object-contain" />
                  )
                ) : (
                  <div className="text-gray-500 dark:text-slate-400">
                    <p className="mb-1">Click to upload {mediaType === 'video' ? 'video' : 'image'}</p>
                    <p className="text-xs">Files are processed locally</p>
                  </div>
                )}
              </div>

              {mediaType === 'video' && mediaUrl && (
                <button
                  onClick={() => setStep('thumbnail')}
                  className="w-full mt-3 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  {thumbnailUrl ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v12a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18V6a2.25 2.25 0 0 1 2.25-2.25Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 15 2.25-2.25 1.5 1.5 2.25-3 2.25 3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25h.008v.008H9V8.25Z" />
                      </svg>
                      Change Thumbnail
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75 7.5 10.5a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 19.5h16.5A1.5 1.5 0 0 0 21.75 18V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                      </svg>
                      Add Thumbnail
                    </>
                  )}
                </button>
              )}

              <input
                type="file"
                accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                ref={fileInputRef}
                onChange={handleMediaUpload}
                className="hidden"
              />
            </>
          )}

          {step === 'thumbnail' && (
            <div>
              <h3 className="text-gray-800 dark:text-slate-200 mb-4 text-center">
                Select a Frame for Thumbnail
              </h3>

              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-4 mb-4 bg-black">
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  crossOrigin="anonymous"
                  controls
                  className="w-full max-h-60 rounded-lg mx-auto object-contain"
                  onLoadedMetadata={handleVideoLoaded}
                  onTimeUpdate={(e) => setVideoTime(e.currentTarget.currentTime)}
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                  Scrub to pick frame:
                </label>
                <input
                  type="range"
                  min="0"
                  max={videoRef.current?.duration || 100}
                  step="0.1"
                  value={videoTime}
                  onChange={handleTimeChange}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleCaptureFrame}
                className="w-full py-3 bg-gray-800 dark:bg-slate-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-900 dark:hover:bg-slate-600 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h1.5l1.125-1.5h5.25l1.125 1.5h1.5A2.25 2.25 0 0 1 19.5 9.75v7.5a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25v-7.5A2.25 2.25 0 0 1 6.75 7.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 13.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
                Capture this Frame
              </button>

              {thumbnailUrl && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
                    Selected Thumbnail:
                  </p>
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="max-h-48 rounded-lg mx-auto object-contain border border-gray-200 dark:border-slate-700"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-between">
                <button
                  onClick={() => setStep('details')}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep('details')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700"
                >
                  {thumbnailUrl ? 'Save & Continue' : 'Skip & Continue'}
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={thumbFileInputRef}
                onChange={handleThumbnailFileUpload}
                className="hidden"
              />

              <div
                onClick={() => thumbFileInputRef.current?.click()}
                className="mt-3 border border-gray-300 dark:border-slate-600 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-center"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Or upload from file
                </p>
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>

        {step === 'details' && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              onClick={handlePublish}
              disabled={!content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Publish Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCreationModal;