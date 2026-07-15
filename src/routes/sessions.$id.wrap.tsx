import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { palette } from "@/components/practice/palette";
import { useLiveSession, completeSession } from "@/lib/sessions-store";
import { getPatient, createNote, avatarUrl } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";
import { SoapDraftInline } from "@/components/practice/copilot/SoapDraftInline";

export const Route = createFileRoute("/sessions/$id/wrap")({
  head: () => ({ meta: [{ title: "Wrap-up — PeaceCode · Practice" }] }),
  component: WrapView,
});

const FEELING_LABELS = ["Calm", "Steady", "Neutral", "Uneasy", "Concerned"] as const;
const FEELING_COLORS = ["#5F8A6A", "#8FAF8F", "#B4A5AB", "#C77A5A", "#B0384A"];

function WrapView() {
  const hydrated = useHydrated();
  const { id } = Route.useParams();
  const session = useLiveSession(id);
  const navigate = useNavigate();

  const [feeling, setFeeling] = useState<number | null>(null);
  const [subjective, setS] = useState("");
  const [objective, setO] = useState("");
  const [assessment, setA] = useState("");
  const [plan, setP] = useState("");
  const [nextStep, setNextStep] = useState<null | "followup" | "homework" | "escalate">(null);
  const [followupDate, setFollowupDate] = useState("");
  const [homework, setHomework] = useState("");
  const [escalateReason, setEscalateReason] = useState("");

  if (!hydrated) return null;
  if (!session) throw notFound();
  const patient = getPatient(session.patientId);
  if (!patient) return <p className="p-8 text-[13px]" style={{ color: palette.muted }}>Patient missing.</p>;

  function complete() {
    if (!session || !patient) return;
    const note = createNote({
      patientId: patient.id,
      sessionDate: new Date(session.startsAt).getTime(),
      duration: session.durationMin,
      modality: session.modality === "in_person" ? "in-person" : session.modality === "phone" ? "audio" : "video",
      subjective, objective, assessment, plan,
      moodBefore: feeling !== null ? Math.max(1, 8 - feeling * 1.5) : undefined,
      moodAfter: feeling !== null ? Math.max(1, 9 - feeling) : undefined,
      riskFlagged: nextStep === "escalate",
      privateToTherapist: false,
    });
    completeSession(session.id, note.id);
    toast.success("Notes saved. Take a breath.", { duration: 3200 });
    navigate({ to: "/sessions" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "radial-gradient(120% 80% at 50% 0%, #F5DDE4 0%, #FBF7F8 60%)" }}>
      <div className="w-full max-w-[720px] rounded-[28px] border p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(28px) saturate(140%)", borderColor: "rgba(255,255,255,0.6)", boxShadow: "0 30px 80px -30px rgba(30,20,24,0.25)" }}>
        <header className="flex items-center gap-3 mb-8">
          <img src={avatarUrl(patient.id)} alt="" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Wrap-up</p>
            <h1 className="text-[22px] tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Session with {patient.preferredName ?? patient.fullName}
            </h1>
          </div>
        </header>

        {/* 1. How did it go */}
        <section>
          <p className="text-[10.5px] tracking-[0.16em] uppercase mb-4" style={{ color: palette.muted }}>How did it go?</p>
          <FeelingArcs value={feeling} onChange={setFeeling} />
        </section>

        {/* 2. SOAP */}
        <section className="mt-10 grid sm:grid-cols-2 gap-5">
          {[
            { label: "Subjective", val: subjective, set: setS, ph: "What the client shared…" },
            { label: "Objective",  val: objective,  set: setO, ph: "What you observed…" },
            { label: "Assessment", val: assessment, set: setA, ph: "Your clinical impression…" },
            { label: "Plan",       val: plan,       set: setP, ph: "Next steps, homework…" },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <p className="text-[10.5px] tracking-[0.14em] uppercase mb-1.5" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{label}</p>
              <textarea
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
                rows={3}
                className="w-full bg-transparent outline-none text-[13px] resize-none border-b py-1 focus:border-b-2 transition-all placeholder:opacity-50"
                style={{ color: palette.ink, borderColor: palette.border }}
              />
            </div>
          ))}
        </section>

        {/* 3. Next step */}
        <section className="mt-10">
          <p className="text-[10.5px] tracking-[0.16em] uppercase mb-3" style={{ color: palette.muted }}>Next step</p>
          <div className="flex flex-wrap gap-2">
            {([
              ["followup", "Schedule follow-up"],
              ["homework", "Assign homework"],
              ["escalate", "Escalate"],
            ] as const).map(([k, label]) => {
              const active = nextStep === k;
              return (
                <button key={k} onClick={() => setNextStep(active ? null : k)}
                  className="text-[12px] px-3.5 py-1.5 rounded-full border transition-colors duration-150"
                  style={{ background: active ? palette.ink : "rgba(255,255,255,0.6)", color: active ? "#fff" : palette.ink, borderColor: active ? palette.ink : palette.border }}>
                  {label}
                </button>
              );
            })}
          </div>

          {nextStep === "followup" && (
            <div className="mt-4 animate-in fade-in duration-200">
              <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Follow-up date</label>
              <input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none"
                style={{ borderColor: palette.border, color: palette.ink }} />
            </div>
          )}
          {nextStep === "homework" && (
            <div className="mt-4 animate-in fade-in duration-200">
              <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Homework</label>
              <input value={homework} onChange={(e) => setHomework(e.target.value)} placeholder="e.g. 10 min breathing daily, thought record"
                className="mt-1 w-full h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none"
                style={{ borderColor: palette.border, color: palette.ink }} />
            </div>
          )}
          {nextStep === "escalate" && (
            <div className="mt-4 animate-in fade-in duration-200">
              <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: "#B0384A" }}>Reason for escalation</label>
              <input value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)} placeholder="SI ideation, risk to self, etc."
                className="mt-1 w-full h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none"
                style={{ borderColor: "#F3C7C7", color: palette.ink, background: "rgba(253,236,236,0.35)" }} />
            </div>
          )}
        </section>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-between">
          <button onClick={() => navigate({ to: "/sessions" })} className="text-[12px]" style={{ color: palette.muted }}>Skip for now</button>
          <button onClick={complete} className="h-11 px-6 rounded-full text-[13px] transition-transform hover:scale-[1.01]"
            style={{ background: `linear-gradient(135deg, ${palette.primary}, #C9709A)`, color: "#fff", fontFamily: "'Fraunces', serif" }}>
            Complete &amp; close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Concentric-arc feeling scale ─────────────────────────
