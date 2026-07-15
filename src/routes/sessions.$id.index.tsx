import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { CalendarClock, Clock, Wallet, Paperclip, ArrowLeft, Video, Users as UsersIcon, Phone, CheckSquare, Square } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveSession, MODALITY_META, updateSession } from "@/lib/sessions-store";
import { getPatient, useLiveNotes, avatarUrl } from "@/lib/patients-store";
import { useLivePatientTrajectory } from "@/lib/assessments-store";
import { ContinuityTimeline } from "@/components/viz/ContinuityTimeline";
import { MoodDeltaChart, type MoodPoint } from "@/components/viz/MoodDeltaChart";
import { RiskRadial } from "@/components/viz/RiskRadial";
import { useHydrated } from "@/lib/use-hydrated";
import { ContinuityBriefCard } from "@/components/practice/copilot/ContinuityBriefCard";

export const Route = createFileRoute("/sessions/$id/")({
  head: () => ({ meta: [{ title: "Session prep — PeaceCode · Practice" }] }),
  component: PrepSheet,
  notFoundComponent: () => <NotFound />,
});

function NotFound() {
  return (
    <div className="p-12 text-center">
      <p className="text-[13px]" style={{ color: palette.muted }}>Session not found.</p>
      <Link to="/sessions" className="inline-block mt-4 text-[12px]" style={{ color: palette.primary }}>← Back to schedule</Link>
    </div>
  );
}

function ModalityIcon({ modality, className }: { modality: "telehealth" | "in_person" | "phone"; className?: string }) {
  const meta = MODALITY_META[modality];
  if (meta.icon === "video") return <Video className={className} strokeWidth={1.5} />;
  if (meta.icon === "phone") return <Phone className={className} strokeWidth={1.5} />;
  return <UsersIcon className={className} strokeWidth={1.5} />;
}

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

