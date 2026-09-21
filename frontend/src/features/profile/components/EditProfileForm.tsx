// src/features/profile/components/EditProfileForm.tsx

import React, { useMemo, useState } from 'react';
import {
  X,
  Save,
  User as UserIcon,
  Briefcase,
  Wrench,
  MapPin,
  Link as LinkIcon,
  Plus,
  Globe,
} from 'lucide-react';
import { toast } from 'react-toastify';
import type {
  UserProfile,
  Professional,
  ExperienceLevel,
  EditProfilePayload,
} from '../types/profile.types';
import { MapLocationPicker, type PickedLocation } from './MapLocationPicker';

interface EditProfileFormProps {
  profile: UserProfile;
  onSave: (payload: EditProfilePayload) => void | Promise<void>;
  onCancel: () => void;
}

type SectionId = 'basic' | 'professional' | 'skills' | 'location' | 'social';

/* ─────────────────────────────────────────────────────────── */
/*  Glass style tokens                                        */
/* ─────────────────────────────────────────────────────────── */

const GLASS_PANEL =
  'bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl';

const GLASS_INPUT =
  'w-full px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-white/10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white/80 dark:focus:bg-slate-800/70 transition disabled:opacity-60 disabled:cursor-not-allowed';

const GLASS_BTN_PRIMARY =
  'flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed';

const GLASS_BTN_GHOST =
  'flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/60 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed';

const labelClass =
  'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

