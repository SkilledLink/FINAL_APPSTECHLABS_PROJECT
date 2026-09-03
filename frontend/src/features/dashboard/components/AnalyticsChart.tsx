import React, { useState } from 'react';
import type { AnalyticsData } from '../types/dashboard.types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Users, Briefcase, ClipboardList } from 'lucide-react';

interface AnalyticsChartProps {
  data: AnalyticsData;
}

type ChartType = 'views' | 'requests' | 'jobs' | 'earnings';

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('views');

  const chartData = {
    views: {
      data: data.viewsData,
      title: 'Profile Views',
      icon: <Users className="w-4 h-4" />,
      color: '#3B82F6',
      format: (value: number) => value.toString()
    },
    requests: {
      data: data.requestsData,
      title: 'Service Requests',
      icon: <ClipboardList className="w-4 h-4" />,
      color: '#8B5CF6',
      format: (value: number) => value.toString()
    },
    jobs: {
      data: data.jobsData,
      title: 'Jobs Completed',
      icon: <Briefcase className="w-4 h-4" />,
      color: '#10B981',
      format: (value: number) => value.toString()
    },
    earnings: {
      data: data.earningsData,
      title: 'Earnings (CFA)',
      icon: <DollarSign className="w-4 h-4" />,
      color: '#F59E0B',
      format: (value: number) => `${(value * 1000).toLocaleString()} CFA`
    }
  };

  const currentData = chartData[activeChart];

  const chartButtons: { key: ChartType; label: string; icon: React.ReactNode }[] = [
    { key: 'views', label: 'Views', icon: <Users className="w-4 h-4" /> },
    { key: 'requests', label: 'Requests', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'earnings', label: 'Earnings', icon: <DollarSign className="w-4 h-4" /> }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {currentData.title}: {currentData.format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
        <div className="flex flex-wrap gap-2">
          {chartButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveChart(btn.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                activeChart === btn.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (activeChart === 'earnings') {
                  return `${(value * 1000).toLocaleString()} CFA`;
                }
                return value.toString();
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={activeChart === 'earnings' ? 'amount' : 'count'}
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