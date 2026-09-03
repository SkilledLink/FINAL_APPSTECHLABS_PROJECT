import React from 'react';
import type { DashboardStats } from '../types/dashboard.types';
import { TrendingUp, TrendingDown, Users, ClipboardList, Briefcase, Star, Clock, Wallet } from 'lucide-react';

interface StatsCardProps {
  stats: DashboardStats;
}

const StatItem: React.FC<{
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, change, icon, color = 'text-blue-600' }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg bg-opacity-10 ${color} bg-current`}>
        {icon}
      </div>
      {change !== undefined && (
        <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  </div>
);

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const items = [
    {
      label: 'Profile Views',
      value: stats.profileViews.toLocaleString(),
      change: stats.profileViewsChange,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-600'
    },
    {
      label: 'Service Requests',
      value: stats.serviceRequests,
      change: stats.serviceRequestsChange,
      icon: <ClipboardList className="w-5 h-5 text-purple-600" />,
      color: 'text-purple-600'
    },
    {
      label: 'Jobs Completed',
      value: stats.jobsCompleted,
      change: stats.jobsCompletedChange,
      icon: <Briefcase className="w-5 h-5 text-green-600" />,
      color: 'text-green-600'
    },
    {
      label: 'Average Rating',
      value: `${stats.averageRating} ★`,
      change: stats.averageRatingChange,
      icon: <Star className="w-5 h-5 text-yellow-600" />,
      color: 'text-yellow-600'
    },
    {
      label: 'Response Rate',
      value: `${stats.responseRate}%`,
      change: stats.responseRateChange,
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
      color: 'text-indigo-600'
    },
    {
      label: 'Total Earnings',
      value: `CFA ${(stats.totalEarnings * 1000).toLocaleString()}`,
      change: stats.totalEarningsChange,
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <StatItem key={index} {...item} />
      ))}
    </div>
  );
};