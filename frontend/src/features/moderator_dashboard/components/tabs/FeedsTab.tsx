import React, { useMemo, useState } from 'react';
import { Flag, Trash2, CheckCircle, Heart, MessageCircle, Share2, Inbox, Search } from 'lucide-react';
import { useFeeds } from '../../hooks/useFeeds';
import type { AdminFeed, FeedStatus } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';

const Skeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 w-80 rounded bg-gray-200 animate-pulse" />
    </div>

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
      <div className="h-10 w-full max-w-sm rounded-xl bg-gray-200 animate-pulse" />
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>

    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-5 w-14 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                  <div className="mt-2 h-3 w-24 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="mt-4 flex gap-4">
                <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <div className="h-7 w-24 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-7 w-20 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-7 w-24 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
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

const feedStatusVariant = (s: FeedStatus): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (s === 'published') return 'success';
  if (s === 'flagged') return 'warning';
  if (s === 'removed') return 'danger';
  return 'neutral';
};

const FeedsTab: React.FC = () => {
  const { feeds, loading, error, updateStatus } = useFeeds();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | FeedStatus>('all');

  const filtered = useMemo(
    () =>
      feeds.filter(
        (f) =>
          (filter === 'all' || f.status === filter) &&
          f.content.toLowerCase().includes(query.toLowerCase()),
      ),
    [feeds, filter, query],
  );

  if (loading) return <Skeleton />;
  if (error) return <EmptyState title="Failed to load feeds" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Feeds</h2>
        <p className="text-gray-500 mt-1">Review and moderate content posted across the platform</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search content..." />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'published', 'flagged', 'removed', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="No feeds found" description="Try adjusting your filters." />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((feed: AdminFeed) => (
            <div key={feed.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <img src={feed.author.avatar} alt={feed.author.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{feed.author.name}</span>
                        <Chip variant={feed.author.role === 'professional' ? 'info' : 'neutral'}>
                          {feed.author.role}
                        </Chip>
                        <Chip variant="neutral">{feed.type}</Chip>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(feed.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Chip variant={feedStatusVariant(feed.status)}>{feed.status}</Chip>
                  </div>

                  <p className="text-sm text-gray-700 mt-3">{feed.content}</p>

                  {feed.images.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {feed.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-24 h-24 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Heart size={13} /> {feed.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {feed.comments}</span>
                    <span className="inline-flex items-center gap-1"><Share2 size={13} /> {feed.shares}</span>
                    {feed.reports > 0 && (
                      <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                        <Flag size={13} /> {feed.reports} reports
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    {feed.status !== 'published' && (
                      <button
                        onClick={() => updateStatus(feed.id, 'published')}
                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                    )}
                    {feed.status !== 'flagged' && feed.status !== 'removed' && (
                      <button
                        onClick={() => updateStatus(feed.id, 'flagged')}
                        className="px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Flag size={14} /> Flag
                      </button>
                    )}
                    {feed.status !== 'removed' && (
                      <button
                        onClick={() => updateStatus(feed.id, 'removed')}
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
    </div>
  );
};

export default FeedsTab;