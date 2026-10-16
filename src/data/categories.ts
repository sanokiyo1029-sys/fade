import type { Category, CategorySlug } from "@/lib/types";

export const CATEGORIES: Category[] = [
  {
    slug: "ai-automation",
    name: "AI & Automation",
    short: "AI & AUTOMATION",
    blurb: "Agents, workflows and LLM systems that remove repetitive work.",
    art: { variant: "dots", seed: 11 },
    subcategories: ["Workflow automation", "AI agents", "Chatbots & RAG", "Prompt engineering", "LLM integrations"],
  },
  {
    slug: "programming",
    name: "Programming",
    short: "PROGRAMMING",
    blurb: "Web, mobile and backend engineering by people who ship.",
    art: { variant: "grid", seed: 22 },
    subcategories: ["Web apps", "Mobile apps", "Backend & APIs", "Bug fixes & refactors", "DevOps"],
  },
  {
    slug: "design",
    name: "Design",
    short: "DESIGN",
    blurb: "Identity, interface and packaging with a point of view.",
    art: { variant: "blocks", seed: 33 },
    subcategories: ["Brand identity", "UI/UX", "Design systems", "Packaging", "Illustration"],
  },
  {
    slug: "video",
    name: "Video",
    short: "VIDEO",
    blurb: "Editing, motion and finishing for every screen.",
    art: { variant: "lines", seed: 44 },
    subcategories: ["Short-form", "Long-form editing", "Product video", "Colour grading", "Subtitles"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    short: "MARKETING",
    blurb: "Growth, search and lifecycle that compounds.",
    art: { variant: "bars", seed: 55 },
    subcategories: ["SEO", "Paid acquisition", "Email & lifecycle", "Social", "Analytics"],
  },
  {
    slug: "writing",
    name: "Writing",
    short: "WRITING",
    blurb: "Copy, essays and documentation written to be read.",
    art: { variant: "glyph", seed: 66 },
    subcategories: ["Website copy", "Ghostwriting", "Technical writing", "Editing", "Scripts"],
  },
  {
    slug: "business",
    name: "Business",
    short: "BUSINESS",
    blurb: "Decks, models and operations for founders and teams.",
    art: { variant: "rings", seed: 77 },
    subcategories: ["Pitch decks", "Financial models", "Market research", "Operations", "Legal templates"],
  },
  {
    slug: "music",
    name: "Music",
    short: "MUSIC",
    blurb: "Scoring, production and audio finishing.",
    art: { variant: "wave", seed: 88 },
    subcategories: ["Original scoring", "Mixing & mastering", "Sound design", "Voice-over", "Jingles"],
  },
  {
    slug: "consulting",
    name: "Consulting",
    short: "CONSULTING",
    blurb: "Short, sharp engagements with operators who've done it.",
    art: { variant: "wire", seed: 99 },
    subcategories: ["Go-to-market", "Product strategy", "Pricing", "Hiring", "Fractional leadership"],
  },
  {
    slug: "data",
    name: "Data",
    short: "DATA",
    blurb: "Pipelines, warehouses and dashboards people actually open.",
    art: { variant: "scatter", seed: 110 },
    subcategories: ["Dashboards", "Data engineering", "Analytics", "ML models", "Data cleaning"],
  },
  {
    slug: "3d-motion",
    name: "3D & Motion",
    short: "3D & MOTION",
    blurb: "Renders, loops and kinetic identity.",
    art: { variant: "wire", seed: 121 },
    subcategories: ["Product renders", "Motion identity", "Abstract loops", "Character", "Architectural viz"],
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<CategorySlug, Category>;

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
