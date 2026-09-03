import type {
  ProfessionalItem,
  ServiceRequest,
} from "../Types/marketplace.types";

const MOCK_PROFESSIONALS: ProfessionalItem[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    title: "Master Electrician",
    trade: "Electrician",
    rating: 4.9,
    reviewCount: 87,
    yearsInTrade: 12,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    verified: true,
    radius: 15,
    licenseTier: "Master",
    insuranceStatus: "Verified",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&auto=format&fit=crop&q=80",
    ],
    description:
      "Specialized in residential and commercial electrical panel upgrades, wiring, and safety inspections.",
    hourlyRate: 85,
  },
  {
    id: "2",
    name: "Mark Davis",
    title: "Master Electrician",
    trade: "Electrician",
    rating: 4.9,
    reviewCount: 87,
    yearsInTrade: 12,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    verified: true,
    radius: 25,
    licenseTier: "Master",
    insuranceStatus: "Verified",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&auto=format&fit=crop&q=80",
    ],
    description:
      "Expert troubleshooting, smart home wiring, and heavy-duty industrial setup.",
    hourlyRate: 90,
  },
  {
    id: "3",
    name: "Lisa Chen",
    title: "Master Electrician",
    trade: "Electrician",
    rating: 4.9,
    reviewCount: 87,
    yearsInTrade: 12,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    verified: true,
    radius: 10,
    licenseTier: "Master",
    insuranceStatus: "Verified",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&auto=format&fit=crop&q=80",
    ],
    description:
      "Full service electrical contractor for domestic renovations and custom lighting.",
    hourlyRate: 80,
  },
];

export const marketplaceService = {
  async getProfessionals(): Promise<ProfessionalItem[]> {
    return Promise.resolve(MOCK_PROFESSIONALS);
  },
  async getProfessionalById(id: string): Promise<ProfessionalItem | undefined> {
    return Promise.resolve(MOCK_PROFESSIONALS.find((p) => p.id === id));
  },
  async submitRequest(
    request: ServiceRequest,
  ): Promise<{ success: boolean; requestId: string }> {
    void request;
    return Promise.resolve({
      success: true,
      requestId: "REQ-" + Math.floor(Math.random() * 100000),
    });
  },
};
