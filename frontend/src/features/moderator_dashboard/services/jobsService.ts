import type { AdminJob } from '../types/moderator.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const jobs: AdminJob[] = [
  { id: 'j1', title: 'Emergency plumbing repair', category: 'Plumbing', location: 'Douala, Cameroon', budget: 45_000, status: 'open', postedDate: '2025-01-15', reports: 0, client: { id: 'u2', name: 'Sarah Mbah', avatar: 'https://i.pravatar.cc/80?img=45' } },
  { id: 'j2', title: 'Full apartment rewiring', category: 'Electrical', location: 'Yaoundé, Cameroon', budget: 320_000, status: 'in_progress', postedDate: '2025-01-08', reports: 0, client: { id: 'u1', name: 'Paul Biya', avatar: 'https://i.pravatar.cc/80?img=33' }, professional: { id: 'p1', name: 'Jean-Pierre Mbock', avatar: 'https://i.pravatar.cc/80?img=12' } },
  { id: 'j3', title: 'Custom wardrobe build', category: 'Carpentry', location: 'Bafoussam, Cameroon', budget: 180_000, status: 'completed', postedDate: '2024-12-20', reports: 1, client: { id: 'u5', name: 'Bertrand Njoya', avatar: 'https://i.pravatar.cc/80?img=51' }, professional: { id: 'p3', name: 'Alain Tchoumi', avatar: 'https://i.pravatar.cc/80?img=59' } },
  { id: 'j4', title: 'Living room painting', category: 'Painting', location: 'Yaoundé, Cameroon', budget: 95_000, status: 'disputed', postedDate: '2025-01-03', reports: 4, client: { id: 'u4', name: 'Claudine Etoundi', avatar: 'https://i.pravatar.cc/80?img=27' }, professional: { id: 'p5', name: 'Kevin Essomba', avatar: 'https://i.pravatar.cc/80?img=68' } },
  { id: 'j5', title: 'Office deep cleaning', category: 'Cleaning', location: 'Douala, Cameroon', budget: 60_000, status: 'cancelled', postedDate: '2025-01-12', reports: 0, client: { id: 'u1', name: 'Paul Biya', avatar: 'https://i.pravatar.cc/80?img=33' } },
];

export const jobsService = {
  async getAll(): Promise<AdminJob[]> {
    await delay();
    return jobs;
  },
};