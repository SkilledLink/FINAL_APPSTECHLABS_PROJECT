import { ArrowLeft, Send, MapPin, CheckCircle2, Eye, MessageSquare, Clock } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { formatDate, timeAgo } from '../utils/format';
import Avatar from '../components/Avatar';

interface MyApplicationsPageProps {
  onBack: () => void;
}

export default function MyApplicationsPage({ onBack }: MyApplicationsPageProps) {
  const { applications } = useJobs();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={onBack} className="btn-ghost mb-6 -ml-3">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900">My Applications</h1>
        <p className="text-ink-500 mt-2">Track the jobs you've applied to and your conversation status.</p>
      </div>

      {applications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-ink-400" />
          </div>
          <h3 className="font-display font-bold text-lg text-ink-800">No applications yet</h3>
          <p className="text-sm text-ink-500 mt-1 max-w-sm mx-auto">
            When you apply to a job, it will appear here so you can track your conversations with employers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="card p-5 hover:shadow-card-hover transition-shadow animate-fade-in">
              <div className="flex items-start gap-4">
                <Avatar name={app.posterName} avatar={app.posterAvatar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-ink-900 truncate">{app.jobTitle}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-ink-500 flex-wrap">
                    <span className="font-medium text-ink-700">{app.company}</span>
                    <span className="text-ink-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {app.location}
                    </span>
                    <span className="text-ink-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {timeAgo(app.appliedAt)}
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl bg-ink-50 px-3.5 py-3 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-ink-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-ink-600 italic">"{app.message}"</p>
                  </div>

                  <div className="text-xs text-ink-400 mt-2">
                    Applied on {formatDate(app.appliedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'sent' | 'viewed' | 'replied' }) {
  const config = {
    sent: { icon: <CheckCircle2 className="w-3 h-3" />, label: 'Sent', class: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    viewed: { icon: <Eye className="w-3 h-3" />, label: 'Viewed', class: 'bg-accent-50 text-accent-700 ring-1 ring-accent-200' },
    replied: { icon: <MessageSquare className="w-3 h-3" />, label: 'Replied', class: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' },
  };
  const c = config[status];
  return (
    <span className={`badge ${c.class}`}>
      {c.icon} {c.label}
    </span>
  );
}
