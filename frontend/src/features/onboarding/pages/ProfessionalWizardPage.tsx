// src/features/onboarding/pages/ProfessionalWizardPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Wrench,
  X,
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

const TOTAL_STEPS = 3;

const STEPS = [
  { id: 1, label: "Profession", icon: Briefcase },
  { id: 2, label: "Skills", icon: Wrench },
  { id: 3, label: "Location", icon: MapPin },
] as const;

const FIELD =
  "w-full rounded-2xl border border-slate-300/70 dark:border-slate-800/70 " +
  "bg-white/60 dark:bg-slate-950/40 backdrop-blur-md px-4 py-3 text-sm " +
  "text-slate-900 dark:text-white placeholder:text-slate-400 " +
  "focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 " +
  "transition-all duration-200";

const LABEL =
  "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";

/* ───────────────────────── Chip input ───────────────────────── */

function ChipInput({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div>
      <label className={LABEL}>{label}</label>
      {hint && (
        <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={FIELD}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="shrink-0 rounded-2xl bg-blue-600 px-4 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="ml-0.5 text-blue-600/70 hover:text-rose-500 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function ProfessionalWizardPage() {
  const navigate = useNavigate();

  // Grab everything we might need from the auth hook. Depending on how
  // your AuthProvider is wired, either one of these will exist.
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

    /* ── 1. Create the Professional row (critical) ────────── */
    try {
      await onboardingService.createProfessional({
        ...form,
        country: form.country || locationData?.country || undefined,
        region: form.region || locationData?.region || undefined,
        city: form.city || locationData?.city || undefined,
      });
    } catch (err: any) {
      // 409 = user already has a Professional row — treat as success
      if (err?.status === 409) {
        toast.info("You already have a professional profile.");
      } else {
        const msg = err?.message ?? "Something went wrong. Please try again.";
        setError(msg);
        toast.error(msg, { autoClose: 5000 });
        setSaving(false);
        return;
      }
    }

    /* ── 2. Sync local auth state IMMEDIATELY ──────────────
     * The backend has just flipped account_type to "professional".
     * React holds the OLD user object in memory, so if we navigate
     * to /home right now, HomePage still thinks we're a regular user
     * and renders stale UI. Patch the local user first.
     */
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

    /* ── 4. Refresh from server (best effort) ────────────── */
    try {
      if (typeof refreshUser === "function") {
        await refreshUser();
      }
    } catch (refreshErr) {
      console.warn("refreshUser failed:", refreshErr);
    }

    /* ── 5. Success + navigate ───────────────────────────── */
    toast.success("🎉 Professional profile created!", {
      autoClose: 4000,
      position: "top-center",
    });

    // Small delay so the toast is visible before the route swap.
    window.setTimeout(() => {
      navigate("/home", { replace: true });
    }, 700);

    setSaving(false);
  };

  return (
    <OnboardingLayout maxWidth="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* HEADER */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-4">
            <Sparkles size={12} />
            Professional setup
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Build your professional profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Just a few details and you'll be ready to get discovered. You can
            edit everything later from your dashboard.
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
              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Tell us what you do
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      This is the first thing clients will see when they find
                      you.
                    </p>
                  </div>

                  <div>
                    <label className={LABEL}>
                      Profession <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.profession}
                      onChange={(e) => update({ profession: e.target.value })}
                      placeholder="e.g. Electrician, Plumber, Graphic Designer"
                      className={FIELD}
                      autoFocus
                    />
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      Be specific — "Electrician" works better than "Handyman".
                    </p>
                  </div>

                  <div>
                    <label className={LABEL}>Experience level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() =>
                            update({
                              experience_level: lvl.value as ExperienceLevel,
                            })
                          }
                          className={`rounded-2xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                            form.experience_level === lvl.value
                              ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                              : "border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 hover:border-blue-500/40"
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Years of experience</label>
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={form.years_of_experience ?? ""}
                      onChange={(e) =>
                        update({
                          years_of_experience:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      placeholder="e.g. 5"
                      className={FIELD}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Short headline</label>
                    <input
                      value={form.headline ?? ""}
                      onChange={(e) => update({ headline: e.target.value })}
                      placeholder="e.g. Emergency electrician available 24/7 in Douala"
                      className={FIELD}
                    />
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      A one-line pitch — keep it under 80 characters.
                    </p>
                  </div>

                  <div>
                    <label className={LABEL}>About you</label>
                    <textarea
                      rows={4}
                      value={form.bio ?? ""}
                      onChange={(e) => update({ bio: e.target.value })}
                      placeholder="Tell clients a bit about your background, what you love about your craft, and what makes you different…"
                      className={`${FIELD} resize-none`}
                    />
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Showcase your expertise
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Skills and rate help clients pick you over others.
                    </p>
                  </div>

                  <ChipInput
                    label="Skills"
                    hint="Add skills one at a time, then press Enter."
                    values={form.skills ?? []}
                    onChange={(v) => update({ skills: v })}
                    placeholder="e.g. Wiring, Troubleshooting, Solar Install"
                  />

                  <ChipInput
                    label="Services you offer"
                    hint="Concrete services clients can hire you for."
                    values={form.services ?? []}
                    onChange={(v) => update({ services: v })}
                    placeholder="e.g. Home electrical audit, Panel upgrade"
                  />

                  <ChipInput
                    label="Languages you speak"
                    values={form.languages ?? []}
                    onChange={(v) => update({ languages: v })}
                    placeholder="e.g. English, French"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Hourly rate</label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={form.hourly_rate ?? ""}
                        onChange={(e) =>
                          update({
                            hourly_rate:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        placeholder="e.g. 5000"
                        className={FIELD}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Currency</label>
                      <select
                        value={form.currency}
                        onChange={(e) => update({ currency: e.target.value })}
                        className={FIELD}
                      >
                        <option value="XAF">XAF — Central African Franc</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                        <option value="NGN">NGN — Nigerian Naira</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Where can clients find you?
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Optional, but recommended — it makes you discoverable in
                      nearby searches and on the map.
                    </p>
                  </div>

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

                  {locationData && (
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
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className={LABEL}>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={12} className="text-blue-500" />
                          Average response time (hours)
                        </span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={168}
                        value={form.response_time_hours ?? ""}
                        onChange={(e) =>
                          update({
                            response_time_hours:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        placeholder="e.g. 2"
                        className={FIELD}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Are you available now?</label>
                      <button
                        type="button"
                        onClick={() => update({ available: !form.available })}
                        className={`w-full rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          form.available
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {form.available
                          ? "✓ Accepting work now"
                          : "Not available right now"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Availability notes</label>
                    <textarea
                      rows={2}
                      value={form.availability_notes ?? ""}
                      onChange={(e) =>
                        update({ availability_notes: e.target.value })
                      }
                      placeholder="e.g. Weekdays 8am–6pm, weekends by appointment"
                      className={`${FIELD} resize-none`}
                    />
                  </div>

                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                    <strong className="font-semibold">Almost there!</strong>{" "}
                    Once you submit, your professional profile goes live and
                    clients can start finding and messaging you.
                  </div>
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
                className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 active:scale-[0.98] transition-all cursor-pointer"
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
                {saving ? "Creating your profile…" : "Create my profile"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}