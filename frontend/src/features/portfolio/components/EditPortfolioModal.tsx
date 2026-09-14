// src/features/portfolio/components/EditPortfolioModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Loader2,
  Save,
  X,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Tag as TagIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { Portfolio, PortfolioUpdateInput } from '../types/portfolio.types';

interface EditPortfolioModalProps {
  open: boolean;
  portfolio: Portfolio;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (input: PortfolioUpdateInput) => Promise<void>;
}

/* ───────────────────────── Glass design tokens ───────────────────────── */

const GLASS_LABEL =
  'mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300';

const GLASS_INPUT =
  'w-full rounded-lg border border-white/50 dark:border-white/10 ' +
  'bg-white/60 dark:bg-slate-800/40 backdrop-blur-md ' +
  'px-3.5 py-2.5 text-sm text-slate-900 dark:text-white ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:bg-white/90 dark:focus:bg-slate-900/70 ' +
  'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 ' +
  'transition-all duration-200 shadow-sm ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const GLASS_SECTION_TITLE =
  'mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100';

const GLASS_PREVIEW_GROUP =
  'rounded-lg border border-white/50 bg-white/40 p-4 backdrop-blur-md ' +
  'dark:border-white/10 dark:bg-slate-800/30';

const GLASS_PREVIEW_GROUP_TITLE =
  'mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400';

const GLASS_CHECK_LABEL = (saving: boolean) =>
  'inline-flex items-center gap-2 rounded-lg border border-white/50 ' +
  'bg-white/50 px-3 py-2 backdrop-blur-md transition-all ' +
  'dark:border-white/10 dark:bg-slate-800/40 ' +
  (saving
    ? 'cursor-not-allowed opacity-60'
    : 'cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/60');

const GLASS_CHECKBOX =
  'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 ' +
  'dark:border-slate-700 dark:bg-slate-950';

/* ─────────────────────────────────────────────────────────────────────── */

const STEPS = [
  { id: 0, label: 'Identity', icon: User },
  { id: 1, label: 'Contact', icon: Phone },
  { id: 2, label: 'Coverage', icon: MapPin },
  { id: 3, label: 'Trust', icon: ShieldCheck },
  { id: 4, label: 'Preview', icon: CheckCircle2 },
] as const;

const EMPTY_HYDRATE = (portfolio: Portfolio): PortfolioUpdateInput => ({
  headline: portfolio.headline ?? '',
  tagline: portfolio.tagline ?? '',
  bio: portfolio.bio ?? '',
  mission_statement: portfolio.mission_statement ?? '',
  business_name: portfolio.business_name ?? '',
  business_description: portfolio.business_description ?? '',
  years_experience: portfolio.years_experience ?? undefined,
  years_in_business: portfolio.years_in_business ?? undefined,
  team_size: portfolio.team_size ?? undefined,
  cover_image_url: portfolio.cover_image_url ?? '',
  intro_video_url: portfolio.intro_video_url ?? '',
  phone: portfolio.phone ?? '',
  whatsapp: portfolio.whatsapp ?? '',
  email: portfolio.email ?? '',
  website_url: portfolio.website_url ?? '',
  linkedin_url: portfolio.linkedin_url ?? '',
  facebook_url: portfolio.facebook_url ?? '',
  instagram_url: portfolio.instagram_url ?? '',
  tiktok_url: portfolio.tiktok_url ?? '',
  country: portfolio.country ?? '',
  region: portfolio.region ?? '',
  city: portfolio.city ?? '',
  service_area: portfolio.service_area ?? '',
  service_radius_km: portfolio.service_radius_km ?? undefined,
  travels_to_client: portfolio.travels_to_client ?? false,
  works_remotely: portfolio.works_remotely ?? false,
  license_number: portfolio.license_number ?? '',
  license_authority: portfolio.license_authority ?? '',
  insurance_provider: portfolio.insurance_provider ?? '',
  currency: portfolio.currency ?? 'USD',
  payment_methods: portfolio.payment_methods ?? [],
  accepts_negotiation: portfolio.accepts_negotiation ?? true,
  tags: portfolio.tags ?? [],
  languages: portfolio.languages ?? [],
  is_public: portfolio.is_public ?? true,
});

