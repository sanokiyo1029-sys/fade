"use client";

import { useState } from "react";
import { NotificationRow, useModeNotifications } from "@/components/chrome";
import { Button, EmptyState, Skeleton, TabBar } from "@/components/ui";
import { useApp } from "@/store/app";
import { useRequireAuth } from "@/store/hooks";
import { dayLabel } from "@/lib/format";

export default function Notifications() {
  const { ready, user } = useRequireAuth();
  const all = useModeNotifications();
  const mode = useApp((s) => s.mode);
  const markAllRead = useApp((s) => s.markAllRead);
  const [tab, setTab] = useState<"all" | "unread" | "important">("all");
  if (!ready || !user) return <div className="shell py-12"><Skeleton className="h-96" /></div>;

  const list = all.filter((n) => (tab === "unread" ? !n.read : tab === "important" ? n.important : true));
  const unread = all.filter((n) => !n.read).length;

  return (
    <div className="shell max-w-3xl py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">NOTIFICATIONS / {mode === "buyer" ? "BUYING" : "SELLING"}</p>
          <h1 className="display mt-3 text-[40px] md:text-[56px]">Notifications</h1>
        </div>
        <Button variant="line" size="sm" disabled={!unread} onClick={markAllRead}>
          Mark all read
        </Button>
      </div>
      <div className="mt-8">
        <TabBar
          tabs={[
            { value: "all", label: "All", count: all.length },
            { value: "unread", label: "Unread", count: unread },
            { value: "important", label: "Important", count: all.filter((n) => n.important).length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {list.length ? (
        <div className="mt-2">
          {list.map((n, i) => {
            const day = dayLabel(n.ts);
            const head = i === 0 || dayLabel(list[i - 1].ts) !== day;
            return (
              <div key={n.id}>
                {head && <p className="label px-4 pb-2 pt-6">{day}</p>}
                <NotificationRow n={n} />
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState className="mt-8" title="All clear" body="Order updates, messages and payments show up here." />
      )}
    </div>
  );
}
