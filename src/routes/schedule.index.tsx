import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Video, User as UserIcon, Phone } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveSessions, rescheduleSession, updateSession,
  STATUS_META, type Session, type SessionService,
} from "@/lib/sessions-store";
import { SESSION_TYPE_COLOR, hasConflict, useCalendarSettings, addDays, startOfWeek, sameDay } from "@/lib/calendar-store";
import {
  useLiveOccurrences, setView, useLiveView, BLOCK_META, createBlock,
  type ScheduleView, type BlockOccurrence,
} from "@/lib/schedule-store";
import { getPatient, avatarUrl } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/schedule/")({
  component: SchedulePage,
});

const HOUR_PX = 56; // 1 hour = 56px in day/week
const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 20 * 60;
const TOTAL_MIN = DAY_END_MIN - DAY_START_MIN;
const GRID_HEIGHT = (TOTAL_MIN / 60) * HOUR_PX;

function SchedulePage() {
  const hydrated = useHydrated();
  const view = useLiveView();
  const settings = useCalendarSettings();
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const sessions = useLiveSessions();

  const range = useMemo(() => rangeFor(view, cursor, settings.weekStartsOn), [view, cursor, settings.weekStartsOn]);
  const occurrences = useLiveOccurrences(range.from.toISOString(), range.to.toISOString());

  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading schedule…</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-1 rounded-full border p-1" style={{ borderColor: palette.border, background: palette.glass }}>
          {(["day","week","month","agenda"] as ScheduleView[]).map((v) => {
            const on = view === v;
            return (
              <button key={v} onClick={() => setView(v)} className="px-3 py-1.5 text-[12px] rounded-full transition-all capitalize"
                style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted }}>
                {v}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(shift(view, cursor, -1))} className="h-8 w-8 grid place-items-center rounded-full border" style={{ borderColor: palette.border, color: palette.ink }}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setCursor(new Date())} className="px-3 h-8 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink, background: palette.glass }}>
            Today
          </button>
          <button onClick={() => setCursor(shift(view, cursor, 1))} className="h-8 w-8 grid place-items-center rounded-full border" style={{ borderColor: palette.border, color: palette.ink }}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-[13px] ml-2" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{titleFor(view, cursor)}</span>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent("schedule:new-booking"))}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> New booking <kbd className="text-[10px] opacity-70">N</kbd>
        </button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 300px" }}>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(12px)" }}>
          {view === "day" && <DayView date={cursor} sessions={sessions} occurrences={occurrences} />}
          {view === "week" && <WeekView cursor={cursor} sessions={sessions} occurrences={occurrences} weekStartsOn={settings.weekStartsOn} />}
          {view === "month" && <MonthView cursor={cursor} sessions={sessions} occurrences={occurrences} onPick={(d) => { setCursor(d); setView("day"); }} weekStartsOn={settings.weekStartsOn} />}
          {view === "agenda" && <AgendaView sessions={sessions} occurrences={occurrences} range={range} />}
        </div>
        <TodayRail sessions={sessions} />
      </div>

      <NewBookingModal sessions={sessions} />
    </div>
  );
}

// ─── Range helpers ───────────────────────────────────────────
function rangeFor(view: ScheduleView, cursor: Date, weekStartsOn: 0 | 1) {
  const c = new Date(cursor);
  if (view === "day") {
    const from = new Date(c); from.setHours(0,0,0,0);
    const to = new Date(from); to.setDate(to.getDate() + 1);
    return { from, to };
  }
  if (view === "week" || view === "agenda") {
    const from = startOfWeek(c, weekStartsOn);
    const to = addDays(from, view === "agenda" ? 14 : 7);
    return { from, to };
  }
  // month
  const from = new Date(c.getFullYear(), c.getMonth(), 1);
  const to = new Date(c.getFullYear(), c.getMonth() + 1, 1);
  return { from, to };
}
function shift(view: ScheduleView, cursor: Date, dir: -1 | 1): Date {
  const d = new Date(cursor);
  if (view === "day") d.setDate(d.getDate() + dir);
  else if (view === "week" || view === "agenda") d.setDate(d.getDate() + 7 * dir);
  else d.setMonth(d.getMonth() + dir);
  return d;
}
function titleFor(view: ScheduleView, c: Date): string {
  if (view === "day") return c.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  if (view === "month") return c.toLocaleDateString([], { month: "long", year: "numeric" });
  return c.toLocaleDateString([], { month: "short", year: "numeric" });
}