export default function EditPortfolioModal({
  open,
  portfolio,
  saving = false,
  onClose,
  onSubmit,
}: EditPortfolioModalProps) {
  /* ── ALL HOOKS FIRST ────────────────────────────────────────────── */
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PortfolioUpdateInput>({});
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const initialFormRef = useRef<PortfolioUpdateInput | null>(null);

  /* Hydrate + scroll lock + escape + reset step on open */
  useEffect(() => {
    if (!open) return;

    const hydrated = EMPTY_HYDRATE(portfolio);
    setForm(hydrated);
    initialFormRef.current = hydrated;
    setStep(0);
    setTagInput('');
    setError(null);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(
      () => firstFieldRef.current?.focus(),
      50
    );

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, portfolio, saving, onClose]);

  const identityOk = useMemo(
    () => Boolean(form.business_name?.trim() || form.headline?.trim()),
    [form.business_name, form.headline]
  );

  const hasChanges = useMemo(() => {
    if (!initialFormRef.current) return false;
    return JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
  }, [form]);

  const canProceed = step === 0 ? identityOk : true;
  const canUpdate = hasChanges && identityOk;

  /* ── EARLY RETURN ONLY AFTER EVERY HOOK ─────────────────────────── */
  if (!open) return null;

  /* ── Handlers (not hooks) ───────────────────────────────────────── */
  const update = (patch: Partial<PortfolioUpdateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const current = form.tags ?? [];
    if (!current.includes(t)) update({ tags: [...current, t] });
    setTagInput('');
  };

  const removeTag = (t: string) =>
    update({ tags: (form.tags ?? []).filter((x) => x !== t) });

  const goNext = () => {
    setError(null);
    if (step === 0 && !identityOk) {
      setError('Please keep at least a business name or a headline.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  /* Explicit — no form auto-submit can reach this. */
  const handleUpdate = async () => {
    if (saving || !canUpdate) return;
    setError(null);

    try {
      await onSubmit(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save changes. Please try again.'
      );
    }
  };

  const isLast = step === STEPS.length - 1;

  /* ── render ─────────────────────────────────────────────────────── */
  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto
                 p-3 pt-4 pb-4 sm:items-center sm:p-6
                 bg-blue-950/75 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-portfolio-title"
    >
      <div
        className="fixed inset-0"
        onClick={!saving ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        className="relative my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl
                   border border-white/60 dark:border-white/10
                   bg-white/90 dark:bg-slate-900/90
                   shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]
                   backdrop-blur-3xl max-h-[88vh]"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 shrink-0 border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <h3
                id="edit-portfolio-title"
                className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                Edit Portfolio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {step + 1} of {STEPS.length} — {STEPS[step].label}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-md
                         bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800
                         text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="mt-4 flex items-center">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div
                  key={s.id}
                  className="flex flex-1 items-center last:flex-none"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      done
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : active
                        ? 'border-blue-600 bg-white text-blue-600 shadow-sm shadow-blue-500/20 dark:bg-slate-900 dark:text-blue-400'
                        : 'border-slate-200 bg-white/60 text-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500'
                    }`}
                    aria-label={s.label}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-1.5 h-[2px] flex-1 rounded-full transition-all duration-300 ${
                        done ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* INERT form — prevents implicit auto-submit */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative z-10 flex-1 space-y-5 overflow-y-auto p-6
                     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3
                         text-xs font-medium text-rose-600 dark:text-rose-400 backdrop-blur-md"
            >
              {error}
            </div>
          )}

          {/* Step 1 — Identity */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className={GLASS_SECTION_TITLE}>
                <User className="h-4 w-4 text-blue-500" />
                Who you are
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pf-business" className={GLASS_LABEL}>
                    Business name
                  </label>
                  <input
                    id="pf-business"
                    ref={firstFieldRef}
                    value={form.business_name ?? ''}
                    onChange={(e) =>
                      update({ business_name: e.target.value })
                    }
                    disabled={saving}
                    placeholder="e.g. Stricker Cars"
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-headline" className={GLASS_LABEL}>
                    Headline
                  </label>
                  <input
                    id="pf-headline"
                    value={form.headline ?? ''}
                    onChange={(e) => update({ headline: e.target.value })}
                    disabled={saving}
                    placeholder="e.g. Mobile Auto Mechanic — Cameroon"
                    className={GLASS_INPUT}
                  />
                </div>
              </div>
              <p className="-mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                At least one of business name or headline is required.
              </p>

              <div>
                <label htmlFor="pf-tagline" className={GLASS_LABEL}>
                  Tagline
                </label>
                <input
                  id="pf-tagline"
                  value={form.tagline ?? ''}
                  onChange={(e) => update({ tagline: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. Diagnostics at your doorstep"
                  className={GLASS_INPUT}
                />
              </div>

              <div>
                <label htmlFor="pf-bio" className={GLASS_LABEL}>
                  Bio
                </label>
                <textarea
                  id="pf-bio"
                  value={form.bio ?? ''}
                  onChange={(e) => update({ bio: e.target.value })}
                  disabled={saving}
                  rows={3}
                  className={`${GLASS_INPUT} resize-none`}
                />
              </div>

              <div>
                <label htmlFor="pf-mission" className={GLASS_LABEL}>
                  Mission statement
                </label>
                <textarea
                  id="pf-mission"
                  value={form.mission_statement ?? ''}
                  onChange={(e) =>
                    update({ mission_statement: e.target.value })
                  }
                  disabled={saving}
                  rows={2}
                  className={`${GLASS_INPUT} resize-none`}
                />
              </div>

              <div>
                <label htmlFor="pf-business-desc" className={GLASS_LABEL}>
                  Business description
                </label>
                <textarea
                  id="pf-business-desc"
                  value={form.business_description ?? ''}
                  onChange={(e) =>
                    update({ business_description: e.target.value })
                  }
                  disabled={saving}
                  rows={2}
                  className={`${GLASS_INPUT} resize-none`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="pf-years-exp" className={GLASS_LABEL}>
                    Years of experience
                  </label>
                  <input
                    id="pf-years-exp"
                    type="number"
                    min={0}
                    value={form.years_experience ?? ''}
                    onChange={(e) =>
                      update({
                        years_experience:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-years-biz" className={GLASS_LABEL}>
                    Years in business
                  </label>
                  <input
                    id="pf-years-biz"
                    type="number"
                    min={0}
                    value={form.years_in_business ?? ''}
                    onChange={(e) =>
                      update({
                        years_in_business:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-team" className={GLASS_LABEL}>
                    Team size
                  </label>
                  <input
                    id="pf-team"
                    type="number"
                    min={1}
                    value={form.team_size ?? ''}
                    onChange={(e) =>
                      update({
                        team_size:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pf-cover" className={GLASS_LABEL}>
                    Cover image URL
                  </label>
                  <input
                    id="pf-cover"
                    type="url"
                    value={form.cover_image_url ?? ''}
                    onChange={(e) =>
                      update({ cover_image_url: e.target.value })
                    }
                    disabled={saving}
                    placeholder="https://…"
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-video" className={GLASS_LABEL}>
                    Intro video URL
                  </label>
                  <input
                    id="pf-video"
                    type="url"
                    value={form.intro_video_url ?? ''}
                    onChange={(e) =>
                      update({ intro_video_url: e.target.value })
                    }
                    disabled={saving}
                    placeholder="https://…"
                    className={GLASS_INPUT}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Contact */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className={GLASS_SECTION_TITLE}>
                <Phone className="h-4 w-4 text-blue-500" />
                How clients reach you
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="pf-phone" className={GLASS_LABEL}>
                    Phone
                  </label>
                  <input
                    id="pf-phone"
                    type="tel"
                    value={form.phone ?? ''}
                    onChange={(e) => update({ phone: e.target.value })}
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-whatsapp" className={GLASS_LABEL}>
                    WhatsApp
                  </label>
                  <input
                    id="pf-whatsapp"
                    type="tel"
                    value={form.whatsapp ?? ''}
                    onChange={(e) => update({ whatsapp: e.target.value })}
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-email" className={GLASS_LABEL}>
                    Email
                  </label>
                  <input
                    id="pf-email"
                    type="email"
                    value={form.email ?? ''}
                    onChange={(e) => update({ email: e.target.value })}
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pf-website" className={GLASS_LABEL}>
                    Website
                  </label>
                  <input
                    id="pf-website"
                    type="url"
                    value={form.website_url ?? ''}
                    onChange={(e) => update({ website_url: e.target.value })}
                    disabled={saving}
                    placeholder="https://"
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-linkedin" className={GLASS_LABEL}>
                    LinkedIn
                  </label>
                  <input
                    id="pf-linkedin"
                    type="url"
                    value={form.linkedin_url ?? ''}
                    onChange={(e) => update({ linkedin_url: e.target.value })}
                    disabled={saving}
                    placeholder="https://linkedin.com/in/…"
                    className={GLASS_INPUT}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="pf-facebook" className={GLASS_LABEL}>
                    Facebook
                  </label>
                  <input
                    id="pf-facebook"
                    type="url"
                    value={form.facebook_url ?? ''}
                    onChange={(e) => update({ facebook_url: e.target.value })}
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-instagram" className={GLASS_LABEL}>
                    Instagram
                  </label>
                  <input
                    id="pf-instagram"
                    type="url"
                    value={form.instagram_url ?? ''}
                    onChange={(e) =>
                      update({ instagram_url: e.target.value })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-tiktok" className={GLASS_LABEL}>
                    TikTok
                  </label>
                  <input
                    id="pf-tiktok"
                    type="url"
                    value={form.tiktok_url ?? ''}
                    onChange={(e) => update({ tiktok_url: e.target.value })}
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Coverage */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className={GLASS_SECTION_TITLE}>
                <MapPin className="h-4 w-4 text-blue-500" />
                Where you work
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="pf-country" className={GLASS_LABEL}>
                    Country
                  </label>
                  <input
                    id="pf-country"
                    value={form.country ?? ''}
                    onChange={(e) => update({ country: e.target.value })}
                    disabled={saving}
                    placeholder="Cameroon"
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-region" className={GLASS_LABEL}>
                    Region
                  </label>
                  <input
                    id="pf-region"
                    value={form.region ?? ''}
                    onChange={(e) => update({ region: e.target.value })}
                    disabled={saving}
                    placeholder="Centre"
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-city" className={GLASS_LABEL}>
                    City
                  </label>
                  <input
                    id="pf-city"
                    value={form.city ?? ''}
                    onChange={(e) => update({ city: e.target.value })}
                    disabled={saving}
                    placeholder="Yaoundé"
                    className={GLASS_INPUT}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pf-area" className={GLASS_LABEL}>
                    Service area
                  </label>
                  <input
                    id="pf-area"
                    value={form.service_area ?? ''}
                    onChange={(e) => update({ service_area: e.target.value })}
                    disabled={saving}
                    placeholder="e.g. Yaoundé and surroundings"
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-radius" className={GLASS_LABEL}>
                    Service radius (km)
                  </label>
                  <input
                    id="pf-radius"
                    type="number"
                    min={0}
                    max={500}
                    value={form.service_radius_km ?? ''}
                    onChange={(e) =>
                      update({
                        service_radius_km:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={saving}
                    placeholder="25"
                    className={GLASS_INPUT}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <label className={GLASS_CHECK_LABEL(saving)}>
                  <input
                    type="checkbox"
                    checked={form.travels_to_client ?? false}
                    onChange={(e) =>
                      update({ travels_to_client: e.target.checked })
                    }
                    disabled={saving}
                    className={GLASS_CHECKBOX}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Travels to client
                  </span>
                </label>
                <label className={GLASS_CHECK_LABEL(saving)}>
                  <input
                    type="checkbox"
                    checked={form.works_remotely ?? false}
                    onChange={(e) =>
                      update({ works_remotely: e.target.checked })
                    }
                    disabled={saving}
                    className={GLASS_CHECKBOX}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Works remotely
                  </span>
                </label>
                <label className={GLASS_CHECK_LABEL(saving)}>
                  <input
                    type="checkbox"
                    checked={form.accepts_negotiation ?? true}
                    onChange={(e) =>
                      update({ accepts_negotiation: e.target.checked })
                    }
                    disabled={saving}
                    className={GLASS_CHECKBOX}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Open to negotiation
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4 — Trust & Visibility */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className={GLASS_SECTION_TITLE}>
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                Trust & credentials
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="pf-license-num" className={GLASS_LABEL}>
                    License number
                  </label>
                  <input
                    id="pf-license-num"
                    value={form.license_number ?? ''}
                    onChange={(e) =>
                      update({ license_number: e.target.value })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-license-auth" className={GLASS_LABEL}>
                    Issuing authority
                  </label>
                  <input
                    id="pf-license-auth"
                    value={form.license_authority ?? ''}
                    onChange={(e) =>
                      update({ license_authority: e.target.value })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-insurance" className={GLASS_LABEL}>
                    Insurance provider
                  </label>
                  <input
                    id="pf-insurance"
                    value={form.insurance_provider ?? ''}
                    onChange={(e) =>
                      update({ insurance_provider: e.target.value })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
                <h3 className={GLASS_SECTION_TITLE}>
                  <TagIcon className="h-4 w-4 text-blue-500" />
                  Tags & visibility
                </h3>

                <div>
                  <label htmlFor="pf-tag" className={GLASS_LABEL}>
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="pf-tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      disabled={saving}
                      placeholder="Add a tag…"
                      className={`${GLASS_INPUT} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={saving || !tagInput.trim()}
                      className="shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  {(form.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(form.tags ?? []).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300"
                        >
                          <TagIcon className="h-3 w-3 text-slate-400" />
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(t)}
                            disabled={saving}
                            aria-label={`Remove ${t}`}
                            className="text-slate-400 transition-colors hover:text-rose-500 disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <label className={`mt-4 ${GLASS_CHECK_LABEL(saving)}`}>
                  <input
                    type="checkbox"
                    checked={form.is_public ?? true}
                    onChange={(e) =>
                      update({ is_public: e.target.checked })
                    }
                    disabled={saving}
                    className={GLASS_CHECKBOX}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Portfolio is public
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5 — Preview */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className={GLASS_SECTION_TITLE}>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Preview — this is what will be saved
              </h2>

              {!hasChanges && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-700 backdrop-blur-md dark:text-amber-400">
                  You haven't changed anything yet. Go back and edit a step to
                  enable the update.
                </div>
              )}

              {/* Identity group */}
              <div className={GLASS_PREVIEW_GROUP}>
                <div className={GLASS_PREVIEW_GROUP_TITLE}>Identity</div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <SummaryRow label="Business name" value={form.business_name} />
                  <SummaryRow label="Headline" value={form.headline} />
                  <SummaryRow label="Tagline" value={form.tagline} />
                  <SummaryRow
                    label="Years experience"
                    value={
                      form.years_experience != null
                        ? `${form.years_experience} yrs`
                        : undefined
                    }
                  />
                  <SummaryRow
                    label="Years in business"
                    value={
                      form.years_in_business != null
                        ? `${form.years_in_business} yrs`
                        : undefined
                    }
                  />
                  <SummaryRow
                    label="Team size"
                    value={form.team_size ? String(form.team_size) : undefined}
                  />
                </dl>
              </div>

              {/* Contact group */}
              <div className={GLASS_PREVIEW_GROUP}>
                <div className={GLASS_PREVIEW_GROUP_TITLE}>Contact</div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <SummaryRow label="Email" value={form.email} />
                  <SummaryRow label="Phone" value={form.phone} />
                  <SummaryRow label="WhatsApp" value={form.whatsapp} />
                  <SummaryRow label="Website" value={form.website_url} />
                  <SummaryRow label="LinkedIn" value={form.linkedin_url} />
                  <SummaryRow label="Facebook" value={form.facebook_url} />
                  <SummaryRow label="Instagram" value={form.instagram_url} />
                  <SummaryRow label="TikTok" value={form.tiktok_url} />
                </dl>
              </div>

              {/* Coverage group */}
              <div className={GLASS_PREVIEW_GROUP}>
                <div className={GLASS_PREVIEW_GROUP_TITLE}>Coverage</div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <SummaryRow
                    label="Location"
                    value={[form.city, form.region, form.country]
                      .filter(Boolean)
                      .join(', ')}
                  />
                  <SummaryRow label="Service area" value={form.service_area} />
                  <SummaryRow
                    label="Service radius"
                    value={
                      form.service_radius_km != null
                        ? `${form.service_radius_km} km`
                        : undefined
                    }
                  />
                  <SummaryRow
                    label="Travels to client"
                    value={form.travels_to_client ? 'Yes' : 'No'}
                  />
                  <SummaryRow
                    label="Works remotely"
                    value={form.works_remotely ? 'Yes' : 'No'}
                  />
                  <SummaryRow
                    label="Open to negotiation"
                    value={form.accepts_negotiation ? 'Yes' : 'No'}
                  />
                </dl>
              </div>

              {/* Trust group */}
              <div className={GLASS_PREVIEW_GROUP}>
                <div className={GLASS_PREVIEW_GROUP_TITLE}>
                  Trust & credentials
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <SummaryRow
                    label="License number"
                    value={form.license_number}
                  />
                  <SummaryRow
                    label="Issuing authority"
                    value={form.license_authority}
                  />
                  <SummaryRow
                    label="Insurance provider"
                    value={form.insurance_provider}
                  />
                </dl>
              </div>

              {/* Tags & Visibility group */}
              <div className={GLASS_PREVIEW_GROUP}>
                <div className={GLASS_PREVIEW_GROUP_TITLE}>
                  Tags & visibility
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <SummaryRow
                    label="Tags"
                    value={
                      (form.tags ?? []).length
                        ? (form.tags ?? []).join(', ')
                        : undefined
                    }
                  />
                  <SummaryRow
                    label="Visibility"
                    value={form.is_public ? 'Public' : 'Private'}
                  />
                </dl>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md transition-all hover:bg-white/80 disabled:opacity-40 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>

            {!isLast ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed || saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={saving || !canUpdate}
                  title={
                    !hasChanges
                      ? 'No changes to save yet'
                      : !identityOk
                      ? 'Add a business name or headline first'
                      : undefined
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Update portfolio
                </button>
                {!hasChanges && !saving && (
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    No changes to save yet
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* ───────────────────────── SummaryRow ───────────────────────── */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const has = value != null && String(value).trim() !== '';
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-200/60 pb-2 last:border-b-0 dark:border-slate-800/60">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd
        className={`text-right text-sm ${
          has
            ? 'font-medium text-slate-900 dark:text-slate-100'
            : 'italic text-slate-400 dark:text-slate-600'
        }`}
      >
        {has ? value : '—'}
      </dd>
    </div>
  );
}