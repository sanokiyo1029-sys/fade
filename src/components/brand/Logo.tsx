import { cn } from "@/lib/utils";

/**
 * FADE mark. /logo.png (white on transparent) is used as an alpha mask, so the
 * mark takes `currentColor` — black in the header, white inside `.dark-zone`.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{ width: size, height: size, mask: "url(/logo.png) center / contain no-repeat", WebkitMask: "url(/logo.png) center / contain no-repeat" }}
    />
  );
}

export function Logo({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg", className)} aria-label="FADE">
      <LogoMark size={size} />
      <span className="text-[17px] font-semibold leading-none tracking-[-0.06em]">FADE</span>
    </span>
  );
}
