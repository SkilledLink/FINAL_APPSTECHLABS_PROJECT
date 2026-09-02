import { useState, useEffect } from "react";
import { marketplaceService } from "../../Servicesmarket/marketplaceService";
import ServiceRequestForm from "../../services/ServiceRequestform";
import ServiceRequestStatus from "../../services/ServiceRequeststatus";
import { ArrowLeft } from "lucide-react";

interface RequestServicePageProps {
  serviceId: string;
  onBack: () => void;
}

export default function RequestServicePage({
  serviceId,
  onBack,
}: RequestServicePageProps) {
  const [serviceTitle, setServiceTitle] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    marketplaceService.getServiceById(serviceId).then((data) => {
      if (data) setServiceTitle(data.title);
    });
  }, [serviceId]);

  const handleSubmitRequest = async (formData: {
    clientName: string;
    clientEmail: string;
    projectDetails: string;
    budget: number;
    deadline: string;
  }) => {
    const res = await marketplaceService.submitRequest({
      serviceId,
      ...formData,
    });
    if (res.success) {
      setSubmittedRequestId(res.requestId);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold text-xs transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {submittedRequestId ? (
        <ServiceRequestStatus requestId={submittedRequestId} onBack={onBack} />
      ) : (
        <ServiceRequestForm
          serviceTitle={serviceTitle}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
}
