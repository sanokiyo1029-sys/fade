import type { ArtVariant, PortfolioProject } from "@/lib/types";
import { CLIENTS_POOL } from "./creators";

type P = [string, string, number, string, string, ArtVariant, number, string[], number?];
// title · discipline · year · summary · result · art · seed · tags · client index

const RAW: Record<string, P[]> = {
  rohan: [
    ["AI customer-support system", "Automation / AI", 2026, "A retrieval-grounded support agent wired into the client's helpdesk, with confidence thresholds and clean human hand-off.", "−58% first-line tickets", "rings", 5, ["Support", "RAG", "Zendesk"], 4],
    ["Lead routing engine", "Automation", 2025, "Scores, enriches and routes inbound leads to the right rep in under ninety seconds, with full audit trail.", "Response time 4h → 90s", "dots", 14, ["CRM", "Make", "Enrichment"], 0],
    ["Finance reconciliation pipeline", "Automation / Data", 2025, "Nightly reconciliation of payment-gateway exports against the ledger, with exception queues for finance.", "62 hrs saved / month", "grid", 9, ["Python", "Finance", "Alerts"], 8],
  ],
  ananya: [
    ["Kiln & Co. identity", "Brand identity", 2026, "A ceramics studio's identity built around the geometry of the kiln. Mark, type and a rulebook that fits on one sheet.", "Rebrand launched in 3 weeks", "blocks", 7, ["Identity", "Packaging"], 2],
    ["Oat & Ember packaging", "Packaging", 2025, "A twelve-SKU granola range with a typographic system that flexes across pack sizes.", "+34% shelf pick-up in trials", "rings", 19, ["Packaging", "Print"], 12],
    ["Field Notes annual report", "Editorial", 2025, "A 96-page annual report treated as a field guide, with an index that readers actually used.", "Shortlisted — Print Awards", "glyph", 33, ["Editorial", "Layout"], 6],
  ],
  kabir: [
    ["Cinder Games launch trailer", "Video", 2026, "A 90-second launch edit with sound design built around the game's own audio cues.", "2.1M views in 10 days", "lines", 24, ["Trailer", "Sound"], 13],
    ["Weekly founder show", "Long-form", 2025, "Restructured a rambling weekly show into a tight twelve-minute episode with chapters and cold open.", "+41% average view duration", "wave", 90, ["YouTube", "Podcast"], 3],
    ["Orbit Foods paid social set", "Short-form", 2025, "Forty hooks tested across Reels and Shorts for a snack brand's spring launch.", "CPA −27%", "bars", 18, ["Paid social", "Hooks"], 3],
  ],
  meera: [
    ["Marketplace for local makers", "Web app", 2026, "Multi-vendor marketplace with Stripe Connect, role-based access and full-text search.", "Live with 1,200 vendors", "wire", 31, ["Next.js", "Stripe", "Postgres"], 8],
    ["Realtime ops console", "Web app", 2025, "Operational dashboard with presence, live job queues and audit log, built on Supabase Realtime.", "Support time −35%", "lines", 8, ["Supabase", "Realtime"], 14],
    ["Subscription billing rebuild", "Backend", 2025, "Replaced a brittle billing script with an idempotent, tested Stripe webhook pipeline.", "Zero failed renewals in 6 months", "grid", 44, ["Stripe", "Webhooks"], 7],
  ],
  arjun: [
    ["Revenue operations dashboard", "Dashboards", 2026, "A single dashboard replacing eleven spreadsheets, with a metric layer finance signed off.", "Weekly reporting 6h → 0", "scatter", 29, ["Metabase", "dbt"], 7],
    ["Warehouse for a lending startup", "Data engineering", 2025, "BigQuery warehouse with a dimensional model, tested pipelines and cost guardrails.", "Query cost −48%", "lines", 53, ["BigQuery", "dbt", "Airflow"], 8],
    ["Product analytics model", "Analytics", 2025, "Event model and funnel definitions covering six surfaces, with data-quality tests on each.", "One definition of 'active'", "dots", 71, ["Events", "SQL"], 5],
  ],
  isha: [
    ["Ledgerline homepage rewrite", "Copywriting", 2026, "Interview-led rewrite of a fintech homepage and pricing page from customer language.", "+22% signups from homepage", "glyph", 3, ["Homepage", "SaaS"], 8],
    ["Lumen Learning lifecycle", "Email", 2025, "A twelve-email onboarding and activation sequence built in Customer.io.", "Activation +18%", "bars", 71, ["Lifecycle", "Onboarding"], 14],
    ["Founder essay series", "Ghostwriting", 2025, "Six essays published under a founder's name over a quarter.", "3 inbound enterprise leads", "lines", 15, ["Essays", "LinkedIn"], 4],
  ],
  dev: [
    ["Cinder companion app", "Mobile", 2026, "Offline-first companion app for a tabletop game, with sync, push and in-app purchases.", "4.8★ on both stores", "blocks", 14, ["React Native", "Offline"], 13],
    ["Lumen Learning learner app", "Mobile", 2025, "Lesson player with downloads, streaks and gentle nudges on both platforms.", "Day-30 retention 31%", "grid", 61, ["Expo", "Push"], 14],
    ["Brightwater rescue", "Refactor", 2025, "Untangled a three-year-old app with 40% crash-free sessions into a stable release pipeline.", "Crash-free 99.4%", "bars", 41, ["Fastlane", "Refactor"], 15],
  ],
  tara: [
    ["Halcyon patient portal", "Product design", 2026, "Redesign of a patient portal around the three tasks people actually come for.", "Task completion +37%", "grid", 52, ["Healthcare", "Web"], 4],
    ["Ledgerline design system", "Design systems", 2025, "Sixty-component system with tokens exported to code and a contribution process.", "Handoff time −50%", "blocks", 66, ["Tokens", "Figma"], 8],
    ["Marlow mobile banking", "Product design", 2025, "A mobile investing flow designed for first-time users, tested with twenty participants.", "Onboarding drop-off −29%", "dots", 80, ["Fintech", "Mobile"], 7],
  ],
  zoya: [
    ["Orbit Foods SEO programme", "SEO", 2026, "Technical clean-up and a content roadmap for a D2C grocery marketplace.", "+31% organic revenue", "scatter", 62, ["Technical SEO", "E-commerce"], 3],
    ["Cinder acquisition rebuild", "Paid", 2025, "Rebuilt tracking and structure across Meta and Google for a gaming launch.", "ROAS 1.9× → 3.1×", "glyph", 84, ["Meta", "Google", "GA4"], 13],
    ["Programmatic landing pages", "SEO", 2025, "A template-driven set of 400 landing pages for a travel marketplace.", "42k organic visits / month", "lines", 95, ["Programmatic", "Content"], 9],
  ],
  vikram: [
    ["Sable Audio album mix", "Mixing", 2026, "Mix and master of an eight-track electronic record, delivered with Atmos stems.", "Released on 6 platforms", "wave", 77, ["Mixing", "Atmos"], 10],
    ["Cinder Games soundtrack", "Scoring", 2025, "An adaptive score with Hindustani classical textures and dynamic layers.", "Nominated — Indie Game Awards", "bars", 36, ["Game audio", "Adaptive"], 13],
    ["Brand film score", "Scoring", 2025, "A 3-minute cinematic score for a heritage brand's anniversary film.", "1.4M views", "dots", 17, ["Film", "Orchestral"], 3],
  ],
  nisha: [
    ["Tessera seed deck", "Pitch deck", 2026, "A 14-slide seed deck built around a single market thesis, with an investor Q&A document.", "₹6.5Cr seed closed", "rings", 44, ["Seed", "Deck"], 5],
    ["Marlow Series A model", "Financial model", 2025, "A three-statement model with cohort revenue build and scenario toggles.", "Passed diligence first time", "bars", 58, ["Model", "SaaS"], 7],
    ["Vantage Row data room", "Fundraising", 2025, "Built and indexed the data room for a ₹40Cr Series A.", "Closed in 9 weeks", "grid", 23, ["Data room", "Diligence"], 11],
  ],
  elena: [
    ["Parallel hardware launch", "3D / Product", 2026, "Hero animation and twelve stills for a hardware launch, before the first unit shipped.", "₹2.2Cr pre-orders", "wire", 63, ["Blender", "Product"], 9],
    ["Sable Audio motion identity", "Motion", 2025, "A kinetic identity system for a record label, including Lottie assets for the app.", "Applied across 40+ assets", "blocks", 45, ["Motion", "Lottie"], 10],
    ["Abstract hero loops", "3D / Loops", 2025, "Six seamless loops for a design-tool homepage, each under 1.5 MB.", "LCP unchanged, bounce −12%", "rings", 101, ["Loops", "WebGL"], 1],
  ],
  noah: [
    ["Tessera document intelligence", "AI / RAG", 2026, "A retrieval system over ninety thousand contracts with citations and access control.", "Answer accuracy 91%", "scatter", 17, ["RAG", "pgvector"], 5],
    ["Evaluation harness", "AI / Evals", 2025, "A CI-integrated evaluation suite that blocks prompt changes that regress quality.", "Regressions caught pre-release", "grid", 28, ["Evals", "CI"], 0],
    ["Brightwater assistant", "AI / Agents", 2025, "Tool-calling assistant that books, reschedules and refunds across three systems.", "Handles 62% of requests", "rings", 59, ["Agents", "Tools"], 15],
  ],
  samir: [
    ["Northwind GTM sprint", "Strategy", 2026, "A two-week sprint to define ICP, channel and message for a developer-tools launch.", "First 12 pilots in 6 weeks", "wire", 12, ["GTM", "ICP"], 0],
    ["Marlow pricing redesign", "Pricing", 2025, "New tier structure and value metric for a B2B SaaS, tested with forty customers.", "ACV +28%", "dots", 95, ["Pricing", "SaaS"], 7],
    ["Halcyon sales playbook", "Sales", 2025, "A written playbook, scripts and pipeline model for a first sales hire.", "Ramp time −40%", "bars", 19, ["Playbook", "Sales"], 4],
  ],
};

export const PROJECTS: PortfolioProject[] = Object.entries(RAW).flatMap(([creatorId, list]) =>
  list.map((p, i) => ({
    id: `${creatorId}-p${i + 1}`,
    creatorId,
    title: p[0],
    discipline: p[1],
    year: p[2],
    summary: p[3],
    result: p[4],
    art: { variant: p[5], seed: p[6] },
    tags: p[7],
    client: p[8] !== undefined ? CLIENTS_POOL[p[8]] : undefined,
  })),
);

export function projectsByCreator(creatorId: string): PortfolioProject[] {
  return PROJECTS.filter((p) => p.creatorId === creatorId);
}

/** Hand-picked for the home page. */
export const FEATURED_PROJECT_IDS = ["rohan-p1", "ananya-p1", "elena-p1", "tara-p1", "kabir-p1", "meera-p1"];
