import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, Toggle } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const Route = createFileRoute("/settings/availability")({
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Availability" description="When patients can book you, session length, and buffer times." />
        <Section title="Weekly hours">
          {DAYS.map((d) => {
            const window = s.availability.weeklyHours[d];
            const open = !!window;
            return (
              <Row key={d} label={d} action={<Toggle checked={open} onChange={(v) => set((p) => ({ ...p, availability: { ...p.availability, weeklyHours: { ...p.availability.weeklyHours, [d]: v ? ["09:00", "18:00"] : null } } }))} />}>
                {open && window && (
                  <div className="mt-2 flex items-center gap-2 max-w-xs">
                    <TextField type="time" value={window[0]} onChange={(v) => set((p) => ({ ...p, availability: { ...p.availability, weeklyHours: { ...p.availability.weeklyHours, [d]: [v, window[1]] } } }))} />
                    <span className="text-[11px] opacity-50">to</span>
                    <TextField type="time" value={window[1]} onChange={(v) => set((p) => ({ ...p, availability: { ...p.availability, weeklyHours: { ...p.availability.weeklyHours, [d]: [window[0], v] } } }))} />
                  </div>
                )}
              </Row>
            );
          })}
        </Section>
        <Section title="Session defaults">
          <Row label="Default session length (min)"><div className="mt-2 max-w-[120px]"><TextField type="number" value={String(s.availability.sessionMinutes)} onChange={(v) => set((p) => ({ ...p, availability: { ...p.availability, sessionMinutes: Number(v) || 50 } }))} /></div></Row>
          <Row label="Buffer between sessions (min)"><div className="mt-2 max-w-[120px]"><TextField type="number" value={String(s.availability.bufferMinutes)} onChange={(v) => set((p) => ({ ...p, availability: { ...p.availability, bufferMinutes: Number(v) || 0 } }))} /></div></Row>
          <Row label="Auto-accept from waitlist" hint="If a booked slot is cancelled, auto-fill from the waitlist"
               action={<Toggle checked={s.availability.autoAcceptWaitlist} onChange={(v) => set((p) => ({ ...p, availability: { ...p.availability, autoAcceptWaitlist: v } }))} />} />
        </Section>
      </>
    );
  },
});
