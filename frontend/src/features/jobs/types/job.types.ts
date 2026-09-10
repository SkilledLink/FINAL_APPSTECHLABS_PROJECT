export type JobType = 'Full-time' | 'Contract' | 'Freelance' | 'Part-time' | 'Internship';

export type JobStatus = 'active' | 'closed';

export type JobCategory =
  | 'Technology'
  | 'Finance & Fintech'
  | 'Design & Creative'
  | 'Engineering'
  | 'Marketing'
  | 'Sales & Retail'
  | 'Education'
  | 'Healthcare'
  | 'Trades & Construction'
  | 'Logistics';

export type CameroonCity =
  | 'Douala'
  | 'Yaoundé'
  | 'Bamenda'
  | 'Buea'
  | 'Garoua'
  | 'Limbe'
  | 'Bafoussam'
  | 'Kribi'
  | 'Maroua'
  | 'Ngaoundéré';

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Poster {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  memberSince: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  poster: Poster;
  category: JobCategory;
  location: CameroonCity;
  jobType: JobType;
  salaryMin: number;
  salaryMax: number;
  postedAt: string;
  status: JobStatus;
  skills: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  shares: number;
  matchScore: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  posterName: string;
  posterAvatar: string;
  location: string;
  message: string;
  appliedAt: string;
  status: 'sent' | 'viewed' | 'replied';
}

export interface PostJobInput {
  title: string;
  posterName: string;
  posterTitle: string;
  posterCompany: string;
  category: JobCategory;
  location: CameroonCity;
  jobType: JobType;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export interface JobFilters {
  search: string;
  category: JobCategory | 'All';
  location: CameroonCity | 'All';
  jobType: JobType | 'All';
  status: JobStatus | 'All';
  minSalary: number;
}

export const CAMEROON_CITIES: CameroonCity[] = [
  'Douala',
  'Yaoundé',
  'Bamenda',
  'Buea',
  'Garoua',
  'Limbe',
  'Bafoussam',
  'Kribi',
  'Maroua',
  'Ngaoundéré',
];

export const JOB_CATEGORIES: JobCategory[] = [
  'Technology',
  'Finance & Fintech',
  'Design & Creative',
  'Engineering',
  'Marketing',
  'Sales & Retail',
  'Education',
  'Healthcare',
  'Trades & Construction',
  'Logistics',
];

export const JOB_TYPES: JobType[] = [
  'Full-time',
  'Contract',
  'Freelance',
  'Part-time',
  'Internship',
];
