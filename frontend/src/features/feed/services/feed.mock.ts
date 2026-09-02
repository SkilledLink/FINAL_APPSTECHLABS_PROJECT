import type { FeedItemData } from "../types/feed.types";

export const CLOUDINARY_IMAGES = {
  primary:
    "https://res.cloudinary.com/vo8xndxy/image/upload/v1788198742/Gemini_Generated_Image_dieopodieopodieo.png",
  reference:
    "https://res.cloudinary.com/vo8xndxy/image/upload/v1788024956/Screenshot_From_2026-08-29_18-31-24.png",
  zoom: "https://res.cloudinary.com/vo8xndxy/image/upload/v1787224662/samples/zoom.avif",
};

export const MOCK_FEED_ITEMS: Record<string, FeedItemData[]> = {
  recommended: [
    {
      id: "rec-1",
      author: {
        id: "u-101",
        name: "Sarah Jenkins",
        avatar: CLOUDINARY_IMAGES.zoom,
        profession: "Master Electrician",
        title: "Master Electrician",
        isVerified: true,
      },
      createdAt: "2h",
      title: "Residential Rewiring",
      content:
        "Just wrapped up a full residential panel upgrade. Clean lines, proper labeling, and ready for the next 30 years.",
      images: [
        { url: CLOUDINARY_IMAGES.primary, alt: "Residential rewiring project" },
      ],
      tags: ["#Electrician", "Verified"],
      likesCount: 124,
      commentsCount: 18,
      ctaText: "Request Service",
    },
    {
      id: "rec-2",
      author: {
        id: "u-102",
        name: "Alex Rivera",
        avatar: CLOUDINARY_IMAGES.reference,
        profession: "Custom Cabinet Specialist",
        title: "Custom Cabinet Specialist",
        isVerified: false,
      },
      createdAt: "5h",
      title: "Kitchen Cabinetry Installation",
      content:
        "Custom white oak cabinetry installed today with soft-close hardware and hidden LED channels.",
      images: [
        { url: CLOUDINARY_IMAGES.zoom, alt: "Custom cabinetry project" },
      ],
      tags: ["#Cabinetry", "#Woodworking"],
      likesCount: 89,
      commentsCount: 12,
      ctaText: "Request Service",
    },
  ],
  following: [
    {
      id: "f-1",
      author: {
        id: "u-103",
        name: "David Vance",
        avatar: CLOUDINARY_IMAGES.zoom,
        profession: "HVAC Technician",
        title: "HVAC Technician",
        isVerified: true,
      },
      createdAt: "1d",
      title: "Heat Pump Servicing",
      content:
        "Annual maintenance complete for a high-efficiency dual-stage heat pump setup.",
      images: [
        { url: CLOUDINARY_IMAGES.reference, alt: "Heat pump service project" },
      ],
      tags: ["#HVAC", "#Maintenance"],
      likesCount: 45,
      commentsCount: 4,
      ctaText: "Book Service",
    },
  ],
  local: [
    {
      id: "loc-1",
      author: {
        id: "u-104",
        name: "Elena Rostova",
        avatar: CLOUDINARY_IMAGES.reference,
        profession: "Interior Painter",
        title: "Interior Painter",
        isVerified: true,
      },
      createdAt: "3h",
      title: "Commercial Wall Painting",
      content: "Transformed an office space with non-VOC matte finish coat.",
      images: [
        { url: CLOUDINARY_IMAGES.zoom, alt: "Commercial painting project" },
      ],
      tags: ["#Painting", "#LocalPro"],
      likesCount: 210,
      commentsCount: 31,
      ctaText: "Request Quote",
    },
  ],
  trending: [
    {
      id: "tr-1",
      author: {
        id: "u-105",
        name: "Marcus Chen",
        avatar: CLOUDINARY_IMAGES.zoom,
        profession: "Plumbing Specialist",
        title: "Plumbing Specialist",
        isVerified: true,
      },
      createdAt: "12h",
      title: "Main Line Hydro-Jetting",
      content:
        "Cleared a severe root intrusion using hydro-jetting equipment without pipe damage.",
      images: [
        { url: CLOUDINARY_IMAGES.primary, alt: "Hydro-jetting project" },
      ],
      tags: ["#Plumbing", "#Trending"],
      likesCount: 532,
      commentsCount: 84,
      ctaText: "Request Service",
    },
  ],
};
