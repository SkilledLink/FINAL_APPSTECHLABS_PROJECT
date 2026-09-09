export interface FollowResponse {
  followed_user_id: string;
  follower_user_id: string;
  created_at: string;
}

export interface FollowersListResponse {
  items: any[];
  total: number;
  page: number;
  size: number;
}

export interface FollowingListResponse {
  items: any[];
  total: number;
  page: number;
  size: number;
}

export interface FollowStatusResponse {
  is_following: boolean;
}