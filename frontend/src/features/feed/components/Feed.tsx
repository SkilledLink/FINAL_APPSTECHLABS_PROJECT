import React, { useState } from 'react';
import PostComposer from '../../posts/components/PostComposer';
import PostCard from '../../posts/components/PostCard';
import PostCreationModal from '../../posts/components/PostCreationModal';
import Highlights from '../../home/components/Highlights';
import { mockHighlights, mockPosts } from '../../../data/mockData';
import type { Post } from '../../posts/types/post.types';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMediaType, setInitialMediaType] = useState<'image' | 'video' | null>(null);

  // Handle post from composer (text only) or modal (with media)
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
      location: data.location, // 👈 THIS IS CRITICAL
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

  // ... (Rest of handlers like Like, Appreciate, etc.)
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

  const handleVideoClick = () => {
    // Video playback is handled by PostCard.
  };

  const handleAddHighlight = () => {
    alert('Open Image Uploader Modal (Mock)');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Highlights highlights={mockHighlights} onAddHighlight={handleAddHighlight} />
      <PostComposer onPost={handlePost} onOpenModal={handleOpenModal} />
      
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLike={handleLike}
          onAppreciate={handleAppreciate}
          onRequestService={handleRequestService}
          onVideoClick={handleVideoClick}
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