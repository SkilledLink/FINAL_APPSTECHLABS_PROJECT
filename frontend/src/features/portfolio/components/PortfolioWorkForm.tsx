// src/features/portfolio/components/PortfolioWorkForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Users,
  Tag,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { Work } from '../../../types/portfolio';

export interface PortfolioWorkFormData {
  title: string;
  description: string;
  service_category: string;
  location: string;
  completed_at?: string;
  duration_value?: number;
  duration_unit: string;
  team_size?: number;
  client_type: string;
}

interface PortfolioWorkFormProps {
  work?: Work | null;
  onClose: () => void;
  onSave: (data: PortfolioWorkFormData, files?: { before?: File; after?: File }) => Promise<void>;
  loading?: boolean;
}

const initialFormState: PortfolioWorkFormData = {
  title: '',
  description: '',
  service_category: '',
  location: '',
  completed_at: '',
  duration_value: undefined,
  duration_unit: 'days',
  team_size: undefined,
  client_type: '',
};

export default function PortfolioWorkForm({ work, onClose, onSave, loading = false }: PortfolioWorkFormProps) {
  const [formData, setFormData] = useState<PortfolioWorkFormData>(initialFormState);
  const [rawDuration, setRawDuration] = useState<string>('');
  const [rawTeamSize, setRawTeamSize] = useState<string>('');

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Populate or reset form when work prop changes
  useEffect(() => {
    if (work) {
      setFormData({
        title: work.title || '',
        description: work.description || '',
        service_category: work.service_category || '',
        location: work.location || '',
        completed_at: work.completed_at ? work.completed_at.split('T')[0] : '',
        duration_unit: work.duration_unit || 'days',
        client_type: work.client_type || '',
      });
      setRawDuration(work.duration_value?.toString() || '');
      setRawTeamSize(work.team_size?.toString() || '');
      setBeforePreview(work.before_image_url || null);
      setAfterPreview(work.after_image_url || null);
    } else {
      setFormData(initialFormState);
      setRawDuration('');
      setRawTeamSize('');
      setBeforePreview(null);
      setAfterPreview(null);
      setBeforeFile(null);
      setAfterFile(null);
    }
  }, [work]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (beforePreview && beforePreview.startsWith('blob:')) URL.revokeObjectURL(beforePreview);
      if (afterPreview && afterPreview.startsWith('blob:')) URL.revokeObjectURL(afterPreview);
    };
  }, [beforePreview, afterPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    if (type === 'before') {
      if (beforePreview && beforePreview.startsWith('blob:')) URL.revokeObjectURL(beforePreview);
      setBeforeFile(file);
      setBeforePreview(objectUrl);
    } else {
      if (afterPreview && afterPreview.startsWith('blob:')) URL.revokeObjectURL(afterPreview);
      setAfterFile(file);
      setAfterPreview(objectUrl);
    }
  };

  const removeImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      if (beforePreview && beforePreview.startsWith('blob:')) URL.revokeObjectURL(beforePreview);
      setBeforeFile(null);
      setBeforePreview(null);
      if (beforeInputRef.current) beforeInputRef.current.value = '';
    } else {
      if (afterPreview && afterPreview.startsWith('blob:')) URL.revokeObjectURL(afterPreview);
      setAfterFile(null);
      setAfterPreview(null);
      if (afterInputRef.current) afterInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: PortfolioWorkFormData = {
        ...formData,
        duration_value: rawDuration ? parseInt(rawDuration, 10) : undefined,
        team_size: rawTeamSize ? parseInt(rawTeamSize, 10) : undefined,
        completed_at: formData.completed_at ? new Date(formData.completed_at).toISOString() : undefined,
      };
      await onSave(payload, { before: beforeFile || undefined, after: afterFile || undefined });
    } finally {
      setSubmitting(false);
    }
  };

  const isProcessing = submitting || loading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 -mt-10 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-10 -mt-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {work ? 'Edit Project Details' : 'Showcase New Project'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {work ? 'Update your portfolio work entry below' : 'Add details and before/after images for your portfolio'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form id="portfolio-work-form" onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 py-4 custom-scrollbar flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="e.g., Custom Full-Stack Web Platform"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Summarize key tasks, tech stack, and goals achieved..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Service Category
              </label>
              <div className="relative">
                <Tag size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.service_category}
                  onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="e.g., Web Development"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="e.g., Remote / Yaoundé"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Completed Date
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={formData.completed_at || ''}
                onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  value={rawDuration}
                  onChange={(e) => setRawDuration(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="3"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <select
                value={formData.duration_unit}
                onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Team Size
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  value={rawTeamSize}
                  onChange={(e) => setRawTeamSize(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="2"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Client Type
              </label>
              <select
                value={formData.client_type}
                onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="">Select Client Type…</option>
                <option value="individual">Individual</option>
                <option value="household">Household</option>
                <option value="business">Business</option>
                <option value="organization">Organization</option>
                <option value="government">Government</option>
                <option value="professional">Professional</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>
          </div>

          {/* Media Uploads */}
          <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-4 mt-3">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Transformation Media (Before & After)
              </label>
              <span className="text-[11px] text-slate-400">Recommended 16:9</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div className="flex flex-col">
                <div className="relative aspect-video bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300/80 dark:border-slate-700/80 hover:border-blue-500 transition-all group flex items-center justify-center">
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-sm z-10">
                    Before
                  </span>
                  {beforePreview ? (
                    <>
                      <img src={beforePreview} alt="Before preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => beforeInputRef.current?.click()}
                          className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1"
                        >
                          <Upload size={14} /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage('before')}
                          className="p-2 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-md text-white rounded-xl text-xs font-medium transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => beforeInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <ImageIcon size={28} className="mb-1.5 opacity-80" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Initial State</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Click to browse</span>
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
              </div>

              {/* After */}
              <div className="flex flex-col">
                <div className="relative aspect-video bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300/80 dark:border-slate-700/80 hover:border-emerald-500 transition-all group flex items-center justify-center">
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-sm z-10">
                    After
                  </span>
                  {afterPreview ? (
                    <>
                      <img src={afterPreview} alt="After preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => afterInputRef.current?.click()}
                          className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1"
                        >
                          <Upload size={14} /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage('after')}
                          className="p-2 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-md text-white rounded-xl text-xs font-medium transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => afterInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <ImageIcon size={28} className="mb-1.5 opacity-80" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Final Result</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Click to browse</span>
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
          </div>
        </form>

        {/* Fixed Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="portfolio-work-form"
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving…
              </>
            ) : work ? (
              'Save Changes'
            ) : (
              'Create Showcase'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}