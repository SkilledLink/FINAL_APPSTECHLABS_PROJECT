import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Briefcase,
} from 'lucide-react';
import type { Job } from '../types/job.types';
import { useJobs } from '../hooks/useJobs';
import Avatar from './Avatar';

interface JobApplicationFormProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

const PRESET_MESSAGE =
  'Hello, I saw the job you posted, I am interested for this job';

export default function JobApplicationForm({
  job,
  open,
  onClose,
}: JobApplicationFormProps) {
  const { applyToJob } = useJobs();
  const [message, setMessage] = useState(PRESET_MESSAGE);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await applyToJob({
        jobId: job.id,
        jobTitle: job.title,
        company: job.poster.company,
        posterName: job.poster.name,
        posterAvatar: job.poster.avatar,
        location: job.location,
        message: message.trim(),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setMessage(PRESET_MESSAGE);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Glass Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full sm:max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Ambient Background Glow Accent */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {sent ? (
                /* ─── SUCCESS STATE ────────────────────────── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.25 }}
                  className="relative p-8 text-center flex flex-col items-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 300,
                      delay: 0.1,
                    }}
                    className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-5 backdrop-blur-xl shadow-inner"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border border-emerald-500/40"
                    />
                  </motion.div>

                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                    Application Sent!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xs leading-relaxed">
                    Your message has been delivered to{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {job.poster.name}
                    </span>
                    . You can track progress on your{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Applications
                    </span>{' '}
                    page.
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="w-full mt-7 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 border border-white/20"
                  >
                    Done
                  </motion.button>
                </motion.div>
              ) : (
                /* ─── FORM STATE ───────────────────────────── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <MessageSquare className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-none">
                          Apply for Position
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Direct message to job poster
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Poster Info Card */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md">
                      <Avatar
                        name={job.poster.name}
                        avatar={job.poster.avatar}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {job.poster.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {job.poster.title || 'Recruiter'} · {job.poster.company}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Position Tag */}
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/40 dark:border-blue-800/40 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Position:
                      </span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300 truncate max-w-[220px]">
                        {job.title}
                      </span>
                    </div>

                    {/* Textarea Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Cover Note
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 backdrop-blur-md resize-none transition-all placeholder:text-slate-400"
                        placeholder="Write a personalized note introducing yourself..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 border border-white/20"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Application...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Message & Apply</span>
                          </>
                        )}
                      </motion.button>

                      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal">
                        This starts a direct messaging thread and adds the role to your active applications.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}