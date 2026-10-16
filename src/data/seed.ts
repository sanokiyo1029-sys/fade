import type { Activity, Conversation, FileItem, Message, Milestone, Notification, Order, OrderStatus, User } from "@/lib/types";
import { SERVICE_MAP } from "./services";

const H = 3600_000;
const D = 24 * H;

export function demoUser(email = "rohan@fade.demo", provider: User["provider"] = "email"): User {
  return {
    id: "rohan",
    name: "Rohan Mehta",
    username: "rohan",
    email,
    headline: "Automation architect — workflows, agents and LLM pipelines",
    bio: "I design and ship automation systems for teams that are drowning in manual work. Seven years in, I've moved from stitching Zaps together to building agent pipelines that route leads, answer support tickets and reconcile finance data without a human in the loop.\n\nMy approach is boring on purpose: map the process, remove steps, then automate what's left. Every build ships with logging, alerts and a runbook your team can actually read.",
    city: "Bengaluru",
    country: "India",
    languages: ["English", "Hindi", "Kannada"],
    skills: ["Make", "n8n", "Python", "OpenAI API", "LangChain", "Supabase", "Webhooks", "Zapier"],
    roles: ["buyer", "seller"],
    isDemo: true,
    provider,
    createdAt: Date.now() - 400 * D,
  };
}

let seq = 0;
const id = (p: string) => `${p}${++seq}`;

function act(ts: number, actor: string, text: string): Activity {
  return { id: id("a"), ts, actor, text };
}

function file(name: string, size: number, kind: FileItem["kind"], by: FileItem["by"], ts: number, final?: boolean): FileItem {
  return { id: id("f"), name, size, kind, by, ts, final };
}

function milestones(price: number, titles: string[], now: number, due: number[], doneCount: number): Milestone[] {
  const split = [0.2, 0.3, 0.3, 0.2];
  return titles.map((t, i) => ({
    id: id("m"),
    title: t,
    amount: Math.round(price * (split[i] ?? 0.25)),
    due: now + due[i] * D,
    done: i < doneCount,
  }));
}

interface OrderInit {
  id: string;
  serviceId: string;
  tier: 1 | 2 | 3;
  buyer: string;
  seller: string;
  status: OrderStatus;
  createdDaysAgo: number;
  dueInDays: number;
  brief: string;
  extras?: string[];
  revisionsUsed?: number;
  doneMilestones: number;
  files: FileItem[];
  activity: Activity[];
  reviewed?: boolean;
  actors: { buyer: string; seller: string };
}

function order(now: number, o: OrderInit): Order {
  const svc = SERVICE_MAP[o.serviceId];
  const pkg = svc.packages[o.tier - 1];
  const price = pkg.price;
  const fee = Math.round(price * 0.05);
  const createdAt = now - o.createdDaysAgo * D;
  const paid = o.status !== "requested" && o.status !== "cancelled";
  const stageTimes: Order["stageTimes"] = { requested: createdAt };
  const flow: OrderStatus[] = ["requested", "confirmed", "in_progress", "review", "delivered", "completed"];
  const idx = flow.indexOf(o.status);
  flow.slice(1, idx + 1).forEach((s, i) => {
    stageTimes[s] = createdAt + ((i + 1) / (idx + 1)) * (now - createdAt - 2 * H);
  });
  return {
    id: o.id,
    serviceId: o.serviceId,
    tier: o.tier,
    buyerId: o.buyer,
    sellerId: o.seller,
    status: o.status,
    createdAt,
    deadline: now + o.dueInDays * D,
    price,
    fee,
    brief: o.brief,
    extras: o.extras ?? [],
    milestones: milestones(
      price,
      svc.process.map((p) => p.title),
      now,
      [-6, -2, o.dueInDays - 1, o.dueInDays],
      o.doneMilestones,
    ),
    files: o.files,
    revisionsUsed: o.revisionsUsed ?? 0,
    revisionsTotal: pkg.revisions,
    payment: { status: o.status === "completed" ? "released" : paid ? "escrow" : "pending", method: "UPI · rohan@okbank" },
    activity: o.activity,
    stageTimes,
    reviewed: o.reviewed,
  };
}

function msg(from: Message["from"], text: string, ts: number, extra: Partial<Message> = {}): Message {
  return { id: id("m"), from, kind: "text", text, ts, ...extra };
}

