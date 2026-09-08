// src/services/userService.ts

import { mockUsers } from '../data/userMockData';

export interface UserBasicInfo {
  id: string;
  name: string;
  isProfessional: boolean;
}

export const userService = {
  getUserBasicInfo: (userId: string): Promise<UserBasicInfo> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find((u) => u.id === userId);
        if (user) {
          resolve({
            id: user.id,
            name: user.name,
            isProfessional: user.isProfessional,
          });
        } else {
          reject(new Error('User not found'));
        }
      }, 200);
    });
  },
};