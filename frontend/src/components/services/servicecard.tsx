import { Star, CheckCircle2, ArrowRight } from "lucide-react";
import type { ServiceItem } from "../Types/marketplace.types";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: ServiceItem;
  onSelect: (id: string) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all overflow-hidden flex flex-col group"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-purple-700 shadow-sm">
          {service.category}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={service.provider.avatar}
                alt={service.provider.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                {service.provider.name}
                {service.provider.verified && (
                  <CheckCircle2 size={12} className="text-blue-600" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star size={14} className="fill-amber-400 stroke-amber-400" />
              {service.rating}
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1">
            {service.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {service.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Starting at
            </span>
            <span className="text-lg font-black text-purple-700">
              ${service.price}
            </span>
          </div>
          <button
            onClick={() => onSelect(service.id)}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            View Details
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
