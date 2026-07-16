// Shared UI primitives for Team pages. Keeps every page consistent
// and cheap to build. All rose-family, all glass.
import { palette } from "@/components/practice/palette";
import type { ReactNode, CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ROLE_META, type RoleKey, type TeamMember, type MemberStatus } from "@/lib/team-store";

export function Card({ children, className = "", style = {} }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: palette.glassStrong,
        border: `1px solid ${palette.border}`,
        backdropFilter: "blur(14px) saturate(140%)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, hint, actions }: { eyebrow?: string; title: string; hint?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        {eyebrow && (
          <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{eyebrow}</div>
        )}
        <h2 className="text-[17px] leading-tight tracking-tight mt-0.5" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{title}</h2>
        {hint && <p className="text-[11.5px] mt-1 max-w-md" style={{ color: palette.muted }}>{hint}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Avatar({ member, size = 36 }: { member: TeamMember; size?: number }) {
  return (
    <span
      className="rounded-full flex items-center justify-center text-white shrink-0 select-none"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${member.tone} 0%, ${palette.primary} 120%)`,
        fontSize: Math.round(size * 0.36),
        fontFamily: "'DM Sans', system-ui, sans-serif",
        letterSpacing: "0.02em",
        boxShadow: `0 0 0 2px ${palette.surface}`,
      }}
      aria-hidden
    >
      {member.avatarInitials}
    </span>
  );
}

const STATUS_TONE: Record<MemberStatus, { bg: string; fg: string; dot: string; label: string }> = {
  active:    { bg: "#E7F6EC", fg: "#1F7A3E", dot: "#22c55e", label: "Active" },
  "on-leave": { bg: "#FFEFD6", fg: "#8A5A18", dot: "#D4A24C", label: "On leave" },
  limited:   { bg: "#F1E4EE", fg: "#8B4A6A", dot: "#B0567A", label: "Limited" },
  invited:   { bg: "#EDE7F4", fg: "#5A4A7A", dot: "#8B5A9C", label: "Invited" },
};
export function StatusPill({ status }: { status: MemberStatus }) {
  const t = STATUS_TONE[status];
  return (
    <span className="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[10.5px]" style={{ background: t.bg, color: t.fg, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} />
      {t.label}
    </span>
  );
}

export function RoleChip({ role }: { role: RoleKey }) {
  const m = ROLE_META[role];
  return (
    <span
      className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[10.5px]"
      style={{
        background: `${m.tone}22`,
        color: m.tone,
        border: `1px solid ${m.tone}44`,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {m.label}
    </span>
  );
}

export function Metric({ label, value, unit, tone }: { label: string; value: string | number; unit?: string; tone?: string }) {
  return (
    <div>
      <div className="uppercase text-[9.5px] tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className="text-[20px] leading-none"
          style={{ fontFamily: "'Fraunces', serif", color: tone ?? palette.ink, fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </span>
        {unit && <span className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{unit}</span>}
      </div>
    </div>
  );
}

export function Bar({ value, max, tone = palette.primary, height = 6 }: { value: number; max: number; tone?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: `${palette.border}` }}>
      <div style={{ width: `${pct * 100}%`, height: "100%", background: tone, transition: "width 200ms ease" }} />
    </div>
  );
}

// A gentle capacity meter — 12 quarter-hour ticks. Used for utilization,
// so the eye reads "rhythm" not "score".
export function CapacityMeter({ pct, tone = palette.primary }: { pct: number; tone?: string }) {
  const bars = 14;
  const filled = Math.round(pct * bars);
  return (
    <div className="flex items-end gap-[3px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const on = i < filled;
        const h = 6 + ((i * 3) % 8);
        return (
          <span
            key={i}
            style={{
              width: 3, height: on ? 10 + h * 0.6 : 6 + h * 0.3,
              borderRadius: 2,
              background: on ? tone : palette.border,
              opacity: on ? 0.85 - (i / bars) * 0.15 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

export function InlineButton({ children, onClick, tone = "ink", size = "sm", type = "button", disabled = false }: {
  children: ReactNode; onClick?: () => void; tone?: "ink" | "rose" | "ghost" | "danger"; size?: "sm" | "md"; type?: "button" | "submit"; disabled?: boolean;
}) {
  const bg = tone === "ink" ? palette.ink : tone === "rose" ? palette.primary : tone === "danger" ? "#B54848" : "transparent";
  const fg = tone === "ghost" ? palette.ink : "#fff";
  const border = tone === "ghost" ? palette.border : bg;
  const h = size === "sm" ? 28 : 34;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: bg, color: fg, borderColor: border, borderWidth: 1, borderStyle: "solid",
        height: h, padding: `0 ${size === "sm" ? 12 : 16}px`,
        fontSize: size === "sm" ? 11.5 : 12.5,
      }}
    >
      {children}
    </button>
  );
}

export function MemberRowLink({ member, right }: { member: TeamMember; right?: ReactNode }) {
  return (
    <Link
      to="/team/$id"
      params={{ id: member.id }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors"
      style={{ color: palette.ink }}
      onMouseEnter={(e) => (e.currentTarget.style.background = palette.surface2)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Avatar member={member} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] truncate" style={{ fontFamily: "'Fraunces', serif" }}>{member.fullName}</span>
          <RoleChip role={member.role} />
        </div>
        <div className="text-[10.5px] truncate mt-0.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {member.credentials}
        </div>
      </div>
      {right}
    </Link>
  );
}

export function EmptyState({ title, hint, icon: Icon }: { title: string; hint?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      {Icon && (
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: palette.soft, color: palette.primary }}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="text-[14px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{title}</div>
      {hint && <div className="text-[11.5px] mt-1 max-w-xs" style={{ color: palette.muted }}>{hint}</div>}
    </div>
  );
}
