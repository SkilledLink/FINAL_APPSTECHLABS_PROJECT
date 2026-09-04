import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import type { TrendingTrade } from '../../types/home';

interface TrendingTradesProps {
  trades: TrendingTrade[];
}

const TrendingTrades: React.FC<TrendingTradesProps> = ({ trades }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm transition-colors duration-300">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        Trending Trades
      </h3>

      <div className="space-y-2">
        {trades && trades.length > 0 ? (
          trades.map((trade, index) => {
            const id = trade.id || `trade-${index}`;
            const name = trade.name || (trade as any).title || (trade as any).label || 'Specialty';
            const icon = trade.icon || '🛠️';
            const metric = (trade as any).count || (trade as any).postsCount || (trade as any).growth;

            return (
              <div 
                key={id}
                className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 rounded-xl px-3.5 py-2.5 transition-all duration-200 cursor-pointer group"
              >
                <span className="text-lg shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {icon}
                </span>

                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {name}
                </span>

                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  {metric && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {metric}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 text-amber-500" />
                    Trending
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">No trending trades available.</p>
        )}
      </div>
    </div>
  );
};

export default TrendingTrades;