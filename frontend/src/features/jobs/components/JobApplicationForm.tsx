import { Send, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import type { Job } from '../types/job.types';
import { useJobs } from '../hooks/useJobs';
import Avatar from './Avatar';

interface JobApplicationFormProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

const PRESET_MESSAGE = 'Hello, I saw the job you posted, I am interested for this job';

export default function JobApplicationForm({ job, open, onClose }: JobApplicationFormProps) {
  const { applyToJob } = useJobs();
  const [message, setMessage] = useState(PRESET_MESSAGE);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up sm:animate-scale-in overflow-hidden">
        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-ink-900">Message sent!</h3>
            <p className="text-sm text-ink-500 mt-2 max-w-xs mx-auto">
              Your message has been sent to {job.poster.name}. You can track this application in your My Applications page.
            </p>
            <button onClick={handleClose} className="btn-primary w-full mt-6">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-brand-500" />
                <h3 className="font-display font-bold text-ink-900">Message the poster</h3>
              </div>
              <button onClick={handleClose} className="text-ink-400 hover:text-ink-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50 mb-4">
                <Avatar name={job.poster.name} avatar={job.poster.avatar} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-ink-900 truncate">{job.poster.name}</p>
                  <p className="text-xs text-ink-500 truncate">{job.poster.title} · {job.poster.company}</p>
                </div>
              </div>

              <div className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">
                About: {job.title}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="input resize-none text-sm"
                placeholder="Write your message..."
              />

              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="btn-primary w-full mt-4"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
              <p className="text-xs text-ink-400 text-center mt-3">
                This will start a conversation and add the job to your applications.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
