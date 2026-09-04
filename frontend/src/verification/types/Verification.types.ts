export type VerificationStatusType =
  | "pending"
  | "approved"
  | "requires_action"
  | "unsubmitted";

export interface CredentialItem {
  id: string;
  title: string;
  description: string;
  status: VerificationStatusType;
  fileName: string | null;
  actionRequired?: boolean;
}

export interface VerificationDocument {
  id: string;
  title: string;
  description: string;
  status: VerificationStatusType;
  fileName?: string;
  fileSize?: string;
  updatedAt?: string;
}

export interface VerificationState {
  documents: VerificationDocument[];
  progress: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}
