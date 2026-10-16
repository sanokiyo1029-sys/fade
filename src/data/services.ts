import type { ArtVariant, CategorySlug, Faq, Pkg, ProcessStep, Service } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────
   Category defaults — process, requirements, FAQ
   ────────────────────────────────────────────────────────────── */
interface CatDefaults {
  process: ProcessStep[];
  requirements: string[];
  faq: Faq[];
}

const step = (title: string, body: string, days: string): ProcessStep => ({ title, body, days });

const DEFAULTS: Record<CategorySlug, CatDefaults> = {
  "ai-automation": {
    process: [
      step("Scoping call", "We map the process as it exists today, identify what's worth automating and agree success metrics.", "DAY 01"),
      step("Blueprint", "You receive a one-page diagram of the proposed system, tools used and expected run costs.", "DAY 02"),
      step("Build & test", "I build against your live accounts in a sandbox, with logging on from the first run.", "DAY 03–06"),
      step("Handover", "Walkthrough, runbook and a monitored first week so nothing silently breaks.", "FINAL"),
    ],
    requirements: [
      "Admin or API access to the tools being connected",
      "A short written description (or screen recording) of the current process",
      "Two or three real examples of inputs and expected outputs",
      "A named person who can approve edge-case decisions",
    ],
    faq: [
      { q: "Do I need to pay for the tools myself?", a: "Yes. Subscriptions for Make, n8n, OpenAI and similar stay on your accounts so you own everything. I'll estimate monthly run costs before we start." },
      { q: "What happens if an automation breaks later?", a: "Every build ships with error alerts and a runbook. Standard and Advanced packages include a support window where fixes are free." },
      { q: "Can you work with a tool that isn't listed?", a: "Almost certainly. If it has an API or webhook, it can be connected. Message me before ordering and I'll confirm." },
      { q: "Will my data be sent to third parties?", a: "Only to the services you already use. I'll document every data flow in the blueprint so you can review it." },
    ],
  },
  programming: {
    process: [
      step("Spec & estimate", "A short technical spec, data model and milestone plan agreed before any code is written.", "DAY 01–02"),
      step("Foundation", "Repository, CI, environments and the core schema go up first.", "DAY 03–05"),
      step("Build in slices", "Vertical slices shipped to a preview URL so you can review working software weekly.", "WEEK 1–N"),
      step("Hardening & handover", "Tests, docs, deployment and a recorded walkthrough of the codebase.", "FINAL"),
    ],
    requirements: [
      "Access to your repository, hosting and any third-party accounts",
      "Wireframes, designs or a clear written brief",
      "A technical contact who can answer questions within a day",
      "Any existing API documentation or credentials for integrations",
    ],
    faq: [
      { q: "Who owns the code?", a: "You do. All code is transferred on delivery under a work-for-hire licence, with no attribution required." },
      { q: "Can you work in our existing stack?", a: "Yes. I'll review the codebase before quoting so the estimate reflects reality, not wishful thinking." },
      { q: "Do you provide support after launch?", a: "Bug fixes for things I built are covered during the support window listed in your package." },
      { q: "How do we communicate?", a: "A shared channel plus a weekly demo. Pull requests are small and reviewable." },
    ],
  },
  design: {
    process: [
      step("Discovery", "A structured brief and reference session to define audience, tone and constraints.", "DAY 01–02"),
      step("Exploration", "Several directions presented as simple boards so feedback is about ideas, not polish.", "DAY 03–06"),
      step("Refinement", "One direction developed fully, with rounds of revision as per your package.", "DAY 07–12"),
      step("Delivery", "Organised source files, exports and usage guidance, ready for your team or printer.", "FINAL"),
    ],
    requirements: [
      "A short brief about your business, audience and goals",
      "Three references you admire (and one you don't)",
      "Existing brand assets, logos or copy if available",
      "Any technical constraints such as print sizes or file formats",
    ],
    faq: [
      { q: "What file formats will I receive?", a: "Source files in Figma or Adobe format, plus PNG, SVG and PDF exports. Package details list exactly what's included." },
      { q: "What if I don't like the first round?", a: "That's what revisions are for. If direction is off, we'll reset on a short call before spending a revision." },
      { q: "Do I get full commercial rights?", a: "Yes. Full rights transfer on final payment, apart from third-party fonts or stock, which I'll flag in advance." },
      { q: "Can you work to an existing brand?", a: "Yes — send your guidelines and I'll work inside them." },
    ],
  },
  video: {
    process: [
      step("Footage & brief", "You share raw footage, references and the intended platform and length.", "DAY 00"),
      step("First cut", "A rough assembly with pacing, structure and sound, ready for notes.", "DAY 01–02"),
      step("Notes round", "You send consolidated notes once; I fold them in and polish colour, captions and audio.", "DAY 03–04"),
      step("Final export", "Platform-ready exports, plus project files if your package includes them.", "FINAL"),
    ],
    requirements: [
      "A shared drive link to raw footage (original files, not compressed)",
      "Reference videos for pace and style",
      "Brand fonts, logo and colours for captions and lower-thirds",
      "Music licence details if you supply tracks",
    ],
    faq: [
      { q: "How long can the raw footage be?", a: "Package limits are listed above. If you have more, message me and I'll quote a custom scope." },
      { q: "Do you handle captions and subtitles?", a: "Burned-in captions are included from Standard up. SRT files for multiple languages can be added as an extra." },
      { q: "Can you recreate a style from another video?", a: "I can match pacing and structure. I won't clone another creator's work frame by frame." },
      { q: "What export formats do you deliver?", a: "H.264 and ProRes where relevant, with platform presets for Reels, Shorts, TikTok and YouTube." },
    ],
  },
  marketing: {
    process: [
      step("Access & baseline", "Read-only access to analytics and ad accounts to measure where you really are.", "DAY 01"),
      step("Analysis", "Quantified findings, ranked by expected impact and effort.", "DAY 02–05"),
      step("Plan", "A prioritised plan with owners, timelines and the first week's tasks written out.", "DAY 06–08"),
      step("Walkthrough", "A live session to answer questions, then a written summary your team can act on.", "FINAL"),
    ],
    requirements: [
      "Read-only access to analytics, Search Console or ad accounts",
      "A list of your top three competitors",
      "Current monthly traffic, spend and conversion numbers",
      "Your target customer and one measurable goal for the quarter",
    ],
    faq: [
      { q: "Do you guarantee rankings or ROAS?", a: "No one honest can. I guarantee the quality of the analysis and clarity of the plan, and I'll be upfront about expected ranges." },
      { q: "Will you implement the changes?", a: "Implementation is separate unless your package says otherwise. I can scope it as a follow-up." },
      { q: "How do you report results?", a: "A single dashboard with metrics tied to revenue, updated weekly during active engagements." },
      { q: "What tools do I need?", a: "Analytics and ad-account access. I bring my own tooling for audits." },
    ],
  },
  writing: {
    process: [
      step("Interview", "A focused call or questionnaire to capture your audience, tone and the points that matter.", "DAY 01"),
      step("Outline", "A structure for approval before full drafting, so we don't polish the wrong thing.", "DAY 02"),
      step("Draft", "First full draft delivered in a shared document with comments enabled.", "DAY 03–06"),
      step("Revise & finalise", "Consolidated feedback in, final copy out, with notes on what changed and why.", "FINAL"),
    ],
    requirements: [
      "A short description of your product, audience and goal for the piece",
      "Any existing copy, decks or customer research",
      "Examples of voices you like and those you don't",
      "A single decision-maker for feedback",
    ],
    faq: [
      { q: "Do you write in my voice?", a: "Yes. I'll study your existing writing and calls, and flag anywhere I've stretched the voice." },
      { q: "Is the writing AI-generated?", a: "No. I use AI for research and proof-reading; the writing is mine and every claim is checked." },
      { q: "Who owns the copyright?", a: "You do, on full payment. I don't reuse client work." },
      { q: "Can you handle SEO?", a: "Yes — keyword research and on-page structure are included where the package says so." },
    ],
  },
  business: {
    process: [
      step("Intake", "You share the current deck, numbers and fundraising goals; I review before we speak.", "DAY 01"),
      step("Narrative / structure", "The story or model structure is agreed before any slides or formulas get built.", "DAY 02–04"),
      step("Build", "Full draft with speaker notes or model documentation for review.", "DAY 05–10"),
      step("Finalise", "Investor-ready final, plus a short list of questions you should expect in meetings.", "FINAL"),
    ],
    requirements: [
      "Latest deck, financials and key metrics (even if messy)",
      "Target raise size and intended investors",
      "Founder bios and traction highlights",
      "Any legal or confidentiality constraints",
    ],
    faq: [
      { q: "Is my information confidential?", a: "Yes. I'll sign an NDA before you share anything sensitive." },
      { q: "Will you guarantee we raise?", a: "No. I'll make sure your materials are clear, credible and consistent. The rest is you and the market." },
      { q: "What formats do you deliver?", a: "Keynote or PowerPoint plus PDF for decks; Excel or Google Sheets for models." },
      { q: "Can you present to investors?", a: "I can coach your delivery and run a mock Q&A on higher packages." },
    ],
  },
  music: {
    process: [
      step("Brief & references", "Mood, tempo, instrumentation and the picture or track the music needs to serve.", "DAY 01"),
      step("Sketch", "A rough demo to lock direction before production begins.", "DAY 02–04"),
      step("Production", "Full production, recording and mixing, with revisions per your package.", "DAY 05–10"),
      step("Delivery", "Final mixes, stems and cue sheets in the formats you need.", "FINAL"),
    ],
    requirements: [
      "A reference track or scene to anchor mood and tempo",
      "Video picture lock (for scoring) or raw stems (for mixing)",
      "Usage details — platforms, territories and duration",
      "Any tempo, key or length constraints",
    ],
    faq: [
      { q: "What do I get at the end?", a: "WAV masters plus MP3 previews. Stems and project files are included on higher packages." },
      { q: "Who owns the music?", a: "You receive a full licence for the usage described in your order; buyouts are available." },
      { q: "Do you use samples or AI?", a: "Original recordings and cleared samples only. Nothing generated by AI music tools." },
      { q: "Can you work with live musicians?", a: "Yes — I can bring in session players on request at cost." },
    ],
  },
  consulting: {
    process: [
      step("Pre-read", "You send context and data; I review it before we speak so the first call is working time.", "DAY 00"),
      step("Working sessions", "Live sessions to test assumptions, interview customers and pressure-test ideas.", "DAY 01–07"),
      step("Synthesis", "A written recommendation with trade-offs and a sequenced plan.", "DAY 08–10"),
      step("Handover", "Readout session and a first-week checklist so momentum survives the meeting.", "FINAL"),
    ],
    requirements: [
      "A short description of the business, stage and goal",
      "Access to relevant metrics, pipeline or pricing pages",
      "Two or three people I may interview",
      "Honest constraints on budget, team and runway",
    ],
    faq: [
      { q: "Is this a deck or a conversation?", a: "Both. Sessions are conversations; the output is a concise written plan you can circulate." },
      { q: "Will you talk to our customers?", a: "Where possible, yes. A handful of interviews usually reveals more than any amount of desk research." },
      { q: "Can we extend the engagement?", a: "Yes. Many clients convert a sprint into a monthly advisory arrangement." },
      { q: "How do you handle confidential information?", a: "NDA first, always." },
    ],
  },
  data: {
    process: [
      step("Source audit", "We inventory sources, definitions and the questions the business needs answered.", "DAY 01–02"),
      step("Model", "Warehouse tables or dashboard wireframes agreed before building.", "DAY 03–05"),
      step("Build & test", "Pipelines and charts built with automated tests on every metric.", "DAY 06–12"),
      step("Handover", "Documentation, access and a training session for the people who'll use it.", "FINAL"),
    ],
    requirements: [
      "Read access to the data sources to be connected",
      "A list of the ten questions you'd most like answered",
      "Existing reports or spreadsheets, even if messy",
      "A data owner who can approve metric definitions",
    ],
    faq: [
      { q: "Where will the data live?", a: "In your own warehouse or database. I don't copy your data to my systems." },
      { q: "Can you work with spreadsheets?", a: "Yes, and I'll help you move off them gradually if that's the goal." },
      { q: "How are metrics defined?", a: "Each metric gets a written definition, an owner and an automated test." },
      { q: "What about data privacy?", a: "I follow least-privilege access and can work with anonymised extracts." },
    ],
  },
  "3d-motion": {
    process: [
      step("Brief & references", "Product files, brand guidance and camera/mood references.", "DAY 01"),
      step("Look-dev", "Stills or animatics to lock lighting, materials and motion before final rendering.", "DAY 02–04"),
      step("Production", "Full-resolution renders or animation with a feedback round before final output.", "DAY 05–10"),
      step("Delivery", "Final files in your required formats with project files where included.", "FINAL"),
    ],
    requirements: [
      "CAD, 3D files or detailed product photography",
      "Brand colours, materials and logo files",
      "Output sizes and platforms (web, social, broadcast)",
      "Reference imagery for lighting and mood",
    ],
    faq: [
      { q: "What do you need to model my product?", a: "CAD files are ideal. Otherwise, photos from several angles with dimensions will do." },
      { q: "What formats do you deliver?", a: "MP4, WebM, PNG sequences, Lottie and GLB depending on the package." },
      { q: "Can the animation loop seamlessly?", a: "Yes — loops are designed to be seamless and light enough for web." },
      { q: "Do I get the project files?", a: "Higher packages include source files and a render guide." },
    ],
  },
};

