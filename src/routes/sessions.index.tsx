import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { CalendarDays, Video, Users as UsersIcon, Phone, Plus, ArrowRight } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveSessions,
  rescheduleSession,
  type Session,
  MODALITY_META,
  STATUS_META,
} from "@/lib/sessions-store";
import { getPatient, RISK_META, avatarUrl } from "@/lib/patients-store";
import { DensityStrip } from "@/components/viz/DensityStrip";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/sessions/")({
  head: () => ({
    meta: [
      { title: "Schedule — PeaceCode · Practice" },
      { name: "description", content: "Your week at a glance — sessions, no-shows, and pending notes." },
    ],
  }),
  component: ScheduleBoard,
});

// ── helpers ───────────────────────────────────────────────
const DAY_MS = 86_400_000;
function startOfWeek(d: Date): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const dow = x.getDay(); // 0 = Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + diff);
  return x;
}
function fmtWeekday(d: Date) { return d.toLocaleDateString([], { weekday: "short" }); }
function fmtDay(d: Date) { return d.toLocaleDateString([], { day: "2-digit" }); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function fmtISODay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x.toISOString().slice(0, 10); }
function fmtHeaderDay(d: Date) { return d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }); }
function weekNumber(d: Date) {
  const target = new Date(d.valueOf());
  const day = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - day + 3);
  const first = new Date(target.getFullYear(), 0, 4);
  return 1 + Math.round(((target.getTime() - first.getTime()) / 86400000 - 3 + ((first.getDay() + 6) % 7)) / 7);
}

function ModalityIcon({ modality, className }: { modality: Session["modality"]; className?: string }) {
  const meta = MODALITY_META[modality];
  if (meta.icon === "video") return <Video className={className} strokeWidth={1.5} />;
  if (meta.icon === "phone") return <Phone className={className} strokeWidth={1.5} />;
  return <UsersIcon className={className} strokeWidth={1.5} />;
}

