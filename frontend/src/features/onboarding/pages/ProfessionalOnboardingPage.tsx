// src/features/onboarding/pages/ProfessionalOnboardingPage.tsx

import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { OnboardingLayout } from "../components/OnboardingLayout";
import {
  DEFAULT_WIZARD_STATE,
  EXPERIENCE_LEVELS,
  type ExperienceLevel,
  type PickedLocation,
  type ProfessionalCreateInput,
} from "../types/onboarding.types";
import { onboardingService, OnboardingError } from "../services/onboardingService";
import { MapLocationPicker } from "../../profile/components/MapLocationPicker";
import { useAuth } from "../../auth/hooks/useAuth";

/* ═══════════════════════════════════════════════════════════
   STEPS
═══════════════════════════════════════════════════════════ */

type StepId = "trade" | "location" | "services";

const STEPS: { id: StepId; label: string; icon: React.ReactNode }[] = [
  { id: "trade", label: "Your trade", icon: <Wrench size={15} /> },
  { id: "location", label: "Location", icon: <MapPin size={15} /> },
  { id: "services", label: "Services & rates", icon: <Sparkles size={15} /> },
];

/* ═══════════════════════════════════════════════════════════
   GLASS STYLE TOKENS
═══════════════════════════════════════════════════════════ */

const INPUT =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-900/50 " +
  "backdrop-blur-md border border-white/60 dark:border-slate-800/70 " +
  "text-sm text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/30 " +
  "focus:border-blue-500 focus:bg-white/90 dark:focus:bg-slate-900/70 " +
  "transition disabled:opacity-60 disabled:cursor-not-allowed";

const LABEL =
  "block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5";

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 " +
  "hover:bg-blue-700 active:scale-[0.98] px-5 py-2.5 text-sm font-bold " +
  "text-white shadow-md shadow-blue-600/25 transition " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white/60 " +
  "dark:bg-slate-900/50 backdrop-blur-md border border-white/60 " +
  "dark:border-slate-800/70 px-4 py-2.5 text-sm font-bold " +
  "text-slate-700 dark:text-slate-200 hover:bg-white/80 " +
  "dark:hover:bg-slate-900/80 transition disabled:opacity-50";

