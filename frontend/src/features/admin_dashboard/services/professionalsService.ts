import type { AdminProfessional } from '../types/admin.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const professionals: AdminProfessional[] = [
  { id: 'p1', name: 'Jean-Pierre Mbock', email: 'jp.mbock@example.cm', avatar: 'https://i.pravatar.cc/80?img=12', profession: 'Electrician', location: 'Douala, Cameroon', status: 'verified', rating: 4.8, totalJobs: 142, totalEarnings: 3_250_000, joinedDate: '2024-03-10', verified: true, available: true },
  { id: 'p2', name: 'Marie Nkeng', email: 'marie.nkeng@example.cm', avatar: 'https://i.pravatar.cc/80?img=47', profession: 'Plumber', location: 'Yaoundé, Cameroon', status: 'verified', rating: 4.6, totalJobs: 98, totalEarnings: 2_140_000, joinedDate: '2024-04-22', verified: true, available: true },
  { id: 'p3', name: 'Alain Tchoumi', email: 'alain.t@example.cm', avatar: 'https://i.pravatar.cc/80?img=59', profession: 'Carpenter', location: 'Bafoussam, Cameroon', status: 'pending', rating: 0, totalJobs: 0, totalEarnings: 0, joinedDate: '2025-01-14', verified: false, available: true },
  { id: 'p4', name: 'Estelle Ngo', email: 'estelle.ngo@example.cm', avatar: 'https://i.pravatar.cc/80?img=31', profession: 'Cleaner', location: 'Douala, Cameroon', status: 'suspended', rating: 3.9, totalJobs: 54, totalEarnings: 875_000, joinedDate: '2024-07-03', verified: true, available: false },
  { id: 'p5', name: 'Kevin Essomba', email: 'kevin.e@example.cm', avatar: 'https://i.pravatar.cc/80?img=68', profession: 'Painter', location: 'Yaoundé, Cameroon', status: 'verified', rating: 4.9, totalJobs: 187, totalEarnings: 4_100_000, joinedDate: '2023-11-15', verified: true, available: true },
];

export const professionalsService = {
  async getAll(): Promise<AdminProfessional[]> {
    await delay();
    return professionals;
  },
  async updateStatus(id: string, status: AdminProfessional['status']): Promise<void> {
    await delay(200);
    const p = professionals.find((x) => x.id === id);
    if (p) {
      p.status = status;
      p.verified = status === 'verified';
    }
  },
};