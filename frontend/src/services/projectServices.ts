// frontend/src/services/projectService.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ============================================================
// TYPES
// ============================================================

export interface ProjectData {
    title: string;
    category: string;
    trade: string;
    location: string;
    description: string;
    before_image?: string;
    after_image?: string;
    images?: string[];
    completion_date?: string;
    duration?: string;
    budget?: string;
    client?: string;
    skills?: string[];
    challenges?: string[];
    results?: string[];
    professional_id: number;
    status?: 'draft' | 'published' | 'completed';
}

export interface ProjectLikeResponse {
    liked: boolean;
    likes_count: number;
    message: string;
}

export interface ProjectComment {
    id: number;
    project_id: number;
    user_id: number;
    user_name: string;
    content: string;
    created_at: string;
}

export interface ProjectShareResponse {
    shared: boolean;
    shares_count: number;
    message: string;
}

// ============================================================
// 1. UPLOAD PROJECT IMAGE (Single)
// ============================================================

export async function uploadProjectImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/uploads/project/single`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
}

// ============================================================
// 2. UPLOAD MULTIPLE PROJECT IMAGES
// ============================================================

export async function uploadMultipleProjectImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_URL}/api/uploads/project/multiple`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload images');
    }

    const data = await response.json();
    return data.urls;
}

// ============================================================
// 3. CREATE PROJECT
// ============================================================

export async function createProject(projectData: ProjectData) {
    const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create project');
    }

    return response.json();
}

// ============================================================
// 4. GET ALL PROJECTS
// ============================================================

export async function getProjects(professionalId?: number): Promise<ProjectData[]> {
  const url = professionalId 
    ? `${API_URL}/api/projects?professional_id=${professionalId}`
    : `${API_URL}/api/projects`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

// ============================================================
// 5. GET SINGLE PROJECT
// ============================================================

export async function getProject(projectId: number) {
    const response = await fetch(`${API_URL}/api/projects/${projectId}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch project');
    }

    return response.json();
}

// ============================================================
// 6. LIKE / UNLIKE PROJECT
// ============================================================

export async function toggleProjectLike(projectId: number, userId: number = 1): Promise<ProjectLikeResponse> {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/like?user_id=${userId}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to toggle like');
    }

    return response.json();
}

export async function getProjectLikesCount(projectId: number): Promise<{ likes_count: number }> {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/likes/count`);
    
    if (!response.ok) {
        throw new Error('Failed to get likes count');
    }

    return response.json();
}

// ============================================================
// 7. COMMENTS
// ============================================================

export async function addProjectComment(
    projectId: number, 
    content: string, 
    userName: string, 
    userId: number = 1
): Promise<ProjectComment> {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content,
            user_name: userName,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to add comment');
    }

    return response.json();
}

export async function getProjectComments(projectId: number): Promise<ProjectComment[]> {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/comments`);
    
    if (!response.ok) {
        throw new Error('Failed to get comments');
    }

    return response.json();
}

// ============================================================
// 8. SHARE PROJECT
// ============================================================

export async function toggleProjectShare(projectId: number, userId: number = 1): Promise<ProjectShareResponse> {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/share?user_id=${userId}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to toggle share');
    }

    return response.json();
}

// ============================================================
// 9. PORTFOLIO PROFILE
// ============================================================

export type PortfolioEducation = {
  id: number;
  institution: string;
  degree: string;
  field?: string;
};

export type PortfolioExperience = {
  id: number;
  company: string;
  role: string;
  description?: string;
};

export type PortfolioService = {
  id: number;
  name: string;
  description?: string;
};

export type PortfolioTestimonial = {
  id: number;
  client_name: string;
  client_role?: string;
  content: string;
  rating: number;
  image?: string;
};

export type PortfolioProfile = {
  id: number;
  professional_id: number;
  full_name: string;
  professional_title: string;
  bio: string;
  profile_image?: string;
  cover_image?: string;
  location?: string;
  phone?: string;
  email?: string;
  years_experience?: number;
  projects_completed?: number;
  rating?: number;
  skills: string[];
  education: PortfolioEducation[];
  experience: PortfolioExperience[];
  services: PortfolioService[];
  testimonials: PortfolioTestimonial[];
};

export const getPortfolioProfile = async (): Promise<PortfolioProfile> => {
  const response = await fetch('/api/portfolio/profile');

  if (!response.ok) {
    throw new Error('Unable to load portfolio profile');
  }

  return response.json();
};