import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Application, Comment, Job, JobFilters, PostJobInput } from '../types/job.types';
import * as jobService from '../services/jobService';

interface JobsContextValue {
  jobs: Job[];
  applications: Application[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  setFilters: (filters: Partial<JobFilters>) => void;
  filteredJobs: Job[];
  toggleLike: (jobId: string) => Promise<void>;
  addComment: (jobId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  shareJob: (jobId: string) => Promise<void>;
  postJob: (data: PostJobInput) => Promise<Job[]>;
  applyToJob: (app: Omit<Application, 'id' | 'appliedAt' | 'status'>) => Promise<void>;
  getJobById: (id: string) => Job | undefined;
  refresh: () => void;
}

const defaultFilters: JobFilters = {
  search: '',
  category: 'All',
  location: 'All',
  jobType: 'All',
  status: 'All',
  minSalary: 0,
};

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<JobFilters>(defaultFilters);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [j, a] = await Promise.all([jobService.fetchJobs(), jobService.fetchApplications()]);
      setJobs(j);
      setApplications(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const setFilters = useCallback((partial: Partial<JobFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const titleMatch = job.title.toLowerCase().includes(q);
        const skillMatch = job.skills.some((s) => s.toLowerCase().includes(q));
        const companyMatch = job.poster.company.toLowerCase().includes(q);
        if (!titleMatch && !skillMatch && !companyMatch) return false;
      }
      if (filters.category !== 'All' && job.category !== filters.category) return false;
      if (filters.location !== 'All' && job.location !== filters.location) return false;
      if (filters.jobType !== 'All' && job.jobType !== filters.jobType) return false;
      if (filters.status !== 'All' && job.status !== filters.status) return false;
      if (filters.minSalary > 0 && job.salaryMax < filters.minSalary) return false;
      return true;
    });
  }, [jobs, filters]);

  const toggleLike = useCallback(async (jobId: string) => {
    const updated = await jobService.toggleLike(jobId);
    setJobs(updated);
  }, []);

  const addComment = useCallback(async (jobId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const updated = await jobService.addComment(jobId, comment);
    setJobs(updated);
  }, []);

  const shareJob = useCallback(async (jobId: string) => {
    const updated = await jobService.shareJob(jobId);
    setJobs(updated);
  }, []);

  const postJob = useCallback(async (data: PostJobInput) => {
    const updated = await jobService.postJob(data);
    setJobs(updated);
    return updated;
  }, []);

  const applyToJob = useCallback(async (app: Omit<Application, 'id' | 'appliedAt' | 'status'>) => {
    const updated = await jobService.createApplication(app);
    setApplications(updated);
  }, []);

  const getJobById = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  const value: JobsContextValue = {
    jobs,
    applications,
    loading,
    error,
    filters,
    setFilters,
    filteredJobs,
    toggleLike,
    addComment,
    shareJob,
    postJob,
    applyToJob,
    getJobById,
    refresh: loadAll,
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs(): JobsContextValue {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within JobsProvider');
  return ctx;
}
