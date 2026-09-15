import React, { useMemo, useState } from 'react';
import { Trash2, Loader2, Inbox, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useJobs } from '../../hooks/useJobs';
import type { AdminJob } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';

const Loader: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 size={28} className="animate-spin text-blue-500" />
  </div>
);

const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900">{title}</p>
    {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
  </div>
);

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...',
}) => (
  <div className="relative w-full max-w-sm">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200 capitalize">
    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
    {status.replace(/_/g, ' ')}
  </span>
);

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const JobsTab: React.FC = () => {
  const { jobs, loading, error, remove } = useJobs();
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  const filtered = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(query.toLowerCase()) ||
          j.description.toLowerCase().includes(query.toLowerCase()),
      ),
    [jobs, query],
  );

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Failed to load jobs" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
        <p className="text-gray-500 mt-1">Monitor all jobs posted across the platform</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by title or description..." />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No jobs found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((j: AdminJob) => (
                  <tr key={j.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{j.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{j.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <img src={j.client.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-sm">{j.client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={j.status} /></td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(j.postedDate), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          setPrompt({
                            title: 'Remove job',
                            description: j.title,
                            submitLabel: 'Remove',
                            onConfirm: async (reason) => {
                              await remove(j.id, reason);
                              toast.success('Job removed');
                            },
                          })
                        }
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {prompt && (
        <ReasonPrompt
          title={prompt.title}
          description={prompt.description}
          submitLabel={prompt.submitLabel}
          onSubmit={async (reason) => {
            await prompt.onConfirm(reason);
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />
      )}
    </div>
  );
};

export default JobsTab;