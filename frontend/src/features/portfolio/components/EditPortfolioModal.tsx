// src/features/portfolio/components/EditPortfolioModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Save,
  X,
  Building2,
  BookOpen,
  Phone,
  MapPin,
  ShieldCheck,
  Tag as TagIcon,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import type { Portfolio, PortfolioUpdateInput } from '../types/portfolio.types';

interface EditPortfolioModalProps {
  open: boolean;
  portfolio: Portfolio;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (input: PortfolioUpdateInput) => Promise<void>;
}

type SectionId =
  | 'basics'
  | 'story'
  | 'contact'
  | 'coverage'
  | 'trust'
  | 'preview';

/* ─────────────── Glass design tokens (blue theme) ─────────────── */

const GLASS_PANEL =
  'bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]';

const GLASS_INPUT =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-md ' +
  'border border-white/60 dark:border-white/10 text-sm text-slate-900 dark:text-slate-100 ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 ' +
  'focus:bg-white/90 dark:focus:bg-slate-800/70 transition ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const GLASS_BTN_PRIMARY =
  'flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 ' +
  'text-white text-xs font-bold shadow-md shadow-blue-500/25 transition ' +
  'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

const GLASS_BTN_GHOST =
  'flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/40 ' +
  'backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 ' +
  'hover:bg-white/70 dark:hover:bg-slate-800/60 text-xs font-bold transition ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const GLASS_PREVIEW_GROUP =
  'rounded-xl border border-white/50 bg-white/40 p-4 backdrop-blur-md ' +
  'dark:border-white/10 dark:bg-slate-800/30';

const GLASS_PREVIEW_GROUP_TITLE =
  'mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400';

const GLASS_CHECK_LABEL = (saving: boolean) =>
  'inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/50 px-3 py-2 ' +
  'backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-800/40 ' +
  (saving
    ? 'cursor-not-allowed opacity-60'
    : 'cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/60');

const GLASS_CHECKBOX =
  'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 ' +
  'dark:border-slate-700 dark:bg-slate-950';

const labelClass =
  'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

/* ──────────────────────────────────────────────────────────────── */

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

