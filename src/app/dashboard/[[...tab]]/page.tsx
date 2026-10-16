"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Avatar } from "@/components/brand/Avatar";
import { DashShell, Metric, Metrics, PageHead, Settings } from "@/components/dash";
import { CreatorCard, OrderList, OrderRow, ReviewDialog, ReviewList, STATUS_LABEL, ServiceCard } from "@/components/market";
import { Button, ButtonLink, EmptyState } from "@/components/ui";
import { CREATOR_MAP } from "@/data/creators";
import { useApp } from "@/store/app";
import { useModeOrders, useServices, useUnread } from "@/store/hooks";
import { resolveParty } from "@/lib/resolve";
import { dateShort, money, moneyShort, timeLeft } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const TABS: [string, string][] = [
  ["", "Overview"],
  ["orders", "Orders"],
  ["saved", "Saved"],
  ["projects", "Projects"],
  ["payments", "Payments"],
  ["reviews", "Reviews"],
  ["settings", "Settings"],
];

export default function Dashboard({ params }: PageProps<"/dashboard/[[...tab]]">) {
  const tab = use(params).tab?.[0] ?? "";
  const valid = TABS.some(([t]) => t === tab) ? tab : "";
  return (
    <DashShell base="/dashboard" mode="buyer" tabs={TABS} tab={valid} title="Client dashboard">
      {valid === "" && <Overview />}
      {valid === "orders" && <Orders />}
      {valid === "saved" && <Saved />}
      {valid === "projects" && <Board />}
      {valid === "payments" && <Payments />}
      {valid === "reviews" && <Reviews />}
      {valid === "settings" && (
        <>
          <PageHead index="DASHBOARD / SETTINGS" title="Settings" />
          <Settings />
        </>
      )}
    </DashShell>
  );
}

function Orders() {
  const orders = useModeOrders();
  return (
    <>
      <PageHead index="DASHBOARD / ORDERS" title="Your orders" action={<ButtonLink href="/explore" size="sm" arrow>New project</ButtonLink>} />
      <OrderList orders={orders} />
    </>
  );
}

const ACTIVE: OrderStatus[] = ["requested", "confirmed", "in_progress", "review"];

