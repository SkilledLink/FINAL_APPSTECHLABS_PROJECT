// src/features/jobs/index.ts

/* Pages */
export { default as JobsPage } from './pages/JobsPage';
export { default as JobDetailsPage } from './pages/JobDetailsPage';
export { default as CreateJobPage } from './pages/CreateJobPage';

/* Components */
export { default as JobCard } from './components/JobCard';
export { default as JobGrid, JobGridSkeleton } from './components/JobGrid';
export { default as JobSearch } from './components/JobSearch';
export { default as JobFilters } from './components/JobFilters';
export { default as Avatar } from './components/Avatar';

/* Hooks */
export {
  useJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useToggleJobLike,
  useJobImages,
  useJobComments,
} from './hooks/useJobs';

/* Service */
export { jobService } from './services/jobService';

/* Types */
export type {
  Job,
  JobStatus,
  JobAuthor,
  JobImage,
  JobComment,
  JobListParams,
  JobListResponse,
  JobCreateInput,
  JobUpdateInput,
  JobImageResponse,
  JobLikeResponse,
  JobCommentCreateInput,
  JobCommentResponse,
} from './types/job.types';