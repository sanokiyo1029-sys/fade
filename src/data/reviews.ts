import type { CategorySlug, Review, Service } from "@/lib/types";
import { hash } from "@/lib/utils";
import { SERVICES } from "./services";

const AUTHORS: [string, string][] = [
  ["Priya Nambiar", "India"],
  ["Marcus Hale", "United Kingdom"],
  ["Sofia Ricci", "Italy"],
  ["Aditya Kulkarni", "India"],
  ["Hana Park", "South Korea"],
  ["Jonas Weber", "Germany"],
  ["Leila Haddad", "France"],
  ["Rahul Desai", "India"],
  ["Emily Carter", "United States"],
  ["Tomás Silva", "Portugal"],
  ["Ishaan Gupta", "India"],
  ["Chloe Martin", "Canada"],
  ["Yusuf Demir", "Türkiye"],
  ["Anjali Menon", "India"],
  ["Oliver Grant", "Australia"],
  ["Sneha Pillai", "India"],
];

/** [text, project] */
const POOL: Record<CategorySlug, [string, string][]> = {
  "ai-automation": [
    ["Replaced three hours of daily copy-paste with a workflow that has not failed once in two months. Alerts, logs and a runbook came as standard. Exactly how this should be done.", "Lead routing"],
    ["Clear about what to automate and, more usefully, what not to. Communication was fast and precise, and the handover video meant my team could own it immediately.", "Finance reconciliation"],
    ["The agent answers from our docs, cites them and escalates properly. Ticket volume dropped by almost half in the first month.", "Support agent"],
    ["Went beyond the brief. Spotted a duplicate-data issue in our CRM before building anything on top of it. Saved us a nasty surprise.", "CRM clean-up"],
    ["Thorough, honest estimate and delivery a day early. I'll be back for the next phase.", "Onboarding flow"],
  ],
  programming: [
    ["Typed, tested, documented. My own engineers said it was the cleanest handover they've seen from a contractor. Shipped to staging in week one.", "Marketplace MVP"],
    ["Found the root cause of a crash we'd been chasing for two months within a day, then fixed it with a test that proves it. Worth every rupee.", "Crash investigation"],
    ["Excellent communication — a short demo every week and no surprises on scope. The row-level security setup alone paid for itself.", "SaaS dashboard"],
    ["Our app went through App Review first time. Offline mode works better than the competition's. Highly recommended.", "Mobile app"],
    ["Pull requests were small, well-explained and easy to review. A genuinely senior engineer.", "API rebuild"],
  ],
  design: [
    ["The identity works everywhere — a favicon, a shopfront, a deck. The guidelines are so clear our new hire used them correctly on day one.", "Brand identity"],
    ["Thoughtful, quick to understand what we were trying to say and unafraid to push back. The final system feels inevitable.", "Rebrand"],
    ["Screens were beautiful but the real value was the flows: empty states, errors, edge cases. Engineering had almost no questions.", "App redesign"],
    ["Printer accepted the files first time and the shelf impact is exactly what we hoped. Superb attention to detail.", "Packaging"],
    ["Our component library finally matches what's in production. Design and engineering are speaking the same language.", "Design system"],
  ],
  video: [
    ["First cut was nearly final. Pacing, captions and sound all exactly right. Our view-through rate on Reels went up noticeably.", "Short-form series"],
    ["Fast, reliable and creative. Turned two hours of rambling into a tight twelve-minute video that retained better than anything we've posted.", "YouTube episode"],
    ["Great at taking notes and returning with something better than we asked for. Easy to work with every time.", "Product video"],
    ["Colour, sound and pacing were all handled. Delivered a day early. We've set up a monthly retainer.", "Podcast clips"],
    ["Clear communication and consistent quality across twelve edits. Exactly what a growing channel needs.", "Monthly package"],
  ],
  marketing: [
    ["The audit was specific, quantified and prioritised. We implemented the top five fixes and organic traffic is up 31% in six weeks.", "SEO audit"],
    ["Our tracking was broken and nobody knew. Fixed in a day, and reporting now matches our finance numbers.", "Ad tracking"],
    ["Sequences read like a helpful colleague, not a campaign. Open rates and activation both climbed.", "Lifecycle emails"],
    ["Honest about what could work and what couldn't. Delivered the plan on time and walked us through every line.", "Growth plan"],
    ["Clear, actionable, and written for the people who have to do the work. Rare.", "Paid set-up"],
  ],
  writing: [
    ["Interviewed our customers and handed our own words back to us in a structure that finally makes sense. Conversion on the homepage rose within a fortnight.", "Homepage copy"],
    ["Wrote an essay in my voice that I'd happily put my name on. Three people DM'd me about it the day it went live.", "Thought leadership"],
    ["Quick, careful and an absolute pleasure to work with. Every claim was fact-checked and sourced.", "Article series"],
    ["Our pricing page is clearer, our CTA stronger and our team finally agrees what we do. Money well spent.", "Pricing page"],
    ["Understood the brief on the first call. Two rounds of edits and we were done.", "Product copy"],
  ],
  business: [
    ["Walked into investor meetings with a deck that did half the talking. Closed our seed round three weeks later.", "Seed deck"],
    ["The model is clean enough that a due-diligence analyst understood it in ten minutes. Scenario toggles are brilliant.", "Financial model"],
    ["Pushed back on three assumptions that would have embarrassed us in diligence. Honest, sharp and incredibly fast.", "Series A prep"],
    ["Story, slides and the Q&A prep were all excellent. I felt ready for every question.", "Pitch deck"],
    ["Rare combination of finance depth and design taste. Would hire again.", "Investor update"],
  ],
  music: [
    ["Delivered a cue that fit the picture on the first attempt and stems that made our editor's life easy. Genuinely cinematic.", "Brand film"],
    ["Mix translates to every system I tested. Vocals sit exactly where I wanted them. Mastered track hit streaming loudness without being squashed.", "Single release"],
    ["Understood the reference immediately and brought something fresh. The Hindustani layer gave the score its identity.", "Short film"],
    ["Communicative, quick and uncompromising about quality. Our game soundtrack feels like a real world.", "Game score"],
    ["Great ears, fair price and zero ego. The EP sounds the way I always imagined.", "EP mix"],
  ],
  consulting: [
    ["In two weeks we went from five target segments to one, with a message that gets replies. Best money we've spent this year.", "GTM sprint"],
    ["Told us our pricing was costing us enterprise deals. He was right. New tiers launched, ACV up 28%.", "Pricing review"],
    ["No fluff. Every session ended with decisions and tasks. Our team knew exactly what to do on Monday.", "Strategy"],
    ["Direct, experienced and genuinely invested in our outcome. Customer interviews were gold.", "ICP research"],
    ["Cut through three months of internal debate in a single session. Worth it for that alone.", "Positioning"],
  ],
  data: [
    ["Dashboard replaced eleven spreadsheets. Our team opens it every morning without being asked.", "Ops dashboard"],
    ["The dbt project is tidy, tested and documented. Our analysts picked it up immediately.", "Warehouse build"],
    ["Metric definitions were the real deliverable. Finance and product finally see the same number.", "Metric layer"],
    ["Fast, careful and honest about data quality problems. Found two issues in our source system we hadn't seen.", "Pipeline"],
    ["Training session was clear, patient and useful. Adoption was immediate.", "Dashboards"],
  ],
  "3d-motion": [
    ["Renders were indistinguishable from studio photography. We launched pre-orders before the first unit existed.", "Product launch"],
    ["Our logo animation now opens every video and every app. Lottie files were tiny and flawless.", "Motion identity"],
    ["The hero loop looks premium, weighs under two megabytes and loops without a seam. Exactly the brief.", "Website hero"],
    ["Communicative, patient and precise with materials. Every revision made the work sharper.", "Product renders"],
    ["Colourways were delivered in an afternoon. Saved us a photo shoot and weeks of lead time.", "Colour variants"],
  ],
};

