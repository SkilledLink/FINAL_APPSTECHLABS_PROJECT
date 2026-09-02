import React, { useState } from 'react';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileWorkTab } from '../components/ProfileWorkTab';
import type { UserProfile, ProfileTab } from '../types/profile.types';

const MOCK_TRADE_PROFILE: UserProfile = {
  id: 'prof_001',
  userId: 'u_101',
  name: 'Alex Chen',
  tradeTitle: 'Master Electrician',
  email: 'alex.chen@tradecraft.com',
  role: 'PROFESSIONAL',
  avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',
  coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
  followersCount: '12.4K',
  yearsInTrade: 15,
  isVerified: true,
  rating: 4.9,
  reviewCount: 184,
  location: 'San Francisco, CA',
  bio: 'Specializing in residential panel upgrades, smart home integrations, EV charger setups, and commercial retrofitting.',
  services: [
    { id: 's1', name: 'Panel Upgrade', priceLabel: 'Starting at $1,200' },
    { id: 's2', name: 'EV Charger Install', priceLabel: 'Starting at $800' },
    {
      id: 's3',
      name: 'Emergency Repair',
      priceLabel: '$150/hr',
      responseNotice: 'Response within 1 Hr',
    },
    { id: 's4', name: 'Lighting Design', priceLabel: 'Custom Quote' },
  ],
  featuredProjects: [
    {
      id: 'p1',
      title: 'Kitchen Renovation Electrical',
      description: 'Kitchen renovation Electrical - before renovation on sensitive circuits.',
      beforeImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
      afterImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
    },
    {
      id: 'p2',
      title: 'Historic Building Safety Upgrade',
      description: 'Historic Building Safety Upgrade - knob and tube replacement.',
      beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
      afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
    },
  ],
};

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('work');

  return (
    <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4">
      <ProfileHeader
        profile={MOCK_TRADE_PROFILE}
        onFollow={() => alert('Followed Alex Chen')}
        onMessage={() => alert('Opening conversation with Alex Chen')}
        onRequestService={() => alert('Opening Service Request Dialog')}
      />

      <ProfileTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === 'work' && (
        <ProfileWorkTab
          profile={MOCK_TRADE_PROFILE}
          onRequestService={() => alert('Opening Service Request Dialog')}
          onViewAllServices={() => setActiveTab('services')}
        />
      )}

      {activeTab !== 'work' && (
        <div className="p-6 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl text-center text-slate-500 font-bold text-xs sm:text-base">
          {activeTab.toUpperCase()} Section Content
        </div>
      )}
    </div>
  );
};

export default ProfilePage;