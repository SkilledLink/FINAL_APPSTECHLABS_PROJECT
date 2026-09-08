// src/features/profile/services/profileService.ts

import type { UserProfile, Professional } from '../types/profile.types';
import { MOCK_USERS } from '../../../data/userMockData';

// Keep a mutable copy for updates
const users = [...MOCK_USERS];

export const profileService = {
  async getProfileById(id: string): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    const updated = { ...users[index], ...data };
    users[index] = updated;
    return updated;
  },

  async upgradeToProfessional(
    userId: string,
    professionalData: Omit<Professional, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    const user = users[index];
    if (user.accountType === 'professional') throw new Error('Already a professional');

    const newProfessional: Professional = {
      id: `prof_${Date.now()}`,
      userId: user.id,
      ...professionalData,
      rating: 0,
      totalReviews: 0,
      completedJobs: 0,
      isVerified: false,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedUser: UserProfile = {
      ...user,
      accountType: 'professional',
      professional: newProfessional,
    };
    users[index] = updatedUser;
    return updatedUser;
  },
};