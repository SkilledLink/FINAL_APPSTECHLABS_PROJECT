// src/features/onboarding/services/onboardingService.ts

import { apiClient } from "../../../api/client";
import type { ProfessionalCreateInput } from "../types/onboarding.types";

export class OnboardingError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "OnboardingError";
    this.status = status;
  }
}

function toMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(", ");
  }
  return JSON.stringify(detail);
}

function cleanPayload(input: ProfessionalCreateInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

export const onboardingService = {
  async createProfessional(
    input: ProfessionalCreateInput,
  ): Promise<{ id: string }> {
    try {
      const { data } = await apiClient.post(
        "/professionals/",
        cleanPayload(input),
      );
      return data;
    } catch (err: any) {
      throw new OnboardingError(
        toMessage(err, "Failed to create professional profile"),
        err?.response?.status,
      );
    }
  },
};