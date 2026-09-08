import React from 'react';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    id: 1,
    quote:
      'We must appreciate the staff mindset to stick to high-quality services and finishes. Highly recommended whosoever looking for excellent trade execution.',
    author: 'Dennis Owen',
    role: 'Vice-Chairman',
    company: 'ABC Company',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    quote:
      'Biggest thanks to the team for fantastic design work. Really appreciate their expertise, safety protocols, and prompt milestone delivery.',
    author: 'Ryan McKee',
    role: 'Project Lead',
    company: 'ABC Residencies',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    quote:
      'SkilledLink has executed the project with highest quality standards and ensured total compliance with local building safety requirements.',
    author: 'Jessica Graham',
    role: 'Co-Founder',
    company: 'XYZ Company',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
];

export const TestimonialsSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="testimonials" className="relative w-full pt-16 pb-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* ====================================================
            1. TOP HEADER (Matches Presentation Slide Layout)
            ==================================================== */}
        <div className="max-w-4xl mb-14 space-y-2 text-left">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Client reviews and testimonials
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-3xl"
          >
            This section focuses on client reviews and testimonials post experiencing our designing and trade services which helps to build credibility and reliability to business and helps in decision making process.
          </motion.p>
        </div>

        {/* ====================================================
            2. REVIEWS CONTAINER WITH BOTTOM ACCENT BAND
            ==================================================== */}
        <div className="relative pt-4">
          
          {/* Main 3-Column Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20"
          >
            {REVIEWS.map((rev) => (
              <motion.div
                key={rev.id}
                variants={cardVariants}
                className="flex flex-col items-center text-center group"
              >
                {/* 
                  ----------------------------------------------
                  SPEECH BUBBLE CARD (Oval / Pill with Pointer)
                  ----------------------------------------------
                */}
                <div className="relative w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-center items-center min-h-[190px] group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-all duration-300">
                  
                  {/* Quote Text with Blue Accent Quote Marks */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                    <span className="text-blue-600 dark:text-blue-400 font-serif font-bold text-lg mr-1">“</span>
                    {rev.quote}
                    <span className="text-blue-600 dark:text-blue-400 font-serif font-bold text-lg ml-1">”</span>
                  </p>

                  {/* Downward Pointer Triangle */}
                  <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-x-transparent border-t-[14px] border-t-white dark:border-t-slate-900 filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.03)]" />
                </div>

                {/* 
                  ----------------------------------------------
                  CIRCULAR AVATAR (Overlaps the Blue Bottom Bar)
                  ----------------------------------------------
                */}
                <div className="relative mt-8 z-30">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-full h-full object-cover filter contrast-[1.03]"
                    />
                  </div>
                  {/* Vertical Thin Connector Line from Avatar to Text */}
                  <div className="w-0.5 h-3 bg-white/40 mx-auto my-1" />
                </div>

                {/* 
                  ----------------------------------------------
                  AUTHOR DETAILS (Centered White Text on Blue Bar)
                  ----------------------------------------------
                */}
                <div className="relative z-30 text-center space-y-0.5 pb-6">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {rev.author}
                  </h3>
                  <p className="text-xs font-medium text-blue-100/90">
                    {rev.role}
                  </p>
                  <p className="text-xs font-normal text-blue-200/75">
                    {rev.company}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* 
            ----------------------------------------------------
            FULL-WIDTH HORIZONTAL BLUE ACCENT BAR (Bottom Section)
            ----------------------------------------------------
          */}
          <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-3xl z-10 shadow-xl" />
        </div>

        {/* Bottom Slide Disclaimer Note */}
        <div className="text-center mt-10">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            This section represents verified client feedback. Adapt content to your project needs to showcase credibility.
          </p>
        </div>

      </div>
    </section>
  );
};