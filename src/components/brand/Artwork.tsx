import type { ReactNode } from "react";
import type { ArtSpec, ArtVariant } from "@/lib/types";
import { cn, hash, r1, rng } from "@/lib/utils";

export type Tone = "light" | "dark" | "gray";

const TONES: Record<Tone, { bg: string; ink: string; mid: string }> = {
  light: { bg: "#F2F2F2", ink: "#0A0A0A", mid: "#BDBDBD" },
  dark: { bg: "#0A0A0A", ink: "#F5F5F5", mid: "#4B4B4B" },
  gray: { bg: "#DADADA", ink: "#0A0A0A", mid: "#8F8F8F" },
};

export function pickTone(variant: string, seed: number): Tone {
  const v = rng(hash(variant) ^ Math.imul(seed + 1, 2654435761))();
  return v < 0.48 ? "light" : v < 0.84 ? "dark" : "gray";
}

type Rnd = () => number;
type T = { bg: string; ink: string; mid: string };

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/* ── variants ─────────────────────────────────────────── */

function dots(rnd: Rnd, t: T, density = 1): ReactNode[] {
  const cols = Math.round(24 * density);
  const rows = Math.round(18 * density);
  const sx = 400 / cols;
  const sy = 300 / rows;
  const radial = rnd() < 0.55;
  const cx = 0.25 + rnd() * 0.5;
  const cy = 0.25 + rnd() * 0.5;
  const ang = rnd() * Math.PI * 2;
  const out: ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = (i + 0.5) / cols;
      const v = (j + 0.5) / rows;
      let val: number;
      if (radial) val = 1 - Math.hypot((u - cx) * 1.33, v - cy) / 0.85;
      else val = (u - 0.5) * Math.cos(ang) + (v - 0.5) * Math.sin(ang) + 0.5;
      val += (rnd() - 0.5) * 0.1;
      const r = smooth(val) * sx * 0.46;
      if (r > 0.7) out.push(<circle key={`${i}-${j}`} cx={r1((i + 0.5) * sx)} cy={r1((j + 0.5) * sy)} r={r1(r)} fill={t.ink} />);
    }
  }
  return out;
}

function lines(rnd: Rnd, t: T): ReactNode[] {
  const n = 22;
  const mu = 120 + rnd() * 160;
  const sigma = 55 + rnd() * 40;
  const ph = rnd() * 6;
  const out: ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const y0 = 52 + k * 10.6;
    let d = "";
    for (let x = 20; x <= 380; x += 6) {
      const bump = Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
      const wob = Math.sin(x * 0.07 + ph + k * 0.6) * 0.5 + 0.5;
      const y = y0 - bump * (14 + wob * 30);
      d += `${x === 20 ? "M" : "L"}${x} ${r1(y)}`;
    }
    out.push(<path key={k} d={d} fill={t.bg} stroke={t.ink} strokeWidth={1.1} strokeLinejoin="round" />);
  }
  return out;
}

function rings(rnd: Rnd, t: T): ReactNode[] {
  const cx = 150 + rnd() * 100;
  const cy = 110 + rnd() * 80;
  const dx = (rnd() - 0.5) * 60;
  const dy = (rnd() - 0.5) * 40;
  const out: ReactNode[] = [];
  for (let k = 0; k < 15; k++) {
    out.push(<circle key={`a${k}`} cx={r1(cx)} cy={r1(cy)} r={8 + k * 13} fill="none" stroke={t.ink} strokeWidth={0.9} strokeDasharray={k % 4 === 3 ? "2 4" : undefined} />);
  }
  for (let k = 0; k < 11; k++) {
    out.push(<circle key={`b${k}`} cx={r1(cx + dx)} cy={r1(cy + dy)} r={14 + k * 15} fill="none" stroke={t.mid} strokeWidth={0.9} />);
  }
  out.push(<circle key="c" cx={r1(cx)} cy={r1(cy)} r={4.5} fill={t.ink} />);
  out.push(<line key="h" x1={0} x2={400} y1={r1(cy)} y2={r1(cy)} stroke={t.ink} strokeWidth={0.5} />);
  out.push(<line key="v" y1={0} y2={300} x1={r1(cx)} x2={r1(cx)} stroke={t.ink} strokeWidth={0.5} />);
  return out;
}

