// src/features/profile/pages/ProfilePage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flag, MessageSquarePlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../providers/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { useUser } from '../hooks/useUser';
import { useFollow } from '../hooks/useFollow';
import { useProfessional } from '../hooks/useProfessional';
import { useProfileImage } from '../hooks/useProfileImage';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileBio, ProfileDetails } from '../components/ProfileAbout';
import { ProfileSkills } from '../components/ProfileSkills';
import { ProfileExperience } from '../components/ProfileExperience';
import { ProfileWorkTab } from '../components/ProfileWorkTab';
import { ProfileMediaTab } from '../components/ProfileMediaTab';
import { ProfilePostsTab } from '../components/ProfilePostsTab';
import { EditProfileForm } from '../components/EditProfileForm';
import { ProfileStateView } from '../components/ProfileStateView';
import { ProfessionalOnboardingModal } from './ProfessionalOnboardingModal';
import { ReviewsTab } from '../../reviews/components/ReviewsTab';
import { ReviewForm } from '../../reviews/components/ReviewForm';
import { createReview, checkHasReviewed } from '../../reviews/services/reviewService';
import ReportModal from '../../reports/components/ReportModal';
import type {
  ProfileTab,
  UserProfile,
  EditProfilePayload,
} from '../types/profile.types';

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:8000';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { currentUser, updateUser: updateAuthUser } = useAuth();
  const { updateUser: updateUserAPI, fetchUser } = useUser();
  const { follow, unfollow, getFollowers } = useFollow();
  const { updateProfessional } = useProfessional();
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

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [followersPreview, setFollowersPreview] = useState<any[]>([]);

  // ── Review feature state ──────────────────────────────
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  /* ── Fetch follower previews ───────────────────────────── */
  useEffect(() => {
    const fetchPreview = async () => {
      if (!profile?.id) return;
      const followers = await getFollowers(profile.id, 0, 5);
      setFollowersPreview(Array.isArray(followers) ? followers : []);
    };
    fetchPreview();
  }, [profile?.id, getFollowers]);

  /* ── Fetch professional record + review status ─────────── */
  useEffect(() => {
    if (!profile?.id) return;
    if (isOwnProfile) return;

    let cancelled = false;

    const run = async () => {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const res = await fetch(
          `${API_BASE}/users/${profile.id}/professional`,
          { headers }
        );
        if (cancelled) return;

        if (!res.ok) {
          // Not a professional (or endpoint failed) — no button.
          setProfessionalId(null);
          setHasReviewed(false);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        const pid: string | undefined = data?.id;
        if (!pid) {
          setProfessionalId(null);
          return;
        }
        setProfessionalId(pid);

        const already = await checkHasReviewed(pid).catch(() => false);
        if (cancelled) return;
        setHasReviewed(already);
      } catch {
        if (cancelled) return;
        setProfessionalId(null);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, isOwnProfile]);

  /* ── Save profile ─────────────────────────────────────── */
  const handleSaveProfile = useCallback(
    async (payload: EditProfilePayload) => {
      if (!profile || !isOwnProfile) return;

      if (payload.user && Object.keys(payload.user).length > 0) {
        const updated = await updateUserAPI(payload.user);
        if (!updated) {
          throw new Error('Could not save your basic info. Please try again.');
        }
        mutate(updated);
        updateAuthUser(updated);
      }

      if (payload.professional && profile.professional) {
        const updatedProf = await updateProfessional(payload.professional);
        if (!updatedProf) {
          throw new Error(
            'Could not save your professional details. Please try again.'
          );
        }
        mutate({ professional: updatedProf });
      }

      setIsEditing(false);
    },
    [
      profile,
      isOwnProfile,
      updateUserAPI,
      updateProfessional,
      mutate,
      updateAuthUser,
    ]
  );

  /* ── Submit review ────────────────────────────────────── */
  const handleSubmitReview = useCallback(
    async (payload: { rating: number; title: string; comment: string }) => {
      if (!professionalId) return false;
      try {
        await createReview({
          professionalId,
          rating: payload.rating,
          title: payload.title,
          comment: payload.comment,
        });
        toast.success('Review submitted successfully');
        setHasReviewed(true);
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to submit review'
        );
        return false;
      }
    },
    [professionalId]
  );

  /* ── Follow toggle ────────────────────────────────────── */
  const handleFollowToggle = useCallback(async () => {
    if (!profile || !viewerRelation || isOwnProfile) return;

    const wasFollowing = viewerRelation.isFollowing;
    const originalFollowers = profile.followersCount ?? 0;

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

  /* ── Upgrade success ──────────────────────────────────── */
  const handleUpgradeSuccess = useCallback(async () => {
    setShowUpgradeModal(false);
    if (!profile || !isOwnProfile) return;

    const userData = await fetchUser(profile.id);
    if (!userData) return;

    mutate(userData);
    updateAuthUser(userData);
    await refetch();
  }, [profile, isOwnProfile, fetchUser, mutate, updateAuthUser, refetch]);

  /* ── Image upload ─────────────────────────────────────── */
  const handleImageUpload = useCallback(
    async (file: File, type: 'profile' | 'banner') => {
      if (!profile || !isOwnProfile) return;

      const result =
        type === 'profile'
          ? await uploadProfileImage(file)
          : await uploadBannerImage(file);

      if (!result) return;

      const patch: Partial<UserProfile> = {};
      if (result.profileImageUrl) patch.profileImageUrl = result.profileImageUrl;
      if (result.bannerImageUrl) patch.bannerImageUrl = result.bannerImageUrl;

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

  /* ── Nav handlers ─────────────────────────────────────── */
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
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [profile]);

  /* ── Loading / error state ───────────────────────────── */
  if (status !== 'ready' || !profile) {
    return <ProfileStateView status={status} error={error} onRetry={refetch} />;
  }

  const isProfessional = !!profile.professional;
  const canWriteReview =
    !isOwnProfile && !!professionalId && !hasReviewed;

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-full px-3 sm:px-4 md:px-5 pt-4 pb-24 lg:pb-6 space-y-4">

        {/* ── Top bar: Report + Write review ─────────────── */}
        {!isOwnProfile && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {canWriteReview && (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition active:scale-[0.98]"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Write a review
              </button>
            )}

            {!isOwnProfile && hasReviewed && (
              <span className="text-[11px] text-slate-400 italic">
                You've already reviewed this professional
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              aria-label={`Report ${profile.firstName} ${profile.lastName}`}
              title="Report this user"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-sm transition"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          </div>
        )}

        {/* ── Header ──────────────────────────────────────── */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={viewerRelation?.isFollowing ?? false}
          followsYou={viewerRelation?.followsYou ?? false}
          canMessage={viewerRelation?.canMessage ?? false}
          canRequestService={viewerRelation?.canRequestService ?? false}
          followersCount={profile.followersCount}
          followersPreview={followersPreview}
          onFollow={handleFollowToggle}
          onMessage={handleMessage}
          onRequestService={handleRequestService}
          onUpgrade={() => setShowUpgradeModal(true)}
          onEditProfile={() => setIsEditing(true)}
          onImageUpload={handleImageUpload}
          onShare={handleShare}
        />

        {/* ── Dashboard ───────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <ProfileTabs
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            isProfessional={isProfessional}
            layout="vertical"
          />

          <div className="flex-1 min-w-0 w-full">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2 space-y-4">
                  <ProfileBio profile={profile} />
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
                <div className="md:col-span-1 space-y-4">
                  <ProfileDetails profile={profile} />
                </div>
              </div>
            )}

            {activeTab === 'work' && isProfessional && profile.professional && (
              <ProfileWorkTab
                profile={profile}
                onRequestService={handleRequestService}
                onViewAllServices={() => setActiveTab('services')}
              />
            )}

            {activeTab === 'services' && isProfessional && (
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  All Services
                </h3>
                <ul className="mt-4 space-y-2">
                  {(profile.professional?.services ?? []).map((service, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300"
                    >
                      {service}
                    </li>
                  ))}
                  {(profile.professional?.services ?? []).length === 0 && (
                    <li className="text-sm text-slate-400">
                      No services listed.
                    </li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && isProfessional && profile.professional && (
              <ReviewsTab
                professionalId={profile.professional.id}
                isOwnProfile={isOwnProfile}
                currentUserId={currentUser?.id}
              />
            )}

            {activeTab === 'media' && (
              <ProfileMediaTab userId={profile.id} isOwnProfile={isOwnProfile} />
            )}

            {activeTab === 'posts' && <ProfilePostsTab userId={profile.id} />}
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
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

      {showReviewForm && (
        <ReviewForm
          mode="create"
          onCancel={() => setShowReviewForm(false)}
          onSubmit={handleSubmitReview}
        />
      )}

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

export default ProfilePage;