/**
 * Compact 4-segment horizontal bar showing an item response value.
 * Critical items get a hairline rose left-border.
 */
export function ItemResponseBar({
  value,
  max,
  critical = false,
}: {
  value: number;
  max: number;
  critical?: boolean;
}) {
  const segments = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="flex items-center gap-3">
      {critical && <span className="w-[3px] self-stretch rounded-full" style={{ background: "#B0567A" }} aria-label="Critical item" />}
      <div className="flex-1 flex gap-1">
        {segments.map((s) => (
          <span
            key={s}
            className="flex-1 h-2 rounded-full transition-colors duration-200"
            style={{ background: s <= value ? (critical ? "#B0567A" : "#1E1418") : "rgba(234,223,226,0.7)", opacity: s <= value ? 1 - s * 0.06 : 1 }}
          />
        ))}
      </div>
      <span className="w-6 text-right text-[11.5px] tabular-nums" style={{ color: "#1E1418" }}>{value}</span>
    </div>
  );
}
