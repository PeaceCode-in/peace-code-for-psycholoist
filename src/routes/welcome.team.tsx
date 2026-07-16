// Team onboarding: appears when practice.kind === "group".
// Three sub-steps: invite clinicians, supervision pairs, shared templates.
import { palette } from '@/components/practice/palette';
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, Glyph, InkField, Mono, Panel, Serif, StepRule, SAKURA } from "@/components/practice/onboarding/primitives";

export const Route = createFileRoute("/welcome/team")({
  component: TeamOnboarding,
});

type Invite = { email: string; role: "clinician" | "supervisor" | "owner"; inherit: boolean };

function TeamOnboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "clinician", inherit: true }]);
  const [pairs, setPairs] = useState<{ sup: string; supee: string }[]>([]);
  const [shared, setShared] = useState<string[]>(["Intake form", "Consent (DPDP)", "Cancellation policy"]);
  const total = 3;
  const done = [step > 0, step > 1, step > 2];

  return (
    <main className="min-h-screen flex flex-col px-8 py-8">
      <header className="max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/welcome/complete" className="text-[12px]" style={{ color: SAKURA.muted }}><Mono>Team setup</Mono></Link>
          <Mono style={{ color: SAKURA.muted }}>Step {step + 1} of {total}</Mono>
        </div>
        <StepRule total={total} current={step} done={done} />
      </header>

      <section className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center py-10">
        {step === 0 && (
          <>
            <Header eyebrow="01 · Invite" heading="Bring the room together." sub="Emails only — we'll send each colleague a warm invitation with their own five-step onboarding." glyph="door" />
            <Panel className="p-8 space-y-3">
              {invites.map((inv, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    value={inv.email}
                    onChange={(e) => setInvites(invites.map((x, j) => j === i ? { ...x, email: e.target.value } : x))}
                    placeholder="colleague@example.com"
                    className="flex-1 rounded-xl bg-white/70 px-4 py-3 text-[14px] outline-none"
                    style={{ border: `1px solid ${SAKURA.border}` }}
                  />
                  <select
                    value={inv.role}
                    onChange={(e) => setInvites(invites.map((x, j) => j === i ? { ...x, role: e.target.value as Invite["role"] } : x))}
                    className="rounded-xl bg-white/70 px-4 py-3 text-[13px] outline-none"
                    style={{ border: `1px solid ${SAKURA.border}` }}
                  >
                    <option value="clinician">Clinician</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="owner">Owner</option>
                  </select>
                  <Chip active={inv.inherit} onClick={() => setInvites(invites.map((x, j) => j === i ? { ...x, inherit: !x.inherit } : x))}>Inherit specialties</Chip>
                  <button onClick={() => setInvites(invites.filter((_, j) => j !== i))} className="text-[13px]" style={{ color: SAKURA.muted }}>×</button>
                </div>
              ))}
              <button onClick={() => setInvites([...invites, { email: "", role: "clinician", inherit: true }])} className="text-[12.5px] underline underline-offset-4" style={{ color: SAKURA.accent }}>
                + add another
              </button>
            </Panel>
          </>
        )}

        {step === 1 && (
          <>
            <Header eyebrow="02 · Supervision" heading="Pair supervisors with supervisees." sub="Drag and drop — or add pairs by hand. Supervision notes stay private to the pair." glyph="leaf" />
            <Panel className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Mono style={{ color: SAKURA.muted }}>Supervisors</Mono>
                  <div className="mt-2 space-y-2">
                    {invites.filter((i) => i.role === "supervisor").map((i) => (
                      <div key={i.email} className="rounded-xl px-4 py-3 text-[13.5px]" style={{ background: "rgba(176,86,122,0.06)", border: `1px solid ${SAKURA.border}` }}>{i.email || "(unnamed)"}</div>
                    ))}
                    {invites.filter((i) => i.role === "supervisor").length === 0 && (
                      <div className="text-[12.5px]" style={{ color: SAKURA.muted }}>No supervisors yet — go back and mark one.</div>
                    )}
                  </div>
                </div>
                <div>
                  <Mono style={{ color: SAKURA.muted }}>Supervisees</Mono>
                  <div className="mt-2 space-y-2">
                    {invites.filter((i) => i.role === "clinician").map((i) => (
                      <div key={i.email} className="rounded-xl px-4 py-3 text-[13.5px]" style={{ background: palette.glass, border: `1px solid ${SAKURA.border}` }}>{i.email || "(unnamed)"}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t" style={{ borderColor: SAKURA.border }}>
                <div className="flex gap-3">
                  <InkField label="Add pair — supervisor" value={pairs.at(-1)?.sup ?? ""} onChange={() => {}} placeholder="sup@example.com" />
                  <InkField label="supervisee" value={pairs.at(-1)?.supee ?? ""} onChange={() => {}} placeholder="dev@example.com" />
                </div>
                <button onClick={() => setPairs([...pairs, { sup: "", supee: "" }])} className="mt-3 text-[12.5px] underline underline-offset-4" style={{ color: SAKURA.accent }}>+ add pair</button>
              </div>
            </Panel>
          </>
        )}

        {step === 2 && (
          <>
            <Header eyebrow="03 · Shared shelves" heading="What lives in the practice-wide cupboard?" sub="Everyone can read shared resources. Anything not on this list stays per-clinician." glyph="flask" />
            <Panel className="p-8">
              <div className="flex flex-wrap gap-2">
                {["Intake form","Consent (DPDP)","Cancellation policy","SOAP template","Homework packet","Discharge summary","Superbill","Sliding-scale application"].map((r) => (
                  <Chip key={r} active={shared.includes(r)} onClick={() => setShared(shared.includes(r) ? shared.filter((x) => x !== r) : [...shared, r])}>{r}</Chip>
                ))}
              </div>
            </Panel>
          </>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => step === 0 ? nav({ to: "/welcome/complete" }) : setStep(step - 1)} className="text-[13px]" style={{ color: SAKURA.muted }}>← Back</button>
          <button
            onClick={() => step === total - 1 ? nav({ to: "/" }) : setStep(step + 1)}
            className="rounded-full px-7 py-3 text-[13.5px] font-medium"
            style={{ background: SAKURA.accent, color: "#fff", boxShadow: "0 14px 30px -14px rgba(176,86,122,0.55)" }}
          >
            {step === total - 1 ? "Open the practice →" : "Continue →"}
          </button>
        </div>
      </section>
    </main>
  );
}

function Header({ eyebrow, heading, sub, glyph }: { eyebrow: string; heading: string; sub: string; glyph: Parameters<typeof Glyph>[0]["kind"] }) {
  return (
    <div className="flex items-start gap-6 mb-8">
      <div className="hidden md:block mt-1"><Glyph kind={glyph} size={48} /></div>
      <div>
        <Mono style={{ color: SAKURA.accent }}>{eyebrow}</Mono>
        <h1 className="mt-2 text-[34px] leading-[1.1]"><Serif>{heading}</Serif></h1>
        <p className="mt-2 text-[14.5px] max-w-xl" style={{ color: SAKURA.muted }}>{sub}</p>
      </div>
    </div>
  );
}
