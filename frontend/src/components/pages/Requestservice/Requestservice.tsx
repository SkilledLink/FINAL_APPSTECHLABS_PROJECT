import { useState, useEffect } from "react";
import type { ServiceRequest } from "../../Types/marketplace.types";
import { marketplaceService } from "../../Servicesmarket/marketplaceService";
import ServiceRequestForm from "../../services/ServiceRequestform";
import ServiceRequestStatus from "../../services/ServiceRequeststatus";
import { ArrowLeft } from "lucide-react";

interface RequestServicePageProps {
  professionalId: string;
  onBack: () => void;
}

export default function RequestServicePage({
  professionalId,
  onBack,
}: RequestServicePageProps) {
  const [professionalName, setProfessionalName] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    marketplaceService.getProfessionalById(professionalId).then((data) => {
      if (data) setProfessionalName(data.name);
    });
  }, [professionalId]);

  const handleSubmitRequest = async (
    formData: Omit<ServiceRequest, "professionalId">,
  ) => {
    const res = await marketplaceService.submitRequest({
      professionalId,
      ...formData,
    });
    if (res.success) {
      setSubmittedRequestId(res.requestId);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-black bg-gray-50 min-h-screen">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-semibold text-xs transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {submittedRequestId ? (
        <ServiceRequestStatus requestId={submittedRequestId} onBack={onBack} />
      ) : (
        <ServiceRequestForm
          professionalName={professionalName}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
}
