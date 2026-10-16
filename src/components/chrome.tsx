"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dialog as D, Popover as P } from "radix-ui";
import { ArrowUpRight, Bell, Compass, House, Inbox, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Search, Settings, User, X } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button, ButtonLink, Segmented, StatusDot, buttonVariants } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { useApp } from "@/store/app";
import { useServices, useUnread } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { suggest } from "@/lib/search";
import { ago } from "@/lib/format";
import { startingPrice } from "@/data/services";
import { money } from "@/lib/format";
import type { Mode, Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Rehydrates the persisted store after mount so SSR and first paint agree. */
export function Hydrate() {
  useEffect(() => {
    const off = useApp.persist.onFinishHydration(() => useApp.setState({ ready: true }));
    useApp.persist.rehydrate();
    return off;
  }, []);
  return null;
}

export const homeFor = (mode: Mode) => (mode === "seller" ? "/seller" : "/dashboard");

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-freelancers", label: "For freelancers" },
];

function CountBadge({ n }: { n: number }) {
  if (!n) return null;
  return <span className="num absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[9.5px] text-white">{n > 9 ? "9+" : n}</span>;
}

/* ───────── header ───────── */

export function Header() {
  const user = useApp((s) => s.user);
  const ready = useApp((s) => s.ready);
  const mode = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  const unread = useUnread();
  const openSearch = useUI((s) => s.setSearchOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--header-h)] border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="shell flex h-full items-center gap-6">
        <Link href="/" aria-label="FADE home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.06em] transition-colors hover:text-fg", pathname.startsWith(n.href) ? "text-fg" : "text-mute")}>
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => openSearch(true)}
          className="ml-auto hidden h-9 w-full max-w-[300px] items-center gap-2 rounded-[2px] border border-line px-3 text-left text-[13px] text-faint transition-colors hover:border-fg md:flex"
        >
          <Search className="h-3.5 w-3.5 text-mute" />
          <span className="flex-1 truncate">Search services, creators…</span>
          <kbd className="mono rounded-[2px] border border-line px-1 text-[10px] text-mute">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button type="button" onClick={() => openSearch(true)} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")} aria-label="Search">
            <Search className="h-4 w-4" />
          </button>

          {!ready ? (
            <span className="skeleton hidden h-8 w-36 rounded-[2px] md:block" />
          ) : user ? (
            <>
              {user.roles.includes("seller") && (
                <Segmented
                  size="sm"
                  className="mr-2 hidden md:inline-flex"
                  options={[
                    { value: "buyer", label: "Buying" },
                    { value: "seller", label: "Selling" },
                  ]}
                  value={mode}
                  onChange={(m) => {
                    setMode(m);
                    if (pathname.startsWith("/dashboard") || pathname.startsWith("/seller")) router.push(homeFor(m));
                  }}
                />
              )}
              <Link href="/messages" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative hidden md:inline-flex")} aria-label={`Messages${unread.messages ? `, ${unread.messages} unread` : ""}`}>
                <MessageSquare className="h-4 w-4" />
                <CountBadge n={unread.messages} />
              </Link>
              <NotificationsPopover count={unread.notifications} />
              <AccountMenu />
            </>
          ) : (
            <>
              <ButtonLink href={`/auth/sign-in?next=${encodeURIComponent(pathname)}`} variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </ButtonLink>
              <ButtonLink href="/auth/sign-up" size="sm">
                Join
              </ButtonLink>
            </>
          )}
          <button type="button" onClick={() => setMenuOpen(true)} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")} aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
}

const NOTIF_GLYPH: Record<Notification["type"], string> = {
  message: "MSG",
  order: "ORD",
  update: "UPD",
  payment: "PAY",
  review: "REV",
  deadline: "DUE",
  delivery: "DLV",
  availability: "AVL",
};

