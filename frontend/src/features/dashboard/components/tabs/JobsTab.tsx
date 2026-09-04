import React, { useState } from 'react';
import { Briefcase, Search, Filter, Plus, MapPin, Clock, DollarSign, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  client: string;
  location: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  budget: number;
  postedDate: string;
  deadline: string;
  description: string;
}

export const JobsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockJobs: Job[] = [
    {
      id: 1,
      title: 'Electrical Installation',
      client: 'Marie-Claire Ngo',
      location: 'Bonapriso, Douala',
      status: 'in-progress',
      budget: 250000,
      postedDate: '2026-09-01',
      deadline: '2026-09-15',
      description: 'Complete electrical wiring for a new 3-bedroom apartment'
    },
    {
      id: 2,
      title: 'Solar Panel Installation',
      client: 'Paul Ekambi',
      location: 'Bepanda, Douala',
      status: 'pending',
      budget: 850000,
      postedDate: '2026-09-02',
      deadline: '2026-09-20',
      description: 'Install 6 solar panels on residential roof'
    },
    {
      id: 3,
      title: 'Electrical Repairs',
      client: 'Fatima Aboubakar',
      location: 'Akwa, Douala',
      status: 'completed',
      budget: 75000,
      postedDate: '2026-08-25',
      deadline: '2026-08-30',
      description: 'Flickering lights in living room and kitchen'
    },
    {
      id: 4,
      title: 'Home Automation',
      client: 'David Tchoumi',
      location: 'Bonamoussadi, Douala',
      status: 'cancelled',
      budget: 450000,
      postedDate: '2026-08-20',
      deadline: '2026-09-05',
      description: 'Install smart home system including lighting control'
    }
  ];

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    'pending': <AlertCircle className="w-3.5 h-3.5" />,
    'in-progress': <Clock className="w-3.5 h-3.5" />,
    'completed': <CheckCircle className="w-3.5 h-3.5" />,
    'cancelled': <AlertCircle className="w-3.5 h-3.5" />
  };

  const filteredJobs = mockJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
          <p className="text-gray-600 mt-1">Manage all your job opportunities</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold text-blue-600">{mockJobs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Active Jobs</p>
          <p className="text-2xl font-bold text-green-600">{mockJobs.filter(j => j.status === 'in-progress' || j.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{mockJobs.filter(j => j.status === 'completed').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-2xl font-bold text-purple-600">1,625,000 CFA</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredJobs.map((job) => (
            <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{job.client}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.budget.toLocaleString()} CFA
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{job.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                    {statusIcons[job.status]}
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};