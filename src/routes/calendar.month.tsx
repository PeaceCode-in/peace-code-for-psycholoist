import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { CalendarShell } from "@/components/practice/calendar/CalendarShell";
import { useLiveSessions } from "@/lib/sessions-store";
import { getPatient } from "@/lib/patients-store";
import { useCalendarSettings, sameDay, addDays, startOfWeek } from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/calendar/month")({
  head: () => ({ meta: [{ title: "Month — Calendar · PeaceCode" }] }),
  component: MonthView,
});

function MonthView() {
  const hydrated = useHydrated();
  const settings = useCalendarSettings();
  const sessions = useLiveSessions();
  const nav = useNavigate();
  const [anchor, setAnchor] = useState(() => new Date());
  const [hoverDay, setHoverDay] = useState<string | null>(null);

  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(monthStart, settings.weekStartsOn);
  const cells = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)), [gridStart]);

  const now = new Date();

  const byDay = useMemo(() => {
    const map = new Map<string, typeof sessions>();
    for (const s of sessions) {
      if (s.status === "cancelled") continue;
      const k = new Date(s.startsAt).toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return map;
  }, [sessions]);

  const maxCount = Math.max(1, ...Array.from(byDay.values()).map((a) => a.length));
  const weekdayLabels = settings.weekStartsOn === 1 ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  if (!hydrated) return <CalendarShell><div style={{ color: palette.muted }}>Loading…</div></CalendarShell>;

  return (
    <CalendarShell
      title={anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      subtitle="Density heatmap — bar length = sessions booked."
      actions={
        <div className="inline-flex items-center gap-1">
          <button onClick={() => setAnchor((d) => new Date(d.getFullYear(), d.getMonth()-1, 1))} className="h-8 w-8 grid place-items-center rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setAnchor(new Date())} className="h-8 px-3 rounded-full border text-[11.5px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }}>Today</button>
          <button onClick={() => setAnchor((d) => new Date(d.getFullYear(), d.getMonth()+1, 1))} className="h-8 w-8 grid place-items-center rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}><ChevronRight className="h-4 w-4" /></button>
        </div>
      }
    >
      <div className="pc-scroll-x -mx-4 sm:mx-0"><div className="px-4 sm:px-0" style={{ minWidth: 720 }}>
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glass }}>

        <div className="grid grid-cols-7">
          {weekdayLabels.map((l) => (
            <div key={l} className="px-3 py-2 text-[10.5px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace", borderBottom: `1px solid ${palette.border}` }}>{l}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d) => {
            const inMonth = d.getMonth() === anchor.getMonth();
            const isToday = sameDay(d, now);
            const dayS = byDay.get(d.toDateString()) ?? [];
            const density = dayS.length / maxCount;
            const key = d.toISOString();
            return (
              <div
                key={key}
                onClick={() => nav({ to: "/calendar/day" })}
                onMouseEnter={() => setHoverDay(key)}
                onMouseLeave={() => setHoverDay(null)}
                className="relative min-h-[92px] px-2 py-2 cursor-pointer transition-all duration-[180ms] hover:bg-white/70"
                style={{ borderTop: `1px solid ${palette.border}`, borderLeft: `1px solid ${palette.border}`, opacity: inMonth ? 1 : 0.35 }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-grid place-items-center h-6 min-w-[24px] px-1.5 rounded-full text-[12px]"
                    style={{
                      color: isToday ? "#fff" : palette.ink,
                      background: isToday ? palette.primary : "transparent",
                      border: isToday ? "none" : "1px solid transparent",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {d.getDate()}
                  </span>
                  {dayS.length > 0 && <span className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{dayS.length}</span>}
                </div>
                {/* density bar */}
                <div className="mt-2 h-1 rounded-full" style={{ background: palette.surface2 }}>
                  <div className="h-full rounded-full transition-all duration-[180ms]" style={{ width: `${Math.round(density * 100)}%`, background: palette.primary, opacity: 0.7 }} />
                </div>
                {hoverDay === key && dayS.length > 0 && (
                  <div className="absolute top-full left-0 z-30 mt-1 min-w-[220px] rounded-xl border p-2 shadow-lg" style={{ borderColor: palette.border, background: palette.solid }}>
                    {dayS.slice(0, 3).map((s) => {
                      const p = getPatient(s.patientId);
                      return (
                        <div key={s.id} className="text-[11.5px] py-1 flex justify-between">
                          <span style={{ fontFamily: "'Fraunces', serif" }}>{p?.preferredName ?? p?.fullName ?? "Client"}</span>
                          <span style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{new Date(s.startsAt).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                      );
                    })}
                    {dayS.length > 3 && <div className="text-[10.5px] mt-1" style={{ color: palette.muted }}>+{dayS.length - 3} more</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div></div>
    </CalendarShell>

  );
}
