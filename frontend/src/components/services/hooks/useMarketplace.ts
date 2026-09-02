import { useState, useEffect, useMemo } from "react";
import type {
  ServiceItem,
  MarketplaceFilters,
} from "../../Types/marketplace.types";
import { marketplaceService } from "../../Servicesmarket/marketplaceService";

export function useMarketplace() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: "",
    category: "All",
    minPrice: 0,
    maxPrice: 5000,
    sortBy: "popular",
  });

  useEffect(() => {
    marketplaceService.getServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        service.description
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "All" || service.category === filters.category;
      const matchesPrice =
        service.price >= filters.minPrice && service.price <= filters.maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [services, filters]);

  return {
    services: filteredServices,
    loading,
    filters,
    setFilters,
  };
}
