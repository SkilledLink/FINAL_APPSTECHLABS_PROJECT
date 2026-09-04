import React, { useState } from 'react';
import type { AIInsight } from '../../types/dashboard.types';
import { AIInsights } from '../AIInsights';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Lightbulb, 
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';

interface InsightsTabProps {
  insights: AIInsight[];
}

type InsightCategory = 'all' | 'profile' | 'services' | 'pricing' | 'content' | 'timing' | 'growth';

export const InsightsTab: React.FC<InsightsTabProps> = ({ insights }) => {
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const highPriority = insights.filter(i => i.priority === 'high');
  const mediumPriority = insights.filter(i => i.priority === 'medium');

  const categories: { key: InsightCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'profile', label: 'Profile', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'services', label: 'Services', icon: <Zap className="w-4 h-4" /> },
    { key: 'pricing', label: 'Pricing', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'content', label: 'Content', icon: <Lightbulb className="w-4 h-4" /> },
    { key: 'timing', label: 'Timing', icon: <AlertCircle className="w-4 h-4" /> },
    { key: 'growth', label: 'Growth', icon: <Sparkles className="w-4 h-4" /> }
  ];

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(i => i.type === selectedCategory);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
          <p className="text-gray-600 mt-1">Personalized recommendations to grow your professional presence</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Insights
        </button>
      </div>

      {/* Priority Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">High Priority</p>
              <p className="text-2xl font-bold text-red-900">{highPriority.length} insights</p>
              <p className="text-sm text-red-700 mt-1">Take action now for best results</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Medium Priority</p>
              <p className="text-2xl font-bold text-yellow-900">{mediumPriority.length} insights</p>
              <p className="text-sm text-yellow-700 mt-1">Plan for future growth</p>
            </div>
            <Lightbulb className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <Filter className="w-4 h-4 text-gray-400 mr-2 self-center" />
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <AIInsights insights={filteredInsights} />

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Profile Completeness</p>
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">75%</span>
              <span className="text-sm text-green-600">+5% this week</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 rounded-full h-2" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Engagement Rate</p>
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">68%</span>
              <span className="text-sm text-green-600">+8% this month</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-600 rounded-full h-2" style={{ width: '68%' }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Response Time</p>
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">2.4 hrs</span>
              <span className="text-sm text-green-600">-15% faster</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 rounded-full h-2" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};