/* ──────────────────────────────────────────────────────────────
   Compact service authoring
   ────────────────────────────────────────────────────────────── */
type Tri<T> = [T, T, T];

interface S {
  id: string;
  creator: string;
  cat: CategorySlug;
  sub: string;
  title: string;
  tagline: string;
  tags: string[];
  rating: number;
  reviews: number;
  projects: number;
  queue: number;
  art: [ArtVariant, number];
  price: Tri<number>;
  days: Tri<number>;
  rev: Tri<number | null>;
  support?: Tri<string>;
  deliver: Tri<string[]>;
  features: string[];
  tiers?: Tri<number>;
  you: string[];
  desc: string[];
  created: string;
  process?: ProcessStep[];
  requirements?: string[];
  faq?: Faq[];
}

const NAMES = ["STARTER", "STANDARD", "ADVANCED"] as const;
const SUPPORT: Tri<string> = ["Email · 48 hr reply", "Chat · 24 hr reply", "Priority channel · 4 hr reply"];

function make(s: S): Service {
  const d = DEFAULTS[s.cat];
  const tiers = s.tiers ?? [2, 4, 6];
  const support = s.support ?? SUPPORT;
  const packages = ([0, 1, 2] as const).map((i) => ({
    tier: (i + 1) as 1 | 2 | 3,
    name: NAMES[i],
    price: s.price[i],
    days: s.days[i],
    revisions: s.rev[i],
    support: support[i],
    deliverables: s.deliver[i],
    featureCount: tiers[i],
  })) as [Pkg, Pkg, Pkg];
  const slug = s.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 7)
    .join("-");
  return {
    id: s.id,
    slug,
    creatorId: s.creator,
    category: s.cat,
    subcategory: s.sub,
    title: s.title,
    tagline: s.tagline,
    description: s.desc,
    tags: s.tags,
    rating: s.rating,
    reviewCount: s.reviews,
    projects: s.projects,
    packages,
    features: s.features,
    whatYouGet: s.you,
    process: s.process ?? d.process,
    requirements: s.requirements ?? d.requirements,
    faq: s.faq ?? d.faq,
    art: { variant: s.art[0], seed: s.art[1] },
    createdAt: s.created,
    queue: s.queue,
    status: "active",
  };
}

/* ──────────────────────────────────────────────────────────────
   The catalogue
   ────────────────────────────────────────────────────────────── */
