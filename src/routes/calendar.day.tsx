import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { CalendarShell, HatchDefs } from "@/components/practice/calendar/CalendarShell";
import { useLiveSessions, MODALITY_META } from "@/lib/sessions-store";
import { getPatient } from "@/lib/patients-store";
import { useLiveWindows, useLiveBlackouts, useCalendarSettings, SESSION_TYPE_COLOR, addDays, sameDay } from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/calendar/day")({
  head: () => ({ meta: [{ title: "Day — Calendar · PeaceCode" }] }),
  component: DayView,
});

const HOUR_PX = 64;

function DayView() {
  const hydrated = useHydrated();
  const [day, setDay] = useState(() => new Date());
  const settings = useCalendarSettings();
  const sessions = useLiveSessions();
  const windows = useLiveWindows();
  const blackouts = useLiveBlackouts();
  const nav = useNavigate();

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName?.match(/INPUT|TEXTAREA/)) return;
      if (e.key === "ArrowLeft") setDay((d) => addDays(d, -1));
      else if (e.key === "ArrowRight") setDay((d) => addDays(d, 1));
      else if (e.key === "1") nav({ to: "/calendar" });
    };
    window.addEventListener("keydown", on); return () => window.removeEventListener("keydown", on);
  }, [nav]);

  const startHour = Math.floor(settings.workingHours.startMin / 60);
  const endHour = Math.ceil(settings.workingHours.endMin / 60);
  const hours = useMemo(() => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i), [startHour, endHour]);

  if (!hydrated) return <CalendarShell><div style={{ color: palette.muted }}>Loading…</div></CalendarShell>;

  const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
  const daySessions = sessions.filter((s) => new Date(s.startsAt) >= dayStart && new Date(s.startsAt) < dayEnd && s.status !== "cancelled");
  const dayWindows = windows.filter((w) => w.dayOfWeek === day.getDay());
  const dayBlackouts = blackouts.filter((b) => new Date(b.endAt) > dayStart && new Date(b.startAt) < dayEnd);
  const bookedMin = daySessions.reduce((a, s) => a + s.durationMin, 0);
  const openMin = dayWindows.reduce((a, w) => a + (w.endMin - w.startMin), 0);

  return (
    <CalendarShell
      title={day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      subtitle="Denser single-column view — every 15 minutes visible."
      actions={
        <div className="inline-flex items-center gap-1">
          <button onClick={() => setDay((d) => addDays(d, -1))} className="h-8 w-8 grid place-items-center rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setDay(new Date())} className="h-8 px-3 rounded-full border text-[11.5px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }}>Today</button>
          <button onClick={() => setDay((d) => addDays(d, 1))} className="h-8 w-8 grid place-items-center rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}><ChevronRight className="h-4 w-4" /></button>
        </div>
      }
    >
      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 280px" }}>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glass }}>
          <div className="grid" style={{ gridTemplateColumns: "56px minmax(0,1fr)" }}>
            <div>
              {hours.map((h) => (
                <div key={h} className="text-right pr-2 pt-1" style={{ height: HOUR_PX, borderTop: h === startHour ? "none" : `1px solid ${palette.border}` }}>
                  <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{String(h).padStart(2,"0")}:00</span>
                </div>
              ))}
            </div>
            <div className="relative" style={{ borderLeft: `1px solid ${palette.border}`, height: hours.length * HOUR_PX }}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <HatchDefs id="day-hatch" />
                {hours.map((h, i) => <line key={h} x1="0" x2="100%" y1={i * HOUR_PX} y2={i * HOUR_PX} stroke={palette.border} strokeWidth="1" opacity={i === 0 ? 0 : 1} />)}
                {hours.map((h, i) => [
                  <line key={`q1-${h}`} x1="0" x2="100%" y1={i * HOUR_PX + HOUR_PX / 4} y2={i * HOUR_PX + HOUR_PX / 4} stroke={palette.border} strokeWidth="1" opacity="0.2" />,
                  <line key={`q2-${h}`} x1="0" x2="100%" y1={i * HOUR_PX + HOUR_PX / 2} y2={i * HOUR_PX + HOUR_PX / 2} stroke={palette.border} strokeWidth="1" opacity="0.4" />,
                  <line key={`q3-${h}`} x1="0" x2="100%" y1={i * HOUR_PX + (3 * HOUR_PX) / 4} y2={i * HOUR_PX + (3 * HOUR_PX) / 4} stroke={palette.border} strokeWidth="1" opacity="0.2" />,
                ])}
                {dayWindows.map((w) => {
                  const top = ((w.startMin - startHour * 60) / 60) * HOUR_PX;
                  const h = ((w.endMin - w.startMin) / 60) * HOUR_PX;
                  return <rect key={w.id} x="0" y={Math.max(0, top)} width="100%" height={h} fill="url(#day-hatch)" opacity="0.55" />;
                })}
              </svg>
              {daySessions.map((s) => {
                const t = new Date(s.startsAt);
                const top = ((t.getHours() * 60 + t.getMinutes() - startHour * 60) / 60) * HOUR_PX;
                const h = (s.durationMin / 60) * HOUR_PX;
                const c = SESSION_TYPE_COLOR[s.service].hex;
                const p = getPatient(s.patientId);
                return (
                  <div key={s.id} className="absolute left-2 right-2 rounded-[10px] px-3 py-2 overflow-hidden transition-all duration-[180ms] hover:brightness-95"
                    style={{ top, height: h, background: `${c}1F`, borderLeft: `2px solid ${c}` }}>
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-[11px] tabular-nums shrink-0" style={{ color: c, fontFamily: "'DM Mono', monospace" }}>{t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                      <span className="text-[10px] shrink-0" style={{ color: `${c}CC`, fontFamily: "'DM Mono', monospace" }}>{s.durationMin}m</span>
                    </div>
                    <div className="text-[14px] leading-tight truncate mt-0.5" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{p?.preferredName ?? p?.fullName ?? "Client"}</div>
                    {h >= 62 && <div className="text-[11px] truncate mt-0.5" style={{ color: palette.muted }}>{s.service} · {MODALITY_META[s.modality].label}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass }}>
            <div className="text-[11px] uppercase tracking-wider mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Today at a glance</div>
            <dl className="space-y-2 text-[13px]" style={{ color: palette.ink }}>
              <div className="flex justify-between"><dt style={{ color: palette.muted }}>Sessions</dt><dd style={{ fontFamily: "'DM Mono', monospace" }}>{daySessions.length}</dd></div>
              <div className="flex justify-between"><dt style={{ color: palette.muted }}>Booked</dt><dd style={{ fontFamily: "'DM Mono', monospace" }}>{Math.floor(bookedMin/60)}h {bookedMin%60}m</dd></div>
              <div className="flex justify-between"><dt style={{ color: palette.muted }}>Open window</dt><dd style={{ fontFamily: "'DM Mono', monospace" }}>{Math.floor(openMin/60)}h {openMin%60}m</dd></div>
              <div className="flex justify-between"><dt style={{ color: palette.muted }}>First / Last</dt>
                <dd style={{ fontFamily: "'DM Mono', monospace" }}>
                  {daySessions.length ? new Date(daySessions[0].startsAt).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}) : "—"} / {daySessions.length ? new Date(daySessions[daySessions.length-1].startsAt).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass }}>
            <div className="text-[11px] uppercase tracking-wider mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Prep queue</div>
            <div className="space-y-2">
              {daySessions.slice(0, 3).map((s) => {
                const p = getPatient(s.patientId);
                return (
                  <a key={s.id} href={`/sessions/${s.id}`} className="block rounded-lg px-3 py-2 border text-[12px] transition-all duration-[180ms] hover:bg-white" style={{ borderColor: palette.border, color: palette.ink }}>
                    <div className="flex justify-between">
                      <span style={{ fontFamily: "'Fraunces', serif" }}>{p?.preferredName ?? p?.fullName}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", color: palette.muted }}>{new Date(s.startsAt).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                    <div className="text-[11px]" style={{ color: palette.muted }}>Open prep →</div>
                  </a>
                );
              })}
              {!daySessions.length && <div className="text-[12px]" style={{ color: palette.muted }}>Nothing on deck.</div>}
            </div>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass }}>
            <div className="text-[11px] uppercase tracking-wider mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Availability</div>
            <div className="text-[12px]" style={{ color: palette.ink }}>
              {dayWindows.length ? dayWindows.map((w) => `${String(Math.floor(w.startMin/60)).padStart(2,"0")}:${String(w.startMin%60).padStart(2,"0")}–${String(Math.floor(w.endMin/60)).padStart(2,"0")}:${String(w.endMin%60).padStart(2,"0")}`).join(" · ") : "No windows"}
            </div>
            <div className="text-[11px] mt-1" style={{ color: palette.muted }}>{dayBlackouts.length} blackout{dayBlackouts.length === 1 ? "" : "s"}</div>
          </div>
        </aside>
      </div>
    </CalendarShell>
  );
}
