"use client";

import Link from "next/link";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Checkbox as Cb, Dialog as D, Slider as Sl, Switch as Sw } from "radix-ui";
import { ArrowRight, Check, ChevronDown, Star, X } from "lucide-react";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

/* ───────── buttons ───────── */

export const buttonVariants = cva(
  "group/btn inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[2px] font-mono text-[11.5px] uppercase tracking-[0.06em] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-fg text-bg hover:bg-fg/80",
        outline: "border border-fg text-fg hover:bg-fg hover:text-bg",
        line: "border border-line text-fg hover:border-fg",
        ghost: "text-fg hover:bg-soft",
        danger: "border border-signal text-signal hover:bg-signal hover:text-white",
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-12 px-6", icon: "h-9 w-9 shrink-0" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type BtnProps = VariantProps<typeof buttonVariants> & { arrow?: boolean };

const Arrow = () => <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden />;

export function Button({ variant, size, arrow, className, children, type = "button", ...p }: ComponentProps<"button"> & BtnProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...p}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({ variant, size, arrow, className, children, ...p }: ComponentProps<typeof Link> & BtnProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...p}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/* ───────── form fields ───────── */

const field =
  "w-full rounded-[2px] border border-line bg-bg px-3 text-[14px] text-fg outline-none transition-colors hover:border-mute focus:border-fg aria-[invalid=true]:border-signal disabled:opacity-50";

export function Input({ className, ...p }: ComponentProps<"input">) {
  return <input className={cn(field, "h-10", className)} {...p} />;
}

export function Textarea({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-28 resize-y py-2.5 leading-relaxed", className)} {...p} />;
}

export function Select({ className, children, ...p }: ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select className={cn(field, "h-10 appearance-none pr-8")} {...p}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute" aria-hidden />
    </div>
  );
}

export function Field({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="label block">{label}</span>
      {children}
      {error ? <span className="label block !text-signal">{error}</span> : hint ? <span className="block text-[12.5px] text-mute">{hint}</span> : null}
    </label>
  );
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  const id = useId();
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px]">
      <Cb.Root
        aria-labelledby={id}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border border-fg data-[state=checked]:bg-fg"
      >
        <Cb.Indicator>
          <Check className="h-3 w-3 text-bg" strokeWidth={3} />
        </Cb.Indicator>
      </Cb.Root>
      <span id={id}>{children}</span>
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Sw.Root
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
      className="relative h-5 w-9 shrink-0 rounded-full border border-fg bg-bg transition-colors data-[state=checked]:bg-fg"
    >
      <Sw.Thumb className="block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-fg transition-transform data-[state=checked]:translate-x-[17px] data-[state=checked]:bg-bg" />
    </Sw.Root>
  );
}

export function RangeSlider({ value, onChange, onCommit, min, max, step, label }: { value: number[]; onChange: (v: number[]) => void; onCommit?: (v: number[]) => void; min: number; max: number; step: number; label: string }) {
  return (
    <Sl.Root value={value} onValueChange={onChange} onValueCommit={onCommit} min={min} max={max} step={step} minStepsBetweenThumbs={1} className="relative flex h-5 w-full touch-none select-none items-center">
      <Sl.Track className="relative h-px grow bg-line">
        <Sl.Range className="absolute h-px bg-fg" />
      </Sl.Track>
      {value.map((_, i) => (
        <Sl.Thumb key={i} aria-label={`${label} ${i ? "max" : "min"}`} className="block h-3.5 w-3.5 rounded-[2px] border border-fg bg-bg outline-none focus-visible:bg-fg" />
      ))}
    </Sl.Root>
  );
}

