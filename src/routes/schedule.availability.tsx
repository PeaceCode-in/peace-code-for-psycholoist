import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveWindows, upsertWindow, deleteWindow, useCalendarSettings, updateSettings,
  fmtMin, parseHM, type AvailabilityWindow, type DayOfWeek,
} from "@/lib/calendar-store";
import type { SessionService } from "@/lib/sessions-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/schedule/availability")({
  head: () => ({ meta: [{ title: "Availability — Schedule" }] }),
  component: AvailabilityPage,
});

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ALL_SERVICES: SessionService[] = ["Intake", "Individual Therapy", "Couples", "Follow-up", "Assessment"];

function AvailabilityPage() {
  const hydrated = useHydrated();
  const windows = useLiveWindows();
  const settings = useCalendarSettings();

  if (!hydrated) return null;

  const grouped: Record<number, AvailabilityWindow[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  windows.forEach((w) => grouped[w.dayOfWeek].push(w));

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pb-24">
      <div className="mb-6">
        <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Working hours</h2>
        <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
          When you're generally available. Booking link and free-slot suggestions honor these windows.
        </p>
      </div>

      <div className="rounded-2xl border p-4 mb-6" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        <div className="grid grid-cols-3 gap-4">
          <NumField label="Default buffer between sessions" value={settings.defaultBufferMin} onChange={(v) => updateSettings({ defaultBufferMin: v })} suffix="min" />
          <NumField label="Working start" value={Math.floor(settings.workingHours.startMin / 60)} onChange={(v) => updateSettings({ workingHours: { ...settings.workingHours, startMin: v * 60 } })} suffix="h" />
          <NumField label="Working end" value={Math.floor(settings.workingHours.endMin / 60)} onChange={(v) => updateSettings({ workingHours: { ...settings.workingHours, endMin: v * 60 } })} suffix="h" />
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        {DAY_NAMES.map((name, d) => (
          <div key={d} className="grid gap-3 p-4 border-t first:border-t-0" style={{ borderColor: palette.border, gridTemplateColumns: "80px 1fr auto" }}>
            <div className="text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{name}</div>
            <div className="space-y-2">
              {grouped[d].length === 0 && <div className="text-[11.5px]" style={{ color: palette.muted }}>Unavailable</div>}
              {grouped[d].map((w) => <WindowRow key={w.id} w={w} />)}
            </div>
            <button
              onClick={() => upsertWindow({
                dayOfWeek: d as DayOfWeek, startMin: 9 * 60, endMin: 17 * 60,
                sessionTypes: ALL_SERVICES, location: "either", effectiveFrom: new Date().toISOString(),
              })}
              className="h-8 w-8 grid place-items-center rounded-full border self-start" style={{ borderColor: palette.border, color: palette.muted }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <p className="text-[11px] mt-4" style={{ color: palette.muted }}>
        Timezone: {settings.timezone}. Change in Settings → Calendar.
      </p>
    </div>
  );
}

function WindowRow({ w }: { w: AvailabilityWindow }) {
  const [start, setStart] = useState(fmtMin(w.startMin));
  const [end, setEnd] = useState(fmtMin(w.endMin));
  const save = () => upsertWindow({ ...w, startMin: parseHM(start), endMin: parseHM(end) });
  return (
    <div className="flex items-center gap-2">
      <input type="time" step={900} value={start} onBlur={save} onChange={(e) => setStart(e.target.value)}
        className="px-2 py-1 rounded border bg-white text-[12px] tabular-nums" style={{ borderColor: palette.border }} />
      <span className="text-[11px]" style={{ color: palette.muted }}>to</span>
      <input type="time" step={900} value={end} onBlur={save} onChange={(e) => setEnd(e.target.value)}
        className="px-2 py-1 rounded border bg-white text-[12px] tabular-nums" style={{ borderColor: palette.border }} />
      <span className="text-[10.5px] ml-2 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.04)", color: palette.muted }}>
        {w.location === "either" ? "Any" : w.location === "telehealth" ? "Video" : "In-person"}
      </span>
      <button onClick={() => deleteWindow(w.id)} className="ml-auto h-7 w-7 grid place-items-center rounded-full text-[color:var(--danger)] hover:bg-black/5" style={{ color: palette.muted }}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function NumField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="block text-[10.5px] tracking-[0.14em] uppercase mb-1" style={{ color: palette.muted }}>{label}</span>
      <div className="flex items-center gap-2">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-20 px-2 py-1.5 rounded border bg-white text-[13px] tabular-nums" style={{ borderColor: palette.border }} />
        {suffix && <span className="text-[11px]" style={{ color: palette.muted }}>{suffix}</span>}
      </div>
    </label>
  );
}
