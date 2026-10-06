// src/features/admin/constants/aiFeatures.ts
/**
 * Catalog of every AI feature the backend actually enforces.
 *
 * Each `key` MUST match the FEATURE_KEY constant in the corresponding
 * file under app/services/ai/features/:
 *
 *   ai_portfoliou_sggestions      → portfolio_suggestions.py
 *   ai_profile_optimization       → profile_optimization.py
 *   ai_image_analysis             → image_analysis.py
 *   ai_portfolio_deep_analysis    → portfolio_deep_analysis.py
 *
 * The backend reads feature_value = { limit: <int>, period: "<str>" }
 * via ProfessionalAIUsageService.check() / increment().
 */

export type FeaturePeriod = 'daily' | 'weekly' | 'monthly';

export interface AIFeatureDef {
  /** Backend FEATURE_KEY — must match exactly. */
  key: string;
  /** Human label shown in the picker. */
  name: string;
  /** One-line explanation shown under the picker. */
  description: string;
  /** Minimum subscription tier level required (matches tier_provider.py). */
  minTierLevel: 2 | 3;
  /** Which provider runs it, purely informational. */
  provider: 'groq' | 'gemini';
  /** Suggested default quantity. */
  defaultLimit: number;
  /** Suggested default period. */
  defaultPeriod: FeaturePeriod;
}

export const AI_FEATURE_CATALOG: AIFeatureDef[] = [
  {
    key: 'ai_portfoliou_sggestions',
    name: 'AI Portfolio Suggestions',
    description:
      'Text advice on improving profile, services and works. Runs on Groq.',
    minTierLevel: 2,
    provider: 'groq',
    defaultLimit: 10,
    defaultPeriod: 'monthly',
  },
  {
    key: 'ai_profile_optimization',
    name: 'AI Profile Optimization',
    description:
      'Generates before/after proposal rewrites for profile & portfolio text fields. Runs on Groq.',
    minTierLevel: 2,
    provider: 'groq',
    defaultLimit: 5,
    defaultPeriod: 'monthly',
  },
  {
    key: 'ai_image_analysis',
    name: 'AI Image Analysis',
    description:
      'Gemini vision — describes a photo, scores quality, suggests a caption.',
    minTierLevel: 3,
    provider: 'gemini',
    defaultLimit: 15,
    defaultPeriod: 'monthly',
  },
  {
    key: 'ai_portfolio_deep_analysis',
    name: 'AI Deep Portfolio Analysis',
    description:
      'Full-portfolio review with score, section breakdown, gaps & next actions. Runs on Gemini.',
    minTierLevel: 3,
    provider: 'gemini',
    defaultLimit: 6,
    defaultPeriod: 'monthly',
  },
];

/** Look up an AI feature definition by its backend key. */
export function findAIFeature(key: string): AIFeatureDef | undefined {
  return AI_FEATURE_CATALOG.find((f) => f.key === key);
}

export const PERIOD_OPTIONS: {
  value: FeaturePeriod;
  label: string;
}[] = [
  { value: 'daily', label: 'per day' },
  { value: 'weekly', label: 'per week' },
  { value: 'monthly', label: 'per month' },
];