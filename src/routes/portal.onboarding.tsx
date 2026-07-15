import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { markOnboarded, useCurrentClient } from "@/lib/portal-store";
import { portal } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/portal/onboarding")({
  head: () => ({ meta: [{ title: "Welcome" }, { name: "robots", content: "noindex" }] }),
  component: Onboarding,
});

const STEPS = [
  {
    title: "A note from your therapist",
    body: "I'm glad you're here. Take your time with the portal — none of it needs to be rushed. This is your space.",
    signOff: true,
  },
  {
    title: "What lives here",
    body: "Your upcoming sessions, short check-ins I might send between visits, our messages, and any homework we agree on. Also your invoices and any documents I've shared with you.",
    signOff: false,
  },
  {
    title: "If things feel heavy",
    body: "There's a small button at the top of every page called \"I need help now.\" It's always one tap away, whether we're in session or not.",
    signOff: false,
  },
];

function Onboarding() {
  const client = useCurrentClient();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  if (!client) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen" style={{ background: portal.bg, color: portal.ink, fontFamily: "'DM Sans', system-ui" }}>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <div className="mb-8 flex gap-2">
          {STEPS.map((_, i) => (
            <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? portal.rose : portal.soft }} />
          ))}
        </div>
        <p className="text-[13px]" style={{ color: portal.muted }}>Welcome, {client.firstName}</p>
        <h1 className="mt-3" style={{ fontFamily: "'Fraunces', serif", fontSize: 32, letterSpacing: -0.5, lineHeight: 1.15 }}>{s.title}</h1>
        <p className="mt-4 text-[16.5px]" style={{ color: portal.ink, lineHeight: 1.55 }}>{s.body}</p>
        {s.signOff ? (
          <p className="mt-6 text-[15px]" style={{ color: portal.muted, fontFamily: "'Fraunces', serif" }}>— {client.therapistName}, {client.therapistTitle}</p>
        ) : null}

        <div className="mt-12 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="text-[14px]" style={{ color: portal.muted }}>Back</button>
          ) : <span />}
          <button
            onClick={() => { if (isLast) { markOnboarded(); nav({ to: "/portal" }); } else setStep(step + 1); }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px]"
            style={{ background: portal.rose, color: "#fff" }}
          >
            {isLast ? <>Enter the portal <Check className="h-4 w-4" /></> : <>Next <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
