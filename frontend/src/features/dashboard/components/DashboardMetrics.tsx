import React from 'react';
import type { DashboardStats } from '../../../types';
import { Users, ClipboardList, CheckCircle, Star } from 'lucide-react';
import Card from '../../../components/ui/Card/Card';

interface DashboardMetricsProps {
  stats: DashboardStats;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ stats }) => {
  const metrics = [
    {
      label: 'Total Clients',
      value: stats.totalClients.toLocaleString(),
      change: stats.totalClientsChange,
      icon: Users,
      changeLabel: 'this month'
    },
    {
      label: 'Active Requests',
      value: stats.activeRequests,
      change: stats.activeRequestsChange,
      icon: ClipboardList,
      changeLabel: 'this month'
    },
    {
      label: 'Completed Jobs',
      value: stats.completedJobs,
      change: stats.completedJobsChange,
      icon: CheckCircle,
      changeLabel: 'this month'
    },
    {
      label: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      change: stats.averageRatingChange,
      icon: Star,
      changeLabel: 'this month',
      suffix: ' ★'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.change >= 0;
        
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                    {metric.suffix && <span className="text-xl ml-1">{metric.suffix}</span>}
                  </p>
                </div>
                <div className="mt-2 flex items-center">
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(metric.change)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    {metric.changeLabel}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Icon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardMetrics;