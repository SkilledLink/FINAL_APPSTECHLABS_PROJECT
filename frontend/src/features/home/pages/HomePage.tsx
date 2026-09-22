// src/features/home/pages/HomePage.tsx

import React, { useEffect, useState } from "react";
import { TrendingUp, Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";

import { mockData } from "../../../data/mockData";
import type { HomeData } from "../../../types/home";

import ProjectHighlights from "../../../components/components/ProjectHighlight";
import CompletedProject from "../../../components/components/Completedproject";
import Feed from "../../posts/components/Feed";
import CommunityQuestion from "../../../components/components/CommunityQuestions";
import SuggestedProfessionals from "../../../components/components/SuggestedProffessionals";
import RecentActivity from "../../../components/components/RecentActivity";
import TrendingTrades from "../../../components/components/TrendingTrades";

export default function HomePage() {
  const [data, setData] = useState<HomeData>(mockData);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // LOAD HOME DATA
  // ============================================================

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with real API request in production
      setData(mockData);
    } catch (error) {
      console.error("Error loading home data:", error);
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  // ============================================================
  // SKELETON LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="h-48 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
          <div className="h-64 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
        </div>
        <div className="col-span-1 lg:col-span-6 space-y-4">
          <div className="h-28 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
          <div className="h-80 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
          <div className="h-80 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
        </div>
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="h-44 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
          <div className="h-64 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME PAGE
  // ============================================================

  return (
    <div className="w-full h-full min-h-full">
      {/* ========================================================
          MAIN CONTENT GRID
          ======================================================== */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 px-3 sm:px-5 py-4 h-full">
        {/* ======================================================
            LEFT COLUMN: Highlights & Project Showcase
            ====================================================== */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar pr-1">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Project Highlights Card */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-0.5 shadow-sm hover:shadow-md transition-all duration-300">
              <ProjectHighlights highlights={data.highlights} />
            </div>

            {/* Completed Project Card */}
            {data.projects && data.projects.length > 0 && (
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-0.5 shadow-sm hover:shadow-md transition-all duration-300">
                <CompletedProject project={data.projects[0]} />
              </div>
            )}
          </motion.div>
        </aside>

        {/* ======================================================
            CENTER COLUMN: Primary Activity Feed
            ====================================================== */}
        <main className="col-span-1 lg:col-span-6 w-full min-w-0 space-y-5 pb-8 overflow-y-auto no-scrollbar">
          {/* Feed Container */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-5"
          >
            <Feed />

            {/* Community Questions Section */}
            {data.questions && data.questions.length > 0 && (
              <section className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Community Discussions
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                    {data.questions.length} Active
                  </span>
                </div>

                <div className="space-y-3">
                  {data.questions.map((question) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-200 hover:border-blue-500/30 shadow-sm"
                    >
                      <CommunityQuestion question={question} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </main>

        {/* ======================================================
            RIGHT COLUMN: Local Pulse & Recommendations
            ====================================================== */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar pl-1">
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="space-y-4"
          >
            {/* Local Pulse Card */}
            <section className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              {/* Subtle ambient gradient lighting */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  Local Pulse
                </h2>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Flame className="w-3 h-3" /> Live
                </div>
              </div>

              <TrendingTrades trades={data.trendingTrades} />
            </section>

            {/* Suggested Professionals Card */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <SuggestedProfessionals professionals={data.professionals} />
            </div>

            {/* Recent Activity Card */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <RecentActivity activities={data.activities} />
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}