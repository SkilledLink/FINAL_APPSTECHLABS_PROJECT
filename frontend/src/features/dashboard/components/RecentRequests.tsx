import React from 'react';
import type { ServiceRequest } from '../types/dashboard.types';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  DollarSign,
} from 'lucide-react';

interface RecentRequestsProps {
  requests: ServiceRequest[];
  onStatusUpdate?: (requestId: string, status: string) => void;
}

const StatusBadge: React.FC<{
  status: ServiceRequest['status'];
}> = ({ status }) => {
  const statusConfig = {
    pending: {
      color: 'bg-amber-50 text-amber-700',
      icon: Clock,
      label: 'Pending',
    },
    'in-progress': {
      color: 'bg-blue-50 text-blue-700',
      icon: AlertCircle,
      label: 'In Progress',
    },
    completed: {
      color: 'bg-emerald-50 text-emerald-700',
      icon: CheckCircle,
      label: 'Completed',
    },
    declined: {
      color: 'bg-red-50 text-red-700',
      icon: XCircle,
      label: 'Declined',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {config.label}
    </span>
  );
};

const UrgencyBadge: React.FC<{
  urgency: ServiceRequest['urgency'];
}> = ({ urgency }) => {
  if (!urgency) return null;

  const config = {
    high: {
      color: 'bg-red-50 text-red-700',
      label: 'Urgent',
    },
    medium: {
      color: 'bg-amber-50 text-amber-700',
      label: 'Medium',
    },
    low: {
      color: 'bg-slate-100 text-slate-700',
      label: 'Low',
    },
  };

  const config_ = config[urgency];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config_.color}`}
    >
      {config_.label}
    </span>
  );
};

export const RecentRequests: React.FC<RecentRequestsProps> = ({
  requests,
  onStatusUpdate,
}) => {
  const handleStatusChange = (
    requestId: string,
    newStatus: string
  ) => {
    if (onStatusUpdate) {
      onStatusUpdate(requestId, newStatus);
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 text-lg font-semibold text-slate-900">
            Recent Service Requests
          </h3>

          <button
            type="button"
            className="shrink-0 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            View All
          </button>
        </div>
      </div>

      {/* Requests */}
      <div className="divide-y divide-slate-100">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-4 transition-colors duration-150 hover:bg-slate-50 sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Client + Request Details */}
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                {request.client.avatar ? (
                  <img
                    src={request.client.avatar}
                    alt={request.client.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                    {request.client.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {/* Name + Status */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h4 className="break-words font-medium text-slate-900">
                      {request.client.name}
                    </h4>

                    <StatusBadge status={request.status} />

                    {request.urgency && (
                      <UrgencyBadge
                        urgency={request.urgency}
                      />
                    )}
                  </div>

                  {/* Service */}
                  <p className="mt-1 break-words text-sm font-medium text-slate-700">
                    {request.service}
                  </p>

                  {/* Description */}
                  <p className="mt-1 line-clamp-2 break-words text-sm text-slate-600">
                    {request.description}
                  </p>

                  {/* Metadata */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="flex min-w-0 items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="break-words">
                        {request.client.location}
                      </span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />

                      {new Date(
                        request.date
                      ).toLocaleDateString('en-CM', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {request.price && (
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />

                        {request.price.toLocaleString()} CFA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {request.status === 'pending' && (
                <div className="flex w-full gap-2 lg:ml-4 lg:w-auto lg:shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        request.id,
                        'in-progress'
                      )
                    }
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 lg:flex-none"
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        request.id,
                        'declined'
                      )
                    }
                    className="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 lg:flex-none"
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
