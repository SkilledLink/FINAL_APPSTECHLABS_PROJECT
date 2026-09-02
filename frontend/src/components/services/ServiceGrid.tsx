import ServiceCard from "./servicecard";
import type { ServiceItem } from "../Types/marketplace.types";

interface ServiceGridProps {
  services: ServiceItem[];
  onSelectService: (id: string) => void;
}

export default function ServiceGrid({
  services,
  onSelectService,
}: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-medium">
          No services found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onSelect={onSelectService}
        />
      ))}
    </div>
  );
}
