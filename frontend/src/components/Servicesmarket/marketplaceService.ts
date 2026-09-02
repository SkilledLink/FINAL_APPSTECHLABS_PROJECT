import type { ServiceItem, ServiceRequest } from "../Types/marketplace.types";

const MOCK_SERVICES: ServiceItem[] = [
  {
    id: "1",
    title: "Full Stack Web Application Development",
    description:
      "Build modern, scalable web apps using React, Node.js, and Tailwind CSS v4.",
    category: "Development",
    price: 1200,
    rating: 4.9,
    provider: {
      name: "Sarah Jenkins",
      avatar:
        "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=6d28d9&color=fff",
      verified: true,
    },
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    title: "UI/UX Brand Identity & Design System",
    description:
      "Create stunning user interfaces, design systems, and high-converting landing pages.",
    category: "Design",
    price: 850,
    rating: 4.8,
    provider: {
      name: "Alex Rivera",
      avatar:
        "https://ui-avatars.com/api/?name=Alex+Rivera&background=2563eb&color=fff",
      verified: true,
    },
    image:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    title: "Cloud Infrastructure & DevOps Pipeline",
    description:
      "Setup automated CI/CD pipelines, Docker containers, and AWS cloud hosting.",
    category: "Development",
    price: 1500,
    rating: 5.0,
    provider: {
      name: "David Chen",
      avatar:
        "https://ui-avatars.com/api/?name=David+Chen&background=7c3aed&color=fff",
      verified: true,
    },
    image:
      "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=600&auto=format&fit=crop&q=60",
  },
];

export const marketplaceService = {
  async getServices(): Promise<ServiceItem[]> {
    return Promise.resolve(MOCK_SERVICES);
  },
  async getServiceById(id: string): Promise<ServiceItem | undefined> {
    return Promise.resolve(MOCK_SERVICES.find((s) => s.id === id));
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
