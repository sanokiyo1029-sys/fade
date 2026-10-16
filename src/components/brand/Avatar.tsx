import { cn, hash, r1, rng } from "@/lib/utils";

const PALETTE = [
  { bg: "#EFEFEF", ink: "#0A0A0A", invert: false },
  { bg: "#0A0A0A", ink: "#F2F2F2", invert: true },
  { bg: "#D9D9D9", ink: "#0A0A0A", invert: false },
];

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

interface Dot {
  x: number;
  y: number;
  r: number;
}

/**
 * Halftone portrait generator. A head, hair, neck and shoulders are
 * described as shapes; every point of a hex grid inside them becomes a dot
 * whose radius encodes tone. Same seed → same person, always.
 */
function portrait(seed: number, step: number, invert: boolean): Dot[] {
  const rnd = rng(seed);
  const hcx = 48 + (rnd() - 0.5) * 3;
  const hcy = 37 + rnd() * 3;
  const rx = 15 + rnd() * 4;
  const ry = 19 + rnd() * 3;
  const hair = Math.floor(rnd() * 5); // 0 short · 1 long · 2 bun · 3 none · 4 curly
  const light = rnd() < 0.5 ? -1 : 1;
  const sw = 36 + rnd() * 8; // shoulder half-width
  const out: Dot[] = [];
  const rowH = step * 0.866;
  const maxR = step * 0.56;

  for (let j = 0; j * rowH < 100; j++) {
    const y = 2 + j * rowH;
    for (let i = 0; i * step < 100; i++) {
      const x = 2 + i * step + (j % 2 ? step / 2 : 0);
      let dark = -1; // -1 = outside

      const dx = (x - hcx) / rx;
      const dy = (y - hcy) / ry;
      const inHead = dx * dx + dy * dy <= 1;
      const inNeck = Math.abs(x - hcx) <= 7.5 && y > hcy + ry - 6 && y < 70;
      const sx = (x - 48) / sw;
      const sy = (y - 118) / 54;
      const inShoulder = sx * sx + sy * sy <= 1 && y < 98;

      // hair
      let inHair = false;
      const hx = (x - hcx) / (rx + 2.4);
      const hy = (y - (hcy - 2)) / (ry + 2.6);
      const hairEllipse = hx * hx + hy * hy <= 1;
      if (hair === 0 && hairEllipse && y < hcy - 5) inHair = true;
      if (hair === 1) {
        const bx = (x - hcx) / (rx + 5);
        const by = (y - (hcy - 1)) / (ry + 5);
        if (bx * bx + by * by <= 1 && (y < hcy - 4 || Math.abs(x - hcx) > rx * 0.82)) inHair = true;
        if (Math.abs(x - hcx) > rx * 0.78 && Math.abs(x - hcx) < rx + 7 && y >= hcy && y < 84) inHair = true;
      }
      if (hair === 2) {
        if (hairEllipse && y < hcy - 6) inHair = true;
        if (Math.hypot(x - hcx, y - (hcy - ry - 5)) < 6.5) inHair = true;
      }
      if (hair === 4) {
        const cx2 = (x - hcx) / (rx + 6);
        const cy2 = (y - (hcy - 3)) / (ry + 5);
        if (cx2 * cx2 + cy2 * cy2 <= 1 && (y < hcy - 2 || Math.abs(x - hcx) > rx * 0.9)) inHair = true;
      }

      if (inHair) dark = 0.96;
      else if (inHead) {
        // lit side vs shadow side
        dark = 0.3 + (light * (x - hcx)) / rx * -0.26 + 0.12 * Math.max(0, dy);
        // eyes · brows · nose · mouth
        const eyeY = hcy - 1.5;
        if (Math.hypot(Math.abs(x - hcx) - 6.6, y - eyeY) < 2.1) dark = 1;
        else if (Math.abs(Math.abs(x - hcx) - 6.6) < 3.6 && Math.abs(y - (eyeY - 5)) < 0.9) dark = 0.78;
        else if (Math.abs(x - hcx) < 1.6 && y > hcy + 2 && y < hcy + 7) dark = Math.max(dark, 0.55);
        else if (Math.abs(x - hcx) < 5 && Math.abs(y - (hcy + 12)) < 1.1) dark = 0.82;
      } else if (inNeck) {
        dark = 0.62 + 0.2 * Math.max(0, 1 - (y - (hcy + ry)) / 8);
      } else if (inShoulder) {
        dark = 0.5 + 0.35 * clamp((y - 66) / 30) + (light * (x - 48)) / 90 * -0.2;
      }

      if (dark < 0) continue;
      dark = clamp(dark);
      // positive for dark ink on light paper, negative for light ink on black
      const tone = invert ? 1 - dark * 0.92 : dark;
      const r = maxR * clamp(0.14 + tone * 0.9);
      if (r > 0.45) out.push({ x: r1(x), y: r1(y), r: r1(r) });
    }
  }
  return out;
}

interface AvatarProps {
  seed: string | number;
  size?: number;
  online?: boolean;
  className?: string;
  label?: string;
}

export function Avatar({ seed, size = 40, online, className, label }: AvatarProps) {
  const key = typeof seed === "number" ? seed : hash(seed);
  const tone = PALETTE[key % PALETTE.length];
  const step = size >= 120 ? 3 : size >= 64 ? 3.8 : size >= 40 ? 5 : 6.4;
  const dots = portrait(key, step, tone.invert);
  return (
    <span
      className={cn("relative inline-block shrink-0 rounded-[2px]", className)}
      style={{ width: size, height: size, background: tone.bg }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-hidden rounded-[2px]" aria-hidden>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={tone.ink} />
        ))}
      </svg>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center" title="Online">
          <span className="absolute h-full w-full animate-halo rounded-full bg-signal" />
          <span className="relative h-2 w-2 rounded-full border border-white bg-signal" />
        </span>
      )}
    </span>
  );
}
