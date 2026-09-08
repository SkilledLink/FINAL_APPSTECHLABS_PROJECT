import React from "react";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import type { TopProfessional } from "../types/discover";

interface TopProfessionalsSectionProps {
  professionals: TopProfessional[];
}

export const TopProfessionalsSection: React.FC<TopProfessionalsSectionProps> = ({ professionals }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <MapPin size={22} className="text-blue-500" /> Top Near You
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {professionals.slice(0, 8).map((pro) => (
          <div
            key={pro.id}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 text-center flex flex-col items-center hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="relative mb-3">
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
              />
              {pro.isVerified && (
                <CheckCircle2 size={18} className="absolute bottom-0 right-0 text-blue-500 bg-white dark:bg-slate-800 rounded-full" />
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate w-full">
              {pro.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">{pro.title}</p>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
              <Star size={12} className="fill-amber-400" />
              <span>{pro.rating}</span>
              <span className="text-slate-400 font-normal">({pro.reviewCount})</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mt-1">
              {pro.distance}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};