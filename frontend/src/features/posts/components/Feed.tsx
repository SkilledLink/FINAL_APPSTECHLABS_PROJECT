// src/features/posts/components/Feed.tsx
import React, { useState } from 'react';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import PostCreationModal from './PostCreationModal';
import { mockPosts } from '../../../data/mockData';
import type { Post } from '../types/post.types';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMediaType, setInitialMediaType] = useState<'image' | 'video' | null>(null);

  const handlePost = (data: {
    title: string;
    content: string;
    hashtags: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    thumbnailUrl?: string;
    location?: string;
  }) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        id: 'user-me',
        name: 'John Doe',
        title: 'Plumber',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
        isVerified: false,
      },
      title: data.title,
      content: data.content,
      hashtags: data.hashtags,
      location: data.location || 'Austin, TX',
      createdAt: 'Now',
      initialLikes: 0,
      initialComments: 0,
      isLiked: false,
      isAppreciated: false,
      isRequested: false,
      imageUrl: data.mediaUrl,
      mediaType: data.mediaType,
      thumbnailUrl: data.thumbnailUrl,
    };
    setPosts([newPost, ...posts]);
  };

  const handleOpenModal = (type: 'image' | 'video') => {
    setInitialMediaType(type);
    setIsModalOpen(true);
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, isLiked: !p.isLiked } : p));
  };

  const handleAppreciate = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, isAppreciated: !p.isAppreciated } : p));
  };

  const handleRequestService = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, isRequested: !p.isRequested } : p));
    alert('Service request sent (Mock)');
  };

  return (
    // ✅ Container: full width, no horizontal padding, only vertical spacing
    <div className="w-full space-y-4">
      <PostComposer onPost={handlePost} onOpenModal={handleOpenModal} />

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onAppreciate={handleAppreciate}
          onRequestService={handleRequestService}
        />
      ))}

      <PostCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPublish={handlePost}
        initialMediaType={initialMediaType}
      />
    </div>
  );
};

export default Feed;