/* ───────────────────── Tag input ─────────────────────────────── */

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Type and press Add',
  disabled = false,
}) => {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && value.length) {
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
          className={GLASS_INPUT}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={disabled || !draft.trim()}
          className={GLASS_BTN_PRIMARY}
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              <TagIcon className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="hover:opacity-70 disabled:cursor-not-allowed"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic">Nothing added yet.</p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */

export default function EditPortfolioModal({
  open,
  portfolio,
  saving = false,
  onClose,
  onSubmit,
}: EditPortfolioModalProps) {
  /* ── ALL HOOKS FIRST ── */
  const [form, setForm] = useState<PortfolioUpdateInput>({});
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('basics');
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const initialFormRef = useRef<PortfolioUpdateInput | null>(null);

  useEffect(() => {
    if (!open) return;

    const hydrated = EMPTY_HYDRATE(portfolio);
    setForm(hydrated);
    initialFormRef.current = hydrated;
    setActiveSection('basics');
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

  const canSave = hasChanges && identityOk && !saving;

  const sections = useMemo<
    { id: SectionId; label: string; icon: React.ReactNode }[]
  >(
    () => [
      {
        id: 'basics',
        label: 'Basics',
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        id: 'story',
        label: 'Story & Media',
        icon: <BookOpen className="w-4 h-4" />,
      },
      { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
      {
        id: 'coverage',
        label: 'Coverage',
        icon: <MapPin className="w-4 h-4" />,
      },
      {
        id: 'trust',
        label: 'Trust',
        icon: <ShieldCheck className="w-4 h-4" />,
      },
      {
        id: 'preview',
        label: 'Preview',
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
    ],
    []
  );

  /* ── EARLY RETURN AFTER EVERY HOOK ── */
  if (!open) return null;

  /* ── Handlers ── */
  const update = (patch: Partial<PortfolioUpdateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;
    setError(null);

    if (!identityOk) {
      setError('Add a business name or headline before saving.');
      setActiveSection('basics');
      return;
    }
    if (!hasChanges) {
      setError('You have not changed anything yet.');
      return;
    }

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

  /* ── Section renderer ── */
  const renderSection = () => {
    switch (activeSection) {
      case 'basics':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pf-business" className={labelClass}>
                  Business name
                </label>
                <input
                  id="pf-business"
                  ref={firstFieldRef}
                  value={form.business_name ?? ''}
                  onChange={(e) => update({ business_name: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. Stricker Cars"
                  className={GLASS_INPUT}
                />
              </div>
              <div>
                <label htmlFor="pf-headline" className={labelClass}>
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
              <label htmlFor="pf-tagline" className={labelClass}>
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
              <label htmlFor="pf-bio" className={labelClass}>
                Bio
              </label>
              <textarea
                id="pf-bio"
                value={form.bio ?? ''}
                onChange={(e) => update({ bio: e.target.value })}
                disabled={saving}
                rows={5}
                className={`${GLASS_INPUT} resize-none`}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                {(form.bio ?? '').length}/500
              </p>
            </div>
          </div>
        );

      case 'story':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="pf-mission" className={labelClass}>
                Mission statement
              </label>
              <textarea
                id="pf-mission"
                value={form.mission_statement ?? ''}
                onChange={(e) => update({ mission_statement: e.target.value })}
                disabled={saving}
                rows={3}
                className={`${GLASS_INPUT} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="pf-business-desc" className={labelClass}>
                Business description
              </label>
              <textarea
                id="pf-business-desc"
                value={form.business_description ?? ''}
                onChange={(e) =>
                  update({ business_description: e.target.value })
                }
                disabled={saving}
                rows={3}
                className={`${GLASS_INPUT} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-years-exp" className={labelClass}>
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
                <label htmlFor="pf-years-biz" className={labelClass}>
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
                <label htmlFor="pf-team" className={labelClass}>
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

            <div className="border-t border-white/40 dark:border-white/10 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pf-cover" className={labelClass}>
                    Cover image URL
                  </label>
                  <input
                    id="pf-cover"
                    type="url"
                    value={form.cover_image_url ?? ''}
                    onChange={(e) => update({ cover_image_url: e.target.value })}
                    disabled={saving}
                    placeholder="https://…"
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="pf-video" className={labelClass}>
                    Intro video URL
                  </label>
                  <input
                    id="pf-video"
                    type="url"
                    value={form.intro_video_url ?? ''}
                    onChange={(e) => update({ intro_video_url: e.target.value })}
                    disabled={saving}
                    placeholder="https://…"
                    className={GLASS_INPUT}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-phone" className={labelClass}>
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
                <label htmlFor="pf-whatsapp" className={labelClass}>
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
                <label htmlFor="pf-email" className={labelClass}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pf-website" className={labelClass}>
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
                <label htmlFor="pf-linkedin" className={labelClass}>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-facebook" className={labelClass}>
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
                <label htmlFor="pf-instagram" className={labelClass}>
                  Instagram
                </label>
                <input
                  id="pf-instagram"
                  type="url"
                  value={form.instagram_url ?? ''}
                  onChange={(e) => update({ instagram_url: e.target.value })}
                  disabled={saving}
                  className={GLASS_INPUT}
                />
              </div>
              <div>
                <label htmlFor="pf-tiktok" className={labelClass}>
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
        );

      case 'coverage':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-country" className={labelClass}>
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
                <label htmlFor="pf-region" className={labelClass}>
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
                <label htmlFor="pf-city" className={labelClass}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pf-area" className={labelClass}>
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
                <label htmlFor="pf-radius" className={labelClass}>
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
                  onChange={(e) => update({ works_remotely: e.target.checked })}
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
        );

      case 'trust':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-license-num" className={labelClass}>
                  License number
                </label>
                <input
                  id="pf-license-num"
                  value={form.license_number ?? ''}
                  onChange={(e) => update({ license_number: e.target.value })}
                  disabled={saving}
                  className={GLASS_INPUT}
                />
              </div>
              <div>
                <label htmlFor="pf-license-auth" className={labelClass}>
                  Issuing authority
                </label>
                <input
                  id="pf-license-auth"
                  value={form.license_authority ?? ''}
                  onChange={(e) => update({ license_authority: e.target.value })}
                  disabled={saving}
                  className={GLASS_INPUT}
                />
              </div>
              <div>
                <label htmlFor="pf-insurance" className={labelClass}>
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

            <div className="border-t border-white/40 dark:border-white/10 pt-4">
              <label className={labelClass}>Tags</label>
              <TagInput
                value={form.tags ?? []}
                onChange={(next) => update({ tags: next })}
                placeholder="e.g. Mobile Mechanic"
                disabled={saving}
              />
            </div>

            <label className={GLASS_CHECK_LABEL(saving)}>
              <input
                type="checkbox"
                checked={form.is_public ?? true}
                onChange={(e) => update({ is_public: e.target.checked })}
                disabled={saving}
                className={GLASS_CHECKBOX}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Portfolio is public
              </span>
            </label>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              This is what will be saved
            </div>

            {!hasChanges && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-700 backdrop-blur-md dark:text-amber-400">
                You haven&apos;t changed anything yet. Go back and edit a
                section to enable the update.
              </div>
            )}

            <div className={GLASS_PREVIEW_GROUP}>
              <div className={GLASS_PREVIEW_GROUP_TITLE}>Basics</div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <SummaryRow label="Business name" value={form.business_name} />
                <SummaryRow label="Headline" value={form.headline} />
                <SummaryRow label="Tagline" value={form.tagline} />
                <SummaryRow label="Bio" value={form.bio} />
              </dl>
            </div>

            <div className={GLASS_PREVIEW_GROUP}>
              <div className={GLASS_PREVIEW_GROUP_TITLE}>Story &amp; Media</div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <SummaryRow
                  label="Mission"
                  value={form.mission_statement}
                />
                <SummaryRow
                  label="Description"
                  value={form.business_description}
                />
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
                <SummaryRow
                  label="Cover image"
                  value={form.cover_image_url}
                />
                <SummaryRow
                  label="Intro video"
                  value={form.intro_video_url}
                />
              </dl>
            </div>

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

            <div className={GLASS_PREVIEW_GROUP}>
              <div className={GLASS_PREVIEW_GROUP_TITLE}>
                Trust &amp; credentials
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

            <div className={GLASS_PREVIEW_GROUP}>
              <div className={GLASS_PREVIEW_GROUP_TITLE}>
                Tags &amp; visibility
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
        );

      default:
        return null;
    }
  };

  /* ── Modal markup ── */
  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-blue-950/75 backdrop-blur-2xl p-0 sm:p-4">
      <div
        className="absolute inset-0"
        onClick={!saving ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        className={`relative ${GLASS_PANEL} rounded-t-3xl sm:rounded-3xl w-full max-w-3xl
                    h-[94vh] sm:h-[85vh] sm:max-h-[760px]
                    flex flex-col overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-portfolio-title"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/40 dark:border-white/10">
          <div>
            <h3
              id="edit-portfolio-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Edit Portfolio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your public portfolio details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSave}
          className="relative z-10 flex-1 min-h-0 flex flex-col sm:flex-row"
        >
          {/* Sections nav */}
          <nav className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-white/40 dark:border-white/10 p-3 sm:p-4 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto bg-white/20 dark:bg-slate-900/10">
            <div className="flex sm:flex-col gap-1 min-w-max sm:min-w-0">
              {sections.map((s) => {
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSection(s.id)}
                    disabled={saving}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition disabled:opacity-60 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Section content */}
          <div className="flex-1 min-w-0 overflow-y-auto p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400 backdrop-blur-md"
              >
                {error}
              </div>
            )}
            {renderSection()}
          </div>
        </form>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-end gap-2 px-5 pt-4 pb-6 sm:pb-4 border-t border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={GLASS_BTN_GHOST}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={!canSave}
            title={
              !hasChanges
                ? 'No changes to save yet'
                : !identityOk
                ? 'Add a business name or headline first'
                : undefined
            }
            className={GLASS_BTN_PRIMARY}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Update Portfolio'}
          </button>
        </div>
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
    <div className="flex items-start justify-between gap-3 border-b border-white/40 pb-2 last:border-b-0 dark:border-white/10">
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