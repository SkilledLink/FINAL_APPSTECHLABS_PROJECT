import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ShieldCheck, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SPECIALISTS = [
  {
    id: '1',
    name: 'Elena Rostova',
    trade: 'Master Electrician',
    specialty: 'Industrial & Smart Grids',
    rating: 4.9,
    reviews: 142,
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$85/hr',
    badge: 'State Certified',
  },
  {
    id: '2',
    name: 'Marcus Vance',
    trade: 'General Contractor',
    specialty: 'Commercial Remodeling',
    rating: 4.8,
    reviews: 310,
    location: 'Dallas, TX',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$110/hr',
    badge: 'Master Builder',
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    trade: 'Commercial Plumber',
    specialty: 'High-Pressure Systems',
    rating: 5.0,
    reviews: 88,
    location: 'Houston, TX',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$89/hr',
    badge: 'Licensed Master',
  },
  {
    id: '4',
    name: 'David Chen',
    trade: 'HVAC Specialist',
    specialty: 'Eco Climate Control',
    rating: 4.9,
    reviews: 204,
    location: 'San Antonio, TX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$95/hr',
    badge: 'Energy Certified',
  },
];

export const FeaturedShowcase: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
    <section id="showcase" className="relative py-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
            <Sparkles size={12} className="text-blue-500" />
            <span>Top Rated Talent Directory</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Featured Master Professionals
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            Every specialist is background checked, state-license verified, and rated by local homeowners.
          </p>
        </div>

        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white border border-blue-200/60 dark:border-blue-800/60 transition-all duration-300 group self-start md:self-auto"
        >
          <span>View All Directory Listings</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Specialist Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {SPECIALISTS.map((pro) => (
          <motion.div
            key={pro.id}
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/70 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group transition-all duration-300 flex flex-col justify-between"
          >
            {/* Upper Section: Cover Image + Badges */}
            <div>
              <div className="relative h-28 overflow-hidden bg-slate-950">
                <img
                  src={pro.cover}
                  alt={pro.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                {/* Verified Badge */}
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-slate-950/70 backdrop-blur-md text-sky-300 border border-sky-400/30 flex items-center gap-1 shadow-md">
                  <ShieldCheck size={12} className="text-sky-400" /> Verified Pro
                </span>

                {/* Hourly Rate Floating Tag */}
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-blue-600 text-white shadow-md">
                  {pro.hourlyRate}
                </span>
              </div>

              {/* Card Main Body */}
              <div className="p-5 pt-0 relative">
                {/* Floating Avatar */}
                <div className="relative -top-6 mb-0 flex justify-between items-end">
                  <div className="relative">
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-900 shadow-xl"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Available for Hire" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                    {pro.badge}
                  </span>
                </div>

                {/* Info Text */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {pro.name}
                  </h3>

                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                    {pro.trade}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                    {pro.specialty}
                  </p>
                </div>

                {/* Location & Star Rating Bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="flex items-center gap-1 text-[11px]">
                    <MapPin size={12} className="text-slate-400" />
                    {pro.location}
                  </span>

                  <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    {pro.rating} <span className="text-slate-400 font-normal">({pro.reviews})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Action Button (Pill Style with ↗) */}
            <div className="p-5 pt-0">
              <Link
                to={`/pro/${pro.id}`}
                className="w-full py-2.5 px-4 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 dark:hover:bg-blue-500 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white font-bold text-xs flex items-center justify-between transition-all duration-300 shadow-sm"
              >
                <span>View Full Profile</span>
                <ArrowUpRight size={15} className="stroke-[2.5]" />
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};