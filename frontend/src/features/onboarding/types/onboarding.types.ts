// src/features/onboarding/types/onboarding.types.ts

export type ExperienceLevel = "junior" | "intermediate" | "senior" | "expert";

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "intermediate", label: "Intermediate" },
  { value: "senior", label: "Senior" },
  { value: "expert", label: "Expert" },
];

export interface ProfessionalCreateInput {
  profession: string;
  experience_level: ExperienceLevel;
  years_of_experience?: number;
  headline?: string;
  bio?: string;

  skills?: string[];
  services?: string[];
  languages?: string[];

  hourly_rate?: number;
  currency: string;
  available: boolean;
  availability_notes?: string;
  response_time_hours?: number;

  country?: string;
  region?: string;
  city?: string;
}

export const DEFAULT_WIZARD_STATE: ProfessionalCreateInput = {
  profession: "",
  experience_level: "intermediate",
  years_of_experience: undefined,
  headline: "",
  bio: "",
  skills: [],
  services: [],
  languages: [],
  hourly_rate: undefined,
  currency: "XAF",
  available: true,
  availability_notes: "",
  response_time_hours: undefined,
  country: "",
  region: "",
  city: "",
};