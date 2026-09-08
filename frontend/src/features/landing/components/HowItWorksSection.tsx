import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Create Profile',
    badgeText: 'Fast 2-Min Setup',
    description:
      'Showcase skills, trade licenses, and portfolio to register as a verified local master specialist or hiring contractor.',
    icon: UserPlus,
    accentBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    badgeStyle: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
  },
  {
    step: '02',
    title: 'Connect & Match',
    badgeText: 'AI Matchmaking',
    description:
      'Match with vetted local homeowners or contractors with verified scope estimates, transparent pricing, and zero hidden fees.',
    icon: Search,
    accentBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400',
    badgeStyle: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200/80 dark:border-sky-800',
  },
  {
    step: '03',
    title: 'Get Work Done',
    badgeText: '100% Escrow Secured',
    description:
      'Milestone escrow payouts, real-time job status tracking, and verified contractor warranties ensure total peace of mind.',
    icon: ShieldCheck,
    accentBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800',
  },
];

export const HowItWorksSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="how-it-works" className="relative w-full bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ====================================================
            1. TOP BLUE BANNER HEADER (Compact Height)
            ==================================================== */}
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 pt-10 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 text-center text-white overflow-hidden shadow-xl shadow-blue-600/15">
          
          {/* Subtle Grid Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, 
              backgroundSize: '20px 20px' 
            }} 
          />
          
          {/* Subtle Glow Orbs */}
          <div className="absolute -top-12 -left-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-2.5 relative z-10">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-sm"
            >
              <Sparkles size={12} className="text-sky-200" />
              <span>Simple 3-Step Process</span>
            </motion.div>

            {/* Header Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white"
            >
              How SkilledLink Works
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto font-normal leading-relaxed"
            >
              Connecting homeowners, commercial developers, and state-certified contractors without friction.
            </motion.p>
          </div>
        </div>

        {/* ====================================================
            2. OVERLAPPING STEP CARDS
            ==================================================== */}
        <div className="px-2 sm:px-6 -mt-12 sm:-mt-14 relative z-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
          >
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 pt-9 text-center shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Floating Centered Number Circle */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 shadow-md flex items-center justify-center font-extrabold text-blue-600 dark:text-blue-400 text-sm group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>

                  {/* Upper Graphic & Details */}
                  <div>
                    {/* Icon Graphic Container */}
                    <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 scale-110 group-hover:scale-125 transition-transform duration-500 rounded-2xl" />
                      
                      <div className={`w-14 h-14 rounded-2xl border ${step.accentBg} flex items-center justify-center shadow-sm relative z-10 group-hover:rotate-3 transition-transform duration-300`}>
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal mb-6">
                      {step.description}
                    </p>
                  </div>

                  {/* Card Footer Tag & Arrow */}
                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${step.badgeStyle}`}>
                      <CheckCircle2 size={11} />
                      {step.badgeText}
                    </span>

                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white flex items-center justify-center transition-all duration-300">
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
};