function grid(rnd: Rnd, t: T): ReactNode[] {
  const cell = 25;
  const out: ReactNode[] = [];
  for (let i = 0; i <= 16; i++) out.push(<line key={`x${i}`} x1={i * cell} x2={i * cell} y1={0} y2={300} stroke={t.mid} strokeWidth={0.6} />);
  for (let j = 0; j <= 12; j++) out.push(<line key={`y${j}`} y1={j * cell} y2={j * cell} x1={0} x2={400} stroke={t.mid} strokeWidth={0.6} />);
  const row0 = Math.floor(rnd() * 8) + 2;
  const col0 = Math.floor(rnd() * 6);
  for (let k = 0; k < 9; k++) out.push(<rect key={`d${k}`} x={(col0 + k) * cell} y={(row0 - Math.floor(k / 2)) * cell} width={cell} height={cell} fill={t.ink} />);
  for (let j = 0; j < 12; j++) {
    for (let i = 0; i < 16; i++) {
      const v = rnd();
      if (v < 0.09) out.push(<rect key={`f${i}-${j}`} x={i * cell} y={j * cell} width={cell} height={cell} fill={t.ink} opacity={0.9} />);
      else if (v < 0.17) {
        const x = i * cell;
        const y = j * cell;
        out.push(<path key={`p${i}-${j}`} d={`M${x + 8} ${y}h9M${x + 12.5} ${y - 4.5}v9`} stroke={t.ink} strokeWidth={1} fill="none" />);
      }
    }
  }
  return out;
}

function bars(rnd: Rnd, t: T): ReactNode[] {
  const n = 36;
  const w = 400 / n;
  const ph = rnd() * 6;
  const f = 0.25 + rnd() * 0.25;
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const h = 24 + (Math.sin(i * f + ph) * 0.5 + 0.5) * 150 + (Math.sin(i * 0.9 + ph * 2) * 0.5 + 0.5) * 36 + rnd() * 14;
    out.push(<rect key={i} x={r1(i * w + 1.5)} y={r1(274 - h)} width={r1(w - 3)} height={r1(h)} fill={rnd() < 0.2 ? t.mid : t.ink} />);
  }
  out.push(<line key="b" x1={0} x2={400} y1={274} y2={274} stroke={t.ink} strokeWidth={1} />);
  for (let i = 0; i <= 40; i++) out.push(<line key={`t${i}`} x1={i * 10} x2={i * 10} y1={278} y2={i % 5 === 0 ? 288 : 283} stroke={t.ink} strokeWidth={0.7} />);
  return out;
}

function blocks(rnd: Rnd, t: T): ReactNode[] {
  const out: ReactNode[] = [];
  const s = 100;
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      const x = i * s;
      const y = j * s;
      const k = Math.floor(rnd() * 8);
      const rot = Math.floor(rnd() * 4);
      const key = `${i}-${j}`;
      switch (k) {
        case 0:
          break;
        case 1:
          out.push(<rect key={key} x={x} y={y} width={s} height={s} fill={t.ink} />);
          break;
        case 2:
          out.push(<circle key={key} cx={x + s / 2} cy={y + s / 2} r={s / 2 - 8} fill={t.ink} />);
          break;
        case 3: // quarter
          out.push(
            <path key={key} d={`M${x} ${y}h${s}a${s} ${s} 0 0 1 -${s} ${s}z`} fill={t.ink} transform={`rotate(${rot * 90} ${x + s / 2} ${y + s / 2})`} />,
          );
          break;
        case 4: // half
          out.push(
            <path key={key} d={`M${x} ${y + s}a${s / 2} ${s / 2} 0 0 1 ${s} 0z`} fill={t.ink} transform={`rotate(${rot * 90} ${x + s / 2} ${y + s / 2})`} />,
          );
          break;
        case 5: // stripes
          for (let q = 0; q < 6; q++) out.push(<rect key={`${key}-${q}`} x={x} y={y + q * (s / 6) + 2} width={s} height={s / 12} fill={t.ink} />);
          break;
        case 6:
          out.push(<circle key={key} cx={x + s / 2} cy={y + s / 2} r={s / 2 - 8} fill="none" stroke={t.ink} strokeWidth={1.2} />);
          out.push(<circle key={`${key}i`} cx={x + s / 2} cy={y + s / 2} r={s / 4} fill={t.mid} />);
          break;
        default:
          out.push(<rect key={key} x={x + 14} y={y + 14} width={s - 28} height={s - 28} fill="none" stroke={t.ink} strokeWidth={1.2} transform={`rotate(45 ${x + s / 2} ${y + s / 2})`} />);
      }
    }
  }
  for (let i = 1; i < 4; i++) out.push(<line key={`gx${i}`} x1={i * s} x2={i * s} y1={0} y2={300} stroke={t.mid} strokeWidth={0.5} />);
  for (let j = 1; j < 3; j++) out.push(<line key={`gy${j}`} y1={j * s} y2={j * s} x1={0} x2={400} stroke={t.mid} strokeWidth={0.5} />);
  return out;
}

