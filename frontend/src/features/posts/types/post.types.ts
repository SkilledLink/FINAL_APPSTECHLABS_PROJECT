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
  imageUrl?: string;
  createdAt: string;
  initialLikes: number;
  initialComments: number;
  isLiked?: boolean;
  isAppreciated?: boolean;
  isRequested?: boolean;
}

export interface Highlight {
  id: string;
  label: string;
  imageUrl: string;
}