/** Segmented control — used for tabs, toggles and package tiers. */
export function Segmented<T extends string>({ options, value, onChange, className, size = "md" }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string; size?: "sm" | "md" }) {
  return (
    <div role="tablist" className={cn("inline-flex rounded-[2px] border border-line p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 whitespace-nowrap rounded-[1px] font-mono uppercase tracking-[0.06em] transition-colors",
            size === "sm" ? "h-7 px-2.5 text-[10.5px]" : "h-8 px-3 text-[11px]",
            o.value === value ? "bg-fg text-bg" : "text-mute hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Underlined tab strip for page-level sections. */
export function TabBar<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={t.value === value}
          onClick={() => onChange(t.value)}
          className={cn("-mb-px whitespace-nowrap border-b py-3 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors", t.value === value ? "border-fg text-fg" : "border-transparent text-mute hover:text-fg")}
        >
          {t.label}
          {t.count !== undefined && <span className="num ml-1.5 text-faint">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ───────── overlays ───────── */

/** Dialog (center), bottom sheet or side panel — same Radix primitive. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "center",
  className,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  side?: "center" | "bottom" | "right";
  className?: string;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-black/40 animate-[rise_.2s_ease-out_both]" />
        <D.Content
          className={cn(
            "fixed z-50 flex flex-col bg-bg text-fg outline-none",
            side === "center" && "left-1/2 top-1/2 max-h-[88svh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-fg",
            side === "bottom" && "inset-x-0 bottom-0 max-h-[90svh] border-t border-fg pb-safe animate-rise",
            side === "right" && "inset-y-0 right-0 w-full max-w-md border-l border-fg animate-rise",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <D.Title className="text-[17px] font-medium tracking-[-0.02em]">{title}</D.Title>
              {description ? <D.Description className="mt-1 text-[13px] text-mute">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
            </div>
            <D.Close className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Close">
              <X className="h-4 w-4" />
            </D.Close>
          </div>
          <div className="overflow-y-auto">{children}</div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-[calc(var(--nav-h)+12px)] left-4 right-4 z-[60] flex flex-col items-end gap-2 md:bottom-6 md:left-auto md:right-6 md:w-[360px]">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="pointer-events-auto flex w-full animate-rise items-start gap-3 rounded-[2px] border border-fg bg-fg p-3.5 text-bg">
          <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", t.tone === "error" ? "bg-signal" : "bg-bg")} />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium leading-snug">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[12.5px] leading-snug opacity-70">{t.body}</p>}
          </div>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ───────── display ───────── */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-[2px]", className)} />;
}

export function Stars({ value, size = 12, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} strokeWidth={1.5} className={i <= Math.round(value) ? "fill-fg text-fg" : "text-line"} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} star${i > 1 ? "s" : ""}`} onClick={() => onChange(i)} className="p-0.5">
          <Star className={cn("h-5 w-5", i <= value ? "fill-fg text-fg" : "text-line hover:text-mute")} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

/** ● LIVE-style status. `signal` uses the red reserved for system state. */
export function StatusDot({ tone = "fg", pulse, className }: { tone?: "fg" | "signal" | "mute" | "hollow"; pulse?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-flex h-1.5 w-1.5 shrink-0", className)} aria-hidden>
      {pulse && <span className={cn("absolute inset-0 animate-halo rounded-full", tone === "signal" ? "bg-signal" : "bg-fg")} />}
      <span
        className={cn(
          "relative h-1.5 w-1.5 rounded-full",
          tone === "fg" && "bg-fg",
          tone === "signal" && "bg-signal",
          tone === "mute" && "bg-faint",
          tone === "hollow" && "border border-fg",
        )}
      />
    </span>
  );
}

/** KEY / VALUE pair. */
export function Meta({ k, v, className }: { k: string; v: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="label">{k}</dt>
      <dd className="num mt-1 truncate text-[14px]">{v}</dd>
    </div>
  );
}

export function SectionHeader({ index, title, action, className }: { index?: string; title: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-6 border-b border-line pb-4", className)}>
      <div>
        {index && <p className="label mb-3">{index}</p>}
        <h2 className="text-[28px] md:text-[40px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action, className }: { title: string; body?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-dots flex flex-col items-center justify-center rounded-[2px] border border-dashed border-line px-6 py-16 text-center", className)}>
      <div className="bg-bg px-4 py-2">
        <p className="label-fg">{title}</p>
        {body && <p className="mx-auto mt-2 max-w-sm text-[14px] text-mute">{body}</p>}
      </div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Chip({ children, active, onClick, className }: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  const cls = cn(
    "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[2px] border px-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] transition-colors",
    active ? "border-fg bg-fg text-bg" : "border-line text-fg",
    onClick && !active && "hover:border-fg",
    className,
  );
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={active} className={cls}>
      {children}
    </button>
  ) : (
    <span className={cls}>{children}</span>
  );
}
