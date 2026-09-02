// features/home/pages/HomePage.tsx
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Heart, 
  MessageCircle,
  MapPin,
  Briefcase,
  ThumbsUp,
  Share2,
  MoreHorizontal,
  Search,
  Filter,
  Grid3x3,
  List,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Rocket,
  Compass,
  HelpCircle,
  Layers,
  Eye,
  Tag,
  Zap,
  FileText,
  Bookmark,
  ChevronDown,
  Send,
  Image,
  Video,
  Smile,
  PlusCircle,
  Star,
  CheckCircle,
  UserPlus,
  Briefcase as BriefcaseIcon,
  Home,
  MessageSquare
} from "lucide-react";

// Import mock data
import { mockData } from "../../../data/mockData";
import type { HomeData } from "../../../types/home";

// Import services (will be used when backend is ready)
// import { getPosts } from "../../../services/post";
// import { getProjects, getHighlights } from "../../../services/projects";
// import { getQuestions } from "../../../services/questions";
// import { getSuggestedProfessionals } from "../../../services/professionals";

// Import components

import ProjectHighlights from "../../../components/components/ProjectHighlight";
import CompletedProject from "../../../components/components/Completedproject"
import CreatePost from "../../../components/components/CreatePost"
import FeedPost from "../../../components/components/FeedPost"
import CommunityQuestion from "../../../components/components/CommunityQuestions"
import SuggestedProfessionals from "../../../components/components/SuggestedProffessionals"
import RecentActivity from "../../../components/components/RecentActivity"
import TrendingTrades from "../../../components/components/TrendingTrades"

// If components don't exist yet, you can use these fallback components
// or create them as separate files

const HomePage = () => {
  const [data, setData] = useState<HomeData>(mockData);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // This function will be used when backend is ready
  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Uncomment when backend is ready
      // const [highlights, projects, posts, questions, professionals] = 
      //   await Promise.all([
      //     getHighlights(),
      //     getProjects(),
      //     getPosts(),
      //     getQuestions(),
      //     getSuggestedProfessionals(),
      //   ]);
      
      // setData({
      //   ...mockData,
      //   highlights: highlights || mockData.highlights,
      //   projects: projects || mockData.projects,
      //   posts: posts || mockData.posts,
      //   questions: questions || mockData.questions,
      //   professionals: professionals || mockData.professionals,
      // });
      
      // For now, just use mock data
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar - Add this if you want */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search professionals, posts, services..."
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - 3 cols on large screens */}
          <div className="lg:col-span-3 space-y-6">
            <ProjectHighlights highlights={data.highlights} />
            
            {data.projects && data.projects.length > 0 && (
              <CompletedProject project={data.projects[0]} />
            )}
          </div>

          {/* CENTER COLUMN - 6 cols on large screens */}
          <div className="lg:col-span-6 space-y-6">
            <CreatePost />
            
            {/* Posts Feed */}
            <div className="space-y-6">
              {data.posts && data.posts.map((post) => (
                <FeedPost key={post.id} post={post} />
              ))}
            </div>
            
            {/* Questions */}
            {data.questions && data.questions.map((question) => (
              <CommunityQuestion key={question.id} question={question} />
            ))}
          </div>

          {/* RIGHT COLUMN - 3 cols on large screens */}
          <div className="lg:col-span-3 space-y-6">
            {/* Local Pulse Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Local Pulse
              </h2>
              
              <TrendingTrades trades={data.trendingTrades} />
            </div>

            <SuggestedProfessionals professionals={data.professionals} />
            
            <RecentActivity activities={data.activities} />
          </div>
          
        </div>
      </div>
    </main>
  );
};

export default HomePage;