import { useState } from 'react';
import { ArrowLeft, Plus, X, CheckCircle2 } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import {
  CAMEROON_CITIES,
  JOB_CATEGORIES,
  JOB_TYPES,
  type CameroonCity,
  type JobCategory,
  type JobType,
} from '../types/job.types';

interface CreateJobPageProps {
  onBack: () => void;
  onCreated: (jobId: string) => void;
}

export default function CreateJobPage({ onBack, onCreated }: CreateJobPageProps) {
  const { postJob } = useJobs();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    posterName: '',
    posterTitle: '',
    posterCompany: '',
    category: 'Technology' as JobCategory,
    location: 'Douala' as CameroonCity,
    jobType: 'Full-time' as JobType,
    salaryMin: 200000,
    salaryMax: 500000,
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
  });

  const update = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.posterName.trim() || !form.posterCompany.trim() || !form.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const requirements = form.requirements.split('\n').map((s) => s.trim()).filter(Boolean);
      const responsibilities = form.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean);

      const result = await postJob({
        title: form.title.trim(),
        posterName: form.posterName.trim(),
        posterTitle: form.posterTitle.trim() || 'Recruiter',
        posterCompany: form.posterCompany.trim(),
        category: form.category,
        location: form.location,
        jobType: form.jobType,
        salaryMin: form.salaryMin,
        salaryMax: form.salaryMax,
        skills,
        description: form.description.trim(),
        requirements,
        responsibilities,
      });

      const newJobId = result[0]?.id;
      if (newJobId) onCreated(newJobId);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={onBack} className="btn-ghost mb-6 -ml-3">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900">Post a Job</h1>
        <p className="text-ink-500 mt-2">Reach thousands of job seekers across Cameroon.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Poster info */}
        <fieldset className="card p-5 space-y-4">
          <legend className="font-display font-bold text-ink-900 px-2">Your Information</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Name *</label>
              <input className="input" value={form.posterName} onChange={(e) => update({ posterName: e.target.value })} placeholder="e.g. Nji Samuel" />
            </div>
            <div>
              <label className="label">Your Title</label>
              <input className="input" value={form.posterTitle} onChange={(e) => update({ posterTitle: e.target.value })} placeholder="e.g. Hiring Manager" />
            </div>
          </div>
          <div>
            <label className="label">Company *</label>
            <input className="input" value={form.posterCompany} onChange={(e) => update({ posterCompany: e.target.value })} placeholder="e.g. ActivEdge Technologies" />
          </div>
        </fieldset>

        {/* Job details */}
        <fieldset className="card p-5 space-y-4">
          <legend className="font-display font-bold text-ink-900 px-2">Job Details</legend>
          <div>
            <label className="label">Job Title *</label>
            <input className="input" value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Full-Stack Developer" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => update({ category: e.target.value as JobCategory })}>
                {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <select className="input" value={form.location} onChange={(e) => update({ location: e.target.value as CameroonCity })}>
                {CAMEROON_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job Type</label>
              <select className="input" value={form.jobType} onChange={(e) => update({ jobType: e.target.value as JobType })}>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Min Salary (XAF)</label>
              <input type="number" step={50000} min={0} className="input" value={form.salaryMin} onChange={(e) => update({ salaryMin: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Max Salary (XAF)</label>
              <input type="number" step={50000} min={0} className="input" value={form.salaryMax} onChange={(e) => update({ salaryMax: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Skills (comma-separated)</label>
            <input className="input" value={form.skills} onChange={(e) => update({ skills: e.target.value })} placeholder="React, TypeScript, Node.js" />
          </div>
        </fieldset>

        {/* Description */}
        <fieldset className="card p-5 space-y-4">
          <legend className="font-display font-bold text-ink-900 px-2">Job Content</legend>
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={4} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Describe the role and what the candidate will do..." />
          </div>
          <div>
            <label className="label">Requirements (one per line)</label>
            <textarea className="input resize-none" rows={4} value={form.requirements} onChange={(e) => update({ requirements: e.target.value })} placeholder={"3+ years with React\nBachelor's degree"} />
          </div>
          <div>
            <label className="label">Responsibilities (one per line)</label>
            <textarea className="input resize-none" rows={4} value={form.responsibilities} onChange={(e) => update({ responsibilities: e.target.value })} placeholder={"Build web applications\nCollaborate with team"} />
          </div>
        </fieldset>

        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? (
              <>Posting...</>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Post Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
