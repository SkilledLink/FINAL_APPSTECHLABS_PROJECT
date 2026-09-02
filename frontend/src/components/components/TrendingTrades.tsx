// components/TrendingTrades.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { TrendingTrade } from '../../types/home';

interface TrendingTradesProps {
  trades: TrendingTrade[];
}

const TrendingTrades: React.FC<TrendingTradesProps> = ({ trades }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-orange-500" />
        Trending Trades
      </h3>
      <div className="space-y-2">
        {trades.map((trade) => (
          <div 
            key={trade.id}
            className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="text-lg">{trade.icon}</span>
            <span className="text-sm font-medium text-gray-700">{trade.name}</span>
            <span className="ml-auto text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Trending
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTrades;