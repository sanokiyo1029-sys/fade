"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, FileText, Upload } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { ReviewDialog, StatusBadge, StatusTimeline } from "@/components/market";
import { Thread } from "@/components/thread";
import { Button, ButtonLink, Checkbox, EmptyState, Meta, Skeleton } from "@/components/ui";
import { useApp, type OrderAction } from "@/store/app";
import { useRequireAuth, useService } from "@/store/hooks";
import { toast } from "@/store/ui";
import { kindFromFile } from "@/lib/blobs";
import { resolveParty } from "@/lib/resolve";
import { ago, dateLong, dateShort, fileSize, money, orderNo, timeLeft } from "@/lib/format";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Which actions each side can take at each stage. `confirm` marks the irreversible ones. */
function actionsFor(o: Order, role: "buyer" | "seller"): { action: OrderAction; label: string; variant?: "primary" | "line" | "danger"; confirm?: string }[] {
  if (role === "seller") {
    switch (o.status) {
      case "requested":
        return [
          { action: "accept", label: "Accept order" },
          { action: "decline", label: "Decline", variant: "danger", confirm: "Decline this order? The client will be refunded." },
        ];
      case "confirmed":
        return [{ action: "start", label: "Start work" }];
      case "in_progress":
        return [{ action: "submit", label: "Submit for review" }];
      default:
        return [];
    }
  }
  switch (o.status) {
    case "requested":
      return [{ action: "cancel", label: "Cancel request", variant: "danger", confirm: "Cancel this order? Your payment will be refunded in full." }];
    case "review":
      return [
        { action: "approve", label: "Approve work" },
        { action: "revise", label: "Request revision", variant: "line" },
      ];
    case "delivered":
      return [{ action: "release", label: `Release ${money(o.price)}`, confirm: `Release ${money(o.price)} to the creator? This can't be undone.` }];
    default:
      return [];
  }
}

