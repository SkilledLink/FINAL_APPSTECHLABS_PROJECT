import type { Profile, Job, MatchRecommendation } from '../types/ai.types';
import { profiles, jobs, getMessagesForConversation, addMessage } from '../types/data';

export { getMessagesForConversation, addMessage };

export async function searchWorkers(trade: string, location: string): Promise<MatchRecommendation[]> {
  await new Promise((r) => setTimeout(r, 400));
  let results = profiles.filter((p) => p.role === 'worker');
  if (trade) {
    const t = trade.toLowerCase();
    results = results.filter(
      (p) =>
        p.trade.toLowerCase().includes(t) ||
        p.skills.some((s) => s.toLowerCase().includes(t)),
    );
  }
  if (location) {
    const l = location.toLowerCase();
    results = results.filter((p) => p.location.toLowerCase().includes(l));
  }
  results = results.sort((a, b) => b.rating - a.rating).slice(0, 5);
  return results.map((p) => ({
    type: 'worker' as const,
    id: p.id,
    name: p.name,
    trade: p.trade,
    location: p.location,
    rating: p.rating,
    reviewCount: p.review_count,
    hourlyRate: p.hourly_rate,
    isVerified: p.is_verified,
    isAvailable: p.is_available,
    bio: p.bio,
    skills: p.skills,
  }));
}

export async function searchHirers(trade: string, location: string): Promise<MatchRecommendation[]> {
  await new Promise((r) => setTimeout(r, 400));
  let results = jobs.filter((j) => j.status === 'open');
  if (trade) {
    const t = trade.toLowerCase();
    results = results.filter((j) => j.trade_needed.toLowerCase().includes(t));
  }
  if (location) {
    const l = location.toLowerCase();
    results = results.filter((j) => j.location.toLowerCase().includes(l));
  }
  results = results.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  return results.map((j) => ({
    type: 'job' as const,
    id: j.hirer_id ?? j.id,
    name: j.hirer_name,
    trade: j.trade_needed,
    location: j.location,
    rating: 0,
    reviewCount: 0,
    hourlyRate: 0,
    isVerified: false,
    isAvailable: j.status === 'open',
    bio: j.description,
    title: j.title,
    budget: j.budget,
    description: j.description,
  }));
}

export async function getProfile(id: string): Promise<Profile | null> {
  await new Promise((r) => setTimeout(r, 150));
  return profiles.find((p) => p.id === id) ?? null;
}

export async function getJob(id: string): Promise<Job | null> {
  await new Promise((r) => setTimeout(r, 150));
  return jobs.find((j) => j.id === id) ?? null;
}

const TRADE_KEYWORDS = [
  'electrician', 'plumber', 'carpenter', 'painter', 'hvac', 'landscaper',
  'roofer', 'contractor', 'welder', 'cleaner', 'tiler', 'mason', 'drywall',
  'flooring', 'fencing', 'garage', 'appliance', 'handyman', 'framing',
  'cabinetry', 'deck', 'remodel', 'renovation',
];

export function extractTradeAndLocation(input: string): { trade: string; location: string } {
  const lower = input.toLowerCase();
  let trade = '';
  for (const keyword of TRADE_KEYWORDS) {
    if (lower.includes(keyword)) {
      trade = keyword;
      break;
    }
  }
  if (!trade) {
    const words = input.split(/\s+/);
    if (words.length > 0) trade = words[0];
  }
  const locationMatch = input.match(/(?:in|near|around|at)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);
  const location = locationMatch ? locationMatch[1].trim() : '';
  return { trade, location };
}

export function formatWorkerMatches(matches: MatchRecommendation[]): string {
  if (matches.length === 0) {
    return "I couldn't find any verified workers matching your criteria. Could you try a different trade or location?";
  }
  let text = `I found **${matches.length}** verified worker${matches.length > 1 ? 's' : ''} matching your needs:\n\n`;
  matches.forEach((m, i) => {
    const stars = '\u2605'.repeat(Math.round(m.rating));
    text += `**${i + 1}. ${m.name}** \u2014 ${m.trade} in ${m.location}\n`;
    text += `${stars} ${m.rating} (${m.reviewCount} reviews) \u2014 $${m.hourlyRate}/hr\n`;
    if (m.isVerified) text += '\u2713 Verified professional\n';
    text += `[View Profile & Chat](/profile/${m.id})\n\n`;
  });
  return text;
}

export function formatJobMatches(matches: MatchRecommendation[]): string {
  if (matches.length === 0) {
    return "I couldn't find any open job postings matching your trade. Could you try a different skill or location?";
  }
  let text = `I found **${matches.length}** open job posting${matches.length > 1 ? 's' : ''} matching your trade:\n\n`;
  matches.forEach((m, i) => {
    text += `**${i + 1}. ${m.title}** \u2014 posted by ${m.name}\n`;
    text += `Trade needed: ${m.trade} \u2014 ${m.location}\n`;
    if (m.budget && m.budget > 0) text += `Budget: $${m.budget}\n`;
    text += `[View Profile & Chat](/profile/${m.id})\n\n`;
  });
  return text;
}