// src/features/user_profile/services/userService.ts

import type { UserProfile, Professional } from '../types/user.types';

/**
 * Frontend-only mock store.
 * Replace `MOCK_USERS` and the stubbed methods below with real API calls.
 */

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1',
    email: 'jane.doe@example.com',
    username: 'janedoe',
    firstName: 'Jane',
    lastName: 'Doe',
    bio: 'Passionate about woodworking and home renovations.',
    location: 'Yaoundé, Cameroon',
    accountType: 'professional',
    status: 'active',
    isEmailVerified: true,
    isAdmin: false,
    isModerator: false,
    createdAt: '2024-03-12T10:00:00Z',
    updatedAt: '2025-01-08T12:00:00Z',
    lastLoginAt: '2025-01-09T08:15:00Z',
    profileImageUrl: '',
    bannerImageUrl: '',
    followersCount: 128,
    followingCount: 42,
    isFollowing: false,
    professional: {
      id: 'p1',
      userId: 'u1',
      profession: 'Carpenter',
      bio: '15+ years crafting custom furniture and cabinetry.',
      skills: ['Woodworking', 'Carpentry', 'Furniture Design', 'Trim Work'],
      yearsOfExperience: 15,
      services: ['Custom Cabinetry', 'Trim Work', 'Renovations'],
      hourlyRate: 35,
      country: 'Cameroon',
      region: 'Centre',
      city: 'Yaoundé',
      available: true,
      isVerified: true,
      rating: 4.8,
      totalReviews: 56,
      completedJobs: 87,
      createdAt: '2024-03-12T10:00:00Z',
      updatedAt: '2025-01-08T12:00:00Z',
    },
  },
  {
    id: 'u2',
    email: 'john.smith@example.com',
    username: 'johnsmith',
    firstName: 'John',
    lastName: 'Smith',
    bio: 'Homeowner and DIY enthusiast.',
    location: 'Douala, Cameroon',
    accountType: 'standard',
    status: 'active',
    isEmailVerified: true,
    isAdmin: false,
    isModerator: false,
    createdAt: '2024-06-01T09:30:00Z',
    updatedAt: '2024-12-15T14:20:00Z',
    profileImageUrl: '',
    bannerImageUrl: '',
    followersCount: 12,
    followingCount: 30,
    isFollowing: false,
  },
];

// Mutable copy so local updates persist during a session.
const users = [...MOCK_USERS];

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const userService = {
  // TODO: wire up to backend
  async getUserById(id: string): Promise<UserProfile | null> {
    await delay(300);
    const user = users.find((u) => u.id === id);
    return user ?? null;
  },

  // TODO: wire up to backend
  async getCurrentUser(): Promise<UserProfile | null> {
    await delay(300);
    return users[0] ?? null;
  },

  // TODO: wire up to backend
  async updateUser(
    id: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    await delay(300);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const updated = { ...users[index], ...data };
    users[index] = updated;
    return updated;
  },

  // TODO: wire up to backend
  async getProfessionalByUserId(
    userId: string
  ): Promise<Professional | null> {
    await delay(300);
    const user = users.find((u) => u.id === userId);
    return user?.professional ?? null;
  },

  // TODO: wire up to backend
  async createProfessional(
    data: Partial<Professional>
  ): Promise<Professional | null> {
    await delay(400);
    const now = new Date().toISOString();
    return {
      id: `prof_${Date.now()}`,
      userId: data.userId ?? 'u1',
      profession: data.profession ?? '',
      bio: data.bio,
      skills: data.skills ?? [],
      yearsOfExperience: data.yearsOfExperience,
      services: data.services ?? [],
      hourlyRate: data.hourlyRate,
      country: data.country,
      region: data.region,
      city: data.city,
      available: data.available ?? true,
      isVerified: false,
      rating: 0,
      totalReviews: 0,
      completedJobs: 0,
      createdAt: now,
      updatedAt: now,
    };
  },

  // TODO: wire up to backend
  async updateProfessional(
    data: Partial<Professional>
  ): Promise<Professional | null> {
    await delay(300);
    const current = users[0]?.professional;
    if (!current) return null;
    return { ...current, ...data, updatedAt: new Date().toISOString() };
  },

  // TODO: wire up to backend
  async followUser(_userId: string): Promise<boolean> {
    await delay(200);
    return true;
  },

  // TODO: wire up to backend
  async unfollowUser(_userId: string): Promise<boolean> {
    await delay(200);
    return true;
  },

  // TODO: wire up to backend
  async checkFollowStatus(userId: string): Promise<{
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
  }> {
    await delay(200);
    const user = users.find((u) => u.id === userId);
    return {
      isFollowing: user?.isFollowing ?? false,
      followersCount: user?.followersCount ?? 0,
      followingCount: user?.followingCount ?? 0,
    };
  },

  // TODO: wire up to backend
  async uploadProfileImage(_file: File): Promise<UserProfile | null> {
    await delay(400);
    return users[0] ?? null;
  },

  // TODO: wire up to backend
  async uploadBannerImage(_file: File): Promise<UserProfile | null> {
    await delay(400);
    return users[0] ?? null;
  },
};