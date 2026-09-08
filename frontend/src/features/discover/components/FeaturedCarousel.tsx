import React from "react";
import { Star, MapPin, Heart } from "lucide-react";

interface FeaturedItem {
  id: string;
  name: string;
  title: string;
  coverImage: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: string;
  tags: string[];
  isVerified: boolean;
}

interface FeaturedCarouselProps {
  items: FeaturedItem[];
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ items }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span className="text-blue-500">✦</span> Featured Professionals
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[280px] md:min-w-[320px] snap-start bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 flex-shrink-0"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={item.coverImage}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors">
                <Heart size={18} />
              </button>
              {item.isVerified && (
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm text-white text-xs font-semibold">
                  Verified ✓
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {item.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star size={16} className="fill-amber-400" />
                  <span>{item.rating}</span>
                  <span className="text-slate-400 font-normal">({item.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin size={14} />
                  <span>{item.distance}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                <button className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                  View Profile
                </button>
                <button className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};