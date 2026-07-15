import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, Plus, FileText } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveMedsForPatient, useLiveAllergies, findInteractions } from "@/lib/prescriptions-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/patient/$pid")({
  component: PatientChart,
});

function PatientChart() {
  const { pid } = Route.useParams();
  const hydrated = useHydrated();
  const meds = useLiveMedsForPatient(pid);
  const allergies = useLiveAllergies(pid);
  const nav = useNavigate();

  if (!hydrated) return null;
  const p = getPatient(pid);
  if (!p) return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-[13px]" style={{ color: palette.muted }}>Patient not found.</p>
    </div>
  );
  const active = meds.filter((m) => m.status !== "discontinued");
  const historical = meds.filter((m) => m.status === "discontinued");
  const interactions = findInteractions(meds);

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <Link to="/prescriptions" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Prescriptions
      </Link>

      {/* Header */}
      <div className="rounded-3xl border p-6 lg:p-8 mb-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.85)" }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[26px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.fullName}</h2>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>{p.pronouns} · {p.age} · {p.primaryConcern}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => nav({ to: "/prescriptions/new", search: { pid } as never })} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
              <Plus className="h-3.5 w-3.5" /> Add medication
            </button>
          </div>
        </div>
        {allergies.length > 0 && (
          <div className="mt-4 rounded-xl px-4 py-3 border flex items-start gap-2" style={{ borderColor: "#B0567A", background: "#F6DCE3" }}>
            <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: "#8A2E4E" }} />
            <div className="text-[12.5px]" style={{ color: "#8A2E4E" }}>
              <div className="uppercase tracking-[0.16em] text-[10px] mb-0.5" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>Allergies</div>
              {allergies.map((a, i) => (<span key={i} className="mr-3">{a.allergen} — {a.reaction}</span>))}
            </div>
          </div>
        )}
        {interactions.length > 0 && (
          <div className="mt-3 rounded-xl px-4 py-3 border" style={{ borderColor: palette.border, background: palette.surface2 }}>
            <div className="text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Interactions ({interactions.length})</div>
            <ul className="text-[12px] space-y-1" style={{ color: palette.ink }}>
              {interactions.map((x, i) => (
                <li key={i}><span className="italic">{x.a.drugSnapshot.generic}</span> × <span className="italic">{x.b.drugSnapshot.generic}</span> — {x.note} <span className="opacity-60">({x.severity})</span></li>
              ))}
            </ul>
            <div className="text-[10.5px] mt-2" style={{ color: palette.muted }}>Reference only. Never a substitute for clinical judgment.</div>
          </div>
        )}
      </div>

      {/* Active meds table */}
      <div className="rounded-2xl border overflow-hidden mb-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)" }}>
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_auto] text-[10.5px] uppercase tracking-[0.14em] px-4 py-2 border-b" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <div>Drug</div><div>Dose · freq</div><div>Started</div><div>Prescriber</div><div>Indication</div><div></div>
        </div>
        {active.length === 0 ? (
          <div className="p-8 text-center text-[12.5px]" style={{ color: palette.muted }}>No active medications.</div>
        ) : active.map((m) => (
          <div key={m.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_auto] items-center px-4 py-3 border-b text-[12.5px]" style={{ borderColor: palette.border, color: palette.ink }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif" }}>{m.drugSnapshot.generic}</div>
              <div className="text-[11px]" style={{ color: palette.muted }}>{m.drugSnapshot.brands.join(" · ")} · {m.drugSnapshot.drugClass}</div>
            </div>
            <div>{m.dose} · {m.frequency}</div>
            <div>{new Date(m.startedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div className="truncate">{m.prescriber}</div>
            <div className="truncate">{m.indication}</div>
            <div className="flex items-center gap-2 justify-end">
              <Link to="/prescriptions/$mid/titrate" params={{ mid: m.id }} className="text-[11.5px] underline" style={{ color: palette.ink }}>Titrate</Link>
              <Link to="/prescriptions/$mid/discontinue" params={{ mid: m.id }} className="text-[11.5px] underline" style={{ color: palette.ink }}>Discontinue</Link>
              <Link to="/prescriptions/$mid/letter" params={{ mid: m.id }} className="inline-flex items-center gap-1 text-[11.5px]" style={{ color: palette.primary }}>
                <FileText className="h-3 w-3" /> Letter
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {meds.length > 0 && (
        <div className="rounded-2xl border p-5 mb-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)" }}>
          <div className="text-[10.5px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Timeline</div>
          <ul className="space-y-3">
            {meds.map((m) => (
              <li key={m.id} className="text-[12.5px]" style={{ color: palette.ink }}>
                <div className="flex items-baseline gap-3">
                  <span className="text-[10.5px] w-24" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{new Date(m.startedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  <span style={{ fontFamily: "'Fraunces', serif" }}>{m.drugSnapshot.generic}</span>
                  <span style={{ color: palette.muted }}>started at {m.history.length ? m.history[0].fromDose : m.dose}</span>
                </div>
                {m.history.map((h) => (
                  <div key={h.id} className="flex items-baseline gap-3 mt-1 pl-4">
                    <span className="text-[10.5px] w-20" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{new Date(h.at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                    <span style={{ color: palette.muted }}>→</span><span>{h.toDose}</span><span className="italic opacity-70">{h.reason}</span>
                  </div>
                ))}
                {m.discontinuation && (
                  <div className="flex items-baseline gap-3 mt-1 pl-4">
                    <span className="text-[10.5px] w-20" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{new Date(m.discontinuation.at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                    <span style={{ color: palette.muted }}>discontinued —</span> {m.discontinuation.reason}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Historical */}
      {historical.length > 0 && (
        <details className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)" }}>
          <summary className="cursor-pointer text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Historical · {historical.length}</summary>
          <ul className="mt-3 space-y-2 text-[12.5px]">
            {historical.map((m) => (
              <li key={m.id} className="flex items-baseline gap-3" style={{ color: palette.ink }}>
                <span style={{ fontFamily: "'Fraunces', serif" }}>{m.drugSnapshot.generic}</span>
                <span style={{ color: palette.muted }}>{m.dose} · {m.frequency} · {m.discontinuation?.reason ?? "discontinued"}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
