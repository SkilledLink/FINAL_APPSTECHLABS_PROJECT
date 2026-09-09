import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// ============================================================
// ✅ ADD THIS - Job Interface
// ============================================================

export interface Job {
  id: number;
  title: string;
  description: string;
  trade: string;
  location: string;
  budget: string;
  urgency: string;
  client_type: string;
  client_name: string;
  contact_phone: string;
  contact_email?: string;
  images: string[];
  is_active: boolean;
  created_at: string;
}

// ============================================================
// ✅ ADD THIS - getAllJobs function
// ============================================================

export const getAllJobs = async (): Promise<Job[]> => {
  const response = await axios.get(`${API_URL}/jobs`);
  return response.data;
};

// ============================================================
// YOUR EXISTING FUNCTIONS (keep these)
// ============================================================

export const uploadJobImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/uploads/job`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
 return response.data.url;
};

export const createJob = async (jobData: any): Promise<Job> => {
  const response = await axios.post(`${API_URL}/jobs`, jobData);
  return response.data;
};

export const toggleJobLike = async (jobId: number, userId: number): Promise<any> => {
  const response = await axios.post(`${API_URL}/jobs/${jobId}/like`, { user_id: userId });
  return response.data;
};

export const addJobComment = async (jobId: number, commentData: any): Promise<any> => {
  const response = await axios.post(`${API_URL}/jobs/${jobId}/comments`, commentData);
  return response.data;
};

export const getJobComments = async (jobId: number): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/jobs/${jobId}/comments`);
  return response.data;
};

export const toggleJobShare = async (jobId: number, userId: number): Promise<any> => {
  const response = await axios.post(`${API_URL}/jobs/${jobId}/share`, { user_id: userId });
  return response.data;
};

export const applyToJob = async (jobId: number, applicationData: any): Promise<any> => {
  const response = await axios.post(`${API_URL}/jobs/${jobId}/apply`, applicationData);
  return response.data;
};

export const getJobLikesCount = async (jobId: number): Promise<number> => {
  const response = await axios.get(`${API_URL}/jobs/${jobId}/likes/count`);
  return response.data.likes_count;
};

export const getJobApplications = async (jobId: number): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/jobs/${jobId}/applications`);
  return response.data;
};

// ============================================================
// ✅ ADD THIS - get single job
// ============================================================

export const getJob = async (jobId: number): Promise<Job> => {
  const response = await axios.get(`${API_URL}/jobs/${jobId}`);
  return response.data;
};