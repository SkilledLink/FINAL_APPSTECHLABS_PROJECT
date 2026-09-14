import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Briefcase,
  Trash2,
  Save,
  Star,
} from 'lucide-react';
import type { Work } from '../../../api/portfolioApi';

interface WorkFormProps {
  work?: Work | null;
  onClose: () => void;
  onSave: (data: any, files?: { before?: File; after?: File }) => Promise<void>;
  loading?: boolean;
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20';

const labelCls =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300';

export default function WorkForm({ work, onClose, onSave, loading = false }: WorkFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_category: '',
    location: '',
    completed_at: '',
    duration_value: '',
    duration_unit: 'days',
    team_size: '',
    client_type: '',
    cost: '',
    client_name: '',
    client_testimonial: '',
    rating: undefined as number | undefined,
  });
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (work) {
      setFormData({
        title: work.title || '',
        description: work.description || '',
        service_category: work.service_category || '',
        location: work.location || '',
        completed_at: work.completed_at ? work.completed_at.split('T')[0] : '',
        duration_value: work.duration_value?.toString() || '',
        duration_unit: work.duration_unit || 'days',
        team_size: work.team_size?.toString() || '',
        client_type: work.client_type || '',
        cost: work.cost?.toString() || '',
        client_name: work.client_name || '',
        client_testimonial: work.client_testimonial || '',
        rating: work.rating ?? undefined,
      });
      if (work.before_image_url) setBeforePreview(work.before_image_url);
      if (work.after_image_url) setAfterPreview(work.after_image_url);
    }
  }, [work]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === 'before') {
        setBeforeFile(file);
        setBeforePreview(ev.target?.result as string);
      } else {
        setAfterFile(file);
        setAfterPreview(ev.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeFile(null);
      setBeforePreview(null);
      if (beforeInputRef.current) beforeInputRef.current.value = '';
    } else {
      setAfterFile(null);
      setAfterPreview(null);
      if (afterInputRef.current) afterInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || formData.title.trim().length < 2) {
      setError('Title must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        service_category: formData.service_category.trim() || undefined,
        location: formData.location.trim() || undefined,
        client_name: formData.client_name.trim() || undefined,
        client_testimonial: formData.client_testimonial.trim() || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        duration_value: formData.duration_value ? parseInt(formData.duration_value, 10) : undefined,
        team_size: formData.team_size ? parseInt(formData.team_size, 10) : undefined,
        completed_at: formData.completed_at ? new Date(formData.completed_at).toISOString() : undefined,
      };
      await onSave(data, { before: beforeFile || undefined, after: afterFile || undefined });
    } finally {
      setSubmitting(false);
    }
  };

  const isSaving = submitting || loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity dark:bg-slate-950/80"
        onClick={!isSaving ? onClose : undefined}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800/80 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {work ? 'Edit work project' : 'Add new work project'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showcase your portfolio project details and images
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Modern Living Room Wall Repainting"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you do? Challenges, materials, outcome…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Category</label>
              <input
                type="text"
                value={formData.service_category}
                onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                placeholder="e.g. Interior Painting"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Yaoundé, Mvog-Mbi"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Completed on</label>
              <input
                type="date"
                value={formData.completed_at}
                onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cost (XAF)</label>
              <input
                type="number"
                min={0}
                step={500}
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="e.g. 150000"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Duration</label>
              <input
                type="number"
                min="0"
                value={formData.duration_value}
                onChange={(e) => setFormData({ ...formData, duration_value: e.target.value })}
                placeholder="e.g. 3"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select
                value={formData.duration_unit}
                onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                className={inputCls}
              >
                <option value="minutes" className="dark:bg-slate-900">Minutes</option>
                <option value="hours" className="dark:bg-slate-900">Hours</option>
                <option value="days" className="dark:bg-slate-900">Days</option>
                <option value="weeks" className="dark:bg-slate-900">Weeks</option>
                <option value="months" className="dark:bg-slate-900">Months</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Team size</label>
              <input
                type="number"
                min="1"
                value={formData.team_size}
                onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                placeholder="e.g. 2"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Client type</label>
            <select
              value={formData.client_type}
              onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
              className={inputCls}
            >
              <option value="" className="dark:bg-slate-900">—</option>
              <option value="individual" className="dark:bg-slate-900">Individual</option>
              <option value="household" className="dark:bg-slate-900">Household</option>
              <option value="business" className="dark:bg-slate-900">Business</option>
              <option value="organization" className="dark:bg-slate-900">Organization</option>
              <option value="government" className="dark:bg-slate-900">Government</option>
              <option value="professional" className="dark:bg-slate-900">Professional</option>
              <option value="contractor" className="dark:bg-slate-900">Contractor</option>
            </select>
          </div>

          {/* Transformation Media Section */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Transformation Media</label>
              <span className="text-[11px] text-slate-400">16:9 ratio recommended</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Before Image */}
              <div className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-950 flex items-center justify-center group">
                <span className="absolute top-2 left-2 z-10 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:bg-amber-400/20 dark:text-amber-400">
                  Before
                </span>

                {beforePreview ? (
                  <>
                    <img src={beforePreview} alt="Before" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => beforeInputRef.current?.click()}
                        className="rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-white/30"
                      >
                        <Upload className="inline h-3.5 w-3.5 mr-1" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage('before')}
                        className="rounded-lg bg-rose-500/80 p-1.5 text-white backdrop-blur-md hover:bg-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => beforeInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-slate-400 hover:text-cyan-500"
                  >
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Upload Before Photo
                    </span>
                  </button>
                )}
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'before')}
                />
              </div>

              {/* After Image */}
              <div className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-950 flex items-center justify-center group">
                <span className="absolute top-2 left-2 z-10 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400">
                  After
                </span>

                {afterPreview ? (
                  <>
                    <img src={afterPreview} alt="After" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => afterInputRef.current?.click()}
                        className="rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-white/30"
                      >
                        <Upload className="inline h-3.5 w-3.5 mr-1" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage('after')}
                        className="rounded-lg bg-rose-500/80 p-1.5 text-white backdrop-blur-md hover:bg-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => afterInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-slate-400 hover:text-cyan-500"
                  >
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Upload After Photo
                    </span>
                  </button>
                )}
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'after')}
                />
              </div>
            </div>
          </div>

          {/* Client Feedback Section */}
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>Client feedback (optional)</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Client name</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g. Mrs. Ngu"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Rating</label>
                <div className="flex gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          rating: formData.rating === r ? undefined : r,
                        })
                      }
                      className={`flex h-9 flex-1 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                        formData.rating === r
                          ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30 dark:bg-amber-400 dark:text-slate-950'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {r} ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Testimonial</label>
              <textarea
                rows={2}
                value={formData.client_testimonial}
                onChange={(e) => setFormData({ ...formData, client_testimonial: e.target.value })}
                placeholder="What did the client say?"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-500 disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {work ? 'Save changes' : 'Add project'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}