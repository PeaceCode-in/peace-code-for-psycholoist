// Risk & Safety — real page. Aggregates patients by risk level, lets you
// drill into any patient and escalate / de-escalate their level.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertOctagon, ShieldAlert, ShieldCheck, TrendingUp, TrendingDown, ArrowRight, Phone } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLivePatients, updatePatient, RISK_META, avatarUrl, type RiskLevel, type Patient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk & safety — PeaceCode · Practice" },
      { name: "description", content: "Live risk board with crisis, elevated, monitor and stable cohorts and one-click escalation." },
    ],
  }),
  component: RiskPage,
});

const ORDER: RiskLevel[] = ["crisis", "elevated", "monitor", "stable"];

function RiskPage() {
  const hydrated = useHydrated();
  const patients = useLivePatients({ status: "active" });
  const [selected, setSelected] = useState<RiskLevel | "all">("all");

  const grouped = useMemo(() => {
    const g: Record<RiskLevel, Patient[]> = { crisis: [], elevated: [], monitor: [], stable: [] };
    patients.forEach((p) => g[p.risk].push(p));
    return g;
  }, [patients]);

  const visible = selected === "all" ? patients : grouped[selected];

  if (!hydrated) return <AppShell crumb="Risk & safety"><div /></AppShell>;

  return (
    <AppShell crumb="Risk & safety">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6 pb-16">
        <header className="mb-6">
          <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            Risk & safety
          </h1>
          <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>
            Every active patient, sorted by clinical concern. Escalate the moment something shifts.
          </p>
        </header>

        {/* Buckets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {ORDER.map((lvl) => {
            const meta = RISK_META[lvl];
            const count = grouped[lvl].length;
            const on = selected === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelected(on ? "all" : lvl)}
                className="text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
                style={{
                  background: on ? meta.softToken : "rgba(255,255,255,0.6)",
                  borderColor: on ? meta.token : palette.border,
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] tracking-[0.18em] uppercase" style={{ color: meta.token, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
                  {lvl === "crisis" ? <AlertOctagon className="h-4 w-4" style={{ color: meta.token }} /> :
                   lvl === "elevated" ? <ShieldAlert className="h-4 w-4" style={{ color: meta.token }} /> :
                   lvl === "monitor" ? <TrendingUp className="h-4 w-4" style={{ color: meta.token }} /> :
                   <ShieldCheck className="h-4 w-4" style={{ color: meta.token }} />}
                </div>
                <div className="tabular-nums leading-none mt-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 40 }}>{count}</div>
                <div className="text-[11.5px] mt-1" style={{ color: palette.muted }}>
                  {lvl === "crisis" && "Immediate action within 24h"}
                  {lvl === "elevated" && "Weekly review, contact plan active"}
                  {lvl === "monitor" && "Track trajectory, reassess in 2 weeks"}
                  {lvl === "stable" && "Routine cadence, no flags"}
                </div>
              </button>
            );
          })}
        </div>

        {selected !== "all" && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              Showing {visible.length} · {RISK_META[selected].label.toLowerCase()}
            </p>
            <button onClick={() => setSelected("all")} className="text-[11px] underline" style={{ color: palette.muted }}>Show everyone</button>
          </div>
        )}

        {/* Patient list */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
          {visible.length === 0 ? (
            <div className="p-10 text-center text-[13px]" style={{ color: palette.muted }}>No patients in this bucket right now.</div>
          ) : (
            visible
              .slice()
              .sort((a, b) => ORDER.indexOf(a.risk) - ORDER.indexOf(b.risk) || (a.lastSessionAt ?? 0) - (b.lastSessionAt ?? 0))
              .map((p) => <RiskRow key={p.id} p={p} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}

function RiskRow({ p }: { p: Patient }) {
  const meta = RISK_META[p.risk];
  const idx = ORDER.indexOf(p.risk);
  const canEscalate = idx > 0;
  const canRelax = idx < ORDER.length - 1;
  const last = p.lastSessionAt ? new Date(p.lastSessionAt) : null;

  function step(dir: -1 | 1) {
    const next = ORDER[Math.max(0, Math.min(ORDER.length - 1, idx + dir))];
    if (next !== p.risk) updatePatient(p.id, { risk: next });
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 border-t" style={{ borderColor: palette.border }}>
      <img src={avatarUrl(p.id)} alt="" className="h-10 w-10 rounded-full object-cover" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link to="/patients/$pid" params={{ pid: p.id }} className="text-[14px] hover:underline" style={{ color: palette.ink }}>{p.preferredName ?? p.fullName}</Link>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em]" style={{ background: meta.softToken, color: meta.token, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {meta.label}
          </span>
          <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.age} · {p.pronouns}</span>
        </div>
        <div className="text-[12px] mt-0.5 truncate" style={{ color: palette.muted }}>
          {p.primaryConcern}
          {last && <> · last seen {last.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {p.risk === "crisis" && p.emergencyContact && (
          <a href={`tel:${p.emergencyContact.phone}`} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: "#B0384A", color: "#fff" }}>
            <Phone className="h-3 w-3" /> ICE
          </a>
        )}
        <button onClick={() => step(1)} disabled={!canEscalate} title="Escalate" className="rounded-full border p-1.5 disabled:opacity-30" style={{ borderColor: palette.border, color: "#B0384A" }}>
          <TrendingUp className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => step(-1)} disabled={!canRelax} title="De-escalate" className="rounded-full border p-1.5 disabled:opacity-30" style={{ borderColor: palette.border, color: "#2F6A4A" }}>
          <TrendingDown className="h-3.5 w-3.5" />
        </button>
        <Link to="/patients/$pid" params={{ pid: p.id }} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: palette.ink, color: "#fff" }}>
          Open <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
