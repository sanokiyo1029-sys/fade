import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildSeed } from "@/data/seed";
import { SERVICE_MAP, defaultsFor } from "@/data/services";
import { resolveParty } from "@/lib/resolve";
import type {
  Attachment,
  AvailabilityStatus,
  Conversation,
  FileItem,
  Message,
  Mode,
  Notification,
  Order,
  OrderStatus,
  PortfolioProject,
  Review,
  Service,
  ServiceDraft,
  ServiceStatus,
  User,
} from "@/lib/types";
import { money } from "@/lib/format";
import { getBlob } from "@/lib/blobs";
import { slugify, uid } from "@/lib/utils";
import { toast } from "./ui";

export type OrderAction =
  | "accept"
  | "decline"
  | "cancel"
  | "start"
  | "submit"
  | "revise"
  | "approve"
  | "release";

export interface Prefs {
  emailOrders: boolean;
  emailMessages: boolean;
  push: boolean;
  marketing: boolean;
  twoFactor: boolean;
}

interface AppState {
  ready: boolean;
  activeConv: string | null;

  user: User | null;
  mode: Mode;
  orders: Order[];
  conversations: Conversation[];
  notifications: Notification[];
  savedServices: string[];
  savedCreators: string[];
  writtenReviews: Review[];
  replies: Record<string, string>;
  userServices: Service[];
  serviceStatus: Record<string, ServiceStatus>;
  portfolio: PortfolioProject[];
  availability: AvailabilityStatus;
  draft: ServiceDraft | null;
  orderSeq: number;
  prefs: Prefs;

  /* auth */
  signInDemo: (email?: string, provider?: User["provider"]) => void;
  signUp: (input: { name: string; email: string; provider?: User["provider"] }) => void;
  completeOnboarding: (input: Partial<User> & { roles: Mode[] }) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
  setMode: (m: Mode) => void;
  setPrefs: (p: Partial<Prefs>) => void;

  /* saving */
  toggleSavedService: (id: string) => boolean;
  toggleSavedCreator: (id: string) => boolean;

