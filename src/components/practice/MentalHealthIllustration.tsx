import type { CSSProperties } from "react";

/**
 * Minimalist, editorial mental-health illustrations.
 *
 * Single-hue line drawings — no gradients, no AI-slop. Meant to sit in the
 * corner of page headers as a whisper of personality. All variants animate
 * gently by default (breath, drift, ripple), and respect reduced-motion.
 */
type Kind =
  | "breath"    // concentric breathing rings — for schedule/sessions
  | "ripple"    // pond ripples — for inbox/messages
  | "branch"    // growing branch with leaves — for patients/growth
  | "journal"   // open book + pencil strokes — for notes
  | "coin"      // stacked coin arcs — for billing
  | "gear"      // rotating minimal cogs — for settings
  | "hearth"    // hand + heart — for care/support
  | "wave";     // calming wave line — universal

export function MentalHealthIllustration({
  kind,
  color = "currentColor",
  size = 140,
  className = "",
  style,
  animate = true,
}: {
  kind: Kind;
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{ color, opacity: 0.16, ...style }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "breath" && (
        <g>
          {[16, 26, 36, 46].map((r, i) => (
            <circle
              key={r}
              cx="60"
              cy="60"
              r={r}
              opacity={1 - i * 0.2}
              className={animate ? "mhi-breath" : undefined}
              style={{ animationDelay: `${i * 0.5}s`, transformOrigin: "60px 60px" }}
            />
          ))}
          <circle cx="60" cy="60" r="3" fill="currentColor" stroke="none" />
        </g>
      )}
      {kind === "ripple" && (
        <g>
          {[10, 20, 32, 44].map((r, i) => (
            <circle
              key={r}
              cx="42"
              cy="72"
              r={r}
              opacity={1 - i * 0.22}
              className={animate ? "mhi-ripple" : undefined}
              style={{ animationDelay: `${i * 0.7}s`, transformOrigin: "42px 72px" }}
            />
          ))}
          <path d="M78 34 q 6 6 0 12 q -6 -6 0 -12 Z" />
        </g>
      )}
      {kind === "branch" && (
        <g className={animate ? "mhi-drift" : undefined} style={{ transformOrigin: "60px 108px" }}>
          <path d="M60 108 Q 60 78 55 60 Q 50 40 60 20" />
          <path d="M58 70 Q 42 66 34 54" />
          <path d="M58 88 Q 76 84 84 72" />
          <path d="M56 52 Q 68 46 74 34" />
          {/* leaves */}
          <path d="M32 52 Q 26 46 34 40 Q 42 46 32 52 Z" />
          <path d="M86 74 Q 92 68 84 62 Q 76 68 86 74 Z" />
          <path d="M76 32 Q 82 26 74 20 Q 66 26 76 32 Z" />
        </g>
      )}
      {kind === "journal" && (
        <g>
          <path d="M20 34 L 20 92 L 60 88 L 100 92 L 100 34 L 60 30 Z" />
          <path d="M60 30 L 60 88" />
          <path d="M28 46 L 52 44" opacity={0.6} />
          <path d="M28 56 L 52 54" opacity={0.6} />
          <path d="M28 66 L 46 65" opacity={0.6} />
          <path d="M68 46 L 92 44" opacity={0.6} />
          <path d="M68 56 L 92 54" opacity={0.6} />
          {/* pencil */}
          <g className={animate ? "mhi-drift" : undefined} style={{ transformOrigin: "80px 76px" }}>
            <path d="M72 82 L 92 62 L 96 66 L 76 86 Z" />
            <path d="M92 62 L 96 66" />
          </g>
        </g>
      )}
      {kind === "coin" && (
        <g>
          {[
            { cx: 40, cy: 84, r: 14 },
            { cx: 60, cy: 68, r: 14 },
            { cx: 82, cy: 52, r: 14 },
          ].map((c, i) => (
            <g key={i} className={animate ? "mhi-breath" : undefined} style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${c.cx}px ${c.cy}px` }}>
              <ellipse cx={c.cx} cy={c.cy} rx={c.r} ry={c.r * 0.42} />
              <path d={`M ${c.cx - c.r} ${c.cy} L ${c.cx - c.r} ${c.cy + 4} A ${c.r} ${c.r * 0.42} 0 0 0 ${c.cx + c.r} ${c.cy + 4} L ${c.cx + c.r} ${c.cy}`} opacity={0.6} />
            </g>
          ))}
        </g>
      )}
      {kind === "gear" && (
        <g className={animate ? "mhi-spin" : undefined} style={{ transformOrigin: "60px 60px" }}>
          <circle cx="60" cy="60" r="22" />
          <circle cx="60" cy="60" r="8" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            const x1 = 60 + Math.cos(a) * 24;
            const y1 = 60 + Math.sin(a) * 24;
            const x2 = 60 + Math.cos(a) * 32;
            const y2 = 60 + Math.sin(a) * 32;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.4} />;
          })}
        </g>
      )}
      {kind === "hearth" && (
        <g>
          {/* hand */}
          <path d="M22 92 L 22 62 Q 22 54 30 54 Q 38 54 38 62 L 38 74 Q 38 60 46 60 Q 54 60 54 68 L 54 78 Q 54 66 62 66 Q 70 66 70 74 L 70 82 Q 70 74 78 74 Q 86 74 86 82 L 86 92" />
          {/* heart resting above */}
          <g className={animate ? "mhi-breath" : undefined} style={{ transformOrigin: "54px 42px" }}>
            <path d="M54 50 Q 40 40 40 30 Q 40 22 48 22 Q 54 22 54 30 Q 54 22 60 22 Q 68 22 68 30 Q 68 40 54 50 Z" />
          </g>
        </g>
      )}
      {kind === "wave" && (
        <g>
          <path d="M0 60 C 20 40, 40 80, 60 60 S 100 40, 120 60" className={animate ? "mhi-wave" : undefined} />
          <path d="M0 78 C 20 58, 40 98, 60 78 S 100 58, 120 78" opacity={0.55} className={animate ? "mhi-wave" : undefined} style={{ animationDelay: "-1.4s" }} />
          <path d="M0 42 C 20 22, 40 62, 60 42 S 100 22, 120 42" opacity={0.35} className={animate ? "mhi-wave" : undefined} style={{ animationDelay: "-2.8s" }} />
        </g>
      )}
    </svg>
  );
}