function FeelingArcs({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex items-end justify-center gap-6 sm:gap-10">
      {FEELING_LABELS.map((label, i) => {
        const isSel = value === i;
        const size = 44 + i * 8; // widen from Calm → Concerned
        const stroke = 6;
        const r = size / 2 - stroke;
        const cx = size / 2, cy = size / 2;
        const startAng = Math.PI * 0.85;
        const endAng = Math.PI * 2.15;
        const x1 = cx + r * Math.cos(startAng);
        const y1 = cy + r * Math.sin(startAng);
        const x2 = cx + r * Math.cos(endAng);
        const y2 = cy + r * Math.sin(endAng);
        return (
          <button key={label} onClick={() => onChange(i)} className="flex flex-col items-center gap-2 group focus:outline-none">
            <svg width={size} height={size} className="transition-transform duration-200" style={{ transform: isSel ? "scale(1.06)" : "scale(1)" }}>
              <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`} stroke="#EADFE2" strokeWidth={stroke} strokeLinecap="round" fill="none" />
              <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`} stroke={FEELING_COLORS[i]} strokeWidth={stroke} strokeLinecap="round" fill="none"
                strokeDasharray={isSel ? "999" : "1 999"} style={{ transition: "stroke-dasharray 220ms ease-out" }} />
            </svg>
            <span className="text-[10.5px] tracking-[0.12em] uppercase" style={{ color: isSel ? palette.ink : palette.muted, fontFamily: "'Fraunces', serif" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
