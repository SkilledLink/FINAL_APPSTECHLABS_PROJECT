import React, { useEffect, useMemo, useState } from 'react';
import {
  Trash2, Heart, MessageCircle, Inbox, Search, Eye, X, ExternalLink,
  Ban, Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useFeeds } from '../../hooks/useFeeds';
import type { AdminFeed, AdminFeedDetail, FeedComment } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';
import Avatar from '../Avatar';
import { SkeletonBlock } from '../Skeleton';

// ---------- Helpers ----------
const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  if (s === 'published') return 'success';
  if (s === 'pending_moderation' || s === 'pending_review') return 'warning';
  if (s === 'rejected' || s === 'archived' || s === 'removed') return 'danger';
  if (s === 'draft') return 'info';
  return 'neutral';
};

const severityVariant = (severity: number): 'danger' | 'warning' | 'neutral' => {
  if (severity >= 7) return 'danger';
  if (severity >= 4) return 'warning';
  return 'neutral';
};

type FeedState = 'deleted' | 'pending' | 'default';

const getFeedState = (feed: { status: string; isDeleted: boolean }): FeedState => {
  if (feed.isDeleted || feed.status === 'removed' || feed.status === 'rejected') return 'deleted';
  if (feed.status === 'pending_moderation' || feed.status === 'pending_review') return 'pending';
  return 'default';
};

const feedCardClass = (state: FeedState): string => {
  const base = 'bg-white rounded-xl border p-5 cursor-pointer transition-all';
  if (state === 'deleted') return `${base} border-red-200 bg-red-50/40 border-l-4 border-l-red-500 hover:border-red-300 hover:shadow-sm`;
  if (state === 'pending') return `${base} border-amber-200 bg-amber-50/40 border-l-4 border-l-amber-500 hover:border-amber-300 hover:shadow-sm`;
  return `${base} border-gray-200 hover:border-emerald-200 hover:shadow-sm`;
};

const buildFallbackDetail = (feed: AdminFeed): AdminFeedDetail => ({
  ...feed,
  commentsList: [],
  isLiked: false,
  moderation: null,
});

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
    success: 'bg-green-500', warning: 'bg-yellow-500', danger: 'bg-red-500', info: 'bg-blue-500', neutral: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} />
      {children}
    </span>
  );
};

const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4"><Inbox size={28} /></div>
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

const SkeletonFeedCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start gap-4">
      <SkeletonBlock className="rounded-full" style={{ width: 40, height: 40 }} />
      <div className="flex-1 min-w-0 space-y-2">
        <SkeletonBlock className="h-3.5 w-32" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
      </div>
    </div>
  </div>
);

const SkeletonList: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => <SkeletonFeedCard key={i} />)}
  </div>
);

const SkeletonDrawer: React.FC = () => (
  <div className="space-y-5">
    <SkeletonBlock className="h-4 w-2/3" />
    <SkeletonBlock className="h-3 w-full" />
    <SkeletonBlock className="h-3 w-5/6" />
  </div>
);

// ---------- Drawer ----------
interface DrawerProps {
  feed: AdminFeed | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AdminFeedDetail>;
  onDeleteComment: (feedId: string, comment: FeedComment) => void;
  onDeleteFeed: (feed: AdminFeed) => void;
}

