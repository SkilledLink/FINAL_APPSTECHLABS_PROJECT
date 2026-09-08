// src/features/profile/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useProfessional } from '../hooks/useProfessional';
import { useFollow } from '../hooks/useFollow';
import { useProfileImage } from '../hooks/useProfileImage';
import { useAuth } from '../../../providers/AuthProvider';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileAbout } from '../components/ProfileAbout';
import { ProfileSkills } from '../components/ProfileSkills';
import { ProfileExperience } from '../components/ProfileExperience';
import { ProfileWorkTab } from '../components/ProfileWorkTab';
import { EditProfileForm } from '../components/EditProfileForm';
import { ProfessionalOnboardingModal } from './ProfessionalOnboardingModal';
import type { ProfileTab, UserProfile } from '../types/profile.types';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, updateUser } = useAuth();
  const { user, loading: userLoading, error: userError, fetchUser, updateUser: updateUserAPI } = useUser();
  const { professional, loading: profLoading, fetchMyProfessional, createProfessional, updateProfessional } = useProfessional();
  const { follow, unfollow, checkFollowStatus, loading: followLoading } = useFollow();
  const { uploadProfileImage, uploadBannerImage, loading: imageLoading } = useProfileImage();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const userId = id || currentUser?.id;

  // Load profile data
  useEffect(() => {
    if (!userId) return;
    const loadProfile = async () => {
      const userData = await fetchUser(userId);
      if (userData) {
        let profData = userData.professional;
        // If viewing own profile and it's professional, fetch full professional details
        if (userId === currentUser?.id && userData.accountType === 'professional') {
          const myProf = await fetchMyProfessional();
          if (myProf) profData = myProf;
        }
        setProfile({
          ...userData,
          professional: profData,
        });
        setFollowersCount(userData.followersCount || 0);
        // Check follow status only for other users
        if (userId !== currentUser?.id) {
          const status = await checkFollowStatus(userId);
          if (status) {
            setIsFollowing(status.isFollowing);
          }
        }
      }
    };
    loadProfile();
  }, [userId, fetchUser, currentUser, fetchMyProfessional, checkFollowStatus]);

  const loading = userLoading || profLoading || imageLoading || followLoading;
  const error = userError;

  if (!userId) {
    return <div className="p-8 text-center text-red-500">No user ID provided.</div>;
  }

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

  const isOwnProfile = currentUser?.id === profile.id;
  const isProfessional = profile.accountType === 'professional';

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    const updated = await updateUserAPI(data);
    if (updated) {
      setProfile(prev => ({ ...prev!, ...updated }));
      if (isOwnProfile) {
        updateUser(updated);
      }
    }
    setIsEditing(false);
  };

  const handleFollowToggle = async () => {
    if (isFollowing) {
      const success = await unfollow(profile.id);
      if (success) {
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      }
    } else {
      const success = await follow(profile.id);
      if (success) {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    }
  };

  const handleUpgradeSuccess = async () => {
    setShowUpgradeModal(false);
    // Re-fetch the profile to get updated data
    const userData = await fetchUser(profile.id);
    if (userData) {
      const profData = await fetchMyProfessional();
      const updatedProfile = {
        ...userData,
        professional: profData || userData.professional,
      };
      setProfile(updatedProfile);
      if (isOwnProfile) {
        updateUser(updatedProfile);
      }
    }
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'banner') => {
    const result = type === 'profile' 
      ? await uploadProfileImage(file) 
      : await uploadBannerImage(file);
    if (result) {
      // Update local profile with new image URL
      setProfile(prev => ({
        ...prev!,
        profileImageUrl: result.profileImageUrl || prev!.profileImageUrl,
        bannerImageUrl: result.bannerImageUrl || prev!.bannerImageUrl,
      }));
      if (isOwnProfile) {
        updateUser({ ...profile, ...result });
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        followersCount={followersCount}
        onFollow={handleFollowToggle}
        onMessage={() => alert(`Message ${profile.firstName}`)}
        onRequestService={() => alert('Request service')}
        onUpgrade={() => setShowUpgradeModal(true)}
        onEditProfile={() => setIsEditing(true)}
        onImageUpload={handleImageUpload}
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