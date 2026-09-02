export interface PostData {
  id: string;
  author: {
    name: string;
    role: string;
    time: string;
    avatar?: string;
  };
  title: string;
  content: string;
  hashtag: string;
  verified?: boolean;
  stats: {
    appreciates: number;
    dislikes: number;
  };
}

export const samplePosts: PostData[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Jenkins',
      role: 'Master Electrician',
      time: '2h',
    },
    title: 'Residential Rewiring',
    content: 'Just wrapped up a full residential panel upgrade. Clean lines, proper labeling, and ready for the next 30 years.',
    hashtag: '#Electrician',
    verified: true,
    stats: {
      appreciates: 124,
      dislikes: 18,
    }
  },
  {
    id: '2',
    author: {
      name: 'Mike Thompson',
      role: 'Plumbing Specialist',
      time: '4h',
    },
    title: 'Pipe Fix Complete',
    content: 'Finished a complex pipe repair in an old Victorian home. Replaced corroded copper pipes with modern PEX system. No more leaks!',
    hashtag: '#Plumbing',
    verified: true,
    stats: {
      appreciates: 89,
      dislikes: 3,
    }
  },
  {
    id: '3',
    author: {
      name: 'Emily Rodriguez',
      role: 'Interior Designer',
      time: '6h',
    },
    title: 'Modern Kitchen Cabinetry',
    content: 'Installed custom cabinetry with soft-close hinges and pull-out drawers. The walnut finish really brings warmth to this modern kitchen.',
    hashtag: '#Cabinetry',
    verified: false,
    stats: {
      appreciates: 156,
      dislikes: 7,
    }
  },
  {
    id: '4',
    author: {
      name: 'James Wilson',
      role: 'Painting Contractor',
      time: '8h',
    },
    title: 'Exterior Painting Project',
    content: 'Completed a full exterior painting job on a 3-story colonial. Used premium weather-resistant paint in a beautiful navy blue.',
    hashtag: '#Painting',
    verified: true,
    stats: {
      appreciates: 203,
      dislikes: 12,
    }
  },
  {
    id: '5',
    author: {
      name: 'Lisa Chen',
      role: 'General Contractor',
      time: '12h',
    },
    title: 'Full Home Renovation',
    content: 'Wrapping up a complete home renovation including electrical, plumbing, and structural changes. The transformation is incredible!',
    hashtag: '#Renovation',
    verified: true,
    stats: {
      appreciates: 312,
      dislikes: 25,
    }
  }
];