// src/features/profile/components/ProfileWorkTab.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FolderOpen, Loader2 } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ServiceQuickView } from './ServiceQuickView';
import { usePublicPortfolio } from '../../portfolio/hooks/usePortfolio';
import type { UserProfile } from '../types/profile.types';

interface ProfileWorkTabProps {
  profile: UserProfile;
  onRequestService?: () => void;
  onViewAllServices?: () => void;
}

export const ProfileWorkTab: React.FC<ProfileWorkTabProps> = ({
  profile,
  onRequestService,
  onViewAllServices,
}) => {
  // Fetch the professional's real portfolio (services, works, availability).
  // This is the same source the Portfolio Studio dashboard reads from,
  // so any work added there shows up here automatically.
  const { data, loading } = usePublicPortfolio(profile.id);

  const works = data?.works ?? [];

  if (!profile.professional) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* ── Left: featured projects ─────────────────────── */}
      <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">
              Featured Projects
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Before &amp; after transformations.
            </p>
          </div>

          {works.length > 0 && (
            <Link
              to={`/home/portfolio/${profile.id}`}
              className="hidden sm:inline-flex items-center gap-1 text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              View full portfolio
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-800 py-14 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-medium">Loading projects…</span>
          </div>
        ) : works.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-800 px-6 py-12 text-center">
            <FolderOpen className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
            <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              No projects yet
            </h4>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {profile.professional?.profession
                ? `When this ${profile.professional.profession.toLowerCase()} adds work to their portfolio, you'll see it here.`
                : "This professional hasn't shared any work yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {works.map((work) => (
              <BeforeAfterSlider
                key={work.id}
                title={work.title}
                subtitle={work.description ?? undefined}
                beforeImage={work.before_image_url ?? undefined}
                afterImage={work.after_image_url ?? undefined}
              />
            ))}
          </div>
        )}

        {works.length > 0 && (
          <div className="pt-1 sm:hidden">
            <Link
              to={`/home/portfolio/${profile.id}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:text-indigo-400"
            >
              View full portfolio
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Right: services ─────────────────────────────── */}
      <div className="order-1 lg:order-2">
        <ServiceQuickView
          profile={profile}
          onRequestService={onRequestService}
          onViewAllServices={onViewAllServices}
        />
      </div>
    </div>
  );
};

export default ProfileWorkTab;