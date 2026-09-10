import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import { AccordionGallery } from '../components/AccordionGallery';
import GallerySection from '../components/GallerySection';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, MessageSquareText } from 'lucide-react';

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Yaoundé');

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => {
      setIsDarkMode(e.detail);
    };
    window.addEventListener('themeChange' as any, handleThemeChange);
    return () => window.removeEventListener('themeChange' as any, handleThemeChange);
  }, []);

  return (
    <div className={`relative min-h-screen font-sans overflow-hidden transition-colors duration-300 selection:bg-blue-600 selection:text-white ${
      isDarkMode ? 'bg-[#070b14] text-white' : 'bg-white text-gray-900'
    }`}>
      
      {/* Framer Motion Blue Background Glowing Effects Beneath */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-50">
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-600/30 blur-[130px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-500/20 blur-[160px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main Page Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <Header />

        {/* Main Content Area */}
        <main className=" px-6 py-16 flex-grow">
          
          {/* Imported Hero Component */}
          <div className="mb-20">
            <Hero 
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Featured Showcase Section with Accordion Gallery */}
          <section id="showcase" className="my-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Verified Specialists in Action</h2>
              <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Browse our top-rated local professionals ready to assist across {selectedCity}.
              </p>
            </div>

            <div className={`p-4 md:p-6 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-[#0b0f19]/80 border-white/10' 
                : 'bg-white/80 border-gray-200 shadow-xl'
            }`}>
              <AccordionGallery 
                items={[
                  { image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758', label: 'Master Plumbers & Pipe Repair' },
                  { image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18fefbc', label: 'Expert Carpentry & Custom Joinery' },
                  { image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', label: 'Certified Electricians & Wiring' },
                  { image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a', label: 'Home Diagnostics & Troubleshooting' }
                ]}
                height={480}
                accentColor="#3b82f6"
              />
            </div>
          </section>

          {/* 3D Circular WebGL Gallery Section */}
          <GallerySection />

          {/* Interactive Problem Solving Feature Grid */}
          <section id="features" className="my-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-3xl border transition-all ${
              isDarkMode ? 'bg-[#111827]/50 border-white/10' : 'bg-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Diagnose Before You Book</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Confused by mysterious home electrical or structural issues? Chat with experts who help you understand the root cause before sending someone over.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border transition-all ${
              isDarkMode ? 'bg-[#111827]/50 border-white/10' : 'bg-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Background Verified</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Every artisan on SkilledLink undergoes rigorous ID verification and skill testing so you can invite professionals into your home with complete peace of mind.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border transition-all ${
              isDarkMode ? 'bg-[#111827]/50 border-white/10' : 'bg-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-sky-600/10 border border-sky-500/20 flex items-center justify-center text-sky-500 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Local Pricing</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No hidden fees or surprise costs. Get upfront estimates tailored to local Cameroonian standards before any repair work begins.
              </p>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className={`border-t py-8 text-center text-sm backdrop-blur-md transition-colors duration-300 ${
          isDarkMode 
            ? 'border-white/10 bg-[#070b14]/50 text-gray-500' 
            : 'border-gray-200 bg-white/50 text-gray-500'
        }`}>
          <p>&copy; {new Date().getFullYear()} SkilledLink. Empowering Cameroonian Households & Artisans.</p>
        </footer>

      </div>
    </div>
  );
}