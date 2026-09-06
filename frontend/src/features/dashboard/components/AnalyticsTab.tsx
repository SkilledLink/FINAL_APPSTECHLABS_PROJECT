import React from 'react';
import {
  Eye,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Users,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import type { AnalyticsData, DashboardStats } from '../types/dashboard.types';

interface AnalyticsTabProps {
  stats: DashboardStats;
  analytics: AnalyticsData;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats, analytics }) => {
  const summaryCards = [
    {
      title: 'Profile Views',
      value: stats.profileViews.toLocaleString(),
      icon: Eye,
      color: 'blue',
      trend: '+12.5%',
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      color: 'green',
      trend: '+3.2%',
    },
    {
      title: 'Total Earnings',
      value: `${stats.earnings.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'green',
      trend: '+18.7%',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: CheckCircle,
      color: 'purple',
      trend: '+2.1%',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 mt-1">Track your performance and growth</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 bg-${card.color}-50 rounded-xl`}>
                  <Icon size={20} className={`text-${card.color}-500`} />
                </div>
                <span className="text-xs font-medium text-green-600">{card.trend}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{card.value}</p>
              <p className="text-sm text-gray-500">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Views Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Views</h3>
          <div className="h-48 flex items-end gap-1">
            {analytics.views.slice(-7).map((data, index) => (
              <div
                key={index}
                className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                style={{
                  height: `${(data.count / Math.max(...analytics.views.map(v => v.count))) * 100}%`,
                }}
              >
                <div className="text-center text-xs text-gray-500 mt-1">
                  {new Date(data.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Earnings (FCFA)</h3>
          <div className="h-48 flex items-end gap-1">
            {analytics.earnings.slice(-7).map((data, index) => (
              <div
                key={index}
                className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-all"
                style={{
                  height: `${(data.amount / Math.max(...analytics.earnings.map(e => e.amount))) * 100}%`,
                }}
              >
                <div className="text-center text-xs text-gray-500 mt-1">
                  {new Date(data.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Services</h3>
          <div className="space-y-3">
            {analytics.topServices.map((service, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{service.name}</span>
                  <span className="text-gray-500">{service.count} requests</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${(service.count / analytics.topServices[0].count) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {analytics.ratings.map((rating) => (
              <div key={rating.rating}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{rating.rating} ★</span>
                  </div>
                  <span className="text-gray-500">{rating.count} reviews</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{
                      width: `${(rating.count / Math.max(...analytics.ratings.map(r => r.count))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;