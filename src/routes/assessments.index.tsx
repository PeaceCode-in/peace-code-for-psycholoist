import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveResults, useLiveInstruments, useLiveAssignments,
  practicePulse, getPatientTrajectory, getPatientActiveInstruments,
  getCriticalFlags, getInstrument, SEVERITY_META,
  type Instrument, type AssessmentResult,
} from "@/lib/assessments-store";
import { getPatient, avatarUrl } from "@/lib/patients-store";
import { TrajectoryCell } from "@/components/viz/assessments/TrajectoryCell";
import { DeltaChip } from "@/components/viz/assessments/DeltaChip";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/assessments/")({
  head: () => ({ meta: [{ title: "Assessments — Overview" }] }),
  component: OverviewPage,
});

function Glass({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl border ${className}`} style={{ background: palette.glass, backdropFilter: "blur(24px) saturate(140%)", borderColor: "rgba(255,255,255,0.55)", ...style }}>
      {children}
    </div>
  );
}
function Sparkline({ values, color, width = 84, height = 18 }: { values: number[]; color: string; width?: number; height?: number }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const step = width / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`).join(" ");
  return <svg width={width} height={height}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} /></svg>;
}

function OverviewPage() {
  const hydrated = useHydrated();
  const results = useLiveResults();
  const instruments = useLiveInstruments();
  const assignments = useLiveAssignments();
  const [sort, setSort] = useState<"improved" | "deteriorating" | "overdue" | "newest">("improved");

  const pulse = useMemo(() => practicePulse(), [results, assignments]);
  const critical = useMemo(() => getCriticalFlags(), [results]);

  // Trajectory wall — one row per unique (patient, instrument) with ≥2 results
  const cells = useMemo(() => {
    const seen = new Map<string, { patientId: string; instrument: Instrument; data: AssessmentResult[] }>();
    results.forEach((r) => {
      const key = `${r.patientId}|${r.instrumentId}`;
      if (!seen.has(key)) {
        const inst = getInstrument(r.instrumentId);
        if (inst) seen.set(key, { patientId: r.patientId, instrument: inst, data: getPatientTrajectory(r.patientId, r.instrumentId) });
      }
    });
    const arr = [...seen.values()].filter((c) => c.data.length >= 2);
    arr.sort((a, b) => {
      const la = a.data[a.data.length - 1];
      const lb = b.data[b.data.length - 1];
      const da = la.deltaFromLast ?? 0;
      const db = lb.deltaFromLast ?? 0;
      if (sort === "improved") return da - db; // most negative first
      if (sort === "deteriorating") return db - da;
      if (sort === "newest") return lb.completedAt.localeCompare(la.completedAt);
      // overdue → put patients with pending overdue at top
      const oa = assignments.some((x) => x.patientId === a.patientId && x.instrumentId === a.instrument.id && x.status === "pending" && (x.dueAt ?? "") < new Date().toISOString());
      const ob = assignments.some((x) => x.patientId === b.patientId && x.instrumentId === b.instrument.id && x.status === "pending" && (x.dueAt ?? "") < new Date().toISOString());
      return (ob ? 1 : 0) - (oa ? 1 : 0);
    });
    return arr;
  }, [results, assignments, sort]);

  if (!hydrated) return <div className="p-8 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading…</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Practice overview</p>
          <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            Assessments
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to="/assessments/assignments" className="text-[12px] px-3.5 py-1.5 rounded-full border" style={{ borderColor: palette.border, color: palette.ink, background: palette.glass }}>Assignments</Link>
          <Link to="/assessments/library" className="text-[12px] px-3.5 py-1.5 rounded-full" style={{ background: palette.ink, color: "#fff" }}>Instrument library</Link>
        </div>
      </header>

      {/* Band A — Practice Pulse */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <PulseTile
          label="Assignments due"
          value={pulse.dueCount}
          right={<div className="w-16"><div className="text-[9.5px] tracking-[0.12em] uppercase" style={{ color: palette.muted }}>On-time {pulse.onTimePct}%</div><div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "#EADFE2" }}><div className="h-full" style={{ width: `${pulse.onTimePct}%`, background: "#5F8A6A" }} /></div></div>}
        />
        <PulseTile
          label="Completed · 30d"
          value={pulse.completed30d}
          right={<Sparkline values={pulse.completed30dTrend} color={palette.primary} />}
        />
        <PulseTile
          label="Critical flags"
          value={pulse.critical}
          tone={pulse.critical > 0 ? "#B0567A" : palette.ink}
          right={
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pulse.critical, 5) }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#B0567A" }} />
              ))}
            </div>
          }
        />
        <PulseTile
          label="Avg symptom lift"
          value={pulse.avgDelta}
          renderValue={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`}
          tone={pulse.avgDelta < 0 ? "#3F6549" : pulse.avgDelta > 0 ? "#8A2C3E" : palette.ink}
          right={<span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: palette.muted }}>vs prior</span>}
        />
      </section>

      {/* Band B — Trajectory Wall */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[15px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Trajectory wall</h2>
          <div className="flex gap-1.5">
            {([
              ["improved", "Most improved"],
              ["deteriorating", "Deteriorating"],
              ["overdue", "Overdue"],
              ["newest", "Newest"],
            ] as const).map(([k, label]) => {
              const active = sort === k;
              return (
                <button key={k} onClick={() => setSort(k)} className="text-[10.5px] px-2.5 py-1 rounded-full transition-colors" style={{ background: active ? palette.ink : "rgba(255,255,255,0.55)", color: active ? "#fff" : palette.muted, border: `1px solid ${active ? palette.ink : palette.border}` }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Glass className="p-4">
          {cells.length === 0 ? (
            <p className="text-[12.5px] py-10 text-center" style={{ color: palette.muted }}>No trajectories yet — assign an instrument to start tracking.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {cells.map((c) => <TrajectoryCard key={`${c.patientId}-${c.instrument.id}`} {...c} />)}
            </div>
          )}
        </Glass>
      </section>

      {/* Band C — Critical Flags Rail */}
      <section>
        <h2 className="text-[15px] tracking-tight mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Critical flags</h2>
        {critical.length === 0 ? (
          <Glass className="p-8 flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-8 h-8" strokeWidth={1.4} style={{ color: "#5F8A6A" }} />
            <p className="text-[13px]" style={{ color: palette.muted }}>All clear. Nothing awaiting review.</p>
          </Glass>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x -mx-1 px-1">
            {critical.map((r) => <CriticalCard key={r.id} result={r} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function PulseTile({ label, value, right, tone, renderValue }: { label: string; value: number; right?: React.ReactNode; tone?: string; renderValue?: (v: number) => string }) {
  return (
    <Glass className="p-4 flex flex-col justify-between min-h-[112px]">
      <p className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>{label}</p>
      <div className="flex items-end justify-between gap-3 mt-3">
        <span className="tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: tone ?? palette.ink, fontSize: 40 }}>
          {renderValue ? renderValue(value) : value}
        </span>
        {right && <div className="mb-1">{right}</div>}
      </div>
    </Glass>
  );
}

function TrajectoryCard({ patientId, instrument, data }: { patientId: string; instrument: Instrument; data: AssessmentResult[] }) {
  const patient = getPatient(patientId);
  const last = data[data.length - 1];
  return (
    <Link
      to="/assessments/results/$resultId" params={{ resultId: last.id }}
      className="group rounded-2xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-16px_rgba(30,20,24,0.25)]"
      style={{ background: palette.glassStrong, borderColor: "rgba(255,255,255,0.6)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEVERITY_META[last.severity].color }} />
            {instrument.name}
          </div>
          <div className="text-[13px] font-medium mt-0.5 truncate" style={{ color: palette.ink }}>{patient?.preferredName ?? patient?.fullName ?? patientId}</div>
        </div>
        <span className="tabular-nums text-[18px] leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{last.totalScore}</span>
      </div>
      <div className="mt-2 -mx-1">
        <TrajectoryCell data={data} instrument={instrument} width={220} height={56} />
      </div>
      <div className="mt-2 flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
        <DeltaChip value={last.deltaFromLast} size="sm" />
        <span className="text-[10px] tracking-[0.12em] uppercase inline-flex items-center gap-1" style={{ color: palette.muted }}>
          View <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function CriticalCard({ result }: { result: AssessmentResult }) {
  const patient = getPatient(result.patientId);
  const inst = getInstrument(result.instrumentId)!;
  const firstFlag = result.criticalFlags[0];
  const item = inst.items.find((i) => i.id === firstFlag);
  return (
    <div className="snap-start shrink-0 w-[300px] rounded-2xl border p-4" style={{ background: "rgba(241,199,214,0.22)", borderColor: "rgba(176,86,122,0.35)" }}>
      <div className="flex items-center gap-2.5">
        <img src={avatarUrl(patient?.id ?? result.patientId)} alt="" className="w-8 h-8 rounded-full" />
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium truncate" style={{ color: palette.ink }}>{patient?.fullName ?? "—"}</div>
          <div className="text-[10px] tracking-[0.14em] uppercase" style={{ color: "#8A2C3E" }}>{inst.name} · flag</div>
        </div>
      </div>
      <p className="text-[11.5px] mt-3 leading-snug line-clamp-2" style={{ color: palette.ink }}>
        “{item?.prompt}”
      </p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px]" style={{ color: palette.muted }}>{new Date(result.completedAt).toLocaleString([], { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" })}</span>
        <Link to="/assessments/results/$resultId" params={{ resultId: result.id }} className="text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "#B0567A", color: "#fff" }}>
          Review <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