function PrepSheet() {
  const hydrated = useHydrated();
  const { id } = Route.useParams();
  const session = useLiveSession(id);
  const navigate = useNavigate();

  const patient = session ? getPatient(session.patientId) : undefined;
  const notes = useLiveNotes(patient?.id ?? "");
  const traj = useLivePatientTrajectory(patient?.id ?? "", "phq9");
  const lastPHQ = traj[traj.length - 1]?.totalScore;
  const prevPHQ = traj[traj.length - 2]?.totalScore;

  // Agenda editor
  const [agenda, setAgenda] = useState<string>((session?.agenda ?? []).join("\n"));
  useEffect(() => { if (session) setAgenda((session.agenda ?? []).join("\n")); }, [session?.id]);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!session) return;
    const t = setTimeout(() => {
      const lines = agenda.split("\n").map((l) => l.trim()).filter(Boolean);
      updateSession(session.id, { agenda: lines });
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agenda]);

  const [homeworkDone, setHomeworkDone] = useState(false);

  // Mood series — derive from patient's notes
  const mood: MoodPoint[] = useMemo(() => {
    const out: MoodPoint[] = [];
    notes.forEach((n) => {
      if (typeof n.moodBefore === "number") out.push({ at: n.sessionDate, value: n.moodBefore });
      if (typeof n.moodAfter === "number") out.push({ at: n.sessionDate + 30 * 60_000, value: n.moodAfter });
    });
    return out;
  }, [notes]);

  const homeworkLine = notes[0]?.plan?.split(/[.·]/).find((s) => /homework|daily|practice|breathing|log|record/i.test(s))?.trim();

  if (!hydrated) return <div className="p-8 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading…</div>;
  if (!session) throw notFound();
  if (!patient) return <div className="p-8 text-[13px]" style={{ color: palette.muted }}>Patient record missing.</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      <Link to="/sessions" className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="w-3 h-3" /> Schedule
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-8">
        {/* LEFT — Prep */}
        <div className="space-y-6">
          {/* Patient header */}
          <header className="flex items-center gap-4">
            <img src={avatarUrl(patient.id)} alt="" className="w-14 h-14 rounded-full ring-1" style={{ boxShadow: "0 0 0 1px rgba(234,223,226,0.9)" }} />
            <div className="min-w-0">
              <h1 className="text-[clamp(1.4rem,2vw,1.75rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
                {patient.fullName}
              </h1>
              <p className="text-[12px] mt-0.5" style={{ color: palette.muted }}>
                {patient.totalSessions + 1}th session · {patient.primaryConcern.split(",")[0].toLowerCase()}
                {typeof lastPHQ === "number" && (
                  <> · last PHQ-9: <span style={{ color: palette.ink }}>{lastPHQ}</span>
                    {typeof prevPHQ === "number" && <> {lastPHQ < prevPHQ ? "↓" : lastPHQ > prevPHQ ? "↑" : "→"} from {prevPHQ}</>}
                  </>
                )}
              </p>
            </div>
          </header>

          {/* Continuity brief — letterpress card from Copilot */}
          <ContinuityBriefCard patientId={patient.id} />

          {/* Continuity card */}
          <Glass>
            <SectionLabel>Continuity — last 3 sessions</SectionLabel>
            <div className="mt-3"><ContinuityTimeline notes={notes} limit={3} /></div>
          </Glass>

          {/* Mood delta */}
          <Glass>
            <SectionLabel>Mood — last 14 days</SectionLabel>
            <div className="mt-2 -mx-2">
              <MoodDeltaChart data={mood} highlightDate={Date.now()} days={14} height={130} />
            </div>
          </Glass>

          {/* Agenda */}
          <Glass>
            <div className="flex items-center justify-between">
              <SectionLabel>Agenda</SectionLabel>
              <span className="text-[10px] tracking-[0.14em] uppercase transition-opacity duration-200" style={{ color: palette.muted, opacity: saved ? 1 : 0 }}>Saved</span>
            </div>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="What matters this session?"
              className="w-full mt-2 min-h-[112px] bg-transparent outline-none text-[13.5px] resize-none placeholder:opacity-50"
              style={{ color: palette.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }}
            />
          </Glass>

          {/* Homework */}
          {homeworkLine && (
            <Glass>
              <SectionLabel>Homework check</SectionLabel>
              <button
                onClick={() => setHomeworkDone((v) => !v)}
                className="mt-3 flex items-start gap-3 text-left w-full group"
              >
                {homeworkDone
                  ? <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: palette.primary }} strokeWidth={1.5} />
                  : <Square className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} style={{ color: palette.muted }} />}
                <span className="text-[13px] leading-snug" style={{ color: palette.ink, textDecoration: homeworkDone ? "line-through" : "none", textDecorationColor: palette.muted }}>
                  Did they complete: {homeworkLine}?
                </span>
              </button>
            </Glass>
          )}
        </div>

        {/* RIGHT — Meta */}
        <div className="space-y-6">
          <Glass>
            <SectionLabel>Session details</SectionLabel>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
              <MetaRow icon={<CalendarClock className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Date" value={fmtDate(session.startsAt)} full />
              <MetaRow icon={<Clock className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Time" value={`${fmtTime(session.startsAt)} · ${session.durationMin}m`} />
              <MetaRow icon={<ModalityIcon modality={session.modality} className="w-3.5 h-3.5" />} label="Modality" value={MODALITY_META[session.modality].label} />
              <MetaRow icon={<span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]" style={{ color: palette.muted }}>·</span>} label="Service" value={session.service} />
              <MetaRow icon={<Wallet className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Fee" value={`₹${session.fee.toLocaleString("en-IN")}`} />
            </dl>
          </Glass>

          <Glass className="flex items-center justify-between">
            <div>
              <SectionLabel>Risk snapshot</SectionLabel>
              <p className="text-[11.5px] mt-2 max-w-[160px]" style={{ color: palette.muted }}>
                Tap to review changes.
              </p>
            </div>
            <RiskRadial value={patient.risk} history={[patient.risk, "monitor", "monitor", "stable"]} size={104} />
          </Glass>

          <Glass>
            <SectionLabel>Attachments</SectionLabel>
            <div
              className="mt-3 border border-dashed rounded-2xl py-6 flex items-center justify-center gap-2 text-[11.5px] transition-colors hover:bg-white/40"
              style={{ borderColor: palette.border, color: palette.muted }}
            >
              <Paperclip className="w-3.5 h-3.5" /> Drop files or click to upload
            </div>
          </Glass>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-4 mt-8 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border p-1.5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.6)", boxShadow: "0 10px 40px -20px rgba(30,20,24,0.3)" }}>
          <button
            onClick={() => toast("Reschedule flow lands in the next pass.")}
            className="h-11 px-5 rounded-full text-[12.5px]"
            style={{ color: palette.ink }}
          >
            Reschedule
          </button>
          <button
            onClick={() => {
              if (session.modality === "telehealth") navigate({ to: "/sessions/$id/room", params: { id: session.id } });
              else { toast("In-person session marked in progress."); updateSession(session.id, { status: "in_progress" }); navigate({ to: "/sessions/$id/wrap", params: { id: session.id } }); }
            }}
            className="h-11 px-6 rounded-full text-[13px] transition-transform hover:scale-[1.01]"
            style={{ background: `linear-gradient(135deg, ${palette.primary}, #C9709A)`, color: "#fff", fontFamily: "'Fraunces', serif" }}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border p-5 ${className}`} style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(24px) saturate(140%)", borderColor: "rgba(255,255,255,0.55)" }}>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>{children}</p>;
}

function MetaRow({ icon, label, value, full }: { icon: React.ReactNode; label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="flex items-center gap-1.5 text-[10.5px] tracking-[0.14em] uppercase mb-1" style={{ color: palette.muted }}>
        {icon} {label}
      </dt>
      <dd className="text-[13px]" style={{ color: palette.ink }}>{value}</dd>
    </div>
  );
}