function Overview() {
  const user = useApp((s) => s.user)!;
  const orders = useModeOrders();
  const saved = useApp((s) => s.savedCreators);
  const unread = useUnread();
  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const attention = orders.filter((o) => o.status === "review" || o.status === "delivered" || (o.status === "completed" && !o.reviewed));
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.price + o.fee, 0);

  return (
    <>
      <PageHead index="DASHBOARD / OVERVIEW" title={`Hello, ${user.name.split(" ")[0]}.`} action={<ButtonLink href="/explore" arrow>Start a project</ButtonLink>} />
      <Metrics>
        <Metric label="Active orders" value={active.length} note={`${orders.length} total`} />
        <Metric label="Needs you" value={attention.length} alert={attention.length > 0} note="Review, release or rate" />
        <Metric label="Total spent" value={moneyShort(spent)} note="Incl. service fees" />
        <Metric label="Unread" value={unread.messages} note={`${saved.length} saved creators`} />
      </Metrics>

      <section className="mt-12">
        <h2 className="label-fg mb-3">Needs your attention</h2>
        {attention.length ? (
          <ul className="border-t border-line">
            {attention.map((o) => (
              <AttentionRow key={o.id} o={o} />
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-mute">Nothing waiting on you.</p>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="label-fg">Recent orders</h2>
          <Link href="/dashboard/orders" className="label hover:text-fg">
            ALL ORDERS →
          </Link>
        </div>
        {orders.length ? (
          <div className="border-t border-line">
            {orders.slice(0, 4).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <EmptyState title="No orders yet" body="Find a creator and book a fixed-scope package." action={<ButtonLink href="/explore" size="sm" arrow>Explore</ButtonLink>} />
        )}
      </section>
    </>
  );
}

function AttentionRow({ o }: { o: Order }) {
  const user = useApp((s) => s.user);
  const p = resolveParty(o.sellerId, user);
  const what = o.status === "review" ? "Review submitted work" : o.status === "delivered" ? `Release ${money(o.price)}` : "Leave a review";
  return (
    <li>
      <Link href={`/orders/${o.id}`} className="flex items-center gap-3 border-b border-line py-3.5 hover:bg-soft">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
        <Avatar seed={p.seed} size={28} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">{what}</span>
          <span className="label">
            #{o.id} · {p.name}
          </span>
        </span>
        <span className="label-fg">OPEN →</span>
      </Link>
    </li>
  );
}

function Saved() {
  const ids = useApp((s) => s.savedServices);
  const creatorIds = useApp((s) => s.savedCreators);
  const services = useServices().filter((s) => ids.includes(s.id));
  const creators = creatorIds.map((id) => CREATOR_MAP[id]).filter(Boolean);
  return (
    <>
      <PageHead index="DASHBOARD / SAVED" title="Saved" />
      <h2 className="label-fg mb-4">Services · {services.length}</h2>
      {services.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      ) : (
        <EmptyState title="No saved services" body="Tap the bookmark on any service to keep it here." />
      )}
      <h2 className="label-fg mb-4 mt-12">Creators · {creators.length}</h2>
      {creators.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      ) : (
        <EmptyState title="No saved creators" />
      )}
    </>
  );
}

const COLUMNS: [string, OrderStatus[]][] = [
  ["Requested", ["requested", "confirmed"]],
  ["In progress", ["in_progress"]],
  ["In review", ["review"]],
  ["Delivered", ["delivered"]],
  ["Done", ["completed"]],
];

function Board() {
  const orders = useModeOrders();
  const services = useServices();
  return (
    <>
      <PageHead index="DASHBOARD / PROJECTS" title="Project board" />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-5 md:px-0">
        {COLUMNS.map(([title, statuses]) => {
          const list = orders.filter((o) => statuses.includes(o.status));
          return (
            <section key={title} className="w-64 shrink-0 md:w-auto">
              <h2 className="label-fg flex justify-between border-b border-fg pb-2">
                {title} <span className="num text-mute">{list.length}</span>
              </h2>
              <div className="mt-3 space-y-2">
                {list.map((o) => {
                  const s = services.find((x) => x.id === o.serviceId);
                  const open = o.status !== "completed" && o.status !== "delivered";
                  return (
                    <Link key={o.id} href={`/orders/${o.id}`} className="block rounded-[2px] border border-line bg-bg p-3 transition-colors hover:border-fg">
                      <p className="label">#{o.id} · {STATUS_LABEL[o.status]}</p>
                      <p className="mt-2 line-clamp-2 text-[13.5px] font-medium">{s?.title}</p>
                      <div className="mono mt-3 flex justify-between text-[11px] text-mute">
                        <span className="num">{money(o.price)}</span>
                        <span className="num">{open ? timeLeft(o.deadline).label : dateShort(o.deadline)}</span>
                      </div>
                      <div className="mt-2 h-0.5 bg-line">
                        <div className="h-full bg-fg" style={{ width: `${(o.milestones.filter((m) => m.done).length / Math.max(1, o.milestones.length)) * 100}%` }} />
                      </div>
                    </Link>
                  );
                })}
                {!list.length && <p className="py-6 text-center text-[12px] text-faint">Empty</p>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function Payments() {
  const orders = useModeOrders();
  const services = useServices();
  const sum = (st: Order["payment"]["status"]) => orders.filter((o) => o.payment.status === st).reduce((n, o) => n + o.price + o.fee, 0);
  return (
    <>
      <PageHead index="DASHBOARD / PAYMENTS" title="Payments" />
      <Metrics cols={3}>
        <Metric label="In escrow" value={money(sum("escrow"))} note="Released when you approve" />
        <Metric label="Released" value={money(sum("released"))} />
        <Metric label="Refunded" value={money(sum("refunded"))} />
      </Metrics>
      <div className="no-scrollbar mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-[14px]">
          <thead>
            <tr className="label border-b border-fg text-left">
              <th className="py-3 font-normal">ORDER</th>
              <th className="py-3 font-normal">SERVICE</th>
              <th className="py-3 font-normal">DATE</th>
              <th className="py-3 font-normal">METHOD</th>
              <th className="py-3 font-normal">STATUS</th>
              <th className="py-3 text-right font-normal">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line">
                <td className="mono num py-3 text-[12px]">
                  <Link href={`/orders/${o.id}`} className="hover:underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="max-w-[240px] truncate py-3 pr-4">{services.find((s) => s.id === o.serviceId)?.title}</td>
                <td className="mono num py-3 text-[12px] text-mute">{dateShort(o.createdAt)}</td>
                <td className="py-3 text-[13px] text-mute">{o.payment.method}</td>
                <td className="label-fg py-3">{o.payment.status}</td>
                <td className="num py-3 text-right">{money(o.price + o.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="py-8 text-center text-[14px] text-mute">No payments yet.</p>}
      </div>
    </>
  );
}

function Reviews() {
  const orders = useModeOrders().filter((o) => o.status === "completed");
  const written = useApp((s) => s.writtenReviews);
  const services = useServices();
  const [open, setOpen] = useState<string | null>(null);
  const pending = orders.filter((o) => !o.reviewed);
  return (
    <>
      <PageHead index="DASHBOARD / REVIEWS" title="Reviews" />
      <h2 className="label-fg mb-3">Waiting for your review · {pending.length}</h2>
      {pending.length ? (
        <ul className="border-t border-line">
          {pending.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 border-b border-line py-4">
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-medium">{services.find((s) => s.id === o.serviceId)?.title}</p>
                <p className="label mt-1">
                  #{o.id} · COMPLETED {dateShort(o.stageTimes.completed ?? o.deadline)}
                </p>
              </div>
              <Button size="sm" onClick={() => setOpen(o.id)}>
                Write review
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[14px] text-mute">You&apos;re all caught up.</p>
      )}
      <h2 className="label-fg mb-1 mt-12">Published · {written.length}</h2>
      <ReviewList reviews={written} />
      {open && <ReviewDialog orderId={open} open onOpenChange={(v) => !v && setOpen(null)} />}
    </>
  );
}
