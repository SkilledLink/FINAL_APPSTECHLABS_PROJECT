// services/projects.ts
import { apiRequest } from './api';
import type { Highlight, Project } from '../types/home';

export const getHighlights = async (): Promise<Highlight[]> => {
  return apiRequest<Highlight[]>('/projects/highlights');
};

export const getProjects = async (): Promise<Project[]> => {
  return apiRequest<Project[]>('/projects');
};