import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { PortalShell, portal } from "@/components/portal/PortalShell";
import { ANSWER_OPTIONS, ASSESSMENT_ITEMS, bandFor, completeAssessment, updateAssessmentAnswer, useMyAssessments } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/assessments/$id")({
  head: () => ({ meta: [{ title: "Check-in" }, { name: "robots", content: "noindex" }] }),
  component: TakeAssessment,
});

function TakeAssessment() {
  const { id } = Route.useParams();
  const list = useMyAssessments();
  const nav = useNavigate();
  const a = list.find(x => x.id === id);
  const [i, setI] = useState<number>(() => a?.cursor ?? 0);
  const questions = a ? ASSESSMENT_ITEMS[a.instrument] : [];
  const total = questions.length;

  const done = useMemo(() => a?.status === "completed", [a]);
  const band = a?.score != null ? bandFor(a.instrument, a.score) : null;

  if (!a) return <PortalShell title="Not found"><p style={{ color: portal.muted }}>This check-in isn't available anymore.</p></PortalShell>;

  if (done && band) {
    return (
      <PortalShell>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[13px]" style={{ color: portal.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{a.instrument} · complete</p>
          <h1 className="mt-6" style={{ fontFamily: "'Fraunces', serif", fontSize: 32, letterSpacing: -0.4 }}>Thanks for checking in.</h1>
          <p className="mt-4 text-[16px]" style={{ color: portal.ink }}>{band.friendly}</p>
          <p className="mt-6 text-[13px]" style={{ color: portal.muted }}>Your therapist will see this before your next session.</p>
          <button onClick={() => nav({ to: "/portal" })} className="mt-8 rounded-full px-5 py-2.5 text-[14px]" style={{ background: portal.rose, color: "#fff" }}>Back to your portal</button>
        </div>
      </PortalShell>
    );
  }

  const q = questions[i];
  const answered = a.answers[i];
  const isLast = i === total - 1;
  const canGo = answered !== undefined;
  const progress = ((i + (canGo ? 1 : 0)) / total) * 100;

  return (
    <PortalShell>
      <div className="mx-auto max-w-lg">
        <div className="mb-8 h-1 rounded-full" style={{ background: portal.soft }}>
          <div className="h-1 rounded-full transition-all" style={{ width: `${progress}%`, background: portal.rose }} />
        </div>
        <p className="text-[13px]" style={{ color: portal.muted }}>Question {i + 1} of {total}</p>
        <p className="mt-1 text-[13px]" style={{ color: portal.muted }}>Over the last 2 weeks, how often have you been bothered by:</p>
        <h2 className="mt-6" style={{ fontFamily: "'Fraunces', serif", fontSize: 26, lineHeight: 1.25, letterSpacing: -0.3 }}>
          {q}
        </h2>
        <div className="mt-8 flex flex-col gap-2">
          {ANSWER_OPTIONS.map(opt => {
            const active = answered === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateAssessmentAnswer(a.id, i, opt.value)}
                className="flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-[15px] transition-colors"
                style={{
                  background: active ? portal.soft : portal.paper,
                  borderColor: active ? portal.rose : portal.border,
                  color: active ? portal.roseDeep : portal.ink,
                }}
              >
                <span>{opt.label}</span>
                {active ? <Check className="h-4 w-4" strokeWidth={2} /> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="inline-flex items-center gap-1 text-[14px] disabled:opacity-30" style={{ color: portal.muted }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {isLast ? (
            <button
              disabled={!canGo}
              onClick={() => { completeAssessment(a.id); }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] disabled:opacity-40"
              style={{ background: portal.rose, color: "#fff" }}
            >
              Finish <Check className="h-4 w-4" />
            </button>
          ) : (
            <button
              disabled={!canGo}
              onClick={() => setI(i + 1)}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] disabled:opacity-40"
              style={{ background: portal.rose, color: "#fff" }}
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-10 text-center text-[12px]" style={{ color: portal.muted }}>
          You can pause anytime. Your answers save as you go.
        </p>
      </div>
    </PortalShell>
  );
}
