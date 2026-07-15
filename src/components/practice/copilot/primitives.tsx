// Copilot UI primitives — quiet glass, semicolon mark, ethics ribbon,
// AI-draft tag, shimmer reveal, provenance popover.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { palette } from "@/components/practice/palette";
import { Link } from "@tanstack/react-router";

// Hand-drawn semicolon — the Copilot mark.
export function SemicolonMark({ size = 16, color }: { size?: number; color?: string }) {
  const c = color ?? palette.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5.6c0 1.3-1 2.2-2.1 2.2S7.8 6.9 7.8 5.7 8.7 3.5 9.9 3.5 12 4.3 12 5.6ZM11 12.6c-.05 3.2-.35 5.2-1.6 6.8"
        stroke={c} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function EthicsRibbon() {
  return (
    <div
      className="w-full flex items-center justify-center gap-2 py-1.5 text-[10.5px] tracking-[0.14em] uppercase"
      style={{
        color: palette.muted,
        background: "linear-gradient(180deg, rgba(241,199,214,0.18), rgba(241,199,214,0))",
        borderBottom: `1px solid ${palette.border}`,
        fontFamily: "'DM Mono', ui-monospace, monospace",
      }}
    >
      <SemicolonMark size={11} />
      <span>Drafts only. You decide.</span>
      <span aria-hidden style={{ opacity: 0.4 }}>·</span>
      <Link to="/settings/copilot" className="underline decoration-dotted underline-offset-4" style={{ color: palette.muted }}>
        What Copilot sees
      </Link>
    </div>
  );
}

export function AiDraftTag({ children = "AI draft" }: { children?: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 h-[18px] rounded-md text-[9.5px] tracking-[0.14em] uppercase"
      style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        background: "rgba(176,86,122,0.06)",
        color: palette.primary,
        border: `1px solid rgba(176,86,122,0.20)`,
      }}
    >
      <SemicolonMark size={9} />{children}
    </span>
  );
}

// The recessed glass panel used everywhere AI drafts live.
export function CopilotPanel({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(180deg, rgba(239,228,240,0.35), rgba(246,241,242,0.55))",
        border: `1px solid ${palette.border}`,
        borderRadius: 14,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// A text block that shimmers as chars arrive.
export function ShimmerText({ text, streaming }: { text: string; streaming?: boolean }) {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    if (!streaming) return;
    const t = window.setInterval(() => setSeed((s) => s + 1), 90);
    return () => window.clearInterval(t);
  }, [streaming]);
  return (
    <span style={{ position: "relative", display: "inline" }}>
      {text}
      {streaming && (
        <span
          key={seed}
          aria-hidden
          style={{
            display: "inline-block",
            width: 6,
            height: 12,
            marginLeft: 2,
            verticalAlign: "-2px",
            background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
            opacity: 0.4,
            animation: "pc-shimmer 900ms linear infinite",
            borderRadius: 2,
          }}
        />
      )}
      <style>{`@keyframes pc-shimmer{0%{opacity:.15}50%{opacity:.55}100%{opacity:.15}}`}</style>
    </span>
  );
}

// Tiny popover: shows provenance for an AI block.
export function ProvenancePopover({ prov, children }: { prov: { model: string; promptId: string; inputHash: string; outputHash: string; contextItems: string[]; createdAt: number }; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  return (
    <span
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      style={{ position: "relative", display: "inline-block", cursor: "help" }}
    >
      {children}
      {open && (
        <div
          role="tooltip"
          className="absolute z-50 top-full mt-1 left-0 min-w-[260px] p-2.5 rounded-lg"
          style={{
            background: "#fff",
            border: `1px solid ${palette.border}`,
            boxShadow: "0 10px 30px rgba(30,20,24,0.08)",
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10.5,
            color: palette.muted,
          }}
        >
          <div style={{ color: palette.ink }}>{prov.promptId}</div>
          <div>model · {prov.model}</div>
          <div>in · {prov.inputHash} → out · {prov.outputHash}</div>
          <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: palette.border, color: palette.ink }}>Context sent</div>
          <ul className="mt-1 space-y-0.5">
            {prov.contextItems.map((c, i) => <li key={i}>· {c}</li>)}
          </ul>
          <div className="mt-1.5 opacity-70">{new Date(prov.createdAt).toLocaleString()}</div>
        </div>
      )}
    </span>
  );
}
