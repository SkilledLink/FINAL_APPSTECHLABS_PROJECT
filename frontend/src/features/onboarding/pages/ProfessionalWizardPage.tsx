// src/features/onboarding/pages/ProfessionalWizardPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "../../auth/hooks/useAuth";
import { onboardingService } from "../services/onboardingService";
import { locationService } from "../../location/services/locationService";
import LocationPicker from "../../location/components/LocationPicker";
import type { ProfessionalLocationInput } from "../../location/types/location.types";

import {
  DEFAULT_WIZARD_STATE,
  EXPERIENCE_LEVELS,
  type ExperienceLevel,
  type ProfessionalCreateInput,
} from "../types/onboarding.types";
import { OnboardingLayout } from "../components/OnboardingLayout";

/* ───────────────────────── constants ───────────────────────── */

const TOTAL_STEPS = 2;

const STEPS = [
  { id: 1, label: "Profession", icon: Briefcase },
  { id: 2, label: "Location", icon: MapPin },
] as const;

const FIELD =
  "w-full rounded-2xl border border-slate-300/70 dark:border-slate-800/70 " +
  "bg-white/60 dark:bg-slate-950/40 backdrop-blur-md px-4 py-3 text-sm " +
  "text-slate-900 dark:text-white placeholder:text-slate-400 " +
  "focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 " +
  "transition-all duration-200";

const LABEL =
  "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";

/* ───────────────────────── page ───────────────────────── */

