import { Star, MapPin, BadgeCheck, Clock, DollarSign, Briefcase } from 'lucide-react';
import type { MatchRecommendation } from '../types/ai.types';

export function AIRecommendationCard({ rec }: { rec: MatchRecommendation }) {
  const isJob = rec.type === 'job';
  const profileHref = `/profile/${rec.id}`;

  return (
    <a
      href={`#${profileHref}`}
      className="block group text-left"
    >
      <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-teal-300 transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isJob ? (
                <Briefcase className="w-4 h-4 text-teal-600 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {rec.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-teal-700 transition-colors">
                  {isJob ? rec.title : rec.name}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  {isJob ? `Posted by ${rec.name}` : rec.trade}
                </p>
              </div>
            </div>
          </div>
          {rec.isVerified && (
            <BadgeCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {rec.location}
          </span>
          {!isJob && (
            <>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {rec.rating} ({rec.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                {rec.hourlyRate}/hr
              </span>
              {rec.isAvailable ? (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Available
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  Busy
                </span>
              )}
            </>
          )}
          {isJob && rec.budget && rec.budget > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-slate-400" />
              Budget: ${rec.budget}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{rec.bio}</p>

        {rec.skills && rec.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {rec.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {isJob ? 'View posting' : 'View profile'}
          </span>
          <span className="text-xs font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform">
            View & Chat &rarr;
          </span>
        </div>
      </div>
    </a>
  );
}