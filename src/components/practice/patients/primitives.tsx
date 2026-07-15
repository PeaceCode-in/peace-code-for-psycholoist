// Shared UI primitives for the Patients module.
// Thin borders, flat fills, semantic risk tokens, generous whitespace.
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { palette } from "@/components/practice/palette";
import { RISK_META, STATUS_META, type RiskLevel, type PatientStatus } from "@/lib/patients-store";

export const cardShell: React.CSSProperties = {
  background: palette.surface,
  border: `1px solid ${palette.border}`,
  borderRadius: 20,
};

export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`transition-colors duration-150 ${className}`} style={{ ...cardShell, ...style }}>{children}</div>
  );
}


export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10.5px] tracking-[0.22em] uppercase mb-2.5" style={{ color: palette.muted }}>{children}</div>;
}

export function RiskBadge({ level, size = "md" }: { level: RiskLevel; size?: "sm" | "md" }) {
  const m = RISK_META[level];
  const px = size === "sm" ? "px-2 py-[3px] text-[10.5px]" : "px-2.5 py-1 text-[11.5px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px}`} style={{ background: m.softToken, color: m.token }}>
      <span className="pc-risk-dot" style={{ background: m.token }} />
      {m.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium border" style={{ borderColor: palette.border, color: m.token }}>
      <span className="pc-risk-dot" style={{ background: m.token, opacity: 0.85 }} />
      {m.label}
    </span>
  );
}

// Buttons — flat, thin border, 150ms transition
export function Button({ variant = "primary", children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "danger" }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-full text-[12.5px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4";
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: palette.ink, color: palette.surface },
    ghost:   { background: "transparent", color: palette.ink },
    outline: { background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` },
    danger:  { background: "var(--pc-risk-crisis)", color: palette.surface },
  };
  return <button className={`${base} ${className}`} style={styles[variant]} {...props}>{children}</button>;
}

// Inputs
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-10 px-3.5 rounded-xl text-[13px] outline-none transition-colors duration-150 focus:border-transparent focus:ring-2 ${props.className ?? ""}`}
      style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[96px] px-3.5 py-3 rounded-xl text-[13px] outline-none transition-colors duration-150 leading-relaxed resize-y focus:ring-2 ${props.className ?? ""}`}
      style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full h-10 px-3 rounded-xl text-[13px] outline-none bg-white ${props.className ?? ""}`}
      style={{ border: `1px solid ${palette.border}`, color: palette.ink }}
    />
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <label className="block mb-1.5 text-[11.5px] font-medium" style={{ color: palette.ink }}>
      {children}
      {hint && <span className="ml-1 font-normal" style={{ color: palette.muted }}>· {hint}</span>}
    </label>
  );
}

export function Pill({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center h-8 px-3 rounded-full text-[11.5px] transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
      style={active
        ? { background: palette.ink, color: palette.surface, border: `1px solid ${palette.ink}` }
        : { background: palette.surface, color: palette.muted, border: `1px solid ${palette.border}` }}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background: palette.surface2, border: `1px dashed ${palette.border}` }}>
      <p className="text-[14px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{title}</p>
      {hint && <p className="text-[12px] mt-1.5" style={{ color: palette.muted }}>{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const abs = Math.abs(diff);
  const min = 60_000, hr = 3600_000, d = 86_400_000;
  if (abs < min) return "just now";
  if (abs < hr) return `${Math.round(abs / min)}m ${diff < 0 ? "from now" : "ago"}`;
  if (abs < d) return `${Math.round(abs / hr)}h ${diff < 0 ? "from now" : "ago"}`;
  if (abs < 30 * d) return `${Math.round(abs / d)}d ${diff < 0 ? "from now" : "ago"}`;
  return new Date(at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
export function fmtDate(at?: number, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  if (!at) return "—";
  return new Date(at).toLocaleDateString(undefined, opts);
}
export function fmtDateTime(at?: number): string {
  if (!at) return "—";
  return new Date(at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
