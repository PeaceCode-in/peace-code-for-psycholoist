import type { ComponentType } from "react";

/**
 * A subtle, tasteful wrapper around a Lucide icon.
 *
 * `motion` variants add a small, editorial micro-interaction that only plays
 * once (on mount) or on hover of the closest `.pc-icon-host` — never a
 * distracting continuous animation. Meant to be reused across dashboards.
 */
export function AnimatedIcon({
  icon: Icon,
  size = 16,
  color,
  bg,
  ring,
  motion = "float",
  className = "",
  padded = true,
}: {
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  size?: number;
  color?: string;
  bg?: string;
  ring?: string;
  motion?: "float" | "breathe" | "tilt" | "none";
  className?: string;
  padded?: boolean;
}) {
  const box = padded ? size + 16 : size;
  const anim =
    motion === "float"
      ? "pc-icon-float"
      : motion === "breathe"
      ? "pc-icon-breathe"
      : motion === "tilt"
      ? "pc-icon-tilt"
      : "";
  return (
    <span
      className={`pc-icon-host inline-flex items-center justify-center rounded-xl shrink-0 ${className}`}
      style={{
        width: box,
        height: box,
        background: bg,
        border: ring ? `1px solid ${ring}` : undefined,
      }}
    >
      <Icon
        className={anim}
        style={{ width: size, height: size, color }}
      />
    </span>
  );
}
