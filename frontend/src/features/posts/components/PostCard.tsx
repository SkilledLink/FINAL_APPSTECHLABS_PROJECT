import React, { useEffect, useRef, useState } from "react";
import type { Post } from "../types/post.types";
import PostActions from "./PostActions";
import ShareModal from "./ShareModal"; // Import

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onAppreciate: (id: string) => void;
  onRequestService: (id: string) => void;
  onVideoClick?: () => void;
}

const AutoPlayVideo: React.FC<{
  src: string;
  poster?: string;
  onClick: () => void;
}> = ({ src, poster, onClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              video.muted = true;
              video.play().catch(() => {});
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative w-full h-auto rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        muted
        playsInline
        className="w-full h-auto object-cover bg-black"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
        <div className="bg-black/60 rounded-full p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onAppreciate,
  onRequestService,
  onVideoClick,
}) => {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // Added state

  return (
    <>
      <div className="p-4 hover:bg-gray-50 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {post.author.name}
                </h3>
                {post.author.isVerified && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-gray-800"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {post.author.title}{" "}
                <span className="text-gray-400">• {post.createdAt}</span>
              </p>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-3">
          {post.title && (
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {post.title}
            </h2>
          )}
          <p className="text-gray-700 text-sm leading-relaxed">
            {post.content}
          </p>

          {post.location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              {post.location}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Media */}
        {post.imageUrl && (
          <div className="w-full mb-3">
            {post.mediaType === "video" ? (
              <AutoPlayVideo
                src={post.imageUrl}
                poster={post.thumbnailUrl}
                onClick={onVideoClick ?? (() => setIsMediaOpen(true))}
              />
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => setIsMediaOpen(true)}
              >
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <PostActions
          post={post}
          onLike={onLike}
          onAppreciate={onAppreciate}
          onRequestService={onRequestService}
          onShare={() => setIsShareModalOpen(true)} // Opens modal
        />
      </div>

      {/* Lightbox for Image/Video */}
      {isMediaOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <button
            onClick={() => setIsMediaOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          {post.mediaType === "video" ? (
            <video
              src={post.imageUrl}
              poster={post.thumbnailUrl}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          )}
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;
