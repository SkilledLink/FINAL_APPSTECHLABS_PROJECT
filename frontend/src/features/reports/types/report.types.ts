// src/features/reports/types/report.types.ts
export type ReportTargetType = 'user' | 'professional' | 'job' | 'feed';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'fraud'
  | 'inappropriate_content'
  | 'fake_account'
  | 'scam'
  | 'impersonation'
  | 'other';

export interface ReportReasonOption {
  value: ReportReason;
  label: string;
  description: string;
}

export const REPORT_REASONS: ReportReasonOption[] = [
  { value: 'spam',                  label: 'Spam',                    description: 'Repetitive, unwanted, or promotional content' },
  { value: 'harassment',            label: 'Harassment',              description: 'Bullying, threats, or targeted abuse' },
  { value: 'fraud',                 label: 'Fraud',                   description: 'Deceptive activity or misrepresentation' },
  { value: 'inappropriate_content', label: 'Inappropriate content',   description: 'Content that violates community guidelines' },
  { value: 'fake_account',          label: 'Fake account',            description: 'Impersonation or bot account' },
  { value: 'scam',                  label: 'Scam',                    description: 'Attempting to defraud users' },
  { value: 'impersonation',         label: 'Impersonation',           description: 'Pretending to be someone else' },
  { value: 'other',                 label: 'Other',                   description: 'Something else — please describe below' },
];

export interface CreateReportInput {
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description?: string;
}