const RAW: S[] = [
  /* ───────── AI & AUTOMATION ───────── */
  {
    id: "s01", creator: "rohan", cat: "ai-automation", sub: "Workflow automation",
    title: "I build automated workflows that eliminate repetitive work.",
    tagline: "Make, n8n and Python automations with logging, alerts and a runbook your team can read.",
    tags: ["Make", "n8n", "Zapier", "Python"],
    rating: 4.9, reviews: 87, projects: 124, queue: 3, art: ["dots", 11],
    price: [4999, 12999, 29999], days: [3, 7, 14], rev: [1, 3, null],
    deliver: [
      ["One automation, up to 5 steps", "Tested against your live accounts", "Setup walkthrough video"],
      ["Up to 3 connected automations", "Error handling with Slack or email alerts", "Run-log dashboard", "Written runbook"],
      ["Process audit and automation map", "Up to 8 automations or one agent pipeline", "Retry queues and monitoring", "Team training session", "30-day post-launch support"],
    ],
    features: ["Process audit", "Error alerts", "Run-log dashboard", "Written runbook", "Team training", "30-day support"],
    tiers: [1, 4, 6],
    you: [
      "Working automations running on your own accounts",
      "A one-page blueprint of every step and data flow",
      "Error alerts routed to Slack or email",
      "A written runbook with fixes for the most likely failures",
      "A recorded walkthrough for your team",
    ],
    desc: [
      "Most teams don't have an automation problem, they have a process problem hiding behind a lot of copy-and-paste. I start by mapping what actually happens — who touches what, where data gets re-typed, which steps nobody can explain — and then remove everything that doesn't need to exist.",
      "What remains gets automated with the right tool for the job: Make or n8n for glue, Python when logic gets serious, and an LLM only where judgement is genuinely needed. Everything ships with logging, alerts and a runbook so you're never dependent on me to keep it alive.",
    ],
    created: "2025-03-14",
  },
  {
    id: "s02", creator: "rohan", cat: "ai-automation", sub: "AI agents",
    title: "AI support agent trained on your own knowledge base.",
    tagline: "Answers from your docs, hands off cleanly to humans and improves from every correction.",
    tags: ["Support", "RAG", "OpenAI", "Helpdesk"],
    rating: 4.9, reviews: 52, projects: 38, queue: 2, art: ["rings", 5],
    price: [14999, 34999, 79999], days: [5, 10, 21], rev: [1, 2, 3],
    deliver: [
      ["Agent trained on up to 50 pages of content", "Web widget or Slack deployment", "Hand-off to a human by email"],
      ["Up to 500 pages / documents", "Helpdesk integration (Zendesk, Freshdesk, Intercom)", "Confidence thresholds and fallback flows", "Conversation analytics"],
      ["Multi-source knowledge (docs, tickets, CRM)", "Tool calling: refunds, order lookups, bookings", "Evaluation set of 200 test questions", "Human-in-the-loop review queue", "30-day tuning support"],
    ],
    features: ["Web widget", "Helpdesk integration", "Fallback to human", "Analytics", "Tool calling", "Evaluation set"],
    tiers: [1, 4, 6],
    you: [
      "A deployed support agent grounded in your own content",
      "Clear rules for when it answers and when it escalates",
      "An evaluation set so you can measure quality over time",
      "Dashboards showing deflection rate and unanswered questions",
    ],
    desc: [
      "A good support agent is less about the model and more about the plumbing: clean sources, honest confidence scores and a smooth hand-off when it isn't sure. I build all three, and I test against real tickets before anyone outside your team sees it.",
      "Recent builds have deflected 40–65% of first-line tickets while keeping CSAT flat or better. Your customers always have a way to reach a person.",
    ],
    created: "2025-09-02",
  },
  {
    id: "s03", creator: "noah", cat: "ai-automation", sub: "Chatbots & RAG",
    title: "Production RAG chatbot over your documents, with citations.",
    tagline: "Retrieval that cites its sources, refuses to guess and survives real traffic.",
    tags: ["RAG", "pgvector", "LangGraph", "FastAPI"],
    rating: 4.9, reviews: 41, projects: 29, queue: 2, art: ["scatter", 17],
    price: [19999, 44999, 99999], days: [7, 14, 28], rev: [1, 2, 3],
    deliver: [
      ["Ingestion pipeline for PDFs, docs and web pages", "Vector store on your Postgres", "Chat API with citations"],
      ["Hybrid search (keyword + semantic) with re-ranking", "Admin UI to add and remove sources", "Evaluation harness with 100 questions", "Streaming chat widget"],
      ["Multi-tenant access control", "Observability and cost dashboards", "Evaluation CI on every change", "Guardrails and PII redaction", "30-day support"],
    ],
    features: ["Citations", "Hybrid search", "Admin UI", "Evaluation harness", "Access control", "Observability"],
    tiers: [1, 4, 6],
    you: [
      "A retrieval system tuned to your documents, not a demo",
      "Source citations in every answer",
      "An evaluation harness to catch regressions",
      "Clear documentation for your engineers",
    ],
    desc: [
      "Most RAG demos work on ten documents and fall apart on ten thousand. I build the unglamorous parts — chunking strategy, metadata filters, re-ranking and evaluation — so quality holds up in production.",
      "You'll get a system your team can maintain: typed code, tests, documentation and a harness that tells you when a change made things worse.",
    ],
    created: "2025-06-21",
  },
  {
    id: "s04", creator: "noah", cat: "ai-automation", sub: "Prompt engineering",
    title: "Prompt systems and evaluation suites for LLM features.",
    tagline: "Stop shipping on vibes. Measurable prompts with regression tests.",
    tags: ["Prompts", "Evals", "Anthropic", "OpenAI"],
    rating: 4.8, reviews: 33, projects: 47, queue: 1, art: ["grid", 28],
    price: [8999, 22999, 54999], days: [4, 8, 15], rev: [1, 2, 3],
    deliver: [
      ["Audit of one existing prompt or chain", "Rewritten prompt with before/after comparison", "20-case test set"],
      ["Up to 3 prompts redesigned", "Structured outputs and schema validation", "100-case evaluation suite", "Model comparison report"],
      ["Full LLM feature architecture review", "Evaluation CI pipeline", "Cost and latency optimisation", "Fallback and retry design", "Team workshop"],
    ],
    features: ["Prompt audit", "Structured outputs", "Evaluation suite", "Model comparison", "CI integration", "Team workshop"],
    you: [
      "Prompts rewritten with clear, documented reasoning",
      "A test set that reflects your real inputs",
      "A report comparing models on quality, latency and cost",
      "Scripts to re-run evaluations whenever you change something",
    ],
    desc: [
      "If you can't measure it, you can't improve it. I build evaluation suites from your real data, then iterate prompts and model choices against them until the numbers justify the change.",
      "The result is LLM features that behave predictably, cost less and can be changed without anyone holding their breath.",
    ],
    created: "2025-08-11",
  },

  /* ───────── PROGRAMMING ───────── */
  {
    id: "s05", creator: "meera", cat: "programming", sub: "Web apps",
    title: "Full-stack Next.js product, from schema to deploy.",
    tagline: "TypeScript, Postgres and Stripe. Typed, tested and documented.",
    tags: ["Next.js", "TypeScript", "Postgres", "Stripe"],
    rating: 5.0, reviews: 38, projects: 93, queue: 4, art: ["wire", 31],
    price: [34999, 89999, 189999], days: [10, 21, 45], rev: [2, 3, 5],
    support: ["Email · 48 hr reply", "Chat · 24 hr reply", "Dedicated channel · 4 hr reply"],
    deliver: [
      ["Landing page + 2 authenticated screens", "Postgres schema and migrations", "Deployed to your Vercel account"],
      ["Auth, dashboard and 5 core features", "Stripe subscriptions or one-off payments", "Transactional email", "Playwright smoke tests"],
      ["Full MVP up to 15 screens", "Role-based access with row-level security", "Admin panel and audit log", "CI/CD and staging environment", "30-day bug-fix warranty"],
    ],
    features: ["Auth", "Stripe payments", "Transactional email", "Automated tests", "Admin panel", "Bug-fix warranty"],
    tiers: [1, 4, 6],
    you: [
      "A deployed product on your own infrastructure",
      "Full source code in your repository",
      "Typed database schema with migration history",
      "Documentation for local setup and deployment",
      "A recorded architecture walkthrough",
    ],
    desc: [
      "I build products the way I'd want to inherit them: strictly typed, thoughtfully modelled and covered by tests that matter. Next.js on the front, Postgres at the core, with Supabase or plain SQL depending on what suits your team.",
      "You'll see working software every week on a preview URL. Scope changes are discussed openly and priced before they happen.",
    ],
    created: "2024-11-05",
  },
  {
    id: "s06", creator: "meera", cat: "programming", sub: "Backend & APIs",
    title: "Supabase backend: auth, row-level security, storage and realtime.",
    tagline: "A secure, scalable backend your frontend team can build against on day one.",
    tags: ["Supabase", "RLS", "Postgres", "Realtime"],
    rating: 5.0, reviews: 29, projects: 54, queue: 2, art: ["lines", 8],
    price: [11999, 27999, 59999], days: [4, 9, 18], rev: [1, 2, 3],
    deliver: [
      ["Schema design for up to 8 tables", "Auth with email and Google", "Row-level security policies"],
      ["Up to 20 tables with relationships and indexes", "Storage buckets with access rules", "Edge functions for webhooks", "Seed data and typed client"],
      ["Realtime channels for chat or presence", "Full-text search with ranking", "Stripe webhooks and entitlement sync", "Backup and migration strategy", "Load test report"],
    ],
    features: ["Row-level security", "Storage rules", "Edge functions", "Typed client", "Realtime", "Full-text search"],
    you: [
      "A production-ready Supabase project",
      "Database schema and migrations in version control",
      "Row-level security policies with tests",
      "A generated TypeScript client",
    ],
    desc: [
      "Supabase makes it easy to start and surprisingly easy to get wrong. Open tables, missing indexes and policies that don't compose all show up at the worst time. I design the schema and security model first, then verify them with real tests.",
      "If you've got a prototype that needs hardening, I can audit and fix it. If you're starting fresh, we'll build the model together.",
    ],
    created: "2025-02-18",
  },
  {
    id: "s07", creator: "dev", cat: "programming", sub: "Mobile apps",
    title: "Cross-platform mobile app in React Native.",
    tagline: "One codebase, two stores. Offline-first, push-ready and App Review tested.",
    tags: ["React Native", "Expo", "iOS", "Android"],
    rating: 4.7, reviews: 26, projects: 74, queue: 5, art: ["blocks", 14],
    price: [59999, 139999, 289999], days: [21, 42, 75], rev: [2, 4, 6],
    deliver: [
      ["Up to 5 screens", "Navigation, theming and state setup", "TestFlight and internal track builds"],
      ["Up to 12 screens with offline cache", "Push notifications", "Authentication and profile", "Analytics events"],
      ["Full app up to 25 screens", "Payments (in-app or Stripe)", "Offline-first sync", "App Store and Play Store submission", "60-day support"],
    ],
    features: ["Push notifications", "Offline mode", "Payments", "Analytics", "Store submission", "Post-launch support"],
    tiers: [0, 4, 6],
    you: [
      "A published app on both stores under your accounts",
      "Complete source in your repository",
      "CI pipeline producing signed builds",
      "A store-listing checklist and submission support",
    ],
    desc: [
      "I've shipped fourteen apps to the App Store and Google Play. The code is the easy part — it's offline behaviour, permission prompts, store rejections and slow devices that separate demos from products.",
      "I work from your designs or alongside your designer, and I'll tell you honestly when a native module is worth it.",
    ],
    created: "2024-08-30",
  },
  {
    id: "s08", creator: "dev", cat: "programming", sub: "Bug fixes & refactors",
    title: "Fix, refactor and speed up your existing codebase.",
    tagline: "Crashes, slow screens and flaky builds, resolved and documented.",
    tags: ["Debugging", "Performance", "Refactor", "CI"],
    rating: 4.8, reviews: 44, projects: 71, queue: 3, art: ["bars", 41],
    price: [5999, 14999, 34999], days: [2, 5, 10], rev: [1, 2, 3],
    deliver: [
      ["Diagnose and fix one reproducible bug", "Written root-cause note", "Regression test"],
      ["Up to 5 bugs or one performance problem", "Profiling report with before/after", "Cleaned-up CI pipeline"],
      ["Codebase health audit", "Refactor of one critical module", "Test coverage for changed areas", "Upgrade of key dependencies", "Documentation of findings"],
    ],
    features: ["Root-cause note", "Regression tests", "Performance profile", "CI cleanup", "Dependency upgrades", "Health audit"],
    you: [
      "Fixes delivered as small, reviewable pull requests",
      "Written explanations of what broke and why",
      "Tests that prevent the same bug returning",
      "A prioritised list of what else deserves attention",
    ],
    desc: [
      "Inherited code, unfamiliar frameworks and bugs you can't reproduce are my favourite kind of Tuesday. I'll find the cause, fix it properly and leave the code a little better than I found it.",
      "Every change comes with an explanation. You'll understand your own codebase better when I leave.",
    ],
    created: "2025-01-12",
  },

  /* ───────── DESIGN ───────── */
  {
    id: "s09", creator: "ananya", cat: "design", sub: "Brand identity",
    title: "A complete brand identity system, from mark to rulebook.",
    tagline: "Logo, type, colour and guidelines that hold from favicon to billboard.",
    tags: ["Logo", "Identity", "Guidelines", "Typography"],
    rating: 4.9, reviews: 118, projects: 211, queue: 3, art: ["blocks", 7],
    price: [24999, 54999, 119999], days: [7, 14, 28], rev: [2, 4, null],
    deliver: [
      ["3 logo concepts", "Primary logo with variations", "Colour palette and type pairing"],
      ["Full identity system with 5 applications", "Brand guidelines (24 pages)", "Social media kit", "Stationery suite"],
      ["Positioning workshop and naming review", "Complete guidelines (40+ pages)", "Motion principles", "Pitch-deck template", "Launch assets and 60-day support"],
    ],
    features: ["Logo suite", "Colour & type system", "Brand guidelines", "Social kit", "Stationery", "Positioning workshop"],
    tiers: [1, 4, 6],
    you: [
      "Primary logo and every variation you'll need",
      "A colour and typography system with usage rules",
      "A brand guidelines document your team can follow",
      "Organised source files and exports",
      "Rights to everything on final payment",
    ],
    desc: [
      "A brand isn't a logo, it's a set of decisions made consistently. I start with a positioning session, define what the identity needs to do, and design backwards from there. The mark is the last thing you'll see and the first thing people remember.",
      "I work with a small number of clients at a time. You'll deal with me directly at every stage — never an account manager.",
    ],
    created: "2023-07-19",
  },
  {
    id: "s10", creator: "ananya", cat: "design", sub: "Packaging",
    title: "Packaging and label design that survives the shelf.",
    tagline: "Structure, print specs and artwork, production-ready on the first pass.",
    tags: ["Packaging", "Labels", "Print", "Dielines"],
    rating: 4.9, reviews: 64, projects: 96, queue: 2, art: ["rings", 19],
    price: [13999, 29999, 64999], days: [6, 12, 24], rev: [2, 3, 5],
    deliver: [
      ["One SKU, one pack format", "Print-ready artwork with dielines", "Mock-up renders"],
      ["Up to 4 SKUs in a consistent system", "Print specification sheet", "Regulatory text layout", "Printer liaison"],
      ["Full range up to 12 SKUs", "Structural packaging consultation", "Unboxing experience design", "Production proofing and sign-off", "Launch photography brief"],
    ],
    features: ["Dielines", "Print-ready files", "Spec sheet", "Regulatory layout", "Printer liaison", "Unboxing design"],
    you: [
      "Print-ready artwork with correct bleeds and dielines",
      "Colour specifications for your printer",
      "A system that scales across your product range",
      "Realistic mock-ups for your site and pitch",
    ],
    desc: [
      "Packaging has to work at three metres, in thirty seconds and in a rush. I design for shelf impact first and detail second, then hand your printer files that won't come back with questions.",
      "I've worked on food, beauty, wellness and electronics, and I know where regulatory text will bite you.",
    ],
    created: "2024-02-10",
  },
  {
    id: "s11", creator: "tara", cat: "design", sub: "UI/UX",
    title: "Product UI/UX for web and mobile apps.",
    tagline: "Research-backed flows and pixel-considered interfaces, handed off clean.",
    tags: ["Figma", "UX", "Prototyping", "Web & mobile"],
    rating: 4.9, reviews: 92, projects: 138, queue: 4, art: ["grid", 52],
    price: [29999, 74999, 159999], days: [7, 18, 35], rev: [2, 3, 5],
    deliver: [
      ["Up to 5 screens, high fidelity", "Light and dark themes", "Clickable prototype"],
      ["Up to 15 screens plus empty and error states", "User-flow map", "Interactive prototype", "Developer handoff in Figma"],
      ["Up to 35 screens with responsive variants", "User research (5 interviews)", "Usability test and report", "Design tokens and component library", "Engineering support during build"],
    ],
    features: ["Clickable prototype", "Dev handoff", "Flow mapping", "Usability testing", "Component library", "Build support"],
    tiers: [1, 4, 6],
    you: [
      "High-fidelity screens in a well-organised Figma file",
      "Edge cases: empty, loading and error states",
      "A prototype you can test with real users",
      "Annotated handoff your engineers will thank you for",
    ],
    desc: [
      "I design for the moments users actually experience: first run, no data, bad connection, wrong password. Beautiful screens are the easy part. The flows between them are where products win or lose.",
      "I'll work with whatever you have — sketches, a PRD, or a competitor you want to beat — and we'll validate with users wherever the budget allows.",
    ],
    created: "2024-05-22",
  },
  {
    id: "s12", creator: "tara", cat: "design", sub: "Design systems",
    title: "A design system in Figma: tokens, components and docs.",
    tagline: "One source of truth between design and engineering.",
    tags: ["Design system", "Tokens", "Figma", "Documentation"],
    rating: 4.9, reviews: 31, projects: 24, queue: 2, art: ["blocks", 66],
    price: [39999, 89999, 179999], days: [10, 21, 40], rev: [2, 3, 4],
    deliver: [
      ["Foundations: colour, type, spacing, elevation", "Tokens exported as JSON", "Core components: buttons, inputs, tags"],
      ["Up to 40 components with variants", "Light and dark themes", "Usage documentation", "Accessibility annotations"],
      ["Full system up to 80 components", "Coded token pipeline (Style Dictionary)", "Storybook set-up with your engineers", "Contribution guidelines", "Team onboarding workshop"],
    ],
    features: ["Design tokens", "Component library", "Themes", "Accessibility notes", "Code tokens", "Team workshop"],
    you: [
      "A Figma library structured for scale",
      "Tokens that map directly to code",
      "Documentation that explains when to use what",
      "A contribution process so the system doesn't rot",
    ],
    desc: [
      "A design system is a product, not a file. I build it for two audiences — designers who need speed and engineers who need precision — and I document the decisions so the next person doesn't undo them.",
      "Expect clear naming, strict structure and components that behave the way the code will.",
    ],
    created: "2024-10-03",
  },

  /* ───────── VIDEO ───────── */
  {
    id: "s13", creator: "kabir", cat: "video", sub: "Short-form",
    title: "Short-form edits that hold attention past the first three seconds.",
    tagline: "Reels, Shorts and TikTok edits with captions, sound design and pace.",
    tags: ["Reels", "Shorts", "TikTok", "Captions"],
    rating: 4.8, reviews: 214, projects: 342, queue: 6, art: ["lines", 24],
    price: [2500, 7999, 18999], days: [2, 5, 10], rev: [1, 2, 4],
    deliver: [
      ["One edit up to 60 seconds", "Burned-in captions", "Royalty-free music"],
      ["Up to 5 edits up to 60 seconds each", "Sound design and transitions", "Hook variants for A/B testing", "Platform-specific exports"],
      ["Up to 12 edits per month", "Motion graphics and lower-thirds", "Thumbnail set", "Content calendar notes", "Priority turnaround"],
    ],
    features: ["Captions", "Sound design", "Hook variants", "Motion graphics", "Thumbnails", "Priority turnaround"],
    tiers: [1, 3, 6],
    you: [
      "Platform-ready vertical edits",
      "Captions styled to your brand",
      "Optional hook variants to test",
      "Project files on Advanced",
    ],
    desc: [
      "Attention is decided in the first three seconds, so that's where I spend the most time. Pattern interrupts, tight pacing and captions that read at a glance — every cut has to justify itself.",
      "I've edited for creators with a few thousand followers and brands running paid social at scale. Fast turnaround, clear communication and no surprise fees.",
    ],
    created: "2023-04-09",
  },
  {
    id: "s14", creator: "kabir", cat: "video", sub: "Long-form editing",
    title: "YouTube long-form editing with retention-minded pacing.",
    tagline: "From raw footage to polished upload, with captions, graphics and sound.",
    tags: ["YouTube", "Podcast", "Retention", "Colour"],
    rating: 4.8, reviews: 96, projects: 148, queue: 4, art: ["wave", 90],
    price: [5999, 14999, 34999], days: [3, 6, 12], rev: [1, 2, 3],
    deliver: [
      ["Edit up to 10 minutes", "Colour correction and audio clean-up", "Burned-in captions"],
      ["Edit up to 25 minutes", "Motion graphics and on-screen text", "Chapters and thumbnails", "Sound design"],
      ["Edit up to 60 minutes", "Cold open and narrative restructure", "B-roll sourcing", "Colour grade", "Project files and style guide"],
    ],
    features: ["Colour correction", "Captions", "Motion graphics", "Thumbnails", "Narrative restructure", "Project files"],
    you: [
      "A polished video, ready for upload",
      "Thumbnails and chapters if included",
      "Clean audio with levelled dialogue",
      "A reusable style guide for future episodes",
    ],
    desc: [
      "I watch your analytics before I cut. Where do viewers drop? Which moments get replayed? Then I edit for those patterns while keeping your voice intact.",
      "Whether it's a weekly show or a flagship launch video, you'll get a consistent look and a predictable turnaround.",
    ],
    created: "2023-11-27",
  },

  /* ───────── MARKETING ───────── */
  {
    id: "s15", creator: "zoya", cat: "marketing", sub: "SEO",
    title: "Technical SEO audit with a prioritised 90-day growth plan.",
    tagline: "Find the pages that should be ranking and the fixes that move them.",
    tags: ["Technical SEO", "Audit", "Search Console", "Content"],
    rating: 4.8, reviews: 61, projects: 102, queue: 3, art: ["scatter", 62],
    price: [11999, 26999, 59999], days: [5, 10, 20], rev: [1, 2, 3],
    deliver: [
      ["Crawl and indexation audit up to 500 pages", "Top 10 prioritised fixes", "30-minute walkthrough"],
      ["Full technical audit up to 5,000 pages", "Keyword gap and content plan", "Internal-linking map", "90-day roadmap"],
      ["Everything in Standard", "Programmatic SEO opportunity analysis", "Implementation support for 30 days", "Monthly reporting dashboard", "Competitor deep-dive"],
    ],
    features: ["Crawl audit", "Prioritised fixes", "Keyword gap", "Linking map", "90-day roadmap", "Implementation support"],
    you: [
      "A prioritised list of fixes with expected impact",
      "A keyword and content plan based on real gaps",
      "A 90-day roadmap with owners and timelines",
      "A walkthrough session to align your team",
    ],
    desc: [
      "I'll tell you which twenty percent of fixes will deliver eighty percent of the gain, and which advice from other agencies you can safely ignore. Audits are quantified, ranked and written for people who have to implement them.",
      "I report in revenue terms, not rankings alone.",
    ],
    created: "2024-03-14",
  },
  {
    id: "s16", creator: "isha", cat: "marketing", sub: "Email & lifecycle",
    title: "Launch and lifecycle email sequences that convert.",
    tagline: "Welcome, onboarding and launch emails written, structured and ready to send.",
    tags: ["Email", "Onboarding", "Lifecycle", "Launch"],
    rating: 4.9, reviews: 73, projects: 88, queue: 2, art: ["bars", 71],
    price: [7499, 17999, 39999], days: [4, 8, 16], rev: [1, 2, 3],
    deliver: [
      ["Sequence of 3 emails", "Subject-line variants", "Plain-text and HTML versions"],
      ["Sequence of 7 emails", "Segmentation recommendations", "Behaviour-based triggers", "Template build in your ESP"],
      ["Full lifecycle: welcome, onboarding, activation, win-back", "Up to 15 emails", "Testing roadmap", "Dashboard set-up", "30-day optimisation"],
    ],
    features: ["Subject variants", "Segmentation", "ESP build", "Behaviour triggers", "Testing roadmap", "Optimisation"],
    you: [
      "Written, structured sequences ready to load",
      "Templates built in your email platform",
      "A testing plan so you improve over time",
      "Guidance on segmentation and timing",
    ],
    desc: [
      "Good lifecycle email feels like a helpful colleague, not a campaign. I interview your customers, find the moments they need you and write the messages that arrive right then.",
      "Sequences are built in your ESP — Customer.io, Klaviyo, Mailchimp, Loops — so you can send tomorrow.",
    ],
    created: "2024-06-04",
  },
  {
    id: "s17", creator: "zoya", cat: "marketing", sub: "Paid acquisition",
    title: "Paid acquisition set-up for Meta and Google, tracked end to end.",
    tagline: "Accounts, creative briefs and measurement that tells the truth.",
    tags: ["Meta Ads", "Google Ads", "GA4", "Tracking"],
    rating: 4.7, reviews: 38, projects: 57, queue: 3, art: ["glyph", 84],
    price: [19999, 44999, 99999], days: [5, 10, 21], rev: [1, 2, 3],
    deliver: [
      ["One platform account set-up", "Conversion tracking and events", "Starter campaign structure"],
      ["Meta and Google set-up", "Creative briefs for 6 ads", "Server-side tracking", "Weekly report for 4 weeks"],
      ["Full-funnel structure", "Creative testing framework", "Attribution reconciliation", "Landing-page recommendations", "60-day management"],
    ],
    features: ["Conversion tracking", "Campaign structure", "Creative briefs", "Server-side tracking", "Weekly reporting", "Funnel strategy"],
    you: [
      "Clean accounts structured for learning",
      "Tracking you can trust in finance meetings",
      "Briefs your creative team can action",
      "Weekly reports tied to revenue",
    ],
    desc: [
      "Most ad accounts underperform because tracking is broken or structure fights the algorithm. I fix the foundation, then test creative and audiences in a disciplined order.",
      "I'll tell you when something isn't working and what it'll cost to find out why.",
    ],
    created: "2025-04-09",
  },

  /* ───────── WRITING ───────── */
  {
    id: "s18", creator: "isha", cat: "writing", sub: "Website copy",
    title: "SaaS website copy that explains what you do and why it matters.",
    tagline: "Homepage, pricing and product pages written from customer language.",
    tags: ["Homepage", "Messaging", "SaaS", "UX writing"],
    rating: 4.9, reviews: 79, projects: 124, queue: 3, art: ["glyph", 3],
    price: [14999, 34999, 74999], days: [5, 10, 18], rev: [1, 2, 3],
    deliver: [
      ["Homepage copy", "Meta titles and descriptions", "One round of tweaks"],
      ["Homepage, pricing and 3 product pages", "Customer interview synthesis", "Messaging hierarchy", "CTA testing ideas"],
      ["Full site up to 12 pages", "Brand voice guide", "Case-study templates", "Launch-day email copy", "Post-launch review"],
    ],
    features: ["Meta tags", "Customer interviews", "Messaging hierarchy", "Voice guide", "Case-study templates", "Post-launch review"],
    you: [
      "Copy ready to paste into your design",
      "A clear messaging hierarchy",
      "Voice guidelines to keep future writing consistent",
      "Test ideas for headline and CTA variants",
    ],
    desc: [
      "If visitors can't say what you do after five seconds, nothing else matters. I interview your customers, mine the phrases they use and shape them into pages that are clear first, clever second.",
      "I'll work with your designer and your developer so the copy fits the layout, not the other way around.",
    ],
    created: "2023-09-17",
  },
  {
    id: "s19", creator: "isha", cat: "writing", sub: "Ghostwriting",
    title: "Long-form thought leadership, ghostwritten in your voice.",
    tagline: "Essays and articles people actually finish reading.",
    tags: ["Ghostwriting", "Essays", "LinkedIn", "B2B"],
    rating: 4.9, reviews: 49, projects: 63, queue: 2, art: ["lines", 15],
    price: [8999, 22999, 49999], days: [5, 9, 16], rev: [1, 2, 3],
    deliver: [
      ["One article, 1,200 words", "Interview-based draft", "Headline options"],
      ["Three articles, 1,500 words each", "Editorial calendar", "LinkedIn adaptations", "SEO notes"],
      ["Six pieces up to 2,000 words", "Quarterly narrative strategy", "Distribution plan", "Founder voice guide", "Monthly review call"],
    ],
    features: ["Interview draft", "Headline options", "Editorial calendar", "LinkedIn adaptation", "Voice guide", "Distribution plan"],
    you: [
      "Finished pieces in your voice",
      "Social adaptations to promote them",
      "A calendar so you publish consistently",
      "A voice guide for future writers",
    ],
    desc: [
      "You have ideas worth sharing and no time to write them. We'll spend thirty minutes talking and I'll turn it into an essay that sounds like you on your best day.",
      "I fact-check everything, cite sources and refuse to pad.",
    ],
    created: "2024-01-23",
  },

  /* ───────── BUSINESS ───────── */
  {
    id: "s20", creator: "nisha", cat: "business", sub: "Pitch decks",
    title: "Investor-ready pitch deck and narrative.",
    tagline: "The story, the slides and the answers to questions you'll be asked.",
    tags: ["Pitch deck", "Fundraising", "Seed", "Series A"],
    rating: 5.0, reviews: 58, projects: 76, queue: 2, art: ["rings", 44],
    price: [27999, 59999, 119999], days: [7, 12, 21], rev: [2, 3, 4],
    deliver: [
      ["12-slide deck in your template", "Narrative outline", "One review call"],
      ["Custom-designed 15–18-slide deck", "Market-sizing slide with sources", "Investor Q&A prep", "Email blurb for outreach"],
      ["Full narrative and design", "Data-room checklist", "Financial slide integration", "Mock pitch with feedback", "30-day post-delivery edits"],
    ],
    features: ["Narrative outline", "Custom design", "Market sizing", "Q&A prep", "Data-room checklist", "Mock pitch"],
    you: [
      "A deck that tells one clear story",
      "Slides designed for reading and for presenting",
      "A list of the questions investors will ask",
      "Editable source in Keynote or PowerPoint",
    ],
    desc: [
      "I've read thousands of decks as an investor. The best ones are short, honest and make one argument. I'll find yours, structure it and design it so it travels without you in the room.",
      "Every number is traceable and every claim has a source. If your story has a gap, I'll tell you before an investor does.",
    ],
    created: "2024-04-02",
  },
  {
    id: "s21", creator: "nisha", cat: "business", sub: "Financial models",
    title: "Three-statement financial model built for fundraising.",
    tagline: "Clean, auditable and flexible enough to survive diligence.",
    tags: ["Financial model", "Excel", "Forecasting", "SaaS metrics"],
    rating: 5.0, reviews: 36, projects: 44, queue: 2, art: ["bars", 58],
    price: [21999, 49999, 99999], days: [6, 12, 20], rev: [2, 3, 4],
    deliver: [
      ["5-year summary model", "Assumptions sheet", "Revenue build"],
      ["Full three-statement model", "Scenario toggles", "Unit economics and cohort analysis", "Investor-ready outputs"],
      ["Everything in Standard", "Cap-table and dilution", "Use-of-funds and runway analysis", "Model audit and walkthrough", "Diligence support"],
    ],
    features: ["Revenue build", "Three statements", "Scenarios", "Unit economics", "Cap table", "Model audit"],
    you: [
      "A model with clear inputs, calculations and outputs",
      "Scenario toggles you can change in a meeting",
      "Documentation of every assumption",
      "A walkthrough so you can defend each number",
    ],
    desc: [
      "A good model is a thinking tool first and a document second. I build with strict structure — inputs on one sheet, calculations on another, outputs clean — so any investor's analyst can trust it in ten minutes.",
      "I'll push on assumptions that look hopeful and help you set ranges you can defend.",
    ],
    created: "2024-07-13",
  },

  /* ───────── MUSIC ───────── */
  {
    id: "s22", creator: "vikram", cat: "music", sub: "Original scoring",
    title: "Original scoring for ads, films and games.",
    tagline: "Cinematic, electronic and Indian classical palettes, delivered with stems.",
    tags: ["Scoring", "Film", "Games", "Brand film"],
    rating: 4.9, reviews: 47, projects: 62, queue: 3, art: ["wave", 77],
    price: [14999, 39999, 89999], days: [7, 14, 28], rev: [2, 3, 5],
    deliver: [
      ["One original cue up to 60 seconds", "Stereo master (WAV)", "MP3 preview"],
      ["Up to 3 cues up to 90 seconds each", "Stems and alternate mixes", "Cue sheet", "Sync licence"],
      ["Full score up to 15 minutes", "Live instrument recording", "Adaptive layers for games", "Mix, master and delivery", "Full buyout licence"],
    ],
    features: ["WAV master", "Stems", "Cue sheet", "Live instruments", "Adaptive layers", "Buyout licence"],
    you: [
      "Original music composed for your project",
      "Mastered files and individual stems",
      "Cue sheets and licensing paperwork",
      "Alternate cut-downs where included",
    ],
    desc: [
      "I score to picture. That means hitting cuts, holding silences and supporting the performance rather than competing with it. I work in cinematic, electronic and Hindustani classical palettes — sometimes in the same piece.",
      "You'll hear a sketch before full production, so we agree direction early.",
    ],
    created: "2023-10-08",
  },
  {
    id: "s23", creator: "vikram", cat: "music", sub: "Mixing & mastering",
    title: "Mixing and mastering for independent artists.",
    tagline: "Radio-ready sound that translates from earbuds to club systems.",
    tags: ["Mixing", "Mastering", "Stems", "Release-ready"],
    rating: 4.9, reviews: 102, projects: 187, queue: 4, art: ["bars", 36],
    price: [3499, 8999, 19999], days: [2, 4, 8], rev: [1, 2, 3],
    deliver: [
      ["Mastering of one track", "WAV and MP3 deliverables", "Loudness for streaming"],
      ["Mix and master of one track up to 32 stems", "Vocal tuning and tight editing", "Reference comparison", "Two revision rounds"],
      ["EP or album package up to 5 tracks", "Mix, master and sequencing", "Alternate versions (instrumental, TV)", "DDP for distribution", "Priority turnaround"],
    ],
    features: ["WAV deliverables", "Streaming loudness", "Vocal tuning", "Reference matching", "Alternate versions", "Priority turnaround"],
    you: [
      "A mix that translates across systems",
      "Mastered files ready for distribution",
      "Instrumental and clean versions where included",
      "Notes on anything worth fixing at source",
    ],
    desc: [
      "I mix for emotion, then for polish. Your reference tracks tell me what you want; your stems tell me how to get there.",
      "Mastering is done on calibrated monitors and checked on phones, cars and laptops before it leaves my studio.",
    ],
    created: "2023-12-02",
  },

  /* ───────── CONSULTING ───────── */
  {
    id: "s24", creator: "samir", cat: "consulting", sub: "Go-to-market",
    title: "A two-week go-to-market strategy sprint.",
    tagline: "Customers, channel, message and a first-week task list.",
    tags: ["GTM", "ICP", "Positioning", "Sales"],
    rating: 4.8, reviews: 24, projects: 41, queue: 2, art: ["wire", 12],
    price: [44999, 94999, 189999], days: [10, 14, 21], rev: [1, 2, 3],
    deliver: [
      ["Ideal-customer definition", "Channel shortlist", "Two working sessions"],
      ["Everything in Starter", "10 customer interviews", "Positioning and messaging pack", "90-day plan"],
      ["Everything in Standard", "Sales playbook and scripts", "Pipeline model and targets", "Weekly advisory for 8 weeks", "Hiring plan for first sales hire"],
    ],
    features: ["ICP definition", "Channel shortlist", "Customer interviews", "Messaging pack", "Sales playbook", "Weekly advisory"],
    tiers: [2, 4, 6],
    you: [
      "A clear picture of who to sell to first",
      "Messaging tested with real buyers",
      "A prioritised 90-day plan",
      "A first-week task list you can start on Monday",
    ],
    desc: [
      "Most early-stage companies don't need more activity, they need a sharper target. We'll find the segment where you win, the channel where they pay attention and the message that gets a reply.",
      "I've sold software for twelve years and I'll tell you what works, what doesn't and what you should stop doing.",
    ],
    created: "2024-09-16",
  },
  {
    id: "s25", creator: "samir", cat: "consulting", sub: "Pricing",
    title: "Pricing and packaging teardown with an action plan.",
    tagline: "Stop guessing. Evidence-based pricing for software teams.",
    tags: ["Pricing", "Packaging", "SaaS", "Monetisation"],
    rating: 4.8, reviews: 19, projects: 30, queue: 1, art: ["dots", 95],
    price: [9999, 24999, 54999], days: [4, 8, 14], rev: [1, 2, 3],
    deliver: [
      ["Review of current pricing page and plans", "Competitor price map", "Top 5 recommendations"],
      ["Willingness-to-pay survey design", "Tier and metric redesign", "Experiment plan", "Readout call"],
      ["Everything in Standard", "Customer-interview programme", "Pricing model in Excel", "Launch and communication plan", "60-day review"],
    ],
    features: ["Pricing audit", "Competitor map", "Tier redesign", "WTP survey", "Pricing model", "60-day review"],
    you: [
      "A diagnosis of where pricing leaks value",
      "A redesigned tier structure with rationale",
      "An experiment plan to validate changes",
      "Communication guidance for existing customers",
    ],
    desc: [
      "Pricing is the highest-leverage lever most teams touch once a year. I'll tell you what your price signals, who it excludes and what you could safely test next quarter.",
      "Output is a short written recommendation and a model you can play with.",
    ],
    created: "2025-05-27",
  },

  /* ───────── DATA ───────── */
  {
    id: "s26", creator: "arjun", cat: "data", sub: "Dashboards",
    title: "Interactive analytics dashboards your team will open daily.",
    tagline: "Metabase, Looker Studio or Superset, built on definitions you can trust.",
    tags: ["Dashboards", "Metabase", "Looker Studio", "SQL"],
    rating: 4.8, reviews: 34, projects: 58, queue: 3, art: ["scatter", 29],
    price: [17999, 39999, 89999], days: [5, 10, 21], rev: [1, 2, 3],
    deliver: [
      ["One dashboard with up to 8 charts", "Metric definitions", "Connected to one data source"],
      ["Up to 3 dashboards", "Up to 3 data sources joined", "Scheduled email reports", "Team training session"],
      ["Executive and operational dashboards", "Metric layer with tests", "Row-level permissions", "Alerting on key thresholds", "60-day support"],
    ],
    features: ["Metric definitions", "Multiple sources", "Scheduled reports", "Training", "Metric layer", "Alerting"],
    tiers: [1, 3, 6],
    you: [
      "Dashboards built on clear, documented definitions",
      "Access for your team with the right permissions",
      "Scheduled reports landing in the right inboxes",
      "A short training for people who'll use it",
    ],
    desc: [
      "Dashboards fail when nobody trusts the numbers. I start with definitions — what is an active user, what counts as revenue — and build from there so a chart means the same thing in every meeting.",
      "You'll get a tool people open because it's faster than asking someone.",
    ],
    created: "2024-12-09",
  },
  {
    id: "s27", creator: "arjun", cat: "data", sub: "Data engineering",
    title: "ETL pipelines and warehouse modelling with dbt.",
    tagline: "One source of truth, built with tests and documentation.",
    tags: ["dbt", "BigQuery", "Airflow", "ETL"],
    rating: 4.8, reviews: 21, projects: 28, queue: 2, art: ["lines", 53],
    price: [29999, 69999, 149999], days: [7, 15, 30], rev: [1, 2, 3],
    deliver: [
      ["Pipeline for one source into your warehouse", "Staging models in dbt", "Basic tests and docs"],
      ["Up to 5 sources", "Dimensional model (facts and dimensions)", "Orchestration with Airflow or Dagster", "Data-quality tests"],
      ["Full warehouse build", "Slowly changing dimensions and snapshots", "CI for dbt on pull requests", "Cost optimisation", "Team onboarding and 60-day support"],
    ],
    features: ["Staging models", "Dimensional model", "Orchestration", "Data-quality tests", "CI for dbt", "Cost optimisation"],
    you: [
      "A warehouse with a clear, documented structure",
      "Pipelines that fail loudly, not silently",
      "dbt project with tests and docs site",
      "Handover training for your analysts",
    ],
    desc: [
      "A warehouse is only valuable if people can find what they need and trust it. I design from the questions backwards, build with tests on every layer and document as I go.",
      "You'll own the code, the infrastructure and the knowledge to extend it.",
    ],
    created: "2025-01-30",
  },

  /* ───────── 3D & MOTION ───────── */
  {
    id: "s28", creator: "elena", cat: "3d-motion", sub: "Product renders",
    title: "Photoreal 3D product renders and turntables.",
    tagline: "Launch visuals before the first unit ships.",
    tags: ["Product render", "Turntable", "Blender", "Octane"],
    rating: 4.9, reviews: 56, projects: 118, queue: 3, art: ["wire", 63],
    price: [11999, 29999, 69999], days: [4, 8, 16], rev: [2, 3, 4],
    deliver: [
      ["3 still renders at 4K", "Neutral studio set-up", "Transparent PNG versions"],
      ["6 stills and one 360° turntable", "Custom environment", "Colourway variations", "Retouching"],
      ["Hero animation up to 20 seconds", "10 stills across scenes", "Exploded-view animation", "GLB for web viewers", "Project files"],
    ],
    features: ["4K stills", "Turntable", "Custom environment", "Colourways", "Exploded view", "Project files"],
    you: [
      "Photoreal renders in your required sizes",
      "Transparent versions for flexible layout",
      "Colourways for each variant you sell",
      "Optional web-ready 3D for your product page",
    ],
    desc: [
      "I model from your CAD or reference photos and light the product like a studio photographer would — only without the logistics or the reshoots.",
      "Clients use my work for pre-orders, crowdfunding, marketplaces and retail decks.",
    ],
    created: "2023-06-28",
  },
  {
    id: "s29", creator: "elena", cat: "3d-motion", sub: "Motion identity",
    title: "Motion identity: logo animation and kinetic type.",
    tagline: "Make your brand move with intent. Delivered as video, Lottie and code-ready assets.",
    tags: ["Logo animation", "Kinetic type", "After Effects", "Lottie"],
    rating: 4.9, reviews: 43, projects: 82, queue: 2, art: ["blocks", 45],
    price: [7999, 19999, 44999], days: [3, 7, 14], rev: [2, 3, 4],
    deliver: [
      ["One logo animation up to 6 seconds", "MP4 and transparent WebM", "Sound-design sting"],
      ["Logo animation plus 3 lower-thirds", "Lottie JSON for web and app", "Intro and outro bumpers", "Colour variants"],
      ["Motion identity system", "Principles document and easing guide", "Social template set", "After Effects project files", "Team handoff session"],
    ],
    features: ["Logo animation", "Sound sting", "Lottie JSON", "Lower-thirds", "Principles document", "Source files"],
    you: [
      "Animated logo in every format you need",
      "Lottie files for product and web",
      "Templates your team can reuse",
      "A short guide to timing and easing",
    ],
    desc: [
      "Motion carries personality in a way static design can't. I'll define how your brand moves — quick or measured, soft or snappy — and apply it consistently across every touchpoint.",
      "All assets are optimised for performance, so they're a joy on the web and light on the phone.",
    ],
    created: "2024-04-26",
  },
  {
    id: "s30", creator: "elena", cat: "3d-motion", sub: "Abstract loops",
    title: "Abstract 3D loops for web hero sections and social.",
    tagline: "Seamless, lightweight and distinctive. Made to sit behind your headline.",
    tags: ["Loops", "Abstract", "Hero", "WebGL"],
    rating: 4.8, reviews: 67, projects: 134, queue: 2, art: ["rings", 101],
    price: [4999, 11999, 27999], days: [2, 5, 10], rev: [1, 2, 3],
    deliver: [
      ["One 8-second loop at 1080p", "MP4 and WebM", "Poster frame"],
      ["Three loops in a coherent set", "4K delivery", "Optimised under 2 MB each", "Light and dark variants"],
      ["Six loops plus interactive GLB scene", "Custom shader look-dev", "Source files", "Implementation guidance", "Priority turnaround"],
    ],
    features: ["MP4 and WebM", "4K delivery", "Under 2 MB", "Light/dark variants", "GLB scene", "Source files"],
    tiers: [1, 4, 6],
    you: [
      "Seamless loops that don't stutter",
      "Web-optimised file sizes",
      "Variants for light and dark themes",
      "Poster frames for first paint",
    ],
    desc: [
      "A good hero background is felt more than noticed. I design abstract loops that match your palette, stay under a sensible file size and loop so smoothly nobody sees the seam.",
      "I'll give you advice on implementation too — autoplay behaviour, reduced-motion fallbacks and caching.",
    ],
    created: "2024-08-14",
  },
];