// ─── Day view (drag-to-move) ─────────────────────────────────
function DayView({ date, sessions, occurrences }: { date: Date; sessions: Session[]; occurrences: BlockOccurrence[] }) {
  const dayISO = date.toDateString();
  const daySessions = sessions.filter((s) => new Date(s.startsAt).toDateString() === dayISO);
  const dayOccs = occurrences.filter((o) => new Date(o.startsAt).toDateString() === dayISO);

  return (
    <div className="flex">
      {/* Hour gutter */}
      <div className="w-14 shrink-0 border-r" style={{ borderColor: palette.border }}>
        {hoursRange().map((h) => (
          <div key={h} style={{ height: HOUR_PX }} className="relative">
            <span className="absolute -top-1.5 right-2 text-[10px] tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              {h.toString().padStart(2,"0")}:00
            </span>
          </div>
        ))}
      </div>
      {/* Column */}
      <div className="flex-1 relative" style={{ height: GRID_HEIGHT }}>
        <GridLines />
        <NowIndicator date={date} />
        {dayOccs.map((o, i) => <BlockBox key={o.blockId + i} occ={o} />)}
        {daySessions.map((s) => <SessionBox key={s.id} session={s} column="day" />)}
      </div>
    </div>
  );
}

function WeekView({ cursor, sessions, occurrences, weekStartsOn }: { cursor: Date; sessions: Session[]; occurrences: BlockOccurrence[]; weekStartsOn: 0 | 1 }) {
  const start = startOfWeek(cursor, weekStartsOn);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div className="flex flex-col">
      <div className="flex border-b" style={{ borderColor: palette.border }}>
        <div className="w-14 shrink-0" />
        {days.map((d) => (
          <div key={d.toDateString()} className="flex-1 py-2 text-center border-l" style={{ borderColor: palette.border }}>
            <div className="text-[10px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>{d.toLocaleDateString([], { weekday: "short" })}</div>
            <div className="text-[15px] tabular-nums" style={{ fontFamily: "'Fraunces', serif", color: sameDay(d, new Date()) ? palette.primary : palette.ink }}>
              {d.getDate()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="w-14 shrink-0 border-r" style={{ borderColor: palette.border }}>
          {hoursRange().map((h) => (
            <div key={h} style={{ height: HOUR_PX }} className="relative">
              <span className="absolute -top-1.5 right-2 text-[10px] tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {h.toString().padStart(2,"0")}:00
              </span>
            </div>
          ))}
        </div>
        {days.map((d) => {
          const daySessions = sessions.filter((s) => new Date(s.startsAt).toDateString() === d.toDateString());
          const dayOccs = occurrences.filter((o) => new Date(o.startsAt).toDateString() === d.toDateString());
          return (
            <div key={d.toDateString()} className="flex-1 relative border-l" style={{ height: GRID_HEIGHT, borderColor: palette.border }}>
              <GridLines />
              {sameDay(d, new Date()) && <NowIndicator date={d} />}
              {dayOccs.map((o, i) => <BlockBox key={o.blockId + i} occ={o} compact />)}
              {daySessions.map((s) => <SessionBox key={s.id} session={s} column="week" targetDate={d} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ cursor, sessions, occurrences, onPick, weekStartsOn }: {
  cursor: Date; sessions: Session[]; occurrences: BlockOccurrence[]; onPick: (d: Date) => void; weekStartsOn: 0 | 1;
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = startOfWeek(first, weekStartsOn);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  return (
    <div>
      <div className="grid grid-cols-7 border-b" style={{ borderColor: palette.border }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
          const label = weekStartsOn === 0 ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i] : d;
          return <div key={i} className="py-2 text-center text-[10px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>{label}</div>;
        })}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const daySessions = sessions.filter((s) => new Date(s.startsAt).toDateString() === d.toDateString());
          const dayOccs = occurrences.filter((o) => new Date(o.startsAt).toDateString() === d.toDateString());
          const isToday = sameDay(d, new Date());
          return (
            <button key={i} onClick={() => onPick(d)} className="min-h-[92px] p-2 text-left border-r border-b transition-colors hover:bg-white/40"
              style={{ borderColor: palette.border, opacity: inMonth ? 1 : 0.4 }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] tabular-nums" style={{ color: isToday ? "#fff" : palette.ink, background: isToday ? palette.primary : "transparent", borderRadius: 999, width: 20, height: 20, display: "inline-grid", placeItems: "center", fontFamily: "'Fraunces', serif" }}>
                  {d.getDate()}
                </span>
                {daySessions.length > 0 && (
                  <span className="text-[10px] tabular-nums" style={{ color: palette.muted }}>{daySessions.length}</span>
                )}
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {daySessions.slice(0, 2).map((s) => {
                  const p = getPatient(s.patientId);
                  const c = SESSION_TYPE_COLOR[s.service];
                  return (
                    <div key={s.id} className="truncate text-[10.5px] px-1.5 py-0.5 rounded" style={{ background: c.hex + "22", color: c.hex }}>
                      {new Date(s.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {p?.preferredName ?? p?.fullName?.split(" ")[0] ?? "—"}
                    </div>
                  );
                })}
                {daySessions.length > 2 && <div className="text-[10px]" style={{ color: palette.muted }}>+{daySessions.length - 2} more</div>}
                {dayOccs.slice(0, 1).map((o, k) => (
                  <div key={k} className="truncate text-[10.5px] px-1.5 py-0.5 rounded" style={{ background: BLOCK_META[o.block.kind].soft, color: BLOCK_META[o.block.kind].hex }}>
                    {o.block.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({ sessions, occurrences, range }: { sessions: Session[]; occurrences: BlockOccurrence[]; range: { from: Date; to: Date } }) {
  const from = range.from.getTime();
  const to = range.to.getTime();
  const rows = [
    ...sessions.filter((s) => { const t = new Date(s.startsAt).getTime(); return t >= from && t < to; }).map((s) => ({ kind: "session" as const, at: s.startsAt, session: s })),
    ...occurrences.map((o) => ({ kind: "block" as const, at: o.startsAt, occ: o })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  if (rows.length === 0) {
    return <div className="p-16 text-center"><p className="text-[14px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Nothing scheduled in this window. A rare, quiet stretch.</p></div>;
  }

  const grouped: Record<string, typeof rows> = {};
  rows.forEach((r) => { const k = new Date(r.at).toDateString(); (grouped[k] ??= []).push(r); });

  return (
    <div className="divide-y" style={{ borderColor: palette.border }}>
      {Object.entries(grouped).map(([dayKey, items]) => (
        <div key={dayKey} className="p-4">
          <div className="text-[11px] tracking-[0.16em] uppercase mb-3" style={{ color: palette.muted }}>
            {new Date(dayKey).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div className="space-y-2">
            {items.map((r, i) => r.kind === "session" ? (
              <AgendaSessionRow key={i} s={r.session} />
            ) : (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: BLOCK_META[r.occ.block.kind].soft + "88" }}>
                <div className="w-1 h-8 rounded" style={{ background: BLOCK_META[r.occ.block.kind].hex }} />
                <div className="text-[12px] tabular-nums w-24" style={{ color: palette.ink }}>
                  {new Date(r.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </div>
                <div className="text-[13px]" style={{ color: palette.ink }}>{r.occ.block.title}</div>
                <div className="text-[11px] ml-auto" style={{ color: palette.muted }}>{BLOCK_META[r.occ.block.kind].label} · {r.occ.block.durationMin}m</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AgendaSessionRow({ s }: { s: Session }) {
  const p = getPatient(s.patientId);
  const c = SESSION_TYPE_COLOR[s.service];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: palette.solid, borderColor: palette.border }}>
      <div className="w-1 h-10 rounded" style={{ background: c.hex }} />
      <div className="text-[12px] tabular-nums w-24" style={{ color: palette.ink }}>
        {new Date(s.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </div>
      <img src={avatarUrl(s.patientId)} alt="" className="w-7 h-7 rounded-full" />
      <div className="min-w-0">
        <div className="text-[13px] truncate" style={{ color: palette.ink }}>{p?.fullName ?? "—"}</div>
        <div className="text-[10.5px]" style={{ color: palette.muted }}>{s.service} · {s.durationMin}m · {STATUS_META[s.status].label}</div>
      </div>
      <ModalityIcon m={s.modality} />
    </div>
  );
}

function ModalityIcon({ m }: { m: Session["modality"] }) {
  const Icon = m === "telehealth" ? Video : m === "phone" ? Phone : UserIcon;
  return <Icon className="w-4 h-4 ml-auto" style={{ color: palette.muted }} />;
}

// ─── Common grid pieces ──────────────────────────────────────
function hoursRange() { return Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 60 + 1 }, (_, i) => DAY_START_MIN / 60 + i); }

function GridLines() {
  const hours = (DAY_END_MIN - DAY_START_MIN) / 60;
  return (
    <>
      {Array.from({ length: hours }).map((_, i) => (
        <div key={i} className="absolute left-0 right-0 border-t" style={{ top: i * HOUR_PX, borderColor: palette.border }} />
      ))}
    </>
  );
}

function NowIndicator({ date }: { date: Date }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 60_000); return () => clearInterval(id); }, []);
  const now = new Date();
  if (!sameDay(now, date)) return null;
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < DAY_START_MIN || mins > DAY_END_MIN) return null;
  const top = ((mins - DAY_START_MIN) / 60) * HOUR_PX;
  return (
    <div className="absolute left-0 right-0 pointer-events-none z-10" style={{ top }} data-tick={tick}>
      <div className="h-px" style={{ background: palette.primary }} />
      <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full" style={{ background: palette.primary }} />
    </div>
  );
}

function BlockBox({ occ, compact }: { occ: BlockOccurrence; compact?: boolean }) {
  const start = new Date(occ.startsAt);
  const mins = start.getHours() * 60 + start.getMinutes();
  const top = Math.max(0, ((mins - DAY_START_MIN) / 60) * HOUR_PX);
  const height = (occ.block.durationMin / 60) * HOUR_PX;
  const meta = BLOCK_META[occ.block.kind];
  return (
    <div className="absolute left-1 right-1 rounded-md px-2 py-1 pointer-events-none"
      style={{
        top, height,
        background: `repeating-linear-gradient(45deg, ${meta.hex}22, ${meta.hex}22 6px, ${meta.hex}12 6px, ${meta.hex}12 12px)`,
        borderLeft: `2px solid ${meta.hex}`,
      }}>
      <div className="text-[10.5px] truncate" style={{ color: meta.hex, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        {compact ? occ.block.title : `${occ.block.title} · ${meta.label}`}
      </div>
    </div>
  );
}

// ─── Session box with drag-to-move ───────────────────────────
function SessionBox({ session, column, targetDate }: { session: Session; column: "day" | "week"; targetDate?: Date }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const start = new Date(session.startsAt);
  const mins = start.getHours() * 60 + start.getMinutes();
  const top = ((mins - DAY_START_MIN) / 60) * HOUR_PX;
  const height = Math.max(20, (session.durationMin / 60) * HOUR_PX - 2);
  const color = SESSION_TYPE_COLOR[session.service];
  const patient = getPatient(session.patientId);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [warn, setWarn] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (session.status === "in_progress" || session.status === "completed") return;
    e.preventDefault();
    const startY = e.clientY;
    const el = boxRef.current;
    if (el) el.setPointerCapture(e.pointerId);
    const originalTop = top;
    let currentOffset = 0;

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      // Snap to 15-minute intervals
      const snappedMin = Math.round(dy / (HOUR_PX / 4)) * 15;
      currentOffset = (snappedMin / 60) * HOUR_PX;
      setDragOffset(currentOffset);
      const newMin = mins + snappedMin;
      const newDate = new Date(targetDate ?? start);
      newDate.setHours(0, 0, 0, 0);
      newDate.setMinutes(newMin);
      setWarn(hasConflict({ id: session.id, startsAt: newDate.toISOString(), durationMin: session.durationMin }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const snappedMin = Math.round(currentOffset / (HOUR_PX / 4)) * 15;
      if (snappedMin !== 0) {
        const newDate = new Date(targetDate ?? start);
        newDate.setHours(0, 0, 0, 0);
        newDate.setMinutes(mins + snappedMin);
        rescheduleSession(session.id, newDate.toISOString());
      }
      setDragOffset(0);
      setWarn(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <Link to="/sessions/$id" params={{ id: session.id }}>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        className="absolute left-1 right-1 rounded-md px-2 py-1 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
        style={{
          top: top + dragOffset,
          height,
          background: color.hex + "18",
          borderLeft: `3px solid ${color.hex}`,
          boxShadow: warn ? `0 0 0 2px #B03848` : undefined,
        }}
      >
        <div className="text-[11px] font-medium truncate flex items-center gap-1" style={{ color: color.hex }}>
          {warn && <AlertTriangle className="w-3 h-3" />}
          {new Date(start.getTime() + (dragOffset / HOUR_PX) * 3600_000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          <span className="opacity-70">·</span>
          <span className="truncate" style={{ color: palette.ink }}>{patient?.preferredName ?? patient?.fullName?.split(" ")[0] ?? "—"}</span>
        </div>
        {height > 36 && (
          <div className="text-[10px] mt-0.5 truncate" style={{ color: palette.muted }}>
            {session.service} · {session.durationMin}m
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Today rail ──────────────────────────────────────────────
function TodayRail({ sessions }: { sessions: Session[] }) {
  const today = new Date().toDateString();
  const todaySessions = sessions.filter((s) => new Date(s.startsAt).toDateString() === today && s.status !== "cancelled");
  const now = Date.now();
  const next = todaySessions.find((s) => new Date(s.startsAt).getTime() >= now);
  const weekAgo = now - 7 * 86400_000;
  const noShows = sessions.filter((s) => s.status === "no_show" && new Date(s.startsAt).getTime() >= weekAgo).length;
  const unpaid = sessions.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.fee, 0);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(12px)" }}>
        <div className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Today</div>
        <div className="mt-2 tabular-nums" style={{ fontFamily: "'Fraunces', serif", fontSize: 34, color: palette.ink, lineHeight: 1 }}>
          {todaySessions.length}
        </div>
        <div className="text-[11px] mt-1" style={{ color: palette.muted }}>sessions on the books</div>
      </div>
      {next && (
        <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong }}>
          <div className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Next up</div>
          <div className="mt-2 text-[13px]" style={{ color: palette.ink }}>
            {getPatient(next.patientId)?.fullName ?? "—"}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: palette.muted }}>
            {new Date(next.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {next.service}
          </div>
          <Link to="/sessions/$id" params={{ id: next.id }} className="mt-3 inline-flex items-center gap-1 text-[11.5px] px-3 py-1.5 rounded-full" style={{ background: palette.ink, color: "#fff" }}>
            Open session
          </Link>
        </div>
      )}
      <div className="rounded-2xl border p-4 grid grid-cols-2 gap-3" style={{ borderColor: palette.border, background: palette.glassStrong }}>
        <div>
          <div className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>No-shows · 7d</div>
          <div className="tabular-nums mt-1" style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: noShows > 0 ? "#B03848" : palette.ink }}>{noShows}</div>
        </div>
        <div>
          <div className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Unbilled</div>
          <div className="tabular-nums mt-1" style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink }}>₹{(unpaid/1000).toFixed(0)}k</div>
        </div>
      </div>
      <QuickActionsCard />
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="text-[10.5px] tracking-[0.14em] uppercase mb-3" style={{ color: palette.muted }}>Quick actions</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => window.dispatchEvent(new CustomEvent("schedule:new-booking"))} className="text-[11.5px] px-2.5 py-1.5 rounded-full border" style={{ borderColor: palette.border, color: palette.ink }}>
          New booking
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent("schedule:new-break"))} className="text-[11.5px] px-2.5 py-1.5 rounded-full border" style={{ borderColor: palette.border, color: palette.ink }}>
          Add break
        </button>
        <Link to="/schedule/availability" className="text-[11.5px] px-2.5 py-1.5 rounded-full border text-center" style={{ borderColor: palette.border, color: palette.ink }}>
          Hours
        </Link>
        <Link to="/schedule/recurring" className="text-[11.5px] px-2.5 py-1.5 rounded-full border text-center" style={{ borderColor: palette.border, color: palette.ink }}>
          Recurring
        </Link>
      </div>
    </div>
  );
}

// ─── New booking / new break modal (minimal) ─────────────────
import { listPatients, type Patient } from "@/lib/patients-store";
import { createSession } from "@/lib/sessions-store";

function NewBookingModal({ sessions: _s }: { sessions: Session[] }) {
  const [mode, setMode] = useState<null | "booking" | "break">(null);
  useEffect(() => {
    const openB = () => setMode("booking");
    const openBreak = () => setMode("break");
    window.addEventListener("schedule:new-booking", openB);
    window.addEventListener("schedule:new-break", openBreak);
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "n" || e.key === "N") setMode("booking");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("schedule:new-booking", openB);
      window.removeEventListener("schedule:new-break", openBreak);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  if (!mode) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm" onClick={() => setMode(null)}>
      <div className="bg-white rounded-2xl p-6 w-[420px] max-w-[92vw] border" style={{ borderColor: palette.border }} onClick={(e) => e.stopPropagation()}>
        {mode === "booking" ? <BookingForm onDone={() => setMode(null)} /> : <BreakForm onDone={() => setMode(null)} />}
      </div>
    </div>
  );
}

function BookingForm({ onDone }: { onDone: () => void }) {
  const patients = useMemo(() => listPatients({ status: "active" }), []) as Patient[];
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState("10:00");
  const [service, setService] = useState<SessionService>("Individual Therapy");
  const [duration, setDuration] = useState(50);
  const startsAt = new Date(`${dateStr}T${timeStr}:00`);
  const conflict = hasConflict({ startsAt: startsAt.toISOString(), durationMin: duration });

  return (
    <div>
      <h2 className="text-[18px] mb-4" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>New booking</h2>
      <div className="space-y-3">
        <Field label="Patient">
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
          <Field label="Time"><input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} step={900} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Service">
            <select value={service} onChange={(e) => setService(e.target.value as SessionService)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }}>
              {(["Intake","Individual Therapy","Couples","Follow-up","Assessment"] as SessionService[]).map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Duration">
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }}>
              {[30, 45, 50, 60, 90].map((n) => <option key={n} value={n}>{n} min</option>)}
            </select>
          </Field>
        </div>
        {conflict && (
          <div className="flex items-center gap-2 text-[11.5px] p-2 rounded" style={{ color: "#8A2C3E", background: "#F1C6CE55" }}>
            <AlertTriangle className="w-3.5 h-3.5" /> Overlaps an existing session or block.
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onDone} className="text-[12px] px-3 py-1.5 rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
        <button onClick={() => {
          if (!patientId) return;
          createSession({
            patientId, service, durationMin: duration, modality: "telehealth", status: "scheduled",
            startsAt: startsAt.toISOString(), fee: 2500,
          });
          onDone();
        }} className="text-[12px] px-3 py-1.5 rounded-full" style={{ background: palette.ink, color: "#fff" }}>
          Book
        </button>
      </div>
    </div>
  );
}

function BreakForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("Break");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState("13:00");
  const [duration, setDuration] = useState(30);
  const [kind, setKind] = useState<"break" | "admin" | "personal" | "supervision" | "travel">("break");
  return (
    <div>
      <h2 className="text-[18px] mb-4" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Add block</h2>
      <div className="space-y-3">
        <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
          <Field label="Time"><input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} step={900} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kind">
            <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }}>
              {Object.entries(BLOCK_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Duration">
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }}>
              {[15, 30, 45, 60, 90, 120].map((n) => <option key={n} value={n}>{n} min</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onDone} className="text-[12px] px-3 py-1.5 rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
        <button onClick={() => {
          createBlock({ title, kind, startsAt: new Date(`${dateStr}T${timeStr}:00`).toISOString(), durationMin: duration, recurrence: { kind: "once" } });
          onDone();
        }} className="text-[12px] px-3 py-1.5 rounded-full" style={{ background: palette.ink, color: "#fff" }}>Add block</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10.5px] tracking-[0.14em] uppercase mb-1" style={{ color: palette.muted }}>{label}</span>
      {children}
    </label>
  );
}

// Suppress unused import warning
void updateSession;
