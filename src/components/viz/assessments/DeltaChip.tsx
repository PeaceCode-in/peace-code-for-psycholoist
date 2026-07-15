import { ArrowDown, ArrowUp, Minus } from "lucide-react";

/**
 * Signed delta pill: sage for improving (negative for symptom scores),
 * muted rose for worsening. Neutral when 0 or undefined.
 * `improvingIsNegative` defaults true — symptom-based scores fall as things get better.
 */
export function DeltaChip({
  value,
  suffix,
  improvingIsNegative = true,
  size = "md",
}: {
  value?: number;
  suffix?: string;
  improvingIsNegative?: boolean;
  size?: "sm" | "md";
}) {
  if (value === undefined || value === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] tracking-[0.12em] uppercase" style={{ background: "#F6F1F2", color: "#7B6A70" }}>
        No baseline
      </span>
    );
  }
  const improving = improvingIsNegative ? value < 0 : value > 0;
  const neutral = value === 0;
  const bg = neutral ? "#F6F1F2" : improving ? "#E1EFE3" : "#F1C7D6";
  const fg = neutral ? "#7B6A70" : improving ? "#3F6549" : "#8A2C3E";
  const Icon = neutral ? Minus : improving ? ArrowDown : ArrowUp;
  const sizeCls = size === "sm" ? "text-[10.5px] px-2 py-0.5" : "text-[11.5px] px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${sizeCls} tabular-nums`} style={{ background: bg, color: fg, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Icon className="w-3 h-3" strokeWidth={2} />
      {Math.abs(value).toFixed(Math.abs(value) < 10 ? 1 : 0).replace(/\.0$/, "")}{suffix ? ` ${suffix}` : ""}
    </span>
  );
}
