import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Zap, 
  CheckCircle2, 
  Award, 
  Users, 
  MapPin, 
  Lock, 
  MessageSquare, 
  DollarSign, 
  Check, 
  TrendingUp, 
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ==========================================
// 1. HERO SECTION WITH BACKGROUND IMAGE
// ==========================================
export const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex items-center overflow-hidden">
      {/* 
        ----------------------------------------------------
        HIGH-IMPACT ARCHITECTURAL BACKGROUND IMAGE LAYER 
        ----------------------------------------------------
      */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=2000&q=85"
          alt="Modern Architectural Engineering Background"
          className="w-full h-full object-cover object-center scale-105 filter brightness-75 dark:brightness-50 transition-all duration-1000"
        />
        {/* Multi-stage Gradient Scrim for Contrast & Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />
      </div>

      {/* Dynamic Ambient Glass Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.6, 0.35],
            x: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-10 -left-10 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.5, 0.25],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 right-10 w-[30rem] h-[30rem] bg-indigo-500/25 rounded-full blur-[140px]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
        {/* Left Content Column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-7 z-10"
        >
          {/* Glass Pill Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide backdrop-blur-2xl bg-white/10 dark:bg-white/5 text-blue-300 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <Sparkles size={14} className="text-blue-400" />
              <span>AI-Powered Verified Trades Network</span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]"
          >
            Connect, showcase & hire local{' '}
            <span className="relative inline-block bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              master trades
            </span>{' '}
            effortlessly.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed"
          >
            The premium verified exchange bridging homeowners, commercial developers, and state-certified contractors with instant AI matching and secure escrow release.
          </motion.p>

          {/* Glass Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              to="/signup"
              className="relative group overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-95 transition-all duration-300 border border-blue-400/30"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/25 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
              <span>Find a Specialist</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/register-pro"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs font-bold backdrop-blur-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 shadow-xl active:scale-95 transition-all duration-300"
            >
              <Zap size={15} className="text-amber-400 fill-amber-400/20" />
              <span>Register as Pro Specialist</span>
            </Link>
          </motion.div>

          {/* Glass Stats Bar */}
          <motion.div
            variants={itemVariants}
            className="pt-6 grid grid-cols-3 gap-4 p-5 rounded-3xl backdrop-blur-3xl bg-slate-900/60 border border-white/15 shadow-2xl"
          >
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1.5">
                12,800+
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users size={12} className="text-blue-400" />
                Verified Pros
              </p>
            </div>
            <div className="space-y-1 border-x border-white/10 px-3 sm:px-6">
              <p className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1">
                4.96 <Star size={16} className="text-amber-400 fill-amber-400" />
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Award size={12} className="text-amber-400" />
                Satisfaction Rate
              </p>
            </div>
            <div className="space-y-1 pl-1 sm:pl-3">
              <p className="text-2xl sm:text-3xl font-black text-white">$42M+</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                Escrow Protected
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right High-Impact Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-3xl p-3 sm:p-4 backdrop-blur-3xl bg-slate-900/50 border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] group">
            {/* Soft Backlight Ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-cyan-400/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

            <div className="relative h-[420px] sm:h-[490px] w-full rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                alt="Master Technician at Work"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Floating Top Left Glass Badge */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute top-4 left-4 backdrop-blur-2xl bg-emerald-500/80 text-white px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xl border border-white/30"
              >
                <CheckCircle2 size={14} />
                <span>Available Today in Austin, TX</span>
              </motion.div>

              {/* Floating Top Right Shield */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute top-4 right-4 backdrop-blur-2xl bg-slate-950/70 border border-white/20 p-2.5 rounded-2xl text-blue-400 shadow-xl"
              >
                <ShieldCheck size={22} />
              </motion.div>

              {/* Floating Active Specialist Glass Card Overlay */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-3xl bg-slate-950/85 border border-white/20 text-white space-y-3 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                        alt="Marcus Vance Avatar"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-blue-400 shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-white">
                        ✓
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5 text-white">
                        <span>Marcus Vance</span>
                        <ShieldCheck size={14} className="text-blue-400" />
                      </h4>
                      <p className="text-[11px] text-slate-300 font-medium">Master Electrician • TECL #34091</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      $95/hr
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Direct Hire
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 2. FEATURES SECTION WITH FROSTED GLASS
// ==========================================
const FEATURES = [
  {
    icon: Zap,
    title: 'AI Smart Matchmaking',
    description: 'Natural language job scope parsing automatically pairs projects with certified specialists based on active licenses, location radius, and live calendar availability.',
    badge: 'Neural Core v2.4',
    accent: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Credentials & Insurance',
    description: 'Every contractor undergoes automated state license validation, nationwide criminal background audits, and active $1M+ liability insurance verification.',
    badge: '100% Vetted',
    accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Collaboration',
    description: 'Direct encrypted messaging, instant high-res milestone updates, change-order approvals, and transparent transparent digital estimates.',
    badge: 'Instant Sync',
    accent: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  },
  {
    icon: Lock,
    title: 'Secure Milestone Escrow',
    description: 'Funds remain securely locked in bank-grade escrow vaults and are released exclusively upon completed inspection and verified homeowner authorization.',
    badge: 'Vault Security',
    accent: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  {
    icon: Users,
    title: 'Trade Social Community',
    description: 'Craftspeople present verifiable project portfolios, build community reputation, exchange technical tips, and showcase true artisanal quality.',
    badge: 'Master Network',
    accent: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  },
  {
    icon: DollarSign,
    title: 'Instant Fair Cost Estimates',
    description: 'Automated estimate engine benchmarked against real-time local material cost indexes, current labor market rates, and regional trade scopes.',
    badge: 'Real-Time Index',
    accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Background Section Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[30rem] bg-blue-600/15 rounded-full blur-[160px]" />
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-2xl bg-white/10 dark:bg-white/5 text-blue-400 border border-white/15 shadow-sm">
          <Sparkles size={13} className="text-blue-400" />
          <span>Uncompromised Precision & Security</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Engineered for Trust & Professional Scale
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
          Combining cutting-edge technological precision with real-world trade reliability to power the modern construction exchange.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="relative rounded-3xl p-7 backdrop-blur-3xl bg-slate-900/60 border border-white/15 shadow-2xl hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl border ${feat.accent} shadow-md`}>
                    <Icon size={22} />
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-white tracking-tight pt-1">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                <span>Explore Architecture</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// ==========================================
// 3. FEATURED SHOWCASE SECTION
// ==========================================
const SPECIALISTS = [
  {
    id: '1',
    name: 'Elena Rostova',
    trade: 'Master Electrician',
    rating: 4.98,
    reviews: 142,
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$85/hr',
    jobsCount: '184 Completed',
  },
  {
    id: '2',
    name: 'Marcus Vance',
    trade: 'General Contractor',
    rating: 4.92,
    reviews: 310,
    location: 'Dallas, TX',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$110/hr',
    jobsCount: '412 Completed',
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    trade: 'Commercial Plumber',
    rating: 5.0,
    reviews: 88,
    location: 'Houston, TX',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$89/hr',
    jobsCount: '96 Completed',
  },
  {
    id: '4',
    name: 'David Chen',
    trade: 'HVAC Specialist',
    rating: 4.95,
    reviews: 204,
    location: 'San Antonio, TX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$95/hr',
    jobsCount: '250 Completed',
  },
];

export const FeaturedShowcase: React.FC = () => {
  return (
    <section id="showcase" className="relative py-20 px-4 sm:px-8 w-full    ">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-2xl bg-white/10 dark:bg-white/5 text-blue-400 border border-white/15">
            <Sparkles size={13} className="text-blue-400" />
            <span>Top Rated Local Talent</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Featured Master Professionals
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-normal leading-relaxed">
            Every specialist is state-licensed, identity-verified, and evaluated by verified local project owners.
          </p>
        </div>

        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold backdrop-blur-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg group w-fit"
        >
          <span>View Directory Listings</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-blue-400" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SPECIALISTS.map((pro) => (
          <motion.div
            key={pro.id}
            whileHover={{ y: -8 }}
            className="rounded-3xl overflow-hidden backdrop-blur-3xl bg-slate-900/60 border border-white/15 shadow-2xl hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Cover Image Header */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={pro.cover}
                  alt={pro.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-xl bg-emerald-500/90 text-white flex items-center gap-1 shadow-lg border border-white/20">
                  <ShieldCheck size={12} /> Verified
                </span>

                <span className="absolute bottom-2.5 right-3 text-[10px] font-extrabold text-slate-200 backdrop-blur-md bg-slate-950/60 px-2.5 py-0.5 rounded-md border border-white/10">
                  {pro.jobsCount}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 pt-0 relative">
                <div className="relative -mt-9 mb-3 inline-block">
                  <img
                    src={pro.avatar}
                    alt={pro.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-900 shadow-2xl"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-white text-base truncate">
                      {pro.name}
                    </h3>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                      {pro.hourlyRate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    {pro.trade}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 mt-4 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {pro.location}
                  </span>

                  <span className="flex items-center gap-1 font-extrabold text-white">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    {pro.rating} <span className="text-slate-400 font-normal">({pro.reviews})</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <Link
                to={`/pro/${pro.id}`}
                className="w-full py-2.5 rounded-xl backdrop-blur-xl bg-blue-500/15 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-xs border border-blue-500/30 flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md"
              >
                <span>View Full Profile</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};