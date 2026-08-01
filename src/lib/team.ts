// Pure client-safe helpers for TeamMember data. Deliberately has no
// dependency on lib/strapi.ts's runtime exports (only its type) — that file
// pulls in ioredis, which cannot be bundled into client components.
import type { TeamMember } from "./strapi";

/** Roster order: active members first (most senior batch on top), alumni after (most recent batch first). */
export function sortTeamMembers(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    if (a.isAlumni !== b.isAlumni) return a.isAlumni ? 1 : -1;
    const yearA = Number(a.batch) || 0;
    const yearB = Number(b.batch) || 0;
    if (yearA !== yearB) return a.isAlumni ? yearB - yearA : yearA - yearB;
    return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
  });
}
