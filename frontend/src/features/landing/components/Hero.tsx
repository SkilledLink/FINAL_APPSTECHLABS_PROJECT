import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setIsDarkMode(e.detail);
    };
    window.addEventListener('themeChange' as any, handleThemeChange);
    return () => window.removeEventListener('themeChange' as any, handleThemeChange);
  }, []);

  // Optimized lightweight starfield for smooth 60fps performance without GPU lag
  const stars = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 3,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.6 + 0.3,
    }));
  }, []);

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      title: 'Plumbing & Pipe Repair',
      rating: '4.9',
      tag: 'Verified Pro',
      reviews: '142'
    },
    {
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      title: 'Electrical Work',
      rating: '4.8',
      tag: 'Safety Inspected',
      reviews: '98'
    },
    {
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18fefbc?auto=format&fit=crop&w=600&q=80',
      title: 'Custom Carpentry',
      rating: '5.0',
      tag: 'Master Craft',
      reviews: '64'
    },
    {
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      title: 'HVAC & Maintenance',
      rating: '4.9',
      tag: 'Rapid Response',
      reviews: '115'
    },
    {
      url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
      title: 'Paint & Renovation',
      rating: '4.9',
      tag: 'Top Rated',
      reviews: '210'
    }
  ];

  // Hardware-accelerated smooth motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: custom * 0.1 
      }
    })
  };

  return (
    <section className={`relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-12 py-12 lg:py-20 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>

      {/* 🌌 DARK MODE BACKGROUND (Optimized Twinkling Stars + Nebulae) */}
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute bg-blue-300 rounded-full shadow-[0_0_8px_#3b82f6]"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                willChange: 'opacity, transform',
              }}
              animate={{
                opacity: [0.2, star.opacity, 0.2],
                scale: [0.9, 1.2, 0.9],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Ambient Nebulae */}
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tl from-sky-500/15 via-blue-900/20 to-transparent blur-[130px] pointer-events-none" />
        </div>
      )}

      {/* ☀️ LIGHT MODE BACKGROUND (Transparent Texture Image + Ambient Mesh Glow) */}
      {!isDarkMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Transparent General Blueprint / Architecture Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-multiply"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80')` 
            }} 
          />
          {/* Soft Mesh Glows */}
          <div className="absolute -top-28 -left-28 w-[550px] h-[550px] bg-gradient-to-br from-blue-300/35 via-sky-200/25 to-transparent rounded-full blur-[110px]" />
          <div className="absolute -bottom-28 -right-28 w-[500px] h-[500px] bg-gradient-to-tl from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-[120px]" />
        </div>
      )}

      {/* ─── MAIN CONTAINER ─── */}
      <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center z-10">
        
        {/* ── LEFT COLUMN: Headline & Primary CTA ── */}
        <div className="lg:col-span-6 flex flex-col items-start text-left gap-6 lg:pr-4">
          
          {/* Badge */}
          <motion.div 
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border backdrop-blur-md shadow-xs ${
              isDarkMode 
                ? 'bg-blue-950/70 border-blue-500/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.12)]' 
                : 'bg-white/90 border-blue-200/90 text-blue-700 shadow-blue-500/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>SkilledLink Certified Artisan Network</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]"
          >
            Connect with Trusted <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-sky-400">
              Local Artisans
            </span> in Minutes.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={`text-base sm:text-lg font-normal max-w-xl leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            SkilledLink bridges Cameroonian households with top-tier vetted specialists. Experience transparent pricing, background-checked pros, and guaranteed service excellence.
          </motion.p>

          {/* Trust Checkmarks */}
          <motion.div 
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="grid grid-cols-2 gap-3 w-full max-w-md pt-1"
          >
            <div className={`flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border backdrop-blur-sm ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-200' : 'bg-white/80 border-slate-200/90 text-slate-700 shadow-xs'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Background Checked</span>
            </div>
            <div className={`flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border backdrop-blur-sm ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-200' : 'bg-white/80 border-slate-200/90 text-slate-700 shadow-xs'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Upfront Honest Pricing</span>
            </div>
          </motion.div>

          {/* Single Primary Call To Action Button */}
          <motion.div 
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="w-full sm:w-auto pt-2"
          >
            <a 
              href="/login" 
              className="relative group w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
              <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>Join Us Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>

          {/* Live Activity Metric Footer */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={`flex items-center gap-3 pt-2 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-blue-500/40 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-blue-500/40 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-blue-500/40 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Over <strong className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>1,200+</strong> services booked recently</span>
            </div>
          </motion.div>

        </div>

        {/* ── RIGHT COLUMN: Glassmorphic Bento Collage Layout ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative w-full h-[540px] sm:h-[600px] flex items-center justify-center"
        >
          {/* Bento Grid Layer */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-3.5 p-1 sm:p-2">
            
            {/* 1. Main Featured Vertical Card (Plumbing) */}
            <div className={`col-span-5 row-span-4 rounded-3xl overflow-hidden relative shadow-2xl border group backdrop-blur-md transition-all duration-300 hover:shadow-blue-500/10 ${
              isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200/90 bg-white'
            }`}>
              <img 
                src={galleryImages[0].url} 
                alt={galleryImages[0].title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-full w-fit backdrop-blur-md mb-1.5">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  {galleryImages[0].tag}
                </span>
                <h4 className="text-sm font-extrabold text-white leading-tight">{galleryImages[0].title}</h4>
                <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-white text-[11px]">{galleryImages[0].rating}</span>
                  <span className="text-[10px] text-slate-300">({galleryImages[0].reviews})</span>
                </div>
              </div>
            </div>

            {/* 2. Top Right Horizontal Card (Electrical) */}
            <div className={`col-span-4 row-span-2 rounded-2xl overflow-hidden relative shadow-xl border group backdrop-blur-md transition-all duration-300 ${
              isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200/90 bg-white'
            }`}>
              <img 
                src={galleryImages[1].url} 
                alt={galleryImages[1].title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-3">
                <span className="text-[11px] font-bold text-white truncate">{galleryImages[1].title}</span>
                <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="font-bold text-white">{galleryImages[1].rating}</span>
                  <span className="text-[9px] text-slate-300">({galleryImages[1].reviews})</span>
                </div>
              </div>
            </div>

            {/* 3. Top Far Right Card (Carpentry) */}
            <div className={`col-span-3 row-span-3 rounded-2xl overflow-hidden relative shadow-xl border group backdrop-blur-md transition-all duration-300 ${
              isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200/90 bg-white'
            }`}>
              <img 
                src={galleryImages[2].url} 
                alt={galleryImages[2].title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-2.5">
                <span className="text-[10px] font-bold text-white leading-tight truncate">{galleryImages[2].title}</span>
                <div className="flex items-center gap-0.5 text-amber-400 text-[9px]">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  <span className="font-bold text-white">{galleryImages[2].rating}</span>
                </div>
              </div>
            </div>

            {/* 4. Middle Right Card (HVAC) */}
            <div className={`col-span-4 row-span-2 rounded-2xl overflow-hidden relative shadow-xl border group backdrop-blur-md transition-all duration-300 ${
              isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200/90 bg-white'
            }`}>
              <img 
                src={galleryImages[3].url} 
                alt={galleryImages[3].title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-[11px] font-bold text-white truncate">{galleryImages[3].title}</span>
                <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="font-bold text-white">{galleryImages[3].rating}</span>
                </div>
              </div>
            </div>

            {/* 5. Highlight Badge Card (SkilledLink Brand Focus) */}
            <div className="col-span-3 row-span-3 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-3.5 flex flex-col justify-between shadow-xl shadow-blue-600/20 text-white border border-blue-400/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between z-10">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-100" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 border border-white/20 px-2 py-0.5 rounded-full text-blue-100">PRO</span>
              </div>
              <div className="z-10">
                <h4 className="font-black text-xs tracking-wide leading-tight mb-0.5">SKILLEDLINK</h4>
                <p className="text-[10px] text-blue-100/90 font-medium">Guaranteed Service</p>
              </div>
            </div>

            {/* 6. Bottom Wide Card (Paint & Renovation) */}
            <div className={`col-span-5 row-span-2 rounded-2xl overflow-hidden relative shadow-xl border group backdrop-blur-md transition-all duration-300 ${
              isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200/90 bg-white'
            }`}>
              <img 
                src={galleryImages[4].url} 
                alt={galleryImages[4].title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent flex items-center px-4 justify-between">
                <div>
                  <span className="text-xs font-bold text-white block truncate">{galleryImages[4].title}</span>
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-bold text-white">{galleryImages[4].rating}</span>
                    <span className="text-blue-300 text-[10px]">({galleryImages[4].reviews} reviews)</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 backdrop-blur-md shrink-0">
                  <Star className="w-3.5 h-3.5 fill-blue-300" />
                </div>
              </div>
            </div>

          </div>

          {/* 🌟 Floating Status Badge 1 (Top Left Overhang) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className={`absolute -top-3 -left-3 sm:-left-6 px-3.5 py-2 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center gap-3 z-20 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-700/80 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Artisans</p>
              <p className="text-xs font-extrabold flex items-center gap-1">
                240+ Pros Online <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </p>
            </div>
          </motion.div>

          {/* 🌟 Floating Status Badge 2 (Bottom Right Rating Card) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className={`absolute -bottom-3 -right-3 sm:-right-6 px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center gap-3 z-20 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-700/80 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs font-black flex items-center gap-1">
                4.95 / 5.0 Rating
              </p>
              <p className="text-[10px] text-slate-400 font-medium">From 3,400+ reviews</p>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}