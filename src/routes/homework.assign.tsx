import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLivePatients } from "@/lib/patients-store";
import { useLiveTemplates, createAssignment, type Recurrence, type Modality } from "@/lib/homework-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/homework/assign")({
  component: AssignPage,
});

function AssignPage() {
  const hydrated = useHydrated();
  const patients = useLivePatients({ status: "active" });
  const templates = useLiveTemplates();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPids, setSelectedPids] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [q, setQ] = useState("");
  const [modality, setModality] = useState<Modality | "all">("all");
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10);
  });
  const [recurrence, setRecurrence] = useState<Recurrence>("once");
  const [instructions, setInstructions] = useState("");
  const [reflection, setReflection] = useState("");

  const filteredTpl = useMemo(() => templates.filter((t) => {
    if (modality !== "all" && t.modality !== modality) return false;
    if (!q) return true;
    return t.name.toLowerCase().includes(q.toLowerCase()) || t.description.toLowerCase().includes(q.toLowerCase());
  }), [templates, q, modality]);

  if (!hydrated) return null;

  function togglePid(id: string) {
    setSelectedPids((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function submit() {
    if (selectedPids.length === 0 || !templateId) return;
    const dueTs = new Date(dueAt + "T20:00:00").getTime();
    const created = createAssignment({
      patientIds: selectedPids,
      templateId,
      dueAt: dueTs,
      recurrence,
      instructions: instructions || undefined,
      reflectionPrompt: reflection || undefined,
    });
    if (created.length === 1) navigate({ to: "/homework/$hid", params: { hid: created[0].id } });
    else navigate({ to: "/homework" });
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      <Link to="/homework" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <div className="rounded-3xl border p-8 lg:p-10" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.85)" }}>
        <Steps step={step} />

        {step === 1 && (
          <>
            <h2 className="text-[22px] mt-6 mb-2" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Who is this for?</h2>
            <p className="text-[12.5px] mb-4" style={{ color: palette.muted }}>Pick one patient, or multi-select for a group assignment.</p>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[420px] overflow-auto pr-1">
              {patients.map((p) => {
                const on = selectedPids.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => togglePid(p.id)}
                    className="text-left rounded-xl border p-3 transition-all duration-[180ms]"
                    style={{ borderColor: on ? palette.ink : palette.border, background: on ? palette.ink : "#fff", color: on ? "#fff" : palette.ink }}>
                    <div className="flex items-center justify-between">
                      <div className="text-[13px]" style={{ fontFamily: "'Fraunces', serif" }}>{p.fullName}</div>
                      {on && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-75">{p.yearOfStudy} · {p.college}</div>
                  </button>
                );
              })}
            </div>
            <FooterNav next={() => setStep(2)} nextDisabled={selectedPids.length === 0} nextLabel={`Continue with ${selectedPids.length}`} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-[22px] mt-6 mb-2" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Pick a template</h2>
            <div className="flex items-center gap-2 mt-3 mb-4">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" className="w-full h-9 pl-9 pr-3 rounded-full border text-[12.5px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
              </div>
              <select value={modality} onChange={(e) => setModality(e.target.value as Modality | "all")} className="h-9 px-3 rounded-full border text-[12px] bg-white" style={{ borderColor: palette.border, color: palette.ink }}>
                <option value="all">All modalities</option>
                {["CBT", "DBT", "ACT", "Mindfulness", "Behavioral", "Reflective"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[420px] overflow-auto pr-1">
              {filteredTpl.map((t) => {
                const on = templateId === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setTemplateId(t.id)}
                    className="text-left rounded-xl border p-3 transition-all duration-[180ms]"
                    style={{ borderColor: on ? palette.ink : palette.border, background: on ? palette.ink : "#fff", color: on ? "#fff" : palette.ink }}>
                    <div className="text-[10.5px] uppercase tracking-[0.14em] opacity-70" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{t.modality}</div>
                    <div className="text-[13px] mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>{t.name}</div>
                    <div className="text-[11.5px] mt-1 opacity-80">{t.description}</div>
                  </button>
                );
              })}
            </div>
            <FooterNav back={() => setStep(1)} next={() => setStep(3)} nextDisabled={!templateId} />
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-[22px] mt-6 mb-4" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Configure</h2>
            <div className="grid gap-5">
              <Field label="Due date">
                <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
              </Field>
              <Field label="Recurrence">
                <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: "#fff" }}>
                  {(["once", "daily", "weekly"] as Recurrence[]).map((r) => {
                    const on = recurrence === r;
                    return (
                      <button key={r} type="button" onClick={() => setRecurrence(r)}
                        className="px-3 h-7 rounded-full text-[12px] capitalize"
                        style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{r}</button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Custom instructions (optional — defaults to template's)">
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className="w-full rounded-xl border p-3 text-[13px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
              </Field>
              <Field label="Reflection prompt (optional)">
                <input value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="e.g. What surprised you this week?" className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
              </Field>
            </div>
            <FooterNav back={() => setStep(2)} next={submit} nextLabel="Assign" />
          </>
        )}
      </div>
    </div>
  );
}

function Steps({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Patients", "Template", "Configure"];
  return (
    <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {labels.map((l, i) => {
        const on = step === i + 1;
        const done = step > i + 1;
        return (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className="grid place-items-center h-5 w-5 rounded-full" style={{ background: on || done ? palette.ink : "transparent", color: on || done ? "#fff" : palette.muted, border: `1px solid ${palette.border}` }}>{i + 1}</span>
            <span style={{ color: on ? palette.ink : palette.muted }}>{l}</span>
            {i < 2 && <ArrowRight className="h-3 w-3 mx-1 opacity-40" />}
          </span>
        );
      })}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      {children}
    </div>
  );
}
function FooterNav({ back, next, nextLabel = "Continue", nextDisabled }: { back?: () => void; next: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <div>{back && <button onClick={back} className="text-[12px] underline" style={{ color: palette.muted }}>Back</button>}</div>
      <button onClick={next} disabled={nextDisabled} className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-[12.5px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff" }}>{nextLabel}</button>
    </div>
  );
}
