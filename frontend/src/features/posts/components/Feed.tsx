import React, { useState } from 'react';
import PostComposer from '../../posts/components/PostComposer';
import PostCard from '../../posts/components/PostCard';
import Highlights from '../../home/components/Highlights';
import { mockHighlights, mockPosts } from '../../../data/mockData';
import type { Post } from '../../posts/types/post.types';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handlePost = (content: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        id: 'user-me',
        name: 'John Doe',
        title: 'Plumber',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
        isVerified: false,
      },
      title: 'New Post',
      content: content,
      hashtags: [],
      createdAt: 'Now',
      initialLikes: 0,
      initialComments: 0,
      isLiked: false,
      isAppreciated: false,
      isRequested: false,
    };
    setPosts([newPost, ...posts]);
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

  const handleAddHighlight = () => {
    alert('Open Image Uploader Modal (Mock)');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Highlights highlights={mockHighlights} onAddHighlight={handleAddHighlight} />
      <PostComposer onPost={handlePost} />
      
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLike={handleLike}
          onAppreciate={handleAppreciate}
          onRequestService={handleRequestService}
        />
      ))}
    </div>
  );
};

export default Feed;