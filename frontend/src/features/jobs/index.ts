export { default as JobsPage } from './pages/JobsPage';
export { default as JobDetailsPage } from './pages/JobDetailsPage';
export { default as CreateJobPage } from './pages/CreateJobPage';
export { default as MyApplicationsPage } from './pages/MyApplicationsPage';

export { default as JobCard } from './components/JobCard';
export { default as JobGrid, JobGridSkeleton } from './components/JobGrid';
export { default as JobSearch } from './components/JobSearch';
export { default as JobFilters } from './components/JobFilters';
export { default as JobApplicationForm } from './components/JobApplicationForm';
export { default as MatchScore } from './components/MatchScore';
export { default as Avatar } from './components/Avatar';

export { JobsProvider, useJobs } from './hooks/useJobs';

export type {
  Job,
  Poster,
  Comment,
  Review,
  Application,
  PostJobInput,
  JobType,
  JobStatus,
  JobCategory,
  CameroonCity,
  JobFilters as JobFiltersType,
} from './types/job.types';

export {
  CAMEROON_CITIES,
  JOB_CATEGORIES,
  JOB_TYPES,
} from './types/job.types';
