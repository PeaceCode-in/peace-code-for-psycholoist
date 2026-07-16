import { palette } from '@/components/practice/palette';
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BreathingDot, Glyph, Mono, Panel, Serif, SAKURA } from "@/components/practice/onboarding/primitives";
import { completeOnboarding, useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/welcome/complete")({
  component: WelcomeComplete,
});

function WelcomeComplete() {
  const nav = useNavigate();
  const s = useOnboarding();
  useEffect(() => { completeOnboarding(); }, []);

  const cred = s.identity.credentials || "Clinical Psychologist";
  const name = s.identity.fullName || "Your Practice";
  const specialties = [...s.specialties.modalities, ...s.specialties.concerns].slice(0, 5);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="mb-4 flex items-center justify-center gap-3">
            <BreathingDot />
            <Mono style={{ color: SAKURA.muted }}>The practice is open</Mono>
          </div>
          <h1 className="text-[42px] md:text-[54px] leading-[1.05] tracking-[-0.015em]">
            <Serif>Welcome to </Serif>
            <Serif style={{ color: SAKURA.accent, fontStyle: "italic" }}>PeaceCode</Serif>
            <Serif>.</Serif>
          </h1>
        </div>

        {/* Identity card */}
        <Panel className="p-8 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <Mono style={{ color: SAKURA.muted }}>Practice snapshot</Mono>
              <div className="mt-3 text-[30px] leading-tight"><Serif>{name}</Serif></div>
              <div className="text-[13px] mt-1" style={{ color: SAKURA.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{cred}</div>

              <div className="mt-6 grid grid-cols-2 gap-5 text-[13px]">
                <SnapRow label="Practice" value={`${s.practice.kind === "group" ? "Group" : "Solo"} · ${s.practice.city || "—"}`} />
                <SnapRow label="Languages" value={s.practice.languages.join(", ") || "—"} />
                <SnapRow label="Working days" value={s.rhythm.days.join(" · ") || "—"} />
                <SnapRow label="Session" value={`${s.rhythm.sessionMinutes} min · ${s.rhythm.bufferMinutes} min buffer`} />
                <SnapRow label="Base fee" value={`₹${s.rates.baseINR.toLocaleString("en-IN")}`} />
                <SnapRow label="Instruments" value={`${s.instruments.length} on the shelf`} />
              </div>

              {specialties.length > 0 && (
                <div className="mt-6">
                  <Mono style={{ color: SAKURA.muted }}>Specialties</Mono>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {specialties.map((sp) => (
                      <span key={sp} className="rounded-full px-3 py-1 text-[12px]" style={{ background: "rgba(176,86,122,0.09)", color: SAKURA.accent, border: `1px solid ${SAKURA.border}` }}>{sp}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:block opacity-90"><Glyph kind="door" size={64} /></div>
          </div>
        </Panel>

        <div className="mt-8 grid md:grid-cols-3 gap-3">
          <button
            onClick={() => nav({ to: "/" })}
            className="rounded-2xl px-5 py-4 text-[14px] font-medium transition-all duration-150"
            style={{ background: SAKURA.accent, color: "#fff", boxShadow: "0 16px 30px -16px rgba(176,86,122,0.55)" }}
          >
            Open my dashboard
          </button>
          <Link to="/documents" className="rounded-2xl px-5 py-4 text-[14px] text-center transition-all duration-150" style={{ background: palette.glassStrong, border: `1px solid ${SAKURA.border}`, color: SAKURA.ink }}>
            Send myself a test intake
          </Link>
          <Link to="/calendar" className="rounded-2xl px-5 py-4 text-[14px] text-center transition-all duration-150" style={{ background: palette.glassStrong, border: `1px solid ${SAKURA.border}`, color: SAKURA.ink }}>
            Book my first calendar slot
          </Link>
        </div>

        <div className="mt-10 text-center">
          <div className="text-[14px]" style={{ color: SAKURA.muted }}><Serif>Your practice is open. Welcome to PeaceCode.</Serif></div>
          <Link to="/welcome/letter" className="mt-3 inline-block text-[12px] underline underline-offset-4" style={{ color: SAKURA.accent, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            A note from PeaceCode →
          </Link>
        </div>
      </div>
    </main>
  );
}

function SnapRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px]" style={{ color: SAKURA.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
      <div className="mt-0.5 text-[14px]" style={{ color: SAKURA.ink }}>{value}</div>
    </div>
  );
}
