import React, { useMemo, useState } from 'react';
import { Trash2, Heart, MessageCircle, Inbox, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFeeds } from '../../hooks/useFeeds';
import type { AdminFeed } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />
);

const SkeletonFeedCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start gap-4">
      <SkeletonBlock className="rounded-full" style={{ width: 40, height: 40 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-3.5 w-32" />
              <SkeletonBlock className="h-4 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="h-2.5 w-24" />
          </div>
          <SkeletonBlock className="h-5 w-20 rounded-full" />
        </div>

        <div className="mt-3 space-y-2">
          <SkeletonBlock className="h-3.5 w-2/3" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-5/6" />
        </div>

        <div className="mt-3 flex gap-2">
          <SkeletonBlock className="rounded-lg" style={{ width: 96, height: 96 }} />
          <SkeletonBlock className="rounded-lg" style={{ width: 96, height: 96 }} />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <SkeletonBlock className="h-3 w-10" />
          <SkeletonBlock className="h-3 w-10" />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <SkeletonBlock className="h-7 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonFeedList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonFeedCard key={i} />
    ))}
  </div>
);

// ---------- Local UI helpers ----------
const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900">{title}</p>
    {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
  </div>
);

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...',
}) => (
  <div className="relative w-full max-w-sm">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = ({
  children, variant = 'neutral',
}) => {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const dots = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} />
      {children}
    </span>
  );
};

const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  if (s === 'published') return 'success';
  if (s === 'pending_moderation' || s === 'pending_review') return 'warning';
  if (s === 'rejected' || s === 'archived') return 'danger';
  if (s === 'draft') return 'info';
  return 'neutral';
};

// ---------- Avatar with colored initials fallback ----------
const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
  '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#a855f7', '#84cc16',
];

const hashString = (s: string): number => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const Avatar: React.FC<{ name: string; src?: string; size?: number; className?: string }> = ({
  name, src, size = 40, className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const backgroundColor = AVATAR_COLORS[hashString(name || '?') % AVATAR_COLORS.length];

  if (!src || imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${className}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.4), backgroundColor }}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// ---------- Tab ----------
type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const FeedsTab: React.FC = () => {
  const { feeds, loading, error, remove } = useFeeds();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    feeds.forEach((f) => s.add(f.status));
    return ['all', ...Array.from(s)];
  }, [feeds]);

  const filtered = useMemo(
    () =>
      feeds.filter(
        (f) =>
          (filter === 'all' || f.status === filter) &&
          f.content.toLowerCase().includes(query.toLowerCase()),
      ),
    [feeds, filter, query],
  );

  if (error) return <EmptyState title="Failed to load feeds" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Feeds</h2>
        <p className="text-gray-500 mt-1">Moderate content posted across the platform</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search content..." />
        <div className="flex gap-2 flex-wrap">
          {(loading ? ['all'] : statuses).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors disabled:opacity-60 ${
                filter === f
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonFeedList count={3} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="No feeds found" description="Try adjusting your filters." />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((feed: AdminFeed) => (
            <div key={feed.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <Avatar name={feed.author.name} src={feed.author.avatar} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{feed.author.name}</span>
                        <Chip variant="neutral">{feed.author.role}</Chip>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(feed.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Chip variant={statusVariant(feed.status)}>{feed.status.replace(/_/g, ' ')}</Chip>
                  </div>

                  {feed.title && (
                    <p className="font-medium text-gray-900 mt-3">{feed.title}</p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">{feed.description}</p>

                  {feed.images.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {feed.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-24 h-24 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Heart size={13} /> {feed.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {feed.comments}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    {!feed.isDeleted && (
                      <button
                        onClick={() =>
                          setPrompt({
                            title: 'Remove feed',
                            description: feed.title || feed.description.slice(0, 80),
                            submitLabel: 'Remove',
                            onConfirm: async (reason) => {
                              await remove(feed.id, reason);
                              toast.success('Feed removed');
                            },
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {prompt && (
        <ReasonPrompt
          title={prompt.title}
          description={prompt.description}
          submitLabel={prompt.submitLabel}
          onSubmit={async (reason) => {
            await prompt.onConfirm(reason);
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />
      )}
    </div>
  );
};

export default FeedsTab;