export type Category = 'Carpentry' | 'Plumbing' | 'Construction' | 'Home Decor' | 'Remodeling' | 'Design';

export interface Project {
  id: string;
  title: string;
  category: Category;
  location: string;
  client: string;
  completionDate: string;
  summary: string;
  overview: string;
  goals: string[];
  mainImage: string;
  galleryImages: string[];
  beforeImage?: string;
  afterImage?: string;
}