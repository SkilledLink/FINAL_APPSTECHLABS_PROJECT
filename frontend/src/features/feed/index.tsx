import React, { useState } from 'react';
import PostComposer from './components/PostComposer';
import FeedHeader from './components/FeedHeader';
import PostCard from './components/PostCard';
import { samplePosts } from './data/posts';
import type { PostData } from './data/posts';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>(samplePosts);

  const handleAddPost = (newPost: Omit<PostData, 'id'>) => {
    const post: PostData = {
      ...newPost,
      id: Date.now().toString(),
    };
    setPosts([post, ...posts]);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen border-x border-gray-200">
      <FeedHeader />
      <PostComposer onAddPost={handleAddPost} />
      
      <div className="divide-y divide-gray-200">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;