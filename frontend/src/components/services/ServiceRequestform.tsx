import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

interface ServiceRequestFormProps {
  professionalName: string;
  onSubmit: (data: {
    clientName: string;
    clientEmail: string;
    projectDetails: string;
    budget: number;
    deadline: string;
  }) => void;
}

export default function ServiceRequestForm({
  professionalName,
  onSubmit,
}: ServiceRequestFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [budget, setBudget] = useState(500);
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ clientName, clientEmail, projectDetails, budget, deadline });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 text-black shadow-sm"
    >
      <h3 className="font-bold text-lg text-black">
        Contact / Hire {professionalName}
      </h3>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Your Full Name
        </label>
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="John Doe"
          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          required
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="john@example.com"
          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Budget ($)
          </label>
          <input
            type="number"
            required
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Target Deadline
          </label>
          <input
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Project Details
        </label>
        <textarea
          rows={4}
          required
          value={projectDetails}
          onChange={(e) => setProjectDetails(e.target.value)}
          placeholder="Describe your job scope..."
          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-600"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-sm"
      >
        <Send size={16} /> Send Request
      </button>
    </form>
  );
}
