"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Artwork, Cover } from "@/components/brand/Artwork";
import { ColumnChart, DashShell, LineChart, Metric, Metrics, PageHead, Settings, weekly, type Point } from "@/components/dash";
import { OrderList, OrderRow, ProjectTile, ReviewList, ReviewSummary } from "@/components/market";
import { Button, ButtonLink, EmptyState, Field, Input, Modal, Segmented, Select, Textarea } from "@/components/ui";
import { projectsByCreator } from "@/data/portfolio";
import { reviewsForCreator } from "@/data/reviews";
import { startingPrice } from "@/data/services";
import { useApp } from "@/store/app";
import { useCreator, useModeOrders, useMyServices } from "@/store/hooks";
import { toast } from "@/store/ui";
import { dateShort, int, money, moneyShort } from "@/lib/format";
import type { ArtVariant, AvailabilityStatus, Order } from "@/lib/types";
import { hash } from "@/lib/utils";

const TABS: [string, string][] = [
  ["", "Overview"],
  ["orders", "Orders"],
  ["services", "Services"],
  ["analytics", "Analytics"],
  ["earnings", "Earnings"],
  ["reviews", "Reviews"],
  ["portfolio", "Portfolio"],
  ["settings", "Settings"],
];

const CUT = 0.9; // creators keep 90%
const WEEK = 7 * 86400000;

export default function Seller({ params }: PageProps<"/seller/[[...tab]]">) {
  const tab = use(params).tab?.[0] ?? "";
  const valid = TABS.some(([t]) => t === tab) ? tab : "";
  return (
    <DashShell base="/seller" mode="seller" tabs={TABS} tab={valid} title="Seller dashboard">
      {valid === "" && <Overview />}
      {valid === "orders" && <Orders />}
      {valid === "services" && <Services />}
      {valid === "analytics" && <Analytics />}
      {valid === "earnings" && <Earnings />}
      {valid === "reviews" && <Reviews />}
      {valid === "portfolio" && <Portfolio />}
      {valid === "settings" && (
        <>
          <PageHead index="SELLER / SETTINGS" title="Settings" />
          <Settings />
        </>
      )}
    </DashShell>
  );
}

/** Weekly creator earnings. The demo account gets a synthetic history on top of its real orders. */
function useEarnings(orders: Order[]): Point[] {
  const user = useApp((s) => s.user)!;
  const [now] = useState(Date.now);
  const real = Array.from({ length: 8 }, (_, i) => {
    const from = now - (8 - i) * WEEK;
    return orders.filter((o) => o.stageTimes.completed && o.stageTimes.completed >= from && o.stageTimes.completed < from + WEEK).reduce((n, o) => n + o.price * CUT, 0);
  });
  const fake = user.isDemo ? weekly(hash(user.id), 8, 60000, 40000) : null;
  return real.map((v, i) => ({ label: `W${i + 1}`, value: Math.round(v + (fake?.[i].value ?? 0)) }));
}

function Orders() {
  const orders = useModeOrders();
  return (
    <>
      <PageHead index="SELLER / ORDERS" title="Orders received" />
      <OrderList orders={orders} />
    </>
  );
}

