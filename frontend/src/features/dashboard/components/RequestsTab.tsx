import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  MapPin,
  DollarSign,
  Calendar,
} from 'lucide-react';
import type { Request } from '../types/dashboard.types';

interface RequestsTabProps {
  requests: Request[];
  onUpdateStatus: (requestId: string, status: Request['status']) => void;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ requests, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'declined'>(
    'all'
  );

  const filteredRequests = requests.filter((r) => filter === 'all' || r.status === filter);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      accepted: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      declined: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock size={16} />,
      accepted: <CheckCircle size={16} />,
      completed: <CheckCircle size={16} />,
      declined: <XCircle size={16} />,
    };
    return icons[status as keyof typeof icons] || null;
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    declined: requests.filter((r) => r.status === 'declined').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
        <p className="text-gray-500 mt-1">Manage incoming service requests from clients</p>
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No {filter} requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left: Client Info */}
                <div className="flex gap-4">
                  <img
                    src={request.clientAvatar}
                    alt={request.clientName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.clientName}</h3>
                    <p className="text-sm text-gray-500">{request.service}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {request.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(request.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {request.budget.toLocaleString()} FCFA
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>

                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(request.id, 'accepted')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => onUpdateStatus(request.id, 'declined')}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <XCircle size={16} />
                          Decline
                        </button>
                      </>
                    )}
                    {request.status === 'accepted' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(request.id, 'completed')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={16} />
                          Mark Complete
                        </button>
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                          <MessageCircle size={16} />
                          Message
                        </button>
                      </>
                    )}
                    {request.status === 'completed' && (
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                        <MessageCircle size={16} />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestsTab;