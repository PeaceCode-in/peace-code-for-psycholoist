import type { SessionNote } from "@/lib/patients-store";

/**
 * Vertical stacked cards showing the most recent SOAP notes' Assessment lines.
 * Hairline connector on the left. The single most useful pre-session artifact.
 */
export function ContinuityTimeline({ notes, limit = 3 }: { notes: SessionNote[]; limit?: number }) {
  const items = notes.slice(0, limit);
  if (items.length === 0) {
    return (
      <p className="text-[12px]" style={{ color: "#B4A5AB" }}>No prior sessions on file.</p>
    );
  }
  return (
    <ol className="relative pl-4 space-y-3 animate-in fade-in duration-200">
      <span className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "linear-gradient(to bottom, #EADFE2, transparent)" }} />
      {items.map((n, i) => {
        const d = new Date(n.sessionDate);
        return (
          <li key={n.id} className="relative">
            <span
              className="absolute -left-[9px] top-[6px] w-2 h-2 rounded-full"
              style={{ background: i === 0 ? "#B0567A" : "#EADFE2", boxShadow: i === 0 ? "0 0 0 3px rgba(176,86,122,0.15)" : "none" }}
            />
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[11px] tracking-[0.14em] uppercase" style={{ color: "#7B6A70" }}>
                {d.toLocaleDateString([], { day: "2-digit", month: "short" })}
              </span>
              <span className="text-[10.5px]" style={{ color: "#B4A5AB" }}>{n.modality} · {n.duration}m</span>
            </div>
            <p className="text-[13px] leading-snug mt-1" style={{ color: "#1E1418" }}>{n.assessment}</p>
          </li>
        );
      })}
    </ol>
  );
}
