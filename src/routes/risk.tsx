// Risk & safety — bucket board, patient split-view, safety-plan editor,
// escalation dialog with reason, cross-patient recent change stream.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertOctagon, ShieldAlert, ShieldCheck, TrendingUp, TrendingDown, ArrowRight,
  Phone, Mail, History, Edit3, X, Save, Plus, Minus, FileText,
} from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import {
  useLivePatients, updatePatient, listRiskChanges, RISK_META, avatarUrl,
  type RiskLevel, type Patient,
} from "@/lib/patients-store";
import { getSafetyPlan, saveSafetyPlan, emptyPlan, type SafetyPlan } from "@/lib/safety-plans-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk & safety — PeaceCode · Practice" },
      { name: "description", content: "Risk board with crisis, elevated, monitor, stable cohorts; safety plans; escalation with reason." },
    ],
  }),
  component: RiskPage,
});

const ORDER: RiskLevel[] = ["crisis", "elevated", "monitor", "stable"];

function RiskPage() {
  const hydrated = useHydrated();
  const patients = useLivePatients({ status: "active" });
  const [selected, setSelected] = useState<RiskLevel | "all">("all");
  const [openPid, setOpenPid] = useState<string | null>(null);
  const [escalate, setEscalate] = useState<{ p: Patient; next: RiskLevel } | null>(null);
  const [planFor, setPlanFor] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<RiskLevel, Patient[]> = { crisis: [], elevated: [], monitor: [], stable: [] };
    patients.forEach((p) => g[p.risk].push(p));
    return g;
  }, [patients]);

  // Recent changes across everyone
  const recentChanges = useMemo(() => {
    return patients.flatMap((p) => listRiskChanges(p.id).map((c) => ({ change: c, patient: p })))
      .sort((a, b) => b.change.at - a.change.at)
      .slice(0, 8);
  }, [patients]);

  const visible = selected === "all" ? patients : grouped[selected];
  const openPatient = openPid ? patients.find((p) => p.id === openPid) : null;

  function contactAllCrisis() {
    const emails = grouped.crisis.map((p) => p.email).filter(Boolean).join(",");
    if (emails) window.location.href = `mailto:?bcc=${emails}&subject=Checking in`;
  }

  if (!hydrated) return <AppShell crumb="Risk & safety"><div /></AppShell>;

  return (
    <AppShell crumb="Risk & safety">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6 pb-16">
        <header className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Risk & safety
            </h1>
            <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>
              Every active patient, sorted by clinical concern. Escalate the moment something shifts.
            </p>
          </div>
          {grouped.crisis.length > 0 && (
            <button onClick={contactAllCrisis} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px]" style={{ background: "#B0384A", color: "#fff" }}>
              <Mail className="h-3.5 w-3.5" /> Check in on all {grouped.crisis.length} crisis
            </button>
          )}
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

        {/* Recent changes */}
        {recentChanges.length > 0 && (
          <section className="mb-6 rounded-2xl border p-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.55)" }}>
            <div className="flex items-center gap-2 mb-3">
              <History className="h-3.5 w-3.5" style={{ color: palette.muted }} />
              <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Recent risk changes</span>
            </div>
            <ul className="space-y-1.5">
              {recentChanges.map(({ change, patient }) => {
                const up = ORDER.indexOf(change.to) < ORDER.indexOf(change.from);
                return (
                  <li key={change.id} className="flex items-center gap-2 text-[12px]">
                    <button onClick={() => setOpenPid(patient.id)} className="hover:underline" style={{ color: palette.ink }}>{patient.preferredName ?? patient.fullName}</button>
                    <span style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {RISK_META[change.from].label.toLowerCase()} → {RISK_META[change.to].label.toLowerCase()}
                    </span>
                    {up ? <TrendingUp className="h-3 w-3" style={{ color: "#B0384A" }} /> : <TrendingDown className="h-3 w-3" style={{ color: "#2F6A4A" }} />}
                    {change.reason && <span className="italic truncate" style={{ color: palette.muted }}>· {change.reason}</span>}
                    <span className="ml-auto text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {new Date(change.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {selected !== "all" && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              Showing {visible.length} · {RISK_META[selected].label.toLowerCase()}
            </p>
            <button onClick={() => setSelected("all")} className="text-[11px] underline" style={{ color: palette.muted }}>Show everyone</button>
          </div>
        )}

        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
          {visible.length === 0 ? (
            <div className="p-10 text-center text-[13px]" style={{ color: palette.muted }}>No patients in this bucket right now.</div>
          ) : (
            visible
              .slice()
              .sort((a, b) => ORDER.indexOf(a.risk) - ORDER.indexOf(b.risk) || (a.lastSessionAt ?? 0) - (b.lastSessionAt ?? 0))
              .map((p) => (
                <RiskRow
                  key={p.id} p={p}
                  active={openPid === p.id}
                  onOpen={() => setOpenPid(p.id)}
                  onStep={(next) => setEscalate({ p, next })}
                  onEditPlan={() => setPlanFor(p.id)}
                />
              ))
          )}
        </div>
      </div>

      {openPatient && <PatientPanel p={openPatient} onClose={() => setOpenPid(null)} onEditPlan={() => setPlanFor(openPatient.id)} />}
      {escalate && <EscalateDialog {...escalate} onClose={() => setEscalate(null)} />}
      {planFor && <SafetyPlanEditor patientId={planFor} onClose={() => setPlanFor(null)} />}
    </AppShell>
  );
}

