import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { palette } from "@/components/practice/palette";
import { Card, SectionLabel, Pill, fmtDate } from "@/components/practice/patients/primitives";
import { MoodTimeline, SessionFrequencyStrip, TagCloud } from "@/components/practice/patients/Charts";
import { useLivePatient, useLiveNotes, getMoodSeries } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

type Range = 30 | 90 | 180 | 3650;
const RANGES: Array<{ v: Range; label: string }> = [
  { v: 30, label: "30d" }, { v: 90, label: "90d" }, { v: 180, label: "6m" }, { v: 3650, label: "All" },
];

export const Route = createFileRoute("/patients/$pid/chart")({
  head: () => ({ meta: [{ title: "Chart — Patient" }, { name: "robots", content: "noindex" }] }),
  component: ChartTab,
});

function ChartTab() {
  const { pid } = Route.useParams();
  const hydrated = useHydrated();
  const patient = useLivePatient(pid);
  const notes = useLiveNotes(pid);
  const [range, setRange] = useState<Range>(90);

  const mood = hydrated ? getMoodSeries(pid, range) : [];
  const themeTags = useMemo(() => {
    if (!patient) return [];
    const tokens: string[] = [...patient.tags];
    notes.forEach((n) => {
      n.assessment.split(/[,\.]/).forEach((chunk) => {
        const t = chunk.trim().toLowerCase();
        if (t.length > 4 && t.length < 24 && !t.includes(" ")) tokens.push(t);
      });
    });
    return tokens;
  }, [patient, notes]);

  if (!patient) return null;

  // Progress summary
  const lifts = notes.filter((n) => typeof n.moodBefore === "number" && typeof n.moodAfter === "number").map((n) => n.moodAfter! - n.moodBefore!);
  const avgLift = lifts.length ? Math.round((lifts.reduce((a, b) => a + b, 0) / lifts.length) * 10) / 10 : 0;
  const firstNoteDate = notes[notes.length - 1]?.sessionDate;

  return (
    <div className="flex flex-col gap-5 pc-fade-in">
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <SectionLabel>Mood over time</SectionLabel>
            <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Before / after each session · 1–10 scale
            </p>
          </div>
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <Pill key={r.v} active={range === r.v} onClick={() => setRange(r.v)}>{r.label}</Pill>
            ))}
          </div>
        </div>
        <div className="mt-5"><MoodTimeline series={mood} days={range} /></div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2">
          <SectionLabel>Session frequency</SectionLabel>
          <p className="text-[12px]" style={{ color: palette.muted }}>Sessions per week over the last {Math.round(range / 7)} weeks.</p>
          <div className="mt-3"><SessionFrequencyStrip series={mood} days={range} /></div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Progress summary</SectionLabel>
          <p className="text-[13.5px] leading-relaxed mt-2" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
            {patient.totalSessions} sessions {firstNoteDate ? `since ${fmtDate(firstNoteDate, { month: "short", year: "numeric" })}` : "on file"}.
          </p>
          <p className="text-[12.5px] leading-relaxed mt-2" style={{ color: palette.muted }}>
            Average mood lift per session: <span style={{ color: palette.ink }}>{avgLift >= 0 ? "+" : ""}{avgLift}</span>.
            Currently {patient.risk === "stable" ? "stable" : `monitoring for ${patient.tags[0] ?? "presenting concerns"}`}.
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <SectionLabel>Assessment scores</SectionLabel>
        <p className="text-[11px] italic mb-3" style={{ color: palette.muted }}>{/* TODO: real assessments module ships in Prompt #4 */}Sample scores — the Assessments module wires in real data next.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "PHQ-9", score: 14, band: "Moderate", takenAt: Date.now() - 12 * 86_400_000 },
            { name: "GAD-7", score: 11, band: "Moderate", takenAt: Date.now() - 12 * 86_400_000 },
            { name: "PSS-10", score: 22, band: "High", takenAt: Date.now() - 30 * 86_400_000 },
          ].map((s) => (
            <div key={s.name} className="p-4 rounded-xl" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: palette.muted }}>{s.name}</span>
                <span className="text-[10.5px]" style={{ color: palette.muted }}>{fmtDate(s.takenAt)}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[2rem] leading-none tabular-nums" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{s.score}</span>
                <span className="text-[11px]" style={{ color: palette.muted }}>{s.band}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>Concerns &amp; themes</SectionLabel>
        <div className="mt-3"><TagCloud tags={themeTags} /></div>
      </Card>
    </div>
  );
}
