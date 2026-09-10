import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Check,
  DollarSign,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';

import { getAllJobs } from '../../../../src/services/jobServices';
import type { Job } from '../../../../src/services/jobServices';

const BLUE = '#1A5CFF';
const DARK_BLUE = '#0B3FB8';
const NAVY = '#071A3D';
const TEXT = '#102A56';
const MUTED = '#6B7A99';
const BACKGROUND = '#F5F8FF';
const LIGHT_BLUE = '#EAF1FF';
const BORDER = '#DFE7F5';

type Comment = {
  user: string;
  text: string;
};

type JobCardProps = {
  job: Job;
  liked: boolean;
  commentsCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onApply: () => void;
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  liked,
  commentsCount,
  onLike,
  onComment,
  onShare,
  onApply,
}) => {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#DFE7F5] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#AFC5F8] hover:shadow-[0_16px_35px_rgba(26,92,255,0.12)]">
      <div className="relative">
        <Link to={`/job/${job.id}`} className="block">
          <div className="relative h-44 overflow-hidden bg-[#EAF1FF]">
            {job.images?.length ? (
              <img
                src={job.images[0]}
                alt={job.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EAF1FF] to-[#D5E3FF]">
                <Briefcase className="h-14 w-14 text-[#1A5CFF]/40" />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#071A3D]/70 to-transparent" />

            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#1A5CFF] shadow-sm">
              {job.trade}
            </span>

            <span className="absolute bottom-4 left-4 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              New opportunity
            </span>
          </div>

          <div className="p-4">
            <h3 className="line-clamp-2 min-h-[3rem] text-base font-extrabold leading-6 text-[#071A3D]">
              {job.title}
            </h3>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF1FF]">
                <User className="h-3.5 w-3.5 text-[#1A5CFF]" />
              </div>

              <p className="truncate text-xs font-semibold text-[#6B7A99]">
                {job.client_name}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#F5F8FF] p-3">
                <MapPin className="mb-1.5 h-4 w-4 text-[#1A5CFF]" />

                <p className="text-[10px] text-[#8B98B2]">Location</p>

                <p className="mt-1 truncate text-xs font-bold text-[#102A56]">
                  {job.location}
                </p>
              </div>

              <div className="rounded-xl bg-[#F5F8FF] p-3">
                <DollarSign className="mb-1.5 h-4 w-4 text-[#1A5CFF]" />

                <p className="text-[10px] text-[#8B98B2]">Budget</p>

                <p className="mt-1 truncate text-xs font-bold text-[#102A56]">
                  {job.budget}
                </p>
              </div>
            </div>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Like job"
          onClick={onLike}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#6B7A99] shadow-sm transition hover:text-red-500"
        >
          <Heart
            className={`h-4 w-4 ${
              liked ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </button>

        <div className="flex items-center justify-between border-t border-[#EAF0FA] px-4 py-3">
          <div className="flex items-center gap-3 text-xs text-[#6B7A99]">
            <button
              type="button"
              onClick={onLike}
              className={`flex items-center gap-1 ${
                liked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  liked ? 'fill-red-500 text-red-500' : ''
                }`}
              />
              {liked ? 1 : 0}
            </button>

            <button
              type="button"
              onClick={onComment}
              className="flex items-center gap-1 hover:text-[#1A5CFF]"
            >
              <MessageCircle className="h-4 w-4" />
              {commentsCount}
            </button>

            <button
              type="button"
              onClick={onShare}
              className="hover:text-[#1A5CFF]"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onApply}
            className="flex items-center gap-1 rounded-lg bg-[#1A5CFF] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#0B3FB8]"
          >
            Apply
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );
};

const JobPage: React.FC = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  const [likedJobs, setLikedJobs] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );
  const [openComments, setOpenComments] = useState<Record<string, boolean>>(
    {},
  );

  const [toast, setToast] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationStep, setApplicationStep] = useState<'form' | 'success'>(
    'form',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAllJobs();
      setJobs(data);
    } catch (fetchError) {
      console.error('Error fetching jobs:', fetchError);
      setError('We could not load the jobs right now.');
    } finally {
      setLoading(false);
    }
  };

  const jobsAddedToday = useMemo(() => {
    return jobs.filter((job) => {
      if (!job.created_at) return false;

      return (
        new Date(job.created_at).toDateString() === new Date().toDateString()
      );
    }).length;
  }, [jobs]);

  const trades = useMemo(() => {
    return [...new Set(jobs.map((job) => job.trade).filter(Boolean))].slice(
      0,
      6,
    );
  }, [jobs]);

  const tradeCounts = useMemo(() => {
    return trades.reduce<Record<string, number>>((result, trade) => {
      result[trade] = jobs.filter((job) => job.trade === trade).length;
      return result;
    }, {});
  }, [jobs, trades]);

  const filteredJobs = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    const location = locationTerm.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search) ||
        job.trade.toLowerCase().includes(search) ||
        job.client_name.toLowerCase().includes(search);

      const matchesLocation =
        !location || job.location.toLowerCase().includes(location);

      const matchesTrade =
        !selectedTrade || job.trade === selectedTrade;

      return matchesSearch && matchesLocation && matchesTrade;
    });
  }, [jobs, searchTerm, locationTerm, selectedTrade]);

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 2500);
  };

  const handleLike = (jobId: string) => {
    setLikedJobs((previous) => ({
      ...previous,
      [jobId]: !previous[jobId],
    }));
  };

  const toggleCommentBox = (jobId: string) => {
    setOpenComments((previous) => ({
      ...previous,
      [jobId]: !previous[jobId],
    }));
  };

  const submitComment = (jobId: string) => {
    const text = commentInputs[jobId]?.trim();

    if (!text) return;

    setComments((previous) => ({
      ...previous,
      [jobId]: [
        ...(previous[jobId] || []),
        {
          user: 'You',
          text,
        },
      ],
    }));

    setCommentInputs((previous) => ({
      ...previous,
      [jobId]: '',
    }));

    setOpenComments((previous) => ({
      ...previous,
      [jobId]: false,
    }));

    showToast('Comment added');
  };

  const handleShare = async (job: Job) => {
    const shareUrl = `${window.location.origin}/job/${job.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Job link copied');
      } else {
        showToast(shareUrl);
      }
    } catch {
      showToast('Sharing cancelled');
    }
  };

  const openApplyForm = (job: Job) => {
    setSelectedJob(job);
    setApplicationStep('form');

    setApplicationData({
      name: '',
      email: '',
      phone: '',
      experience: '',
    });
  };

  const closeApplyForm = () => {
    if (isSubmitting) return;

    setSelectedJob(null);
    setApplicationStep('form');
  };

  const handleApplicationInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setApplicationData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitApplication = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedJob) return;

    try {
      setIsSubmitting(true);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setApplicationStep('success');
    } catch (submitError) {
      console.error('Application failed:', submitError);
      showToast('Application could not be submitted');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F8FF]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DFE7F5] border-t-[#1A5CFF]" />

          <p className="mt-4 text-sm text-[#6B7A99]">
            Loading opportunities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] text-[#071A3D]">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-[#DFE7F5] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_0.75fr]">
            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full bg-[#EAF1FF] px-3 py-1.5 text-xs font-bold text-[#1A5CFF]">
                <span className="h-2 w-2 rounded-full bg-[#1A5CFF]" />
                Find trusted opportunities
              </div>

              <h1 className="max-w-xl text-3xl font-black leading-tight text-[#071A3D] sm:text-4xl">
                Find work that
                <span className="block text-[#1A5CFF]">
                  moves you forward.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-[#6B7A99] sm:text-base">
                Discover reliable jobs, connect with serious clients, and find
                work that matches your skills.
              </p>

              <div className="mt-6 rounded-2xl border border-[#DFE7F5] bg-[#F5F8FF] p-2">
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-3">
                    <Search className="h-4 w-4 text-[#1A5CFF]" />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                      placeholder="Search jobs or skills"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[#8B98B2]"
                    />
                  </div>

                  <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-3">
                    <MapPin className="h-4 w-4 text-[#1A5CFF]" />

                    <input
                      type="text"
                      value={locationTerm}
                      onChange={(event) =>
                        setLocationTerm(event.target.value)
                      }
                      placeholder="Location"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[#8B98B2]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById('latest-jobs')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="rounded-xl bg-[#1A5CFF] px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3FB8]"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#6B7A99]">
                <span>
                  <strong className="text-[#071A3D]">{jobs.length}+</strong>{' '}
                  live jobs
                </span>

                <span>
                  <strong className="text-[#071A3D]">
                    {jobsAddedToday}
                  </strong>{' '}
                  added today
                </span>

                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#1A5CFF]" />
                  Trusted clients
                </span>
              </div>
            </div>

            <div className="relative min-h-[280px] overflow-hidden lg:min-h-[390px]">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80"
                alt="Professional worker"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#071A3D]/75 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/15 p-4 text-white backdrop-blur-md">
                <p className="text-sm font-bold">
                  Find clients who value your skills.
                </p>

                <p className="mt-1 text-xs text-white/75">
                  Work on meaningful projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#DFE7F5] bg-white p-4">
            <Briefcase className="h-5 w-5 text-[#1A5CFF]" />
            <p className="mt-3 text-xl font-black">{jobs.length}</p>
            <p className="mt-1 text-xs text-[#6B7A99]">Available jobs</p>
          </div>

          <div className="rounded-xl border border-[#DFE7F5] bg-white p-4">
            <Users className="h-5 w-5 text-[#1A5CFF]" />
            <p className="mt-3 text-xl font-black">
              {new Set(jobs.map((job) => job.client_name)).size}
            </p>
            <p className="mt-1 text-xs text-[#6B7A99]">Active clients</p>
          </div>

          <div className="rounded-xl border border-[#DFE7F5] bg-white p-4">
            <Sparkles className="h-5 w-5 text-[#1A5CFF]" />
            <p className="mt-3 text-xl font-black">{jobsAddedToday}</p>
            <p className="mt-1 text-xs text-[#6B7A99]">Added today</p>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1A5CFF]">
              Explore opportunities
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#071A3D]">
              Browse categories
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {trades.map((trade) => {
              const selected = selectedTrade === trade;

              return (
                <button
                  key={trade}
                  type="button"
                  onClick={() =>
                    setSelectedTrade(selected ? null : trade)
                  }
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? 'border-[#1A5CFF] bg-[#EAF1FF]'
                      : 'border-[#DFE7F5] bg-white hover:border-[#AFC5F8]'
                  }`}
                >
                  <Briefcase className="h-4 w-4 text-[#1A5CFF]" />

                  <p className="mt-3 truncate text-xs font-bold text-[#071A3D]">
                    {trade}
                  </p>

                  <p className="mt-1 text-[11px] text-[#6B7A99]">
                    {tradeCounts[trade]} jobs
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section id="latest-jobs" className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1A5CFF]">
              Latest opportunities
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#071A3D]">
              Latest jobs
            </h2>

            <p className="mt-1 text-sm text-[#6B7A99]">
              {filteredJobs.length} jobs available
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#AFC5F8] bg-white p-14 text-center">
              <Search className="mx-auto h-10 w-10 text-[#1A5CFF]" />

              <h3 className="mt-4 text-lg font-extrabold text-[#071A3D]">
                No jobs found
              </h3>

              <p className="mt-2 text-sm text-[#6B7A99]">
                Try another keyword or location.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setLocationTerm('');
                  setSelectedTrade(null);
                }}
                className="mt-5 rounded-lg bg-[#1A5CFF] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0B3FB8]"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <React.Fragment key={job.id}>
                  <JobCard
                    job={job}
                    liked={!!likedJobs[job.id]}
                    commentsCount={comments[job.id]?.length || 0}
                    onLike={() => handleLike(job.id)}
                    onComment={() => toggleCommentBox(job.id)}
                    onShare={() => handleShare(job)}
                    onApply={() => openApplyForm(job)}
                  />

                  {openComments[job.id] && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <div className="rounded-xl border border-[#C9D9FA] bg-[#EAF1FF] p-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[job.id] || ''}
                            onChange={(event) =>
                              setCommentInputs((previous) => ({
                                ...previous,
                                [job.id]: event.target.value,
                              }))
                            }
                            placeholder="Write a comment..."
                            className="min-w-0 flex-1 rounded-lg border border-[#DFE7F5] bg-white px-3 py-2 text-xs outline-none focus:border-[#1A5CFF]"
                          />

                          <button
                            type="button"
                            onClick={() => submitComment(job.id)}
                            className="rounded-lg bg-[#1A5CFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B3FB8]"
                          >
                            Post
                          </button>
                        </div>

                        {comments[job.id]?.map((comment, index) => (
                          <p
                            key={index}
                            className="mt-3 text-xs text-[#6B7A99]"
                          >
                            <strong className="text-[#071A3D]">
                              {comment.user}:
                            </strong>{' '}
                            {comment.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-2xl bg-[#071A3D] px-6 py-8 text-white sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Build your future
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                Ready to find your next opportunity?
              </h2>

              <p className="mt-2 max-w-lg text-sm text-blue-100/70">
                Connect with serious clients and discover work that fits your
                skills.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/create-job')}
              className="flex items-center gap-2 rounded-xl bg-[#1A5CFF] px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3FB8]"
            >
              Post a job
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A3D]/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeApplyForm();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white">
            {applicationStep === 'form' ? (
              <>
                <div className="relative bg-[#1A5CFF] px-6 py-6 text-white">
                  <button
                    type="button"
                    onClick={closeApplyForm}
                    className="absolute right-5 top-5 rounded-full bg-white/10 p-2 hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <p className="text-xs text-blue-100">Apply now</p>

                  <h3 className="mt-2 pr-10 text-xl font-extrabold">
                    {selectedJob.title}
                  </h3>

                  <div className="mt-3 flex gap-4 text-xs text-blue-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedJob.location}
                    </span>

                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {selectedJob.budget}
                    </span>
                  </div>
                </div>

                <form onSubmit={submitApplication} className="space-y-4 p-6">
                  <input
                    type="text"
                    name="name"
                    required
                    value={applicationData.name}
                    onChange={handleApplicationInput}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-[#DFE7F5] px-3 py-2.5 text-sm outline-none focus:border-[#1A5CFF]"
                  />

                  <input
                    type="email"
                    name="email"
                    required
                    value={applicationData.email}
                    onChange={handleApplicationInput}
                    placeholder="Email address"
                    className="w-full rounded-lg border border-[#DFE7F5] px-3 py-2.5 text-sm outline-none focus:border-[#1A5CFF]"
                  />

                  <input
                    type="tel"
                    name="phone"
                    required
                    value={applicationData.phone}
                    onChange={handleApplicationInput}
                    placeholder="Phone number"
                    className="w-full rounded-lg border border-[#DFE7F5] px-3 py-2.5 text-sm outline-none focus:border-[#1A5CFF]"
                  />

                  <textarea
                    name="experience"
                    rows={4}
                    value={applicationData.experience}
                    onChange={handleApplicationInput}
                    placeholder="Tell the client about your experience..."
                    className="w-full resize-none rounded-lg border border-[#DFE7F5] px-3 py-2.5 text-sm outline-none focus:border-[#1A5CFF]"
                  />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeApplyForm}
                      className="flex-1 rounded-lg border border-[#DFE7F5] py-3 text-sm font-bold text-[#6B7A99]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1A5CFF] py-3 text-sm font-bold text-white hover:bg-[#0B3FB8] disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF1FF]">
                  <Check className="h-8 w-8 text-[#1A5CFF]" />
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-[#071A3D]">
                  Application sent
                </h3>

                <p className="mt-2 text-sm text-[#6B7A99]">
                  Your application has been prepared for the client.
                </p>

                <div className="mt-5 rounded-xl bg-[#F5F8FF] p-4 text-left text-sm text-[#6B7A99]">
                  <p>
                    <strong className="text-[#071A3D]">Job:</strong>{' '}
                    {selectedJob.title}
                  </p>

                  <p className="mt-2">
                    <strong className="text-[#071A3D]">Client:</strong>{' '}
                    {selectedJob.client_name}
                  </p>

                  <p className="mt-2">
                    <strong className="text-[#071A3D]">Email:</strong>{' '}
                    {applicationData.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeApplyForm}
                  className="mt-5 w-full rounded-lg bg-[#1A5CFF] py-3 text-sm font-bold text-white hover:bg-[#0B3FB8]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPage;