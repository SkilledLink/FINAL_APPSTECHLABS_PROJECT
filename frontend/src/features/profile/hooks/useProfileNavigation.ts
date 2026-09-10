// src/features/profile/hooks/useProfileNavigation.ts

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider';

export interface UseProfileNavigationReturn {
  /** The href for the target user, or undefined if no userId was given. */
  href: string | undefined;

  /** True when the target is the logged-in user. */
  isOwnProfile: boolean;

  /**
   * Drop-in click handler. Attach it to any element that should
   * navigate to the profile. Respects modifier keys and middle-click
   * so users can still open in a new tab.
   */
  navigateToProfile: (event?: React.MouseEvent) => void;

  /** Imperatively navigate. Ignores modifier keys. */
  goToProfile: () => void;
}

export const useProfileNavigation = (
  userId?: string | null
): UseProfileNavigationReturn => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const href = userId ? `/profile/${userId}` : undefined;
  const isOwnProfile = !!userId && currentUser?.id === userId;

  const navigateToProfile = useCallback(
    (event?: React.MouseEvent) => {
      if (!userId || !href) return;

      // Preserve native new-tab / new-window / download behaviours.
      if (
        event &&
        (event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0)
      ) {
        return;
      }

      // Otherwise take over from the browser and use SPA routing.
      event?.preventDefault();
      navigate(href);
    },
    [userId, href, navigate]
  );

  const goToProfile = useCallback(() => {
    if (href) navigate(href);
  }, [href, navigate]);

  return { href, isOwnProfile, navigateToProfile, goToProfile };
};

export default useProfileNavigation;