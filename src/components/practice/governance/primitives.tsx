// Governance primitives — a slate/graphite shift of the practice palette.
import type { ReactNode, CSSProperties } from "react";
import { palette } from "@/components/practice/palette";

export const VAULT = {
  // 5% shift toward slate — back-of-house.
  bg: "linear-gradient(180deg, #F4F2F5 0%, #EEEBF0 100%)",
  paper: "rgba(255,255,255,0.78)",
  ink: "#1B1720",
  muted: "#6C6570",
  border: "rgba(30,20,32,0.10)",
  accent: palette.primary, // rose retained
  slate: "#3A3540",
  pulse: "#B0567A",
  gold: "#8A7648",
};

export function Mono({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <span className={className} style={{ fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 10.5, ...style }}>
      {children}
    </span>
  );
}
export function Serif({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return <span className={className} style={{ fontFamily: "'Fraunces', 'DM Serif Display', ui-serif, Georgia, serif", fontOpticalSizing: "auto", ...style }}>{children}</span>;
}
export function Data({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return <span className={className} style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 12, color: VAULT.ink, ...style }}>{children}</span>;
}

export function Panel({ children, className = "", style, tone = "paper" }: { children: ReactNode; className?: string; style?: CSSProperties; tone?: "paper" | "slate" }) {
  const isSlate = tone === "slate";
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: isSlate ? "linear-gradient(180deg, #1B1720 0%, #221C28 100%)" : VAULT.paper,
        border: `1px solid ${isSlate ? "rgba(255,255,255,0.06)" : VAULT.border}`,
        backdropFilter: isSlate ? undefined : "blur(14px) saturate(140%)",
        color: isSlate ? "#E7E3EB" : VAULT.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AccessDot({ level }: { level: "full" | "read" | "with-reason" | "none" }) {
  const inner = () => {
    if (level === "full") return <circle cx="7" cy="7" r="4.5" fill={VAULT.accent} />;
    if (level === "read") return <><circle cx="7" cy="7" r="4.5" fill="none" stroke={VAULT.accent} strokeWidth="1.4" /><path d="M7 2.5 A4.5 4.5 0 0 1 7 11.5 Z" fill={VAULT.accent} opacity="0.65" /></>;
    if (level === "with-reason") return <circle cx="7" cy="7" r="4.5" fill="url(#stripes)" stroke={VAULT.accent} strokeWidth="1.2" />;
    return <circle cx="7" cy="7" r="4.5" fill="none" stroke={VAULT.muted} strokeWidth="1" opacity="0.4" />;
  };
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-label={level}>
      <defs>
        <pattern id="stripes" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke={VAULT.accent} strokeWidth="1.4" />
        </pattern>
      </defs>
      {inner()}
    </svg>
  );
}

export function AnomalyDot({ score }: { score: number }) {
  const tone = score > 0.6 ? VAULT.pulse : score > 0.3 ? VAULT.gold : "#8A9BB4";
  const pulse = score > 0.6;
  return (
    <span
      style={{
        display: "inline-block", width: 8, height: 8, borderRadius: "50%",
        background: tone, opacity: score > 0.6 ? 1 : 0.7,
        animation: pulse ? "gov-pulse 1.8s ease-in-out infinite" : undefined,
      }}
      title={`anomaly ${score.toFixed(2)}`}
    >
      <style>{`@keyframes gov-pulse { 0%,100% { box-shadow: 0 0 0 0 ${tone}55; } 50% { box-shadow: 0 0 0 6px ${tone}00; } }`}</style>
    </span>
  );
}

// Monoline outline glyphs — no shield-with-check clichés.
export function Glyph({ kind, size = 22, color }: { kind: "scale" | "key" | "ledger" | "letter" | "vault" | "clock" | "seal" | "bolt" | "eye"; size?: number; color?: string }) {
  const c = color ?? VAULT.slate;
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "scale":  return <svg {...props}><path d="M12 3 L 12 20 M 6 20 L 18 20 M 4 8 L 20 8 M 4 8 L 2 14 M 4 8 L 6 14 M 20 8 L 18 14 M 20 8 L 22 14"/><ellipse cx="4" cy="14" rx="2.5" ry="0.6"/><ellipse cx="20" cy="14" rx="2.5" ry="0.6"/></svg>;
    case "key":    return <svg {...props}><circle cx="8" cy="12" r="4"/><path d="M12 12 L 22 12 M 18 12 L 18 15 M 21 12 L 21 14"/></svg>;
    case "ledger": return <svg {...props}><path d="M5 3 L 19 3 L 19 21 L 5 21 Z M 8 7 L 16 7 M 8 11 L 16 11 M 8 15 L 13 15"/></svg>;
    case "letter": return <svg {...props}><path d="M3 6 L 21 6 L 21 18 L 3 18 Z M 3 6 L 12 13 L 21 6"/></svg>;
    case "vault":  return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="12" cy="12" r="4"/><path d="M12 8 L 12 6 M 12 18 L 12 16 M 8 12 L 6 12 M 18 12 L 16 12"/></svg>;
    case "clock":  return <svg {...props}><circle cx="12" cy="12" r="8"/><path d="M12 7 L 12 12 L 16 14"/></svg>;
    case "seal":   return <svg {...props}><circle cx="12" cy="10" r="6"/><path d="M9 15 L 8 22 L 12 20 L 16 22 L 15 15"/></svg>;
    case "bolt":   return <svg {...props}><path d="M13 3 L 5 14 L 11 14 L 9 21 L 19 10 L 13 10 Z"/></svg>;
    case "eye":    return <svg {...props}><path d="M2 12 C 5 6, 10 4, 12 4 C 14 4, 19 6, 22 12 C 19 18, 14 20, 12 20 C 10 20, 5 18, 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>;
  }
}

export function StatusPill({ tone, children }: { tone: "ok" | "warn" | "muted" | "pulse" | "info"; children: ReactNode }) {
  const t = {
    ok:    { bg: "rgba(107,138,106,0.12)", fg: "#5F8A6A", bd: "rgba(107,138,106,0.28)" },
    warn:  { bg: "rgba(138,118,72,0.12)",  fg: VAULT.gold,  bd: "rgba(138,118,72,0.28)" },
    pulse: { bg: "rgba(176,86,122,0.10)",  fg: VAULT.pulse, bd: "rgba(176,86,122,0.28)" },
    info:  { bg: "rgba(108,120,140,0.12)", fg: "#5A6478",   bd: "rgba(108,120,140,0.28)" },
    muted: { bg: "rgba(30,20,32,0.06)",    fg: VAULT.muted, bd: VAULT.border },
  }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5" style={{ background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
      {tone === "pulse" && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: VAULT.pulse, animation: "gov-pulse 1.8s ease-in-out infinite" }} />}
      {children}
    </span>
  );
}

export function SectionEyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.24em" }}>{index}</span>
      <span className="h-px flex-1" style={{ background: VAULT.border }} />
      <Mono style={{ color: VAULT.muted }}>{children}</Mono>
    </div>
  );
}
