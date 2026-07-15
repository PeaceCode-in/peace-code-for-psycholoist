import { useMemo, useState } from "react";
import type { Session } from "@/lib/sessions-store";
import { getPatient, RISK_META } from "@/lib/patients-store";

/**
 * Vertical bar chart — one bar per session in the day.
 * Bar height ∝ duration. Fill opacity ∝ risk severity.
 */
export function DensityStrip({
  sessions,
  width = 120,
  height = 64,
  onHover,
}: {
  sessions: Session[];
  width?: number;
  height?: number;
  onHover?: (session: Session | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const sorted = useMemo(() => [...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt)), [sessions]);

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center text-[10px] tracking-[0.14em] uppercase" style={{ width, height, color: "#B4A5AB" }}>
        clear day
      </div>
    );
  }

  const gap = 3;
  const barW = Math.max(3, Math.floor((width - gap * (sorted.length - 1)) / sorted.length));
  const maxDur = Math.max(...sorted.map((s) => s.durationMin), 60);

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible block">
        {sorted.map((s, i) => {
          const patient = getPatient(s.patientId);
          const risk = patient?.risk ?? "stable";
          const opacity = risk === "crisis" ? 0.95 : risk === "elevated" ? 0.78 : risk === "monitor" ? 0.55 : 0.32;
          const h = Math.max(6, (s.durationMin / maxDur) * height);
          const x = i * (barW + gap);
          const y = height - h;
          const done = s.status === "completed" || s.status === "cancelled" || s.status === "no_show";
          return (
            <rect
              key={s.id}
              x={x} y={y} width={barW} height={h} rx={2}
              fill={done ? "#B4A5AB" : "var(--pc-risk-elevated)"}
              fillOpacity={hovered === s.id ? 1 : opacity}
              stroke={hovered === s.id ? "#1E1418" : "transparent"}
              strokeWidth={0.5}
              onMouseEnter={() => { setHovered(s.id); onHover?.(s); }}
              onMouseLeave={() => { setHovered(null); onHover?.(null); }}
              style={{ transition: "fill-opacity 160ms ease-out, stroke 160ms ease-out", cursor: "pointer" }}
              aria-label={`${new Date(s.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} — ${patient?.fullName ?? "session"}, ${RISK_META[risk].label}`}
            >
              <title>
                {new Date(s.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {patient?.preferredName ?? patient?.fullName ?? "—"} · {s.durationMin}m · {RISK_META[risk].label}
              </title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}
