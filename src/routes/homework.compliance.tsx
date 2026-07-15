import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, Eye, Flame } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveAssignments, complianceForPatient } from "@/lib/homework-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/homework/compliance")({
  component: Compliance,
});

function Compliance() {
  const hydrated = useHydrated();
  const list = useLiveAssignments();

  const rows = useMemo(() => {
    const byPid = new Map<string, typeof list>();
    for (const a of list) {
      if (!byPid.has(a.patientId)) byPid.set(a.patientId, []);
      byPid.get(a.patientId)!.push(a);
    }
    return Array.from(byPid.entries()).map(([pid, items]) => ({
      pid, items, comp: complianceForPatient(pid),
    })).sort((a, b) => a.comp.rate - b.comp.rate);
  }, [list]);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <p className="text-[12.5px] mb-6 max-w-xl" style={{ color: palette.muted }}>
        Completion signal per patient. Ghost patients haven't submitted anything. Two misses in a row raises a soft alert.
      </p>
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)" }}>
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] text-[10.5px] uppercase tracking-[0.14em] px-4 py-2 border-b" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <div>Patient</div><div>Rate</div><div>Streak</div><div>Missed</div><div>Total</div>
        </div>
        {rows.map(({ pid, comp }) => {
          const p = getPatient(pid);
          const risk = comp.rate < 40;
          return (
            <Link key={pid} to="/patients/$patientId" params={{ patientId: pid }} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-center px-4 py-3 border-b text-[13px] hover:bg-white/60" style={{ borderColor: palette.border, color: palette.ink }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Fraunces', serif" }}>{p?.fullName ?? "Unknown"}</span>
                {comp.ghost && <span className="text-[9.5px] inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "#F6DCE3", color: "#8A2E4E" }}><Eye className="h-2.5 w-2.5" /> Ghost</span>}
                {risk && <span className="text-[9.5px] inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "#F6DCE3", color: "#8A2E4E" }}><AlertTriangle className="h-2.5 w-2.5" /> Low</span>}
              </div>
              <div>
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: palette.surface2 }}>
                  <div className="h-full" style={{ width: `${comp.rate}%`, background: risk ? "#B0567A" : palette.ink }} />
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{comp.rate}%</div>
              </div>
              <div className="inline-flex items-center gap-1 text-[12.5px]" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {comp.streak > 0 && <Flame className="h-3 w-3" style={{ color: palette.primary }} />} {comp.streak}
              </div>
              <div style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{comp.missed}</div>
              <div style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{comp.total}</div>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <div className="p-8 text-center text-[12.5px]" style={{ color: palette.muted }}>No compliance data yet.</div>
        )}
      </div>
    </div>
  );
}