// ── Glass surface primitive ───────────────────────────────
function Glass({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-3xl border ${className}`}
      style={{ background: palette.glass, backdropFilter: "blur(24px) saturate(140%)", borderColor: "rgba(255,255,255,0.55)", boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset", ...style }}
    >
      {children}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (!values.length) return null;
  const w = 60, h = 14;
  const max = Math.max(...values, 1);
  const step = w / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} className="mt-1">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
    </svg>
  );
}

// ── Counter pill ──────────────────────────────────────────
function CounterPill({ label, value, trend, tone }: { label: string; value: number; trend: number[]; tone: string }) {
  return (
    <Glass className="px-3.5 py-2 min-w-[112px]">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>{label}</span>
        <span className="text-[20px] leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</span>
      </div>
      <Sparkline values={trend} color={tone} />
    </Glass>
  );
}

// ── Today ribbon ──────────────────────────────────────────
function TodayRibbon({ today, sessionsToday }: { today: Date; sessionsToday: Session[] }) {
  const scheduled = sessionsToday.filter((s) => s.status === "scheduled" || s.status === "confirmed").length;
  const completed = sessionsToday.filter((s) => s.status === "completed").length;
  const noShow = sessionsToday.filter((s) => s.status === "no_show").length;

  // static trend seeds (7-day pretend history)
  const scheduledTrend = [5, 6, 4, 7, 6, 5, scheduled || 1];
  const completedTrend = [3, 4, 5, 4, 6, 5, completed || 1];
  const noShowTrend    = [1, 0, 1, 2, 0, 1, noShow || 0];

  return (
    <section className="sticky top-14 z-20 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-4 backdrop-blur-2xl" style={{ background: "linear-gradient(to bottom, rgba(251,247,248,0.92), rgba(251,247,248,0.7))" }}>
      <div className="flex items-center gap-6 md:gap-10 max-w-[1400px] mx-auto">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.4rem,2vw,1.85rem)] leading-tight tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            {fmtHeaderDay(today)}
          </h1>
          <p className="text-[11px] mt-0.5 tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Week {weekNumber(today)}</p>
        </div>

        <div className="hidden md:block">
          <DensityStrip sessions={sessionsToday} width={140} height={54} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CounterPill label="Scheduled" value={scheduled} trend={scheduledTrend} tone={palette.primary} />
          <CounterPill label="Completed" value={completed} trend={completedTrend} tone="#5F8A6A" />
          <CounterPill label="No-show" value={noShow} trend={noShowTrend} tone="#B0384A" />
        </div>
      </div>
    </section>
  );
}

// ── Session card ──────────────────────────────────────────
function SessionCard({ session, onDragStart }: { session: Session; onDragStart: (id: string) => void }) {
  const patient = getPatient(session.patientId);
  const risk = patient?.risk ?? "stable";
  const riskMeta = RISK_META[risk];
  const statusMeta = STATUS_META[session.status];
  const dimmed = session.status === "cancelled" || session.status === "no_show";

  return (
    <div
      draggable
      onDragStart={(e) => { onDragStart(session.id); e.dataTransfer.effectAllowed = "move"; }}
      className="group relative rounded-2xl border px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-16px_rgba(30,20,24,0.25)]"
      style={{
        background: dimmed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)",
        borderColor: "rgba(255,255,255,0.6)",
        opacity: dimmed ? 0.6 : 1,
      }}
    >
      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full" style={{ background: riskMeta.token }} />

      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="min-w-0">
          <div className="text-[13px] leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{fmtTime(session.startsAt)}</div>
          <div className="text-[12.5px] font-medium mt-1 truncate" style={{ color: palette.ink }}>{patient?.preferredName ?? patient?.fullName ?? "—"}</div>
          <div className="text-[10.5px] truncate mt-0.5" style={{ color: palette.muted }}>{session.service} · {session.durationMin}m</div>
        </div>
        <ModalityIcon modality={session.modality} className="w-3.5 h-3.5 opacity-60 shrink-0" />
      </div>

      <div className="flex items-center justify-between pl-1.5 mt-2">
        <span className="text-[9.5px] tracking-[0.12em] uppercase" style={{ color: statusMeta.token }}>{statusMeta.label}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link to="/sessions/$id" params={{ id: session.id }} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: palette.surface2, color: palette.ink }}>
            Open
          </Link>
          {session.modality === "telehealth" && (session.status !== "completed" && session.status !== "cancelled") && (
            <Link to="/sessions/$id/room" params={{ id: session.id }} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: palette.ink, color: "#fff" }}>
              Join
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────
function DayColumn({ date, sessions, isToday, onDrop, onDragStart }: {
  date: Date;
  sessions: Session[];
  isToday: boolean;
  onDrop: (dayISO: string) => void;
  onDragStart: (id: string) => void;
}) {
  const [over, setOver] = useState(false);
  const dayISO = fmtISODay(date);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(dayISO); }}
      className="rounded-3xl border p-3 min-h-[420px] transition-colors duration-200 flex flex-col"
      style={{
        background: isToday ? "rgba(241,199,214,0.16)" : "rgba(255,255,255,0.45)",
        backdropFilter: "blur(24px) saturate(140%)",
        borderColor: over ? "rgba(176,86,122,0.5)" : "rgba(255,255,255,0.55)",
      }}
    >
      <header className="flex items-baseline justify-between mb-3 px-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>{fmtWeekday(date)}</span>
          <span className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{fmtDay(date)}</span>
        </div>
        {isToday && <span className="w-1.5 h-1.5 rounded-full" style={{ background: palette.primary }} />}
      </header>

      <div className="space-y-2 flex-1">
        {sessions.length === 0 ? (
          <button
            className="w-full text-[10px] tracking-[0.14em] uppercase py-6 rounded-2xl border border-dashed transition-colors hover:bg-white/30"
            style={{ borderColor: palette.border, color: palette.muted }}
            onClick={() => toast("Schedule creator lands in the next pass.")}
          >
            + Add
          </button>
        ) : (
          sessions.map((s) => <SessionCard key={s.id} session={s} onDragStart={onDragStart} />)
        )}
      </div>
    </div>
  );
}

// ── Backlog strip ─────────────────────────────────────────
function BacklogStrip({ backlog }: { backlog: Session[] }) {
  const [open, setOpen] = useState(false);
  if (backlog.length === 0) return null;
  return (
    <section className="max-w-[1400px] mx-auto mt-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase mb-3"
        style={{ color: palette.muted }}
      >
        Notes pending · <span style={{ color: palette.primary }}>{backlog.length}</span>
        <ArrowRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
          {backlog.map((s) => {
            const p = getPatient(s.patientId);
            return (
              <Link
                key={s.id}
                to="/sessions/$id/wrap"
                params={{ id: s.id }}
                className="snap-start shrink-0 w-[220px] rounded-2xl border px-3 py-2.5 transition-transform hover:-translate-y-0.5"
                style={{ background: palette.glass, borderColor: "rgba(255,255,255,0.6)" }}
              >
                <div className="flex items-center gap-2">
                  <img src={avatarUrl(p?.id ?? s.patientId)} alt="" className="w-6 h-6 rounded-full" />
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium truncate" style={{ color: palette.ink }}>{p?.preferredName ?? p?.fullName ?? "—"}</div>
                    <div className="text-[10px]" style={{ color: palette.muted }}>{new Date(s.startsAt).toLocaleDateString([], { day: "2-digit", month: "short" })} · {fmtTime(s.startsAt)}</div>
                  </div>
                </div>
                <p className="text-[10.5px] mt-2 tracking-[0.12em] uppercase" style={{ color: palette.primary }}>Wrap-up →</p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Command palette (⌘K, scoped) ──────────────────────────
function CommandPalette({ open, onClose, sessions }: { open: boolean; onClose: () => void; sessions: Session[] }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 40); }, [open]);
  if (!open) return null;
  const query = q.toLowerCase();
  const results = sessions
    .filter((s) => {
      const p = getPatient(s.patientId);
      return !query || (p?.fullName.toLowerCase().includes(query) ?? false) || s.service.toLowerCase().includes(query);
    })
    .slice(0, 8);
  const next = sessions.find((s) => s.status !== "completed" && s.status !== "cancelled" && s.status !== "no_show" && new Date(s.startsAt).getTime() > Date.now());
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={onClose} style={{ background: "rgba(30,20,24,0.35)", backdropFilter: "blur(6px)" }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border overflow-hidden animate-in fade-in duration-150" style={{ background: palette.glassStrong, borderColor: "rgba(255,255,255,0.7)" }}>
        <input
          ref={ref}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Jump to a patient or session…"
          className="w-full px-4 py-3 outline-none text-[13px]"
          style={{ color: palette.ink, background: "transparent", borderBottom: `1px solid ${palette.border}` }}
        />
        <div className="max-h-80 overflow-y-auto py-1">
          {next && !q && (
            <button onClick={() => { onClose(); navigate({ to: "/sessions/$id/room", params: { id: next.id } }); }} className="w-full text-left px-4 py-2 hover:bg-black/[0.03] flex items-center justify-between">
              <span className="text-[12.5px]" style={{ color: palette.ink }}>Start next session · {getPatient(next.patientId)?.preferredName ?? "—"}</span>
              <span className="text-[10px]" style={{ color: palette.primary }}>{fmtTime(next.startsAt)}</span>
            </button>
          )}
          {results.map((s) => {
            const p = getPatient(s.patientId);
            return (
              <button key={s.id} onClick={() => { onClose(); navigate({ to: "/sessions/$id", params: { id: s.id } }); }} className="w-full text-left px-4 py-2 hover:bg-black/[0.03] flex items-center justify-between">
                <span className="text-[12.5px]" style={{ color: palette.ink }}>{p?.fullName ?? "—"} · {s.service}</span>
                <span className="text-[10px]" style={{ color: palette.muted }}>{new Date(s.startsAt).toLocaleDateString([], { day: "2-digit", month: "short" })} {fmtTime(s.startsAt)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
function ScheduleBoard() {
  const hydrated = useHydrated();
  const sessions = useLiveSessions();
  const [dragging, setDragging] = useState<string | null>(null);
  const [palOpen, setPalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [mobileDay, setMobileDay] = useState(0); // for mobile day-switcher

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalOpen(true); }
      if (e.key === "Escape") setPalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const weekStart = useMemo(() => {
    const s = startOfWeek(new Date());
    s.setDate(s.getDate() + weekOffset * 7);
    return s;
  }, [weekOffset]);

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  }), [weekStart]);

  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const d of week) map.set(fmtISODay(d), []);
    for (const s of sessions) {
      const k = fmtISODay(new Date(s.startsAt));
      if (map.has(k)) map.get(k)!.push(s);
    }
    for (const [, arr] of map) arr.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return map;
  }, [sessions, week]);

  const sessionsToday = useMemo(() => sessions.filter((s) => fmtISODay(new Date(s.startsAt)) === fmtISODay(today)), [sessions, today]);

  const backlog = useMemo(() => {
    const cutoff = Date.now() - 7 * DAY_MS;
    return sessions.filter((s) => s.status === "completed" && !s.postNoteId && new Date(s.startsAt).getTime() >= cutoff);
  }, [sessions]);

  function handleDrop(dayISO: string) {
    if (!dragging) return;
    const s = sessions.find((x) => x.id === dragging);
    if (!s) { setDragging(null); return; }
    const prev = s.startsAt;
    const orig = new Date(s.startsAt);
    const next = new Date(dayISO);
    next.setHours(orig.getHours(), orig.getMinutes(), 0, 0);
    if (next.toISOString() === prev) { setDragging(null); return; }
    rescheduleSession(s.id, next.toISOString());
    toast("Session moved", {
      description: `${getPatient(s.patientId)?.preferredName ?? "Session"} → ${next.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" })}`,
      action: { label: "Undo", onClick: () => rescheduleSession(s.id, prev) },
    });
    setDragging(null);
  }

  if (!hydrated) {
    return <div className="p-8 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading schedule…</div>;
  }

  return (
    <div className="min-h-screen">
      <TodayRibbon today={today} sessionsToday={sessionsToday} />

      <div className="px-4 sm:px-6 md:px-8 pt-6 max-w-[1400px] mx-auto">
        {/* Week nav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setWeekOffset((v) => v - 1)} className="text-[11px] px-2.5 py-1 rounded-full border" style={{ borderColor: palette.border, color: palette.muted, background: palette.glass }}>← Prev</button>
            <button onClick={() => setWeekOffset(0)} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: palette.ink, color: "#fff" }}>This week</button>
            <button onClick={() => setWeekOffset((v) => v + 1)} className="text-[11px] px-2.5 py-1 rounded-full border" style={{ borderColor: palette.border, color: palette.muted, background: palette.glass }}>Next →</button>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px]" style={{ color: palette.muted }}>
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Drag cards between days to reschedule · <kbd className="px-1.5 py-0.5 rounded" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>⌘K</kbd></span>
          </div>
        </div>

        {/* Mobile day switcher */}
        <div className="md:hidden flex gap-1.5 overflow-x-auto pb-3 mb-2">
          {week.map((d, i) => {
            const isSel = i === mobileDay;
            return (
              <button key={i} onClick={() => setMobileDay(i)} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] flex flex-col items-center leading-tight"
                style={{ background: isSel ? palette.ink : "rgba(255,255,255,0.6)", color: isSel ? "#fff" : palette.ink, border: `1px solid ${isSel ? palette.ink : palette.border}` }}>
                <span className="text-[9px] tracking-[0.14em] uppercase opacity-70">{fmtWeekday(d)}</span>
                <span style={{ fontFamily: "'Fraunces', serif" }}>{fmtDay(d)}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile: single-day list */}
        <div className="md:hidden space-y-2">
          {(byDay.get(fmtISODay(week[mobileDay])) ?? []).length === 0 ? (
            <p className="text-[12px] py-10 text-center" style={{ color: palette.muted }}>Nothing scheduled.</p>
          ) : (
            (byDay.get(fmtISODay(week[mobileDay])) ?? []).map((s) => (
              <SessionCard key={s.id} session={s} onDragStart={() => {}} />
            ))
          )}
        </div>

        {/* Desktop week grid */}
        <div className="hidden md:grid grid-cols-7 gap-3">
          {week.map((d) => (
            <DayColumn
              key={d.toISOString()}
              date={d}
              sessions={byDay.get(fmtISODay(d)) ?? []}
              isToday={fmtISODay(d) === fmtISODay(today)}
              onDrop={handleDrop}
              onDragStart={setDragging}
            />
          ))}
        </div>

        <BacklogStrip backlog={backlog} />
      </div>

      <CommandPalette open={palOpen} onClose={() => setPalOpen(false)} sessions={sessions} />

      {/* FAB */}
      <button
        onClick={() => toast("Schedule creator lands in the next pass.")}
        className="fixed bottom-24 md:bottom-8 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        style={{ background: palette.primary, color: "#fff" }}
        aria-label="New session"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