const REPLIES = [
  "Thank you — a pleasure working on this. Looking forward to the next phase.",
  "Appreciate the kind words. Happy to support as you scale.",
  "Thanks! Great collaboration from start to finish.",
];

function r(n: number) {
  return Math.round(n * 10) / 10;
}

export function reviewsForService(service: Service, limit = 4): Review[] {
  const pool = POOL[service.category];
  const h = hash(service.id);
  const out: Review[] = [];
  for (let i = 0; i < Math.min(limit, pool.length); i++) {
    const [text, project] = pool[(h + i) % pool.length];
    const [author, country] = AUTHORS[(h + i * 5) % AUTHORS.length];
    const q = Math.min(5, r(service.rating + (((h >> (i + 2)) % 3) - 1) * 0.1 + 0.05));
    const c = Math.min(5, r(service.rating + (((h >> (i + 4)) % 3) - 1) * 0.1 + 0.1));
    const d = Math.min(5, r(service.rating + (((h >> (i + 6)) % 3) - 1) * 0.1 - 0.05));
    const month = 1 + ((h + i * 3) % 9); // Jan–Sep 2026
    const day = 1 + ((h >> 3) + i * 7) % 27;
    out.push({
      id: `${service.id}-r${i}`,
      serviceId: service.id,
      creatorId: service.creatorId,
      author,
      country,
      rating: Math.min(5, Math.max(4, Math.round((q + c + d) / 3))),
      quality: q,
      communication: c,
      delivery: d,
      text,
      project,
      date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      reply: i === 0 ? REPLIES[h % REPLIES.length] : undefined,
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function reviewsForCreator(creatorId: string, limit = 8): Review[] {
  const list = SERVICES.filter((s) => s.creatorId === creatorId).flatMap((s) => reviewsForService(s, 4));
  return list.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
}

export function ratingBreakdown(rating: number) {
  const quality = r(Math.min(5, rating + 0.0));
  const communication = r(Math.min(5, rating + 0.1));
  const delivery = r(Math.max(4.4, rating - 0.1));
  // distribution of stars, derived from the mean so it always agrees with it
  const five = Math.round(40 + (rating - 4) * 55);
  const four = Math.round(Math.max(3, 100 - five - 3));
  const three = Math.max(1, 100 - five - four - 1);
  const dist: [number, number, number, number, number] = [five, four, three, 1, 100 - five - four - three - 1];
  return { quality, communication, delivery, dist };
}
