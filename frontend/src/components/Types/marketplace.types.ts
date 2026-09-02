export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  provider: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  image: string;
}

export interface MarketplaceFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: "popular" | "price-low" | "price-high" | "newest";
}

export interface ServiceRequest {
  serviceId: string;
  clientName: string;
  clientEmail: string;
  projectDetails: string;
  budget: number;
  deadline: string;
}
