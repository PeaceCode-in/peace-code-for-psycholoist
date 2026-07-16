import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { CalendarShell } from "@/components/practice/calendar/CalendarShell";
import { useCalendarSettings, connectGoogle, disconnectGoogle, updateSettings } from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/calendar/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Calendar · PeaceCode" }] }),
  component: Integrations,
});

function Integrations() {
  const hydrated = useHydrated();
  const s = useCalendarSettings();
  const [busy, setBusy] = useState(false);
  const icalUrl = useMemo(() => (typeof window !== "undefined" ? `${window.location.origin}/api/ical/therapist.ics` : `/api/ical/therapist.ics`), []);

  if (!hydrated) return <CalendarShell><div style={{ color: palette.muted }}>Loading…</div></CalendarShell>;

  return (
    <CalendarShell title="Integrations" subtitle="Sync is invisible when it works.">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Google */}
        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glass }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[16px]" style={{ fontFamily: "'Fraunces', serif" }}>Google Calendar</div>
              <div className="text-[11px]" style={{ color: palette.muted }}>Two-way sync with your primary calendar.</div>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full" style={{
              background: s.googleSync.syncing ? "#EFE4F0" : s.googleSync.connected ? "#E1EFE3" : palette.surface2,
              color: s.googleSync.syncing ? "#7A5F8A" : s.googleSync.connected ? "#3E6B4C" : palette.muted,
              fontFamily: "'DM Mono', monospace",
            }}>
              {s.googleSync.syncing ? "connecting…" : s.googleSync.connected ? "connected" : "not connected"}
            </span>
          </div>
          {s.googleSync.connected ? (
            <div className="space-y-3">
              <div className="text-[12.5px]" style={{ color: palette.ink }}>Calendar: <span style={{ fontFamily: "'DM Mono', monospace" }}>{s.googleSync.calendarId}</span></div>
              <label className="flex items-center justify-between text-[12.5px] border rounded-md px-3 py-2" style={{ borderColor: palette.border }}>
                <span>Two-way sync</span>
                <input type="checkbox" checked={s.googleSync.twoWay} onChange={(e) => updateSettings({ googleSync: { ...s.googleSync, twoWay: e.target.checked } })} />
              </label>
              <button onClick={() => { disconnectGoogle(); toast.success("Disconnected"); }} className="text-[12px] px-3 py-1.5 rounded-full border" style={{ borderColor: palette.border }}>Disconnect</button>
            </div>
          ) : (
            <button
              disabled={busy || s.googleSync.syncing}
              onClick={async () => { setBusy(true); await connectGoogle(); setBusy(false); toast.success("Google Calendar connected"); }}
              className="text-[12.5px] px-4 py-2 rounded-full" style={{ background: palette.ink, color: "#fff" }}>
              {s.googleSync.syncing ? "Connecting…" : "Connect Google Calendar"}
            </button>
          )}
        </div>

        {/* iCal */}
        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glass }}>
          <div className="text-[16px] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>iCal feed</div>
          <div className="text-[11px] mb-4" style={{ color: palette.muted }}>Read-only. Subscribe from Apple Calendar or Outlook.</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11.5px] p-2 rounded-md border truncate" style={{ borderColor: palette.border, background: palette.surface2, fontFamily: "'DM Mono', monospace" }}>{icalUrl}</code>
            <button onClick={async () => { await navigator.clipboard.writeText(icalUrl); toast.success("Copied"); }} className="text-[12px] px-3 py-2 rounded-md border" style={{ borderColor: palette.border }}><Copy className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* Video */}
        <div className="rounded-2xl border p-5 md:col-span-2" style={{ borderColor: palette.border, background: palette.glass }}>
          <div className="text-[16px] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Video meeting links</div>
          <div className="text-[11px] mb-4" style={{ color: palette.muted }}>Auto-generate on every telehealth session.</div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-[12.5px]" style={{ color: palette.ink }}>Provider</label>
            <select className="text-[12.5px] rounded-md border px-3 py-1.5" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }} defaultValue="peacecode">
              <option value="peacecode">PeaceCode Video (built-in)</option>
              <option value="zoom">Zoom</option>
              <option value="meet">Google Meet</option>
            </select>
            <label className="flex items-center gap-2 text-[12.5px] ml-auto">
              <input type="checkbox" checked={s.zoomAutoLink} onChange={(e) => updateSettings({ zoomAutoLink: e.target.checked })} />
              Auto-attach on telehealth sessions
            </label>
          </div>
        </div>
      </div>
    </CalendarShell>
  );
}
