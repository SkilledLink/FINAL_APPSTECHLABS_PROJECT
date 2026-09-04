import React, { useState } from 'react';
import type { AnalyticsData } from '../types/dashboard.types';
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
  DollarSign,
  Users,
  Briefcase,
  ClipboardList,
} from 'lucide-react';

interface AnalyticsChartProps {
  data: AnalyticsData;
}

type ChartType = 'views' | 'requests' | 'jobs' | 'earnings';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
  title: string;
  format: (value: number) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  title,
  format,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-slate-900">
          {label}
        </p>

        <p className="text-sm text-slate-600">
          {title}: {format(Number(payload[0].value))}
        </p>
      </div>
    );
  }

  return null;
};

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
}) => {
  const [activeChart, setActiveChart] =
    useState<ChartType>('views');

  const chartData = {
    views: {
      data: data.viewsData,
      title: 'Profile Views',
      icon: <Users className="w-4 h-4" />,
      color: '#2563EB',
      format: (value: number) => value.toString(),
    },

    requests: {
      data: data.requestsData,
      title: 'Service Requests',
      icon: <ClipboardList className="w-4 h-4" />,
      color: '#64748B',
      format: (value: number) => value.toString(),
    },

    jobs: {
      data: data.jobsData,
      title: 'Jobs Completed',
      icon: <Briefcase className="w-4 h-4" />,
      color: '#10B981',
      format: (value: number) => value.toString(),
    },

    earnings: {
      data: data.earningsData,
      title: 'Earnings (CFA)',
      icon: <DollarSign className="w-4 h-4" />,
      color: '#F59E0B',
      format: (value: number) =>
        `${(value * 1000).toLocaleString()} CFA`,
    },
  };

  const currentData = chartData[activeChart];

  const normalizedData = currentData.data.map((item) => ({
    date: item.date,
    count: 'amount' in item ? item.amount : item.count,
  }));

  const chartButtons: {
    key: ChartType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'views',
      label: 'Views',
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: 'requests',
      label: 'Requests',
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      key: 'jobs',
      label: 'Jobs',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      key: 'earnings',
      label: 'Earnings',
      icon: <DollarSign className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Analytics Overview
        </h3>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {chartButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveChart(btn.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                activeChart === btn.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px] sm:h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={normalizedData}>
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
                  return `${(value * 1000).toLocaleString()} CFA`;
                }

                return value.toString();
              }}
            />

            <Tooltip
              content={
                <CustomTooltip
                  title={currentData.title}
                  format={currentData.format}
                />
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="count"
              stroke={currentData.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
