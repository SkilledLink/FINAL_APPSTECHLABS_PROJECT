// services/post.ts
import { apiRequest } from './api';
import type { Post } from '../types/home';

export const getPosts = async (): Promise<Post[]> => {
  return apiRequest<Post[]>('/posts');
};