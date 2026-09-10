import { useState, useEffect, useMemo } from "react";
import type {
  ProfessionalItem,
  MarketplaceFilters,
} from "../../Market/Types/marketplace.types";
import { marketplaceService } from "../../Market/pages/Servicesmarket/marketplaceService";

export function useMarketplace() {
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: "",
    trades: [],
    radius: 50,
    licenseTiers: [],
    insuranceStatuses: [],
    sortBy: "relevance",
  });

  useEffect(() => {
    marketplaceService.getProfessionals().then((data) => {
      setProfessionals(data);
      setLoading(false);
    });
  }, []);

  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter((pro) => {
        const matchesSearch =
          filters.search === "" ||
          pro.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          pro.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          pro.trade.toLowerCase().includes(filters.search.toLowerCase());

        const matchesTrade =
          filters.trades.length === 0 || filters.trades.includes(pro.trade);
        const matchesRadius = pro.radius <= filters.radius;
        const matchesTier =
          filters.licenseTiers.length === 0 ||
          filters.licenseTiers.includes(pro.licenseTier);
        const matchesInsurance =
          filters.insuranceStatuses.length === 0 ||
          filters.insuranceStatuses.includes(pro.insuranceStatus);

        return (
          matchesSearch &&
          matchesTrade &&
          matchesRadius &&
          matchesTier &&
          matchesInsurance
        );
      })
      .sort((a, b) => {
        if (filters.sortBy === "rating-high") return b.rating - a.rating;
        if (filters.sortBy === "years-high")
          return b.yearsInTrade - a.yearsInTrade;
        return 0;
      });
  }, [professionals, filters]);

  const clearFilters = () => {
    setFilters({
      search: "",
      trades: [],
      radius: 50,
      licenseTiers: [],
      insuranceStatuses: [],
      sortBy: "relevance",
    });
  };

  return {
    professionals: filteredProfessionals,
    totalCount: filteredProfessionals.length,
    loading,
    filters,
    setFilters,
    clearFilters,
  };
}
