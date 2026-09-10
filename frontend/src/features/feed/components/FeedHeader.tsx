import React from 'react';
import { Flame, Hash } from 'lucide-react';

interface FeedHeaderProps {
  onSelectHashtag?: (hashtag: string) => void;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ onSelectHashtag }) => {
  const [trending, setTrending] = React.useState<
    { id: string; name: string; usage_count: number }[]
  >([]);

  React.useEffect(() => {
    // Lazy-load trending hashtags
    import('../api/feedApi').then(({ feedApi }) => {
      feedApi
        .getTrendingHashtags(10)
        .then(data => setTrending(data))
        .catch(() => setTrending([]));
    });
  }, []);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-full shrink-0">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Trending</span>
      </div>

      {trending.map(tag => (
        <button
          key={tag.id}
          onClick={() => onSelectHashtag?.(tag.name)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-full text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 whitespace-nowrap transition"
        >
          <Hash className="w-3 h-3" />
          {tag.name}
        </button>
      ))}

      {trending.length === 0 && (
        <span className="text-xs text-gray-400 dark:text-slate-500">No trending hashtags yet</span>
      )}
    </div>
  );
};

export default FeedHeader;
