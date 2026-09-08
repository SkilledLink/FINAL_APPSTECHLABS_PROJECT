import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  MessageSquare, 
  Users, 
  DollarSign, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    category: 'INTELLIGENCE | V2.4',
    title: 'AI MATCHMAKING',
    subtitle: 'NEURAL SCOPING ENGINE',
    description: 'Natural language job postings automatically match with certified specialists based on state licensing, location radius, and live calendar availability.',
    accentColor: 'text-cyan-400',
    lineColor: 'bg-cyan-400',
    btnBg: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
  },
  {
    icon: ShieldCheck,
    category: 'SECURITY | VETTED',
    title: 'VERIFIED LICENSES',
    subtitle: '100% INSURED PROS',
    description: 'Every specialist undergoes automated state license validation, nationwide background checks, and active $1M+ liability insurance verification.',
    accentColor: 'text-sky-400',
    lineColor: 'bg-sky-400',
    btnBg: 'bg-sky-400 hover:bg-sky-300 text-slate-950',
  },
  {
    icon: MessageSquare,
    category: 'WORKFLOW | INSTANT',
    title: 'LIVE SYNC CHAT',
    subtitle: 'ENCRYPTED MESSAGING',
    description: 'Direct end-to-end encrypted messaging, high-res site photo updates, milestone progress approvals, and transparent digital scope changes.',
    accentColor: 'text-blue-400',
    lineColor: 'bg-blue-400',
    btnBg: 'bg-blue-500 hover:bg-blue-400 text-white',
  },
  {
    icon: Lock,
    category: 'VAULT | BANK-GRADE',
    title: 'MILESTONE ESCROW',
    subtitle: 'PROTECTED PAYOUTS',
    description: 'Funds are securely locked in bank-grade escrow vaults and released exclusively upon completed inspection and homeowner sign-off.',
    accentColor: 'text-blue-300',
    lineColor: 'bg-blue-300',
    btnBg: 'bg-blue-400 hover:bg-blue-300 text-slate-950',
  },
  {
    icon: Users,
    category: 'COMMUNITY | PRO',
    title: 'MASTER NETWORK',
    subtitle: 'VERIFIED PORTFOLIOS',
    description: 'Craftspeople showcase authentic project portfolios, build community reputation, exchange technical tips, and demonstrate craftsmanship.',
    accentColor: 'text-cyan-300',
    lineColor: 'bg-cyan-300',
    btnBg: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
  },
  {
    icon: DollarSign,
    category: 'INDEXING | REAL-TIME',
    title: 'FAIR COST ESTIMATES',
    subtitle: 'AUTOMATED COST ENGINE',
    description: 'Automated estimate engine benchmarked against live trade market rates, material cost indexes, and regional job scope parameters.',
    accentColor: 'text-sky-300',
    lineColor: 'bg-sky-300',
    btnBg: 'bg-sky-400 hover:bg-sky-300 text-slate-950',
  },
];

export const FeaturesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="features" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* 
        ====================================================
        1. ATMOSPHERIC ARCHITECTURAL BACKGROUND (Image Overlay)
        ====================================================
      */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none rounded-3xl">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=2000&q=85"
          alt="Modern Architecture Background"
          className="w-full h-full object-cover object-center filter brightness-50 dark:brightness-40"
        />
        {/* Dark Gradient Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95" />
      </div>

      {/* Ambient Blue Radial Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[35rem] h-[25rem] bg-blue-600/20 rounded-full blur-[140px]" />
      </div>

      {/* 
        ====================================================
        2. SECTION HEADER
        ====================================================
      */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase backdrop-blur-2xl bg-white/10 text-cyan-300 border border-white/20 shadow-lg"
        >
          <Sparkles size={12} className="text-cyan-300" />
          <span>Uncompromised Quality & Security</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight"
        >
          Engineered for Trust & Precision
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-normal leading-relaxed"
        >
          Combining technological accuracy with real-world trade reliability to power the modern construction exchange.
        </motion.p>
      </div>

      {/* 
        ====================================================
        3. FROSTED GLASS COLUMN CARDS (Inspired by Reference)
        ====================================================
      */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
      >
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="relative rounded-2xl p-7 backdrop-blur-2xl bg-slate-950/45 dark:bg-slate-950/55 border border-white/20 hover:border-blue-400/60 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between group overflow-hidden"
            >
              {/* Subtle Blue Inner Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 space-y-5">
                {/* Top Category Label & Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300/80 tracking-widest uppercase">
                    {feat.category}
                  </span>

                  <div className={`p-2.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/15 ${feat.accentColor} shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <Icon size={18} />
                  </div>
                </div>

                {/* Main Feature Title & Subtitle */}
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white tracking-wider">
                    {feat.title}
                  </h3>
                  
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                    {feat.subtitle}
                  </p>

                  {/* Horizontal Divider Line Accent */}
                  <div className={`w-12 h-0.5 ${feat.lineColor} rounded-full my-3 opacity-80 group-hover:w-20 transition-all duration-300`} />
                </div>

                {/* Body Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>

              {/* 
                ------------------------------------------------
                PILL CTA BUTTON (Inspired by "Go to source ↗")
                ------------------------------------------------
              */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-start">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold shadow-lg transition-all duration-300 group-hover:scale-105 ${feat.btnBg}`}
                >
                  <span>Explore Feature</span>
                  <ArrowUpRight size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};