export function defaultsFor(cat: CategorySlug): CatDefaults {
  return DEFAULTS[cat];
}

export const SERVICES: Service[] = RAW.map(make);

export const SERVICE_MAP = Object.fromEntries(SERVICES.map((s) => [s.id, s])) as Record<string, Service>;

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function startingPrice(s: Service): number {
  return Math.min(...s.packages.map((p) => p.price));
}

export function fastestDays(s: Service): number {
  return Math.min(...s.packages.map((p) => p.days));
}

export function slowestDays(s: Service): number {
  return Math.max(...s.packages.map((p) => p.days));
}

export function servicesByCreator(creatorId: string): Service[] {
  return SERVICES.filter((s) => s.creatorId === creatorId);
}

export function similarServices(service: Service, limit = 3): Service[] {
  return SERVICES.filter((s) => s.id !== service.id && s.category === service.category && s.creatorId !== service.creatorId)
    .concat(SERVICES.filter((s) => s.id !== service.id && s.category !== service.category))
    .slice(0, limit);
}

/* ───────── checkout pricing (shared by the client and /api/checkout) ───────── */

export const EXTRAS = [
  { id: "express", label: "Express delivery", body: "Delivered in ~60% of the time", pct: 0.25 },
  { id: "source", label: "Source files", body: "Editable working files at handover", pct: 0.15 },
] as const;

export const FEE_PCT = 0.05;

export function quote(s: Service, tier: 1 | 2 | 3, extras: string[]) {
  const pkg = s.packages[tier - 1];
  const lines = EXTRAS.filter((e) => extras.includes(e.id)).map((e) => ({ id: e.id, label: e.label, amount: Math.round(pkg.price * e.pct) }));
  const subtotal = pkg.price + lines.reduce((n, l) => n + l.amount, 0);
  const fee = Math.round(subtotal * FEE_PCT);
  const days = extras.includes("express") ? Math.max(1, Math.ceil(pkg.days * 0.6)) : pkg.days;
  return { pkg, lines, subtotal, fee, total: subtotal + fee, days };
}
