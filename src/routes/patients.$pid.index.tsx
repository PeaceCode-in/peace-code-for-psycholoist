import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, HeartPulse, Users, Shield, StickyNote, ChevronRight, Phone } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { Card, SectionLabel, Button, RiskBadge, fmtDate, fmtDateTime, timeAgo } from "@/components/practice/patients/primitives";
import { MoodSparkline, RiskGauge } from "@/components/practice/patients/Charts";
import { useLivePatient, useLiveNotes, listRiskChanges, getMoodSeries, updatePatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/patients/$pid/")({
  head: () => ({ meta: [{ title: "Overview — Patient chart" }, { name: "robots", content: "noindex" }] }),
  component: OverviewTab,
});

function OverviewTab() {
  const { pid } = Route.useParams();
  const hydrated = useHydrated();
  const patient = useLivePatient(pid);
  const notes = useLiveNotes(pid);
  if (!patient) return null;

  const recentNotes = notes.slice(0, 3);
  const mood = hydrated ? getMoodSeries(pid, 30) : [];
  const riskHistory = hydrated ? listRiskChanges(pid).slice(0, 3) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pc-fade-in">
      {/* Left column */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        <Card className="p-6">
          <SectionLabel>About</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-[12.5px]">
            <Field label="Preferred name" value={patient.preferredName ?? "—"} />
            <Field label="Pronouns" value={patient.pronouns} />
            <Field label="Age" value={String(patient.age)} />
            <Field label="Email" value={patient.email} />
            <Field label="Phone" value={patient.phone ?? "—"} />
            <Field label="College" value={patient.college} />
            <Field label="Year" value={patient.yearOfStudy} />
            <Field label="Intake" value={fmtDate(patient.intakeDate)} />
            <Field label="Sessions" value={String(patient.totalSessions)} />
          </div>
          <div className="mt-5 pt-5" style={{ borderTop: `1px dashed ${palette.border}` }}>
            <SectionLabel>Primary concern</SectionLabel>
            <p className="text-[13.5px] leading-relaxed" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{patient.primaryConcern}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {patient.tags.map((t) => (
                <span key={t} className="text-[10.5px] px-2 py-[3px] rounded-full" style={{ background: palette.surface2, color: palette.muted, border: `1px solid ${palette.border}` }}>#{t}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel><span className="flex items-center gap-1.5"><StickyNote className="w-3.5 h-3.5" />Recent notes</span></SectionLabel>
            <Link to="/patients/$pid/notes" params={{ pid }} className="text-[11.5px] flex items-center gap-1 hover:underline" style={{ color: palette.primary }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <p className="text-[12px] italic" style={{ color: palette.muted }}>No notes yet.</p>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: palette.border }}>
              {recentNotes.map((n) => (
                <Link key={n.id} to="/patients/$pid/notes/$nid" params={{ pid, nid: n.id }} className="py-3 first:pt-0 last:pb-0 flex items-start gap-4 hover:opacity-80 transition-opacity">
                  <div className="text-[10.5px] tabular-nums pt-0.5 shrink-0 w-20" style={{ color: palette.muted }}>{fmtDate(n.sessionDate, { day: "numeric", month: "short" })}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-snug line-clamp-2" style={{ color: palette.ink }}>{n.assessment}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel><span className="flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5" />Mood trend · 30 days</span></SectionLabel>
            <Link to="/patients/$pid/chart" params={{ pid }} className="text-[11.5px] flex items-center gap-1 hover:underline" style={{ color: palette.primary }}>Full chart <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <MoodSparkline series={mood} width={520} height={72} />
        </Card>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-5">
        <Card className="p-5">
          <SectionLabel><span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />Next session</span></SectionLabel>
          {patient.nextSessionAt ? (
            <>
              <p className="text-[15px] mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{fmtDateTime(patient.nextSessionAt)}</p>
              <p className="text-[11.5px] mt-1" style={{ color: palette.muted }}>{timeAgo(patient.nextSessionAt)}</p>
            </>
          ) : (
            <>
              <p className="text-[13px] mt-1" style={{ color: palette.muted }}>Not scheduled</p>
              <Button variant="outline" className="mt-3" onClick={() => alert("Booking arrives with the Sessions module.")}>Schedule</Button>
            </>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Risk snapshot</SectionLabel>
            <RiskGauge risk={patient.risk} />
          </div>
          <div className="mt-3"><RiskBadge level={patient.risk} /></div>
          {riskHistory.length > 0 && (
            <ul className="mt-4 space-y-2 text-[11.5px]" style={{ color: palette.muted }}>
              {riskHistory.map((r) => (
                <li key={r.id} className="flex gap-2">
                  <span className="tabular-nums shrink-0">{fmtDate(r.at, { day: "numeric", month: "short" })}</span>
                  <span>{r.from} → <span style={{ color: palette.ink }}>{r.to}</span>{r.reason && <> · {r.reason}</>}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <SectionLabel><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Emergency contact</span></SectionLabel>
          {patient.emergencyContact ? (
            <div className="mt-2">
              <p className="text-[13px]" style={{ color: palette.ink }}>{patient.emergencyContact.name}</p>
              <p className="text-[11.5px]" style={{ color: palette.muted }}>{patient.emergencyContact.relation} · {patient.emergencyContact.phone}</p>
            </div>
          ) : (
            <p className="text-[12px] italic mt-2" style={{ color: palette.muted }}>Not on file</p>
          )}
        </Card>

        <Card className="p-5">
          <SectionLabel><span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />Consent</span></SectionLabel>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12.5px]" style={{ color: palette.ink }}>Share notes with college counsellor</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: palette.muted }}>Only assessment + plan sections are shared.</p>
            </div>
            <button
              role="switch"
              aria-checked={patient.consentSharing}
              onClick={() => updatePatient(pid, { consentSharing: !patient.consentSharing })}
              className="shrink-0 relative w-10 h-6 rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
              style={{ background: patient.consentSharing ? palette.primary : palette.border }}
            >
              <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-150"
                style={{ transform: patient.consentSharing ? "translateX(16px)" : "none" }} />
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel><span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Care team</span></SectionLabel>
          <ul className="mt-2 text-[12px]" style={{ color: palette.ink }}>
            <li>You · Primary therapist</li>
            {patient.consentSharing && <li className="mt-1" style={{ color: palette.muted }}>College counsellor · view-only</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: palette.muted }}>{label}</div>
      <div className="truncate" style={{ color: palette.ink }}>{value}</div>
    </div>
  );
}