const WAITING: Partial<Record<Order["status"], [string, string]>> = {
  requested: ["Waiting for the creator to confirm", "Waiting for you to accept"],
  confirmed: ["Scheduled — work starts soon", "Start when you're ready"],
  in_progress: ["The creator is working on it", "Upload work, then submit for review"],
  review: ["Your review is needed", "Waiting for the client to review"],
  delivered: ["Download your files, then release payment", "Waiting for the client to release payment"],
  completed: ["Order complete", "Paid — order complete"],
  cancelled: ["Cancelled · refunded", "Cancelled · refunded"],
};

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="label-fg">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Workspace({ id }: { id: string }) {
  const { ready, user } = useRequireAuth();
  const order = useApp((s) => s.orders.find((o) => o.id === id));
  const conv = useApp((s) => s.conversations.find((c) => c.orderId === id));
  const mode = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  const act = useApp((s) => s.orderAction);
  const toggleMilestone = useApp((s) => s.toggleMilestone);
  const addFile = useApp((s) => s.addOrderFile);
  const service = useService(order?.serviceId ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const [reviewing, setReviewing] = useState(false);
  const role = order && user && order.buyerId === user.id ? "buyer" : "seller";

  useEffect(() => {
    if (order && mode !== role) setMode(role);
  }, [order, mode, role, setMode]);

  if (!ready || !user) return <div className="shell py-12"><Skeleton className="h-[60svh]" /></div>;
  if (!order || (order.buyerId !== user.id && order.sellerId !== user.id)) {
    return <div className="shell py-16"><EmptyState title="Order not found" action={<ButtonLink href="/orders" variant="line">All orders</ButtonLink>} /></div>;
  }

  const party = resolveParty(role === "buyer" ? order.sellerId : order.buyerId, user);
  const open = !["delivered", "completed", "cancelled"].includes(order.status);
  const left = timeLeft(order.deadline);
  const actions = actionsFor(order, role);
  const revisionsLeft = order.revisionsTotal === null ? "∞" : Math.max(0, order.revisionsTotal - order.revisionsUsed);
  const waiting = WAITING[order.status]?.[role === "buyer" ? 0 : 1];

  const run = (a: (typeof actions)[number]) => {
    if (a.confirm && !window.confirm(a.confirm)) return;
    act(order.id, a.action);
  };

  return (
    <div className="shell py-6 md:py-10">
      <Link href="/orders" className="label hover:text-fg">
        ← ALL ORDERS
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="label-fg flex flex-wrap items-center gap-3">
            <span className="num">ORDER #{orderNo(order.id)}</span>
            <StatusBadge status={order.status} />
          </p>
          <h1 className="mt-3 text-[28px] md:text-[40px]">{service?.title ?? "Order"}</h1>
          <p className="mt-3 flex items-center gap-2.5 text-[14px] text-mute">
            <Avatar seed={party.seed} size={24} online={party.online} />
            {role === "buyer" ? "With" : "For"} <span className="text-fg">{party.name}</span> · {service?.packages[order.tier - 1].name}
          </p>
        </div>
        <div className="text-right">
          <p className="label">{open ? "TIME LEFT" : "DUE"}</p>
          <p className={cn("num mono mt-1 text-[28px] font-medium tracking-[-0.03em]", open && left.late && "text-signal")}>{open ? left.label : dateShort(order.deadline)}</p>
          <p className="label num mt-1">DUE {dateLong(order.deadline)}</p>
        </div>
      </div>

      <div className="mt-8">
        <StatusTimeline order={order} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {/* next step */}
          <div className={cn("flex flex-col gap-4 rounded-[2px] border p-5 sm:flex-row sm:items-center sm:justify-between", actions.length ? "border-fg" : "border-line bg-soft")}>
            <div>
              <p className="label">NEXT STEP</p>
              <p className="mt-1 text-[16px] font-medium">{waiting}</p>
              {order.status === "review" && role === "buyer" && <p className="label num mt-1">{revisionsLeft} REVISIONS LEFT</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <Button key={a.action} variant={a.variant ?? "primary"} onClick={() => run(a)} arrow={!a.variant}>
                  {a.label}
                </Button>
              ))}
              {role === "buyer" && order.status === "completed" && !order.reviewed && (
                <Button onClick={() => setReviewing(true)} arrow>
                  Leave a review
                </Button>
              )}
            </div>
          </div>

          <Section title="Brief">
            <p className="max-w-2xl whitespace-pre-line text-[15px] leading-relaxed">{order.brief || "No brief was provided."}</p>
            {order.extras.length > 0 && (
              <p className="label mt-4">
                ADD-ONS · {order.extras.map((e) => (e === "express" ? "EXPRESS DELIVERY" : e === "source" ? "SOURCE FILES" : e.toUpperCase())).join(" · ")}
              </p>
            )}
          </Section>

          <Section title="Milestones" aside={<span className="label num">{order.milestones.filter((m) => m.done).length} / {order.milestones.length}</span>}>
            <ol className="border-t border-line">
              {order.milestones.map((m, i) => (
                <li key={m.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-3 sm:grid-cols-[1fr_100px_100px]">
                  {role === "seller" && open ? (
                    <Checkbox checked={m.done} onChange={() => toggleMilestone(order.id, m.id)}>
                      <span className={cn(m.done && "text-mute line-through")}>
                        {String(i + 1).padStart(2, "0")} · {m.title}
                      </span>
                    </Checkbox>
                  ) : (
                    <span className={cn("flex items-center gap-2.5 text-[14px]", m.done && "text-mute line-through")}>
                      <span className={cn("h-2 w-2 rounded-full", m.done ? "bg-fg" : "border border-fg")} />
                      {String(i + 1).padStart(2, "0")} · {m.title}
                    </span>
                  )}
                  <span className="mono num hidden text-[12px] text-mute sm:block">{dateShort(m.due)}</span>
                  <span className="num text-right text-[14px]">{money(m.amount)}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section
            title="Files"
            aside={
              open || order.status === "delivered" ? (
                <>
                  <input
                    ref={fileInput}
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => {
                      [...(e.target.files ?? [])].forEach((f) => addFile(order.id, { name: f.name, size: f.size, kind: kindFromFile(f) }));
                      if (e.target.files?.length) toast(`${e.target.files.length} file${e.target.files.length > 1 ? "s" : ""} uploaded`);
                      e.target.value = "";
                    }}
                  />
                  <Button size="sm" variant="line" onClick={() => fileInput.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </Button>
                </>
              ) : undefined
            }
          >
            {order.files.length ? (
              <ul className="border-t border-line">
                {order.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 border-b border-line py-3">
                      <FileText className="h-4 w-4 shrink-0 text-mute" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px]">{f.name}</p>
                        <p className="mono num text-[11px] text-mute">
                          {fileSize(f.size)} · {f.by === role ? "YOU" : f.by.toUpperCase()} · {ago(f.ts)}
                          {f.final && " · FINAL"}
                        </p>
                      </div>
                      <button type="button" onClick={() => toast("Demo file", "Files aren't stored in this demo.")} className="label flex items-center gap-1.5 hover:text-fg" aria-label={`Download ${f.name}`}>
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-mute">No files yet.</p>
            )}
          </Section>

          {conv && (
            <Section title="Messages" aside={<Link href={`/messages?c=${conv.id}`} className="label hover:text-fg">OPEN IN MESSAGES →</Link>}>
              <Thread conv={conv} className="h-[520px] rounded-[2px] border border-line" />
            </Section>
          )}

          <Section title="Activity">
            <ol className="relative space-y-4 border-l border-line pl-5">
              {[...order.activity].reverse().map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[23.5px] top-1.5 h-2 w-2 rounded-full border border-fg bg-bg" />
                  <p className="text-[14px]">
                    <span className="font-medium">{a.actor}</span> <span className="text-mute">{a.text.charAt(0).toLowerCase() + a.text.slice(1)}</span>
                  </p>
                  <p className="mono num mt-0.5 text-[10.5px] text-mute">
                    {dateShort(a.ts)} · {ago(a.ts)}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <div className="rounded-[2px] border border-line p-5">
            <p className="label-fg">Payment</p>
            <p className="num mt-4 text-[32px] font-medium tracking-[-0.04em]">{money(order.price)}</p>
            <p className="label mt-1">{order.payment.status === "escrow" ? "HELD IN ESCROW" : order.payment.status === "released" ? "RELEASED TO CREATOR" : order.payment.status.toUpperCase()}</p>
            <dl className="mono mt-5 space-y-2 border-t border-line pt-4 text-[12px]">
              <div className="flex justify-between">
                <dt className="text-mute">SUBTOTAL</dt>
                <dd className="num">{money(order.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">SERVICE FEE</dt>
                <dd className="num">{role === "buyer" ? money(order.fee) : `−${money(Math.round(order.price * 0.1))}`}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-fg">
                <dt>{role === "buyer" ? "YOU PAID" : "YOU RECEIVE"}</dt>
                <dd className="num">{money(role === "buyer" ? order.price + order.fee : Math.round(order.price * 0.9))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">METHOD</dt>
                <dd>{role === "buyer" ? order.payment.method : "FADE ESCROW"}</dd>
              </div>
            </dl>
          </div>
          <dl className="grid grid-cols-2 gap-5 rounded-[2px] border border-line p-5">
            <Meta k="Placed" v={dateShort(order.createdAt)} />
            <Meta k="Due" v={dateShort(order.deadline)} />
            <Meta k="Revisions" v={`${order.revisionsUsed} / ${order.revisionsTotal ?? "∞"}`} />
            <Meta k="Package" v={service?.packages[order.tier - 1].name} />
          </dl>
          {service && (
            <Link href={`/service/${service.slug}`} className="label block hover:text-fg">
              VIEW SERVICE PAGE →
            </Link>
          )}
        </aside>
      </div>

      <ReviewDialog orderId={order.id} open={reviewing} onOpenChange={setReviewing} />
    </div>
  );
}
