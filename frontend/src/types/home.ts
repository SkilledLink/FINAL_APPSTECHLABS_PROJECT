// types/home.ts
export interface Highlight {
  id: number;
  title: string;
  image: string;
}

export interface Project {
  id: number;
  title: string;
  client: string;
  location: string;
  trade: string;
  beforeImage: string;
  afterImage: string;
  likes: number;
  comments: number;
}

export interface Post {
  id: number;
  author: string;
  avatar: string;
  createdAt: string;
  image: string;
  video: string | null;
  description: string;
  hashtags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface Question {
  id: number;
  author: string;
  avatar: string;
  question: string;
  categories: string[];
  createdAt: string;
  answers: number;
}

export interface Professional {
  id: number;
  name: string;
  profession: string;
  avatar: string;
  isConnected: boolean;
}

export interface Activity {
  id: number;
  user: string;
  avatar: string;
  action: string;
  time: string;
}

export interface TrendingTrade {
  id: number;
  name: string;
  icon: string;
}

export interface HomeData {
  highlights: Highlight[];
  projects: Project[];
  posts: Post[];
  questions: Question[];
  professionals: Professional[];
  activities: Activity[];
  trendingTrades: TrendingTrade[];
}