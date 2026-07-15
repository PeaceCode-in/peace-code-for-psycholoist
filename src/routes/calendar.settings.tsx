import { createFileRoute } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { CalendarShell } from "@/components/practice/calendar/CalendarShell";
import { useCalendarSettings, updateSettings, fmtMin, parseHM } from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/calendar/settings")({
  head: () => ({ meta: [{ title: "Calendar settings — PeaceCode · Practice" }] }),
  component: CalendarSettingsPage,
});

const TZS = ["Asia/Kolkata","Asia/Dubai","Asia/Singapore","Europe/London","Europe/Berlin","America/New_York","America/Los_Angeles","Australia/Sydney"];

function CalendarSettingsPage() {
  const hydrated = useHydrated();
  const s = useCalendarSettings();
  if (!hydrated) return <CalendarShell><div style={{ color: palette.muted }}>Loading…</div></CalendarShell>;

  return (
    <CalendarShell title="Calendar settings" subtitle="Set the rhythm — buffers, hours, and how time is coloured.">
      <div className="max-w-2xl space-y-4">
        <Card>
          <Row label="Timezone">
            <select value={s.timezone} onChange={(e) => updateSettings({ timezone: e.target.value })}
              className="text-[13px] rounded-md border px-3 py-1.5" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }}>
              {TZS.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Row>
          <Row label="Week starts on">
            <div className="inline-flex rounded-full border p-0.5" style={{ borderColor: palette.border }}>
              {(["Sunday","Monday"] as const).map((l, i) => {
                const on = s.weekStartsOn === i;
                return (
                  <button key={l} onClick={() => updateSettings({ weekStartsOn: i as 0 | 1 })}
                    className="text-[12px] px-3 py-1 rounded-full transition-all duration-[180ms]"
                    style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted }}>{l}</button>
                );
              })}
            </div>
          </Row>
          <Row label="Working hours">
            <div className="flex items-center gap-2">
              <input type="time" value={fmtMin(s.workingHours.startMin)} onChange={(e) => updateSettings({ workingHours: { ...s.workingHours, startMin: parseHM(e.target.value) } })}
                className="text-[13px] rounded-md border px-2 py-1.5" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }} />
              <span style={{ color: palette.muted }}>→</span>
              <input type="time" value={fmtMin(s.workingHours.endMin)} onChange={(e) => updateSettings({ workingHours: { ...s.workingHours, endMin: parseHM(e.target.value) } })}
                className="text-[13px] rounded-md border px-2 py-1.5" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }} />
            </div>
          </Row>
          <Row label="Default buffer (min)">
            <input type="number" step={5} min={0} max={60} value={s.defaultBufferMin}
              onChange={(e) => updateSettings({ defaultBufferMin: Math.max(0, Math.min(60, Number(e.target.value))) })}
              className="w-24 text-[13px] rounded-md border px-2 py-1.5" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }} />
          </Row>
          <Row label="Color scheme">
            <div className="inline-flex rounded-full border p-0.5" style={{ borderColor: palette.border }}>
              {(["type","status","risk"] as const).map((c) => {
                const on = s.colorScheme === c;
                return (
                  <button key={c} onClick={() => updateSettings({ colorScheme: c })}
                    className="text-[12px] px-3 py-1 rounded-full transition-all duration-[180ms]"
                    style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted }}>By {c}</button>
                );
              })}
            </div>
          </Row>
          <Row label="Hide weekends in week view">
            <input type="checkbox" checked={s.hideWeekends} onChange={(e) => updateSettings({ hideWeekends: e.target.checked })} />
          </Row>
        </Card>
      </div>
    </CalendarShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border divide-y" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.55)" }}>{children}</div>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5" style={{ borderColor: palette.border }}>
      <span className="text-[12.5px]" style={{ color: palette.ink }}>{label}</span>
      <span className="flex items-center">{children}</span>
    </div>
  );
}