function wire(rnd: Rnd, t: T): ReactNode[] {
  const out: ReactNode[] = [];
  const hz = 168;
  for (let x = -400; x <= 800; x += 60) out.push(<line key={`r${x}`} x1={200} y1={hz} x2={x} y2={300} stroke={t.mid} strokeWidth={0.7} />);
  for (let k = 1; k <= 9; k++) out.push(<line key={`h${k}`} x1={0} x2={400} y1={r1(hz + (k / 9) ** 2 * (300 - hz))} y2={r1(hz + (k / 9) ** 2 * (300 - hz))} stroke={t.mid} strokeWidth={0.7} />);
  out.push(<line key="hz" x1={0} x2={400} y1={hz} y2={hz} stroke={t.ink} strokeWidth={0.8} />);
  // cube
  const a = rnd() * 0.9 + 0.35;
  const b = 0.5 + rnd() * 0.35;
  const s = 52 + rnd() * 14;
  const pts: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    let x = i & 1 ? s : -s;
    let y = i & 2 ? s : -s;
    let z = i & 4 ? s : -s;
    const x1 = x * Math.cos(a) - z * Math.sin(a);
    const z1 = x * Math.sin(a) + z * Math.cos(a);
    const y1 = y * Math.cos(b) - z1 * Math.sin(b);
    const z2 = y * Math.sin(b) + z1 * Math.cos(b);
    const p = 520 / (520 + z2);
    x = x1 * p;
    y = y1 * p;
    z = z2;
    pts.push([r1(200 + x), r1(104 + y)]);
  }
  const edges = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  out.push(<ellipse key="sh" cx={200} cy={hz + 14} rx={s * 1.25} ry={9} fill={t.mid} opacity={0.55} />);
  for (const [p, q] of edges) {
    out.push(<line key={`e${p}${q}`} x1={pts[p][0]} y1={pts[p][1]} x2={pts[q][0]} y2={pts[q][1]} stroke={t.ink} strokeWidth={1.4} strokeLinecap="round" />);
  }
  for (const [x, y] of pts) out.push(<circle key={`v${x}${y}`} cx={x} cy={y} r={2.4} fill={t.ink} />);
  return out;
}

function wave(rnd: Rnd, t: T): ReactNode[] {
  const n = 64;
  const w = 400 / n;
  const ph = rnd() * 6;
  const f1 = 0.18 + rnd() * 0.2;
  const f2 = 0.5 + rnd() * 0.6;
  const mu = 0.3 + rnd() * 0.4;
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const env = 0.2 + 0.8 * Math.exp(-((u - mu) ** 2) / 0.07);
    const h = (Math.abs(Math.sin(i * f1 + ph)) * 0.55 + Math.abs(Math.sin(i * f2 + ph * 2)) * 0.35 + rnd() * 0.1) * env * 118 + 3;
    out.push(<rect key={i} x={r1(i * w + w * 0.2)} y={r1(150 - h)} width={r1(w * 0.55)} height={r1(h * 2)} rx={w * 0.27} fill={t.ink} />);
  }
  out.push(<line key="c" x1={0} x2={400} y1={150} y2={150} stroke={t.bg} strokeWidth={0.8} />);
  return out;
}

function scatter(rnd: Rnd, t: T): ReactNode[] {
  const out: ReactNode[] = [];
  out.push(<line key="ax" x1={36} x2={36} y1={20} y2={268} stroke={t.ink} strokeWidth={1} />);
  out.push(<line key="ay" x1={36} x2={384} y1={268} y2={268} stroke={t.ink} strokeWidth={1} />);
  for (let i = 0; i < 8; i++) {
    out.push(<line key={`gy${i}`} x1={36} x2={384} y1={r1(60 + i * 26)} y2={r1(60 + i * 26)} stroke={t.mid} strokeWidth={0.4} strokeDasharray="2 4" />);
    out.push(<line key={`gx${i}`} y1={20} y2={268} x1={r1(80 + i * 42)} x2={r1(80 + i * 42)} stroke={t.mid} strokeWidth={0.4} strokeDasharray="2 4" />);
  }
  const slope = 0.45 + rnd() * 0.5;
  const intercept = 220 - rnd() * 40;
  for (let i = 0; i < 74; i++) {
    const x = 50 + rnd() * 326;
    const y = intercept - (x - 50) * slope + (rnd() - 0.5) * 80 * (0.4 + (x - 50) / 400);
    const yy = Math.min(262, Math.max(26, y));
    if (rnd() < 0.2) {
      out.push(<path key={`c${i}`} d={`M${r1(x - 3)} ${r1(yy - 3)}l6 6m0 -6l-6 6`} stroke={t.ink} strokeWidth={1.2} />);
    } else {
      out.push(<circle key={`c${i}`} cx={r1(x)} cy={r1(yy)} r={rnd() < 0.15 ? 4.4 : 2.6} fill={rnd() < 0.7 ? t.ink : "none"} stroke={t.ink} strokeWidth={1} />);
    }
  }
  out.push(<line key="reg" x1={50} y1={r1(intercept)} x2={376} y2={r1(intercept - 326 * slope)} stroke={t.ink} strokeWidth={1.2} strokeDasharray="5 4" />);
  return out;
}

