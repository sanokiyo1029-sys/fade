import { CATEGORY_MAP, CATEGORIES } from "@/data/categories";
import { CREATORS, CREATOR_MAP } from "@/data/creators";
import type { AvailabilityStatus, Creator, Service } from "@/lib/types";
import { fastestDays, startingPrice } from "@/data/services";

export type SortKey = "recommended" | "top" | "recent" | "price-asc" | "fastest";

export interface Filters {
  q: string;
  categories: string[];
  minPrice: number;
  maxPrice: number;
  maxDays: number; // 0 = any
  minRating: number; // 0 = any
  minExperience: number; // 0 = any
  country: string; // "" = any
  languages: string[];
  availability: "" | AvailabilityStatus; // "" = any; "open" = open now
  verified: boolean;
  levels: number[];
  sort: SortKey;
}

export const PRICE_MAX = 300000;

export const DEFAULT_FILTERS: Filters = {
  q: "",
  categories: [],
  minPrice: 0,
  maxPrice: PRICE_MAX,
  maxDays: 0,
  minRating: 0,
  minExperience: 0,
  country: "",
  languages: [],
  availability: "",
  verified: false,
  levels: [],
  sort: "recommended",
};

const STOP = new Set(["and", "for", "the", "a", "of", "to", "in", "with", "&", "i", "my", "your", "on"]);

const SYNONYMS: Record<string, string[]> = {
  development: ["programming", "engineer", "code", "app", "web"],
  developer: ["programming", "engineer", "code"],
  dev: ["programming", "engineer"],
  design: ["ui", "ux", "brand", "figma"],
  designer: ["design", "ui", "ux"],
  ai: ["llm", "agent", "automation", "rag", "prompt"],
  automation: ["workflow", "ai", "make", "n8n", "zapier"],
  chatbot: ["rag", "agent", "support"],
  logo: ["brand", "identity"],
  copywriting: ["copy", "writing", "website copy"],
  copywriter: ["copy", "writing"],
  editing: ["edit", "video", "cut"],
  youtube: ["video", "long-form"],
  reels: ["short-form", "video"],
  seo: ["search", "marketing", "technical"],
  ads: ["paid", "acquisition", "meta", "google"],
  app: ["mobile", "react native", "web apps"],
  mobile: ["react native", "ios", "android"],
  website: ["web", "homepage", "next.js"],
  deck: ["pitch", "fundraising", "investor"],
  investor: ["pitch", "fundraising", "model"],
  finance: ["financial", "model", "business"],
  motion: ["animation", "kinetic", "3d"],
  animation: ["motion", "lottie"],
  render: ["3d", "product", "blender"],
  dashboard: ["analytics", "metabase", "looker", "data"],
  analytics: ["data", "dashboard", "ga4"],
  music: ["scoring", "mixing", "mastering", "audio"],
  audio: ["music", "mixing", "sound"],
};

function stem(w: string): string {
  w = w.toLowerCase();
  if (w.length <= 4) return w;
  return w.replace(/(ing|ers|er|ed|es|s)$/, "");
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9.+#]+/)
    .filter((t) => t && !STOP.has(t));
}

interface Doc {
  service: Service;
  creator: Creator | undefined;
  fields: { words: string[]; weight: number }[];
}

const docCache = new Map<string, Doc>();

function docFor(service: Service): Doc {
  const key = service.id + service.title + service.tags.join("|");
  const cached = docCache.get(key);
  if (cached) return cached;
  const creator = CREATOR_MAP[service.creatorId];
  const cat = CATEGORY_MAP[service.category];
  const d: Doc = {
    service,
    creator,
    fields: [
      { words: tokenize(service.title).map(stem), weight: 5 },
      { words: service.tags.flatMap(tokenize).map(stem), weight: 4 },
      { words: tokenize(`${service.subcategory} ${cat?.name ?? ""}`).map(stem), weight: 3 },
      { words: tokenize(creator?.name ?? "").map(stem), weight: 3 },
      { words: tokenize((creator?.skills ?? []).join(" ")).map(stem), weight: 2 },
      { words: tokenize(`${service.tagline} ${service.description.join(" ")}`).map(stem), weight: 1 },
    ],
  };
  docCache.set(key, d);
  return d;
}

function tokenScore(doc: Doc, token: string): number {
  const t = stem(token);
  let best = 0;
  for (const f of doc.fields) {
    for (const w of f.words) {
      if (w === t) best = Math.max(best, f.weight * 2);
      else if (t.length >= 3 && (w.startsWith(t) || t.startsWith(w) && w.length >= 4)) best = Math.max(best, f.weight);
    }
  }
  return best;
}

/** Relevance of a query to a service; 0 means "no match". */
export function relevance(service: Service, q: string): number {
  const tokens = tokenize(q);
  if (!tokens.length) return 1;
  const doc = docFor(service);
  let matched = 0;
  let total = 0;
  for (const tok of tokens) {
    let s = tokenScore(doc, tok);
    if (s === 0) {
      for (const syn of SYNONYMS[tok] ?? []) {
        s = Math.max(s, tokenScore(doc, syn) * 0.5);
      }
    }
    if (s > 0) matched++;
    total += s;
  }
  if (matched < Math.ceil(tokens.length / 2)) return 0;
  // reward covering every token
  return total * (matched === tokens.length ? 1.5 : 1);
}

function recommendedScore(s: Service): number {
  const c = CREATOR_MAP[s.creatorId];
  return s.rating * Math.log(s.reviewCount + 2) + (c ? c.level * 1.2 + (c.verified ? 1 : 0) + (c.online ? 0.6 : 0) : 0);
}

