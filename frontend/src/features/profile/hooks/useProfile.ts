import { useState, useEffect } from 'react';
import type { UserProfile } from '../types/profile.types';
import { profileService } from '../services/profileService';

export const useProfile = (profileId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'experience'>('about');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    profileService
      .getProfileById(profileId)
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load profile');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const updateProfileData = async (updatedFields: Partial<UserProfile>) => {
    if (!profile) return;
    try {
      const updated = await profileService.updateProfile(profile.id, updatedFields);
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return {
    profile,
    loading,
    error,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    updateProfileData,
  };
};