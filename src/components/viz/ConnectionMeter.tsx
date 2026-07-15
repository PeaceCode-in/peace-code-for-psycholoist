import type { ConnectionQuality } from "@/lib/sessions-store";

const LEVELS: Record<ConnectionQuality, { bars: number; color: string; label: string }> = {
  excellent: { bars: 4, color: "#5F8A6A", label: "Excellent" },
  good:      { bars: 3, color: "#5F8A6A", label: "Good" },
  fair:      { bars: 2, color: "#B08444", label: "Fair" },
  poor:      { bars: 1, color: "#B0384A", label: "Poor" },
};

export function ConnectionMeter({ quality, showLabel = true }: { quality: ConnectionQuality; showLabel?: boolean }) {
  const meta = LEVELS[quality];
  return (
    <div className="inline-flex items-center gap-2 animate-in fade-in duration-200">
      <div className="flex items-end gap-[2px] h-3.5" role="img" aria-label={`Connection: ${meta.label}`}>
        {[6, 9, 12, 14].map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-sm"
            style={{
              height: h,
              background: i < meta.bars ? meta.color : "#EADFE2",
              opacity: i < meta.bars ? 1 : 0.9,
              transition: "background 160ms ease-out",
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: "#7B6A70" }}>{meta.label}</span>
      )}
    </div>
  );
}
