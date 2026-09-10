import { Heart, MapPin, MessageCircle, Share2, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Job, Comment } from '../types/job.types';
import { useJobs } from '../hooks/useJobs';
import { formatSalaryRangeCompact, timeAgo } from '../utils/format';
import Avatar from './Avatar';
import MatchScore from './MatchScore';

interface JobCardProps {
  job: Job;
  onOpenDetails: (jobId: string) => void;
}

export default function JobCard({ job, onOpenDetails }: JobCardProps) {
  const { toggleLike, addComment, shareJob } = useJobs();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareNotice, setShareNotice] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 400);
    toggleLike(job.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: `Check out this job: ${job.title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareNotice(true);
        setTimeout(() => setShareNotice(false), 2000);
      }
    } catch {
      // user cancelled or clipboard not available
    }
    shareJob(job.id);
  };

  const handleSubmitComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!commentText.trim()) return;
    const comment: Omit<Comment, 'id' | 'createdAt'> = {
      authorName: 'You',
      authorAvatar: '',
      text: commentText.trim(),
    };
    addComment(job.id, comment);
    setCommentText('');
  };

  const handleCardClick = () => onOpenDetails(job.id);

  return (
    <div
      onClick={handleCardClick}
      className="card p-4 sm:p-5 hover:shadow-card-hover hover:border-ink-300/60 cursor-pointer group animate-fade-in relative"
    >
      {shareNotice && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg animate-scale-in">
          Link copied!
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Avatar name={job.poster.name} avatar={job.poster.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-ink-900 truncate">{job.poster.name}</span>
              {job.poster.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" data-verified />
              )}
              <span className="text-xs text-ink-400">· {timeAgo(job.postedAt)}</span>
            </div>
            <p className="text-xs text-ink-500 truncate">{job.poster.title} · {job.poster.company}</p>
          </div>
        </div>
        <span
          className={`badge self-start ${job.status === 'active'
              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
              : 'bg-ink-100 text-ink-500 ring-1 ring-ink-200'
            }`}
        >
          {job.status === 'active' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {job.status === 'active' ? 'Active' : 'Closed'}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
          {job.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-ink-500 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" /> {job.jobType}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {timeAgo(job.postedAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-semibold text-ink-900">
          {formatSalaryRangeCompact(job.salaryMin, job.salaryMax)}
          <span className="text-xs font-normal text-ink-400"> /mo</span>
        </span>
        <MatchScore score={job.matchScore} size="sm" />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="badge bg-ink-100 text-ink-600">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="badge bg-ink-100 text-ink-500">+{job.skills.length - 4}</span>
        )}
      </div>

      <div className="flex items-center gap-1 mt-4 pt-4 border-t border-ink-100">
        <button
          onClick={handleLike}
          className={`btn-ghost gap-1.5 ${job.likedByMe ? 'text-rose-500 hover:text-rose-600' : ''}`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${animateLike ? 'scale-125' : ''} ${job.likedByMe ? 'fill-rose-500' : ''}`}
          />
          <span className="text-sm">{job.likes}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowComments((v) => !v); }}
          className="btn-ghost gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{job.comments.length}</span>
        </button>

        <button onClick={handleShare} className="btn-ghost gap-1.5 ml-auto">
          <Share2 className="w-4 h-4" />
          <span className="text-sm">{job.shares}</span>
        </button>
      </div>

      {showComments && (
        <div
          className="mt-3 pt-3 border-t border-ink-100 space-y-3 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {job.comments.length > 0 ? (
            <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin">
              {job.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.authorName} avatar={c.authorAvatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-ink-800">{c.authorName}</span>
                      <span className="text-xs text-ink-400">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ink-600 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400 text-center py-2">No comments yet. Be the first!</p>
          )}

          <div className="flex gap-2">
            <Avatar name="You" size="sm" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); if (commentText.trim()) { handleSubmitComment(e as unknown as React.MouseEvent); } } }}
              placeholder="Write a comment..."
              className="input flex-1 py-2 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className="btn-primary px-3 py-2 text-sm"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
