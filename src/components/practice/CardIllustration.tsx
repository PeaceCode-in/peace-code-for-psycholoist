import type { CSSProperties } from "react";

/**
 * Small, tasteful decorative SVG illustrations for card corners.
 *
 * These are editorial — flat, single-hue, low-opacity, and never busy. They
 * add a whisper of personality without turning a clinical dashboard into a
 * marketing landing page.
 */
type Kind =
  | "waves"
  | "orbit"
  | "peak"
  | "leaf"
  | "grid"
  | "arch"
  | "sun"
  | "bloom";

export function CardIllustration({
  kind,
  color = "currentColor",
  size = 120,
  className = "",
  style,
}: {
  kind: Kind;
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{ color, opacity: 0.14, ...style }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
    >
      {kind === "waves" && (
        <>
          <path d="M0 70 C 20 55, 40 85, 60 70 S 100 55, 120 70" />
          <path d="M0 85 C 20 70, 40 100, 60 85 S 100 70, 120 85" opacity={0.7} />
          <path d="M0 55 C 20 40, 40 70, 60 55 S 100 40, 120 55" opacity={0.5} />
        </>
      )}
      {kind === "orbit" && (
        <>
          <circle cx="60" cy="60" r="46" />
          <ellipse cx="60" cy="60" rx="46" ry="18" />
          <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "peak" && (
        <>
          <path d="M5 95 L 40 45 L 62 72 L 88 30 L 115 95 Z" />
          <path d="M5 95 L 115 95" />
          <circle cx="88" cy="30" r="3" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "leaf" && (
        <>
          <path d="M20 100 C 20 40, 70 20, 100 20 C 100 70, 70 100, 20 100 Z" />
          <path d="M20 100 L 100 20" opacity={0.6} />
        </>
      )}
      {kind === "grid" && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="10" x2="110" y1={20 + i * 16} y2={20 + i * 16} opacity={0.6} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`v${i}`} y1="10" y2="110" x1={20 + i * 16} x2={20 + i * 16} opacity={0.4} />
          ))}
        </>
      )}
      {kind === "arch" && (
        <>
          <path d="M15 100 Q 60 20 105 100" />
          <path d="M25 100 Q 60 40 95 100" opacity={0.7} />
          <path d="M35 100 Q 60 60 85 100" opacity={0.4} />
        </>
      )}
      {kind === "sun" && (
        <>
          <circle cx="60" cy="60" r="18" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            const x1 = 60 + Math.cos(a) * 28;
            const y1 = 60 + Math.sin(a) * 28;
            const x2 = 60 + Math.cos(a) * 40;
            const y2 = 60 + Math.sin(a) * 40;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </>
      )}
      {kind === "bloom" && (
        <>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * Math.PI) / 3;
            const cx = 60 + Math.cos(a) * 18;
            const cy = 60 + Math.sin(a) * 18;
            return <circle key={i} cx={cx} cy={cy} r="18" opacity={0.55} />;
          })}
          <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
