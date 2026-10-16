"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/brand/Avatar";
import { Button, Field, Input, Skeleton, Switch, Textarea } from "@/components/ui";
import { useApp } from "@/store/app";
import { useRequireAuth } from "@/store/hooks";
import { toast } from "@/store/ui";
import type { Mode } from "@/lib/types";
import { cn, rng } from "@/lib/utils";

/* ───────── shell ───────── */

export function DashShell({ base, mode, tabs, tab, title, children }: { base: string; mode: Mode; tabs: [string, string][]; tab: string; title: string; children: ReactNode }) {
  const { ready, user } = useRequireAuth();
  const current = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  useEffect(() => {
    if (ready && user && current !== mode) setMode(mode);
  }, [ready, user, current, mode, setMode]);

  if (!ready || !user) {
    return (
      <div className="shell py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-8 h-80" />
      </div>
    );
  }
  return (
    <div className="shell grid gap-8 py-6 md:py-10 lg:grid-cols-[200px_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:self-start">
        <div className="hidden items-center gap-3 lg:flex">
          <Avatar seed={user.id} size={40} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium">{user.name}</p>
            <p className="label">{mode === "seller" ? "SELLING" : "BUYING"}</p>
          </div>
        </div>
        <nav aria-label={title} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 lg:mx-0 lg:mt-8 lg:flex-col lg:border-0 lg:px-0">
          {tabs.map(([slug, label]) => (
            <Link
              key={slug}
              href={slug ? `${base}/${slug}` : base}
              aria-current={tab === slug ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b py-3 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors lg:border-b-0 lg:border-l lg:py-2 lg:pl-3",
                tab === slug ? "border-fg text-fg" : "border-transparent text-mute hover:text-fg",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function PageHead({ index, title, action }: { index: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="label">{index}</p>
        <h1 className="mt-2 text-[32px] md:text-[44px]">{title}</h1>
      </div>
      {action}
    </div>
  );
}

/* ───────── figures ───────── */

export function Metric({ label, value, note, alert }: { label: string; value: ReactNode; note?: string; alert?: boolean }) {
  return (
    <div className="bg-bg p-4 md:p-5">
      <p className="label flex items-center gap-1.5">
        {alert && <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-label="Needs attention" />}
        {label}
      </p>
      <p className="mt-3 text-[28px] font-medium tracking-[-0.04em] md:text-[34px]">{value}</p>
      {note && <p className="mono mt-1 text-[11px] text-mute">{note}</p>}
    </div>
  );
}

export function Metrics({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 }) {
  return <div className={cn("grid grid-cols-2 gap-px border border-line bg-line", cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4")}>{children}</div>;
}

/* ───────── charts (single series, monochrome) ───────── */

export interface Point {
  label: string;
  value: number;
}

const W = 640;
const H = 220;
const PAD = { t: 20, r: 12, b: 28, l: 52 };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p / 2) * 2 * p;
}

function Tooltip({ x, y, label, value }: { x: number; y: number; label: string; value: string }) {
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[2px] bg-fg px-2 py-1.5 text-bg" style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, marginTop: -8 }}>
      <p className="num whitespace-nowrap text-[13px] font-medium">{value}</p>
      <p className="mono whitespace-nowrap text-[10px] opacity-70">{label}</p>
    </div>
  );
}

function Frame({ data, fmt, title, children, hover }: { data: Point[]; fmt: (n: number) => string; title: string; children: (y: (v: number) => number, max: number) => ReactNode; hover: { x: number; y: number; p: Point } | null }) {
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label={`${title}. Table follows.`}>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(max * t)} y2={y(max * t)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.l - 8} y={y(max * t)} dy="0.32em" textAnchor="end" className="fill-[var(--mute)] font-mono text-[10px]">
              {fmt(max * t)}
            </text>
          </g>
        ))}
        {children(y, max)}
      </svg>
      {hover && <Tooltip x={hover.x} y={hover.y} label={hover.p.label} value={fmt(hover.p.value)} />}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{fmt(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Columns grow from one baseline; the tallest is direct-labelled, the rest live in the tooltip/table. */
export function ColumnChart({ data, fmt, title }: { data: Point[]; fmt: (n: number) => string; title: string }) {
  const [hover, setHover] = useState<{ x: number; y: number; p: Point } | null>(null);
  const band = (W - PAD.l - PAD.r) / data.length;
  const bw = Math.min(24, band * 0.55);
  const peak = data.reduce((m, d, i) => (d.value > data[m].value ? i : m), 0);
  return (
    <Frame data={data} fmt={fmt} title={title} hover={hover}>
      {(y) =>
        data.map((d, i) => {
          const cx = PAD.l + band * i + band / 2;
          const top = y(d.value);
          const h = Math.max(0, H - PAD.b - top);
          const r = Math.min(2, h / 2);
          const show = () => setHover({ x: cx, y: top, p: d });
          return (
            <g key={d.label} tabIndex={0} role="presentation" onPointerEnter={show} onFocus={show} onPointerLeave={() => setHover(null)} onBlur={() => setHover(null)} className="outline-none">
              <rect x={cx - band / 2} y={PAD.t} width={band} height={H - PAD.t - PAD.b} fill="transparent" />
              <path d={`M${cx - bw / 2} ${H - PAD.b}V${top + r}q0 ${-r} ${r} ${-r}h${bw - 2 * r}q${r} 0 ${r} ${r}V${H - PAD.b}Z`} fill={hover?.p === d ? "var(--fg)" : i === data.length - 1 ? "var(--fg)" : "var(--mute)"} />
              {i === peak && !hover && (
                <text x={cx} y={top - 6} textAnchor="middle" className="fill-[var(--fg)] font-mono text-[10px]">
                  {fmt(d.value)}
                </text>
              )}
              <text x={cx} y={H - 10} textAnchor="middle" className="fill-[var(--mute)] font-mono text-[10px]">
                {d.label}
              </text>
            </g>
          );
        })
      }
    </Frame>
  );
}

/** 2px line + 10% wash, crosshair readout on hover. */
export function LineChart({ data, fmt, title }: { data: Point[]; fmt: (n: number) => string; title: string }) {
  const [i, setI] = useState<number | null>(null);
  const step = (W - PAD.l - PAD.r) / (data.length - 1);
  const x = (k: number) => PAD.l + k * step;
  return (
    <Frame data={data} fmt={fmt} title={title} hover={null}>
      {(y) => {
        const line = data.map((d, k) => `${k ? "L" : "M"}${x(k)} ${y(d.value)}`).join("");
        const last = data.length - 1;
        const at = i ?? last;
        return (
          <>
            <path d={`${line}L${x(last)} ${H - PAD.b}L${PAD.l} ${H - PAD.b}Z`} fill="var(--fg)" opacity={0.08} />
            <path d={line} fill="none" stroke="var(--fg)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {i !== null && <line x1={x(i)} x2={x(i)} y1={PAD.t} y2={H - PAD.b} stroke="var(--fg)" strokeWidth={1} />}
            <circle cx={x(at)} cy={y(data[at].value)} r={4} fill="var(--fg)" stroke="var(--bg)" strokeWidth={2} />
            <text x={Math.min(x(at), W - PAD.r - 40)} y={y(data[at].value) - 12} textAnchor="middle" className="fill-[var(--fg)] font-mono text-[10px]">
              {fmt(data[at].value)} · {data[at].label}
            </text>
            {data.map((d, k) =>
              k % Math.ceil(data.length / 6) === 0 || k === last ? (
                <text key={d.label} x={x(k)} y={H - 10} textAnchor="middle" className="fill-[var(--mute)] font-mono text-[10px]">
                  {d.label}
                </text>
              ) : null,
            )}
            <rect
              x={PAD.l}
              y={PAD.t}
              width={W - PAD.l - PAD.r}
              height={H - PAD.t - PAD.b}
              fill="transparent"
              tabIndex={0}
              aria-label="Move with arrow keys to read values"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setI(Math.round(((e.clientX - r.left) / r.width) * last));
              }}
              onPointerLeave={() => setI(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setI(Math.min(last, (i ?? last) + 1));
                if (e.key === "ArrowLeft") setI(Math.max(0, (i ?? last) - 1));
              }}
              onBlur={() => setI(null)}
              className="outline-none"
            />
          </>
        );
      }}
    </Frame>
  );
}

/* ───────── settings (shared by both dashboards) ───────── */

export function Settings() {
  const user = useApp((s) => s.user)!;
  const prefs = useApp((s) => s.prefs);
  const updateProfile = useApp((s) => s.updateProfile);
  const setPrefs = useApp((s) => s.setPrefs);
  const signOut = useApp((s) => s.signOut);
  const router = useRouter();
  const [f, setF] = useState({ name: user.name, headline: user.headline, city: user.city, country: user.country, bio: user.bio, languages: user.languages.join(", "), skills: user.skills.join(", ") });
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  return (
    <div className="max-w-2xl space-y-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (f.name.trim().length < 2) return toast("Name is required", undefined, "error");
          updateProfile({ ...f, name: f.name.trim(), languages: list(f.languages), skills: list(f.skills) });
          toast("Profile saved", undefined, "success");
        }}
        className="space-y-4"
      >
        <h2 className="label-fg">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          </Field>
          <Field label="Email">
            <Input value={user.email} disabled />
          </Field>
          <Field label="City">
            <Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          </Field>
          <Field label="Country">
            <Input value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} />
          </Field>
        </div>
        <Field label="Headline">
          <Input value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} maxLength={90} />
        </Field>
        <Field label="Bio" hint="Separate paragraphs with a blank line.">
          <Textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} className="min-h-40" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Languages" hint="Comma separated.">
            <Input value={f.languages} onChange={(e) => setF({ ...f, languages: e.target.value })} />
          </Field>
          <Field label="Skills" hint="Comma separated.">
            <Input value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} />
          </Field>
        </div>
        <Button type="submit">Save profile</Button>
      </form>

      <section>
        <h2 className="label-fg mb-2">Notifications & security</h2>
        {(
          [
            ["emailOrders", "Order updates by email"],
            ["emailMessages", "New messages by email"],
            ["push", "Browser notifications"],
            ["marketing", "Product news (monthly at most)"],
            ["twoFactor", "Two-factor authentication"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center justify-between border-b border-line py-4 text-[14.5px]">
            {label}
            <Switch label={label} checked={prefs[k]} onChange={(v) => setPrefs({ [k]: v })} />
          </label>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="label-fg">Account</h2>
        <p className="text-[14px] text-mute">
          Signed in with {user.provider === "google" ? "Google" : "email"} · {user.email}. Everything is stored in this browser; signing out clears it.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (!window.confirm("Sign out and clear this browser's FADE data?")) return;
            signOut();
            router.push("/");
          }}
        >
          Sign out & clear data
        </Button>
      </section>
    </div>
  );
}

/** Deterministic weekly series for analytics we don't store (views, contacts). */
export function weekly(seed: number, n: number, base: number, spread: number): Point[] {
  const rnd = rng(seed);
  return Array.from({ length: n }, (_, i) => ({ label: `W${String(i + 1).padStart(2, "0")}`, value: Math.round(base * (0.7 + (i / n) * 0.5) + (rnd() - 0.5) * spread) }));
}
