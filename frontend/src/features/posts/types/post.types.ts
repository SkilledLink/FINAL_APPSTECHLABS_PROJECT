export interface PostAuthor {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface Post {
  id: string;
  author: PostAuthor;
  title: string;
  content: string;
  hashtags: string[];
  imageUrl?: string; // The image of the electrical panel
  createdAt: string; // "2h"
  initialLikes: number;
  initialComments: number;
  // UI State specific to the frontend
  isLiked?: boolean;
  isAppreciated?: boolean;
  isRequested?: boolean;
}

export interface Highlight {
  id: string;
  label: string;
  imageUrl: string;
}