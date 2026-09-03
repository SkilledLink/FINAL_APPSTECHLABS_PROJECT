import React from 'react';
import type { AIInsight } from '../types/dashboard.types';
import { Sparkles, ChevronRight, AlertCircle, Lightbulb, TrendingUp, Zap } from 'lucide-react';

interface AIInsightsProps {
  insights: AIInsight[];
}

const PriorityBadge: React.FC<{ priority: AIInsight['priority'] }> = ({ priority }) => {
  const config = {
    high: { color: 'bg-red-100 text-red-800', label: 'High Priority' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' }
  };

  const config_ = config[priority];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config_.color}`}>
      {config_.label}
    </span>
  );
};

const InsightIcon: React.FC<{ type: AIInsight['type'] }> = ({ type }) => {
  const icons = {
    profile: <Sparkles className="w-5 h-5 text-blue-600" />,
    services: <Zap className="w-5 h-5 text-purple-600" />,
    pricing: <TrendingUp className="w-5 h-5 text-green-600" />,
    content: <Lightbulb className="w-5 h-5 text-yellow-600" />,
    timing: <AlertCircle className="w-5 h-5 text-orange-600" />,
    growth: <Sparkles className="w-5 h-5 text-indigo-600" />
  };
  return icons[type] || <Lightbulb className="w-5 h-5 text-gray-600" />;
};

export const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h3>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <InsightIcon type={insight.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                  <PriorityBadge priority={insight.priority} />
                </div>
                {insight.action && (
                  <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    {insight.action}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};