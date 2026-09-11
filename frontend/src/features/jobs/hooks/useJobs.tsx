// src/features/jobs/hooks/useJobs.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { jobService } from '../services/jobService';
import type {
  Job,
  JobListParams,
  JobCreateInput,
  JobUpdateInput,
  JobImageResponse,
  JobLikeResponse,
  JobCommentCreateInput,
  JobCommentResponse,
} from '../types/job.types';
import { useAuth } from '../../auth/hooks/useAuth';

/* ------------------------------------------------------------------ */
/*  List hook — stable deps, no refresh loop                           */
/* ------------------------------------------------------------------ */

export interface UseJobsResult {
  jobs: Job[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
  setPage: (page: number) => void;
  /** Optimistically patch a single job in the list (used by cards) */
  mutateJob: (jobId: string, patch: Partial<Job>) => void;
  /** Prepend a newly created job (used by CreateJobPage) */
  prependJob: (job: Job) => void;
}

export function useJobs(params: JobListParams = {}): UseJobsResult {
  const { page: initialPage = 1, size = 20, user_id, search } = params;

  // ⬇️ Only depend on primitives — never the whole user object
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;
  const authReady = isAuthenticated();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const fetchedKeyRef = useRef<string | null>(null);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!authReady) {
        setLoading(false);
        return;
      }

      const id = ++requestId.current;
      setLoading(true);
      setError(null);

      try {
        const res = await jobService.list({
          page: targetPage,
          size,
          user_id,
          search,
        });
        if (id !== requestId.current) return;

        setJobs((prev) => (append ? [...prev, ...res.items] : res.items));
        setTotal(res.total);
        setPageState(res.page);
      } catch (err: any) {
        if (id !== requestId.current) return;
        setError(err?.message ?? 'Failed to load jobs');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [size, user_id, search, authReady]
  );

  // Only re-run when the *query key* actually changes
  useEffect(() => {
    const key = `${userId ?? 'anon'}|${user_id ?? ''}|${search ?? ''}|${size}`;
    if (fetchedKeyRef.current === key && jobs.length > 0) {
      setLoading(false);
      return;
    }
    fetchedKeyRef.current = key;

    if (authReady) fetchPage(initialPage, false);
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user_id, search, size, authReady]);

  const refresh = useCallback(() => {
    fetchedKeyRef.current = null;
    fetchPage(1, false);
  }, [fetchPage]);

  const goToPage = useCallback(
    (p: number) => {
      setPageState(p);
      fetchPage(p, false);
    },
    [fetchPage]
  );

  const loadMore = useCallback(() => {
    if (loading || jobs.length >= total) return;
    fetchPage(page + 1, true);
  }, [loading, jobs.length, total, page, fetchPage]);

  const mutateJob = useCallback((jobId: string, patch: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, ...patch } : j))
    );
  }, []);

  const prependJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev]);
    setTotal((t) => t + 1);
  }, []);

  return {
    jobs,
    total,
    page,
    size,
    loading,
    error,
    hasMore: jobs.length < total,
    refresh,
    loadMore,
    setPage: goToPage,
    mutateJob,
    prependJob,
  };
}

/* ------------------------------------------------------------------ */
/*  Single job hook                                                    */
/* ------------------------------------------------------------------ */

export interface UseJobResult {
  job: Job | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  setJob: React.Dispatch<React.SetStateAction<Job | null>>;
}

export function useJob(jobId: string | undefined): UseJobResult {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      setJob(await jobService.get(jobId));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load job');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, loading, error, refresh: fetchJob, setJob };
}

/* ------------------------------------------------------------------ */
/*  Mutation hooks                                                     */
/* ------------------------------------------------------------------ */

export function useCreateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = useCallback(
    async (input: JobCreateInput): Promise<Job | null> => {
      setLoading(true);
      setError(null);
      try {
        return await jobService.create(input);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to create job');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createJob, loading, error };
}

export function useUpdateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJob = useCallback(
    async (jobId: string, input: JobUpdateInput): Promise<Job | null> => {
      setLoading(true);
      setError(null);
      try {
        return await jobService.update(jobId, input);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to update job');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateJob, loading, error };
}

export function useDeleteJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = useCallback(async (jobId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await jobService.remove(jobId);
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete job');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteJob, loading, error };
}

export function useToggleJobLike() {
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(
    async (jobId: string): Promise<JobLikeResponse | null> => {
      setLoading(true);
      try {
        return await jobService.toggleLike(jobId);
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { toggleLike, loading };
}

export function useJobImages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = useCallback(
    async (jobId: string, files: File[]): Promise<JobImageResponse[] | null> => {
      setLoading(true);
      setError(null);
      try {
        return await jobService.uploadImages(jobId, files);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to upload images');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await jobService.deleteImage(imageId);
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete image');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadImages, deleteImage, loading, error };
}

export function useJobComments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = useCallback(
    async (
      jobId: string,
      input: JobCommentCreateInput
    ): Promise<JobCommentResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        return await jobService.createComment(jobId, input);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to post comment');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await jobService.deleteComment(commentId);
        return true;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to delete comment');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createComment, deleteComment, loading, error };
}