export interface ProfessionalItem {
  id: string;
  name: string;
  title: string;
  trade: string;
  rating: number;
  reviewCount: number;
  yearsInTrade: number;
  avatar: string;
  verified: boolean;
  radius: number;
  licenseTier: string;
  insuranceStatus: string;
  images: string[];
  description: string;
  hourlyRate: number;
}

export interface MarketplaceFilters {
  search: string;
  trades: string[];
  radius: number;
  licenseTiers: string[];
  insuranceStatuses: string[];
  sortBy: "relevance" | "rating-high" | "years-high";
}

export interface ServiceRequest {
  professionalId: string;
  clientName: string;
  clientEmail: string;
  projectDetails: string;
  budget: number;
  deadline: string;
}
