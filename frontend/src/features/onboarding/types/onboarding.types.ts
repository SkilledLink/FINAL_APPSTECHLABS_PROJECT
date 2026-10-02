// src/features/onboarding/types/onboarding.types.ts

export type ExperienceLevel =
  | "junior"
  | "intermediate"
  | "senior"
  | "expert";

export const EXPERIENCE_LEVELS: {
  value: ExperienceLevel;
  label: string;
  desc: string;
}[] = [
  { value: "junior", label: "Junior", desc: "Just starting" },
  { value: "intermediate", label: "Intermediate", desc: "A few years" },
  { value: "senior", label: "Senior", desc: "Experienced" },
  { value: "expert", label: "Expert", desc: "Veteran" },
];

/**
 * What the professional onboarding wizard submits.
 *
 * Only `profession` is required. Location fields (city/region/country)
 * are merged in at submit time from the map picker's result.
 */
export interface ProfessionalCreateInput {
  profession: string;
  experience_level?: ExperienceLevel;
  available?: boolean;

  // Filled at submit time from the location picker
  country?: string;
  region?: string;
  city?: string;
}

export const DEFAULT_WIZARD_STATE: ProfessionalCreateInput = {
  profession: "",
  experience_level: "intermediate",
  available: true,
  country: "",
  region: "",
  city: "",
};