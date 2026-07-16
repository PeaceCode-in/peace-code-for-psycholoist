import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  STEPS, type StepId, useOnboarding, setStepData, setListField, markStep, enterStep, activateSampleData,
  CREDENTIALS, LANGUAGES, CONCERNS, POPULATIONS, MODALITIES, INSTRUMENT_LIBRARY,
} from "@/lib/onboarding-store";
import { createPatient } from "@/lib/patients-store";
import { Chip, Glyph, InkField, Mono, Panel, Serif, StepRule, SAKURA } from "@/components/practice/onboarding/primitives";

export const Route = createFileRoute("/welcome/setup/$step")({
  component: SetupStep,
});

function SetupStep() {
  const { step } = Route.useParams() as { step: StepId };
  const nav = useNavigate();
  const s = useOnboarding();
  const idx = STEPS.findIndex((x) => x.id === step);
  const meta = STEPS[idx];
  const enteredAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!meta) { nav({ to: "/welcome" }); return; }
    enterStep(step);
    enteredAtRef.current = Date.now();
  }, [step, meta, nav]);

  if (!meta) return null;

  const doneFlags = STEPS.map((st) => s.progress[st.id]?.status === "done");

  function next() {
    markStep(step, "done", Date.now() - enteredAtRef.current);
    if (idx === STEPS.length - 1) { nav({ to: "/welcome/complete" }); return; }
    nav({ to: "/welcome/setup/$step", params: { step: STEPS[idx + 1].id } });
  }
  function skip() {
    markStep(step, "skipped", Date.now() - enteredAtRef.current);
    if (idx === STEPS.length - 1) { nav({ to: "/welcome/complete" }); return; }
    nav({ to: "/welcome/setup/$step", params: { step: STEPS[idx + 1].id } });
  }
  function back() {
    if (idx === 0) { nav({ to: "/welcome" }); return; }
    nav({ to: "/welcome/setup/$step", params: { step: STEPS[idx - 1].id } });
  }

  const glyphMap: Record<StepId, Parameters<typeof Glyph>[0]["kind"]> = {
    identity: "line", practice: "door", specialties: "leaf",
    rhythm: "clock", rates: "coin", instruments: "flask", "first-patient": "seed",
  };

  return (
    <main className="min-h-screen flex flex-col px-8 py-8">
      {/* Top rule + eyebrow */}
      <header className="max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/welcome" className="flex items-center gap-2 text-[12px]" style={{ color: SAKURA.muted }}>
            <Mono>PeaceCode</Mono>
          </Link>
          <div className="text-right">
            <Mono style={{ color: SAKURA.muted }}>Step {idx + 1} of {STEPS.length}</Mono>
          </div>
        </div>
        <StepRule total={STEPS.length} current={idx} done={doneFlags} />
      </header>

      <section
        key={step}
        className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center py-10"
        style={{ animation: "pc-slide 380ms cubic-bezier(.4,0,.2,1)" }}
      >
        <div className="flex items-start gap-6 mb-10">
          <div className="hidden md:block mt-2 opacity-90"><Glyph kind={glyphMap[step]} size={52} /></div>
          <div>
            <Mono style={{ color: SAKURA.accent }}>{meta.eyebrow}</Mono>
            <h1 className="mt-2 text-[38px] md:text-[46px] leading-[1.08] tracking-[-0.015em]">
              <Serif>{meta.heading}</Serif>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: SAKURA.muted }}>{meta.sub}</p>
          </div>
        </div>

        <Panel className="p-8 md:p-10">
          {step === "identity" && <IdentityStep />}
          {step === "practice" && <PracticeStep />}
          {step === "specialties" && <SpecialtiesStep />}
          {step === "rhythm" && <RhythmStep />}
          {step === "rates" && <RatesStep />}
          {step === "instruments" && <InstrumentsStep />}
          {step === "first-patient" && <FirstPatientStep onCommit={next} />}
        </Panel>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={back} className="text-[13px]" style={{ color: SAKURA.muted }}>← Back</button>
          <div className="flex items-center gap-6">
            <button onClick={skip} className="text-[12px] underline underline-offset-4" style={{ color: SAKURA.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Skip for now</button>
            <button
              onClick={next}
              className="rounded-full px-7 py-3 text-[13.5px] font-medium transition-all duration-150"
              style={{ background: SAKURA.accent, color: "#fff", boxShadow: "0 14px 30px -14px rgba(176,86,122,0.55)" }}
            >
              {idx === STEPS.length - 1 ? "Open my practice →" : "Continue →"}
            </button>
          </div>
        </div>
      </section>

      <style>{`@keyframes pc-slide { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </main>
  );
}

// ── Step components ──────────────────────────────────────

function IdentityStep() {
  const s = useOnboarding();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <InkField label="Full name" value={s.identity.fullName} onChange={(v) => setStepData("identity", { fullName: v })} placeholder="Dr. Priya Sharma" />
      <InkField label="Pronouns" value={s.identity.pronouns} onChange={(v) => setStepData("identity", { pronouns: v })} placeholder="she/her" />
      <div className="md:col-span-2">
        <div className="mb-2"><Mono style={{ color: SAKURA.muted }}>Credentials</Mono></div>
        <div className="flex flex-wrap gap-2">
          {CREDENTIALS.map((c) => {
            const active = s.identity.credentials.split(",").map((x) => x.trim()).includes(c);
            return (
              <Chip key={c} active={active} onClick={() => {
                const cur = s.identity.credentials.split(",").map((x) => x.trim()).filter(Boolean);
                const next = active ? cur.filter((x) => x !== c) : [...cur, c];
                setStepData("identity", { credentials: next.join(", ") });
              }}>{c}</Chip>
            );
          })}
        </div>
      </div>
      <div className="md:col-span-2 text-[12.5px]" style={{ color: SAKURA.muted }}>
        A professional photo is optional. You can add one from Settings → Profile whenever the light is good.
      </div>
    </div>
  );
}

function PracticeStep() {
  const s = useOnboarding();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <div className="mb-2"><Mono style={{ color: SAKURA.muted }}>Practice shape</Mono></div>
        <div className="flex gap-3">
          {(["solo","group"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setStepData("practice", { kind: k })}
              className="flex-1 rounded-2xl p-5 text-left transition-all duration-150"
              style={{
                background: s.practice.kind === k ? "rgba(176,86,122,0.08)" : "rgba(255,255,255,0.55)",
                border: `1px solid ${s.practice.kind === k ? SAKURA.accent : SAKURA.border}`,
              }}
            >
              <div className="text-[15px] font-medium"><Serif>{k === "solo" ? "Solo practice" : "Group practice"}</Serif></div>
              <div className="mt-1 text-[12.5px]" style={{ color: SAKURA.muted }}>
                {k === "solo" ? "Just you. You can invite colleagues later." : "You + clinicians. Team surface unlocks after setup."}
              </div>
            </button>
          ))}
        </div>
      </div>
      <InkField label="Practice name" value={s.practice.name} onChange={(v) => setStepData("practice", { name: v })} placeholder="Sanjeevani Counseling" />
      <InkField label="City" value={s.practice.city} onChange={(v) => setStepData("practice", { city: v })} placeholder="Bengaluru" />
      <div className="md:col-span-2">
        <div className="mb-2"><Mono style={{ color: SAKURA.muted }}>Languages you work in</Mono></div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const active = s.practice.languages.includes(l);
            return (
              <Chip key={l} active={active} onClick={() => {
                const next = active ? s.practice.languages.filter((x) => x !== l) : [...s.practice.languages, l];
                setStepData("practice", { languages: next });
              }}>{l}</Chip>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpecialtiesStep() {
  const s = useOnboarding();
  function toggle(field: "concerns" | "populations" | "modalities", v: string) {
    const cur = s.specialties[field];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    setStepData("specialties", { [field]: next } as Partial<typeof s.specialties>);
  }
  return (
    <div className="space-y-8">
      {[
        { key: "concerns" as const, label: "Presenting concerns", items: CONCERNS },
        { key: "populations" as const, label: "Populations you serve", items: POPULATIONS },
        { key: "modalities" as const, label: "Modalities", items: MODALITIES },
      ].map((g) => (
        <div key={g.key}>
          <div className="mb-2 flex items-center justify-between">
            <Mono style={{ color: SAKURA.muted }}>{g.label}</Mono>
            <Mono style={{ color: SAKURA.muted, opacity: 0.6 }}>{s.specialties[g.key].length} selected</Mono>
          </div>
          <div className="flex flex-wrap gap-2">
            {g.items.map((c) => (
              <Chip key={c} active={s.specialties[g.key].includes(c)} onClick={() => toggle(g.key, c)}>{c}</Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RhythmStep() {
  const s = useOnboarding();
  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2"><Mono style={{ color: SAKURA.muted }}>Working days</Mono></div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => {
            const active = s.rhythm.days.includes(d);
            return (
              <Chip key={d} active={active} onClick={() => {
                const next = active ? s.rhythm.days.filter((x) => x !== d) : [...s.rhythm.days, d];
                setStepData("rhythm", { days: next });
              }}>{d}</Chip>
            );
          })}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <InkField label="Session length (min)" value={String(s.rhythm.sessionMinutes)} onChange={(v) => setStepData("rhythm", { sessionMinutes: Number(v) || 50 })} />
        <InkField label="Buffer between (min)" value={String(s.rhythm.bufferMinutes)} onChange={(v) => setStepData("rhythm", { bufferMinutes: Number(v) || 10 })} />
        <InkField label="Weekly session cap" value={String(s.rhythm.weeklyCap)} onChange={(v) => setStepData("rhythm", { weeklyCap: Number(v) || 25 })} />
      </div>
      <div className="text-[12.5px]" style={{ color: SAKURA.muted }}>
        Your calendar will offer slots inside these hours only. Buffer is enforced automatically between bookings.
      </div>
    </div>
  );
}

function RatesStep() {
  const s = useOnboarding();
  const METHODS = ["UPI","Card","Bank transfer","Cash","Insurance"];
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <InkField label="Base fee (₹)" value={String(s.rates.baseINR)} onChange={(v) => setStepData("rates", { baseINR: Number(v) || 0 })} />
        <InkField label="Sliding low (₹)" value={String(s.rates.slidingLow)} onChange={(v) => setStepData("rates", { slidingLow: Number(v) || 0 })} hint="Optional — leave equal to base to disable." />
        <InkField label="Sliding high (₹)" value={String(s.rates.slidingHigh)} onChange={(v) => setStepData("rates", { slidingHigh: Number(v) || 0 })} />
      </div>
      <div>
        <div className="mb-2"><Mono style={{ color: SAKURA.muted }}>Payment methods you accept</Mono></div>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => {
            const active = s.rates.methods.includes(m);
            return (
              <Chip key={m} active={active} onClick={() => {
                const next = active ? s.rates.methods.filter((x) => x !== m) : [...s.rates.methods, m];
                setStepData("rates", { methods: next });
              }}>{m}</Chip>
            );
          })}
        </div>
      </div>
      <div>
        <div className="mb-2"><Mono style={{ color: SAKURA.muted }}>Cancellation policy — in your own words</Mono></div>
        <textarea
          value={s.rates.cancellation}
          onChange={(e) => setStepData("rates", { cancellation: e.target.value })}
          rows={4}
          className="w-full rounded-xl bg-white/70 px-4 py-3 text-[14px] outline-none"
          style={{ border: `1px solid ${SAKURA.border}`, color: SAKURA.ink, fontFamily: "'Fraunces', serif" }}
        />
      </div>
    </div>
  );
}

function InstrumentsStep() {
  const s = useOnboarding();
  return (
    <div className="space-y-3">
      {INSTRUMENT_LIBRARY.map((inst) => {
        const active = s.instruments.includes(inst.id);
        return (
          <button
            key={inst.id}
            onClick={() => {
              const next = active ? s.instruments.filter((x) => x !== inst.id) : [...s.instruments, inst.id];
              setListField("instruments", next);
            }}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-all duration-150"
            style={{
              background: active ? "rgba(176,86,122,0.06)" : "rgba(255,255,255,0.55)",
              border: `1px solid ${active ? SAKURA.accent : SAKURA.border}`,
            }}
          >
            <div
              className="h-5 w-5 rounded-md flex items-center justify-center"
              style={{ background: active ? SAKURA.accent : "transparent", border: `1px solid ${active ? SAKURA.accent : SAKURA.border}` }}
            >
              {active && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4.2 L3.4 6.6 L9 1" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] font-medium">{inst.name}{inst.core && <span className="ml-2 text-[10.5px]" style={{ color: SAKURA.accent, fontFamily: "'DM Mono', ui-monospace, monospace" }}>CORE</span>}</div>
              <div className="text-[12.5px]" style={{ color: SAKURA.muted }}>{inst.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FirstPatientStep({ onCommit }: { onCommit: () => void }) {
  const [mode, setMode] = useState<"real" | "csv" | "sample" | null>(null);
  const [form, setForm] = useState({ name: "", email: "", concern: "" });

  function commitReal() {
    if (!form.name.trim()) return;
    createPatient({
      fullName: form.name, preferredName: form.name.split(" ")[0], pronouns: "they/them",
      age: 24, email: form.email || "patient@example.com", college: "—", yearOfStudy: "—",
      status: "active", risk: "stable", primaryConcern: form.concern || "Intake in progress",
      tags: [], intakeDate: Date.now(), consentSharing: false,
    });
    onCommit();
  }
  function commitSample() {
    activateSampleData();
    onCommit();
  }

  if (!mode) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { k: "real" as const, title: "Add a real patient", sub: "Name and email — the rest can come later.", glyph: "seed" as const },
          { k: "csv"  as const, title: "Import from CSV",     sub: "Bring your existing roster in one file.",   glyph: "flask" as const },
          { k: "sample"as const, title: "Explore with sample patients", sub: "Aarav, Meera & Kiran — three fictional lives, six sessions each.", glyph: "leaf" as const },
        ].map((o) => (
          <button
            key={o.k}
            onClick={() => setMode(o.k)}
            className="text-left rounded-2xl p-5 transition-all duration-150"
            style={{ background: palette.glass, border: `1px solid ${SAKURA.border}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,86,122,0.05)"; e.currentTarget.style.borderColor = SAKURA.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = SAKURA.border; }}
          >
            <div className="mb-3"><Glyph kind={o.glyph} size={32} /></div>
            <div className="text-[15px] font-medium"><Serif>{o.title}</Serif></div>
            <div className="mt-1.5 text-[12.5px]" style={{ color: SAKURA.muted }}>{o.sub}</div>
          </button>
        ))}
      </div>
    );
  }

  if (mode === "real") {
    return (
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <InkField label="Patient name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Rhea Kapoor" />
          <InkField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="rhea@example.com" />
        </div>
        <InkField label="Presenting concern (a note to self)" value={form.concern} onChange={(v) => setForm({ ...form, concern: v })} placeholder="Referral from campus counseling; anxiety around thesis defense." />
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => setMode(null)} className="text-[12px]" style={{ color: SAKURA.muted }}>← other options</button>
          <div className="flex-1" />
          <button onClick={commitReal} disabled={!form.name.trim()} className="rounded-full px-6 py-2.5 text-[13.5px] font-medium disabled:opacity-40" style={{ background: SAKURA.accent, color: "#fff" }}>Add patient</button>
        </div>
      </div>
    );
  }

  if (mode === "csv") {
    return (
      <div className="text-center py-6">
        <div className="mx-auto max-w-md">
          <Glyph kind="flask" size={44} />
          <div className="mt-4 text-[16px]"><Serif>Drop a CSV, or point us at a Google Sheet.</Serif></div>
          <div className="mt-2 text-[13px]" style={{ color: SAKURA.muted }}>We'll match columns and preview before anything writes. (Import surface lives at Patients → Import once onboarding closes.)</div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => setMode(null)} className="text-[12px]" style={{ color: SAKURA.muted }}>← other options</button>
            <button onClick={onCommit} className="rounded-full px-6 py-2.5 text-[13.5px] font-medium" style={{ background: SAKURA.accent, color: "#fff" }}>I'll import later</button>
          </div>
        </div>
      </div>
    );
  }

  // sample
  return (
    <div className="text-center py-4">
      <div className="mx-auto max-w-lg">
        <Glyph kind="leaf" size={44} />
        <div className="mt-4 text-[18px]"><Serif>Meet Aarav, Meera, and Kiran.</Serif></div>
        <div className="mt-2 text-[13.5px] leading-relaxed" style={{ color: SAKURA.muted }}>
          Three fictional patients with 4–6 sessions of history, SOAP notes, assessments, and homework each.
          A soft ribbon on affected surfaces will remind you it's sample data — one click to remove, anytime.
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => setMode(null)} className="text-[12px]" style={{ color: SAKURA.muted }}>← other options</button>
          <button onClick={commitSample} className="rounded-full px-6 py-2.5 text-[13.5px] font-medium" style={{ background: SAKURA.accent, color: "#fff" }}>Load sample patients</button>
        </div>
      </div>
    </div>
  );
}
