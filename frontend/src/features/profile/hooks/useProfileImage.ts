// src/features/profile/hooks/useProfileImage.ts

import { useCallback, useState } from 'react';
import type { UserProfile } from '../types/profile.types';

/* ─────────────────────────────────────────────────────────── */
/*  Types                                                     */
/* ─────────────────────────────────────────────────────────── */

export interface UploadState {
  type: 'profile' | 'banner';
  percent: number; // 0–100
}

interface UseProfileImageReturn {
  uploading: UploadState | null;
  error: string | null;
  uploadProfileImage: (file: File) => Promise<UserProfile | null>;
  uploadBannerImage: (file: File) => Promise<UserProfile | null>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.68.67:8000';

/* ─────────────────────────────────────────────────────────── */
/*  Response normalisation (snake_case → camelCase)           */
/* ─────────────────────────────────────────────────────────── */

const normaliseUser = (data: any): UserProfile => ({
  ...data,
  id: data.id,
  email: data.email,
  username: data.username ?? null,
  firstName: data.first_name ?? data.firstName ?? '',
  lastName: data.last_name ?? data.lastName ?? '',
  bio: data.bio ?? null,
  location: data.location ?? null,
  accountType: data.account_type ?? data.accountType ?? 'standard',
  status: data.status,
  isEmailVerified: data.is_email_verified ?? data.isEmailVerified ?? false,
  isAdmin: data.is_admin ?? data.isAdmin ?? false,
  isModerator: data.is_moderator ?? data.isModerator ?? false,
  createdAt: data.created_at ?? data.createdAt ?? '',
  updatedAt: data.updated_at ?? data.updatedAt ?? '',
  lastLoginAt: data.last_login_at ?? data.lastLoginAt ?? null,
  deletedAt: data.deleted_at ?? data.deletedAt ?? null,
  profileImageUrl: data.profile_image_url ?? data.profileImageUrl ?? null,
  bannerImageUrl: data.banner_image_url ?? data.bannerImageUrl ?? null,
  followersCount: data.followers_count ?? data.followersCount ?? 0,
  followingCount: data.following_count ?? data.followingCount ?? 0,
  isFollowing: data.is_following ?? data.isFollowing ?? false,
});

/* ─────────────────────────────────────────────────────────── */
/*  XHR upload with progress callback                         */
/* ─────────────────────────────────────────────────────────── */

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
  token: string | null,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Upload progress — fires many times during the upload.
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    // Upload finished, server responded.
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Server returned invalid JSON'));
        }
      } else {
        let detail = '';
        try {
          const parsed = JSON.parse(xhr.responseText);
          detail = parsed?.detail ?? '';
        } catch {
          /* ignore */
        }
        reject(
          new Error(
            detail || `Upload failed with status ${xhr.status}`,
          ),
        );
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.onabort = () => reject(new Error('Upload was cancelled'));

    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  Hook                                                      */
/* ─────────────────────────────────────────────────────────── */

export const useProfileImage = (): UseProfileImageReturn => {
  const [uploading, setUploading] = useState<UploadState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('access_token');

  const runUpload = useCallback(
    async (
      type: 'profile' | 'banner',
      file: File,
    ): Promise<UserProfile | null> => {
      setError(null);
      setUploading({ type, percent: 0 });

      try {
        const url =
          type === 'profile'
            ? `${API_BASE}/users/me/profile-image`
            : `${API_BASE}/users/me/banner-image`;

        const data = await uploadWithProgress(
          url,
          file,
          (percent) => setUploading({ type, percent }),
          getToken(),
        );

        // Ensure UI briefly shows 100% before we clear the state.
        setUploading({ type, percent: 100 });

        return normaliseUser(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        return null;
      } finally {
        // Short delay so the 100% frame actually renders.
        window.setTimeout(() => setUploading(null), 250);
      }
    },
    [],
  );

  const uploadProfileImage = useCallback(
    (file: File) => runUpload('profile', file),
    [runUpload],
  );

  const uploadBannerImage = useCallback(
    (file: File) => runUpload('banner', file),
    [runUpload],
  );

  return {
    uploading,
    error,
    uploadProfileImage,
    uploadBannerImage,
  };
};