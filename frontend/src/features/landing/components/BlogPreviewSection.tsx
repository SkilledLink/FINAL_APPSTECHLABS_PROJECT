import React from 'react';
import { Calendar, ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ARTICLES = [
  {
    id: 1,
    title: 'Top 5 Electrical Licensing Changes General Contractors Must Know in 2026',
    excerpt: 'State licensing boards are enforcing new compliance rules for residential high-voltage and solar grid installations.',
    category: 'Trade Regulations',
    date: 'Sep 05, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 2,
    title: 'How Escrow Payouts Eliminate Contractor Payment Disputes on Renovation Builds',
    excerpt: 'Learn how milestone-locked escrow accounts safeguard project cash flow for both homeowners and contractors.',
    category: 'Financial Insights',
    date: 'Aug 29, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 3,
    title: 'High-Voltage & Heat Pump Surge: Growth Opportunities for Local Specialists',
    excerpt: 'Market demand for heat pump conversions and EV panel upgrades has jumped 40% year-over-year.',
    category: 'Market Trends',
    date: 'Aug 18, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    author: {
      name: 'David Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  },
];

export const BlogPreviewSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="blog" className="relative py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[18rem] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
            <BookOpen size={13} className="text-blue-500" />
            <span>Resource Hub</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Latest Industry Insights
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-xl">
            Stay ahead with trade regulations, market analysis, and financial strategy for modern contractors.
          </p>
        </div>

        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/40 shadow-sm transition-all group shrink-0"
        >
          <span>View All Publications</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Articles Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
      >
        {ARTICLES.map((art) => (
          <motion.article
            key={art.id}
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-lg hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Image Banner */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Category Badge */}
                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-blue-300 backdrop-blur-md border border-white/10 shadow-md">
                  {art.category}
                </span>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-3">
                {/* Meta Metadata (Date + Read Time) */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-500" />
                    <span>{art.date}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>
            </div>

            {/* Footer Row (Author & Action CTA) */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between mt-auto">
              {/* Author Info */}
              <div className="flex items-center gap-2.5">
                <img
                  src={art.author.avatar}
                  alt={art.author.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {art.author.name}
                </span>
              </div>

              {/* Read Action Button */}
              <Link
                to={`/blog/${art.id}`}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <span>Read</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};