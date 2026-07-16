import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Search, Check } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLivePatients } from "@/lib/patients-store";
import { useLiveFormulary, createMedication, type Frequency, type Route_ } from "@/lib/prescriptions-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/new")({
  validateSearch: z.object({ pid: z.string().optional() }),
  component: NewMed,
});

function NewMed() {
  const hydrated = useHydrated();
  const { pid } = useSearch({ from: "/prescriptions/new" });
  const patients = useLivePatients({ status: "active" });
  const formulary = useLiveFormulary();
  const nav = useNavigate();

  const [step, setStep] = useState(pid ? 2 : 1);
  const [patientId, setPatientId] = useState(pid ?? "");
  const [drugId, setDrugId] = useState("");
  const [q, setQ] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("OD");
  const [route_, setRoute] = useState<Route_>("PO");
  const [indication, setIndication] = useState("");
  const [prescriber, setPrescriber] = useState<"self" | "external">("self");
  const [externalName, setExternalName] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [supplyDays, setSupplyDays] = useState(30);
  const [notes, setNotes] = useState("");
  const [taperPlan, setTaperPlan] = useState("");

  const filteredDrugs = useMemo(() => formulary.filter((d) => {
    if (!q) return true;
    return `${d.generic} ${d.brands.join(" ")} ${d.drugClass}`.toLowerCase().includes(q.toLowerCase());
  }), [formulary, q]);

  const drug = formulary.find((d) => d.id === drugId);

  if (!hydrated) return null;

  function submit() {
    if (!patientId || !drug || !dose) return;
    const med = createMedication({
      patientId, drugId: drug.id, dose, frequency, route: route_, indication: indication || "as clinically indicated",
      startedAt: new Date(startDate + "T09:00:00").getTime(),
      prescriber: prescriber === "self" ? "Dr. Aditi Rao, PsyD" : (externalName || "External prescriber"),
      supplyDays, notes, taperPlan: taperPlan || undefined,
    });
    nav({ to: "/prescriptions/patient/$pid", params: { pid: med.patientId } });
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      <Link to="/prescriptions" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Prescriptions
      </Link>

      <div className="rounded-3xl border p-8 lg:p-10" style={{ borderColor: palette.border, background: palette.glassStrong }}>
        <Steps step={step} />

        {step === 1 && (
          <>
            <h2 className="text-[22px] mt-6 mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Patient</h2>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full h-11 px-3 rounded-xl border text-[13.5px] bg-white" style={{ borderColor: palette.border, color: palette.ink }}>
              <option value="">Select a patient…</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} · {p.college}</option>)}
            </select>
            <Nav next={() => setStep(2)} nextDisabled={!patientId} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-[22px] mt-6 mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Drug</h2>
            <div className="relative mb-3">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search generic or brand" className="w-full h-10 pl-9 pr-3 rounded-full border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
            </div>
            <div className="max-h-[380px] overflow-auto grid sm:grid-cols-2 gap-2 pr-1">
              {filteredDrugs.map((d) => {
                const on = drugId === d.id;
                return (
                  <button key={d.id} type="button" onClick={() => { setDrugId(d.id); setFrequency(d.defaultFrequency); }}
                    className="text-left rounded-xl border p-3" style={{ borderColor: on ? palette.ink : palette.border, background: on ? palette.ink : "#fff", color: on ? "#fff" : palette.ink }}>
                    <div className="flex items-center justify-between">
                      <div style={{ fontFamily: "'Fraunces', serif" }}>{d.generic}</div>
                      {on && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-75">{d.brands.join(" · ")} · {d.drugClass}</div>
                    <div className="text-[10.5px] mt-1 opacity-75" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{d.typicalRange}</div>
                  </button>
                );
              })}
            </div>
            <Nav back={() => setStep(1)} next={() => setStep(3)} nextDisabled={!drugId} />
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-[22px] mt-6 mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Regimen</h2>
            <div className="grid gap-4">
              <Row label={`Dose ${drug ? `(range: ${drug.typicalRange})` : ""}`}>
                <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 10 mg" className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
              </Row>
              <Row label="Frequency">
                <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: palette.solid }}>
                  {(["OD", "BD", "TID", "QID", "HS", "PRN"] as Frequency[]).map((f) => {
                    const on = frequency === f;
                    return <button key={f} type="button" onClick={() => setFrequency(f)} className="px-3 h-7 rounded-full text-[12px]" style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f}</button>;
                  })}
                </div>
              </Row>
              <Row label="Route">
                <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: palette.solid }}>
                  {(["PO", "SL", "IM", "IV", "TD"] as Route_[]).map((r) => {
                    const on = route_ === r;
                    return <button key={r} type="button" onClick={() => setRoute(r)} className="px-3 h-7 rounded-full text-[12px]" style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{r}</button>;
                  })}
                </div>
              </Row>
              <Row label="Indication">
                <input value={indication} onChange={(e) => setIndication(e.target.value)} placeholder="e.g. Generalised anxiety" className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
              </Row>
            </div>
            <Nav back={() => setStep(2)} next={() => setStep(4)} nextDisabled={!dose} />
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-[22px] mt-6 mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Meta</h2>
            <div className="grid gap-4">
              <Row label="Prescriber">
                <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: palette.solid }}>
                  {(["self", "external"] as const).map((p) => {
                    const on = prescriber === p;
                    return <button key={p} type="button" onClick={() => setPrescriber(p)} className="px-3 h-7 rounded-full text-[12px] capitalize" style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p}</button>;
                  })}
                </div>
                {prescriber === "external" && (
                  <input value={externalName} onChange={(e) => setExternalName(e.target.value)} placeholder="External prescriber name" className="mt-2 w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
                )}
              </Row>
              <Row label="Start date">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
              </Row>
              <Row label="Supply (days)">
                <input type="number" value={supplyDays} onChange={(e) => setSupplyDays(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
              </Row>
              <Row label="Notes">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border p-3 text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
              </Row>
              <Row label="Taper plan (if applicable)">
                <input value={taperPlan} onChange={(e) => setTaperPlan(e.target.value)} placeholder="e.g. Reduce by 5 mg every 2 weeks" className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
              </Row>
            </div>
            <Nav back={() => setStep(3)} next={submit} nextLabel="Add medication" />
          </>
        )}
      </div>
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ["Patient", "Drug", "Regimen", "Meta"];
  return (
    <div className="flex items-center gap-2 flex-wrap text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {labels.map((l, i) => {
        const on = step === i + 1;
        const done = step > i + 1;
        return (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className="grid place-items-center h-5 w-5 rounded-full" style={{ background: on || done ? palette.ink : "transparent", color: on || done ? "#fff" : palette.muted, border: `1px solid ${palette.border}` }}>{i + 1}</span>
            <span style={{ color: on ? palette.ink : palette.muted }}>{l}</span>
          </span>
        );
      })}
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      {children}
    </div>
  );
}
function Nav({ back, next, nextLabel = "Continue", nextDisabled }: { back?: () => void; next: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <div>{back && <button onClick={back} className="text-[12px] underline" style={{ color: palette.muted }}>Back</button>}</div>
      <button onClick={next} disabled={nextDisabled} className="inline-flex items-center h-10 px-5 rounded-full text-[12.5px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff" }}>{nextLabel}</button>
    </div>
  );
}
