import { ArrowLeft, ImagePlus, Plus, Sparkles, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCreateJob } from '../hooks/useJobs';
import type { JobStatus } from '../types/job.types';

interface CreateJobPageProps {
  onBack: () => void;
  onCreated: (jobId: string) => void;
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
  const { createJob, loading } = useCreateJob();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<JobStatus>('published');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Safely generate and clean up object URLs to prevent memory leaks
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

    if (result) onCreated(result.id);
    else setError('Failed to create job listing. Please try again.');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>New Job Listing</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Post a job
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Share a new opportunity or service request with the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
              <X className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Details Section */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Job details
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Developer or Commercial Electrician"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                />
                <p className="mt-1.5 text-right text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                  {title.length}/200
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={7}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the scope, responsibilities, timeline, and candidate requirements…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* Status Section */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Status
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
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
                    <p className="mt-1.5 pl-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Images Section */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Images & Media
              </h2>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                {files.length}/{MAX_IMAGES}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {previews.map((previewUrl, i) => (
                <div
                  key={previewUrl}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
                >
                  <img
                    src={previewUrl}
                    alt={files[i]?.name || `Uploaded file ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-slate-950"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {files.length < MAX_IMAGES && (
                <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-2 text-slate-400 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400">
                  <ImagePlus className="h-6 w-6 transition-transform group-hover:scale-110" />
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Posting job…</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
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