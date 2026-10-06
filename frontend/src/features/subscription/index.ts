// src/features/subscription/index.ts

export { useSubscription } from './hooks/useSubscription';
export { useProposals } from './hooks/useProposals';
export { useAIUsage } from './hooks/useAIUsage';
export { subscriptionService } from './services/subscriptionService';

/* ── Components (barrel) ─────────────────────────────── */
export * from './components';

/* ── Types ───────────────────────────────────────────── */
export type {
  ActiveSubscriptionResponse,
  AIProposal,
  AIUsageItem,
  AIUsageResponse,
  AnalyzeImageRequest,
  BatchAcceptResponse,
  BatchItemResult,
  BatchRejectResponse,
  DeepAnalysisGap,
  DeepAnalysisRecommendation,
  DeepAnalysisResponse,
  DeepAnalysisSectionScore,
  Entitlements,
  ImageAnalysisResponse,
  PaymentProvider,
  PaymentStatus,
  ProposalStatus,
  Subscription,
  TierBadgeConfig,
  TierDetail,
  TierFeature,
  TierInfo,
} from './types/subscription.types';

export type {
  DeepAnalysisUsageInfo,
  UseAIUsageOptions,
} from './hooks/useAIUsage';