export function NotificationRow({ n, onClick }: { n: Notification; onClick?: () => void }) {
  const markRead = useApp((s) => s.markRead);
  return (
    <Link
      href={n.href}
      onClick={() => {
        markRead(n.id);
        onClick?.();
      }}
      className={cn("grid grid-cols-[40px_1fr_auto] gap-3 border-b border-line px-4 py-3.5 transition-colors hover:bg-soft", !n.read && "bg-soft/60")}
    >
      <span className={cn("mono flex h-8 w-10 items-center justify-center rounded-[2px] border text-[9.5px]", n.important ? "border-signal text-signal" : "border-line text-mute")}>{NOTIF_GLYPH[n.type]}</span>
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-medium">{n.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[12.5px] text-mute">{n.body}</span>
      </span>
      <span className="flex flex-col items-end gap-2">
        <span className="mono num text-[10.5px] text-mute">{ago(n.ts)}</span>
        {!n.read && <StatusDot tone="signal" />}
      </span>
    </Link>
  );
}

export function useModeNotifications() {
  const notifications = useApp((s) => s.notifications);
  const mode = useApp((s) => s.mode);
  return useMemo(() => notifications.filter((n) => n.mode === mode || n.mode === "both").sort((a, b) => b.ts - a.ts), [notifications, mode]);
}

