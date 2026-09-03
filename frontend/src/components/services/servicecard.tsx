import { useState } from "react";
import { Star, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProfessionalItem } from "../Types/marketplace.types";

interface ServiceCardProps {
  professional: ProfessionalItem;
  onViewProfile: (id: string) => void;
  onContact: (id: string) => void;
}

export default function ServiceCard({
  professional,
  onViewProfile,
  onContact,
}: ServiceCardProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const nextImage = () => {
    setActiveImgIndex((prev) => (prev + 1) % professional.images.length);
  };

  const prevImage = () => {
    setActiveImgIndex(
      (prev) =>
        (prev - 1 + professional.images.length) % professional.images.length,
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between text-black">
      <div>
        {/* Header: Avatar, Name, Verified */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={professional.avatar}
            alt={professional.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-black">
                {professional.name}
              </h3>
              {professional.verified && (
                <span className="flex items-center gap-0.5 text-blue-600 text-[10px] font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                  <CheckCircle size={10} className="fill-blue-600 text-white" />{" "}
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {professional.title}
            </p>
          </div>
        </div>

        {/* Rating & Years in Trade */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1 font-bold text-black">
            <span>{professional.rating}</span>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-gray-400 font-normal">
              ({professional.reviewCount} reviews)
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-600 mb-4 font-medium">
          Years in Trade:{" "}
          <span className="text-black font-bold">
            {professional.yearsInTrade}
          </span>
        </div>

        {/* Image Carousel */}
        <div className="relative h-36 bg-gray-100 rounded-xl overflow-hidden mb-4 group">
          <img
            src={professional.images[activeImgIndex]}
            alt="Work sample"
            className="w-full h-full object-cover"
          />
          <button
            onClick={prevImage}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-black shadow opacity-75 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-black shadow opacity-75 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={14} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {professional.images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${idx === activeImgIndex ? "bg-blue-600" : "bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onViewProfile(professional.id)}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-black py-2 rounded-xl text-xs font-semibold transition-colors text-center"
        >
          View Profile
        </button>
        <button
          onClick={() => onContact(professional.id)}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-black py-2 rounded-xl text-xs font-semibold transition-colors text-center"
        >
          Contact
        </button>
      </div>
    </div>
  );
}
