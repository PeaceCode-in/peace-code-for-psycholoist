import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BreathingDot, Mono, Serif, SAKURA } from "@/components/practice/onboarding/primitives";
import { currentDisplayName } from "@/lib/auth-store";
import { enterStep, setStepData } from "@/lib/onboarding-store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/welcome/")({
  component: WelcomeIndex,
});

function WelcomeIndex() {
  const navigate = useNavigate();
  const [name, setName] = useState("Therapist");
  useEffect(() => {
    const d = currentDisplayName();
    if (d.first) setName(d.first);
  }, []);

  function begin() {
    enterStep("identity");
    setStepData("identity", { fullName: name === "Therapist" ? "" : name });
    navigate({ to: "/welcome/setup/$step", params: { step: "identity" } });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex items-center justify-center gap-3">
          <BreathingDot />
          <Mono style={{ color: SAKURA.muted }}>PeaceCode · Practice</Mono>
        </div>
        <h1 className="text-[44px] md:text-[56px] leading-[1.05] tracking-[-0.015em]" style={{ color: SAKURA.ink }}>
          <Serif>Welcome, </Serif>
          <Serif style={{ color: SAKURA.accent, fontStyle: "italic" }}>{name}</Serif>
          <Serif>. Let's build your practice, together.</Serif>
        </h1>
        <p className="mt-6 text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: SAKURA.muted }}>
          Seven quiet steps. Nothing you enter is wasted — by the end, your practice is already breathing.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={begin}
            className="group relative rounded-full px-8 py-3.5 text-[14px] font-medium transition-all duration-200"
            style={{
              background: SAKURA.accent,
              color: "#fff",
              boxShadow: "0 20px 40px -18px rgba(176,86,122,0.55)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 24px 44px -18px rgba(176,86,122,0.65)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 40px -18px rgba(176,86,122,0.55)"; }}
          >
            Begin
          </button>
          <Link to="/" className="text-[13px] underline underline-offset-4" style={{ color: SAKURA.muted }}>
            Skip for now
          </Link>
        </div>
        <div className="mt-16 text-[11px]" style={{ color: SAKURA.muted, opacity: 0.7 }}>
          <Mono>~ 6 minutes · every step leaves something real behind</Mono>
        </div>
      </div>
    </main>
  );
}
