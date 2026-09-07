// src/features/profile/pages/ProfilePage.tsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileAbout } from '../components/ProfileAbout';
import { ProfileSkills } from '../components/ProfileSkills';
import { ProfileExperience } from '../components/ProfileExperience';
import { ProfileWorkTab } from '../components/ProfileWorkTab';
import { EditProfileForm } from '../components/EditProfileForm';
import { ProfessionalOnboardingModal } from './ProfessionalOnboardingModal';
import { useAuth } from '../../../providers/AuthProvider';
import type { ProfileTab } from '../types/profile.types';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, updateUser } = useAuth();

  // Use the ID from the URL, or fallback to the current user's ID
  const userId = id || currentUser?.id;

  const { profile, loading, error, updateProfile } = useProfile(userId || '');
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Handle loading / error / missing user
  if (!userId) {
    return <div className="p-8 text-center text-red-500">No user ID provided.</div>;
  }

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

  const isOwnProfile = currentUser?.id === profile.id;
  const isProfessional = profile.accountType === 'professional';

  const handleSaveProfile = async (data: Partial<typeof profile>) => {
    const updated = await updateProfile(data);
    if (updated && isOwnProfile) {
      updateUser(updated);
    }
    setIsEditing(false);
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    // Re‑fetch the profile after upgrade (the hook will update automatically if we force a refetch)
    // Since we're using the same profileId, we can just trigger a reload by changing a key or simply
    // call updateProfile with empty data to trigger a re‑fetch? Better: we can update the local profile state.
    // The upgrade service already updates the mock and returns the updated user.
    // We can call updateProfile again or just manually set the profile.
    // For simplicity, we'll reload the page (as before) but we can also update via hook.
    window.location.reload();
  };

  return (
    <div className="w-full px-2.5 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onFollow={() => alert(`Follow ${profile.firstName}`)}
        onMessage={() => alert(`Message ${profile.firstName}`)}
        onRequestService={() => alert('Request service')}
        onUpgrade={() => setShowUpgradeModal(true)}
      />

      <ProfileTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isProfessional={isProfessional}
      />

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <ProfileAbout profile={profile} />
          <ProfileSkills profile={profile} isOwnProfile={isOwnProfile} />
          {isProfessional && <ProfileExperience profile={profile} />}
        </div>
      )}

      {activeTab === 'work' && isProfessional && (
        <ProfileWorkTab
          profile={profile}
          onRequestService={() => alert('Request service')}
          onViewAllServices={() => setActiveTab('services')}
        />
      )}

      {activeTab === 'services' && isProfessional && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">All Services</h3>
          <ul className="mt-4 space-y-2">
            {profile.professional?.services.map((service, idx) => (
              <li key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'reviews' && isProfessional && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Reviews</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {profile.professional?.totalReviews} reviews • Rating {profile.professional?.rating.toFixed(1)}
          </p>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Posts</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No posts yet.</p>
        </div>
      )}

      {isEditing && (
        <EditProfileForm
          profile={profile}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {showUpgradeModal && (
        <ProfessionalOnboardingModal
          userId={profile.id}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
};