import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

interface ServiceRequestFormProps {
  serviceTitle: string;
  onSubmit: (data: {
    clientName: string;
    clientEmail: string;
    projectDetails: string;
    budget: number;
    deadline: string;
  }) => void;
}

export default function ServiceRequestForm({
  serviceTitle,
  onSubmit,
}: ServiceRequestFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [budget, setBudget] = useState(1000);
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ clientName, clientEmail, projectDetails, budget, deadline });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
    >
      <h3 className="font-bold text-slate-900 text-lg">
        Request Service: {serviceTitle}
      </h3>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Your Full Name
        </label>
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="John Doe"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          required
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="john@example.com"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Budget ($)
          </label>
          <input
            type="number"
            required
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Deadline
          </label>
          <input
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Project Details & Requirements
        </label>
        <textarea
          rows={4}
          required
          value={projectDetails}
          onChange={(e) => setProjectDetails(e.target.value)}
          placeholder="Describe your goals, scope, and technical requirements..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all text-sm"
      >
        <Send size={16} /> Submit Request
      </button>
    </form>
  );
}