const GLYPHS = ["Aa", "01", "&", "↗", "{ }", "%", "∞", "Ø", "/", "+"];

function glyph(rnd: Rnd, t: T, seed: number): ReactNode[] {
  const g = GLYPHS[Math.floor(rnd() * GLYPHS.length)];
  const big = g.length === 1;
  const out: ReactNode[] = [];
  for (let i = 0; i < 6; i++) out.push(<line key={`l${i}`} x1={0} x2={400} y1={50 * i + 25} y2={50 * i + 25} stroke={t.mid} strokeWidth={0.5} />);
  out.push(
    <text
      key="g"
      x={200}
      y={big ? 232 : 214}
      textAnchor="middle"
      fontSize={big ? 270 : 210}
      fill={t.ink}
      style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, letterSpacing: "-0.07em" }}
    >
      {g}
    </text>,
  );
  out.push(<rect key="fr" x={16} y={16} width={368} height={268} fill="none" stroke={t.ink} strokeWidth={0.8} />);
  out.push(
    <text key="m" x={24} y={34} fontSize={8} fill={t.ink} style={{ fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "0.08em" }}>
      {`SPECIMEN / ${String(seed).padStart(3, "0")}`}
    </text>,
  );
  return out;
}

function render(variant: ArtVariant, rnd: Rnd, t: T, seed: number, density: number): ReactNode[] {
  switch (variant) {
    case "dots": return dots(rnd, t, density);
    case "lines": return lines(rnd, t);
    case "rings": return rings(rnd, t);
    case "grid": return grid(rnd, t);
    case "bars": return bars(rnd, t);
    case "blocks": return blocks(rnd, t);
    case "wire": return wire(rnd, t);
    case "wave": return wave(rnd, t);
    case "scatter": return scatter(rnd, t);
    case "glyph": return glyph(rnd, t, seed);
  }
}

interface ArtworkProps {
  art?: ArtSpec;
  variant?: ArtVariant;
  seed?: number;
  tone?: Tone;
  density?: number;
  className?: string;
  children?: ReactNode;
  /** crop-mark corners */
  marks?: boolean;
  alt?: string;
}

export function Artwork({ art, variant, seed, tone, density = 1, className, children, marks, alt }: ArtworkProps) {
  const v = art?.variant ?? variant ?? "dots";
  const s = art?.seed ?? seed ?? 1;
  const tn = tone ?? pickTone(v, s);
  const t = TONES[tn];
  const rnd = rng(hash(v) ^ Math.imul(s + 7, 2246822519));
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: t.bg, color: t.ink }}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,0,0,1)] group-hover/art:scale-[1.04]"
        role={alt ? "img" : undefined}
        aria-label={alt}
        aria-hidden={alt ? undefined : true}
      >
        {render(v, rnd, t, s, density)}
      </svg>
      {marks && (
        <>
          <span className="pointer-events-none absolute left-2 top-2 h-2 w-2 border-l border-t" style={{ borderColor: t.ink, opacity: 0.7 }} />
          <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 border-r border-t" style={{ borderColor: t.ink, opacity: 0.7 }} />
          <span className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l" style={{ borderColor: t.ink, opacity: 0.7 }} />
          <span className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-b border-r" style={{ borderColor: t.ink, opacity: 0.7 }} />
        </>
      )}
      {children}
    </div>
  );
}

/** Real uploaded image when we have one, generative art otherwise. */
export function Cover({
  art,
  media,
  className,
  children,
  marks,
  alt,
}: {
  art: ArtSpec;
  media?: string;
  className?: string;
  children?: ReactNode;
  marks?: boolean;
  alt?: string;
}) {
  if (!media) return <Artwork art={art} className={className} marks={marks} alt={alt}>{children}</Artwork>;
  return (
    <div className={cn("relative overflow-hidden bg-soft", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media} alt={alt ?? ""} className="absolute inset-0 h-full w-full object-cover grayscale transition-transform duration-700 ease-[cubic-bezier(.2,0,0,1)] group-hover/art:scale-[1.04]" />
      {children}
    </div>
  );
}
