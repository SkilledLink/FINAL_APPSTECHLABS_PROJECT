// src/features/subscription/types/subscription.types.ts

/* ── Tiers ─────────────────────────────────────────────────── */

export interface TierBadgeConfig {
  tier_id: string;
  level: number;
  name: string;
  badge_name: string | null;
  badge_code: string | null;
  badge_icon: string | null;
  badge_color: string | null;
  badge_secondary_color: string | null;
  badge_shape: string | null;
}

export interface TierInfo {
  id: string;
  name: string;
  level: number;
  description: string | null;
  price: string;
  currency: string;
  duration_days: number;
  badge_name: string | null;
  badge_code: string | null;
  badge_icon: string | null;
  badge_color: string | null;
  badge_secondary_color: string | null;
  badge_shape: string | null;
  badge_description: string | null;
  is_active: boolean;
  is_public: boolean;
  display_order: number;
}

export interface Subscription {
  id: string;
  professional_id: string;
  tier_id: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';
  starts_at: string | null;
  expires_at: string | null;
  auto_renew: boolean;
  cancelled_at: string | null;
  previous_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  tier: TierInfo | null;
}

export interface ActiveSubscriptionResponse {
  is_active: boolean;
  days_remaining: number | null;
  subscription: Subscription | null;
}

export type Entitlements = Record<string, Record<string, any>>;

export interface TierFeature {
  id: string;
  tier_id: string;
  feature_key: string;
  feature_name: string;
  feature_description: string | null;
  feature_type: 'boolean' | 'limit' | 'quota' | 'text' | 'json';
  feature_value: Record<string, any> | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TierDetail extends TierInfo {
  features: TierFeature[];
}

export interface TierListResponse {
  items: TierDetail[];
  total: number;
}

/* ── AI proposals ─────────────────────────────────────────── */

export type ProposalStatus =
  | 'pending' | 'accepted' | 'rejected' | 'expired' | 'superseded';

export interface AIProposal {
  id: string;
  professional_id: string;
  feature_key: string;
  field_path: string;
  current_value: string | null;
  proposed_value: string;
  reason: string | null;
  impact: 'high' | 'medium' | 'low';
  status: ProposalStatus;
  accepted_value: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface ListProposalsResponse {
  items: AIProposal[];
  total: number;
}

export interface BatchItemResult {
  proposal_id: string;
  field_path: string | null;
  applied_to: string | null;
  new_value: string | null;
  error: string | null;
}

export interface BatchAcceptResponse {
  accepted: BatchItemResult[];
  failed: BatchItemResult[];
  total_accepted: number;
  total_failed: number;
}

export interface BatchRejectResponse {
  rejected: BatchItemResult[];
  failed: BatchItemResult[];
  total_rejected: number;
  total_failed: number;
}

/* ── Deep analysis ────────────────────────────────────────── */

export interface DeepAnalysisSectionScore {
  score: number;
  weight: number;
  notes: string;
}

export interface DeepAnalysisGap {
  severity: 'high' | 'medium' | 'low' | string;
  area: string;
  message: string;
}

export interface DeepAnalysisRecommendation {
  priority: 'high' | 'medium' | 'low' | string;
  action: string;
}

export interface DeepAnalysisResponse {
  summary: string;
  overall_score: number;
  grade: string;
  section_scores: Record<string, DeepAnalysisSectionScore>;
  gaps: DeepAnalysisGap[];
  recommendations: DeepAnalysisRecommendation[];
  suggested_next_actions: string[];
  provider: string;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
}

/* ── AI usage ─────────────────────────────────────────────── */

export interface AIUsageItem {
  feature_key: string;
  feature_name: string;
  usage_count: number;
  usage_limit: number;
  remaining: number;
  period_start: string;
  period_end: string;
}

export interface AIUsageResponse {
  items: AIUsageItem[];
  total: number;
}

/* ── Payment ──────────────────────────────────────────────── */

export type PaymentProvider = 'mtn_momo' | 'orange_money';

export type PaymentStatus =
  | 'pending' | 'processing' | 'success' | 'failed'
  | 'cancelled' | 'refunded' | 'expired';

export interface PaymentInitiateRequest {
  tier_id: string;
  provider: PaymentProvider;
  payment_method: 'mobile_money';
  phone_number: string;
  description?: string;
}

export interface PaymentInitiateResponse {
  payment_id: string;
  reference: string;
  amount: string;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  instructions: string | null;
  message: string | null;
}

/** Server-side payment status polling response */
export interface PaymentStatusResponse {
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | string;
  reason?: string | null;
  financial_transaction_id?: string | null;
  amount?: string;
  currency?: string;
}