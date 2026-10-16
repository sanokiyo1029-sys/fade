"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { StatusBadge } from "@/components/market";
import { Thread } from "@/components/thread";
import { ButtonLink, EmptyState, Meta, Skeleton } from "@/components/ui";
import { useApp } from "@/store/app";
import { useRequireAuth, useService } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { resolveParty } from "@/lib/resolve";
import { ago, dateShort, money, timeLeft } from "@/lib/format";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

function preview(c: Conversation) {
  const m = c.messages[c.messages.length - 1];
  if (!m) return "No messages yet";
  if (m.attachments?.length) return `${m.from === "me" ? "You: " : ""}${m.attachments.length} attachment${m.attachments.length > 1 ? "s" : ""}`;
  return `${m.from === "me" ? "You: " : ""}${m.text ?? ""}`;
}

export function Messages({ initial }: { initial: string | null }) {
  const { ready, user } = useRequireAuth();
  const all = useApp((s) => s.conversations);
  const mode = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  const setHideNav = useUI((s) => s.setHideNav);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(initial);

  // a deep link may point at a thread from the other side of the marketplace
  useEffect(() => {
    const c = all.find((x) => x.id === initial);
    if (c && c.role !== mode) setMode(c.role);
  }, [initial, all, mode, setMode]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter((c) => c.role === mode)
      .filter((c) => !needle || resolveParty(c.partyId, user).name.toLowerCase().includes(needle) || preview(c).toLowerCase().includes(needle))
      .sort((a, b) => (b.messages.at(-1)?.ts ?? 0) - (a.messages.at(-1)?.ts ?? 0));
  }, [all, mode, q, user]);
  const conv = all.find((c) => c.id === active && c.role === mode);

  useEffect(() => {
    setHideNav(!!conv);
    return () => setHideNav(false);
  }, [conv, setHideNav]);

  if (!ready || !user) return <div className="shell py-12"><Skeleton className="h-[60svh]" /></div>;

  return (
    <div className="mx-auto grid h-[calc(100svh-var(--header-h)-var(--nav-h))] max-w-[1440px] md:h-[calc(100svh-var(--header-h))] md:grid-cols-[320px_1fr] md:border-x md:border-line xl:grid-cols-[320px_1fr_300px]">
      <aside className={cn("flex min-h-0 flex-col border-r border-line", conv && "hidden md:flex")} aria-label="Conversations">
        <div className="border-b border-line p-4">
          <h1 className="text-[22px]">Messages</h1>
          <p className="label mt-1">{mode === "buyer" ? "AS A BUYER" : "AS A SELLER"}</p>
          <label className="mt-3 flex h-9 items-center gap-2 rounded-[2px] border border-line px-3 focus-within:border-fg">
            <Search className="h-3.5 w-3.5 text-mute" />
            <span className="sr-only">Search conversations</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full bg-transparent text-[13.5px] outline-none" />
          </label>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {list.map((c) => {
            const p = resolveParty(c.partyId, user);
            const last = c.messages.at(-1);
            return (
              <li key={c.id}>
                <button type="button" onClick={() => setActive(c.id)} className={cn("flex w-full gap-3 border-b border-line px-4 py-3.5 text-left transition-colors hover:bg-soft", c.id === active && "bg-soft")}>
                  <Avatar seed={p.seed} size={40} online={p.online} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-[14px]", c.unread ? "font-semibold" : "font-medium")}>{p.name}</span>
                      {last && <span className="mono num shrink-0 text-[10.5px] text-mute">{ago(last.ts)}</span>}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className={cn("line-clamp-1 flex-1 text-[12.5px]", c.unread ? "text-fg" : "text-mute")}>{c.typing ? "Typing…" : preview(c)}</span>
                      {c.unread > 0 && <span className="num flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[9.5px] text-white">{c.unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {!list.length && <p className="px-4 py-10 text-center text-[13px] text-mute">{q ? "No conversations match." : "No conversations yet."}</p>}
        </ul>
      </aside>

      {conv ? (
        <Thread conv={conv} onBack={() => setActive(null)} className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-30 bg-bg md:static md:z-auto md:h-full" />
      ) : (
        <div className="hidden items-center justify-center p-8 md:flex">
          <EmptyState title="Select a conversation" body="Messages with creators and clients appear here, next to the order they belong to." action={mode === "buyer" ? <ButtonLink href="/explore" variant="line" size="sm">Find a creator</ButtonLink> : undefined} />
        </div>
      )}

      <aside className="hidden min-h-0 overflow-y-auto border-l border-line xl:block" aria-label="Project details">
        {conv ? <SidePanel conv={conv} /> : null}
      </aside>
    </div>
  );
}

function SidePanel({ conv }: { conv: Conversation }) {
  const user = useApp((s) => s.user);
  const order = useApp((s) => s.orders.find((o) => o.id === conv.orderId));
  const service = useService(order?.serviceId ?? conv.serviceId ?? "");
  const p = resolveParty(conv.partyId, user);
  return (
    <div className="space-y-8 p-5">
      <section className="text-center">
        <Avatar seed={p.seed} size={72} online={p.online} className="mx-auto" />
        <p className="mt-3 text-[16px] font-medium">{p.name}</p>
        <p className="mt-1 text-[12.5px] text-mute">{p.subtitle}</p>
        {p.username && (
          <Link href={`/creator/${p.username}`} className="label mt-3 inline-block hover:text-fg">
            VIEW PROFILE →
          </Link>
        )}
      </section>
      {order ? (
        <section className="space-y-4 border-t border-line pt-6">
          <p className="label-fg">Project</p>
          <p className="text-[14px] font-medium">{service?.title}</p>
          <StatusBadge status={order.status} />
          <dl className="grid grid-cols-2 gap-4">
            <Meta k="Amount" v={money(order.price)} />
            <Meta k="Payment" v={order.payment.status.toUpperCase()} />
            <Meta k="Placed" v={dateShort(order.createdAt)} />
            <Meta k="Time left" v={["completed", "cancelled", "delivered"].includes(order.status) ? "—" : timeLeft(order.deadline).label} />
          </dl>
          <ButtonLink href={`/orders/${order.id}`} variant="line" size="sm" className="w-full" arrow>
            Open order
          </ButtonLink>
        </section>
      ) : service ? (
        <section className="space-y-3 border-t border-line pt-6">
          <p className="label-fg">Enquiry about</p>
          <Link href={`/service/${service.slug}`} className="block text-[14px] font-medium hover:underline">
            {service.title}
          </Link>
          <ButtonLink href={`/checkout?service=${service.id}&package=2`} size="sm" className="w-full" arrow>
            Start project
          </ButtonLink>
        </section>
      ) : null}
    </div>
  );
}
