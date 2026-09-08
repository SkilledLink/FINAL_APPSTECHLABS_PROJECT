import React from "react";
import { Briefcase, MapPin } from "lucide-react";
import type { OpportunityItem } from "../types/discover";

interface LatestOpportunitiesSectionProps {
  opportunities: OpportunityItem[];
}

export const LatestOpportunitiesSection: React.FC<LatestOpportunitiesSectionProps> = ({ opportunities }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase size={22} className="text-blue-500" /> Latest Opportunities
        </h2>
        <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          View all →
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="min-w-[240px] max-w-[240px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 flex flex-col hover:shadow-md transition-all shrink-0"
          >
            <div className="flex items-start gap-3 mb-3">
              <img
                src={opp.image}
                alt={opp.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {opp.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin size={12} />
                  <span>{opp.location}</span>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                  {opp.rateOrBudget}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 mt-auto">
              <span className="text-[10px] text-slate-400">{opp.postedTime}</span>
              <button className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};