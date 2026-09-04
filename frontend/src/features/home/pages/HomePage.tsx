import React, { useEffect, useState } from "react";
import { TrendingUp, Search } from "lucide-react";

// Corrected Import: mockData is a runtime object value, HomeData is a TypeScript interface
import { mockData } from "../../../data/mockData";
import type { HomeData } from "../../../types/home";

// Components
import ProjectHighlights from "../../../components/components/ProjectHighlight";
import CompletedProject from "../../../components/components/Completedproject";
import CreatePost from "../../../components/components/CreatePost";
import FeedPost from "../../../components/components/FeedPost";
import CommunityQuestion from "../../../components/components/CommunityQuestions";
import SuggestedProfessionals from "../../../components/components/SuggestedProffessionals";
import RecentActivity from "../../../components/components/RecentActivity";
import TrendingTrades from "../../../components/components/TrendingTrades";

export default function HomePage() {
  const [data, setData] = useState<HomeData>(mockData);
  const [loading, setLoading] = useState(false);
  const [feedSearch, setFeedSearch] = useState('');

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // Backend fetch calls will be placed here
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

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your feed...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Mobile-Only Search Filter */}
      <div className="sm:hidden relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={feedSearch}
          onChange={(e) => setFeedSearch(e.target.value)}
          placeholder="Filter feed or topics..."
          className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
        />
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - Highlights & Projects (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          <ProjectHighlights highlights={data.highlights} />
          
          {data.projects && data.projects.length > 0 && (
            <CompletedProject project={data.projects[0]} />
          )}
        </div>

        {/* CENTER COLUMN - Create Post & Feed (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <CreatePost />
          
          {/* Posts Feed */}
          <div className="space-y-6">
            {data.posts && data.posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
          
          {/* Community Questions */}
          <div className="space-y-6">
            {data.questions && data.questions.map((question) => (
              <CommunityQuestion key={question.id} question={question} />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - Pulse, Suggestions & Activity (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Local Pulse Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Local Pulse
            </h2>
            
            <TrendingTrades trades={data.trendingTrades} />
          </div>

          <SuggestedProfessionals professionals={data.professionals} />
          
          <RecentActivity activities={data.activities} />
        </div>

      </div>
    </div>
  );
}