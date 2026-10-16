/**
 * Domain types. These mirror supabase/schema.sql one-to-one so the mock
 * data layer can be swapped for Postgres without touching components.
 */

export type ArtVariant =
  | "dots"
  | "lines"
  | "rings"
  | "grid"
  | "bars"
  | "blocks"
  | "wire"
  | "wave"
  | "scatter"
  | "glyph";

export interface ArtSpec {
  variant: ArtVariant;
  seed: number;
}

export type CategorySlug =
  | "ai-automation"
  | "programming"
  | "design"
  | "video"
  | "marketing"
  | "writing"
  | "business"
  | "music"
  | "consulting"
  | "data"
  | "3d-motion";

export interface Category {
  slug: CategorySlug;
  name: string;
  short: string;
  blurb: string;
  art: ArtSpec;
  subcategories: string[];
}

/** 1 = Emerging · 2 = Established · 3 = Elite */
export type SellerLevel = 1 | 2 | 3;
export type AvailabilityStatus = "open" | "limited" | "booked";

export interface Creator {
  id: string;
  username: string;
  name: string;
  headline: string;
  bio: string[];
  city: string;
  country: string;
  timezone: string;
  languages: string[];
  skills: string[];
  level: SellerLevel;
  verified: boolean;
  responseTime: string;
  availability: AvailabilityStatus;
  nextSlot: string; // ISO date
  /** next 8 weeks: 0 = open, 1 = limited, 2 = booked */
  weeks: (0 | 1 | 2)[];
  stats: {
    projects: number;
    clients: number;
    repeatPct: number;
    rating: number;
    onTimePct: number;
  };
  joined: number;
  experienceYears: number;
  clients: string[];
  online: boolean;
  primaryCategory: CategorySlug;
}

export interface Pkg {
  tier: 1 | 2 | 3;
  name: "STARTER" | "STANDARD" | "ADVANCED";
  price: number;
  days: number;
  /** null = unlimited */
  revisions: number | null;
  support: string;
  deliverables: string[];
  /** how many of the service's comparison features are included */
  featureCount: number;
}

export interface ProcessStep {
  title: string;
  body: string;
  days: string;
}

export interface Faq {
  q: string;
  a: string;
}

export type ServiceStatus = "active" | "paused" | "draft";

export interface Service {
  id: string;
  slug: string;
  creatorId: string;
  category: CategorySlug;
  subcategory: string;
  title: string;
  tagline: string;
  description: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  projects: number;
  packages: [Pkg, Pkg, Pkg];
  features: string[];
  whatYouGet: string[];
  process: ProcessStep[];
  requirements: string[];
  faq: Faq[];
  art: ArtSpec;
  /** uploaded cover images (object URLs, session only) */
  media?: string[];
  createdAt: string;
  queue: number;
  status: ServiceStatus;
  views?: number;
}

export interface PortfolioProject {
  id: string;
  creatorId: string;
  title: string;
  discipline: string;
  year: number;
  summary: string;
  result: string;
  tags: string[];
  client?: string;
  art: ArtSpec;
}

export interface Review {
  id: string;
  serviceId?: string;
  creatorId: string;
  author: string;
  country: string;
  rating: number;
  quality: number;
  communication: number;
  delivery: number;
  text: string;
  date: string; // ISO
  project?: string;
  reply?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  country: string;
}

/* ───────── user-scoped ───────── */

export type Mode = "buyer" | "seller";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  languages: string[];
  skills: string[];
  roles: Mode[];
  isDemo: boolean;
  provider: "email" | "google";
  createdAt: number;
}

export type OrderStatus =
  | "requested"
  | "confirmed"
  | "in_progress"
  | "review"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "escrow" | "released" | "refunded";

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  due: number;
  done: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  kind: "image" | "pdf" | "archive" | "doc" | "video" | "audio" | "other";
  by: "buyer" | "seller";
  ts: number;
  final?: boolean;
}

export interface Activity {
  id: string;
  ts: number;
  actor: string;
  text: string;
}

export interface Order {
  id: string; // 5 digits
  serviceId: string;
  tier: 1 | 2 | 3;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  createdAt: number;
  deadline: number;
  price: number;
  fee: number;
  brief: string;
  extras: string[];
  milestones: Milestone[];
  files: FileItem[];
  revisionsUsed: number;
  revisionsTotal: number | null;
  payment: { status: PaymentStatus; method: string };
  activity: Activity[];
  stageTimes: Partial<Record<OrderStatus, number>>;
  reviewed?: boolean;
}

export type MessageKind = "text" | "file" | "image" | "order" | "payment" | "system";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  kind: FileItem["kind"];
}

export interface Message {
  id: string;
  from: "me" | "them" | "system";
  kind: MessageKind;
  text?: string;
  attachments?: Attachment[];
  ts: number;
  meta?: Record<string, string>;
}

export interface Conversation {
  id: string;
  /** which side of the marketplace the *user* is on in this thread */
  role: Mode;
  /** creator id or client id */
  partyId: string;
  orderId?: string;
  serviceId?: string;
  messages: Message[];
  unread: number;
  typing?: boolean;
  lastSeen?: string;
}

export type NotificationType =
  | "message"
  | "order"
  | "update"
  | "payment"
  | "review"
  | "deadline"
  | "delivery"
  | "availability";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  ts: number;
  read: boolean;
  href: string;
  mode: Mode | "both";
  important?: boolean;
}

export interface ServiceDraft {
  title: string;
  category: CategorySlug | "";
  subcategory: string;
  tags: string[];
  tagline: string;
  description: string;
  packages: { name: string; price: string; days: string; revisions: string; deliverables: string }[];
  cover: ArtVariant;
  coverSeed: number;
  media: { id: string; name: string }[];
  requirements: string[];
  faq: Faq[];
  step: number;
  savedAt?: number;
}