function NotificationsPopover({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const list = useModeNotifications();
  const markAllRead = useApp((s) => s.markAllRead);
  return (
    <P.Root open={open} onOpenChange={setOpen}>
      <P.Trigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")} aria-label={`Notifications${count ? `, ${count} unread` : ""}`}>
        <Bell className="h-4 w-4" />
        <CountBadge n={count} />
      </P.Trigger>
      <P.Portal>
        <P.Content align="end" sideOffset={10} className="z-50 w-[min(380px,calc(100vw-24px))] animate-rise rounded-[2px] border border-fg bg-bg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="label-fg">Notifications</p>
            {count > 0 && (
              <button type="button" onClick={markAllRead} className="label hover:text-fg">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {list.length ? list.slice(0, 6).map((n) => <NotificationRow key={n.id} n={n} onClick={() => setOpen(false)} />) : <p className="px-4 py-10 text-center text-[13px] text-mute">Nothing new.</p>}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="label-fg flex items-center justify-center gap-1.5 py-3 hover:bg-soft">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </P.Content>
      </P.Portal>
    </P.Root>
  );
}

function AccountMenu() {
  const user = useApp((s) => s.user)!;
  const mode = useApp((s) => s.mode);
  const signOut = useApp((s) => s.signOut);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const home = homeFor(mode);
  const items = [
    { href: home, label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "Orders", icon: Package },
    { href: `/creator/${user.username}`, label: "Public profile", icon: User },
    { href: `${home}/settings`, label: "Settings", icon: Settings },
  ];
  return (
    <P.Root open={open} onOpenChange={setOpen}>
      <P.Trigger className="ml-1 rounded-[2px]" aria-label="Account menu">
        <Avatar seed={user.id} size={30} />
      </P.Trigger>
      <P.Portal>
        <P.Content align="end" sideOffset={10} className="z-50 w-60 animate-rise rounded-[2px] border border-fg bg-bg py-1">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[14px] font-medium">{user.name}</p>
            <p className="label mt-0.5 truncate">{user.email}</p>
          </div>
          {items.map((it) => (
            <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] hover:bg-soft">
              <it.icon className="h-4 w-4 text-mute" />
              {it.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              signOut();
              setOpen(false);
              router.push("/");
            }}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-[13.5px] hover:bg-soft"
          >
            <LogOut className="h-4 w-4 text-mute" />
            Sign out
          </button>
        </P.Content>
      </P.Portal>
    </P.Root>
  );
}

/* ───────── mobile ───────── */

function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const user = useApp((s) => s.user);
  const mode = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  const signOut = useApp((s) => s.signOut);
  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Portal>
        <D.Content className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg pb-safe outline-none animate-rise">
          <D.Title className="sr-only">Menu</D.Title>
          <D.Description className="sr-only">Site navigation</D.Description>
          <div className="shell flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line">
            <Logo />
            <D.Close className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Close menu">
              <X className="h-4 w-4" />
            </D.Close>
          </div>
          <nav className="shell flex-1 py-6" aria-label="Mobile">
            {[...NAV, ...(user ? [{ href: homeFor(mode), label: "Dashboard" }, { href: "/orders", label: "Orders" }, { href: "/messages", label: "Messages" }, { href: "/notifications", label: "Notifications" }] : [])].map((n, i) => (
              <Link key={n.href} href={n.href} className="flex items-baseline gap-4 border-b border-line py-4 text-[28px] font-medium tracking-[-0.04em]">
                <span className="mono num text-[11px] text-mute">{String(i + 1).padStart(2, "0")}</span>
                {n.label}
              </Link>
            ))}
            <p className="label mb-3 mt-8">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/explore?category=${c.slug}`} className="rounded-[2px] border border-line px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em]">
                  {c.short}
                </Link>
              ))}
            </div>
          </nav>
          <div className="shell space-y-3 border-t border-line py-5">
            {user ? (
              <>
                {user.roles.includes("seller") && (
                  <Segmented
                    className="flex w-full"
                    options={[
                      { value: "buyer", label: "Buying" },
                      { value: "seller", label: "Selling" },
                    ]}
                    value={mode}
                    onChange={setMode}
                  />
                )}
                <Button variant="line" className="w-full" onClick={() => (signOut(), setOpen(false))}>
                  Sign out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/auth/sign-in" variant="line">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/auth/sign-up">Join FADE</ButtonLink>
              </div>
            )}
          </div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const hide = useUI((s) => s.hideNav);
  const user = useApp((s) => s.user);
  const mode = useApp((s) => s.mode);
  const unread = useUnread();
  if (hide) return null;
  const items = [
    { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
    { href: "/explore", label: "Explore", icon: Compass, match: (p: string) => p.startsWith("/explore") || p.startsWith("/categories") },
    { href: "/messages", label: "Messages", icon: MessageSquare, match: (p: string) => p.startsWith("/messages"), n: unread.messages },
    { href: "/orders", label: "Orders", icon: Inbox, match: (p: string) => p.startsWith("/orders") },
    { href: user ? homeFor(mode) : "/auth/sign-in", label: "Profile", icon: User, match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/seller") || p.startsWith("/auth") },
  ];
  return (
    <nav aria-label="Bottom" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-safe backdrop-blur-md md:hidden">
      <div className="grid h-[var(--nav-h)] grid-cols-5">
        {items.map((it) => {
          const on = it.match(pathname);
          return (
            <Link key={it.label} href={it.href} aria-current={on ? "page" : undefined} className={cn("relative flex flex-col items-center justify-center gap-1", on ? "text-fg" : "text-mute")}>
              <span className="relative">
                <it.icon className="h-[18px] w-[18px]" strokeWidth={on ? 2 : 1.5} />
                <CountBadge n={it.n ?? 0} />
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.06em]">{it.label}</span>
              {on && <span className="absolute inset-x-6 top-0 h-px bg-fg" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ───────── search overlay ───────── */

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const services = useServices();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const res = useMemo(() => suggest(services, q), [services, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUI.getState().searchOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <D.Content
          onOpenAutoFocus={(e) => (e.preventDefault(), input.current?.focus())}
          className="fixed inset-x-0 top-0 z-50 max-h-[100svh] overflow-y-auto border-b border-fg bg-bg outline-none animate-rise md:left-1/2 md:top-[12vh] md:w-[640px] md:-translate-x-1/2 md:border"
        >
          <D.Title className="sr-only">Search</D.Title>
          <D.Description className="sr-only">Search services, creators and categories</D.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
            }}
            className="flex h-14 items-center gap-3 border-b border-line px-4"
          >
            <Search className="h-4 w-4 shrink-0 text-mute" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “brand identity” or “n8n automation”" aria-label="Search" className="h-full flex-1 bg-transparent text-[16px] outline-none" />
            <D.Close className="label hover:text-fg">ESC</D.Close>
          </form>
          <div className="grid gap-6 p-4 md:grid-cols-[1.5fr_1fr]">
            <section>
              <p className="label mb-2">{q ? "Services" : "Popular now"}</p>
              {res.services.length ? (
                res.services.map((s) => (
                  <button key={s.id} type="button" onClick={() => go(`/service/${s.slug}`)} className="flex w-full items-baseline justify-between gap-3 border-b border-line py-2.5 text-left text-[14px] hover:bg-soft">
                    <span className="line-clamp-1">{s.title}</span>
                    <span className="mono num shrink-0 text-[11px] text-mute">{money(startingPrice(s))}</span>
                  </button>
                ))
              ) : (
                <p className="py-3 text-[13px] text-mute">No services match “{q}”.</p>
              )}
            </section>
            <div className="space-y-6">
              {res.creators.length > 0 && (
                <section>
                  <p className="label mb-2">Creators</p>
                  {res.creators.map((c) => (
                    <button key={c.id} type="button" onClick={() => go(`/creator/${c.username}`)} className="flex w-full items-center gap-2.5 py-1.5 text-left text-[13.5px] hover:underline">
                      <Avatar seed={c.id} size={24} online={c.online} />
                      {c.name}
                    </button>
                  ))}
                </section>
              )}
              {res.categories.length > 0 && (
                <section>
                  <p className="label mb-2">Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {res.categories.map((c) => (
                      <button key={c.slug} type="button" onClick={() => go(`/explore?category=${c.slug}`)} className="rounded-[2px] border border-line px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] hover:border-fg">
                        {c.short}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/* ───────── footer ───────── */

const FOOTER: [string, [string, string][]][] = [
  ["Marketplace", [["Explore", "/explore"], ["Categories", "/categories"], ["How it works", "/how-it-works"], ["Trust & safety", "/info/security"]]],
  ["Creators", [["Sell on FADE", "/for-freelancers"], ["Publish a service", "/seller/services/new"], ["Seller levels", "/info/seller-levels"], ["Fees", "/info/fees"]]],
  ["Company", [["About", "/info/about"], ["Careers", "/info/careers"], ["Press", "/info/press"], ["Contact", "/info/contact"]]],
  ["Support", [["Help centre", "/info/help"], ["Terms", "/info/terms"], ["Privacy", "/info/privacy"], ["Cookies", "/info/cookies"]]],
];

const NO_FOOTER = ["/messages", "/auth", "/checkout", "/dashboard", "/seller"];

export function Footer() {
  const pathname = usePathname();
  if (NO_FOOTER.some((p) => pathname.startsWith(p))) return null;
  return (
    <footer className="dark-zone mb-[var(--nav-h)] md:mb-0">
      <div className="shell grid gap-10 py-16 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <LogoMark size={28} />
          <p className="mt-5 max-w-xs text-[14px] text-mute">Independent creators, booked directly. Escrowed payments, clear scopes, no bidding wars.</p>
        </div>
        {FOOTER.map(([h, links]) => (
          <div key={h}>
            <p className="label mb-4">{h}</p>
            <ul className="space-y-2.5">
              {links.map(([l, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-fg/80 hover:text-fg">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="shell overflow-hidden">
        <p className="display select-none text-[28vw] leading-[0.78] text-[color:var(--soft)] md:text-[22vw]" aria-hidden>
          FADE
        </p>
      </div>
      <div className="shell flex flex-col gap-3 border-t border-line py-5 md:flex-row md:items-center md:justify-between">
        <p className="label">© 2026 FADE Marketplace Pvt. Ltd. · Bengaluru</p>
        <p className="label flex items-center gap-2">
          <StatusDot tone="signal" pulse /> All systems normal
        </p>
      </div>
    </footer>
  );
}
