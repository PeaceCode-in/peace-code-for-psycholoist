import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { palette } from "@/components/practice/palette";
import {
  getPatientActiveInstruments, useLivePatientTrajectory, getInstrument,
  SEVERITY_META,
} from "@/lib/assessments-store";
import { TrajectoryChart } from "@/components/viz/assessments/TrajectoryChart";
import { DeltaChip } from "@/components/viz/assessments/DeltaChip";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/patients/$pid/assessments")({
  head: () => ({ meta: [{ title: "Patient · assessments" }, { name: "robots", content: "noindex" }] }),
  component: PatientAssessmentsTab,
});

function PatientAssessmentsTab() {
  const hydrated = useHydrated();
  const { pid } = Route.useParams();
  const activeIds = useMemo(() => (hydrated ? getPatientActiveInstruments(pid) : []), [pid, hydrated]);
  const [selected, setSelected] = useState<string>(activeIds[0] ?? "");
  const inst = selected ? getInstrument(selected) : undefined;
  const trajectory = useLivePatientTrajectory(pid, selected || undefined);
  const latest = trajectory[trajectory.length - 1];

  if (!hydrated) return null;

  if (activeIds.length === 0) {
    return (
      <div className="rounded-3xl border p-10 text-center" style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.55)" }}>
        <p className="text-[13px]" style={{ color: palette.muted }}>No assessments assigned yet.</p>
        <Link to="/assessments/assignments" className="inline-block mt-4 text-[12px] px-4 h-9 leading-9 rounded-full" style={{ background: palette.ink, color: "#fff" }}>Assign an instrument</Link>
      </div>
    );
  }

  const current = selected || activeIds[0];

  return (
    <div>
      {/* Instrument tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {activeIds.map((id) => {
          const i = getInstrument(id);
          const active = current === id;
          return (
            <button key={id} onClick={() => setSelected(id)} className="text-[11.5px] px-3.5 py-1.5 rounded-full transition-colors"
              style={{ background: active ? palette.ink : "rgba(255,255,255,0.6)", color: active ? "#fff" : palette.muted, border: `1px solid ${active ? palette.ink : palette.border}` }}>
              {i?.name ?? id}
            </button>
          );
        })}
      </div>

      {inst && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <section className="rounded-3xl border p-5" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.55)" }}>
            <p className="text-[10.5px] tracking-[0.16em] uppercase mb-2" style={{ color: palette.muted }}>{inst.name} · trajectory</p>
            <div className="-mx-2">
              <TrajectoryChart data={trajectory} instrument={inst} height={240} />
            </div>
          </section>

          <section className="rounded-3xl border p-5 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.55)" }}>
            {latest ? (
              <>
                <div>
                  <p className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Latest score</p>
                  <div className="tabular-nums leading-none mt-2" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 56 }}>{latest.totalScore}</div>
                  <p className="mt-1 text-[12px] tracking-[0.16em] uppercase" style={{ color: SEVERITY_META[latest.severity].color }}>{SEVERITY_META[latest.severity].label}</p>
                  <div className="mt-3"><DeltaChip value={latest.deltaFromLast} /></div>
                  <p className="mt-3 text-[11px]" style={{ color: palette.muted }}>{new Date(latest.completedAt).toLocaleString([], { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                </div>
                <Link to="/assessments/results/$resultId" params={{ resultId: latest.id }} className="mt-5 text-[11.5px] px-3.5 py-1.5 rounded-full inline-block text-center" style={{ background: palette.primary, color: "#fff" }}>
                  Open result
                </Link>
              </>
            ) : (
              <p className="text-[12px]" style={{ color: palette.muted }}>No results yet.</p>
            )}
          </section>
        </div>
      )}

      {/* History list */}
      {trajectory.length > 1 && (
        <section className="mt-6">
          <p className="text-[10.5px] tracking-[0.16em] uppercase mb-3" style={{ color: palette.muted }}>History</p>
          <ol className="space-y-1.5">
            {[...trajectory].reverse().map((r) => (
              <li key={r.id}>
                <Link to="/assessments/results/$resultId" params={{ resultId: r.id }} className="flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-colors hover:bg-white/50"
                  style={{ background: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.55)" }}>
                  <span className="text-[12px]" style={{ color: palette.muted }}>{new Date(r.completedAt).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <span className="flex items-center gap-3">
                    <DeltaChip value={r.deltaFromLast} size="sm" />
                    <span className="tabular-nums text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: SEVERITY_META[r.severity].color }}>{r.totalScore}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
