// src/features/profile/components/ProfileStateView.tsx

import React from 'react';
import {
  AlertTriangle,
  Lock,
  Ban,
  UserX,
  Loader2,
  LogIn,
  RefreshCw,
} from 'lucide-react';
import type { ProfileStatus } from '../types/profile.types';

interface ProfileStateViewProps {
  status: ProfileStatus;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Renders the correct state for anything that isn't `ready`.
 * Keeps ProfilePage small and gives every state its own UI.
 */
export const ProfileStateView: React.FC<ProfileStateViewProps> = ({
  status,
  error,
  onRetry,
}) => {
  if (status === 'idle' || status === 'loading') {
    return <ProfileSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <CenteredCard
        icon={<LogIn className="w-8 h-8 text-indigo-600" />}
        title="Sign in to view this profile"
        body="You need to be logged in to see profile details."
        primary={{ label: 'Go to login', href: '/login' }}
      />
    );
  }

  if (status === 'not_found') {
    return (
      <CenteredCard
        icon={<UserX className="w-8 h-8 text-slate-400" />}
        title="User not found"
        body="This account may have been removed or the link is incorrect."
        primary={{ label: 'Back to home', href: '/' }}
      />
    );
  }

  if (status === 'private') {
    return (
      <CenteredCard
        icon={<Lock className="w-8 h-8 text-amber-500" />}
        title="This account is private"
        body="Follow this user to see their profile and posts."
      />
    );
  }

  if (status === 'blocked' || status === 'blocked_by') {
    // Intentionally neutral — don't leak which side blocked whom.
    return (
      <CenteredCard
        icon={<Ban className="w-8 h-8 text-slate-400" />}
        title="This profile isn't available"
        body="You can't view this profile right now."
      />
    );
  }

  if (status === 'deactivated') {
    return (
      <CenteredCard
        icon={<UserX className="w-8 h-8 text-slate-400" />}
        title="Account deactivated"
        body="This user has deactivated their account."
      />
    );
  }

  if (status === 'suspended') {
    return (
      <CenteredCard
        icon={<Ban className="w-8 h-8 text-red-500" />}
        title="Account suspended"
        body="This account has been suspended by moderation."
      />
    );
  }

  if (status === 'error') {
    return (
      <CenteredCard
        icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
        title="Something went wrong"
        body={error || 'We could not load this profile.'}
        secondary={
          onRetry
            ? { label: 'Try again', onClick: onRetry, icon: <RefreshCw className="w-3.5 h-3.5" /> }
            : undefined
        }
      />
    );
  }

  // Fallback for unexpected statuses
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 pt-24 text-center text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────────────────── */

const CenteredCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  body: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; onClick: () => void; icon?: React.ReactNode };
}> = ({ icon, title, body, primary, secondary }) => (
  <div className="w-full max-w-md mx-auto px-4 pt-24">
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 text-center shadow-xs">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        {body}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
        {primary && (
          <a
            href={primary.href}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
          >
            {primary.label}
          </a>
        )}
        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {secondary.icon}
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  </div>
);

const ProfileSkeleton: React.FC = () => (
  <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4 animate-pulse pt-16 sm:pt-20 md:pt-24">
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

    <div className="flex gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
      <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>

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

export default ProfileStateView;