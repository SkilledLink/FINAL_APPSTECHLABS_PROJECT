import React from 'react';
import type { ServiceRequest } from '../types/dashboard.types';
import { Clock, CheckCircle, XCircle, AlertCircle, MapPin, MoreVertical, DollarSign } from 'lucide-react';

interface RecentRequestsProps {
  requests: ServiceRequest[];
  onStatusUpdate?: (requestId: string, status: string) => void;
}

const StatusBadge: React.FC<{ status: ServiceRequest['status'] }> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    'in-progress': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
    declined: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Declined' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const UrgencyBadge: React.FC<{ urgency: ServiceRequest['urgency'] }> = ({ urgency }) => {
  if (!urgency) return null;
  
  const config = {
    high: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
    medium: { color: 'bg-orange-100 text-orange-800', label: 'Medium' },
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' }
  };

  const config_ = config[urgency];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config_.color}`}>
      {config_.label}
    </span>
  );
};

export const RecentRequests: React.FC<RecentRequestsProps> = ({ requests, onStatusUpdate }) => {
  const handleStatusChange = (requestId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(requestId, newStatus);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Service Requests</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {requests.map((request) => (
          <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {request.client.avatar ? (
                  <img
                    src={request.client.avatar}
                    alt={request.client.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {request.client.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-medium text-gray-900">{request.client.name}</h4>
                    <StatusBadge status={request.status} />
                    {request.urgency && <UrgencyBadge urgency={request.urgency} />}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{request.service}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {request.client.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(request.date).toLocaleDateString('en-CM', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {request.price && (
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <DollarSign className="w-3.5 h-3.5" />
                        {request.price.toLocaleString()} CFA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleStatusChange(request.id, 'in-progress')}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(request.id, 'declined')}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};