  /* notifications */
  notify: (n: Omit<Notification, "id" | "ts" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;

  /* messaging */
  setActiveConv: (id: string | null) => void;
  startConversation: (partyId: string, role: Mode, serviceId?: string) => string;
  sendMessage: (convId: string, text: string, attachments?: Attachment[]) => void;

  /* orders */
  createOrder: (input: { serviceId: string; tier: 1 | 2 | 3; brief: string; extras: string[]; price: number; days: number; method: string }) => string;
  orderAction: (orderId: string, action: OrderAction) => void;
  toggleMilestone: (orderId: string, milestoneId: string) => void;
  addOrderFile: (orderId: string, file: Omit<FileItem, "id" | "ts" | "by">) => void;

  /* reviews */
  addReview: (orderId: string, r: { quality: number; communication: number; delivery: number; text: string }) => void;
  replyToReview: (reviewId: string, text: string) => void;

  /* seller */
  setDraft: (patch: Partial<ServiceDraft>) => void;
  clearDraft: () => void;
  publishService: (d: ServiceDraft) => Service;
  setServiceStatus: (id: string, status: ServiceStatus) => void;
  deleteService: (id: string) => void;
  addProject: (p: Omit<PortfolioProject, "id" | "creatorId">) => void;
  removeProject: (id: string) => void;
  setAvailability: (a: AvailabilityStatus) => void;
}

const EMPTY = {
  user: null as User | null,
  mode: "buyer" as Mode,
  orders: [] as Order[],
  conversations: [] as Conversation[],
  notifications: [] as Notification[],
  savedServices: [] as string[],
  savedCreators: [] as string[],
  writtenReviews: [] as Review[],
  replies: {} as Record<string, string>,
  userServices: [] as Service[],
  serviceStatus: {} as Record<string, ServiceStatus>,
  portfolio: [] as PortfolioProject[],
  availability: "open" as AvailabilityStatus,
  draft: null as ServiceDraft | null,
  orderSeq: 300,
  prefs: { emailOrders: true, emailMessages: true, push: true, marketing: false, twoFactor: false } as Prefs,
};

export const STAGES: OrderStatus[] = ["requested", "confirmed", "in_progress", "review", "delivered", "completed"];

const REPLIES_FROM_CREATOR = [
  "Thanks — got it. I'll pick this up first thing and update you within the day.",
  "Understood. That's a small change, I'll fold it into the next round.",
  "Appreciate the clarity. I've added it to the brief and will send progress shortly.",
  "Great, thank you! I'll confirm timings and come back to you shortly.",
];
const REPLIES_FROM_CLIENT = [
  "Thanks, that works for us.",
  "Perfect — please go ahead. Let us know if you need anything else from our side.",
  "Appreciated. Could you share a rough ETA for the next milestone?",
];

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const patchOrder = (id: string, fn: (o: Order) => Order) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? fn(o) : o)) }));

      const pushSystem = (orderId: string, text: string, meta: Record<string, string>, kind: Message["kind"] = "order") => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.orderId === orderId
              ? { ...c, messages: [...c.messages, { id: uid("m"), from: "system", kind, text, ts: Date.now(), meta }] }
              : c,
          ),
        }));
      };

      return {
        ...EMPTY,
        ready: false,
        activeConv: null,

        /* ───────── auth ───────── */
        signInDemo: (email, provider = "email") => {
          const seed = buildSeed(email, provider);
          set({
            ...EMPTY,
            ...seed,
            mode: "buyer",
            userServices: get().user?.isDemo ? get().userServices : [],
            portfolio: [],
          });
        },
        signUp: ({ name, email, provider = "email" }) => {
          const base = slugify(name.split(" ")[0] || email.split("@")[0]).replace(/-/g, "") || "creator";
          set({
            ...EMPTY,
            user: {
              id: uid("u"),
              name,
              username: `${base}${Math.floor(Math.random() * 90 + 10)}`,
              email,
              headline: "",
              bio: "",
              city: "",
              country: "India",
              languages: ["English"],
              skills: [],
              roles: ["buyer"],
              isDemo: false,
              provider,
              createdAt: Date.now(),
            },
          });
        },
        completeOnboarding: (input) => {
          const u = get().user;
          if (!u) return;
          const { roles, ...rest } = input;
          set({
            user: { ...u, ...rest, roles },
            mode: roles.length === 1 ? roles[0] : "buyer",
          });
          get().notify({
            type: "update",
            title: "Welcome to FADE",
            body: roles.includes("seller") ? "Publish your first service to start receiving project requests." : "Save creators you like and start a project when you're ready.",
            href: roles.includes("seller") ? "/seller/services/new" : "/explore",
            mode: "both",
          });
        },
        signOut: () => set({ ...EMPTY }),
        updateProfile: (patch) => {
          const u = get().user;
          if (u) set({ user: { ...u, ...patch } });
        },
        setMode: (m) => {
          const u = get().user;
          if (u && !u.roles.includes(m)) set({ user: { ...u, roles: [...u.roles, m] } });
          set({ mode: m });
        },
        setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),

        /* ───────── saving ───────── */
        toggleSavedService: (id) => {
          const on = !get().savedServices.includes(id);
          set((s) => ({ savedServices: on ? [id, ...s.savedServices] : s.savedServices.filter((x) => x !== id) }));
          return on;
        },
        toggleSavedCreator: (id) => {
          const on = !get().savedCreators.includes(id);
          set((s) => ({ savedCreators: on ? [id, ...s.savedCreators] : s.savedCreators.filter((x) => x !== id) }));
          return on;
        },

        /* ───────── notifications ───────── */
        notify: (n) => set((s) => ({ notifications: [{ ...n, id: uid("n"), ts: Date.now(), read: false }, ...s.notifications] })),
        markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
        markAllRead: () => {
          const mode = get().mode;
          set((s) => ({ notifications: s.notifications.map((n) => (n.mode === mode || n.mode === "both" ? { ...n, read: true } : n)) }));
        },

        /* ───────── messaging ───────── */
        setActiveConv: (id) => {
          set((s) => ({
            activeConv: id,
            conversations: id ? s.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) : s.conversations,
          }));
        },
        startConversation: (partyId, role, serviceId) => {
          const existing = get().conversations.find((c) => c.partyId === partyId && c.role === role);
          if (existing) return existing.id;
          const id = uid("c");
          set((s) => ({ conversations: [{ id, role, partyId, serviceId, messages: [], unread: 0 }, ...s.conversations] }));
          return id;
        },
        sendMessage: (convId, text, attachments = []) => {
          const kind: Message["kind"] = attachments.length ? (attachments.every((a) => a.kind === "image") ? "image" : "file") : "text";
          const m: Message = { id: uid("m"), from: "me", kind, text: text || undefined, attachments: attachments.length ? attachments : undefined, ts: Date.now() };
          set((s) => ({
            conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, m] } : c)),
          }));
          // simulated counterpart — in production this is Supabase Realtime
          const conv = get().conversations.find((c) => c.id === convId);
          if (!conv) return;
          const pool = conv.role === "buyer" ? REPLIES_FROM_CREATOR : REPLIES_FROM_CLIENT;
          const reply = attachments.length ? "Received the files, thanks — taking a look now." : pool[conv.messages.length % pool.length];
          setTimeout(() => {
            set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? { ...c, typing: true } : c)) }));
          }, 700);
          setTimeout(() => {
            const active = get().activeConv === convId;
            set((s) => ({
              conversations: s.conversations.map((c) =>
                c.id === convId
                  ? { ...c, typing: false, unread: active ? 0 : c.unread + 1, messages: [...c.messages, { id: uid("m"), from: "them", kind: "text", text: reply, ts: Date.now() }] }
                  : c,
              ),
            }));
            if (!active) {
              const p = resolveParty(conv.partyId, get().user);
              get().notify({ type: "message", title: `${p.name} replied`, body: reply, href: `/messages?c=${convId}`, mode: conv.role });
            }
          }, 2200 + Math.random() * 1400);
        },

        /* ───────── orders ───────── */
        createOrder: ({ serviceId, tier, brief, extras, price, days, method }) => {
          const s = get();
          const user = s.user!;
          const svc = SERVICE_MAP[serviceId] ?? s.userServices.find((x) => x.id === serviceId)!;
          const pkg = svc.packages[tier - 1];
          const seq = s.orderSeq + 1;
          const id = String(seq).padStart(5, "0");
          const now = Date.now();
          const fee = Math.round(price * 0.05);
          const split = [0.2, 0.3, 0.3, 0.2];
          const order: Order = {
            id,
            serviceId,
            tier,
            buyerId: user.id,
            sellerId: svc.creatorId,
            status: "requested",
            createdAt: now,
            deadline: now + days * 86400000,
            price,
            fee,
            brief,
            extras,
            milestones: svc.process.map((p, i) => ({
              id: uid("ms"),
              title: p.title,
              amount: Math.round(price * (split[i] ?? 0.25)),
              due: now + Math.round(((i + 1) / svc.process.length) * days) * 86400000,
              done: false,
            })),
            files: [],
            revisionsUsed: 0,
            revisionsTotal: pkg.revisions,
            payment: { status: "escrow", method },
            activity: [{ id: uid("a"), ts: now, actor: user.name, text: `Placed order and paid ${money(price + fee)} into escrow` }],
            stageTimes: { requested: now },
          };
          const convId = get().startConversation(svc.creatorId, "buyer", serviceId);
          set((st) => ({
            orderSeq: seq,
            orders: [order, ...st.orders],
            conversations: st.conversations.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    orderId: id,
                    serviceId,
                    messages: [
                      ...c.messages,
                      { id: uid("m"), from: "system", kind: "order", text: "Order placed", ts: now, meta: { order: id, status: "REQUESTED", amount: money(price) } },
                      { id: uid("m"), from: "system", kind: "payment", text: "Payment held in escrow", ts: now + 1, meta: { amount: money(price + fee), state: "ESCROW" } },
                      ...(brief ? [{ id: uid("m"), from: "me" as const, kind: "text" as const, text: brief, ts: now + 2 }] : []),
                    ],
                  }
                : c,
            ),
          }));
          get().notify({ type: "payment", title: `${money(price + fee)} held in escrow`, body: `Order ${id} · funds release only when you approve the work.`, href: `/orders/${id}`, mode: "buyer" });

          // the creator confirms a few seconds later (simulated)
          const creator = resolveParty(svc.creatorId, user);
          if (svc.creatorId !== user.id) {
            setTimeout(() => {
              const o = get().orders.find((x) => x.id === id);
              if (!o || o.status !== "requested") return;
              get().orderAction(id, "accept");
              set((st) => ({
                conversations: st.conversations.map((c) =>
                  c.id === convId
                    ? { ...c, unread: get().activeConv === convId ? 0 : c.unread + 1, messages: [...c.messages, { id: uid("m"), from: "them", kind: "text", text: `Thanks ${user.name.split(" ")[0]} — order confirmed. I'll start on the first milestone and share progress here.`, ts: Date.now() }] }
                    : c,
                ),
              }));
              toast(`${creator.name} confirmed order ${id}`, "Work is scheduled to begin.", "success");
            }, 7000);
          }
          return id;
        },

        orderAction: (orderId, action) => {
          const o = get().orders.find((x) => x.id === orderId);
          const user = get().user;
          if (!o || !user) return;
          const now = Date.now();
          const buyer = resolveParty(o.buyerId, user).name;
          const seller = resolveParty(o.sellerId, user).name;
          const svc = SERVICE_MAP[o.serviceId] ?? get().userServices.find((x) => x.id === o.serviceId);
          const title = svc?.title ?? "your order";
          const step = (status: OrderStatus, actor: string, text: string, extra: Partial<Order> = {}) =>
            patchOrder(orderId, (x) => ({
              ...x,
              ...extra,
              status,
              stageTimes: { ...x.stageTimes, [status]: now },
              activity: [...x.activity, { id: uid("a"), ts: now, actor, text }],
            }));

          switch (action) {
            case "accept":
              step("confirmed", seller, "Confirmed the order", { payment: { ...o.payment, status: "escrow" } });
              pushSystem(orderId, "Order confirmed", { order: orderId, status: "CONFIRMED", amount: money(o.price) });
              get().notify({ type: "update", title: `Order ${orderId} confirmed`, body: `${seller} accepted · ${title}`, href: `/orders/${orderId}`, mode: o.buyerId === user.id ? "buyer" : "seller" });
              break;
            case "decline":
            case "cancel":
              step("cancelled", action === "decline" ? seller : buyer, action === "decline" ? "Declined the request · funds refunded" : "Cancelled the request · funds refunded", {
                payment: { ...o.payment, status: "refunded" },
              });
              pushSystem(orderId, "Order cancelled", { order: orderId, status: "CANCELLED", amount: money(o.price) });
              toast(`Order ${orderId} cancelled`, "Escrowed funds were returned to the buyer.");
              break;
            case "start":
              step("in_progress", seller, "Started work");
              pushSystem(orderId, "Work started", { order: orderId, status: "IN PROGRESS", amount: money(o.price) });
              toast("Work started", `Order ${orderId} is now in progress.`, "success");
              break;
            case "submit":
              step("review", seller, "Submitted work for review");
              pushSystem(orderId, "Submitted for review", { order: orderId, status: "REVIEW", amount: money(o.price) });
              toast("Submitted for review", "The client has been notified.", "success");
              break;
            case "revise":
              if (o.revisionsTotal !== null && o.revisionsUsed >= o.revisionsTotal) {
                toast("No revisions left", "Contact the creator to add a revision round.", "error");
                return;
              }
              step("in_progress", buyer, `Requested revision ${o.revisionsUsed + 1}${o.revisionsTotal !== null ? ` of ${o.revisionsTotal}` : ""}`, { revisionsUsed: o.revisionsUsed + 1 });
              pushSystem(orderId, "Revision requested", { order: orderId, status: "IN PROGRESS", amount: money(o.price) });
              toast("Revision requested", `${seller} will pick it up shortly.`);
              break;
            case "approve":
              step("delivered", buyer, "Approved the work · final files unlocked", {
                files: o.files.map((f) => (f.by === "seller" ? { ...f, final: true } : f)),
                milestones: o.milestones.map((m) => ({ ...m, done: true })),
              });
              pushSystem(orderId, "Work approved", { order: orderId, status: "DELIVERED", amount: money(o.price) });
              toast("Work approved", "Release payment once you've downloaded the final files.", "success");
              break;
            case "release":
              step("completed", buyer, `Released ${money(o.price)} to ${seller} · order complete`, { payment: { ...o.payment, status: "released" } });
              pushSystem(orderId, "Payment released", { amount: money(o.price), state: "RELEASED" }, "payment");
              get().notify({ type: "payment", title: `${money(o.price)} released`, body: `Order ${orderId} is complete.`, href: `/orders/${orderId}`, mode: o.buyerId === user.id ? "buyer" : "seller" });
              toast("Order complete", "Payment released. Leave a review while it's fresh.", "success");
              break;
          }
        },

        toggleMilestone: (orderId, milestoneId) => {
          const user = get().user;
          patchOrder(orderId, (o) => {
            const m = o.milestones.find((x) => x.id === milestoneId);
            if (!m) return o;
            return {
              ...o,
              milestones: o.milestones.map((x) => (x.id === milestoneId ? { ...x, done: !x.done } : x)),
              activity: [...o.activity, { id: uid("a"), ts: Date.now(), actor: user?.name ?? "", text: `${m.done ? "Reopened" : "Completed"} milestone · ${m.title}` }],
            };
          });
        },

        addOrderFile: (orderId, file) => {
          const user = get().user;
          patchOrder(orderId, (o) => {
            const by = o.buyerId === user?.id && get().mode === "buyer" ? "buyer" : "seller";
            return {
              ...o,
              files: [...o.files, { ...file, id: uid("f"), ts: Date.now(), by }],
              activity: [...o.activity, { id: uid("a"), ts: Date.now(), actor: user?.name ?? "", text: `Uploaded ${file.name}` }],
            };
          });
        },

        /* ───────── reviews ───────── */
        addReview: (orderId, r) => {
          const o = get().orders.find((x) => x.id === orderId);
          const user = get().user;
          if (!o || !user) return;
          const rating = Math.round(((r.quality + r.communication + r.delivery) / 3) * 10) / 10;
          const review: Review = {
            id: uid("rv"),
            serviceId: o.serviceId,
            creatorId: o.sellerId,
            author: user.name,
            country: user.country || "India",
            rating,
            quality: r.quality,
            communication: r.communication,
            delivery: r.delivery,
            text: r.text,
            date: new Date().toISOString().slice(0, 10),
            project: SERVICE_MAP[o.serviceId]?.subcategory,
          };
          set((s) => ({ writtenReviews: [review, ...s.writtenReviews], orders: s.orders.map((x) => (x.id === orderId ? { ...x, reviewed: true } : x)) }));
          toast("Review published", "Thanks — it now appears on the service page.", "success");
        },
        replyToReview: (reviewId, text) => {
          set((s) => ({ replies: { ...s.replies, [reviewId]: text } }));
          toast("Reply posted");
        },

        /* ───────── seller ───────── */
        setDraft: (patch) => {
          const d = get().draft ?? newDraft();
          set({ draft: { ...d, ...patch, savedAt: Date.now() } });
        },
        clearDraft: () => set({ draft: null }),
        publishService: (d) => {
          const user = get().user!;
          const cat = (d.category || "design") as Service["category"];
          const defs = defaultsFor(cat);
          const names = ["STARTER", "STANDARD", "ADVANCED"] as const;
          const support = ["Email · 48 hr reply", "Chat · 24 hr reply", "Priority channel · 4 hr reply"];
          const service: Service = {
            id: uid("s"),
            slug: `${slugify(d.title).split("-").slice(0, 6).join("-")}-${Math.random().toString(36).slice(2, 6)}`,
            creatorId: user.id,
            category: cat,
            subcategory: d.subcategory || "General",
            title: d.title,
            tagline: d.tagline,
            description: d.description.split(/\n{2,}/).filter(Boolean),
            tags: d.tags,
            rating: 0,
            reviewCount: 0,
            projects: 0,
            packages: d.packages.map((p, i) => ({
              tier: (i + 1) as 1 | 2 | 3,
              name: names[i],
              price: Number(p.price) || 0,
              days: Number(p.days) || 1,
              revisions: p.revisions === "∞" || p.revisions === "" ? null : Number(p.revisions),
              support: support[i],
              deliverables: p.deliverables.split("\n").map((x) => x.trim()).filter(Boolean),
              featureCount: [1, 3, 4][i],
            })) as Service["packages"],
            features: ["Commercial licence", "Source files", "Priority delivery", "Extended support"],
            whatYouGet: d.packages[2].deliverables.split("\n").map((x) => x.trim()).filter(Boolean),
            process: defs.process,
            requirements: d.requirements.length ? d.requirements : defs.requirements,
            faq: d.faq.length ? d.faq : defs.faq,
            art: { variant: d.cover, seed: d.coverSeed },
            media: d.media.map((m) => getBlob(m.id)).filter((u): u is string => !!u),
            createdAt: new Date().toISOString().slice(0, 10),
            queue: 0,
            status: "active",
            views: 0,
          };
          set((s) => ({ userServices: [service, ...s.userServices], draft: null }));
          if (!user.roles.includes("seller")) set({ user: { ...user, roles: [...user.roles, "seller"] } });
          return service;
        },
        setServiceStatus: (id, status) => {
          set((s) => ({
            serviceStatus: { ...s.serviceStatus, [id]: status },
            userServices: s.userServices.map((x) => (x.id === id ? { ...x, status } : x)),
          }));
        },
        deleteService: (id) => set((s) => ({ userServices: s.userServices.filter((x) => x.id !== id) })),
        addProject: (p) => {
          const user = get().user;
          if (!user) return;
          set((s) => ({ portfolio: [{ ...p, id: uid("p"), creatorId: user.id }, ...s.portfolio] }));
        },
        removeProject: (id) => set((s) => ({ portfolio: s.portfolio.filter((p) => p.id !== id) })),
        setAvailability: (a) => {
          set({ availability: a });
          toast(`Availability set to ${a.toUpperCase()}`, a === "open" ? "You'll appear in “Available now” filters." : undefined);
        },
      };
    },
    {
      name: "fade-app",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ready, activeConv, ...rest } = s;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function"));
      },
    },
  ),
);

export function newDraft(): ServiceDraft {
  return {
    title: "",
    category: "",
    subcategory: "",
    tags: [],
    tagline: "",
    description: "",
    packages: [
      { name: "STARTER", price: "4999", days: "3", revisions: "1", deliverables: "" },
      { name: "STANDARD", price: "12999", days: "7", revisions: "3", deliverables: "" },
      { name: "ADVANCED", price: "29999", days: "14", revisions: "∞", deliverables: "" },
    ],
    cover: "dots",
    coverSeed: Math.floor(Math.random() * 900) + 100,
    media: [],
    requirements: [],
    faq: [],
    step: 0,
  };
}
