import { ArrowLeft, MapPin, Briefcase, CheckCircle2, Star, Clock, Share2, Heart, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import type { Comment, Job } from '../types/job.types';
import { formatSalaryRange, timeAgo, formatDate } from '../utils/format';
import Avatar from '../components/Avatar';
import MatchScore from '../components/MatchScore';
import JobApplicationForm from '../components/JobApplicationForm';

interface JobDetailsPageProps {
  jobId: string;
  onBack: () => void;
}

export default function JobDetailsPage({ jobId, onBack }: JobDetailsPageProps) {
  const { getJobById, toggleLike, addComment, shareJob, loading } = useJobs();
  const job = getJobById(jobId);
  const [showApply, setShowApply] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareNotice, setShareNotice] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [jobId]);

  if (loading || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="skeleton h-8 w-32 rounded-lg mb-6" />
        <div className="card p-8 space-y-4">
          <div className="skeleton h-6 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-32 w-full rounded" />
          <div className="skeleton h-32 w-full rounded" />
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareNotice(true);
        setTimeout(() => setShareNotice(false), 2000);
      }
    } catch { /* cancelled */ }
    shareJob(job.id);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    const comment: Omit<Comment, 'id' | 'createdAt'> = {
      authorName: 'You',
      authorAvatar: '',
      text: commentText.trim(),
    };
    addComment(job.id, comment);
    setCommentText('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={onBack} className="btn-ghost mb-6 -ml-3">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      {/* TOP: Poster Profile & Review Box */}
      <section className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <Avatar name={job.poster.name} avatar={job.poster.avatar} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl font-bold text-ink-900">{job.poster.name}</h2>
              {job.poster.verified && (
                <span className="inline-flex items-center gap-1 badge bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-ink-500 mt-0.5">{job.poster.title} · {job.poster.company}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-ink-800">{job.poster.rating}</span>
                <span className="text-sm text-ink-400">({job.poster.reviewCount} reviews)</span>
              </div>
              <span className="text-ink-300">·</span>
              <span className="text-sm text-ink-400">Member since {job.poster.memberSince}</span>
            </div>
          </div>
        </div>

        {job.poster.reviews.length > 0 && (
          <div className="mt-5 pt-5 border-t border-ink-100">
            <h3 className="text-sm font-bold text-ink-800 mb-3">Recent Feedback</h3>
            <div className="space-y-3">
              {job.poster.reviews.map((review) => (
                <div key={review.id} className="flex gap-3">
                  <Avatar name={review.authorName} avatar={review.authorAvatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-800">{review.authorName}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-ink-400">{timeAgo(review.date)}</span>
                    </div>
                    <p className="text-sm text-ink-600 mt-0.5">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* MIDDLE: Job Description & Details */}
      <section className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold text-ink-900">{job.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-ink-500 flex-wrap">
              <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
              <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.jobType}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> Posted {timeAgo(job.postedAt)}</span>
            </div>
          </div>
          <MatchScore score={job.matchScore} />
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <span className={`badge ${job.status === 'active' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'bg-ink-100 text-ink-500 ring-1 ring-ink-200'}`}>
            {job.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />}
            {job.status === 'active' ? 'Active to Apply' : 'Closed'}
          </span>
          <span className="text-lg font-bold text-ink-900">
            {formatSalaryRange(job.salaryMin, job.salaryMax)}
            <span className="text-sm font-normal text-ink-400"> /month</span>
          </span>
        </div>

        <div className="mt-5">
          <h3 className="font-display font-bold text-ink-900 mb-2">Description</h3>
          <p className="text-sm text-ink-600 leading-relaxed">{job.description}</p>
        </div>

        <div className="mt-5">
          <h3 className="font-display font-bold text-ink-900 mb-2">Requirements</h3>
          <ul className="space-y-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <h3 className="font-display font-bold text-ink-900 mb-2">Responsibilities</h3>
          <ul className="space-y-2">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0 mt-1.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <h3 className="font-display font-bold text-ink-900 mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="badge bg-ink-100 text-ink-700">{skill}</span>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM: Apply Action Section */}
      <section className="card p-6 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-bold text-lg text-ink-900">Ready to apply?</h3>
            <p className="text-sm text-ink-500 mt-0.5">
              Send a direct message to {job.poster.name} about this position.
            </p>
          </div>
          <button
            onClick={() => setShowApply(true)}
            disabled={job.status !== 'active'}
            className="btn-primary text-base px-6 py-3"
          >
            Apply Now
          </button>
        </div>

        {/* Social actions */}
        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-ink-100">
          <button
            onClick={() => toggleLike(job.id)}
            className={`btn-ghost gap-1.5 ${job.likedByMe ? 'text-rose-500 hover:text-rose-600' : ''}`}
          >
            <Heart className={`w-4 h-4 ${job.likedByMe ? 'fill-rose-500' : ''}`} />
            <span className="text-sm">{job.likes}</span>
          </button>
          <button
            onClick={handleShare}
            className="btn-ghost gap-1.5 relative"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{job.shares}</span>
            {shareNotice && (
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-ink-900 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap animate-scale-in">
                Copied!
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Comments section */}
      <section className="card p-6">
        <h3 className="font-display font-bold text-lg text-ink-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-ink-400" />
          Comments ({job.comments.length})
        </h3>

        <div className="flex gap-2.5 mb-4">
          <Avatar name="You" size="sm" />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && commentText.trim()) handleSubmitComment(); }}
              placeholder="Write a comment..."
              className="input flex-1 py-2 text-sm"
            />
            <button onClick={handleSubmitComment} disabled={!commentText.trim()} className="btn-primary px-3 py-2 text-sm">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {job.comments.length > 0 ? (
          <div className="space-y-4">
            {job.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar name={c.authorName} avatar={c.authorAvatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800">{c.authorName}</span>
                    <span className="text-xs text-ink-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink-600 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400 text-center py-4">No comments yet.</p>
        )}
      </section>

      <JobApplicationForm job={job} open={showApply} onClose={() => setShowApply(false)} />
    </div>
  );
}
