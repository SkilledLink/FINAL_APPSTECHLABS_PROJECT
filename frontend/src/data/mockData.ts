// src/data/mockData.ts
import type { HomeData } from "../types/home";

export const mockData: HomeData = {
  highlights: [
    {
      id: 1,
      title: "Custom Decking - Complete Outdoor Living",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "Smart Home Setup - Full Automation",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "Bathroom Renovation - Luxury Spa",
      image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=600&q=80",
    },
  ],
  projects: [
    {
      id: 1,
      title: "Kitchen Remodel – Complete Overhaul",
      client: "Sarah M.",
      location: "Brooklyn, NY",
      trade: "Carpentry",
      beforeImage: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=800&q=80",
      afterImage: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=800&q=80",
      likes: 128,
      comments: 42,
    },
  ],
  posts: [
    {
      id: 1,
      author: "Mark S.",
      avatar: "https://i.pravatar.cc/150?img=12",
      createdAt: "2 min ago",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80",
      video: null,
      description: "Just completed this amazing kitchen renovation! The client wanted a modern farmhouse style and we delivered. Full custom cabinetry, quartz countertops, and smart appliances installed.",
      hashtags: ["#Renovation", "#Kitchen", "#Carpentry", "#ModernFarmhouse"],
      likes: 245,
      comments: 38,
      isLiked: false,
    },
  ],
  questions: [
    {
      id: 1,
      author: "David L.",
      avatar: "https://i.pravatar.cc/150?img=47",
      question: "What's the best wood for outdoor decking in humid climates? Looking for something durable and low maintenance.",
      categories: ["Materials", "Woodworking"],
      createdAt: "3 min ago",
      answers: 12,
    },
  ],
  professionals: [
    {
      id: 1,
      name: "Leo P.",
      profession: "Electrician",
      avatar: "https://i.pravatar.cc/150?img=11",
      isConnected: false,
    },
    {
      id: 2,
      name: "Mia T.",
      profession: "Landscaper",
      avatar: "https://i.pravatar.cc/150?img=32",
      isConnected: false,
    },
    {
      id: 3,
      name: "Chris R.",
      profession: "Plumber",
      avatar: "https://i.pravatar.cc/150?img=13",
      isConnected: false,
    },
  ],
  activities: [
    {
      id: 1,
      user: "Mark S.",
      avatar: "https://i.pravatar.cc/150?img=12",
      action: "commented on your project: 'Great work!'",
      time: "2 min ago",
    },
    {
      id: 2,
      user: "David L.",
      avatar: "https://i.pravatar.cc/150?img=47",
      action: "shared a project update",
      time: "2 min ago",
    },
    {
      id: 3,
      user: "Grace N.",
      avatar: "https://i.pravatar.cc/150?img=32",
      action: "created a new topic in Tools & Gear forum",
      time: "3 min ago",
    },
  ],
  trendingTrades: [
    { id: 1, name: "HVAC Services", icon: "❄️" },
    { id: 2, name: "Solar Installation", icon: "☀️" },
    { id: 3, name: "Welding & Fabrication", icon: "⚡" },
  ],
};


import type { Post, Highlight } from '../features/posts/types/post.types';

export const mockHighlights: Highlight[] = [
  { id: '1', label: 'Cabinetry', imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=C' },
  { id: '2', label: 'Pipe Fix', imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=P' },
  { id: '3', label: 'Painting', imageUrl: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=Pa' },
];

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    author: {
      id: 'user-1',
      name: 'Sarah Jenkins',
      title: 'Master Electrician',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      isVerified: true,
    },
    title: 'Residential Rewiring',
    content: 'Just wrapped up a full residential panel upgrade. Clean lines, proper labeling, and ready for the next 30 years.',
    hashtags: ['#Electrician'],
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80',
    createdAt: '2h',
    initialLikes: 124,
    initialComments: 18,
    isLiked: false,
    isAppreciated: false,
    isRequested: false,
  },
];