function Overview() {
  const user = useApp((s) => s.user)!;
  const availability = useApp((s) => s.availability);
  const setAvailability = useApp((s) => s.setAvailability);
  const creator = useCreator(user.id);
  const orders = useModeOrders();
  const earnings = useEarnings(orders);
  const active = orders.filter((o) => ["confirmed", "in_progress", "review"].includes(o.status));
  const requests = orders.filter((o) => o.status === "requested");
  const pending = orders.filter((o) => o.payment.status === "escrow").reduce((n, o) => n + o.price * CUT, 0);
  const month = earnings.slice(-4).reduce((n, p) => n + p.value, 0);
  const views = weekly(hash(user.id) + 1, 4, user.isDemo ? 900 : 12, user.isDemo ? 300 : 8).reduce((n, p) => n + Math.max(0, p.value), 0);

  return (
    <>
      <PageHead
        index="SELLER / OVERVIEW"
        title="Studio"
        action={
          <ButtonLink href="/seller/services/new" arrow>
            New service
          </ButtonLink>
        }
      />
      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-[2px] border border-line p-4">
        <p className="label-fg">Availability</p>
        <Segmented<AvailabilityStatus>
          options={[
            { value: "open", label: "Open" },
            { value: "limited", label: "Limited" },
            { value: "booked", label: "Booked" },
          ]}
          value={availability}
          onChange={setAvailability}
        />
        <p className="text-[13px] text-mute">{availability === "open" ? "Taking new projects." : availability === "limited" ? "Shown with a waitlist." : "Hidden from “Available now”."}</p>
      </div>
      <Metrics cols={3}>
        <Metric label="Earned, 4 weeks" value={moneyShort(month)} note="After FADE's 10%" />
        <Metric label="Pending clearance" value={moneyShort(pending)} note="In escrow" />
        <Metric label="Active orders" value={active.length} note={`${requests.length} new requests`} alert={requests.length > 0} />
        <Metric label="Rating" value={creator?.stats.rating ? `★ ${creator.stats.rating.toFixed(1)}` : "—"} note={`${creator?.stats.projects ?? 0} projects`} />
        <Metric label="On-time delivery" value={`${creator?.stats.onTimePct ?? 100}%`} note="Last 90 days" />
        <Metric label="Profile views" value={int(views)} note="Last 4 weeks" />
      </Metrics>

      <section className="mt-12">
        <h2 className="label-fg">Earnings · last 8 weeks</h2>
        <div className="mt-4">
          <ColumnChart data={earnings} fmt={moneyShort} title="Weekly earnings, last 8 weeks" />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="label-fg">Orders needing you</h2>
          <Link href="/seller/orders" className="label hover:text-fg">
            ALL ORDERS →
          </Link>
        </div>
        {[...requests, ...orders.filter((o) => o.status === "confirmed" || o.status === "in_progress")].length ? (
          <div className="border-t border-line">
            {[...requests, ...orders.filter((o) => o.status === "confirmed" || o.status === "in_progress")].slice(0, 5).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing in the queue" body="New requests appear here the moment a client books." />
        )}
      </section>
    </>
  );
}

function Services() {
  const services = useMyServices();
  const orders = useApp((s) => s.orders);
  const userServices = useApp((s) => s.userServices);
  const setStatus = useApp((s) => s.setServiceStatus);
  const remove = useApp((s) => s.deleteService);
  return (
    <>
      <PageHead index="SELLER / SERVICES" title="Services" action={<ButtonLink href="/seller/services/new" arrow>New service</ButtonLink>} />
      {services.length ? (
        <ul className="border-t border-fg">
          {services.map((s) => {
            const own = userServices.some((u) => u.id === s.id);
            const count = orders.filter((o) => o.serviceId === s.id).length;
            return (
              <li key={s.id} className="grid grid-cols-[96px_1fr] gap-4 border-b border-line py-4 md:grid-cols-[120px_1fr_90px_90px_auto] md:items-center">
                <Cover art={s.art} media={s.media?.[0]} className="aspect-[4/3] rounded-[2px]" />
                <div className="min-w-0">
                  <Link href={`/service/${s.slug}`} className="line-clamp-2 text-[15px] font-medium hover:underline">
                    {s.title}
                  </Link>
                  <p className="label mt-1">
                    <span className={s.status === "active" ? "text-fg" : ""}>{s.status}</span> · FROM {money(startingPrice(s))}
                  </p>
                </div>
                <p className="mono num text-[12px] md:text-right">
                  {count} <span className="text-mute">ORDERS</span>
                </p>
                <p className="mono num text-[12px] md:text-right">
                  {int(s.views ?? (hash(s.id) % 3000) + 400)} <span className="text-mute">VIEWS</span>
                </p>
                <div className="col-span-2 flex gap-2 md:col-span-1 md:justify-end">
                  <Button size="sm" variant="line" onClick={() => (setStatus(s.id, s.status === "active" ? "paused" : "active"), toast(s.status === "active" ? "Service paused" : "Service live"))}>
                    {s.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  {own && (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${s.title}`}
                      onClick={() => {
                        if (window.confirm("Delete this service? This can't be undone.")) {
                          remove(s.id);
                          toast("Service deleted");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No services yet" body="A service is a fixed-scope offer with three packages." action={<ButtonLink href="/seller/services/new" size="sm" arrow>Publish your first</ButtonLink>} />
      )}
    </>
  );
}

function Analytics() {
  const user = useApp((s) => s.user)!;
  const services = useMyServices();
  const orders = useModeOrders();
  const scale = user.isDemo ? 1 : 0.02;
  const views = weekly(hash(user.id) + 1, 12, 240 * scale, 90 * scale).map((p) => ({ ...p, value: Math.max(0, p.value) }));
  const totalViews = views.reduce((n, p) => n + p.value, 0);
  const contacts = Math.round(totalViews * 0.06);
  const funnel: [string, number][] = [
    ["Service views", totalViews],
    ["Profile visits", Math.round(totalViews * 0.31)],
    ["Messages", contacts],
    ["Orders", orders.length],
  ];
  return (
    <>
      <PageHead index="SELLER / ANALYTICS" title="Analytics" />
      <section>
        <h2 className="label-fg">Service views · 12 weeks</h2>
        <div className="mt-4">
          <LineChart data={views} fmt={(n) => int(Math.round(n))} title="Weekly service views, last 12 weeks" />
        </div>
      </section>
      <section className="mt-12">
        <h2 className="label-fg mb-4">Conversion</h2>
        <ol className="space-y-3">
          {funnel.map(([k, v], i) => (
            <li key={k} className="grid grid-cols-[130px_1fr_80px] items-center gap-4">
              <span className="text-[14px]">{k}</span>
              <span className="h-2 bg-soft">
                <span className="block h-full bg-fg" style={{ width: `${funnel[0][1] ? Math.max(1, (v / funnel[0][1]) * 100) : 0}%` }} />
              </span>
              <span className="mono num text-right text-[12px]">
                {int(v)}
                {i > 0 && funnel[i - 1][1] > 0 && <span className="text-mute"> · {Math.round((v / funnel[i - 1][1]) * 100)}%</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-12">
        <h2 className="label-fg mb-4">By service</h2>
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[520px] text-[14px]">
            <thead>
              <tr className="label border-b border-fg text-left">
                <th className="py-3 font-normal">SERVICE</th>
                <th className="py-3 text-right font-normal">VIEWS</th>
                <th className="py-3 text-right font-normal">ORDERS</th>
                <th className="py-3 text-right font-normal">REVENUE</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => {
                const os = orders.filter((o) => o.serviceId === s.id && o.status !== "cancelled");
                return (
                  <tr key={s.id} className="border-b border-line">
                    <td className="max-w-[280px] truncate py-3 pr-4">{s.title}</td>
                    <td className="num py-3 text-right">{int(s.views ?? (hash(s.id) % 3000) + 400)}</td>
                    <td className="num py-3 text-right">{os.length}</td>
                    <td className="num py-3 text-right">{money(os.reduce((n, o) => n + o.price * CUT, 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Earnings() {
  const orders = useModeOrders();
  const earnings = useEarnings(orders);
  const [withdrawn, setWithdrawn] = useState(0); // ponytail: session-only; add a payouts table when a real backend lands
  const [confirm, setConfirm] = useState(false);
  const released = orders.filter((o) => o.payment.status === "released");
  const available = Math.max(0, released.reduce((n, o) => n + o.price * CUT, 0) - withdrawn);
  const pending = orders.filter((o) => o.payment.status === "escrow").reduce((n, o) => n + o.price * CUT, 0);
  return (
    <>
      <PageHead index="SELLER / EARNINGS" title="Earnings" action={<Button disabled={!available} onClick={() => setConfirm(true)} arrow>Withdraw</Button>} />
      <Metrics cols={3}>
        <Metric label="Available" value={money(available)} note="Ready to withdraw" />
        <Metric label="Pending" value={money(pending)} note="Clears when clients release" />
        <Metric label="8-week total" value={money(earnings.reduce((n, p) => n + p.value, 0))} />
      </Metrics>
      <section className="mt-12">
        <h2 className="label-fg">Weekly earnings</h2>
        <div className="mt-4">
          <ColumnChart data={earnings} fmt={moneyShort} title="Weekly earnings, last 8 weeks" />
        </div>
      </section>
      <section className="mt-12">
        <h2 className="label-fg mb-3">Released payments</h2>
        {released.length ? (
          <ul className="border-t border-line">
            {released.map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b border-line py-3 text-[14px]">
                <Link href={`/orders/${o.id}`} className="mono num text-[12px] hover:underline">
                  #{o.id}
                </Link>
                <span className="mono num text-[12px] text-mute">{dateShort(o.stageTimes.completed ?? o.deadline)}</span>
                <span className="num">{money(o.price * CUT)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-mute">Nothing released yet.</p>
        )}
      </section>
      <Modal open={confirm} onOpenChange={setConfirm} title={`Withdraw ${money(available)}`} description="To HDFC Bank ···· 4421. Arrives in 1–2 working days.">
        <div className="flex gap-2 p-5">
          <Button variant="line" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              toast(`${money(available)} on its way`, "Demo payout — no money moves.", "success");
              setWithdrawn((w) => w + available);
              setConfirm(false);
            }}
          >
            Confirm withdrawal
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Reviews() {
  const user = useApp((s) => s.user)!;
  const creator = useCreator(user.id);
  const written = useApp((s) => s.writtenReviews);
  const reviews = [...written.filter((r) => r.creatorId === user.id), ...reviewsForCreator(user.id, 20)];
  return (
    <>
      <PageHead index="SELLER / REVIEWS" title="Reviews" />
      {creator?.stats.rating ? <ReviewSummary rating={creator.stats.rating} count={reviews.length} /> : null}
      <div className="mt-6">
        <ReviewList reviews={reviews} canReply />
      </div>
    </>
  );
}

const VARIANTS: ArtVariant[] = ["dots", "lines", "rings", "grid", "bars", "blocks", "wire", "wave", "scatter", "glyph"];

function Portfolio() {
  const user = useApp((s) => s.user)!;
  const mine = useApp((s) => s.portfolio);
  const add = useApp((s) => s.addProject);
  const remove = useApp((s) => s.removeProject);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", discipline: "", year: String(new Date().getFullYear()), summary: "", result: "", tags: "", client: "", variant: "dots" as ArtVariant });
  const projects = [...mine, ...projectsByCreator(user.id)];
  return (
    <>
      <PageHead
        index="SELLER / PORTFOLIO"
        title="Portfolio"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add project
          </Button>
        }
      />
      {projects.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="relative">
              <ProjectTile project={p} />
              {mine.some((m) => m.id === p.id) && (
                <Button size="icon" variant="ghost" className="absolute right-2 top-2 bg-bg" aria-label={`Remove ${p.title}`} onClick={() => window.confirm("Remove this project?") && remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects yet" body="Three strong case studies beat twenty thumbnails." />
      )}
      <Modal open={open} onOpenChange={setOpen} title="Add project" description="Shown on your public profile.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add({
              title: f.title.trim(),
              discipline: f.discipline.trim() || "Project",
              year: Number(f.year) || new Date().getFullYear(),
              summary: f.summary.trim(),
              result: f.result.trim(),
              tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
              client: f.client.trim() || undefined,
              art: { variant: f.variant, seed: (hash(f.title) % 900) + 1 },
            });
            toast("Project added", undefined, "success");
            setOpen(false);
            setF({ ...f, title: "", summary: "", result: "", tags: "", client: "" });
          }}
          className="space-y-4 p-5"
        >
          <Artwork variant={f.variant} seed={(hash(f.title) % 900) + 1} marks className="aspect-[16/9] rounded-[2px]" />
          <Field label="Cover style">
            <Select value={f.variant} onChange={(e) => setF({ ...f, variant: e.target.value as ArtVariant })}>
              {VARIANTS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </Select>
          </Field>
          <Field label="Title">
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Discipline">
              <Input value={f.discipline} onChange={(e) => setF({ ...f, discipline: e.target.value })} placeholder="Brand identity" />
            </Field>
            <Field label="Year">
              <Input type="number" min={1990} max={2100} value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} />
            </Field>
          </div>
          <Field label="Summary">
            <Textarea value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Result">
              <Input value={f.result} onChange={(e) => setF({ ...f, result: e.target.value })} placeholder="+34% conversion" required />
            </Field>
            <Field label="Client">
              <Input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} />
            </Field>
          </div>
          <Field label="Tags" hint="Comma separated.">
            <Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} />
          </Field>
          <Button type="submit" className="w-full">
            Add to portfolio
          </Button>
        </form>
      </Modal>
    </>
  );
}
