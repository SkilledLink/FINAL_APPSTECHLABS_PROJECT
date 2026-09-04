import type { Post, Highlight } from "../features/posts/types/post.types";
import type { HomeData } from "../types/home";

export const mockHighlights: Highlight[] = [
  {
    id: "1",
    label: "Cabinetry",
    imageUrl: "https://via.placeholder.com/150/FF5733/FFFFFF?text=C",
  },
  {
    id: "2",
    label: "Pipe Fix",
    imageUrl: "https://via.placeholder.com/150/33FF57/FFFFFF?text=P",
  },
  {
    id: "3",
    label: "Painting",
    imageUrl: "https://via.placeholder.com/150/3357FF/FFFFFF?text=Pa",
  },
];

export const mockPosts: Post[] = [
  {
    id: "post-1",
    author: {
      id: "user-1",
      name: "Sarah Jenkins",
      title: "Master Electrician",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      isVerified: true,
    },
    title: "Residential Rewiring",
    content:
      "Just wrapped up a full residential panel upgrade. Clean lines, proper labeling, and ready for the next 30 years.",
    hashtags: ["#Electrician"],
    imageUrl:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80",
    location: "Austin, TX",
    createdAt: "2h",
    initialLikes: 124,
    initialComments: 18,
    isLiked: false,
    isAppreciated: false,
    isRequested: false,
  },
];

export const mockData = {
  highlights: [
    {
      id: 1,
      title: "Cabinetry",
      image: "https://via.placeholder.com/150/FF5733/FFFFFF?text=C",
    },
  ],
  projects: [],
  posts: mockPosts.map((post) => ({
    id: Number(post.id.replace(/\D/g, "") || 1),
    author: post.author.name,
    avatar: post.author.avatarUrl,
    createdAt: post.createdAt,
    image: post.imageUrl ?? "",
    video: null,
    description: post.content,
    hashtags: post.hashtags,
    likes: post.initialLikes,
    comments: post.initialComments,
    isLiked: !!post.isLiked,
  })),
  questions: [],
  professionals: [],
  activities: [],
  trendingTrades: [],
} as unknown as HomeData;
