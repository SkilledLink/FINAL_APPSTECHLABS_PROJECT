// src/features/portfolio/components/PortfolioHeader.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  Briefcase,
  Clock,
  MapPin,
  Phone,
  Building2,
  Globe,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import type { Portfolio } from '../../../types/portfolio';
import type { User } from '../../../types/user';

interface Props {
  portfolio: Portfolio;
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PortfolioHeader({ portfolio, user, onEdit, onDelete }: Props) {
  const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || 'P';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-cyan-500/20 shadow-2xl"
    >
      {/* Ambient Light Refractions */}
      <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl pointer-events-none" />

      {/* Hero Banner */}
      <div className="h-44 md:h-56 w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700">
        {user.banner_image_url ? (
          <img
            src={user.banner_image_url}
            alt="Portfolio Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700" />
        )}

        {/* Banner Glass Glow Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/40 backdrop-blur-md text-white border border-white/20 shadow-lg">
            {portfolio.is_public ? <Globe size={13} /> : <Lock size={13} />}
            {portfolio.is_public ? 'Public' : 'Private'}
          </span>

          {portfolio.is_verified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 backdrop-blur-md text-emerald-100 border border-emerald-400/30 shadow-lg">
              <CheckCircle2 size={13} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Profile Details Header */}
      <div className="px-6 md:px-8 pb-8 pt-0 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20">
          
          {/* Avatar & Main Info */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            {/* Avatar Container */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-slate-900 flex-shrink-0">
                {user.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.first_name || 'Professional'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center text-white font-bold text-3xl md:text-4xl tracking-wider">
                    {initials}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border-2 border-white dark:border-slate-900">
                <Briefcase size={16} />
              </div>
            </div>

            {/* Headline & Sub-info */}
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {portfolio.headline || 'Professional Portfolio'}
              </h1>

              {portfolio.business_name && (
                <p className="text-slate-600 dark:text-slate-300 font-semibold text-base flex items-center gap-1.5">
                  <Building2 size={16} className="text-cyan-500" />
                  <span>{portfolio.business_name}</span>
                </p>
              )}

              {/* Metadata Pills */}
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
                {portfolio.years_experience !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <Clock size={13} className="text-cyan-500" />
                    <span>{portfolio.years_experience} Years Exp.</span>
                  </span>
                )}

                {portfolio.service_area && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <MapPin size={13} className="text-cyan-500" />
                    <span>{portfolio.service_area}</span>
                  </span>
                )}

                {portfolio.phone && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <Phone size={13} className="text-cyan-500" />
                    <span>{portfolio.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center gap-2 active:scale-95"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={onDelete}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 text-sm font-medium rounded-2xl border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 flex items-center gap-1.5 active:scale-95"
              title="Delete Portfolio"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Bio Section */}
        {portfolio.bio && (
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/80">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              About & Expertise
            </h4>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed max-w-4xl whitespace-pre-line">
              {portfolio.bio}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}