const FeedDrawer: React.FC<DrawerProps> = ({ feed, onClose, fetchOne, onDeleteComment, onDeleteFeed }) => {
  const [detail, setDetail] = useState<AdminFeedDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!feed) { setDetail(null); setIsFallback(false); return; }
    let cancelled = false;
    setLoading(true);
    setIsFallback(false);
    setDetail(null);
    fetchOne(feed.id)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch(() => { if (!cancelled) { setDetail(buildFallbackDetail(feed)); setIsFallback(true); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [feed, fetchOne]);

  if (!feed) return null;

  const view = detail ?? buildFallbackDetail(feed);
  const state = getFeedState(view);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          state === 'deleted' ? 'border-red-100 bg-red-50/60'
            : state === 'pending' ? 'border-amber-100 bg-amber-50/60'
            : 'border-gray-100'
        }`}>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Feed details</h3>
            <p className="text-xs text-gray-500 truncate">
              {view.title || view.description.slice(0, 60)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/70 text-gray-500" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && <SkeletonDrawer />}

          {!loading && (
            <div className="space-y-5">
              {state === 'deleted' && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="p-1.5 rounded-lg bg-red-100 text-red-600 shrink-0"><Ban size={16} /></div>
                  <div>
                    <p className="text-sm font-semibold text-red-800">This feed has been deleted</p>
                    <p className="text-xs text-red-700 mt-0.5">Remains visible for audit purposes.</p>
                  </div>
                </div>
              )}
              {state === 'pending' && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0"><Clock size={16} /></div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Awaiting moderation review</p>
                    <p className="text-xs text-amber-700 mt-0.5">Not publicly visible yet.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Avatar name={view.author.name} src={view.author.avatar} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{view.author.name}</p>
                    <Chip variant="neutral">{view.author.role}</Chip>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(view.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Chip variant={statusVariant(view.status)}>{view.status.replace(/_/g, ' ')}</Chip>
              </div>

              {view.title && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</p>
                  <p className="text-base font-medium text-gray-900">{view.title}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{view.description}</p>
              </div>

              {view.images.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Media ({view.images.length})</p>
                  <div className="flex gap-2 flex-wrap">
                    {view.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer"
                        className="group relative w-32 h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ExternalLink size={16} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><Heart size={13} /> {view.likes}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {view.comments}</span>
              </div>

              {view.moderation && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Moderation</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Chip variant={severityVariant(view.moderation.severity)}>severity {view.moderation.severity}</Chip>
                      <Chip variant="neutral">{view.moderation.decision}</Chip>
                      <Chip variant="info">confidence {view.moderation.confidence}%</Chip>
                      {view.moderation.categories.map((c) => <Chip key={c} variant="warning">{c}</Chip>)}
                    </div>
                  </div>
                </div>
              )}

              {!isFallback && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Comments ({view.commentsList.length})
                  </p>
                  {view.commentsList.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No comments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {view.commentsList.map((c) => (
                        <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                          <Avatar name={c.author.name} src={c.author.avatar} size={32} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">{c.author.name}</p>
                            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap break-words">{c.content}</p>
                          </div>
                          <button
                            onClick={() => onDeleteComment(view.id, c)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && !view.isDeleted && (
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-end">
            <button
              onClick={() => onDeleteFeed(view)}
              className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Remove feed
            </button>
          </div>
        )}
      </div>
    </>
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
  const { feeds, loading, error, fetchOne, remove, removeComment } = useFeeds();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [selected, setSelected] = useState<AdminFeed | null>(null);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    feeds.forEach((f) => s.add(f.status));
    return ['all', ...Array.from(s)];
  }, [feeds]);

  const filtered = useMemo(
    () => feeds.filter((f) =>
      (filter === 'all' || f.status === filter) &&
      f.content.toLowerCase().includes(query.toLowerCase())),
    [feeds, filter, query],
  );

  const openRemoveFeed = (feed: AdminFeed) => {
    setPrompt({
      title: 'Remove feed',
      description: feed.title || feed.description.slice(0, 80),
      submitLabel: 'Remove',
      onConfirm: async (reason) => {
        await remove(feed.id, reason);
        toast.success('Feed removed');
        if (selected?.id === feed.id) setSelected(null);
      },
    });
  };

  const openRemoveComment = (feedId: string, comment: FeedComment) => {
    setPrompt({
      title: 'Delete comment',
      description: comment.content.slice(0, 80),
      submitLabel: 'Delete',
      onConfirm: async (reason) => {
        await removeComment(feedId, comment.id, reason);
        toast.success('Comment deleted');
      },
    });
  };

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
          {(loading ? ['all'] : statuses).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors disabled:opacity-60 ${
                filter === f ? 'bg-emerald-50 text-emerald-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="No feeds found" description="Try adjusting your filters." />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((feed) => {
            const state = getFeedState(feed);
            return (
              <div
                key={feed.id}
                onClick={() => setSelected(feed)}
                className={feedCardClass(state)}
              >
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

                    {state === 'deleted' && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
                        <Ban size={12} /> This feed has been removed
                      </div>
                    )}
                    {state === 'pending' && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                        <Clock size={12} /> Awaiting moderation review
                      </div>
                    )}

                    {feed.title && <p className="font-medium text-gray-900 mt-3">{feed.title}</p>}
                    <p className="text-sm text-gray-700 mt-1">{feed.description}</p>

                    {feed.images.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {feed.images.map((img, i) => (
                          <img key={i} src={img} alt=""
                            className={`w-24 h-24 rounded-lg object-cover ${state === 'deleted' ? 'opacity-60 grayscale' : ''}`} />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1"><Heart size={13} /> {feed.likes}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {feed.comments}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(feed)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} /> Details
                      </button>
                      {!feed.isDeleted && (
                        <button
                          onClick={() => openRemoveFeed(feed)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {prompt && (
        <ReasonPrompt
          title={prompt.title}
          description={prompt.description}
          submitLabel={prompt.submitLabel}
          onSubmit={async (reason) => { await prompt.onConfirm(reason); setPrompt(null); }}
          onCancel={() => setPrompt(null)}
        />
      )}

      <FeedDrawer
        feed={selected}
        onClose={() => setSelected(null)}
        fetchOne={fetchOne}
        onDeleteComment={openRemoveComment}
        onDeleteFeed={openRemoveFeed}
      />
    </div>
  );
};

export default FeedsTab;