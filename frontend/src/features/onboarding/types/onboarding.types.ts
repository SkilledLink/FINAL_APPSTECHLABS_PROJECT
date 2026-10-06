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
 * Only `profession` and `city` are strictly required.
 * Everything else is optional and can be filled in later from the
 * profile page.
 */
export interface ProfessionalCreateInput {
  // ── required ────────────────────────────────────────────
  profession: string;

  // ── trade step ──────────────────────────────────────────
  headline?: string;
  bio?: string;
  experience_level?: ExperienceLevel;
  years_of_experience?: number;
  available?: boolean;

  // ── location step ───────────────────────────────────────
  country?: string;
  region?: string;
  city?: string;

  // ── services step ───────────────────────────────────────
  skills?: string[];
  services?: string[];
  hourly_rate?: number;
  currency?: string;
}

export const DEFAULT_WIZARD_STATE: ProfessionalCreateInput = {
  profession: "",
  headline: "",
  bio: "",
  experience_level: "intermediate",
  years_of_experience: undefined,
  available: true,
  country: "Cameroon",
  region: "",
  city: "",
  skills: [],
  services: [],
  hourly_rate: undefined,
  currency: "XAF",
};

/**
 * Shape received from `MapLocationPicker.onSelect`.
 * We type it loosely because the picker may forward additional
 * fields (latitude, longitude, formatted address, etc.).
 */
export interface PickedLocation {
  country?: string;
  region?: string;
  city?: string;
  [key: string]: unknown;
}