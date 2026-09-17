// src/features/profile/pages/ProfilePage.tsx

import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { useUser } from '../hooks/useUser';
import { useFollow } from '../hooks/useFollow';
import { useProfileImage } from '../hooks/useProfileImage';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileAbout } from '../components/ProfileAbout';
import { ProfileSkills } from '../components/ProfileSkills';
import { ProfileExperience } from '../components/ProfileExperience';
import { ProfileWorkTab } from '../components/ProfileWorkTab';
import { ProfileMediaTab } from '../components/ProfileMediaTab';
import { ProfilePostsTab } from '../components/ProfilePostsTab';
import { EditProfileForm } from '../components/EditProfileForm';
import { ProfileStateView } from '../components/ProfileStateView';
import { ProfessionalOnboardingModal } from './ProfessionalOnboardingModal';
import ReportModal from '../../reports/components/ReportModal';
import type { ProfileTab, UserProfile } from '../types/profile.types';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { currentUser, updateUser: updateAuthUser } = useAuth();
  const { updateUser: updateUserAPI, fetchUser } = useUser();
  const { follow, unfollow } = useFollow();
  const { uploadProfileImage, uploadBannerImage } = useProfileImage();

  const {
    profile,
    status,
    error,
    isOwnProfile,
    viewerRelation,
    refetch,
    mutate,
    setViewerRelation,
  } = useProfile(id);

  // ── ALL hooks first, unconditionally ─────────────────────────
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSaveProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!profile || !isOwnProfile) return;
      const updated = await updateUserAPI(data);
      if (updated) {
        mutate(updated);
        updateAuthUser(updated);
      }
      setIsEditing(false);
    },
    [profile, isOwnProfile, updateUserAPI, mutate, updateAuthUser]
  );

  const handleFollowToggle = useCallback(async () => {
    if (!profile || !viewerRelation || isOwnProfile) return;

    const wasFollowing = viewerRelation.isFollowing;
    const originalFollowers = profile.followersCount ?? 0;

    // Optimistic update
    setViewerRelation((prev) => ({ ...prev, isFollowing: !wasFollowing }));
    mutate({
      followersCount: wasFollowing
        ? Math.max(0, originalFollowers - 1)
        : originalFollowers + 1,
    });

    const success = wasFollowing
      ? await unfollow(profile.id)
      : await follow(profile.id);

    if (!success) {
      // Rollback
      setViewerRelation((prev) => ({ ...prev, isFollowing: wasFollowing }));
      mutate({ followersCount: originalFollowers });
    }
  }, [
    profile,
    viewerRelation,
    isOwnProfile,
    follow,
    unfollow,
    mutate,
    setViewerRelation,
  ]);

  const handleUpgradeSuccess = useCallback(async () => {
    setShowUpgradeModal(false);
    if (!profile || !isOwnProfile) return;

    const userData = await fetchUser(profile.id);
    if (!userData) return;

    mutate(userData);
    updateAuthUser(userData);
    await refetch();
  }, [profile, isOwnProfile, fetchUser, mutate, updateAuthUser, refetch]);

  const handleImageUpload = useCallback(
    async (file: File, type: 'profile' | 'banner') => {
      if (!profile || !isOwnProfile) return;

      const result =
        type === 'profile'
          ? await uploadProfileImage(file)
          : await uploadBannerImage(file);

      if (!result) return;

      const patch: Partial<UserProfile> = {};
      if (result.profileImageUrl)
        patch.profileImageUrl = result.profileImageUrl;
      if (result.bannerImageUrl)
        patch.bannerImageUrl = result.bannerImageUrl;

      mutate(patch);
      updateAuthUser({ ...profile, ...patch });
    },
    [
      profile,
      isOwnProfile,
      uploadProfileImage,
      uploadBannerImage,
      mutate,
      updateAuthUser,
    ]
  );

  const handleMessage = useCallback(() => {
    if (!profile || !viewerRelation?.canMessage) return;
    navigate(`/messages?user=${profile.id}`);
  }, [profile, viewerRelation, navigate]);

  const handleRequestService = useCallback(() => {
    if (!profile || !viewerRelation?.canRequestService) return;
    navigate(`/services/request?professional=${profile.id}`);
  }, [profile, viewerRelation, navigate]);

  const handleShare = useCallback(async () => {
    if (!profile) return;
    const url = `${window.location.origin}/profile/${profile.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.firstName} ${profile.lastName}`,
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [profile]);

  // ── Now it's safe to conditionally return ────────────────────
  if (status !== 'ready' || !profile) {
    return <ProfileStateView status={status} error={error} onRetry={refetch} />;
  }

  // Trust the data, not the accountType flag — some rows say
  // 'professional' but have no professionals record yet.
  const isProfessional = !!profile.professional;

  return (
    <div className="relative w-full  px-8 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4 pt-16 sm:pt-20 md:pt-24">

      {/* ─── Report button — only on other users' profiles ─── */}
      {!isOwnProfile && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            aria-label={`Report ${profile.firstName} ${profile.lastName}`}
            title="Report this user"
            className="inline-flex items-center gap-2 rounded-full
                       border border-rose-200 dark:border-rose-900/60
                       bg-rose-50 hover:bg-rose-100
                       dark:bg-rose-950/40 dark:hover:bg-rose-950/70
                       px-4 py-2 text-xs font-semibold
                       text-rose-700 dark:text-rose-300
                       shadow-sm hover:shadow
                       transition-all active:scale-[0.97]"
          >
            <Flag className="h-3.5 w-3.5" />
            Report
          </button>
        </div>
      )}

      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={viewerRelation?.isFollowing ?? false}
        followsYou={viewerRelation?.followsYou ?? false}
        canMessage={viewerRelation?.canMessage ?? false}
        canRequestService={viewerRelation?.canRequestService ?? false}
        followersCount={profile.followersCount}
        onFollow={handleFollowToggle}
        onMessage={handleMessage}
        onRequestService={handleRequestService}
        onUpgrade={() => setShowUpgradeModal(true)}
        onEditProfile={() => setIsEditing(true)}
        onImageUpload={handleImageUpload}
        onShare={handleShare}
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
              <ProfileSkills profile={profile} isOwnProfile={isOwnProfile} />
              <ProfileExperience profile={profile} />
            </>
          )}
        </div>
      )}

      {activeTab === 'work' && isProfessional && (
        <ProfileWorkTab
          profile={profile}
          onRequestService={handleRequestService}
          onViewAllServices={() => setActiveTab('services')}
        />
      )}

      {activeTab === 'services' && isProfessional && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            All Services
          </h3>
          <ul className="mt-4 space-y-2">
            {(profile.professional?.services ?? []).map((service, idx) => (
              <li
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                {service}
              </li>
            ))}
            {(profile.professional?.services ?? []).length === 0 && (
              <li className="text-sm text-slate-400">No services listed.</li>
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
            {profile.professional?.totalReviews ?? 0} reviews • Rating{' '}
            {typeof profile.professional?.rating === 'number'
              ? profile.professional.rating.toFixed(1)
              : '—'}
          </p>
        </div>
      )}

      {activeTab === 'media' && (
        <ProfileMediaTab
          userId={profile.id}
          isOwnProfile={isOwnProfile}
        />
      )}

      {activeTab === 'posts' && (
        <ProfilePostsTab userId={profile.id} />
      )}

      {/* Modals (self-guarded) */}
      {isEditing && isOwnProfile && (
        <EditProfileForm
          profile={profile}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {showUpgradeModal && isOwnProfile && (
        <ProfessionalOnboardingModal
          userId={profile.id}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={handleUpgradeSuccess}
        />
      )}

      {/* Report modal — portal-rendered, self-guarded via `open` */}
      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={profile.id}
        targetType="user"
        targetLabel={`${profile.firstName} ${profile.lastName}`}
      />
    </div>
  );
};