"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, BadgeCheck, Bookmark, Check, Minus } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { Artwork, Cover } from "@/components/brand/Artwork";
import { Button, ButtonLink, Chip, EmptyState, Field, Modal, Segmented, StarInput, Stars, StatusDot, TabBar, Textarea } from "@/components/ui";
import { CATEGORY_MAP } from "@/data/categories";
import { CREATOR_MAP } from "@/data/creators";
import { fastestDays, startingPrice } from "@/data/services";
import { ratingBreakdown } from "@/data/reviews";
import { STAGES, useApp } from "@/store/app";
import { useCreator, useService } from "@/store/hooks";
import { toast } from "@/store/ui";
import { resolveParty } from "@/lib/resolve";
import { dateShort, delivery, levelName, money, orderNo, timeLeft } from "@/lib/format";
import type { ArtVariant, AvailabilityStatus, Creator, Order, OrderStatus, Review, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ───────── status vocabulary ───────── */

export const STATUS_LABEL: Record<OrderStatus, string> = {
  requested: "REQUESTED",
  confirmed: "CONFIRMED",
  in_progress: "IN PROGRESS",
  review: "IN REVIEW",
  delivered: "DELIVERED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === "review" ? "signal" : status === "completed" ? "hollow" : status === "cancelled" ? "mute" : "fg";
  return (
    <span className={cn("label-fg inline-flex items-center gap-1.5", status === "cancelled" && "!text-mute")}>
      <StatusDot tone={tone} pulse={status === "in_progress" || status === "review"} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const AVAIL: Record<AvailabilityStatus, { label: string; tone: "fg" | "hollow" | "mute" }> = {
  open: { label: "AVAILABLE", tone: "fg" },
  limited: { label: "LIMITED", tone: "hollow" },
  booked: { label: "BOOKED", tone: "mute" },
};

export function Availability({ status, className }: { status: AvailabilityStatus; className?: string }) {
  return (
    <span className={cn("label-fg inline-flex items-center gap-1.5", className)}>
      <StatusDot tone={AVAIL[status].tone} />
      {AVAIL[status].label}
    </span>
  );
}

/** Opens (or creates) a buyer-side thread with a creator; sends guests to sign in. */
export function useContact() {
  const user = useApp((s) => s.user);
  const start = useApp((s) => s.startConversation);
  const setMode = useApp((s) => s.setMode);
  const router = useRouter();
  const pathname = usePathname();
  return (creatorId: string, serviceId?: string) => {
    if (!user) return router.push(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
    setMode("buyer");
    router.push(`/messages?c=${start(creatorId, "buyer", serviceId)}`);
  };
}

/* ───────── save ───────── */

export function SaveButton({ id, kind, className, withLabel }: { id: string; kind: "service" | "creator"; className?: string; withLabel?: boolean }) {
  const user = useApp((s) => s.user);
  const saved = useApp((s) => (kind === "service" ? s.savedServices : s.savedCreators).includes(id));
  const toggle = useApp((s) => (kind === "service" ? s.toggleSavedService : s.toggleSavedCreator));
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        if (!user) {
          toast("Sign in to save", "Your saved list follows you across devices.");
          return router.push(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
        }
        toast(toggle(id) ? "Saved" : "Removed from saved");
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] font-mono text-[11px] uppercase tracking-[0.06em] transition-colors",
        withLabel ? "h-10 border border-line px-3 hover:border-fg" : "h-8 w-8 justify-center bg-bg/90 text-fg backdrop-blur hover:bg-bg",
        className,
      )}
    >
      <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
      {withLabel && (saved ? "Saved" : "Save")}
    </button>
  );
}

/* ───────── service cards ───────── */

export function ServiceCard({ service, layout = "grid", className }: { service: Service; layout?: "grid" | "row"; className?: string }) {
  const creator = useCreator(service.creatorId);
  const href = `/service/${service.slug}`;
  const rating = service.reviewCount ? (
    <span className="num inline-flex items-center gap-1">
      ★ {service.rating.toFixed(1)} <span className="text-mute">({service.reviewCount})</span>
    </span>
  ) : (
    <span className="text-mute">NEW</span>
  );

  if (layout === "row") {
    return (
      <article className={cn("group/art relative flex gap-4 border-b border-line py-4", className)}>
        <Link href={href} className="relative block w-28 shrink-0 sm:w-44" aria-label={service.title}>
          <Cover art={service.art} media={service.media?.[0]} className="aspect-[4/3] rounded-[2px]" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="label truncate">{CATEGORY_MAP[service.category]?.short} · {service.subcategory}</p>
          <Link href={href} className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-snug hover:underline">
            {service.title}
          </Link>
          <p className="mt-1 truncate text-[13px] text-mute">{creator?.name}</p>
          <div className="mono mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[12px]">
            {rating}
            <span>FROM {money(startingPrice(service))}</span>
            <span className="text-mute">{delivery(fastestDays(service))}</span>
          </div>
        </div>
        <SaveButton id={service.id} kind="service" className="absolute right-0 top-4 border border-line" />
      </article>
    );
  }

  return (
    <article className={cn("group/art relative flex flex-col", className)}>
      <Link href={href} className="block" aria-label={service.title}>
        <Cover art={service.art} media={service.media?.[0]} marks className="aspect-[4/3] rounded-[2px]">
          <span className="absolute bottom-2 left-2 rounded-[2px] bg-bg px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-fg">
            {CATEGORY_MAP[service.category]?.short}
          </span>
        </Cover>
      </Link>
      <SaveButton id={service.id} kind="service" className="absolute right-2 top-2" />
      <div className="mt-3 flex items-center gap-2">
        {creator && <Avatar seed={creator.id} size={22} online={creator.online} />}
        <span className="truncate text-[13px]">{creator?.name}</span>
        {creator?.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-label="Verified" />}
        {creator && <span className="label ml-auto shrink-0">{levelName(creator.level)}</span>}
      </div>
      <Link href={href} className="mt-2 line-clamp-2 text-[15.5px] font-medium leading-snug tracking-[-0.01em] hover:underline">
        {service.title}
      </Link>
      <div className="mono mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[12px]">
        {rating}
        <span>
          <span className="text-mute">FROM </span>
          {money(startingPrice(service))}
        </span>
      </div>
    </article>
  );
}

/* ───────── creator cards ───────── */

export function CreatorCard({ creator, className }: { creator: Creator; className?: string }) {
  return (
    <article className={cn("relative flex flex-col rounded-[2px] border border-line p-5 transition-colors hover:border-fg", className)}>
      <div className="flex items-start gap-4">
        <Avatar seed={creator.id} size={56} online={creator.online} label={creator.name} />
        <div className="min-w-0 flex-1">
          <Link href={`/creator/${creator.username}`} className="flex items-center gap-1.5 text-[16px] font-medium after:absolute after:inset-0">
            <span className="truncate">{creator.name}</span>
            {creator.verified && <BadgeCheck className="h-4 w-4 shrink-0" aria-label="Verified" />}
          </Link>
          <p className="label mt-1">{levelName(creator.level)} · {creator.city}</p>
        </div>
        <SaveButton id={creator.id} kind="creator" className="relative z-10 border border-line" />
      </div>
      <p className="mt-4 line-clamp-2 text-[14px] text-mute">{creator.headline}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {creator.skills.slice(0, 3).map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
      <dl className="mono mt-auto grid grid-cols-3 gap-2 border-t border-line pt-3 text-[12px]">
        <div>
          <dt className="label">RATING</dt>
          <dd className="num mt-1">★ {creator.stats.rating ? creator.stats.rating.toFixed(1) : "—"}</dd>
        </div>
        <div>
          <dt className="label">PROJECTS</dt>
          <dd className="num mt-1">{creator.stats.projects}</dd>
        </div>
        <div>
          <dt className="label">STATUS</dt>
          <dd className="mt-1">
            <Availability status={creator.availability} />
          </dd>
        </div>
      </dl>
    </article>
  );
}

/** Editorial list row: index · portrait · name · skills · rate. */
export function CreatorRow({ creator, index, from }: { creator: Creator; index: number; from?: number }) {
  return (
    <Link href={`/creator/${creator.username}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-5 md:grid-cols-[48px_72px_1.4fr_1fr_120px_32px] md:gap-6">
      <span className="num mono hidden text-[12px] text-mute md:block">{String(index).padStart(2, "0")}</span>
      <Avatar seed={creator.id} size={56} online={creator.online} className="md:h-[72px] md:w-[72px]" />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[18px] font-medium tracking-[-0.02em] md:text-[22px]">
          {creator.name}
          {creator.verified && <BadgeCheck className="h-4 w-4 shrink-0" aria-label="Verified" />}
        </p>
        <p className="mt-1 truncate text-[13.5px] text-mute">{creator.headline}</p>
      </div>
      <p className="mono hidden truncate text-[12px] text-mute md:block">{creator.skills.slice(0, 3).join(" · ")}</p>
      <div className="mono text-right text-[12px]">
        <p className="num">★ {creator.stats.rating.toFixed(1)}</p>
        {from !== undefined && <p className="num mt-1 text-mute">FROM {money(from)}</p>}
      </div>
      <ArrowUpRight className="hidden h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block" />
    </Link>
  );
}

/* ───────── packages ───────── */

export function PackageSelector({ service, tier, onTier }: { service: Service; tier: 1 | 2 | 3; onTier: (t: 1 | 2 | 3) => void }) {
  const p = service.packages[tier - 1];
  return (
    <div>
      <Segmented
        className="flex w-full"
        options={service.packages.map((x) => ({ value: String(x.tier) as "1" | "2" | "3", label: x.name }))}
        value={String(tier) as "1" | "2" | "3"}
        onChange={(v) => onTier(Number(v) as 1 | 2 | 3)}
      />
      <div className="mt-5 flex items-baseline justify-between">
        <span className="num text-[34px] font-medium tracking-[-0.04em]">{money(p.price)}</span>
        <span className="label-fg">{delivery(p.days)}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3">
        <div>
          <dt className="label">REVISIONS</dt>
          <dd className="num mt-1 text-[14px]">{p.revisions === null ? "Unlimited" : p.revisions}</dd>
        </div>
        <div>
          <dt className="label">SUPPORT</dt>
          <dd className="mt-1 text-[14px]">{p.support}</dd>
        </div>
      </dl>
      <ul className="mt-4 space-y-2">
        {p.deliverables.map((d) => (
          <li key={d} className="flex gap-2.5 text-[14px]">
            <Check className="mt-1 h-3.5 w-3.5 shrink-0" />
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PackageCompare({ service }: { service: Service }) {
  const rows: [string, (p: Service["packages"][number]) => ReactNode][] = [
    ["Price", (p) => money(p.price)],
    ["Delivery", (p) => delivery(p.days)],
    ["Revisions", (p) => (p.revisions === null ? "Unlimited" : p.revisions)],
    ["Support", (p) => p.support],
  ];
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-fg">
            <th className="label py-3 text-left font-normal">PACKAGE</th>
            {service.packages.map((p) => (
              <th key={p.tier} className="label-fg py-3 text-left font-normal">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, fn]) => (
            <tr key={k} className="border-b border-line">
              <td className="py-3 pr-4 text-mute">{k}</td>
              {service.packages.map((p) => (
                <td key={p.tier} className="num py-3 pr-4">
                  {fn(p)}
                </td>
              ))}
            </tr>
          ))}
          {service.features.map((f, i) => (
            <tr key={f} className="border-b border-line">
              <td className="py-3 pr-4 text-mute">{f}</td>
              {service.packages.map((p) => (
                <td key={p.tier} className="py-3 pr-4">
                  {i < p.featureCount ? <Check className="h-4 w-4" aria-label="Included" /> : <Minus className="h-4 w-4 text-faint" aria-label="Not included" />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── reviews ───────── */

export function ReviewSummary({ rating, count }: { rating: number; count: number }) {
  const b = ratingBreakdown(rating);
  return (
    <div className="grid gap-8 md:grid-cols-[auto_1fr_1fr]">
      <div>
        <p className="num text-[64px] font-medium leading-none tracking-[-0.05em]">{rating.toFixed(1)}</p>
        <Stars value={rating} className="mt-3" />
        <p className="label mt-2">{count} REVIEWS</p>
      </div>
      <div className="space-y-1.5">
        {b.dist.map((pct, i) => (
          <div key={i} className="mono flex items-center gap-3 text-[11px]">
            <span className="w-3 text-mute">{5 - i}</span>
            <span className="h-1 flex-1 bg-soft">
              <span className="block h-full bg-fg" style={{ width: `${pct}%` }} />
            </span>
            <span className="num w-8 text-right text-mute">{pct}%</span>
          </div>
        ))}
      </div>
      <dl className="grid grid-cols-3 gap-4 md:grid-cols-1 md:gap-2">
        {(
          [
            ["QUALITY", b.quality],
            ["COMMUNICATION", b.communication],
            ["DELIVERY", b.delivery],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="md:flex md:items-center md:justify-between">
            <dt className="label">{k}</dt>
            <dd className="num mt-1 text-[14px] md:mt-0">{v.toFixed(1)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ReviewList({ reviews, canReply }: { reviews: Review[]; canReply?: boolean }) {
  const replies = useApp((s) => s.replies);
  if (!reviews.length) return <p className="py-6 text-[14px] text-mute">No reviews yet.</p>;
  return (
    <ul>
      {reviews.map((r) => (
        <ReviewItem key={r.id} review={r} reply={replies[r.id] ?? r.reply} canReply={canReply} />
      ))}
    </ul>
  );
}

function ReviewItem({ review: r, reply, canReply }: { review: Review; reply?: string; canReply?: boolean }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const replyToReview = useApp((s) => s.replyToReview);
  const creator = CREATOR_MAP[r.creatorId];
  return (
    <li className="border-b border-line py-6">
      <div className="flex items-center gap-3">
        <Avatar seed={r.author} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">{r.author}</p>
          <p className="label mt-0.5">
            {r.country}
            {r.project && ` · ${r.project}`}
          </p>
        </div>
        <div className="text-right">
          <Stars value={r.rating} />
          <p className="label mt-1">{dateShort(r.date)}</p>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed">{r.text}</p>
      {reply && (
        <div className="mt-4 max-w-2xl border-l border-fg pl-4">
          <p className="label">RESPONSE FROM {(creator?.name ?? "the creator").toUpperCase()}</p>
          <p className="mt-1.5 text-[14px] text-mute">{reply}</p>
        </div>
      )}
      {canReply && !reply && (
        <div className="mt-4 max-w-2xl">
          {open ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) replyToReview(r.id, text.trim());
              }}
              className="space-y-2"
            >
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Thank the client, add context…" className="min-h-20" aria-label="Reply" autoFocus />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!text.trim()}>
                  Post reply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button size="sm" variant="line" onClick={() => setOpen(true)}>
              Reply
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

/** Static reviews for a service, plus any the user wrote. */
export function useServiceReviews(service: Service | undefined, base: Review[]) {
  const written = useApp((s) => s.writtenReviews);
  if (!service) return base;
  return [...written.filter((r) => r.serviceId === service.id), ...base];
}

/* ───────── orders ───────── */

export function StatusTimeline({ order }: { order: Order }) {
  const cancelled = order.status === "cancelled";
  const current = STAGES.indexOf(order.status);
  return (
    <ol className="grid grid-cols-6 gap-1" aria-label="Order progress">
      {STAGES.map((s, i) => {
        const done = !cancelled && i <= current;
        const ts = order.stageTimes[s];
        return (
          <li key={s} aria-current={i === current ? "step" : undefined}>
            <span className={cn("block h-1", done ? "bg-fg" : "bg-line", i === current && !cancelled && order.status !== "completed" && "animate-blink")} />
            <p className={cn("mt-2 hidden font-mono text-[10px] uppercase tracking-[0.06em] sm:block", done ? "text-fg" : "text-faint")}>{STATUS_LABEL[s]}</p>
            <p className="num mt-0.5 hidden font-mono text-[10px] text-mute sm:block">{ts ? dateShort(ts) : "—"}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderRow({ order }: { order: Order }) {
  const user = useApp((s) => s.user);
  const svc = useService(order.serviceId);
  const asBuyer = order.buyerId === user?.id;
  const party = resolveParty(asBuyer ? order.sellerId : order.buyerId, user);
  const open = !["completed", "cancelled", "delivered"].includes(order.status);
  const left = timeLeft(order.deadline);
  return (
    <Link href={`/orders/${order.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-line py-4 transition-colors hover:bg-soft md:grid-cols-[80px_1.6fr_1fr_140px_110px_110px] md:px-2">
      <span className="num mono hidden text-[12px] text-mute md:block">#{orderNo(order.id)}</span>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar seed={party.seed} size={36} />
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-medium">{svc?.title ?? "Service"}</p>
          <p className="truncate text-[12.5px] text-mute">
            {asBuyer ? "with" : "for"} {party.name}
            <span className="md:hidden"> · #{orderNo(order.id)}</span>
          </p>
        </div>
      </div>
      <div className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto md:text-left">
        <StatusBadge status={order.status} />
      </div>
      <span className={cn("mono num text-[12px] md:block", left.late && open ? "text-signal" : "text-mute")}>{open ? left.label : dateShort(order.stageTimes.completed ?? order.deadline)}</span>
      <span className="mono num hidden text-[12px] text-mute md:block">{dateShort(order.createdAt)}</span>
      <span className="num text-right text-[14px] font-medium">{money(order.price)}</span>
    </Link>
  );
}

const ORDER_TABS = {
  active: (o: Order) => ["requested", "confirmed", "in_progress", "review"].includes(o.status),
  delivered: (o: Order) => o.status === "delivered",
  completed: (o: Order) => o.status === "completed",
  cancelled: (o: Order) => o.status === "cancelled",
  all: () => true,
};
type OrderTab = keyof typeof ORDER_TABS;

export function OrderList({ orders }: { orders: Order[] }) {
  const mode = useApp((s) => s.mode);
  const [tab, setTab] = useState<OrderTab>("active");
  const shown = orders.filter(ORDER_TABS[tab]);
  return (
    <>
      <TabBar
        tabs={(Object.keys(ORDER_TABS) as OrderTab[]).map((t) => ({ value: t, label: t, count: orders.filter(ORDER_TABS[t]).length }))}
        value={tab}
        onChange={setTab}
      />
      <div className="label mt-4 hidden grid-cols-[80px_1.6fr_1fr_140px_110px_110px] gap-4 px-2 pb-2 md:grid">
        <span>ORDER</span>
        <span>SERVICE</span>
        <span>STATUS</span>
        <span>DUE / DONE</span>
        <span>PLACED</span>
        <span className="text-right">AMOUNT</span>
      </div>
      {shown.length ? (
        <div className="border-t border-line">
          {shown.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          title={`No ${tab === "all" ? "" : tab + " "}orders`}
          body={mode === "buyer" ? "Orders you place appear here with their status and deadline." : "Orders from clients appear here once they book one of your services."}
          action={mode === "buyer" ? <ButtonLink href="/explore" size="sm" arrow>Explore services</ButtonLink> : <ButtonLink href="/seller/services/new" size="sm" arrow>Publish a service</ButtonLink>}
        />
      )}
    </>
  );
}

/* ───────── gallery ───────── */

const ALT_VARIANTS: ArtVariant[] = ["dots", "lines", "rings", "grid", "bars", "blocks", "wire", "wave", "scatter", "glyph"];

export function Gallery({ service }: { service: Service }) {
  const frames = service.media?.length
    ? service.media.map((m) => ({ media: m, art: service.art }))
    : [0, 1, 2, 3].map((i) => ({
        media: undefined,
        art: i === 0 ? service.art : { variant: ALT_VARIANTS[(ALT_VARIANTS.indexOf(service.art.variant) + i * 3) % ALT_VARIANTS.length], seed: service.art.seed + i * 17 },
      }));
  const [i, setI] = useState(0);
  return (
    <div>
      <Cover art={frames[i].art} media={frames[i].media} marks className="aspect-[16/10] rounded-[2px]" alt={`${service.title} — image ${i + 1} of ${frames.length}`}>
        <span className="mono num absolute bottom-3 right-3 rounded-[2px] bg-bg px-1.5 py-1 text-[10.5px] text-fg">
          {String(i + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
        </span>
      </Cover>
      {frames.length > 1 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {frames.map((f, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={`Show image ${k + 1}`} aria-pressed={k === i} className={cn("rounded-[2px] p-px outline-offset-0 transition-opacity", k === i ? "outline outline-1 outline-fg" : "opacity-60 hover:opacity-100")}>
              <Cover art={f.art} media={f.media} className="aspect-[4/3] rounded-[1px]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── misc ───────── */

export function ProjectTile({ project, onOpen }: { project: { id: string; title: string; discipline: string; year: number; result: string; art: Service["art"] }; onOpen?: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group/art block w-full text-left">
      <Artwork art={project.art} marks className="aspect-[4/3] rounded-[2px]" />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="truncate text-[15px] font-medium">{project.title}</p>
        <span className="label num shrink-0">{project.year}</span>
      </div>
      <p className="label mt-1">
        {project.discipline} · {project.result}
      </p>
    </button>
  );
}


export function ReviewDialog({ orderId, open, onOpenChange }: { orderId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const addReview = useApp((s) => s.addReview);
  const [r, setR] = useState({ quality: 5, communication: 5, delivery: 5, text: "" });
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Leave a review" description="Published on the service page with your name and country.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addReview(orderId, { ...r, text: r.text.trim() });
          onOpenChange(false);
        }}
        className="space-y-5 p-5"
      >
        {(["quality", "communication", "delivery"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="label-fg">{k}</span>
            <StarInput label={k} value={r[k]} onChange={(v) => setR({ ...r, [k]: v })} />
          </div>
        ))}
        <Field label="Your review" hint="What was it like to work together? What did you get?">
          <Textarea value={r.text} onChange={(e) => setR({ ...r, text: e.target.value })} required minLength={20} />
        </Field>
        <Button type="submit" className="w-full" disabled={r.text.trim().length < 20}>
          Publish review
        </Button>
      </form>
    </Modal>
  );
}
