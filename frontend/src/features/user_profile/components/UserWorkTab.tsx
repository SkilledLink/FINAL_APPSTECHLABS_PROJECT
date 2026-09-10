// src/features/user_profile/components/UserWorkTab.tsx

import React from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { UserServiceQuickView } from './UserServiceQuickView';
import type { UserProfile } from '../types/user.types';

// Static portfolio projects (placeholder data).
const mockPortfolioProjects = [
  {
    id: 'p1',
    title: 'Kitchen Renovation',
    description: 'Custom cabinetry and trim work.',
    beforeImage:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
    afterImage:
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
  },
  {
    id: 'p2',
    title: 'Architectural Trim',
    description: 'Historic building restoration.',
    beforeImage:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
    afterImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  },
];

interface UserWorkTabProps {
  profile: UserProfile;
  onRequestService?: () => void;
  onViewAllServices?: () => void;
}

export const UserWorkTab: React.FC<UserWorkTabProps> = ({
  profile,
  onRequestService,
  onViewAllServices,
}) => {
  if (!profile.professional) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
        <div>
          <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">
            Featured Projects
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
            Before & after transformations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {mockPortfolioProjects.map((project) => (
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

      <div className="order-1 lg:order-2">
        <UserServiceQuickView
          profile={profile}
          onRequestService={onRequestService}
          onViewAllServices={onViewAllServices}
        />
      </div>
    </div>
  );
};