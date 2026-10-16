import { CREATOR_MAP, CLIENT_MAP } from "@/data/creators";
import type { Creator, User } from "@/lib/types";

export const DEMO_USER_ID = "rohan";

/** A signed-up user rendered as a creator (for their own public profile). */
export function userToCreator(u: User): Creator {
  const base = CREATOR_MAP[u.id];
  if (base) {
    return {
      ...base,
      name: u.name || base.name,
      headline: u.headline || base.headline,
      bio: u.bio ? u.bio.split(/\n{2,}/) : base.bio,
      city: u.city || base.city,
      country: u.country || base.country,
      languages: u.languages.length ? u.languages : base.languages,
      skills: u.skills.length ? u.skills : base.skills,
    };
  }
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    headline: u.headline || "New on FADE",
    bio: u.bio ? u.bio.split(/\n{2,}/) : ["This creator hasn't written a bio yet."],
    city: u.city || "Remote",
    country: u.country || "",
    timezone: "IST · UTC+5:30",
    languages: u.languages.length ? u.languages : ["English"],
    skills: u.skills,
    level: 1,
    verified: false,
    responseTime: "< 12 HRS",
    availability: "open",
    nextSlot: new Date(u.createdAt + 3 * 86400000).toISOString().slice(0, 10),
    weeks: [0, 0, 0, 0, 0, 0, 0, 0],
    stats: { projects: 0, clients: 0, repeatPct: 0, rating: 0, onTimePct: 100 },
    joined: new Date(u.createdAt).getFullYear(),
    experienceYears: 1,
    clients: [],
    online: true,
    primaryCategory: "design",
  };
}

export interface Party {
  id: string;
  name: string;
  seed: string;
  subtitle: string;
  online: boolean;
  isCreator: boolean;
  username?: string;
  verified?: boolean;
}

export function resolveParty(id: string, user: User | null): Party {
  const c = CREATOR_MAP[id];
  if (c) {
    return { id, name: c.name, seed: c.id, subtitle: c.headline, online: c.online, isCreator: true, username: c.username, verified: c.verified };
  }
  const cl = CLIENT_MAP[id];
  if (cl) return { id, name: cl.name, seed: cl.id, subtitle: cl.company, online: id === "cl2" || id === "cl5", isCreator: false };
  if (user && user.id === id) {
    return { id, name: user.name, seed: user.id, subtitle: user.headline, online: true, isCreator: true, username: user.username };
  }
  return { id, name: "Unknown", seed: id, subtitle: "", online: false, isCreator: false };
}
