import { useEffect, useState } from "react";
import type { ProfessionalItem } from "../../Types/marketplace.types";
import { marketplaceService } from "../../Servicesmarket/marketplaceService";
import { CheckCircle, ArrowLeft, Shield, MapPin } from "lucide-react";

interface ServiceDetailsPageProps {
  professionalId: string;
  onBack: () => void;
  onContact: (id: string) => void;
}

export default function ServiceDetailsPage({
  professionalId,
  onBack,
  onContact,
}: ServiceDetailsPageProps) {
  const [pro, setPro] = useState<ProfessionalItem | null>(null);

  useEffect(() => {
    marketplaceService.getProfessionalById(professionalId).then((data) => {
      if (data) setPro(data);
    });
  }, [professionalId]);

  if (!pro) {
    return (
      <div className="text-center py-20 text-gray-500 text-sm">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-black bg-gray-50 min-h-screen">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-semibold text-xs transition-colors"
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <img
              src={pro.avatar}
              alt={pro.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-black">
                  {pro.name}
                </h1>
                {pro.verified && (
                  <span className="flex items-center gap-1 text-blue-600 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    <CheckCircle
                      size={12}
                      className="fill-blue-600 text-white"
                    />{" "}
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold">{pro.title}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-blue-600" /> {pro.radius}{" "}
                  miles radius
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={14} className="text-blue-600" /> License:{" "}
                  {pro.licenseTier}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">
              Hourly Rate
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600">
              ${pro.hourlyRate}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-base text-black">About</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {pro.description}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-base text-black">Work Gallery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pro.images.map((img, idx) => (
              <div
                key={idx}
                className="h-48 sm:h-40 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200"
              >
                <img
                  src={img}
                  alt="Work sample"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => onContact(pro.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm shadow-sm"
          >
            Contact Professional
          </button>
        </div>
      </div>
    </div>
  );
}
