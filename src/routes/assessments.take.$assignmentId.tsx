import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveAssignment, getInstrument, submitResult, computeSeverity,
  SEVERITY_META,
} from "@/lib/assessments-store";
import { SeverityDial } from "@/components/viz/assessments/SeverityDial";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/assessments/take/$assignmentId")({
  head: () => ({ meta: [{ title: "Take assessment — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: TakeAssessment,
});

function TakeAssessment() {
  const hydrated = useHydrated();
  const { assignmentId } = Route.useParams();
  const assignment = useLiveAssignment(assignmentId);
  const navigate = useNavigate();
  const inst = assignment ? getInstrument(assignment.instrumentId) : undefined;

  const [responses, setResponses] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [summary, setSummary] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const total = inst?.items.length ?? 0;
  const item = inst?.items[idx];

  const scored = useMemo(() => {
    if (!inst) return null;
    if (Object.keys(responses).length < inst.items.length) return null;
    return computeSeverity(inst.id, responses);
  }, [inst, responses]);

  // count-up on summary reveal
  useEffect(() => {
    if (!summary || !scored) return;
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    function step(t: number) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(scored.totalScore * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [summary, scored]);

  if (!hydrated) return null;
  if (!assignment || !inst) throw notFound();

  const progress = summary ? 1 : (idx + Number(responses[item?.id ?? ""] !== undefined) / 2) / total;

  function choose(v: number) {
    if (!item) return;
    const next = { ...responses, [item.id]: v };
    setResponses(next);
    setTimeout(() => {
      if (idx + 1 < total) setIdx(idx + 1);
      else setSummary(true);
    }, 180);
  }

  function submit() {
    submitResult(assignment.id, responses);
    // Redirect back to overview for the therapist context
    navigate({ to: "/assessments" });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #FBF7F8 0%, #F5DDE4 100%)" }}>
      {/* film grain */}
      <div aria-hidden className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      }} />

      {/* progress bar */}
      <div className="h-0.5 w-full" style={{ background: "rgba(234,223,226,0.6)" }}>
        <div className="h-full transition-all duration-200 ease-out" style={{ width: `${progress * 100}%`, background: palette.primary }} />
      </div>

      <header className="px-6 py-4 flex items-center justify-between">
        <button onClick={() => (idx > 0 ? setIdx(idx - 1) : navigate({ to: "/assessments" }))} className="text-[11px] tracking-[0.14em] uppercase inline-flex items-center gap-1" style={{ color: palette.muted }}>
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <span className="text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>
          {summary ? "Complete" : `${idx + 1} of ${total}`}
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        {!summary && item && (
          <div className="w-full max-w-[560px] animate-in fade-in duration-200" key={item.id}>
            <p className="text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: palette.muted }}>{inst.name}</p>
            <h1 className="text-[clamp(1.4rem,2.4vw,1.75rem)] leading-snug tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              {item.prompt}
            </h1>
            <p className="text-[13px] mt-3" style={{ color: palette.muted }}>Over the last 2 weeks, how often has this been a problem?</p>

            <div className="mt-8 space-y-2.5">
              {item.scale.map((s, i) => {
                const severity = (["minimal", "mild", "moderate", "mod_severe", "severe"] as const)[Math.min(i, 4)];
                const selected = responses[item.id] === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => choose(s.value)}
                    className="group w-full h-[64px] px-5 rounded-2xl border flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: selected ? SEVERITY_META[severity].soft : "rgba(255,255,255,0.6)",
                      borderColor: selected ? SEVERITY_META[severity].color : "rgba(255,255,255,0.7)",
                      color: palette.ink,
                    }}
                  >
                    <span className="text-[14px]">{s.label}</span>
                    <span className="flex items-center gap-2 text-[11.5px] tabular-nums" style={{ color: palette.muted }}>
                      {s.value} <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {summary && scored && (
          <div className="w-full max-w-[560px] text-center animate-in fade-in duration-300">
            <p className="text-[11px] tracking-[0.16em] uppercase mb-4" style={{ color: palette.muted }}>{inst.name} complete</p>
            <div className="tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: "clamp(4.5rem, 9vw, 6.5rem)" }}>
              {Math.round(displayScore)}
            </div>
            <p className="mt-2 text-[13px] tracking-[0.18em] uppercase" style={{ color: SEVERITY_META[scored.severity].color, fontFamily: "'Fraunces', serif" }}>
              {SEVERITY_META[scored.severity].label}
            </p>
            <p className="mt-6 text-[13px] max-w-[380px] mx-auto" style={{ color: palette.muted }}>
              Your therapist will see this before your next session. If anything feels urgent, use the emergency contacts on your dashboard.
            </p>
            <button onClick={submit} className="mt-8 h-11 px-6 rounded-full text-[13px] transition-transform hover:scale-[1.01] inline-flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${palette.primary}, #C9709A)`, color: "#fff", fontFamily: "'Fraunces', serif" }}>
              <Check className="w-4 h-4" /> Send to your therapist
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
