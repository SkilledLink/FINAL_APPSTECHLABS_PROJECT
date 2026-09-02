// services/questions.ts
import { apiRequest } from './api';
import type { Question } from '../types/home';

export const getQuestions = async (): Promise<Question[]> => {
  return apiRequest<Question[]>('/questions');
};