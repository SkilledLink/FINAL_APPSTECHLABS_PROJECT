import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
} from 'lucide-react';
import type { Job } from '../types/dashboard.types';

interface JobsTabProps {
  jobs: Job[];
}

const JobsTab: React.FC<JobsTabProps> = ({ jobs }) => {
  const [filter, setFilter] = useState<'all' | 'applied' | 'shortlisted' | 'interviewing' | 'rejected'>(
    'all'
  );

  const filteredJobs = jobs.filter((j) => filter === 'all' || j.status === filter);

  const getStatusColor = (status: string) => {
    const colors = {
      applied: 'bg-yellow-100 text-yellow-700',
      shortlisted: 'bg-blue-100 text-blue-700',
      interviewing: 'bg-purple-100 text-purple-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      applied: <Clock size={16} />,
      shortlisted: <UserCheck size={16} />,
      interviewing: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
    };
    return icons[status as keyof typeof icons] || null;
  };

  const statusCounts = {
    all: jobs.length,
    applied: jobs.filter((j) => j.status === 'applied').length,
    shortlisted: jobs.filter((j) => j.status === 'shortlisted').length,
    interviewing: jobs.filter((j) => j.status === 'interviewing').length,
    rejected: jobs.filter((j) => j.status === 'rejected').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
        <p className="text-gray-500 mt-1">Track your job applications and opportunities</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`p-4 rounded-xl border-2 transition-all ${
              filter === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-sm text-gray-500 capitalize">{key}</p>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No {filter} jobs found</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left: Job Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm font-medium text-gray-600">{job.company}</p>

                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Posted: {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} />
                      {job.type.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">{job.description}</p>
                </div>

                {/* Right: Status */}
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {getStatusIcon(job.status)}
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>

                  {job.status !== 'rejected' && (
                    <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobsTab;