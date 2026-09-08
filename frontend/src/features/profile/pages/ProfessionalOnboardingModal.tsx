// src/features/profile/pages/ProfessionalOnboardingModal.tsx

import React, { useState } from 'react';
import { X, Save, Briefcase, Loader2 } from 'lucide-react';
import type { Professional } from '../types/profile.types';
import { useProfessional } from '../hooks/useProfessional';

interface ProfessionalOnboardingModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  profession: string;
  bio: string;
  skills: string;
  yearsOfExperience: number;
  services: string;
  hourlyRate: number;
  country: string;
  region: string;
  city: string;
}

export const ProfessionalOnboardingModal: React.FC<
  ProfessionalOnboardingModalProps
> = ({ userId, onClose, onSuccess }) => {
  const { createProfessional } = useProfessional();

  const [formData, setFormData] = useState<FormData>({
    profession: '',
    bio: '',
    skills: '',
    yearsOfExperience: 0,
    services: '',
    hourlyRate: 0,
    country: '',
    region: '',
    city: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);

    if (!formData.profession.trim()) {
      setError('Please enter your profession.');
      return;
    }

    setIsSubmitting(true);

    try {
      const professionalData: Partial<Professional> = {
        profession: formData.profession.trim(),
        bio: formData.bio.trim() || undefined,
        skills: formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        yearsOfExperience:
          formData.yearsOfExperience > 0
            ? formData.yearsOfExperience
            : undefined,
        services: formData.services
          .split(',')
          .map((service) => service.trim())
          .filter(Boolean),
        hourlyRate:
          formData.hourlyRate > 0 ? formData.hourlyRate : undefined,
        country: formData.country.trim() || undefined,
        region: formData.region.trim() || undefined,
        city: formData.city.trim() || undefined,
        available: true,
        isVerified: false,
        rating: 0,
        totalReviews: 0,
        completedJobs: 0,
      };

      const created = await createProfessional(professionalData);

      if (created) {
        onSuccess();
      } else {
        setError('Failed to create professional profile.');
      }
    } catch (submitError) {
      console.error('Failed to upgrade user to professional:', submitError);
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : 'Failed to upgrade your account. Please check your information and try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div
        className="
          relative w-full max-w-2xl max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          border border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-900
          p-6
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Become a Professional
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete your professional profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="
              rounded-xl p-2
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-600
              dark:hover:bg-slate-800
              dark:hover:text-slate-200
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profession + Experience */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="profession"
                className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Profession *
              </label>

              <input
                id="profession"
                type="text"
                value={formData.profession}
                onChange={(event) =>
                  updateField('profession', event.target.value)
                }
                placeholder="e.g. Carpenter"
                required
                disabled={isSubmitting}
                className="
                  w-full rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  px-3.5 py-2.5
                  text-sm text-slate-900 dark:text-slate-100
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            <div>
              <label
                htmlFor="yearsOfExperience"
                className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Years of Experience
              </label>

              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={(event) =>
                  updateField(
                    'yearsOfExperience',
                    Math.max(0, Number(event.target.value))
                  )
                }
                disabled={isSubmitting}
                className="
                  w-full rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  px-3.5 py-2.5
                  text-sm text-slate-900 dark:text-slate-100
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Professional Bio
            </label>

            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(event) =>
                updateField('bio', event.target.value)
              }
              placeholder="Tell clients about your experience and what you do..."
              disabled={isSubmitting}
              className="
                w-full resize-none rounded-xl
                border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                px-3.5 py-2.5
                text-sm text-slate-900 dark:text-slate-100
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* Skills */}
          <div>
            <label
              htmlFor="skills"
              className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Skills
            </label>

            <input
              id="skills"
              type="text"
              value={formData.skills}
              onChange={(event) =>
                updateField('skills', event.target.value)
              }
              placeholder="e.g. Woodworking, Carpentry, Furniture Design"
              disabled={isSubmitting}
              className="
                w-full rounded-xl
                border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                px-3.5 py-2.5
                text-sm text-slate-900 dark:text-slate-100
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <p className="mt-1.5 text-[11px] text-slate-400">
              Separate multiple skills with commas.
            </p>
          </div>

          {/* Services */}
          <div>
            <label
              htmlFor="services"
              className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Services
            </label>

            <input
              id="services"
              type="text"
              value={formData.services}
              onChange={(event) =>
                updateField('services', event.target.value)
              }
              placeholder="e.g. Custom Cabinetry, Trim Work, Renovations"
              disabled={isSubmitting}
              className="
                w-full rounded-xl
                border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                px-3.5 py-2.5
                text-sm text-slate-900 dark:text-slate-100
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <p className="mt-1.5 text-[11px] text-slate-400">
              Separate multiple services with commas.
            </p>
          </div>

          {/* Rate + Country */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="hourlyRate"
                className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Hourly Rate
              </label>

              <input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(event) =>
                  updateField(
                    'hourlyRate',
                    Math.max(0, Number(event.target.value))
                  )
                }
                placeholder="0.00"
                disabled={isSubmitting}
                className="
                  w-full rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  px-3.5 py-2.5
                  text-sm text-slate-900 dark:text-slate-100
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Country
              </label>

              <input
                id="country"
                type="text"
                value={formData.country}
                onChange={(event) =>
                  updateField('country', event.target.value)
                }
                placeholder="e.g. Cameroon"
                disabled={isSubmitting}
                className="
                  w-full rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  px-3.5 py-2.5
                  text-sm text-slate-900 dark:text-slate-100
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          {/* Region + City */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="region"
                className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Region / State
              </label>

              <input
                id="region"
                type="text"
                value={formData.region}
                onChange={(event) =>
                  updateField('region', event.target.value)
                }
                placeholder="e.g. Centre"
                disabled={isSubmitting}
                className="
                  w-full rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  px-3.5 py-2.5
                  text-sm text-slate-900 dark:text-slate-100
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                City
              </label>

              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(event) =>
                  updateField('city', event.target.value)
                }
                placeholder="e.g. Yaoundé"
                disabled={isSubmitting}
                className="
                  w-full rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  px-3.5 py-2.5
                  text-sm text-slate-900 dark:text-slate-100
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                rounded-xl px-4 py-2.5
                text-xs font-bold
                text-slate-600 dark:text-slate-400
                transition
                hover:bg-slate-100
                dark:hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                flex items-center gap-2
                rounded-xl
                bg-indigo-600
                px-5 py-2.5
                text-xs font-bold text-white
                shadow-md
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Become Professional
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalOnboardingModal;