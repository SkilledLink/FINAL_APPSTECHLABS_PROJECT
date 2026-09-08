import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'How does SkilledLink verify contractor licenses and insurance?',
    a: 'We execute a 3-point automated & manual audit: verifying active state licensing boards, holding active commercial general liability certificates on file, and performing identity background checks.',
  },
  {
    q: 'How does escrow protection safeguard my payment?',
    a: 'When you accept a job quote, your payment is placed into secure escrow. Funds are released step-by-step only after you inspect and sign off on completed project milestones.',
  },
  {
    q: 'Are there any hidden lead fees for pros?',
    a: 'No. Unlike legacy directory sites that charge pros per phone lead, SkilledLink offers a flat subscription model. Pros keep 100% of their earned job fees.',
  },
  {
    q: 'What happens if a project has unexpected delays or quality issues?',
    a: 'SkilledLink includes platform mediation support. Our trade auditors review site progress photos, scope documents, and chat history to enforce fair outcomes under our Platform Warranty Guarantee.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-10">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[15rem] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
          <HelpCircle size={13} className="text-blue-500" />
          <span>Have Questions?</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
          Everything you need to know about booking verified trade specialists, milestone payments, and escrow protection.
        </p>
      </div>

      {/* Accordion Item Cards */}
      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-2xl ${
                isOpen
                  ? 'bg-white/90 dark:bg-slate-900/90 border-blue-500/50 dark:border-blue-500/40 shadow-lg shadow-blue-500/5'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md transition-colors ${
                      isOpen
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {faq.q}
                  </span>
                </div>

                <div
                  className={`p-1.5 rounded-full transition-all duration-300 shrink-0 ${
                    isOpen
                      ? 'bg-blue-600 text-white rotate-180'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`}
                >
                  <ChevronDown size={15} />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 sm:ml-11">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Support CTA Footer Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/50 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-md">
            <MessageSquare size={18} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Still have questions?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Can't find what you're looking for? Speak directly with our support team.
            </p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all duration-300 shrink-0 shadow-md hover:shadow-blue-500/25">
          Contact Support
        </button>
      </div>
    </section>
  );
};