import type { Post, Highlight } from '../features/posts/types/post.types';
import type { HomeData } from '../types/home';

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
    location: 'Austin, TX',
    createdAt: '2h',
    initialLikes: 124,
    initialComments: 18,
    isLiked: false,
    isAppreciated: false,
    isRequested: false,
  },
];

export const mockData: HomeData = {
  highlights: mockHighlights,
  posts: mockPosts,
  projects: [
    {
      id: 'project-1',
      title: 'Modern Kitchen Remodel',
      description: 'Full kitchen renovation completed with custom cabinetry and quartz countertops.',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80',
      completedAt: 'Yesterday',
      author: {
        name: 'Alex Rivera',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
      },
    },
  ],
  questions: [
    {
      id: 'q-1',
      question: 'What is the recommended conduit type for outdoor underground wiring?',
      author: 'David K.',
      answersCount: 14,
      timeAgo: '4h',
    },
  ],
  trendingTrades: [
    { id: 't-1', name: 'Electrical Panel Upgrades', growth: '+28%' },
    { id: 't-2', name: 'Custom Cabinetry', growth: '+19%' },
    { id: 't-3', name: 'HVAC Duct Cleaning', growth: '+15%' },
  ],
  professionals: [
    {
      id: 'pro-1',
      name: 'Marcus Vance',
      trade: 'HVAC Specialist',
      rating: 4.9,
      reviewsCount: 86,
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
    },
  ],
  activities: [
    {
      id: 'act-1',
      user: 'Elena Rostova',
      action: 'commented on Sarah Jenkins\' post',
      timeAgo: '15m ago',
    },
  ],
};