function RiskRow({ p, active, onOpen, onStep, onEditPlan }: { p: Patient; active: boolean; onOpen: () => void; onStep: (next: RiskLevel) => void; onEditPlan: () => void }) {
  const meta = RISK_META[p.risk];
  const idx = ORDER.indexOf(p.risk);
  const hasPlan = !!getSafetyPlan(p.id);
  const last = p.lastSessionAt ? new Date(p.lastSessionAt) : null;

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 border-t" style={{ borderColor: palette.border, background: active ? "rgba(0,0,0,0.02)" : undefined }}>
      <img src={avatarUrl(p.id)} alt="" className="h-10 w-10 rounded-full object-cover" />
      <button onClick={onOpen} className="min-w-0 text-left">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[14px] hover:underline" style={{ color: palette.ink }}>{p.preferredName ?? p.fullName}</span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em]" style={{ background: meta.softToken, color: meta.token, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
          {(p.risk === "crisis" || p.risk === "elevated") && (
            <span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: hasPlan ? "#2F6A4A" : "#B85A3E", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <FileText className="h-3 w-3" /> {hasPlan ? "plan on file" : "no safety plan"}
            </span>
          )}
        </div>
        <div className="text-[12px] mt-0.5 truncate" style={{ color: palette.muted }}>
          {p.primaryConcern}{last && <> · last seen {last.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>}
        </div>
      </button>
      <div className="flex items-center gap-1.5">
        {(p.risk === "crisis" || p.risk === "elevated") && (
          <button onClick={onEditPlan} title="Safety plan" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.ink }}>
            <FileText className="h-3.5 w-3.5" />
          </button>
        )}
        {p.risk === "crisis" && p.emergencyContact && (
          <a href={`tel:${p.emergencyContact.phone}`} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: "#B0384A", color: "#fff" }}>
            <Phone className="h-3 w-3" /> ICE
          </a>
        )}
        <button onClick={() => idx > 0 && onStep(ORDER[idx - 1])} disabled={idx === 0} title="Escalate" className="rounded-full border p-1.5 disabled:opacity-30" style={{ borderColor: palette.border, color: "#B0384A" }}>
          <TrendingUp className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => idx < ORDER.length - 1 && onStep(ORDER[idx + 1])} disabled={idx === ORDER.length - 1} title="De-escalate" className="rounded-full border p-1.5 disabled:opacity-30" style={{ borderColor: palette.border, color: "#2F6A4A" }}>
          <TrendingDown className="h-3.5 w-3.5" />
        </button>
        <Link to="/patients/$pid" params={{ pid: p.id }} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: palette.ink, color: "#fff" }}>
          Open <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function PatientPanel({ p, onClose, onEditPlan }: { p: Patient; onClose: () => void; onEditPlan: () => void }) {
  const meta = RISK_META[p.risk];
  const history = listRiskChanges(p.id);
  const plan = getSafetyPlan(p.id);
  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(20,15,20,0.35)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="ml-auto h-full w-full max-w-[440px] overflow-y-auto p-6" style={{ background: "#FFFDFB", borderLeft: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={avatarUrl(p.id)} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h2 className="text-[18px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.preferredName ?? p.fullName}</h2>
              <p className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.age} · {p.pronouns} · {p.college}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em]" style={{ background: meta.softToken, color: meta.token, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
        <p className="text-[13px] mt-2" style={{ color: palette.ink }}>{p.primaryConcern}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
          {p.phone && <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2" style={{ borderColor: palette.border, color: palette.ink }}><Phone className="h-3.5 w-3.5" /> {p.phone}</a>}
          <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2" style={{ borderColor: palette.border, color: palette.ink }}><Mail className="h-3.5 w-3.5" /> Email</a>
          {p.emergencyContact && <a href={`tel:${p.emergencyContact.phone}`} className="col-span-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: "#B0384A", color: "#B0384A" }}><Phone className="h-3.5 w-3.5" /> ICE: {p.emergencyContact.name} ({p.emergencyContact.relation})</a>}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Safety plan</span>
          <button onClick={onEditPlan} className="inline-flex items-center gap-1 text-[11.5px]" style={{ color: palette.ink }}>
            <Edit3 className="h-3 w-3" /> {plan ? "Edit" : "Create"}
          </button>
        </div>
        {plan ? (
          <div className="mt-2 rounded-xl border p-3 text-[12px]" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", color: palette.ink }}>
            <PlanRow label="Warning signs" items={plan.warningSigns} />
            <PlanRow label="Coping strategies" items={plan.copingStrategies} />
            <PlanRow label="Supports" items={plan.supports.filter(s => s.name).map(s => `${s.name}${s.phone ? ` (${s.phone})` : ""}`)} />
            <p className="mt-2 text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              Updated {new Date(plan.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[12px] italic" style={{ color: palette.muted }}>No safety plan on file.</p>
        )}

        <div className="mt-6">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Risk history</span>
          {history.length === 0 ? (
            <p className="mt-2 text-[12px] italic" style={{ color: palette.muted }}>No changes recorded.</p>
          ) : (
            <ol className="mt-2 space-y-1.5">
              {history.map((c) => (
                <li key={c.id} className="text-[12px] rounded-lg border p-2" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.5)" }}>
                  <div className="flex justify-between" style={{ color: palette.ink }}>
                    <span style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{RISK_META[c.from].label.toLowerCase()} → {RISK_META[c.to].label.toLowerCase()}</span>
                    <span style={{ color: palette.muted }}>{new Date(c.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  {c.reason && <p className="text-[11.5px] mt-1 italic" style={{ color: palette.muted }}>{c.reason}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Link to="/patients/$pid" params={{ pid: p.id }} className="flex-1 text-center rounded-full px-3 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>Open chart</Link>
          <Link to="/notes/new" search={{ patientId: p.id }} className="flex-1 text-center rounded-full border px-3 py-2 text-[12px]" style={{ borderColor: palette.border, color: palette.ink }}>New note</Link>
        </div>
      </div>
    </div>
  );
}

function PlanRow({ label, items }: { label: string; items: string[] }) {
  const clean = items.filter((s) => s && s.trim());
  if (clean.length === 0) return null;
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <ul className="mt-0.5 list-disc list-inside space-y-0.5">
        {clean.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}

function EscalateDialog({ p, next, onClose }: { p: Patient; next: RiskLevel; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const meta = RISK_META[next];
  const up = ORDER.indexOf(next) < ORDER.indexOf(p.risk);

  function commit() {
    updatePatient(p.id, { risk: next, ...(reason.trim() ? { riskReason: reason.trim() } as Partial<Patient> : {}) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,15,20,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl p-6" style={{ background: "#FFFDFB", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          {up ? <TrendingUp className="h-4 w-4" style={{ color: meta.token }} /> : <TrendingDown className="h-4 w-4" style={{ color: meta.token }} />}
          <h3 className="text-[18px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{up ? "Escalate" : "De-escalate"} to {meta.label.toLowerCase()}</h3>
        </div>
        <p className="text-[12.5px]" style={{ color: palette.muted }}>{p.preferredName ?? p.fullName} · currently {RISK_META[p.risk].label.toLowerCase()}</p>
        <label className="block mt-4">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Reason (goes to audit log)</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder={up ? "e.g. Suicidal ideation with plan, needs immediate contact" : "e.g. Consistent stable mood over past 3 sessions"} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2" style={{ borderColor: palette.border }} />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border px-4 py-2 text-[12px]" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
          <button onClick={commit} className="rounded-full px-4 py-2 text-[12px]" style={{ background: meta.token, color: "#fff" }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function SafetyPlanEditor({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const [plan, setPlan] = useState<SafetyPlan>(() => getSafetyPlan(patientId) ?? emptyPlan(patientId));

  function updateList<K extends "warningSigns" | "copingStrategies" | "distractions">(key: K, i: number, v: string) {
    const next = [...plan[key]]; next[i] = v; setPlan({ ...plan, [key]: next });
  }
  function addTo<K extends "warningSigns" | "copingStrategies" | "distractions">(key: K) {
    setPlan({ ...plan, [key]: [...plan[key], ""] });
  }
  function removeFrom<K extends "warningSigns" | "copingStrategies" | "distractions">(key: K, i: number) {
    setPlan({ ...plan, [key]: plan[key].filter((_, x) => x !== i) });
  }
  function commit() {
    const clean: SafetyPlan = {
      ...plan,
      warningSigns: plan.warningSigns.map(s => s.trim()).filter(Boolean),
      copingStrategies: plan.copingStrategies.map(s => s.trim()).filter(Boolean),
      distractions: plan.distractions.map(s => s.trim()).filter(Boolean),
      supports: plan.supports.filter(s => s.name.trim()),
      professionals: plan.professionals.filter(s => s.name.trim()),
    };
    saveSafetyPlan(clean);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(20,15,20,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-2xl my-8 rounded-3xl p-6" style={{ background: "#FFFDFB", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[22px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Safety plan</h2>
            <p className="text-[12px]" style={{ color: palette.muted }}>Stanley–Brown template · saved locally to this browser</p>
          </div>
          <button onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>

        <ListSection label="1 · Warning signs" hint="Thoughts, feelings, behaviors that precede a crisis" items={plan.warningSigns} onChange={(i, v) => updateList("warningSigns", i, v)} onAdd={() => addTo("warningSigns")} onRemove={(i) => removeFrom("warningSigns", i)} />
        <ListSection label="2 · Internal coping strategies" hint="Things to do without contacting anyone" items={plan.copingStrategies} onChange={(i, v) => updateList("copingStrategies", i, v)} onAdd={() => addTo("copingStrategies")} onRemove={(i) => removeFrom("copingStrategies", i)} />
        <ListSection label="3 · People & places for distraction" hint="Social contacts and settings that help" items={plan.distractions} onChange={(i, v) => updateList("distractions", i, v)} onAdd={() => addTo("distractions")} onRemove={(i) => removeFrom("distractions", i)} />

        <div className="mt-4">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>4 · Supports (name + phone)</span>
          {plan.supports.map((s, i) => (
            <div key={i} className="mt-1.5 grid grid-cols-[1fr_140px_auto] gap-2">
              <input value={s.name} placeholder="Name" onChange={(e) => { const n = [...plan.supports]; n[i] = { ...n[i], name: e.target.value }; setPlan({ ...plan, supports: n }); }} className="rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
              <input value={s.phone} placeholder="Phone" onChange={(e) => { const n = [...plan.supports]; n[i] = { ...n[i], phone: e.target.value }; setPlan({ ...plan, supports: n }); }} className="rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
              <button onClick={() => setPlan({ ...plan, supports: plan.supports.filter((_, x) => x !== i) })} className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><Minus className="h-3 w-3" /></button>
            </div>
          ))}
          <button onClick={() => setPlan({ ...plan, supports: [...plan.supports, { name: "", phone: "" }] })} className="mt-2 inline-flex items-center gap-1 text-[11.5px]" style={{ color: palette.ink }}><Plus className="h-3 w-3" /> Add support</button>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>5 · Means restriction</span>
            <textarea value={plan.meansRestriction} onChange={(e) => setPlan({ ...plan, meansRestriction: e.target.value })} rows={2} placeholder="Steps to make the environment safer" className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
          </label>
          <label className="block mt-3">
            <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Reasons to live</span>
            <textarea value={plan.reasonsToLive} onChange={(e) => setPlan({ ...plan, reasonsToLive: e.target.value })} rows={2} placeholder="What matters most" className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border px-4 py-2 text-[12px]" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
          <button onClick={commit} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}><Save className="h-3.5 w-3.5" /> Save plan</button>
        </div>
      </div>
    </div>
  );
}

function ListSection({ label, hint, items, onChange, onAdd, onRemove }: { label: string; hint: string; items: string[]; onChange: (i: number, v: string) => void; onAdd: () => void; onRemove: (i: number) => void }) {
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</span>
        <span className="text-[11px] italic" style={{ color: palette.muted }}>{hint}</span>
      </div>
      {items.map((s, i) => (
        <div key={i} className="mt-1.5 grid grid-cols-[1fr_auto] gap-2">
          <input value={s} onChange={(e) => onChange(i, e.target.value)} className="rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
          <button onClick={() => onRemove(i)} className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><Minus className="h-3 w-3" /></button>
        </div>
      ))}
      <button onClick={onAdd} className="mt-2 inline-flex items-center gap-1 text-[11.5px]" style={{ color: palette.ink }}><Plus className="h-3 w-3" /> Add</button>
    </div>
  );
}
