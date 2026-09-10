// src/features/profile/hooks/useProfile.ts

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useUser } from './useUser';
import { useProfessional } from './useProfessional';
import { useFollow } from './useFollow';
import type {
  ProfileStatus,
  UserProfile,
  ViewerRelation,
} from '../types/profile.types';

interface UseProfileReturn {
  profile: UserProfile | null;
  status: ProfileStatus;
  error: string | null;
  isOwnProfile: boolean;
  viewerRelation: ViewerRelation | null;
  refetch: () => Promise<void>;
  mutate: (patch: Partial<UserProfile>) => void;
  setViewerRelation: (
    updater: (prev: ViewerRelation) => ViewerRelation
  ) => void;
}

const DEFAULT_RELATION: ViewerRelation = {
  isFollowing: false,
  followsYou: false,
  isMutual: false,
  hasRequestedFollow: false,
  isBlocked: false,
  isBlockedBy: false,
  isMuted: false,
  canFollow: true,
  canMessage: true,
  canRequestService: true,
  canViewWork: true,
};

export const useProfile = (userId?: string): UseProfileReturn => {
  const { currentUser, loading: authLoading } = useAuth();
  const { fetchUser } = useUser();
  const { fetchMyProfessional, fetchProfessionalByUserId } =
    useProfessional();
  const { checkViewerRelation } = useFollow();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [viewerRelation, setViewerRelationState] =
    useState<ViewerRelation | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const effectiveUserId = userId || currentUser?.id;

  const isOwnProfile =
    !!currentUser && !!profile && currentUser.id === profile.id;

  const refetch = useCallback(async () => {
    setReloadKey((k) => k + 1);
  }, []);

  const mutate = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const setViewerRelation = useCallback(
    (updater: (prev: ViewerRelation) => ViewerRelation) => {
      setViewerRelationState((prev) =>
        prev ? updater(prev) : updater(DEFAULT_RELATION)
      );
    },
    []
  );

  useEffect(() => {
    if (authLoading) {
      setStatus('loading');
      return;
    }

    if (!currentUser) {
      setStatus('unauthenticated');
      setProfile(null);
      setViewerRelationState(null);
      return;
    }

    if (!effectiveUserId) {
      setStatus('not_found');
      setProfile(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setStatus('loading');
      setError(null);
      setProfile(null);
      setViewerRelationState(null);

      const own = effectiveUserId === currentUser.id;

      // 1. Base user
      const userData = await fetchUser(effectiveUserId);
      if (cancelled) return;

      if (!userData) {
        setStatus('not_found');
        return;
      }

      // 2. Lifecycle gates
      if (
        userData.status === 'deleted' ||
        userData.deletedAt ||
        userData.deactivatedAt
      ) {
        setStatus('deactivated');
        return;
      }
      if (userData.status === 'suspended' || userData.suspendedAt) {
        setStatus('suspended');
        return;
      }

      // 3. Professional data (self vs other)
      let profData = userData.professional;
      if (userData.accountType === 'professional') {
        const fetched = own
          ? await fetchMyProfessional()
          : await fetchProfessionalByUserId(effectiveUserId);
        if (cancelled) return;
        if (fetched) profData = fetched;
      }

      // 4. Viewer relation
      let relation: ViewerRelation = { ...DEFAULT_RELATION };
      if (own) {
        relation = {
          ...relation,
          canFollow: false,
          canMessage: false,
          canRequestService: false,
        };
      } else {
        const fetched = await checkViewerRelation(effectiveUserId);
        if (cancelled) return;
        if (fetched) relation = fetched;
      }

      // 5. Blocked gates (before private gate – blocked always wins)
      if (relation.isBlockedBy) {
        setStatus('blocked_by');
        return;
      }
      if (relation.isBlocked) {
        setStatus('blocked');
        return;
      }

      // 6. Private gate – only visible to approved followers
      if (
        userData.visibility === 'private' &&
        !own &&
        !relation.isFollowing
      ) {
        setStatus('private');
        return;
      }

      // 7. Ready
      const completeProfile: UserProfile = {
        ...userData,
        professional: profData,
        viewerRelation: relation,
      };

      setProfile(completeProfile);
      setViewerRelationState(relation);
      setStatus('ready');
    };

    load().catch((err) => {
      if (cancelled) return;
      setError(
        err instanceof Error ? err.message : 'Failed to load profile'
      );
      setStatus('error');
    });

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    currentUser,
    effectiveUserId,
    reloadKey,
    fetchUser,
    fetchMyProfessional,
    fetchProfessionalByUserId,
    checkViewerRelation,
  ]);

  return {
    profile,
    status,
    error,
    isOwnProfile,
    viewerRelation,
    refetch,
    mutate,
    setViewerRelation,
  };
};