// src/features/profile/components/ProfileLink.tsx

import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useProfileNavigation } from '../hooks/useProfileNavigation';

export interface ProfileLinkProps
  extends Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'onClick'
  > {
  /** The target user's id. If falsy, children are rendered untouched. */
  userId?: string | null;

  children: React.ReactNode;

  className?: string;

  /** Tooltip shown on hover. Defaults to nothing. */
  title?: string;

  /** If children don't convey the destination, supply one. */
  ariaLabel?: string;

  /**
   * Called just before navigation.
   * Return `false` to cancel the navigation (e.g. show a confirm dialog).
   */
  onBeforeNavigate?: () => boolean | void;

  /**
   * Called after navigation is committed.
   * Useful for analytics.
   */
  onAfterNavigate?: () => void;

  /**
   * If true, stop the click from bubbling to a parent click handler.
   * Useful when the profile link is inside a clickable card.
   */
  stopPropagation?: boolean;

  /**
   * If true, the wrapper renders children without an `<a>` and does
   * nothing on click. Use when you want to preview-disabled states.
   */
  disabled?: boolean;

  /** Optional custom click handler. Runs after navigation logic. */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Wrap any element that should navigate to a user's profile page.
 *
 * Renders an `<a href="/profile/:id">` so the browser handles:
 *   - cmd/ctrl/middle-click → open in new tab
 *   - right-click → copy link address
 *   - keyboard tab focus + Enter
 *   - hover URL preview
 * …while React Router intercepts normal clicks for SPA navigation.
 */
export const ProfileLink = forwardRef<HTMLAnchorElement, ProfileLinkProps>(
  (
    {
      userId,
      children,
      className,
      title,
      ariaLabel,
      onBeforeNavigate,
      onAfterNavigate,
      stopPropagation = false,
      disabled = false,
      onClick,
      ...rest
    },
    ref
  ) => {
    const { href, navigateToProfile } = useProfileNavigation(userId);

    // No user id, or explicitly disabled → don't pretend to be a link.
    if (!userId || disabled || !href) {
      return (
        <span className={className} title={title} aria-label={ariaLabel}>
          {children}
        </span>
      );
    }

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Let caller react first.
      onClick?.(event);

      // Let the caller veto navigation.
      if (onBeforeNavigate && onBeforeNavigate() === false) {
        event.preventDefault();
        return;
      }

      if (stopPropagation) {
        event.stopPropagation();
      }

      // Delegate everything else (modifier keys, SPA nav) to the hook.
      navigateToProfile(event);

      // Only fire "after" if we actually navigated (modifier keys
      // bail out inside navigateToProfile — we can detect that here).
      if (
        !event.defaultPrevented &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        event.button === 0
      ) {
        onAfterNavigate?.();
      }
    };

    return (
      <Link
        ref={ref}
        to={href}
        onClick={handleClick}
        className={className}
        title={title}
        aria-label={ariaLabel}
        data-profile-link
        data-user-id={userId}
        {...rest}
      >
        {children}
      </Link>
    );
  }
);

ProfileLink.displayName = 'ProfileLink';

export default ProfileLink;