/* ═══════════════════════════════════════════════════════════
   TAG INPUT
═══════════════════════════════════════════════════════════ */

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  accent?: "blue" | "emerald";
  disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = "Type and press Enter",
  accent = "blue",
  disabled = false,
}) => {
  const [draft, setDraft] = useState("");

  const accentClasses =
    accent === "blue"
      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/70"
      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70";

  const add = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          disabled={disabled}
          className={INPUT}
        />
        <button
          type="button"
          onClick={add}
          disabled={disabled || !draft.trim()}
          className={BTN_PRIMARY}
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${accentClasses}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                disabled={disabled}
                className="hover:opacity-70"
                aria-label={`Remove ${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[11px] italic text-slate-400 dark:text-slate-500">
          Nothing added yet — you can add more later.
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */

export default function ProfessionalOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<ProfessionalCreateInput>(
    DEFAULT_WIZARD_STATE,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const currentStep = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const patch = useCallback(
    (p: Partial<ProfessionalCreateInput>) =>
      setState((prev) => ({ ...prev, ...p })),
    [],
  );

  /* ── Location picked from map ────────────────────────── */
  const handleLocationPick = useCallback(
    (loc: PickedLocation) => {
      patch({
        country: loc.country ?? state.country ?? "Cameroon",
        region: loc.region ?? state.region,
        city: loc.city ?? state.city,
      });
      setShowMap(false);
      toast.info("Location updated", { autoClose: 1500 });
    },
    [patch, state.country, state.region, state.city],
  );

  /* ── Validation ──────────────────────────────────────── */
  const canAdvance = useMemo(() => {
    if (currentStep.id === "trade") {
      return state.profession.trim().length >= 2;
    }
    if (currentStep.id === "location") {
      return state.city.trim().length >= 2;
    }
    return true;
  }, [currentStep.id, state.profession, state.city]);

  /* ── Navigation ──────────────────────────────────────── */
  const goNext = () => {
    if (!canAdvance) return;
    setError(null);
    if (isLast) {
      void submit();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    setError(null);
    if (stepIndex === 0) {
      navigate("/onboarding", { replace: true });
    } else {
      setStepIndex((i) => i - 1);
    }
  };

  /* ── Submit ──────────────────────────────────────────── */
  const submit = async () => {
    if (saving) return;

    if (!state.profession.trim()) {
      setError("Add your profession to continue.");
      setStepIndex(0);
      return;
    }
    if (!state.city.trim()) {
      setError("Add your city to continue.");
      setStepIndex(1);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onboardingService.createProfessional({
        ...state,
        profession: state.profession.trim(),
        city: state.city.trim(),
        region: state.region?.trim() || undefined,
        country: state.country?.trim() || "Cameroon",
        headline: state.headline?.trim() || undefined,
        bio: state.bio?.trim() || undefined,
      });

      toast.success("Professional profile created 🎉");
      navigate("/home", { replace: true });
    } catch (err) {
      const msg =
        err instanceof OnboardingError
          ? err.message
          : "Couldn't create your profile. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout maxWidth="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ══════════════ HEADER ══════════════ */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-3">
            <Briefcase size={12} />
            Setting up your professional profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {currentStep.id === "trade" && "What do you do?"}
            {currentStep.id === "location" && "Where do you work?"}
            {currentStep.id === "services" && "What can you offer?"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {currentStep.id === "trade" &&
              "Tell us your trade and a bit about yourself. Takes 30 seconds."}
            {currentStep.id === "location" &&
              "Clients search near them — a location makes you discoverable."}
            {currentStep.id === "services" &&
              "Optional. You can skip this and add more from your profile."}
          </p>
        </div>

        {/* ══════════════ PROGRESS ══════════════ */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <span>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <span>{currentStep.label}</span>
          </div>

          <div className="h-1.5 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded-full overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition ${
                    active
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      : done
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {done ? <Check size={11} /> : s.icon}
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════ ERROR ══════════════ */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200/70 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* ══════════════ STEP CONTENT ══════════════ */}
        <div className="rounded-3xl border border-white/60 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] p-5 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ─────────── STEP 1 · TRADE ─────────── */}
              {currentStep.id === "trade" && (
                <div className="space-y-5">
                  <div>
                    <label className={LABEL}>
                      Your profession <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state.profession}
                      onChange={(e) => patch({ profession: e.target.value })}
                      placeholder="e.g. Electrician, Plumber, Welder"
                      className={INPUT}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className={LABEL}>One-line headline</label>
                    <input
                      type="text"
                      value={state.headline ?? ""}
                      onChange={(e) => patch({ headline: e.target.value })}
                      placeholder="e.g. Certified electrician with 8 years in Douala"
                      maxLength={120}
                      className={INPUT}
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      {(state.headline ?? "").length}/120
                    </p>
                  </div>

                  <div>
                    <label className={LABEL}>Experience level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPERIENCE_LEVELS.map((lvl) => {
                        const active = state.experience_level === lvl.value;
                        return (
                          <button
                            key={lvl.value}
                            type="button"
                            onClick={() =>
                              patch({ experience_level: lvl.value as ExperienceLevel })
                            }
                            className={`text-left rounded-xl border px-3 py-2.5 transition ${
                              active
                                ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                : "border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <div className="text-sm font-bold">{lvl.label}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">
                              {lvl.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Years of experience</label>
                    <div className="relative">
                      <Clock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="number"
                        min={0}
                        max={80}
                        value={state.years_of_experience ?? ""}
                        onChange={(e) =>
                          patch({
                            years_of_experience:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        placeholder="e.g. 5"
                        className={`${INPUT} pl-9`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Short bio</label>
                    <textarea
                      rows={3}
                      value={state.bio ?? ""}
                      onChange={(e) => patch({ bio: e.target.value })}
                      placeholder="What kind of work do you do? What makes you stand out?"
                      maxLength={400}
                      className={`${INPUT} resize-none`}
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      {(state.bio ?? "").length}/400
                    </p>
                  </div>
                </div>
              )}

              {/* ─────────── STEP 2 · LOCATION ─────────── */}
              {currentStep.id === "location" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.06] p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Pick your base on the map
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          We'll fill in your city, region and country automatically.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className={BTN_PRIMARY}
                    >
                      Open map
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={LABEL}>
                        Country
                      </label>
                      <input
                        type="text"
                        value={state.country ?? ""}
                        onChange={(e) => patch({ country: e.target.value })}
                        placeholder="Cameroon"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Region</label>
                      <input
                        type="text"
                        value={state.region ?? ""}
                        onChange={(e) => patch({ region: e.target.value })}
                        placeholder="e.g. Littoral"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={state.city}
                        onChange={(e) => patch({ city: e.target.value })}
                        placeholder="e.g. Douala"
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-900/40 px-3.5 py-3">
                    <input
                      id="available-toggle"
                      type="checkbox"
                      checked={state.available ?? true}
                      onChange={(e) => patch({ available: e.target.checked })}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <label
                      htmlFor="available-toggle"
                      className="text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      I'm currently available for work
                    </label>
                  </div>
                </div>
              )}

              {/* ─────────── STEP 3 · SERVICES ─────────── */}
              {currentStep.id === "services" && (
                <div className="space-y-6">
                  <div>
                    <label className={LABEL}>Skills</label>
                    <TagInput
                      value={state.skills ?? []}
                      onChange={(next) => patch({ skills: next })}
                      placeholder="e.g. Wiring, Solar panels"
                      accent="blue"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Services you offer</label>
                    <TagInput
                      value={state.services ?? []}
                      onChange={(next) => patch({ services: next })}
                      placeholder="e.g. House rewiring, Fault finding"
                      accent="emerald"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Hourly rate</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 relative">
                        <DollarSign
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={state.hourly_rate ?? ""}
                          onChange={(e) =>
                            patch({
                              hourly_rate:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                            })
                          }
                          placeholder="e.g. 5000"
                          className={`${INPUT} pl-9`}
                        />
                      </div>
                      <select
                        value={state.currency ?? "XAF"}
                        onChange={(e) => patch({ currency: e.target.value })}
                        className={INPUT}
                      >
                        <option value="XAF">XAF</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="NGN">NGN</option>
                      </select>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Optional — you can leave this blank and negotiate per job.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ══════════════ FOOTER CONTROLS ══════════════ */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={saving}
            className={BTN_GHOST}
          >
            <ArrowLeft size={15} />
            {stepIndex === 0 ? "Back to account type" : "Back"}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance || saving}
            className={BTN_PRIMARY}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating…
              </>
            ) : isLast ? (
              <>
                Finish setup
                <Check size={15} />
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* ══════════════ FOOTER HINT ══════════════ */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <ChevronRight size={12} />
          <span>
            You can add more details any time from your profile page.
          </span>
        </div>
      </motion.div>

      {/* ══════════════ MAP MODAL ══════════════ */}
      {showMap && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-blue-950/70 backdrop-blur-2xl p-3 sm:p-6">
          <div className="w-full max-w-4xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden rounded-2xl border border-white/60 dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pick your location
                </h3>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close map"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <MapLocationPicker
                initialLocation={null}
                onSelect={handleLocationPick}
                onCancel={() => setShowMap(false)}
              />
            </div>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
}