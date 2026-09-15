import type { TeamMember } from '../types/moderator.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const team: TeamMember[] = [
  { id: 'm1', name: 'Marie Moderator', email: 'marie.m@servio.cm', avatar: 'https://i.pravatar.cc/80?img=20', role: 'senior_moderator', status: 'active', actionsToday: 34, lastActive: new Date(Date.now() - 1000 * 60 * 3).toISOString(), joinedDate: '2023-09-10' },
  { id: 'm2', name: 'Paul Supervisor', email: 'paul.s@servio.cm', avatar: 'https://i.pravatar.cc/80?img=15', role: 'lead_moderator', status: 'active', actionsToday: 18, lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(), joinedDate: '2023-04-05' },
  { id: 'm3', name: 'Eric Ngu', email: 'eric.n@servio.cm', avatar: 'https://i.pravatar.cc/80?img=64', role: 'moderator', status: 'active', actionsToday: 12, lastActive: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), joinedDate: '2024-05-15' },
  { id: 'm4', name: 'Diane Kamga', email: 'diane.k@servio.cm', avatar: 'https://i.pravatar.cc/80?img=41', role: 'trainee', status: 'active', actionsToday: 6, lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), joinedDate: '2024-11-01' },
];

export const teamService = {
  async getAll(): Promise<TeamMember[]> {
    await delay();
    return team;
  },
};