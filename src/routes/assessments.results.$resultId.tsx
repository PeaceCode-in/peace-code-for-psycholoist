import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, AlertOctagon, FileCheck2, CalendarPlus, ShieldAlert } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveResult, getInstrument, getPatientTrajectory, markReviewed,
  SEVERITY_META,
} from "@/lib/assessments-store";
import { sessionsForPatient } from "@/lib/sessions-store";
import { getPatient, avatarUrl } from "@/lib/patients-store";
import { SeverityDial } from "@/components/viz/assessments/SeverityDial";
import { TrajectoryChart } from "@/components/viz/assessments/TrajectoryChart";
import { ItemResponseBar } from "@/components/viz/assessments/ItemResponseBar";
import { DeltaChip } from "@/components/viz/assessments/DeltaChip";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/assessments/results/$resultId")({
  head: () => ({ meta: [{ title: "Result — PeaceCode" }] }),
  component: ResultView,
});

function ResultView() {
  const hydrated = useHydrated();
  const { resultId } = Route.useParams();
  const result = useLiveResult(resultId);
  const navigate = useNavigate();
  const [sessionOverlay, setSessionOverlay] = useState(true);

  const inst = result ? getInstrument(result.instrumentId) : undefined;
  const patient = result ? getPatient(result.patientId) : undefined;
  const trajectory = useMemo(() => (result ? getPatientTrajectory(result.patientId, result.instrumentId) : []), [result]);
  const sessionDates = useMemo(() => (result ? sessionsForPatient(result.patientId).map((s) => new Date(s.startsAt).getTime()) : []), [result]);

  if (!hydrated) return null;
  if (!result || !inst) throw notFound();

  const maxItem = Math.max(...inst.items[0].scale.map((s) => s.value));
  const daysSince = trajectory.length > 1
    ? Math.round((new Date(result.completedAt).getTime() - new Date(trajectory[trajectory.indexOf(result) - 1]?.completedAt ?? result.completedAt).getTime()) / 86_400_000)
    : 0;
  const hasCritical = result.criticalFlags.length > 0;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      <Link to="/assessments" className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="w-3 h-3" /> Overview
      </Link>

      <header className="flex items-center gap-3 mb-8 flex-wrap">
        {patient && <img src={avatarUrl(patient.id)} alt="" className="w-11 h-11 rounded-full" />}
        <div>
          <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>{inst.name} · {new Date(result.completedAt).toLocaleString([], { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" })}</p>
          <h1 className="text-[clamp(1.4rem,2vw,1.8rem)] tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            {patient?.fullName ?? "Result"}
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-8">
        {/* LEFT — the score */}
        <section className="space-y-6">
          <Glass className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-8">
            <div className="min-w-0">
              <div className="tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: "clamp(3.5rem, 6vw, 4.5rem)" }}>
                {result.totalScore}
              </div>
              <p className="mt-1 text-[13px] tracking-[0.18em] uppercase" style={{ color: SEVERITY_META[result.severity].color, fontFamily: "'Fraunces', serif" }}>
                {SEVERITY_META[result.severity].label}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <DeltaChip value={result.deltaFromLast} />
                {typeof result.deltaFromLast === "number" && daysSince > 0 && (
                  <span className="text-[11px]" style={{ color: palette.muted }}>vs. {daysSince} days ago</span>
                )}
              </div>
            </div>
            <div className="mx-auto md:ml-auto">
              <SeverityDial instrument={inst} score={result.totalScore} size={220} />
            </div>
          </Glass>

          {hasCritical && (
            <Glass className="p-5" style={{ background: "rgba(241,199,214,0.35)", borderColor: "rgba(176,86,122,0.4)" }}>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0" strokeWidth={1.5} style={{ color: "#8A2C3E" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: "#8A2C3E" }}>Critical flag · immediate review</p>
                  {result.criticalFlags.map((fid) => {
                    const it = inst.items.find((x) => x.id === fid);
                    return it ? <p key={fid} className="text-[13.5px] mt-1.5 leading-snug" style={{ color: palette.ink }}>“{it.prompt}” — response {result.responses[fid]}</p> : null;
                  })}
                  <button onClick={() => toast("Safety-plan document scaffolded")} className="mt-3 text-[11.5px] px-3 py-1.5 rounded-full" style={{ background: "#B0384A", color: "#fff" }}>
                    Document safety plan
                  </button>
                </div>
              </div>
            </Glass>
          )}

          <Glass className="p-5">
            <p className="text-[10.5px] tracking-[0.16em] uppercase mb-4" style={{ color: palette.muted }}>Item breakdown</p>
            <ol className="space-y-2.5">
              {inst.items.map((it, i) => {
                const critical = (inst.scoring.criticalItems ?? []).includes(it.id);
                return (
                  <li key={it.id} className="grid grid-cols-[24px_1fr_160px] items-center gap-3">
                    <span className="tabular-nums text-[10.5px] text-right" style={{ color: palette.muted }}>{i + 1}</span>
                    <p className="text-[12.5px] leading-snug min-w-0 truncate" style={{ color: palette.ink }} title={it.prompt}>{it.prompt}</p>
                    <ItemResponseBar value={result.responses[it.id] ?? 0} max={maxItem} critical={critical && (result.responses[it.id] ?? 0) >= (inst.scoring.criticalThreshold ?? 1)} />
                  </li>
                );
              })}
            </ol>
          </Glass>
        </section>

        {/* RIGHT — context */}
        <section className="space-y-6">
          <Glass className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Trajectory</p>
              <label className="text-[10.5px] tracking-[0.12em] uppercase inline-flex items-center gap-1.5 cursor-pointer" style={{ color: palette.muted }}>
                <input type="checkbox" checked={sessionOverlay} onChange={(e) => setSessionOverlay(e.target.checked)} className="accent-[#B0567A]" />
                Sessions
              </label>
            </div>
            <div className="mt-2 -mx-2">
              <TrajectoryChart data={trajectory} instrument={inst} sessionDates={sessionDates} showSessionOverlay={sessionOverlay} height={220} />
            </div>
          </Glass>

          <Glass className="p-5 space-y-2.5">
            <p className="text-[10.5px] tracking-[0.16em] uppercase mb-2" style={{ color: palette.muted }}>Clinician actions</p>
            <ActionRow
              icon={<FileCheck2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
              label={result.clinicianReviewed ? "Reviewed" : "Mark reviewed"}
              onClick={() => { if (!result.clinicianReviewed) { markReviewed(result.id); toast.success("Marked reviewed"); } }}
              done={result.clinicianReviewed}
            />
            <ActionRow icon={<CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Assign follow-up" onClick={() => navigate({ to: "/assessments/assignments" })} />
            <ActionRow icon={<FileCheck2 className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Add to session note" onClick={() => patient && navigate({ to: "/patients/$pid/notes/new", params: { pid: patient.id } })} />
            {hasCritical && (
              <ActionRow
                icon={<AlertOctagon className="w-3.5 h-3.5" strokeWidth={1.5} />}
                label="Escalate"
                emphasized
                onClick={() => toast("Escalation workflow will be wired to Risk in the next pass")}
              />
            )}
          </Glass>
        </section>
      </div>
    </div>
  );
}

function Glass({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl border ${className}`} style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(24px) saturate(140%)", borderColor: "rgba(255,255,255,0.55)", ...style }}>
      {children}
    </div>
  );
}

function ActionRow({ icon, label, onClick, emphasized, done }: { icon: React.ReactNode; label: string; onClick: () => void; emphasized?: boolean; done?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl transition-colors text-[12.5px]"
      style={{
        background: emphasized ? "rgba(176,86,122,0.14)" : done ? "rgba(95,138,106,0.14)" : "rgba(255,255,255,0.55)",
        color: emphasized ? "#8A2C3E" : done ? "#3F6549" : palette.ink,
        border: `1px solid ${emphasized ? "rgba(176,86,122,0.35)" : done ? "rgba(95,138,106,0.35)" : palette.border}`,
      }}
    >
      {icon} {label}
    </button>
  );
}