/* ─────────────────────────────────────────────────────────── */
/*  Field wrapper                                             */
/* ─────────────────────────────────────────────────────────── */

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────────── */
/*  Tag input with explicit Add button                        */
/* ─────────────────────────────────────────────────────────── */

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  accent?: 'indigo' | 'emerald' | 'amber';
  disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Type and press Add',
  accent = 'indigo',
  disabled = false,
}) => {
  const [draft, setDraft] = useState('');

  const accentClasses = {
    indigo:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    emerald:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  }[accent];

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
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${accentClasses}`}
            >
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

/* ─────────────────────────────────────────────────────────── */
/*  Main component                                            */
/* ─────────────────────────────────────────────────────────── */

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
}) => {
  const isProfessional = !!profile.professional;
  const [saving, setSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [basic, setBasic] = useState({
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    location: profile.location ?? '',
  });

  const [pro, setPro] = useState<Partial<Professional>>(() => ({
    profession: profile.professional?.profession ?? '',
    headline: profile.professional?.headline ?? '',
    bio: profile.professional?.bio ?? '',
    experienceLevel: profile.professional?.experienceLevel ?? 'INTERMEDIATE',
    yearsOfExperience: profile.professional?.yearsOfExperience ?? 0,
    companyName: profile.professional?.companyName ?? '',
    jobTitle: profile.professional?.jobTitle ?? '',
    employmentType: profile.professional?.employmentType ?? '',
    websiteUrl: profile.professional?.websiteUrl ?? '',
    linkedinUrl: profile.professional?.linkedinUrl ?? '',
    portfolioUrl: profile.professional?.portfolioUrl ?? '',
    facebookUrl: profile.professional?.facebookUrl ?? '',
    instagramUrl: profile.professional?.instagramUrl ?? '',
    twitterUrl: profile.professional?.twitterUrl ?? '',
    skills: profile.professional?.skills ?? [],
    services: profile.professional?.services ?? [],
    languages: profile.professional?.languages ?? [],
    hourlyRate: profile.professional?.hourlyRate ?? undefined,
    currency: profile.professional?.currency ?? 'XAF',
    country: profile.professional?.country ?? '',
    region: profile.professional?.region ?? '',
    city: profile.professional?.city ?? '',
    available: profile.professional?.available ?? true,
    availabilityNotes: profile.professional?.availabilityNotes ?? '',
    responseTimeHours: profile.professional?.responseTimeHours ?? undefined,
  }));

  const sections = useMemo<
    { id: SectionId; label: string; icon: React.ReactNode }[]
  >(() => {
    const base: { id: SectionId; label: string; icon: React.ReactNode }[] = [
      { id: 'basic', label: 'Basic Info', icon: <UserIcon className="w-4 h-4" /> },
    ];
    if (isProfessional) {
      base.push(
        { id: 'professional', label: 'Professional', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills & Services', icon: <Wrench className="w-4 h-4" /> },
        { id: 'location', label: 'Location & Pricing', icon: <MapPin className="w-4 h-4" /> },
        { id: 'social', label: 'Availability & Links', icon: <LinkIcon className="w-4 h-4" /> }
      );
    }
    return base;
  }, [isProfessional]);

  const [activeSection, setActiveSection] = useState<SectionId>('basic');

  /* ── Map pick handler ────────────────────────────── */
  const handleLocationPick = (loc: PickedLocation) => {
    setBasic((prev) => ({
      ...prev,
      location: loc.address?.trim() || loc.city || loc.region || prev.location,
    }));
    setPro((prev) => ({
      ...prev,
      country: loc.country ?? prev.country,
      region: loc.region ?? prev.region,
      city: loc.city ?? prev.city,
    }));
    setShowMapPicker(false);
    toast.info('Location updated from map', { autoClose: 1500 });
  };

  /* ── Submit with toasts ──────────────────────────── */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;

    // ── Basic sanity validation ──
    if (!basic.firstName.trim() || !basic.lastName.trim()) {
      toast.error('First name and last name are required.');
      setActiveSection('basic');
      return;
    }

    if (isProfessional && !(pro.profession ?? '').toString().trim()) {
      toast.error('Profession is required for professional accounts.');
      setActiveSection('professional');
      return;
    }

    const payload: EditProfilePayload = {
      user: {
        firstName: basic.firstName.trim(),
        lastName: basic.lastName.trim(),
        username: basic.username.trim() || undefined,
        bio: basic.bio.trim(),
        location: basic.location.trim(),
      },
    };

    if (isProfessional) {
      const trimOrNull = (v: unknown) => {
        const s = (v ?? '').toString().trim();
        return s === '' ? null : s;
      };

      payload.professional = {
        profession: (pro.profession ?? '').toString().trim(),
        headline: trimOrNull(pro.headline),
        bio: trimOrNull(pro.bio),
        experienceLevel: pro.experienceLevel,
        yearsOfExperience: pro.yearsOfExperience,
        companyName: trimOrNull(pro.companyName),
        jobTitle: trimOrNull(pro.jobTitle),
        employmentType: trimOrNull(pro.employmentType),
        websiteUrl: trimOrNull(pro.websiteUrl),
        linkedinUrl: trimOrNull(pro.linkedinUrl),
        portfolioUrl: trimOrNull(pro.portfolioUrl),
        facebookUrl: trimOrNull(pro.facebookUrl),
        instagramUrl: trimOrNull(pro.instagramUrl),
        twitterUrl: trimOrNull(pro.twitterUrl),
        skills: pro.skills ?? [],
        services: pro.services ?? [],
        languages: pro.languages ?? [],
        hourlyRate: pro.hourlyRate ?? null,
        currency: pro.currency ?? 'XAF',
        country: trimOrNull(pro.country),
        region: trimOrNull(pro.region),
        city: trimOrNull(pro.city),
        available: pro.available ?? true,
        availabilityNotes: trimOrNull(pro.availabilityNotes),
        responseTimeHours: pro.responseTimeHours ?? null,
      };
    }

    let loadingToastId: string | number | null = null;
    try {
      setSaving(true);
      loadingToastId = toast.loading('Saving your profile…');

      await onSave(payload);

      if (loadingToastId !== null) {
        toast.update(loadingToastId, {
          render: 'Profile updated successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 2500,
          closeButton: true,
        });
      } else {
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Failed to update profile. Please try again.';

      if (loadingToastId !== null) {
        toast.update(loadingToastId, {
          render: message,
          type: 'error',
          isLoading: false,
          autoClose: 4000,
          closeButton: true,
        });
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Section renderer ────────────────────────────── */
  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name">
                <input
                  type="text"
                  value={basic.firstName}
                  onChange={(e) => setBasic({ ...basic, firstName: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  value={basic.lastName}
                  onChange={(e) => setBasic({ ...basic, lastName: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
            </div>

            <Field label="Username">
              <input
                type="text"
                value={basic.username}
                onChange={(e) => setBasic({ ...basic, username: e.target.value })}
                className={GLASS_INPUT}
                disabled={saving}
              />
            </Field>

            <Field label="Bio">
              <textarea
                rows={3}
                value={basic.bio}
                onChange={(e) => setBasic({ ...basic, bio: e.target.value })}
                className={`${GLASS_INPUT} resize-none`}
                maxLength={500}
                disabled={saving}
              />
              <p className="mt-1 text-[11px] text-slate-400">{basic.bio.length}/500</p>
            </Field>

            <Field label="Location">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={basic.location}
                  onChange={(e) => setBasic({ ...basic, location: e.target.value })}
                  className={GLASS_INPUT}
                  placeholder="City, Country"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className={GLASS_BTN_GHOST}
                  title="Pick on map"
                  disabled={saving}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Map
                </button>
              </div>
            </Field>
          </div>
        );

      case 'professional':
        return (
          <div className="space-y-4">
            <Field label="Profession">
              <input
                type="text"
                value={pro.profession ?? ''}
                onChange={(e) => setPro({ ...pro, profession: e.target.value })}
                className={GLASS_INPUT}
                placeholder="e.g. Auto Mechanic"
                disabled={saving}
              />
            </Field>

            <Field label="Headline">
              <input
                type="text"
                value={pro.headline ?? ''}
                onChange={(e) => setPro({ ...pro, headline: e.target.value })}
                className={GLASS_INPUT}
                placeholder="Short tagline that appears under your name"
                maxLength={150}
                disabled={saving}
              />
            </Field>

            <Field label="Professional Bio">
              <textarea
                rows={4}
                value={pro.bio ?? ''}
                onChange={(e) => setPro({ ...pro, bio: e.target.value })}
                className={`${GLASS_INPUT} resize-none`}
                maxLength={1500}
                disabled={saving}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                {(pro.bio ?? '').length}/1500
              </p>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Experience Level">
                <select
                  value={pro.experienceLevel ?? 'INTERMEDIATE'}
                  onChange={(e) =>
                    setPro({ ...pro, experienceLevel: e.target.value as ExperienceLevel })
                  }
                  className={GLASS_INPUT}
                  disabled={saving}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </Field>

              <Field label="Years of Experience">
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={pro.yearsOfExperience ?? 0}
                  onChange={(e) =>
                    setPro({
                      ...pro,
                      yearsOfExperience: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company Name">
                <input
                  type="text"
                  value={pro.companyName ?? ''}
                  onChange={(e) => setPro({ ...pro, companyName: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
              <Field label="Job Title">
                <input
                  type="text"
                  value={pro.jobTitle ?? ''}
                  onChange={(e) => setPro({ ...pro, jobTitle: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
            </div>

            <Field label="Employment Type">
              <input
                type="text"
                value={pro.employmentType ?? ''}
                onChange={(e) => setPro({ ...pro, employmentType: e.target.value })}
                className={GLASS_INPUT}
                placeholder="Full-time, Freelance, Contract…"
                disabled={saving}
              />
            </Field>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Skills</label>
              <TagInput
                value={pro.skills ?? []}
                onChange={(next) => setPro({ ...pro, skills: next })}
                placeholder="e.g. Engine Diagnostics"
                accent="indigo"
                disabled={saving}
              />
            </div>

            <div>
              <label className={labelClass}>Services</label>
              <TagInput
                value={pro.services ?? []}
                onChange={(next) => setPro({ ...pro, services: next })}
                placeholder="e.g. Oil Change"
                accent="emerald"
                disabled={saving}
              />
            </div>

            <div>
              <label className={labelClass}>Languages</label>
              <TagInput
                value={pro.languages ?? []}
                onChange={(next) => setPro({ ...pro, languages: next })}
                placeholder="e.g. English"
                accent="amber"
                disabled={saving}
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-white/50 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Pick your base location on the map
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className={GLASS_BTN_PRIMARY}
                disabled={saving}
              >
                <Globe className="w-3.5 h-3.5" />
                Open Map
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Country">
                <input
                  type="text"
                  value={pro.country ?? ''}
                  onChange={(e) => setPro({ ...pro, country: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
              <Field label="Region">
                <input
                  type="text"
                  value={pro.region ?? ''}
                  onChange={(e) => setPro({ ...pro, region: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
              <Field label="City">
                <input
                  type="text"
                  value={pro.city ?? ''}
                  onChange={(e) => setPro({ ...pro, city: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Hourly Rate">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={pro.hourlyRate ?? ''}
                  onChange={(e) =>
                    setPro({
                      ...pro,
                      hourlyRate: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
              <Field label="Currency">
                <select
                  value={pro.currency ?? 'XAF'}
                  onChange={(e) => setPro({ ...pro, currency: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                >
                  <option value="XAF">XAF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                  <option value="GHS">GHS</option>
                  <option value="KES">KES</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </Field>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10">
              <input
                id="available"
                type="checkbox"
                checked={pro.available ?? true}
                onChange={(e) => setPro({ ...pro, available: e.target.checked })}
                className="h-4 w-4 accent-indigo-600"
                disabled={saving}
              />
              <label
                htmlFor="available"
                className="text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                I'm currently available for work
              </label>
            </div>

            <Field label="Availability Notes">
              <textarea
                rows={2}
                value={pro.availabilityNotes ?? ''}
                onChange={(e) => setPro({ ...pro, availabilityNotes: e.target.value })}
                className={`${GLASS_INPUT} resize-none`}
                maxLength={500}
                placeholder="e.g. Weekdays after 5pm, weekends all day"
                disabled={saving}
              />
            </Field>

            <Field label="Response Time (hours)">
              <input
                type="number"
                min={0}
                max={168}
                value={pro.responseTimeHours ?? ''}
                onChange={(e) =>
                  setPro({
                    ...pro,
                    responseTimeHours:
                      e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className={GLASS_INPUT}
                disabled={saving}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Website">
                <input
                  type="url"
                  value={pro.websiteUrl ?? ''}
                  onChange={(e) => setPro({ ...pro, websiteUrl: e.target.value })}
                  className={GLASS_INPUT}
                  placeholder="https://"
                  disabled={saving}
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  type="url"
                  value={pro.linkedinUrl ?? ''}
                  onChange={(e) => setPro({ ...pro, linkedinUrl: e.target.value })}
                  className={GLASS_INPUT}
                  placeholder="https://linkedin.com/in/…"
                  disabled={saving}
                />
              </Field>
              <Field label="Portfolio">
                <input
                  type="url"
                  value={pro.portfolioUrl ?? ''}
                  onChange={(e) => setPro({ ...pro, portfolioUrl: e.target.value })}
                  className={GLASS_INPUT}
                  placeholder="https://"
                  disabled={saving}
                />
              </Field>
              <Field label="Facebook">
                <input
                  type="url"
                  value={pro.facebookUrl ?? ''}
                  onChange={(e) => setPro({ ...pro, facebookUrl: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
              <Field label="Instagram">
                <input
                  type="url"
                  value={pro.instagramUrl ?? ''}
                  onChange={(e) => setPro({ ...pro, instagramUrl: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
              <Field label="Twitter / X">
                <input
                  type="url"
                  value={pro.twitterUrl ?? ''}
                  onChange={(e) => setPro({ ...pro, twitterUrl: e.target.value })}
                  className={GLASS_INPUT}
                  disabled={saving}
                />
              </Field>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ── Layout ──────────────────────────────────────── */
  return (
    <>
      {/* Main modal */}
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xl p-0 sm:p-4">
        <div
          className={`${GLASS_PANEL} rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/40 dark:border-white/10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Edit Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isProfessional
                  ? 'Update your account and professional details'
                  : 'Update your account details'}
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={saving}
              className="p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 flex flex-col sm:flex-row"
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
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
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
            <div className="flex-1 min-w-0 overflow-y-auto p-5">
              {renderSection()}
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 pt-4 pb-28 sm:pb-4 border-t border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className={GLASS_BTN_GHOST}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={saving}
              className={GLASS_BTN_PRIMARY}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Map picker modal */}
      {showMapPicker && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-2xl p-3 sm:p-6">
          <div
            className={`${GLASS_PANEL} rounded-2xl w-full max-w-4xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/40 dark:border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pick your location
                </h3>
              </div>
              <button
                onClick={() => setShowMapPicker(false)}
                className="p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500"
                aria-label="Close map"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <MapLocationPicker
                initialLocation={null}
                onSelect={handleLocationPick}
                onCancel={() => setShowMapPicker(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileForm;