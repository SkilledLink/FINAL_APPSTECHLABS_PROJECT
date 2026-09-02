import { useEffect, useState } from "react";
import type { ServiceItem } from "../../Types/marketplace.types";
import { marketplaceService } from "../../Servicesmarket/marketplaceService";
import {
  Star,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface ServiceDetailsPageProps {
  serviceId: string;
  onBack: () => void;
  onRequestService: (id: string) => void;
}

export default function ServiceDetailsPage({
  serviceId,
  onBack,
  onRequestService,
}: ServiceDetailsPageProps) {
  const [service, setService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    marketplaceService.getServiceById(serviceId).then((data) => {
      if (data) setService(data);
    });
  }, [serviceId]);

  if (!service) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading service details...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold text-xs transition-colors"
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative h-72 bg-slate-100">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-purple-700 shadow-sm">
            {service.category}
          </span>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                {service.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={service.provider.avatar}
                    alt={service.provider.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    {service.provider.name}
                    {service.provider.verified && (
                      <CheckCircle2 size={14} className="text-blue-600" />
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                  {service.rating} (50+ reviews)
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                Starting at
              </span>
              <span className="text-3xl font-black text-purple-700">
                ${service.price}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              About This Service
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {service.description}
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every project includes full documentation, clean maintainable code
              structured for scalability, and post-launch support to ensure
              smooth integration with your existing stack.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
              <ShieldCheck size={24} className="text-blue-600 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs">
                  Verified Expert Guarantee
                </h4>
                <p className="text-[11px] text-slate-500">
                  Secure escrow and verified credentials.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
              <Clock size={24} className="text-purple-600 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs">
                  Fast Turnaround
                </h4>
                <p className="text-[11px] text-slate-500">
                  Dedicated delivery within timeline.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onRequestService(service.id)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all text-sm"
            >
              Request This Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