export function applyFilters(all: Service[], f: Filters): Service[] {
  const scored = all
    .filter((s) => s.status === "active")
    .map((s) => ({ s, rel: relevance(s, f.q) }))
    .filter(({ s, rel }) => {
      if (rel <= 0) return false;
      const c = CREATOR_MAP[s.creatorId];
      if (f.categories.length && !f.categories.includes(s.category)) return false;
      const price = startingPrice(s);
      if (price < f.minPrice || price > f.maxPrice) return false;
      if (f.maxDays && fastestDays(s) > f.maxDays) return false;
      if (f.minRating && s.rating < f.minRating) return false;
      if (c) {
        if (f.minExperience && c.experienceYears < f.minExperience) return false;
        if (f.country && c.country !== f.country) return false;
        if (f.languages.length && !f.languages.every((l) => c.languages.includes(l))) return false;
        if (f.availability === "open" && c.availability !== "open") return false;
        if (f.availability === "limited" && c.availability === "booked") return false;
        if (f.verified && !c.verified) return false;
        if (f.levels.length && !f.levels.includes(c.level)) return false;
      }
      return true;
    });

  const hasQ = f.q.trim().length > 0;
  scored.sort((a, b) => {
    switch (f.sort) {
      case "top":
        return b.s.rating - a.s.rating || b.s.reviewCount - a.s.reviewCount;
      case "recent":
        return a.s.createdAt < b.s.createdAt ? 1 : -1;
      case "price-asc":
        return startingPrice(a.s) - startingPrice(b.s);
      case "fastest":
        return fastestDays(a.s) - fastestDays(b.s) || startingPrice(a.s) - startingPrice(b.s);
      default:
        return hasQ
          ? b.rel - a.rel || recommendedScore(b.s) - recommendedScore(a.s)
          : recommendedScore(b.s) - recommendedScore(a.s);
    }
  });
  return scored.map((x) => x.s);
}

export interface Suggestions {
  services: Service[];
  creators: Creator[];
  categories: typeof CATEGORIES;
}

export function suggest(all: Service[], q: string): Suggestions {
  const query = q.trim();
  if (!query) {
    return {
      services: [...all].filter((s) => s.status === "active").sort((a, b) => recommendedScore(b) - recommendedScore(a)).slice(0, 4),
      creators: CREATORS.filter((c) => c.online).slice(0, 3),
      categories: CATEGORIES.slice(0, 4),
    };
  }
  const tokens = tokenize(query).map(stem);
  const services = applyFilters(all, { ...DEFAULT_FILTERS, q: query }).slice(0, 5);
  const creators = CREATORS.filter((c) => {
    const hay = tokenize(`${c.name} ${c.username} ${c.headline} ${c.skills.join(" ")} ${c.city}`).map(stem);
    return tokens.some((t) => hay.some((w) => w === t || (t.length >= 3 && w.startsWith(t))));
  }).slice(0, 3);
  const categories = CATEGORIES.filter((c) => {
    const hay = tokenize(`${c.name} ${c.subcategories.join(" ")}`).map(stem);
    return tokens.some((t) => hay.some((w) => w === t || (t.length >= 3 && w.startsWith(t))));
  }).slice(0, 3);
  return { services, creators, categories };
}

/* ───────── URL <-> filters ───────── */

export function filtersFromParams(p: URLSearchParams): Filters {
  const list = (k: string) => (p.get(k) ? p.get(k)!.split(",").filter(Boolean) : []);
  const num = (k: string, d: number) => {
    const v = Number(p.get(k));
    return p.get(k) && Number.isFinite(v) ? v : d;
  };
  const sort = (p.get("sort") as SortKey) || "recommended";
  return {
    q: p.get("q") ?? "",
    categories: list("category"),
    minPrice: num("min", 0),
    maxPrice: num("max", PRICE_MAX),
    maxDays: num("days", 0),
    minRating: num("rating", 0),
    minExperience: num("exp", 0),
    country: p.get("country") ?? "",
    languages: list("lang"),
    availability: (p.get("avail") as Filters["availability"]) ?? "",
    verified: p.get("verified") === "1",
    levels: list("level").map(Number).filter((n) => [1, 2, 3].includes(n)),
    sort: ["recommended", "top", "recent", "price-asc", "fastest"].includes(sort) ? sort : "recommended",
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.categories.length) p.set("category", f.categories.join(","));
  if (f.minPrice > 0) p.set("min", String(f.minPrice));
  if (f.maxPrice < PRICE_MAX) p.set("max", String(f.maxPrice));
  if (f.maxDays) p.set("days", String(f.maxDays));
  if (f.minRating) p.set("rating", String(f.minRating));
  if (f.minExperience) p.set("exp", String(f.minExperience));
  if (f.country) p.set("country", f.country);
  if (f.languages.length) p.set("lang", f.languages.join(","));
  if (f.availability) p.set("avail", f.availability);
  if (f.verified) p.set("verified", "1");
  if (f.levels.length) p.set("level", f.levels.join(","));
  if (f.sort !== "recommended") p.set("sort", f.sort);
  return p;
}

export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.categories.length) n += f.categories.length;
  if (f.minPrice > 0 || f.maxPrice < PRICE_MAX) n++;
  if (f.maxDays) n++;
  if (f.minRating) n++;
  if (f.minExperience) n++;
  if (f.country) n++;
  n += f.languages.length;
  if (f.availability) n++;
  if (f.verified) n++;
  n += f.levels.length;
  return n;
}
