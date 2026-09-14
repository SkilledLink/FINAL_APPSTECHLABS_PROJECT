import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Wrench,
  Loader2,
  Check,
  ShieldCheck,
  Clock,
  MapPin,
  DollarSign,
  Tag,
  Layers,
  FileText,
  Zap,
} from 'lucide-react';
import type { Service } from '../../../api/portfolioApi';

interface ServiceFormProps {
  service?: Service | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ServiceForm({ service, onClose, onSave }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    service_area: '',
    starting_price: '',
    pricing_type: 'fixed',
    estimated_duration: '',
    warranty_days: '',
    lead_time_days: '',
    is_active: true,
    is_emergency_service: false,
  });

  // Dynamic Array Fields for Included / Not Included
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>([]);
  const [includedInput, setIncludedInput] = useState('');

  const [whatsNotIncluded, setWhatsNotIncluded] = useState<string[]>([]);
  const [notIncludedInput, setNotIncludedInput] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        category: service.category || '',
        service_area: service.service_area || '',
        starting_price: service.starting_price?.toString() || '',
        pricing_type: service.pricing_type || 'fixed',
        estimated_duration: service.estimated_duration || (service as any).duration || '',
        warranty_days: (service as any).warranty_days?.toString() || '',
        lead_time_days: (service as any).lead_time_days?.toString() || '',
        is_active: service.is_active ?? true,
        is_emergency_service: service.is_emergency_service ?? false,
      });

      if ((service as any).whats_included) {
        setWhatsIncluded(
          Array.isArray((service as any).whats_included)
            ? (service as any).whats_included
            : [(service as any).whats_included]
        );
      }
      if ((service as any).whats_not_included) {
        setWhatsNotIncluded(
          Array.isArray((service as any).whats_not_included)
            ? (service as any).whats_not_included
            : [(service as any).whats_not_included]
        );
      }
    }
  }, [service]);

  // Tag Handlers
  const handleAddIncluded = () => {
    if (includedInput.trim()) {
      setWhatsIncluded([...whatsIncluded, includedInput.trim()]);
      setIncludedInput('');
    }
  };

  const handleRemoveIncluded = (index: number) => {
    setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
  };

  const handleAddNotIncluded = () => {
    if (notIncludedInput.trim()) {
      setWhatsNotIncluded([...whatsNotIncluded, notIncludedInput.trim()]);
      setNotIncludedInput('');
    }
  };

  const handleRemoveNotIncluded = (index: number) => {
    setWhatsNotIncluded(whatsNotIncluded.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        starting_price: formData.starting_price ? parseFloat(formData.starting_price) : undefined,
        warranty_days: formData.warranty_days ? parseInt(formData.warranty_days, 10) : undefined,
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days, 10) : undefined,
        whats_included: whatsIncluded,
        whats_not_included: whatsNotIncluded,
      };
      await onSave(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      /* High Z-index overlay clearing website navigation */
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-slate-950/40 backdrop-blur-2xl overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="relative my-auto w-full max-w-2xl rounded-[28px] border border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient iPhone Glow Effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                {service ? 'Edit Service' : 'Add New Service'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your service parameters and details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="service-form"
          onSubmit={handleSubmit}
          className="relative z-10 flex-1 space-y-4 overflow-y-auto py-5 pr-1 scrollbar-none"
        >
          {/* Service Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Service title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Electrical Installation & Diagnostics"
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the service offered..."
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Category & Service Area */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Category
              </label>
              <div className="relative">
                <Tag size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Electrical"
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Service area
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.service_area}
                  onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
                  placeholder="e.g. Downtown & Metro Area"
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Starting Price, Pricing Type, Duration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Starting price
              </label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Pricing type
              </label>
              <div className="relative">
                <Layers size={15} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <select
                  value={formData.pricing_type}
                  onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                  className="w-full appearance-none rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                >
                  <option value="fixed">Fixed Rate</option>
                  <option value="starting_from">Starting From</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="quote_required">Quote Required</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Duration
              </label>
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                  placeholder="e.g. 2 hours"
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* What's Included & What's Not Included */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* What's Included */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                What's included
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={includedInput}
                  onChange={(e) => setIncludedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIncluded())}
                  placeholder="Add item..."
                  className="flex-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleAddIncluded}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Tag List */}
              {whatsIncluded.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {whatsIncluded.map((item, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveIncluded(idx)}
                          className="hover:text-rose-500 transition-colors ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* What's Not Included */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                What's not included
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={notIncludedInput}
                  onChange={(e) => setNotIncludedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNotIncluded())}
                  placeholder="Add item..."
                  className="flex-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleAddNotIncluded}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Tag List */}
              {whatsNotIncluded.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {whatsNotIncluded.map((item, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-500/20"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveNotIncluded(idx)}
                          className="hover:text-rose-500 transition-colors ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Warranty & Lead Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Warranty (days)
              </label>
              <div className="relative">
                <ShieldCheck size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.warranty_days}
                  onChange={(e) => setFormData({ ...formData, warranty_days: e.target.value })}
                  placeholder="e.g. 30"
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Lead time (days)
              </label>
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                  placeholder="e.g. 2"
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Toggle Switches (Active & Emergency Service) */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            {/* Active Toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-100/50 dark:border-slate-800/80 dark:bg-slate-800/40 p-3 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check size={14} />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Active
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="relative w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>

            {/* Emergency Toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-100/50 dark:border-slate-800/80 dark:bg-slate-800/40 p-3 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Zap size={14} />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Emergency Service
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_emergency_service}
                onChange={(e) => setFormData({ ...formData, is_emergency_service: e.target.checked })}
                className="sr-only peer"
              />
              <div className="relative w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </form>

        {/* Modal Action Footer */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all backdrop-blur-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="service-form"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving...
              </>
            ) : service ? (
              'Save Changes'
            ) : (
              'Create Service'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}