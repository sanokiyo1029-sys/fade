const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹1,25,000 */
export function money(n: number): string {
  return `₹${inr.format(Math.round(n))}`;
}

/** Compact lakh/crore style: 12.4L, 4.8Cr */
export function moneyShort(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${n}`;
}

export function int(n: number): string {
  return inr.format(n);
}

export function delivery(days: number): string {
  if (days <= 1) return "24 HRS";
  return `${days} ${days === 1 ? "DAY" : "DAYS"}`;
}

export function deliveryRange(min: number, max: number): string {
  if (min === max) return delivery(min);
  return `${min}–${max} DAYS`;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/**
 * Date-only strings (static content, ISO) are read in UTC so server and
 * client always agree; numeric timestamps (user activity) use local time.
 */
function parts(d: string | number | Date) {
  const x = new Date(d);
  return typeof d === "string"
    ? { d: x.getUTCDate(), m: x.getUTCMonth(), y: x.getUTCFullYear() }
    : { d: x.getDate(), m: x.getMonth(), y: x.getFullYear() };
}

/** 03 OCT 2026 */
export function dateLong(d: string | number | Date): string {
  const p = parts(d);
  return `${String(p.d).padStart(2, "0")} ${MONTHS[p.m]} ${p.y}`;
}

/** 03 OCT */
export function dateShort(d: string | number | Date): string {
  const p = parts(d);
  return `${String(p.d).padStart(2, "0")} ${MONTHS[p.m]}`;
}

/** SEP 2026 */
export function monthYear(d: string | number | Date): string {
  const p = parts(d);
  return `${MONTHS[p.m]} ${p.y}`;
}

export function clock(d: number | Date): string {
  const x = new Date(d);
  return `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;
}

/** 2m · 3h · 4d · 03 OCT */
export function ago(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return "NOW";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}M`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}H`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}D`;
  return dateShort(ts);
}

export function dayLabel(ts: number, now = Date.now()): string {
  const a = new Date(ts);
  const b = new Date(now);
  const sameDay = (x: Date, y: Date) =>
    x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
  if (sameDay(a, b)) return "TODAY";
  const y = new Date(now - 86400000);
  if (sameDay(a, y)) return "YESTERDAY";
  return dateShort(ts);
}

export function timeLeft(deadline: number, now = Date.now()): { label: string; late: boolean; days: number } {
  const diff = deadline - now;
  const late = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const label = days > 0 ? `${String(days).padStart(2, "0")}D ${String(hours).padStart(2, "0")}H` : `${String(hours).padStart(2, "0")}H`;
  return { label: late ? `${label} LATE` : label, late, days: late ? -days : days };
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function orderNo(id: string): string {
  return id.padStart(5, "0");
}

export function plural(n: number, one: string, many = `${one}S`): string {
  return n === 1 ? one : many;
}

export function levelName(level: 1 | 2 | 3): string {
  return level === 3 ? "ELITE" : level === 2 ? "ESTABLISHED" : "EMERGING";
}
