// One shared formatter module. Nothing in the app should call
// toLocaleString / Intl / date-fns.format directly — route through here.

// ── Currency ────────────────────────────────────────────────
// Indian number grouping: 1,00,000 (not 100,000). Symbol ₹.
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR_DECIMAL = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number, opts?: { decimals?: boolean }): string {
  if (!Number.isFinite(amount)) return "₹—";
  return (opts?.decimals ? INR_DECIMAL : INR).format(amount);
}

// Plain Indian-grouped integer (no currency symbol) — for counts.
const IN_NUM = new Intl.NumberFormat("en-IN");
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return IN_NUM.format(Math.round(n));
}

// Compact: 1.2k, 3.4L, 1.2Cr — Indian style.
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}${(abs / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (abs >= 1e5) return `${sign}${(abs / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return String(Math.round(n));
}

export function formatPercent(fraction: number, decimals = 0): string {
  if (!Number.isFinite(fraction)) return "—%";
  return `${(fraction * 100).toFixed(decimals)}%`;
}

// ── Dates ───────────────────────────────────────────────────
const DATE_SHORT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const DATE_LONG = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const TIME_SHORT = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const DATE_TIME = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

function toDate(v: Date | string | number): Date {
  return v instanceof Date ? v : new Date(v);
}

export function formatDate(v: Date | string | number, variant: "short" | "long" = "short"): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return "—";
  return (variant === "long" ? DATE_LONG : DATE_SHORT).format(d);
}

export function formatTime(v: Date | string | number): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return "—";
  return TIME_SHORT.format(d);
}

export function formatDateTime(v: Date | string | number): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_TIME.format(d);
}

// Millisecond-precision monospaced stamp for audit trails.
// Format: 2026-07-15 14:32:07.421 IST
export function formatAuditTimestamp(v: Date | string | number): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `.${pad(d.getMilliseconds(), 3)} IST`
  );
}

// Relative time. "just now", "2 min ago", "3 h ago", "yesterday", falls back to date.
export function formatRelative(v: Date | string | number, now: Date = new Date()): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = now.getTime() - d.getTime();
  const abs = Math.abs(diffMs);
  const future = diffMs < 0;
  const min = 60_000, hr = 60 * min, day = 24 * hr;
  if (abs < 45_000) return "just now";
  if (abs < hr) {
    const n = Math.round(abs / min);
    return future ? `in ${n} min` : `${n} min ago`;
  }
  if (abs < day) {
    const n = Math.round(abs / hr);
    return future ? `in ${n} h` : `${n} h ago`;
  }
  if (abs < 2 * day) return future ? "tomorrow" : "yesterday";
  if (abs < 7 * day) {
    const n = Math.round(abs / day);
    return future ? `in ${n} days` : `${n} days ago`;
  }
  return formatDate(d);
}

// Duration in minutes → "50 min", "1 h 20 min", "2 h"
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}
