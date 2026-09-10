// src/features/profile/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();

  const {
    currentUser,
    loading: authLoading,
    updateUser,
  } = useAuth();

  const {
    user,
    loading: userLoading,
    error: userError,
    fetchUser,
    updateUser: updateUserAPI,
  } = useUser();

  const {
    professional,
    loading: profLoading,
    fetchMyProfessional,
    createProfessional,
    updateProfessional,
  } = useProfessional();

  const {
    follow,
    unfollow,
    checkFollowStatus,
    loading: followLoading,
  } = useFollow();

  const {
    uploadProfileImage,
    uploadBannerImage,
    loading: imageLoading,
  } = useProfileImage();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = id || currentUser?.id;

  // Wait for authentication to finish
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  // Load the profile
  useEffect(() => {
    if (authLoading || !currentUser || !userId) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setProfile(null);

      try {
        // This waits until the backend response is received
        const userData = await fetchUser(userId);

        if (!isMounted) {
          return;
        }

        if (!userData) {
          setProfile(null);
          return;
        }

        let profData = userData.professional;
        let followStatus = false;

        const promises: Promise<any>[] = [];

        // Get professional data
        if (
          userId === currentUser.id &&
          userData.accountType === 'professional'
        ) {
          promises.push(
            fetchMyProfessional().then((p) => {
              if (p) {
                profData = p;
              }
            })
          );
        }

        // Get follow status
        if (userId !== currentUser.id) {
          promises.push(
            checkFollowStatus(userId).then((status) => {
              if (status) {
                followStatus = status.isFollowing;
              }
            })
          );
        }

        // Wait for all additional backend requests
        await Promise.all(promises);

        if (!isMounted) {
          return;
        }

        // Only now do we have the complete profile
        const completeProfile: UserProfile = {
          ...userData,
          professional: profData,
        };

        setProfile(completeProfile);
        setFollowersCount(userData.followersCount || 0);
        setIsFollowing(followStatus);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [
    authLoading,
    currentUser,
    userId,
    fetchUser,
    fetchMyProfessional,
    checkFollowStatus,
  ]);

  const error = userError;

  // Show skeleton immediately while authentication or profile data is loading
  if (authLoading || loading || !profile) {
    return (
      <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4 animate-pulse pt-16 sm:pt-20 md:pt-24">
        {/* Skeleton Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
          <div className="h-32 sm:h-48 md:h-60 w-full bg-slate-200 dark:bg-slate-800" />

          <div className="p-4 sm:p-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 -mt-14 sm:-mt-20 md:-mt-24">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-slate-200 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 shrink-0" />

              <div className="space-y-3 w-full">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Tabs */}
        <div className="flex gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
          <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Skeleton Content */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-40 mb-4" />

            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication finished but user is logged out
  if (!currentUser) {
    return null;
  }

  // Backend returned an error
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  const isOwnProfile = currentUser.id === profile.id;
  const isProfessional = profile.accountType === 'professional';

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    const updated = await updateUserAPI(data);

    if (updated) {
      setProfile((prev) => ({
        ...prev!,
        ...updated,
      }));

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
        setFollowersCount((prev) => prev - 1);
      }
    } else {
      const success = await follow(profile.id);

      if (success) {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    }
  };

  const handleUpgradeSuccess = async () => {
    setShowUpgradeModal(false);

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

  const handleImageUpload = async (
    file: File,
    type: 'profile' | 'banner'
  ) => {
    const result =
      type === 'profile'
        ? await uploadProfileImage(file)
        : await uploadBannerImage(file);

    if (result) {
      setProfile((prev) => ({
        ...prev!,
        profileImageUrl:
          result.profileImageUrl || prev!.profileImageUrl,
        bannerImageUrl:
          result.bannerImageUrl || prev!.bannerImageUrl,
      }));

      if (isOwnProfile) {
        updateUser({
          ...profile,
          ...result,
        });
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-8 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4 pt-16 sm:pt-20 md:pt-24">
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

          {isProfessional && (
            <>
              <ProfileSkills
                profile={profile}
                isOwnProfile={isOwnProfile}
              />

              <ProfileExperience profile={profile} />
            </>
          )}
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
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            All Services
          </h3>

          <ul className="mt-4 space-y-2">
            {profile.professional?.services.map(
              (service, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  {service}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {activeTab === 'reviews' && isProfessional && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            Reviews
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {profile.professional?.totalReviews} reviews • Rating{' '}
            {profile.professional?.rating.toFixed(1)}
          </p>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            Posts
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            No posts yet.
          </p>
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

