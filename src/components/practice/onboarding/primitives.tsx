// Shared primitives for the Onboarding cinema-mode surface.
import type { ReactNode, CSSProperties } from "react";
import { palette } from "@/components/practice/palette";

export const SAKURA = {
  bg: "linear-gradient(180deg, #FFF7FA 0%, #FFEEF3 42%, #FDE4EC 100%)",
  ink: "#221116",
  muted: "#7B6A70",
  accent: palette.primary,
  soft: "#F1C7D6",
  paper: "rgba(255,255,255,0.78)",
  border: "rgba(176, 86, 122, 0.14)",
  glow: "0 30px 80px -40px rgba(176,86,122,0.35)",
};

export function Serif({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={className}
      style={{ fontFamily: "'Fraunces', 'Cormorant Garamond', ui-serif, Georgia, serif", fontOpticalSizing: "auto", ...style }}
    >
      {children}
    </span>
  );
}

export function Mono({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={className}
      style={{ fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 10.5, ...style }}
    >
      {children}
    </span>
  );
}

export function Panel({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: SAKURA.paper,
        border: `1px solid ${SAKURA.border}`,
        backdropFilter: "blur(18px) saturate(140%)",
        boxShadow: SAKURA.glow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Chip({ active, children, onClick, disabled }: { active?: boolean; children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-[13px] transition-all duration-150"
      style={{
        background: active ? SAKURA.accent : "rgba(255,255,255,0.6)",
        color: active ? "#fff" : SAKURA.ink,
        border: `1px solid ${active ? SAKURA.accent : SAKURA.border}`,
        boxShadow: active ? "0 6px 18px -8px rgba(176,86,122,0.55)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export function InkField({
  label, value, onChange, placeholder, type = "text", hint,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string }) {
  return (
    <label className="block">
      <div className="mb-1.5"><Mono style={{ color: SAKURA.muted }}>{label}</Mono></div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-xl bg-white/70 px-4 py-3 text-[15px] outline-none transition-all duration-150 focus:bg-white"
        style={{
          border: `1px solid ${SAKURA.border}`,
          color: SAKURA.ink,
          boxShadow: "0 0 0 0 rgba(176,86,122,0)",
        }}
        onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 4px rgba(176,86,122,0.14)`; e.currentTarget.style.borderColor = SAKURA.accent; }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = "0 0 0 0 rgba(176,86,122,0)"; e.currentTarget.style.borderColor = SAKURA.border; }}
      />
      {hint && <div className="mt-1.5 text-[12px]" style={{ color: SAKURA.muted }}>{hint}</div>}
    </label>
  );
}

// Editorial rule + hand-drawn ticks
export function StepRule({ total, current, done }: { total: number; current: number; done: boolean[] }) {
  return (
    <div className="flex items-center gap-2 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center gap-1.5">
          <div
            className="flex-1 h-px transition-all duration-300"
            style={{
              background: i <= current
                ? `linear-gradient(90deg, ${SAKURA.accent}, ${SAKURA.soft})`
                : "rgba(0,0,0,0.08)",
            }}
          />
          {done[i] && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4.2 L3.4 6.6 L9 1" stroke={SAKURA.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 0 }} />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// Hand-drawn SVG glyphs — one per step.
export function Glyph({ kind, size = 44 }: { kind: "leaf" | "moon" | "door" | "line" | "chime" | "clock" | "coin" | "flask" | "seed"; size?: number }) {
  const stroke = SAKURA.accent;
  const props = { width: size, height: size, viewBox: "0 0 44 44", fill: "none", stroke, strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "leaf":  return <svg {...props}><path d="M8 34 C 14 14, 30 8, 36 10 C 34 24, 24 34, 10 36 Z"/><path d="M12 32 L 32 12"/></svg>;
    case "moon":  return <svg {...props}><path d="M30 8 A 16 16 0 1 0 36 30 A 12 12 0 1 1 30 8 Z"/></svg>;
    case "door":  return <svg {...props}><rect x="12" y="6" width="20" height="32" rx="2"/><circle cx="28" cy="22" r="0.8" fill={stroke}/></svg>;
    case "line":  return <svg {...props}><path d="M6 22 C 14 18, 22 26, 30 22 S 38 20, 40 22"/></svg>;
    case "chime": return <svg {...props}><path d="M14 8 L 30 8"/><path d="M22 8 L 22 26"/><circle cx="22" cy="30" r="4"/></svg>;
    case "clock": return <svg {...props}><circle cx="22" cy="22" r="14"/><path d="M22 14 L 22 22 L 28 26"/></svg>;
    case "coin":  return <svg {...props}><circle cx="22" cy="22" r="14"/><path d="M18 18 L 26 26 M 26 18 L 18 26"/></svg>;
    case "flask": return <svg {...props}><path d="M18 8 L 18 18 L 12 32 A 4 4 0 0 0 16 38 L 28 38 A 4 4 0 0 0 32 32 L 26 18 L 26 8 Z"/><path d="M16 8 L 28 8"/></svg>;
    case "seed":  return <svg {...props}><ellipse cx="22" cy="24" rx="8" ry="12"/><path d="M22 12 L 22 6"/></svg>;
  }
}

// Breathing dot
export function BreathingDot({ size = 10 }: { size?: number }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size }}>
      <span
        style={{
          display: "block", width: size, height: size, borderRadius: "50%",
          background: SAKURA.accent, boxShadow: `0 0 0 0 ${SAKURA.accent}`,
          animation: "pc-breathe 2.4s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes pc-breathe { 0%,100% { opacity: 0.55; transform: scale(0.85); box-shadow: 0 0 0 0 rgba(176,86,122,0.5); } 50% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 8px rgba(176,86,122,0); } }`}</style>
    </span>
  );
}
