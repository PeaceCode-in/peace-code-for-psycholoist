import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { CalendarShell, HatchDefs } from "@/components/practice/calendar/CalendarShell";
import {
  useLiveSessions,
  rescheduleSession,
  updateSession,
  MODALITY_META,
  type Session,
} from "@/lib/sessions-store";
import { getPatient } from "@/lib/patients-store";
import {
  useLiveWindows, useLiveBlackouts, useCalendarSettings,
  SESSION_TYPE_COLOR, hasConflict, startOfWeek, addDays, sameDay, fmtMin,
} from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/calendar/")({
  head: () => ({ meta: [
    { title: "Calendar — PeaceCode · Practice" },
    { name: "description", content: "Week view — drag to move sessions, resize to change duration, publish a booking link." },
  ] }),
  component: CalendarWeek,
});

const HOUR_PX = 56; // 60px goal; 56 fits the aesthetic tighter
const SNAP_MIN = 15;

function CalendarWeek() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return <AppShell crumb="Calendar"><div className="max-w-[1400px] mx-auto px-8 pt-6 text-[12px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Loading calendar…</div></AppShell>;
  }
  return <WeekInner />;
}

function WeekInner() {
  const settings = useCalendarSettings();
  const sessions = useLiveSessions();
  const windows = useLiveWindows();
  const blackouts = useLiveBlackouts();
  const nav = useNavigate();

  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const weekStart = useMemo(() => startOfWeek(anchor, settings.weekStartsOn), [anchor, settings.weekStartsOn]);
  const days = useMemo(() => {
    const list: Date[] = [];
    const count = settings.hideWeekends ? 5 : 7;
    for (let i = 0; i < count; i++) list.push(addDays(weekStart, i));
    return list;
  }, [weekStart, settings.hideWeekends]);

  const startHour = Math.floor(settings.workingHours.startMin / 60);
  const endHour = Math.ceil(settings.workingHours.endMin / 60);
  const hours = useMemo(() => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i), [startHour, endHour]);

  // Current time tick
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(t); }, []);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName?.match(/INPUT|TEXTAREA/)) return;
      if (e.key === "ArrowLeft") setAnchor((d) => addDays(d, -7));
      else if (e.key === "ArrowRight") setAnchor((d) => addDays(d, 7));
      else if (e.key === "t") setAnchor(new Date());
      else if (e.key === "2") nav({ to: "/calendar/day" });
      else if (e.key === "3") nav({ to: "/calendar/month" });
      else if (e.key === "4") nav({ to: "/calendar/agenda" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);

  const monthTitle = anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <CalendarShell
      subtitle={`${monthTitle} · Week of ${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
      actions={
        <>
          <div className="inline-flex items-center gap-1">
            <button onClick={() => setAnchor((d) => addDays(d, -7))} className="h-8 w-8 grid place-items-center rounded-full border transition-all duration-[180ms] hover:bg-white" style={{ borderColor: palette.border, color: palette.muted }} aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setAnchor(new Date())} className="h-8 px-3 rounded-full border text-[11.5px]" style={{ borderColor: palette.border, color: palette.ink, fontFamily: "'DM Mono', monospace" }}>Today</button>
            <button onClick={() => setAnchor((d) => addDays(d, 7))} className="h-8 w-8 grid place-items-center rounded-full border transition-all duration-[180ms] hover:bg-white" style={{ borderColor: palette.border, color: palette.muted }} aria-label="Next week"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }} onClick={() => toast.info("Use the Sessions module to create a new session.")}><Plus className="h-3.5 w-3.5" /> New</button>
        </>
      }
    >
      <div className="pc-scroll-x -mx-4 sm:mx-0">
        <div className="px-4 sm:px-0" style={{ minWidth: Math.max(720, 56 + days.length * 120) }}>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glass, backdropFilter: "blur(14px)" }}>
            {/* Day header */}
            <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))`, borderBottom: `1px solid ${palette.border}` }}>
              <div />
              {days.map((d) => {
                const isToday = sameDay(d, now);
                return (
                  <div key={d.toISOString()} className="px-3 py-2.5 text-center" style={{ borderLeft: `1px solid ${palette.border}` }}>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="text-[15px]" style={{ color: isToday ? palette.primary : palette.ink, fontFamily: "'DM Mono', monospace", fontWeight: isToday ? 600 : 400 }}>{d.getDate()}</span>
                      {isToday && <span className="h-1.5 w-1.5 rounded-full" style={{ background: palette.primary }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid body */}
            <div className="grid relative" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}>
              {/* Hour labels column */}
              <div>
                {hours.map((h) => (
                  <div key={h} className="text-right pr-2" style={{ height: HOUR_PX, borderTop: h === startHour ? "none" : `1px solid ${palette.border}` }}>
                    <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{String(h).padStart(2, "0")}:00</span>
                  </div>
                ))}
              </div>

              {days.map((d) => (
                <DayColumn
                  key={d.toISOString()}
                  date={d}
                  startHour={startHour}
                  hours={hours}
                  windows={windows}
                  blackouts={blackouts}
                  sessions={sessions}
                  now={now}
                />
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 items-center text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>
        {Object.entries(SESSION_TYPE_COLOR).map(([type, c]) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.hex, opacity: 0.4 }} />
            {type}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 ml-auto">
          <svg width="14" height="14"><HatchDefs id="legend-hatch" /><rect width="14" height="14" fill="url(#legend-hatch)" opacity="0.5" /></svg>
          Availability
        </span>
      </div>

      <div className="mt-3 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>
        ← → week · t today · 1/2/3/4 views · drag to move · drag bottom edge to resize
      </div>
    </CalendarShell>
  );
}

function DayColumn({ date, startHour, hours, windows, blackouts, sessions, now }: {
  date: Date; startHour: number; hours: number[];
  windows: ReturnType<typeof useLiveWindows>; blackouts: ReturnType<typeof useLiveBlackouts>;
  sessions: Session[]; now: Date;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const totalMin = hours.length * 60 - 60;
  const totalPx = (hours.length - 1) * HOUR_PX;

  const dayWindows = windows.filter((w) => w.dayOfWeek === date.getDay());
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  const daySessions = sessions.filter((s) => {
    const t = new Date(s.startsAt);
    return t >= dayStart && t < dayEnd && s.status !== "cancelled";
  });

  const dayBlackouts = blackouts.filter((b) => {
    const bs = new Date(b.startAt), be = new Date(b.endAt);
    return be > dayStart && bs < dayEnd;
  });

  const isToday = sameDay(date, now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMin - startHour * 60) / 60) * HOUR_PX;
  const showNow = isToday && nowMin >= startHour * 60 && nowMin <= startHour * 60 + totalMin;

  const [pulseId, setPulseId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ id: string; top: number; height: number } | null>(null);

  // Drag & drop
  const onDragStart = useCallback((e: React.PointerEvent, s: Session, mode: "move" | "resize") => {
    e.preventDefault();
    const startY = e.clientY;
    const originalTop = ((new Date(s.startsAt).getHours() * 60 + new Date(s.startsAt).getMinutes() - startHour * 60) / 60) * HOUR_PX;
    const originalHeight = (s.durationMin / 60) * HOUR_PX;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      if (mode === "move") {
        const snapDy = Math.round(dy / (HOUR_PX / 4)) * (HOUR_PX / 4);
        setGhost({ id: s.id, top: Math.max(0, originalTop + snapDy), height: originalHeight });
      } else {
        const snapDy = Math.round(dy / (HOUR_PX / 4)) * (HOUR_PX / 4);
        setGhost({ id: s.id, top: originalTop, height: Math.max(HOUR_PX / 4, originalHeight + snapDy) });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setGhost((g) => {
        if (!g) return null;
        const newMinOffset = (g.top / HOUR_PX) * 60 + startHour * 60;
        const newMin = Math.round(newMinOffset / SNAP_MIN) * SNAP_MIN;
        const nd = new Date(date); nd.setHours(0, 0, 0, 0); nd.setMinutes(newMin);
        const newDuration = Math.max(SNAP_MIN, Math.round(((g.height / HOUR_PX) * 60) / SNAP_MIN) * SNAP_MIN);

        if (mode === "move") {
          const conflict = hasConflict({ id: s.id, startsAt: nd.toISOString(), durationMin: s.durationMin });
          if (conflict) {
            setPulseId(s.id);
            setTimeout(() => setPulseId(null), 500);
            toast.error("Slot conflicts with another session or blackout.");
          } else if (nd.toISOString() !== s.startsAt) {
            rescheduleSession(s.id, nd.toISOString());
            toast.success(`Moved to ${nd.toLocaleDateString(undefined, { weekday: "short" })} ${nd.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`);
          }
        } else {
          const conflict = hasConflict({ id: s.id, startsAt: s.startsAt, durationMin: newDuration });
          if (conflict) {
            setPulseId(s.id);
            setTimeout(() => setPulseId(null), 500);
            toast.error("New duration overlaps another session.");
          } else if (newDuration !== s.durationMin) {
            updateSession(s.id, { durationMin: newDuration });
            toast.success(`Resized to ${newDuration} min`);
          }
        }
        return null;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, [date, startHour]);

  return (
    <div ref={ref} className="relative" style={{ borderLeft: `1px solid ${palette.border}`, height: totalPx + HOUR_PX }}>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ height: totalPx + HOUR_PX }}>
        <HatchDefs id={`hatch-${date.toISOString().slice(0,10)}`} />
        {hours.map((h, i) => (
          <line key={h} x1="0" x2="100%" y1={i * HOUR_PX} y2={i * HOUR_PX} stroke={palette.border} strokeWidth="1" opacity={i === 0 ? 0 : 1} />
        ))}
        {hours.map((h, i) => (
          <line key={`half-${h}`} x1="0" x2="100%" y1={i * HOUR_PX + HOUR_PX / 2} y2={i * HOUR_PX + HOUR_PX / 2} stroke={palette.border} strokeWidth="1" opacity="0.4" />
        ))}
        {/* Availability windows hatch */}
        {dayWindows.map((w) => {
          const top = ((w.startMin - startHour * 60) / 60) * HOUR_PX;
          const h = ((w.endMin - w.startMin) / 60) * HOUR_PX;
          if (h <= 0) return null;
          return <rect key={w.id} x="0" y={Math.max(0, top)} width="100%" height={h} fill={`url(#hatch-${date.toISOString().slice(0,10)})`} opacity="0.6" />;
        })}
        {/* Blackouts */}
        {dayBlackouts.map((b) => {
          const bs = new Date(b.startAt); const be = new Date(b.endAt);
          const clippedStart = bs < dayStart ? dayStart : bs;
          const clippedEnd = be > dayEnd ? dayEnd : be;
          const top = ((clippedStart.getHours() * 60 + clippedStart.getMinutes() - startHour * 60) / 60) * HOUR_PX;
          const h = ((clippedEnd.getTime() - clippedStart.getTime()) / 3_600_000) * HOUR_PX;
          return (
            <g key={b.id}>
              <rect x="4" y={top} width="calc(100% - 8px)" height={h} fill={palette.surface2} opacity="0.55" rx="6" />
            </g>
          );
        })}
      </svg>

      {/* Blackout label overlay */}
      {dayBlackouts.map((b) => {
        const bs = new Date(b.startAt);
        const top = ((bs.getHours() * 60 + bs.getMinutes() - startHour * 60) / 60) * HOUR_PX;
        return (
          <div key={`bl-${b.id}`} className="absolute left-2 text-[10px] uppercase tracking-wide pointer-events-none" style={{ top: Math.max(2, top + 4), color: palette.muted, fontFamily: "'DM Mono', monospace" }}>
            {b.reason ?? "Blackout"}
          </div>
        );
      })}

      {/* Sessions */}
      {daySessions.map((s) => {
        const start = new Date(s.startsAt);
        const top = ((start.getHours() * 60 + start.getMinutes() - startHour * 60) / 60) * HOUR_PX;
        const height = (s.durationMin / 60) * HOUR_PX;
        const color = SESSION_TYPE_COLOR[s.service]?.hex ?? palette.primary;
        const patient = getPatient(s.patientId);
        const isPulsing = pulseId === s.id;
        const isDragging = ghost?.id === s.id;
        const renderedHeight = isDragging ? ghost!.height : height;
        const showMeta = renderedHeight >= 58;
        const showName = renderedHeight >= 28;
        const timeStr = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
        return (
          <div
            key={s.id}
            onPointerDown={(e) => onDragStart(e, s, "move")}
            onDoubleClick={() => window.location.assign(`/sessions/${s.id}`)}
            className="absolute left-1 right-1 rounded-[10px] px-2 py-1 cursor-grab active:cursor-grabbing select-none overflow-hidden transition-all duration-[180ms]"
            style={{
              top: isDragging ? ghost!.top : top,
              height: renderedHeight,
              background: `${color}1F`,
              borderLeft: `2px solid ${color}`,
              opacity: isDragging ? 0.6 : 1,
              boxShadow: isPulsing ? `0 0 0 2px ${palette.primary}80` : "none",
              zIndex: isDragging ? 20 : 5,
            }}
            title={`${patient?.fullName ?? "Session"} · ${s.service} · ${MODALITY_META[s.modality].label} · ${s.durationMin}m`}
          >
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[10px] tabular-nums shrink-0" style={{ color, fontFamily: "'DM Mono', monospace" }}>{timeStr}</span>
              <span className="text-[9.5px] shrink-0" style={{ color: `${color}CC`, fontFamily: "'DM Mono', monospace" }}>{s.durationMin}m</span>
            </div>
            {showName && (
              <div className="text-[12px] leading-[1.15] truncate mt-0.5" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
                {patient?.preferredName ?? patient?.fullName ?? "Client"}
              </div>
            )}
            {showMeta && (
              <div className="text-[10px] leading-tight truncate mt-0.5" style={{ color: palette.muted }}>
                {MODALITY_META[s.modality].label}
              </div>
            )}
            {/* Resize handle */}
            <div
              onPointerDown={(e) => { e.stopPropagation(); onDragStart(e, s, "resize"); }}
              className="absolute left-2 right-2 bottom-0 h-2 cursor-ns-resize"
              style={{ background: "transparent" }}
            />
          </div>
        );
      })}

      {/* Current time line */}
      {showNow && (
        <>
          <div className="absolute left-0 right-0 pointer-events-none" style={{ top: nowTop, height: 1, background: palette.primary, opacity: 0.7 }} />
          <div className="absolute pointer-events-none" style={{ top: nowTop - 3, left: -3, height: 6, width: 6, borderRadius: 3, background: palette.primary }} />
        </>
      )}
    </div>
  );
}
