import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateJob } from '../hooks/useJobs';
import type { JobStatus } from '../types/job.types';

interface CreateJobPageProps {
  onBack?: () => void;
  onCreated?: (jobId: string) => void;
}

const MAX_IMAGES = 5;

/* ───────────────────────── Shared tokens ───────────────────────── */

const SECTION_CARD =
  'w-full overflow-hidden rounded-md border border-slate-200/70 ' +
  'bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ' +
  'p-5 sm:p-6';

const SECTION_TITLE =
  'text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white';

const INPUT =
  'w-full rounded border border-slate-200/80 bg-white/70 px-3.5 py-2.5 text-sm ' +
  'text-slate-900 outline-none backdrop-blur-md transition-all ' +
  'placeholder:text-slate-400 ' +
  'focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/25 ' +
  'dark:border-white/10 dark:bg-slate-800/40 dark:text-white ' +
  'dark:placeholder:text-slate-500 dark:focus:bg-slate-900/70';

const LABEL =
  'mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300';

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded bg-blue-600 px-5 py-2.5 ' +
  'text-sm font-semibold text-white shadow-sm shadow-blue-500/25 ' +
  'transition-colors hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60';

const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded border border-slate-200/80 ' +
  'bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-md ' +
  'transition-colors hover:bg-white disabled:opacity-50 ' +
  'dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-200 ' +
  'dark:hover:bg-slate-800/70';

const STATUS_OPTIONS: {
  value: JobStatus;
  label: string;
  desc: string;
}[] = [
  { value: 'published', label: 'Published', desc: 'Visible to everyone now' },
  { value: 'draft', label: 'Draft', desc: 'Save privately, publish later' },
  { value: 'closed', label: 'Closed', desc: 'No longer accepting interest' },
];

/* ─────────────────────────────────────────────────────────────── */

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
    if (onBack) onBack();
    else navigate(-1);
  };

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
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
      if (onCreated) onCreated(result.id);
      else navigate('/home/jobs');
    } else {
      setError('Failed to create job listing. Please try again.');
    }
  };

  return (
    <div className="relative w-full bg-slate-50/50 transition-colors dark:bg-slate-950">
      {/* Ambience */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="relative w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button type="button" onClick={handleBack} className={BTN_GHOST}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <span className="inline-flex items-center gap-1.5 rounded border border-blue-500/20 bg-blue-500/8 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 backdrop-blur-md dark:border-blue-400/20 dark:text-blue-300">
            <Sparkles className="h-3 w-3" />
            <span>New job</span>
          </span>
        </div>

        <div className="w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Post a job
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Share a new opportunity or service request with the community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-md dark:text-rose-300">
                <X className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Details */}
            <section className={SECTION_CARD}>
              <h2 className={SECTION_TITLE}>Job details</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label className={LABEL}>
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    maxLength={200}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Developer or Commercial Electrician"
                    className={INPUT}
                  />
                  <p className="mt-1 text-right text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
                    {title.length}/200
                  </p>
                </div>

                <div>
                  <label className={LABEL}>
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the scope, responsibilities, timeline, and candidate requirements…"
                    className={`${INPUT} resize-none`}
                  />
                </div>
              </div>
            </section>

            {/* Status */}
            <section className={SECTION_CARD}>
              <h2 className={SECTION_TITLE}>Status</h2>
              <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">
                {STATUS_OPTIONS.map((opt) => {
                  const active = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`w-full rounded border p-3.5 text-left transition-all ${
                        active
                          ? 'border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20 dark:border-blue-500/40 dark:bg-blue-500/10'
                          : 'border-slate-200/80 bg-white/60 hover:border-blue-500/30 dark:border-white/10 dark:bg-slate-800/40 dark:hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            active
                              ? 'border-blue-600 dark:border-blue-400'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {opt.label}
                        </span>
                      </div>
                      <p className="mt-1 pl-5.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Images */}
            <section className={SECTION_CARD}>
              <div className="flex items-center justify-between">
                <h2 className={SECTION_TITLE}>Images & media</h2>
                <span className="text-[11px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                  {files.length}/{MAX_IMAGES}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {previews.map((previewUrl, i) => (
                  <div
                    key={previewUrl}
                    className="group relative aspect-square w-full overflow-hidden rounded-sm border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-slate-800"
                  >
                    <img
                      src={previewUrl}
                      alt={files[i]?.name || `Uploaded file ${i + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label="Remove image"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded bg-slate-950/80 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-rose-600 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {files.length < MAX_IMAGES && (
                  <label className="group flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-blue-500/25 bg-blue-500/[0.03] p-2 text-slate-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-600 dark:border-blue-400/20 dark:bg-blue-500/[0.04] dark:hover:border-blue-400/50 dark:hover:text-blue-400">
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

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className={`flex-1 ${BTN_GHOST}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 ${BTN_PRIMARY}`}
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
    </div>
  );
}