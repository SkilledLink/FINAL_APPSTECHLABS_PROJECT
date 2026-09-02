import React from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ServiceQuickView } from './ServiceQuickView';
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Mobile-First Order: Sidebar Quick View renders first on phone, main gallery follows */}
      <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
        <div>
          <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">
            Featured Projects & Case Studies
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
            Drag the interactive slider to view transformations before & after renovation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {profile.featuredProjects.map((project) => (
              <BeforeAfterSlider
                key={project.id}
                title={project.title}
                subtitle={project.description}
                beforeImage={project.beforeImage}
                afterImage={project.afterImage}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Service Sidebar Quick View */}
      <div className="order-1 lg:order-2">
        <ServiceQuickView
          services={profile.services}
          onRequestService={onRequestService}
          onViewAllServices={onViewAllServices}
        />
      </div>
    </div>
  );
};