import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRO_CARDS = [
  {
    id: '1',
    name: 'Michael Vance',
    trade: 'Master Electrician',
    rating: 4.9,
    reviews: 142,
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$85/hr',
  },
  {
    id: '2',
    name: 'Apex Structural Inc.',
    trade: 'General Contractor',
    rating: 4.8,
    reviews: 310,
    location: 'Dallas, TX',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$120/hr',
  },
  {
    id: '3',
    name: 'David Reynolds',
    trade: 'HVAC Specialist',
    rating: 5.0,
    reviews: 198,
    location: 'Houston, TX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$95/hr',
  },
  {
    id: '4',
    name: 'Sarah Chen',
    trade: 'Solar & Renewable Tech',
    rating: 4.9,
    reviews: 112,
    location: 'San Antonio, TX',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    hourlyRate: '$90/hr',
  },
];

export const SlidingShowcase: React.FC = () => {
  return (
    <section id="showcase" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Top Directory
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Featured Verified Professionals
          </h2>
        </div>

        <Link
          to="/discover"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>Browse All Marketplace</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Glass Marquee Slider */}
      <div className="flex items-center gap-6 overflow-x-auto pb-6 no-scrollbar">
        {PRO_CARDS.map((pro) => (
          <motion.div
            key={pro.id}
            whileHover={{ y: -6 }}
            className="min-w-[290px] sm:min-w-[320px] rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xl group transition-all"
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={pro.cover}
                alt={pro.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/30" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1 shadow-md">
                <ShieldCheck size={12} /> Verified
              </span>
            </div>

            <div className="p-5 relative">
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-900 shadow-xl absolute -top-7 left-5"
              />

              <div className="pt-7 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {pro.name}
                  </h3>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                    {pro.hourlyRate}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {pro.trade}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {pro.location}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    {pro.rating} ({pro.reviews})
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};