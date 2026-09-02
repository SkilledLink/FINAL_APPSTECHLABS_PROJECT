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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4 max-w-md mx-auto">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">
        Request Submitted Successfully!
      </h3>
      <p className="text-slate-500 text-sm">
        Your request ID is{" "}
        <span className="font-semibold text-purple-700">{requestId}</span>. The
        service provider has been notified and will review your requirements
        shortly.
      </p>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>
    </div>
  );
}