export interface SeedData {
  user: User;
  orders: Order[];
  conversations: Conversation[];
  notifications: Notification[];
  savedServices: string[];
  savedCreators: string[];
}

export function buildSeed(email?: string, provider: User["provider"] = "email"): SeedData {
  seq = 0;
  const now = Date.now();
  const me = "rohan";

  /* ───────── orders where the user is buying ───────── */
  const buyer: Order[] = [
    order(now, {
      id: "00291", serviceId: "s09", tier: 2, buyer: me, seller: "ananya", status: "in_progress",
      createdDaysAgo: 9, dueInDays: 4, doneMilestones: 2, revisionsUsed: 1,
      brief: "We're rebranding our consultancy, Parallel Systems — industrial, calm, technical. We want a mark that works at 16px and on a hoarding. References: Braun, Teenage Engineering, early Stripe. Please avoid gradients and any 'tech blue'.",
      extras: ["Source files"],
      files: [
        file("Parallel-brief.pdf", 1_240_000, "pdf", "buyer", now - 9 * D),
        file("Direction-board-v2.pdf", 4_200_000, "pdf", "seller", now - 3 * D),
        file("Logo-round-2-exploration.zip", 18_400_000, "archive", "seller", now - 1 * D),
      ],
      activity: [
        act(now - 9 * D, "Rohan Mehta", "Placed order and paid ₹57,749 into escrow"),
        act(now - 9 * D + 2 * H, "Ananya Iyer", "Confirmed the order and shared a kickoff questionnaire"),
        act(now - 7 * D, "Ananya Iyer", "Started work · Discovery milestone"),
        act(now - 6 * D, "Ananya Iyer", "Completed milestone 01 · Discovery"),
        act(now - 3 * D, "Ananya Iyer", "Shared direction boards (v2) for review"),
        act(now - 2 * D, "Rohan Mehta", "Requested a revision: tighten the mark's geometry"),
        act(now - 1 * D, "Ananya Iyer", "Uploaded Logo-round-2-exploration.zip"),
      ],
      actors: { buyer: "Rohan Mehta", seller: "Ananya Iyer" },
    }),
    order(now, {
      id: "00284", serviceId: "s13", tier: 2, buyer: me, seller: "kabir", status: "review",
      createdDaysAgo: 6, dueInDays: 1, doneMilestones: 3,
      brief: "Five 45-second cuts from our demo day footage for LinkedIn and Reels. Burned-in captions, our logo end-card, and two hook variants for the first two edits.",
      files: [
        file("demo-day-raw.mov", 480_000_000, "video", "buyer", now - 6 * D),
        file("Cut-01-hookA.mp4", 38_000_000, "video", "seller", now - 5 * 3600_000),
      ],
      activity: [
        act(now - 6 * D, "Rohan Mehta", "Placed order and paid ₹8,399 into escrow"),
        act(now - 6 * D + 3 * H, "Kabir Sethi", "Confirmed the order"),
        act(now - 5 * D, "Kabir Sethi", "Started work"),
        act(now - 5 * H, "Kabir Sethi", "Submitted drafts for review (5 cuts)"),
      ],
      actors: { buyer: "Rohan Mehta", seller: "Kabir Sethi" },
    }),
    order(now, {
      id: "00266", serviceId: "s05", tier: 2, buyer: me, seller: "meera", status: "delivered",
      createdDaysAgo: 29, dueInDays: -1, doneMilestones: 4, revisionsUsed: 2,
      brief: "Client portal for our automation projects: login, project status timeline, invoice downloads and a webhook inbox. Postgres + Next.js, Stripe for invoices.",
      files: [
        file("portal-spec.md", 14_000, "doc", "buyer", now - 29 * D),
        file("portal-final-source.zip", 62_000_000, "archive", "seller", now - 2 * 3600_000, true),
        file("deploy-runbook.pdf", 820_000, "pdf", "seller", now - 2 * 3600_000, true),
      ],
      activity: [
        act(now - 29 * D, "Rohan Mehta", "Placed order and paid ₹94,499 into escrow"),
        act(now - 28 * D, "Meera Nair", "Confirmed the order"),
        act(now - 8 * D, "Rohan Mehta", "Requested a revision: invoice table pagination"),
        act(now - 3 * D, "Meera Nair", "Submitted final build for review"),
        act(now - 1 * D, "Rohan Mehta", "Approved the work"),
        act(now - 2 * H, "Meera Nair", "Delivered final files"),
      ],
      actors: { buyer: "Rohan Mehta", seller: "Meera Nair" },
    }),
    order(now, {
      id: "00298", serviceId: "s28", tier: 1, buyer: me, seller: "elena", status: "requested",
      createdDaysAgo: 1, dueInDays: 8, doneMilestones: 0,
      brief: "Three 4K stills of our new field sensor — matte black housing with a single copper pin. Neutral studio, soft shadow, transparent PNGs.",
      files: [file("sensor-v4.step", 8_800_000, "other", "buyer", now - 1 * D)],
      activity: [act(now - 1 * D, "Rohan Mehta", "Sent a project request")],
      actors: { buyer: "Rohan Mehta", seller: "Elena Vogt" },
    }),
    order(now, {
      id: "00231", serviceId: "s18", tier: 1, buyer: me, seller: "isha", status: "completed",
      createdDaysAgo: 48, dueInDays: -40, doneMilestones: 4, reviewed: true,
      brief: "Homepage copy for fade-automations.in — clear, calm, with proof.",
      files: [file("homepage-copy-final.docx", 92_000, "doc", "seller", now - 41 * D, true)],
      activity: [
        act(now - 48 * D, "Rohan Mehta", "Placed order and paid ₹15,749 into escrow"),
        act(now - 41 * D, "Isha Kapoor", "Delivered final copy"),
        act(now - 40 * D, "Rohan Mehta", "Released payment · order complete"),
      ],
      actors: { buyer: "Rohan Mehta", seller: "Isha Kapoor" },
    }),
    order(now, {
      id: "00209", serviceId: "s22", tier: 1, buyer: me, seller: "vikram", status: "completed",
      createdDaysAgo: 70, dueInDays: -60, doneMilestones: 4, reviewed: false,
      brief: "A 45-second sonic logo and bed for our product video.",
      files: [file("sonic-logo-master.wav", 21_000_000, "audio", "seller", now - 62 * D, true)],
      activity: [
        act(now - 70 * D, "Rohan Mehta", "Placed order and paid ₹15,749 into escrow"),
        act(now - 62 * D, "Vikram Joshi", "Delivered final files"),
        act(now - 60 * D, "Rohan Mehta", "Released payment · order complete"),
      ],
      actors: { buyer: "Rohan Mehta", seller: "Vikram Joshi" },
    }),
  ];

  /* ───────── orders where the user is selling ───────── */
  const seller: Order[] = [
    order(now, {
      id: "00288", serviceId: "s01", tier: 3, buyer: "cl2", seller: me, status: "in_progress",
      createdDaysAgo: 7, dueInDays: 6, doneMilestones: 1,
      brief: "Sales ops are drowning in manual enrichment. We want inbound leads from our webinar platform scored, enriched via Clearbit and routed to the right AE in HubSpot, with Slack alerts when a score crosses 80.",
      files: [file("lead-routing-rules.xlsx", 210_000, "doc", "buyer", now - 7 * D), file("hubspot-fields.csv", 44_000, "doc", "buyer", now - 6 * D)],
      activity: [
        act(now - 7 * D, "Marcus Hale", "Placed order and paid ₹31,499 into escrow"),
        act(now - 7 * D + H, "Rohan Mehta", "Confirmed the order"),
        act(now - 5 * D, "Rohan Mehta", "Completed milestone 01 · Scoping call"),
      ],
      actors: { buyer: "Marcus Hale", seller: "Rohan Mehta" },
    }),
    order(now, {
      id: "00295", serviceId: "s02", tier: 2, buyer: "cl5", seller: me, status: "requested",
      createdDaysAgo: 0.1, dueInDays: 10, doneMilestones: 0,
      brief: "We run a telehealth service and want a support agent that answers from our help centre (about 300 articles), escalates to a nurse coordinator and never gives medical advice.",
      files: [file("help-centre-export.zip", 14_000_000, "archive", "buyer", now - 3 * H)],
      activity: [act(now - 3 * H, "Hana Park", "Sent a project request")],
      actors: { buyer: "Hana Park", seller: "Rohan Mehta" },
    }),
    order(now, {
      id: "00279", serviceId: "s01", tier: 2, buyer: "cl1", seller: me, status: "review",
      createdDaysAgo: 12, dueInDays: 2, doneMilestones: 3,
      brief: "Automate our proposal pipeline: Typeform → Notion → PDF → DocuSign → Slack.",
      files: [file("proposal-flow-demo.mp4", 52_000_000, "video", "seller", now - 6 * H)],
      activity: [
        act(now - 12 * D, "Priya Nambiar", "Placed order and paid ₹13,649 into escrow"),
        act(now - 6 * H, "Rohan Mehta", "Submitted automation for review"),
      ],
      actors: { buyer: "Priya Nambiar", seller: "Rohan Mehta" },
    }),
    order(now, {
      id: "00262", serviceId: "s02", tier: 3, buyer: "cl4", seller: me, status: "delivered",
      createdDaysAgo: 24, dueInDays: -1, doneMilestones: 4,
      brief: "Support agent for a lending app, tool calling for balance lookups and payment reschedules.",
      files: [file("agent-handover.zip", 31_000_000, "archive", "seller", now - 20 * H, true)],
      activity: [
        act(now - 24 * D, "Aditya Kulkarni", "Placed order and paid ₹83,999 into escrow"),
        act(now - 20 * H, "Rohan Mehta", "Delivered final files"),
      ],
      actors: { buyer: "Aditya Kulkarni", seller: "Rohan Mehta" },
    }),
    order(now, {
      id: "00244", serviceId: "s01", tier: 1, buyer: "cl3", seller: me, status: "completed",
      createdDaysAgo: 41, dueInDays: -35, doneMilestones: 4,
      brief: "Auto-sync Shopify orders to our accounting tool.",
      files: [file("runbook.pdf", 600_000, "pdf", "seller", now - 36 * D, true)],
      activity: [
        act(now - 41 * D, "Sofia Ricci", "Placed order and paid ₹5,249 into escrow"),
        act(now - 35 * D, "Sofia Ricci", "Released payment · order complete"),
      ],
      actors: { buyer: "Sofia Ricci", seller: "Rohan Mehta" },
    }),
    order(now, {
      id: "00217", serviceId: "s02", tier: 1, buyer: "cl6", seller: me, status: "completed",
      createdDaysAgo: 66, dueInDays: -60, doneMilestones: 4,
      brief: "Support agent over our docs for a small SaaS.",
      files: [],
      activity: [
        act(now - 66 * D, "Jonas Weber", "Placed order and paid ₹15,749 into escrow"),
        act(now - 60 * D, "Jonas Weber", "Released payment · order complete"),
      ],
      actors: { buyer: "Jonas Weber", seller: "Rohan Mehta" },
    }),
  ];

  /* ───────── conversations ───────── */
  const conv = (c: Omit<Conversation, "id"> & { id: string }): Conversation => c;
  const sys = (text: string, ts: number, meta: Record<string, string>, kind: Message["kind"] = "order"): Message => ({
    id: id("m"), from: "system", kind, text, ts, meta,
  });

  const conversations: Conversation[] = [
    conv({
      id: "c1", role: "buyer", partyId: "ananya", orderId: "00291", serviceId: "s09", unread: 1,
      messages: [
        sys("Order placed", now - 9 * D, { order: "00291", status: "REQUESTED", amount: "₹54,999" }),
        sys("Payment held in escrow", now - 9 * D + 600_000, { amount: "₹57,749", state: "ESCROW" }, "payment"),
        msg("them", "Hi Rohan — thanks for the brief. The Braun/TE references are very clear. I'll send a short questionnaire so we can nail positioning before I draw anything.", now - 9 * D + 2 * H),
        msg("me", "Perfect. Filled it in. One note: the mark has to survive a 16px favicon and a one-colour stamp.", now - 8 * D),
        msg("them", "Noted — I'll test every direction at 16px first. Direction boards will land Thursday.", now - 8 * D + H),
        msg("them", "Direction boards v2 attached. Direction B is my recommendation.", now - 3 * D, {
          kind: "file",
          attachments: [{ id: id("at"), name: "Direction-board-v2.pdf", size: 4_200_000, kind: "pdf" }],
        }),
        msg("me", "B is the one. Can we tighten the geometry on the second letterform?", now - 2 * D),
        msg("them", "Round two is up. I squared the counters and moved to a 2px optical grid.", now - 1 * D, {
          kind: "file",
          attachments: [{ id: id("at"), name: "Logo-round-2-exploration.zip", size: 18_400_000, kind: "archive" }],
        }),
        msg("them", "Let me know once you've had a look — happy to jump on a 15-min call if easier.", now - 3 * H),
      ],
    }),
    conv({
      id: "c2", role: "buyer", partyId: "kabir", orderId: "00284", serviceId: "s13", unread: 2,
      messages: [
        sys("Order placed", now - 6 * D, { order: "00284", status: "REQUESTED", amount: "₹7,999" }),
        msg("me", "Raw footage is in the shared drive — 38 mins from demo day. Hooks A and B for the first two edits please.", now - 6 * D + 600_000),
        msg("them", "Got it. Starting tonight — I'll send the first cut inside 48 hours.", now - 6 * D + 3 * H),
        msg("them", "First cut is up for review. Hook A is stronger on retention, in my opinion.", now - 5 * H, {
          kind: "file",
          attachments: [{ id: id("at"), name: "Cut-01-hookA.mp4", size: 38_000_000, kind: "video" }],
        }),
        msg("them", "Captions are burned in, end-card matches your logo files.", now - 5 * H + 120_000),
      ],
    }),
    conv({
      id: "c3", role: "buyer", partyId: "meera", orderId: "00266", serviceId: "s05", unread: 0,
      messages: [
        sys("Order placed", now - 29 * D, { order: "00266", status: "REQUESTED", amount: "₹89,999" }),
        msg("them", "Final build is deployed to production. Runbook and source are attached.", now - 2 * H, {
          kind: "file",
          attachments: [
            { id: id("at"), name: "portal-final-source.zip", size: 62_000_000, kind: "archive" },
            { id: id("at"), name: "deploy-runbook.pdf", size: 820_000, kind: "pdf" },
          ],
        }),
        msg("me", "Looks great. Doing a last pass before I release payment.", now - 90 * 60_000),
      ],
    }),
    conv({
      id: "c4", role: "buyer", partyId: "elena", orderId: "00298", serviceId: "s28", unread: 0,
      messages: [
        msg("me", "Hi Elena — we need three stills of a matte-black field sensor. STEP file attached. Can you take it on before 20 Oct?", now - 1 * D),
        sys("Project request sent", now - 1 * D + 60_000, { order: "00298", status: "REQUESTED", amount: "₹11,999" }),
        msg("them", "Thanks for reaching out! The model looks clean. I have a slot opening on the 13th — I'll confirm the request this evening.", now - 20 * H),
      ],
    }),
    conv({
      id: "c5", role: "seller", partyId: "cl2", orderId: "00288", serviceId: "s01", unread: 2,
      messages: [
        sys("Order placed", now - 7 * D, { order: "00288", status: "REQUESTED", amount: "₹29,999" }),
        sys("Payment held in escrow", now - 7 * D + 120_000, { amount: "₹31,499", state: "ESCROW" }, "payment"),
        msg("me", "Hi Marcus — thanks for the order. Before I start, I'll need admin access to HubSpot and API keys for Clearbit and Slack.", now - 7 * D + H),
        msg("them", "Done on HubSpot — sending the rest through our vault. Scoring rules are in the spreadsheet.", now - 6 * D),
        msg("me", "Rules look sound. I'd weight webinar attendance more heavily than registration — can I propose a tweak?", now - 4 * D),
        msg("them", "Please do. Also, can alerts go to #sales-hot as well as the AE's DM?", now - 5 * H),
        msg("them", "Sharing the Slack webhook now.", now - 4 * H),
      ],
    }),
    conv({
      id: "c6", role: "seller", partyId: "cl5", orderId: "00295", serviceId: "s02", unread: 1,
      messages: [
        msg("them", "Hi Rohan — we're a telehealth team looking for a support agent that never gives medical advice and escalates clinical questions. Is that something you've done?", now - 4 * H),
        sys("Project request received", now - 3 * H, { order: "00295", status: "REQUESTED", amount: "₹34,999" }),
        msg("them", "We've sent over the help centre export. Happy to jump on a call.", now - 3 * H + 120_000),
      ],
    }),
    conv({
      id: "c7", role: "seller", partyId: "cl1", orderId: "00279", serviceId: "s01", unread: 0,
      messages: [
        msg("me", "The proposal flow is ready for review — recording attached. Every step logs to a Notion database.", now - 6 * H, {
          kind: "file",
          attachments: [{ id: id("at"), name: "proposal-flow-demo.mp4", size: 52_000_000, kind: "video" }],
        }),
        msg("them", "Watching now — this is exactly what we needed. Will confirm tomorrow morning.", now - 4 * H),
      ],
    }),
  ];

  /* ───────── notifications ───────── */
  const n = (x: Omit<Notification, "id">): Notification => ({ id: id("n"), ...x });
  const notifications: Notification[] = [
    n({ type: "message", title: "Ananya sent a message", body: "Let me know once you've had a look — happy to jump on a 15-min call if easier.", ts: now - 3 * H, read: false, href: "/messages?c=c1", mode: "buyer" }),
    n({ type: "update", title: "Order 00284 moved to REVIEW", body: "Kabir submitted 5 draft cuts. Review and request changes or approve.", ts: now - 5 * H, read: false, href: "/orders/00284", mode: "buyer" }),
    n({ type: "deadline", title: "Order 00291 is due in 4 days", body: "Brand identity · Ananya Iyer. Check milestone 03 to stay on schedule.", ts: now - 8 * H, read: false, href: "/orders/00291", mode: "buyer", important: true }),
    n({ type: "delivery", title: "Final files delivered for 00266", body: "Meera delivered portal-final-source.zip and the runbook.", ts: now - 2 * H, read: false, href: "/orders/00266", mode: "buyer" }),
    n({ type: "payment", title: "₹57,749 held in escrow", body: "Funds for order 00291 are secured and released only when you approve.", ts: now - 9 * D, read: true, href: "/dashboard/payments", mode: "buyer" }),
    n({ type: "availability", title: "Elena is now open for new projects", body: "You saved Elena Vogt. Next slot: 13 OCT.", ts: now - 1 * D, read: true, href: "/creator/elena", mode: "buyer" }),
    n({ type: "review", title: "Leave a review for Vikram", body: "Order 00209 is complete. Tell others what it was like.", ts: now - 2 * D, read: false, href: "/dashboard/reviews", mode: "buyer" }),
    n({ type: "order", title: "New project request", body: "Hana Park · AI support agent (Standard) · ₹34,999", ts: now - 3 * H, read: false, href: "/orders/00295", mode: "seller", important: true }),
    n({ type: "message", title: "Marcus Hale sent a message", body: "Sharing the Slack webhook now.", ts: now - 4 * H, read: false, href: "/messages?c=c5", mode: "seller" }),
    n({ type: "payment", title: "₹31,499 secured for order 00288", body: "Payment is held in escrow and will release on completion.", ts: now - 7 * D, read: true, href: "/seller/earnings", mode: "seller" }),
    n({ type: "deadline", title: "Order 00279 is due in 2 days", body: "Priya Nambiar is reviewing the proposal workflow.", ts: now - 6 * H, read: false, href: "/orders/00279", mode: "seller", important: true }),
    n({ type: "review", title: "New 5.0 review from Jonas Weber", body: "“Support agent answers from our docs and escalates properly.”", ts: now - 2 * D, read: false, href: "/seller/reviews", mode: "seller" }),
    n({ type: "delivery", title: "Order 00262 awaits client acceptance", body: "Aditya Kulkarni has 72 hours to approve and release payment.", ts: now - 20 * H, read: true, href: "/orders/00262", mode: "seller" }),
    n({ type: "update", title: "Revision requested on 00291", body: "Your account is also a buyer on this order.", ts: now - 2 * D, read: true, href: "/orders/00291", mode: "both" }),
  ];

  return {
    user: demoUser(email, provider),
    orders: [...buyer, ...seller],
    conversations,
    notifications,
    savedServices: ["s11", "s26", "s29", "s24"],
    savedCreators: ["tara", "nisha", "arjun", "elena"],
  };
}
