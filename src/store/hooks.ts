"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CREATOR_MAP } from "@/data/creators";
import { SERVICES } from "@/data/services";
import { userToCreator } from "@/lib/resolve";
import { isLive } from "@/lib/blobs";
import type { Creator, Order, Service } from "@/lib/types";
import { useApp } from "./app";

/** Catalogue + user-published services, with status overrides applied. */
export function useServices(): Service[] {
  const userServices = useApp((s) => s.userServices);
  const overrides = useApp((s) => s.serviceStatus);
  return useMemo(
    () => [...userServices.map((s) => (s.media ? { ...s, media: s.media.filter(isLive) } : s)), ...SERVICES.map((s) => (overrides[s.id] ? { ...s, status: overrides[s.id] } : s))],
    [userServices, overrides],
  );
}

export function useService(idOrSlug: string): Service | undefined {
  const all = useServices();
  return all.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
}

export function useCreator(id: string | undefined): Creator | undefined {
  const user = useApp((s) => s.user);
  return useMemo(() => {
    if (!id) return undefined;
    if (user && user.id === id) return userToCreator(user);
    return CREATOR_MAP[id] ?? Object.values(CREATOR_MAP).find((c) => c.username === id);
  }, [id, user]);
}

export function useMyServices(): Service[] {
  const all = useServices();
  const uid = useApp((s) => s.user?.id);
  return all.filter((s) => s.creatorId === uid);
}

/** Orders on the side of the marketplace the user is currently acting on. */
export function useModeOrders(): Order[] {
  const orders = useApp((s) => s.orders);
  const user = useApp((s) => s.user);
  const mode = useApp((s) => s.mode);
  return useMemo(
    () => orders.filter((o) => (mode === "buyer" ? o.buyerId === user?.id : o.sellerId === user?.id)).sort((a, b) => b.createdAt - a.createdAt),
    [orders, user, mode],
  );
}

export function useUnread() {
  const conversations = useApp((s) => s.conversations);
  const notifications = useApp((s) => s.notifications);
  const mode = useApp((s) => s.mode);
  return {
    messages: conversations.filter((c) => c.role === mode).reduce((n, c) => n + c.unread, 0),
    notifications: notifications.filter((n) => !n.read && (n.mode === mode || n.mode === "both")).length,
  };
}

/** Redirect to sign-in once we know there's no session. */
export function useRequireAuth() {
  const ready = useApp((s) => s.ready);
  const user = useApp((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (ready && !user) router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);
  return { ready, user };
}
