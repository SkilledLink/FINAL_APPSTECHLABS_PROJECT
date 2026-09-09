import { apiClient } from './client';
import type { FollowResponse, FollowersListResponse, FollowingListResponse, FollowStatusResponse } from '../types/follow';

export const followApi = {
  follow: async (userId: string): Promise<FollowResponse> => {
    const res = await apiClient.post('/users/me/follow', { followed_user_id: userId });
    return res.data;
  },

  unfollow: async (userId: string): Promise<void> => {
    await apiClient.delete('/users/me/follow', { data: { followed_user_id: userId } });
  },

  getFollowers: async (userId: string, skip?: number, limit?: number): Promise<FollowersListResponse> => {
    const res = await apiClient.get(`/users/${userId}/followers`, { params: { skip, limit } });
    return res.data;
  },

  getFollowing: async (userId: string, skip?: number, limit?: number): Promise<FollowingListResponse> => {
    const res = await apiClient.get(`/users/${userId}/following`, { params: { skip, limit } });
    return res.data;
  },

  checkFollowStatus: async (targetUserId: string): Promise<FollowStatusResponse> => {
    const res = await apiClient.get(`/users/me/follow-status/${targetUserId}`);
    return res.data;
  },
};