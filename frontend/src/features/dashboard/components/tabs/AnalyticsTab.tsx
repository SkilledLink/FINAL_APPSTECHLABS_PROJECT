import React, { useState } from 'react';
import type { AnalyticsData } from '../../types/dashboard.types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Download,
  DollarSign,
  Users,
  Briefcase,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsTabProps {
  data: AnalyticsData;
}

type ChartType = 'views' | 'requests' | 'jobs' | 'earnings';
type TimeRange = '7days' | '30days' | '90days';

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  data,
}) => {
  const [activeChart, setActiveChart] =
    useState<ChartType>('views');

  const [timeRange, setTimeRange] =
    useState<TimeRange>('30days');

  const chartData = {
    views: {
      data: data.viewsData,
      title: 'Profile Views',
      icon: <Users className="w-4 h-4" />,
      color: '#2563EB',
      format: (value: number) => value.toString(),
      total: data.viewsData.reduce(
        (sum, d) => sum + d.count,
        0
      ),
      change: '+12.5%',
    },

    requests: {
      data: data.requestsData,
      title: 'Service Requests',
      icon: <ClipboardList className="w-4 h-4" />,
      color: '#64748B',
      format: (value: number) => value.toString(),
      total: data.requestsData.reduce(
        (sum, d) => sum + d.count,
        0
      ),
      change: '+8.3%',
    },

    jobs: {
      data: data.jobsData,
      title: 'Jobs Completed',
      icon: <Briefcase className="w-4 h-4" />,
      color: '#10B981',
      format: (value: number) => value.toString(),
      total: data.jobsData.reduce(
        (sum, d) => sum + d.count,
        0
      ),
      change: '+15.2%',
    },

    earnings: {
      data: data.earningsData,
      title: 'Earnings (CFA)',
      icon: <DollarSign className="w-4 h-4" />,
      color: '#F59E0B',
      format: (value: number) =>
        `${(value * 1000).toLocaleString()} CFA`,
      total:
        data.earningsData.reduce(
          (sum, d) => sum + d.amount,
          0
        ) * 1000,
      change: '+18.7%',
    },
  };

  const currentData = chartData[activeChart];

  const chartButtons: {
    key: ChartType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'views',
      label: 'Views',
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: 'requests',
      label: 'Requests',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      key: 'jobs',
      label: 'Jobs',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      key: 'earnings',
      label: 'Earnings',
      icon: <DollarSign className="w-5 h-5" />,
    },
  ];

  const timeRangeOptions: {
    key: TimeRange;
    label: string;
  }[] = [
    {
      key: '7days',
      label: '7 Days',
    },
    {
      key: '30days',
      label: '30 Days',
    },
    {
      key: '90days',
      label: '90 Days',
    },
  ];

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-slate-900">
            {label}
          </p>

          <p className="text-sm text-slate-600">
            {currentData.title}:{' '}
            {currentData.format(payload[0].value)}
          </p>
        </div>
      );
    }

    return null;
  };

  const getFilteredData = () => {
    const allData = currentData.data;

    const days =
      timeRange === '7days'
        ? 7
        : timeRange === '30days'
          ? 30
          : 90;

    return allData.slice(-days);
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Analytics
          </h2>

          <p className="text-slate-600 mt-1">
            Track your performance and growth metrics
          </p>
        </div>

        <div className="flex w-full sm:w-auto">
          <button
            type="button"
            aria-label="Export analytics"
            title="Export analytics"
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 min-w-0">
          <p className="text-sm text-slate-600">
            Total Views
          </p>

          <p className="text-xl font-bold text-blue-600 mt-1">
            {chartData.views.total.toLocaleString()}
          </p>

          <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            {chartData.views.change}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 min-w-0">
          <p className="text-sm text-slate-600">
            Total Requests
          </p>

          <p className="text-xl font-bold text-slate-600 mt-1">
            {chartData.requests.total}
          </p>

          <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            {chartData.requests.change}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 min-w-0">
          <p className="text-sm text-slate-600">
            Total Jobs
          </p>

          <p className="text-xl font-bold text-emerald-600 mt-1">
            {chartData.jobs.total}
          </p>

          <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            {chartData.jobs.change}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 min-w-0">
          <p className="text-sm text-slate-600">
            Total Earnings
          </p>

          <p className="text-xl font-bold text-amber-600 mt-1 break-words">
            {chartData.earnings.total.toLocaleString()} CFA
          </p>

          <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            {chartData.earnings.change}
          </span>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 w-full min-w-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* Chart Type Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {chartButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => setActiveChart(btn.key)}
                aria-label={btn.label}
                title={btn.label}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
                  activeChart === btn.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Time Range */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {timeRangeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTimeRange(opt.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === opt.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[260px] sm:h-[350px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 12,
                  fill: '#64748B',
                }}
                axisLine={{
                  stroke: '#CBD5E1',
                }}
                tickLine={{
                  stroke: '#CBD5E1',
                }}
                tickFormatter={(value) => {
                  const date = new Date(value);

                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fill: '#64748B',
                }}
                axisLine={{
                  stroke: '#CBD5E1',
                }}
                tickLine={{
                  stroke: '#CBD5E1',
                }}
                tickFormatter={(value) => {
                  if (activeChart === 'earnings') {
                    return `${(
                      value * 1000
                    ).toLocaleString()} CFA`;
                  }

                  return value.toString();
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey={
                  activeChart === 'earnings'
                    ? 'amount'
                    : 'count'
                }
                stroke={currentData.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
        {/* Top Performing Services */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />

            <h4 className="font-medium text-slate-900">
              Top Performing Services
            </h4>
          </div>

          <div className="space-y-3">
            {[
              {
                name: 'Electrical Installation',
                requests: 24,
                growth: '+18%',
              },
              {
                name: 'Solar Panel Installation',
                requests: 18,
                growth: '+12%',
              },
              {
                name: 'Electrical Repairs',
                requests: 14,
                growth: '+8%',
              },
            ].map((service, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <span className="text-sm text-slate-700 min-w-0 break-words">
                  {service.name}
                </span>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium text-slate-900">
                    {service.requests} requests
                  </span>

                  <span className="text-xs text-emerald-600">
                    {service.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Engagement Hours */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />

            <h4 className="font-medium text-slate-900">
              Peak Engagement Hours
            </h4>
          </div>

          <div className="space-y-3">
            {[
              {
                time: '7:00 PM - 9:00 PM',
                engagement: 'High',
                percentage: 85,
              },
              {
                time: '12:00 PM - 2:00 PM',
                engagement: 'Medium',
                percentage: 65,
              },
              {
                time: '9:00 AM - 11:00 AM',
                engagement: 'Medium',
                percentage: 55,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="space-y-1"
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-700 min-w-0">
                    {item.time}
                  </span>

                  <span className="font-medium text-slate-900 shrink-0">
                    {item.engagement}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 rounded-full h-2 transition-all"
                    style={{
                      width: `${item.percentage}%`,
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
