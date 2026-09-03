import type { ProfessionalItem } from "../Types/marketplace.types";
import ServiceCard from "./servicecard";

interface ServiceGridProps {
  professionals: ProfessionalItem[];
  onViewProfile: (id: string) => void;
  onContact: (id: string) => void;
}

export default function ServiceGrid({
  professionals,
  onViewProfile,
  onContact,
}: ServiceGridProps) {
  if (professionals.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
        No professionals found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {professionals.map((pro) => (
        <ServiceCard
          key={pro.id}
          professional={pro}
          onViewProfile={onViewProfile}
          onContact={onContact}
        />
      ))}
    </div>
  );
}