export default function ProfessionalWizardPage() {
  const navigate = useNavigate();

  const auth = useAuth() as any;
  const refreshUser: undefined | (() => Promise<any>) = auth?.refreshUser;
  const updateUser:
    | undefined
    | ((patch: Record<string, unknown>) => void) = auth?.updateUser;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProfessionalCreateInput>(
    DEFAULT_WIZARD_STATE,
  );

  const [locationData, setLocationData] =
    useState<ProfessionalLocationInput | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<ProfessionalCreateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const next = () => {
    setError(null);
    if (step === 1 && !form.profession.trim()) {
      setError("Please tell us your profession before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const back = () => {
    setError(null);
    if (step === 1) {
      navigate("/onboarding");
      return;
    }
    setStep((s) => s - 1);
  };

  const submit = async () => {
    setSaving(true);
    setError(null);

    /* ── 1. Create the Professional row ──────────────────── */
    try {
      await onboardingService.createProfessional({
        ...form,
        country: form.country || locationData?.country || undefined,
        region: form.region || locationData?.region || undefined,
        city: form.city || locationData?.city || undefined,
      });
    } catch (err: any) {
      if (err?.status === 409) {
        // Profile already exists — treat as success and continue.
        toast.info("You already have a professional profile.");
      } else {
        const msg =
          err?.message ?? "Something went wrong. Please try again.";
        setError(msg);
        toast.error(msg, { autoClose: 5000 });
        setSaving(false);
        return;
      }
    }

    /* ── 2. Sync local auth state ────────────────────────── */
    try {
      if (typeof updateUser === "function") {
        updateUser({ account_type: "professional" });
      }
    } catch (e) {
      console.warn("updateUser patch failed:", e);
    }

    /* ── 3. Save location (best effort) ──────────────────── */
    if (locationData) {
      try {
        await locationService.setMyLocation(locationData);
        try {
          await locationService.createServiceArea({
            center_latitude: locationData.latitude,
            center_longitude: locationData.longitude,
            radius_km: radiusKm,
            area_name:
              locationData.city ||
              locationData.region ||
              locationData.location_name ||
              "Primary service area",
          });
        } catch {
          /* service area is a nice-to-have */
        }
      } catch (locErr) {
        console.warn("Location save failed during onboarding:", locErr);
        toast.warn("Profile created — we couldn't save your location.");
      }
    }

    /* ── 4. Refresh user from server ─────────────────────── */
    // This rewrites localStorage.user with account_type="professional"
    // so the very first render after the reload below is consistent.
    try {
      if (typeof refreshUser === "function") {
        await refreshUser();
      }
    } catch (refreshErr) {
      console.warn("refreshUser failed:", refreshErr);
    }

    /* ── 5. HARD redirect to /home/profile ───────────────── */
    toast.success("🎉 Professional profile created!", {
      autoClose: 2500,
      position: "top-center",
    });

    // IMPORTANT: use window.location.replace, NOT navigate().
    //
    // A soft navigate() leaves stale React state in memory (sidebar,
    // header, account-type badge) and the user would have to press F5
    // to see their new professional profile. A full reload re-reads
    // localStorage (which refreshUser just updated) and rebuilds the
    // entire app tree with the correct user.
    window.location.replace("/home/profile");

    // No setSaving(false) — the page is being replaced.
  };

  return (
    <OnboardingLayout maxWidth="max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* HEADER */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-4">
            <Sparkles size={12} />
            Quick setup · 30 seconds
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {step === 1 ? "What do you do?" : "Where do you work?"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {step === 1
              ? "Two quick questions and you're done. You can add more later."
              : "So clients near you can find you. Pick your base on the map."}
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="mb-6 sm:mb-8 flex items-start justify-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-start">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      done
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : active
                          ? "border-blue-600 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-600/20 scale-110"
                          : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-400"
                    }`}
                  >
                    {done ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <span
                    className={`hidden sm:block text-[10px] font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? "text-blue-700 dark:text-blue-400"
                        : done
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1.5 sm:mx-3 h-[2px] w-8 sm:w-20 mt-5 rounded-full transition-colors duration-500 ${
                      step > s.id
                        ? "bg-blue-600"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* FORM CARD */}
        <div className="rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/55 dark:bg-slate-900/45 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              {/* ─────────────── STEP 1 · PROFESSION ─────────────── */}
              {step === 1 && (
                <>
                  <div>
                    <label className={LABEL}>
                      Your profession <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.profession}
                      onChange={(e) => update({ profession: e.target.value })}
                      placeholder="e.g. Electrician, Plumber, Welder"
                      className={FIELD}
                      autoFocus
                    />
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      Be specific — "Electrician" works better than "Handyman".
                    </p>
                  </div>

                  <div>
                    <label className={LABEL}>How experienced are you?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPERIENCE_LEVELS.map((lvl) => {
                        const active = form.experience_level === lvl.value;
                        return (
                          <button
                            key={lvl.value}
                            type="button"
                            onClick={() =>
                              update({
                                experience_level: lvl.value as ExperienceLevel,
                              })
                            }
                            className={`text-left rounded-2xl border-2 px-3.5 py-3 transition-all duration-200 ${
                              active
                                ? "border-blue-600 bg-blue-600/10 text-blue-700 dark:text-blue-300"
                                : "border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 hover:border-blue-500/40"
                            }`}
                          >
                            <div className="text-sm font-bold">
                              {lvl.label}
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                              {lvl.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-950/30 px-4 py-3">
                    <input
                      id="available-toggle"
                      type="checkbox"
                      checked={form.available ?? true}
                      onChange={(e) => update({ available: e.target.checked })}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <label
                      htmlFor="available-toggle"
                      className="text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      I'm available for work
                    </label>
                  </div>
                </>
              )}

              {/* ─────────────── STEP 2 · LOCATION ─────────────── */}
              {step === 2 && (
                <>
                  <LocationPicker
                    live
                    showRadius
                    initialLatitude={locationData?.latitude}
                    initialLongitude={locationData?.longitude}
                    initialName={locationData?.location_name}
                    initialRadiusKm={radiusKm}
                    onSave={async () => {
                      /* Not used in `live` mode */
                    }}
                    onLiveChange={(input, r) => {
                      setLocationData(input);
                      setRadiusKm(r);
                    }}
                  />

                  {locationData ? (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          Location set
                        </p>
                        <p className="truncate text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                          {locationData.location_name} · {radiusKm} km radius
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-[11px] italic text-slate-500 dark:text-slate-400">
                      Tap the map to set your base. You can also skip this
                      step — clients will just have a harder time finding you.
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* NAV */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={back}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft size={14} />
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={next}
                disabled={!form.profession.trim()}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {saving ? "Creating…" : "Finish setup"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
          You can add your bio, skills, rates and portfolio later from your
          profile page.
        </p>
      </motion.div>
    </OnboardingLayout>
  );
}