import type { Project } from '../types/portfolio.types';

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Custom Hardwood Architectural Millwork',
    category: 'Carpentry',
    location: 'Atlanta, GA',
    client: 'Private Residence',
    completionDate: 'August 2026',
    summary: 'Bespoke walnut built-ins and architectural wall paneling crafted for a modern luxury home.',
    overview: 'This project involved designing, cutting, and installing hand-crafted walnut shelving units, crown moldings, and an integrated entertainment center tailored precisely to the client’s living space dimensions.',
    goals: [
      'Maximize vertical storage capacity without cluttering the room aesthetic.',
      'Incorporate hidden cord management channels and ambient LED strip lighting.',
      'Select sustainably sourced American Black Walnut with a matte natural finish.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f064f?auto=format&fit=crop&w=1200&q=80', // Representative professional placeholder
    galleryImages: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Commercial Multi-Floor Plumbing Overhaul',
    category: 'Plumbing',
    location: 'Houston, TX',
    client: 'Metro Business Center',
    completionDate: 'July 2026',
    summary: 'Complete replacement of aging commercial-grade supply lines, high-efficiency fixtures, and backflow preventers.',
    overview: 'A complete modernization of plumbing infrastructure for a 4-story office building, minimizing water waste and upgrading restroom facility capabilities across all levels.',
    goals: [
      'Upgrade to touchless, water-conserving smart fixtures.',
      'Replace galvanized steel piping with corrosion-resistant PEX and copper lines.',
      'Complete installation phases over weekends to avoid interrupting tenant business operations.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: '3',
    title: 'Eco-Friendly Urban Foundation & Framing',
    category: 'Construction',
    location: 'Austin, TX',
    client: 'CivicTrust Build Group',
    completionDate: 'June 2026',
    summary: 'Structural engineering and timber framing for a sustainable community center.',
    overview: 'A structural construction undertaking focusing on structural integrity, high thermal insulation standards, and rapid assembly timelines utilizing green building materials.',
    goals: [
      'Implement advanced seismic-resistant framing techniques.',
      'Utilize locally sourced lumber to minimize carbon transportation footprint.',
      'Maintain strict zero-accident worksite safety metrics.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18f064f?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: '4',
    title: 'Minimalist Penthouse Interior Styling',
    category: 'Home Decor',
    location: 'New York, NY',
    client: 'Private Collector',
    completionDate: 'May 2026',
    summary: 'Curated furniture layout, custom textile selection, and ambient lighting design for high-rise living.',
    overview: 'Transforms a stark white shell into a warm, inviting oasis using rich earth tones, textured linens, and statement art pieces.',
    goals: [
      'Balance open-space architectural scale with intimate seating zones.',
      'Integrate natural stone and warm metallic accents.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: '5',
    title: 'Open-Concept Kitchen & Bath Remodeling',
    category: 'Remodeling',
    location: 'Chicago, IL',
    client: 'The Henderson Family',
    completionDate: 'April 2026',
    summary: 'Knocking down interior load-bearing partitions to create a seamless kitchen-to-living flow.',
    overview: 'Comprehensive renovation replacing outdated 1980s layouts with waterfall quartz islands, custom soft-close cabinetry, and integrated smart appliances.',
    goals: [
      'Improve sightlines and natural light transmission throughout the ground floor.',
      'Install heavy-duty waterproof luxury vinyl tile flooring.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=800&q=80'
    ],
    beforeImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    title: 'Biophilic Office Suite Architectural Design',
    category: 'Design',
    location: 'Seattle, WA',
    client: 'Apex Tech Solutions',
    completionDate: 'March 2026',
    summary: 'Blueprinting a nature-infused corporate floor plan incorporating living green walls and acoustic pods.',
    overview: 'Full 3D modeling and blueprint production for a tech company headquarters centered around employee well-being and collaborative productivity.',
    goals: [
      'Optimize acoustic dampening across open work zones.',
      'Incorporate natural wood grains and abundant flora into indoor spaces.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

class PortfolioService {
  private projects: Project[] = INITIAL_PROJECTS;

  async getProjects(): Promise<Project[]> {
    return Promise.resolve(this.projects);
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return Promise.resolve(this.projects.find(p => p.id === id));
  }

  async createProject(newProject: Omit<Project, 'id'>): Promise<Project> {
    const created: Project = {
      ...newProject,
      id: Date.now().toString()
    };
    this.projects = [created, ...this.projects];
    return Promise.resolve(created);
  }
}

export const portfolioService = new PortfolioService();