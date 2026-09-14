import { ArrowLeft, ImagePlus, Plus, Sparkles, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateJob } from '../hooks/useJobs';
import type { JobStatus } from '../types/job.types';

interface CreateJobPageProps {
  onBack?: () => void;
  onCreated?: (jobId: string) => void;
}

const MAX_IMAGES = 5;

const STATUS_OPTIONS: {
  value: JobStatus;
  label: string;
  desc: string;
}[] = [
  { value: 'published', label: 'Published', desc: 'Visible to everyone now' },
  { value: 'draft', label: 'Draft', desc: 'Save privately, publish later' },
  { value: 'closed', label: 'Closed', desc: 'No longer accepting interest' },
];

export default function CreateJobPage({ onBack, onCreated }: CreateJobPageProps) {
  const navigate = useNavigate();
  const { createJob, loading } = useCreateJob();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<JobStatus>('published');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, MAX_IMAGES));
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (title.length > 200) {
      setError('Title must be 200 characters or less.');
      return;
    }

    const result = await createJob({
      title: title.trim(),
      description: description.trim(),
      status,
      files,
    });

    if (result) {
      if (onCreated) {
        onCreated(result.id);
      } else {
        navigate('/home/jobs');
      }
    } else {
      setError('Failed to create job listing. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Top Header / Nav */}
      <div className="w-full mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/40 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>New Job Listing</span>
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* Page Title Header */}
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Post a job
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Share a new opportunity or service request with the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && (
            <div className="flex w-full items-center gap-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 backdrop-blur-md px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
              <X className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Details Section */}
          <section className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Job details
            </h2>

            <div className="mt-4 w-full space-y-4">
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Developer or Commercial Electrician"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-right text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                  {title.length}/200
                </p>
              </div>

              <div className="w-full">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the scope, responsibilities, timeline, and candidate requirements…"
                  className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </section>

          {/* Status Section */}
          <section className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Status
            </h2>
            <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          active
                            ? 'border-indigo-600 dark:border-indigo-400'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        )}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {opt.label}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-5.5 text-xs text-slate-500 dark:text-slate-400">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Images Section */}
          <section className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Images & Media
              </h2>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                {files.length}/{MAX_IMAGES}
              </span>
            </div>

            <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {previews.map((previewUrl, i) => (
                <div
                  key={previewUrl}
                  className="group relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    src={previewUrl}
                    alt={files[i]?.name || `Uploaded file ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-slate-950/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-950"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {files.length < MAX_IMAGES && (
                <label className="group flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-800/30 p-2 text-slate-400 transition-all hover:border-indigo-500 hover:bg-indigo-50/30 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400">
                  <ImagePlus className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold">Add image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row pt-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Posting job…</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Post job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}