import { CheckCircle2, ArrowLeft } from "lucide-react";

interface ServiceRequestStatusProps {
  requestId: string;
  onBack: () => void;
}

export default function ServiceRequestStatus({
  requestId,
  onBack,
}: ServiceRequestStatusProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto text-black shadow-sm">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-xl font-bold text-black">
        Request Sent Successfully!
      </h3>
      <p className="text-gray-600 text-sm">
        Your request ID is{" "}
        <span className="font-semibold text-blue-600">{requestId}</span>. The
        professional has been notified.
      </p>
      <button
        onClick={onBack}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-black px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>
    </div>
  );
}
