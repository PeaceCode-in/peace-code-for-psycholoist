import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { CalendarShell, HatchDefs } from "@/components/practice/calendar/CalendarShell";
import {
  useLiveWindows, useLiveBlackouts, useCalendarSettings,
  upsertWindow, deleteWindow, replaceAllWindows, addBlackout, deleteBlackout,
  getFreeSlots, addDays,
  type DayOfWeek, type AvailabilityWindow,
} from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/calendar/availability")({
  head: () => ({ meta: [{ title: "Availability — Calendar · PeaceCode" }] }),
  component: AvailabilityEditor,
});

const HOUR_PX = 32;
const SNAP = 30; // minutes
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

type Template = { name: string; make: (fromISO: string) => Omit<AvailabilityWindow, "id">[] };
const TEMPLATES: Template[] = [
  { name: "Standard 9–5", make: (f) => [1,2,3,4,5].flatMap((d) => [{ dayOfWeek: d as DayOfWeek, startMin: 9*60, endMin: 17*60, sessionTypes: ["Individual Therapy","Intake","Follow-up"], location: "either" as const, effectiveFrom: f }]) },
  { name: "Split day", make: (f) => [1,2,3,4,5].flatMap((d) => [
    { dayOfWeek: d as DayOfWeek, startMin: 9*60, endMin: 12*60, sessionTypes: ["Individual Therapy","Intake"], location: "either" as const, effectiveFrom: f },
    { dayOfWeek: d as DayOfWeek, startMin: 15*60, endMin: 19*60, sessionTypes: ["Individual Therapy","Follow-up"], location: "either" as const, effectiveFrom: f },
  ]) },
  { name: "Evenings only", make: (f) => [1,2,3,4,5].flatMap((d) => [{ dayOfWeek: d as DayOfWeek, startMin: 18*60, endMin: 21*60, sessionTypes: ["Individual Therapy","Follow-up"], location: "telehealth" as const, effectiveFrom: f }]) },
  { name: "Weekend catch-up", make: (f) => [6,0].flatMap((d) => [{ dayOfWeek: d as DayOfWeek, startMin: 10*60, endMin: 14*60, sessionTypes: ["Follow-up","Individual Therapy"], location: "telehealth" as const, effectiveFrom: f }]) },
];

function AvailabilityEditor() {
  const hydrated = useHydrated();
  const settings = useCalendarSettings();
  const windows = useLiveWindows();
  const blackouts = useLiveBlackouts();
  const [painting, setPainting] = useState<{ day: DayOfWeek; startMin: number; endMin: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [confirmTpl, setConfirmTpl] = useState<Template | null>(null);
  const [blackoutForm, setBlackoutForm] = useState({ start: "", end: "", reason: "" });

  const startHour = 7, endHour = 22;
  const hours = useMemo(() => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i), []);

  const dayOrder: DayOfWeek[] = settings.weekStartsOn === 1 ? [1,2,3,4,5,6,0] : [0,1,2,3,4,5,6];

  const yToMin = (y: number) => {
    const raw = (y / HOUR_PX) * 60 + startHour * 60;
    return Math.max(startHour*60, Math.min(endHour*60, Math.round(raw / SNAP) * SNAP));
  };

  const onCellDown = useCallback((e: React.PointerEvent, day: DayOfWeek) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const startMin = yToMin(e.clientY - rect.top);
    setPainting({ day, startMin, endMin: startMin + SNAP });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const em = yToMin(ev.clientY - rect.top);
      setPainting((p) => p ? { ...p, endMin: Math.max(p.startMin + SNAP, em) } : p);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setPainting((p) => {
        if (!p) return null;
        upsertWindow({
          dayOfWeek: p.day,
          startMin: p.startMin,
          endMin: p.endMin,
          sessionTypes: ["Individual Therapy","Intake","Follow-up"],
          location: "either",
          effectiveFrom: new Date().toISOString(),
        });
        toast.success(`Added ${DAYS[p.day]} ${fmt(p.startMin)}–${fmt(p.endMin)}`);
        return null;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, []);

  const applyTemplate = (tpl: Template, mode: "replace" | "merge") => {
    const fromISO = new Date().toISOString();
    const made = tpl.make(fromISO);
    if (mode === "replace") {
      replaceAllWindows(made.map((w) => ({ ...w, id: crypto.randomUUID?.() ?? `aw_${Math.random().toString(36).slice(2,10)}` })) as AvailabilityWindow[]);
      toast.success(`Replaced with ${tpl.name}`);
    } else {
      for (const w of made) upsertWindow(w);
      toast.success(`Merged ${tpl.name}`);
    }
    setConfirmTpl(null);
  };

  const openSlots = useMemo(() => {
    let n = 0;
    for (let i = 0; i < 7; i++) n += getFreeSlots(addDays(new Date(), i), 50).length;
    return n;
  }, [windows, blackouts]);

  if (!hydrated) return <CalendarShell><div style={{ color: palette.muted }}>Loading…</div></CalendarShell>;

  return (
    <CalendarShell title="Availability" subtitle="Paint recurring windows. Chips apply templates. Blackouts sit below.">
      {/* Templates */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Templates</span>
        {TEMPLATES.map((t) => (
          <button key={t.name} onClick={() => setConfirmTpl(t)} className="text-[12px] px-3 py-1 rounded-full border transition-all duration-[180ms] hover:bg-white" style={{ borderColor: palette.border, color: palette.ink }}>
            {t.name}
          </button>
        ))}
        {confirmTpl && (
          <span className="inline-flex items-center gap-1 text-[11px] rounded-full border pl-3 pr-1 py-0.5" style={{ borderColor: palette.primary, background: "rgba(176,86,122,0.06)" }}>
            Apply <b className="mx-1" style={{ fontFamily: "'Fraunces', serif" }}>{confirmTpl.name}</b> —
            <button onClick={() => applyTemplate(confirmTpl, "replace")} className="ml-1 px-2 py-0.5 rounded-full" style={{ background: palette.ink, color: "#fff" }}>Replace</button>
            <button onClick={() => applyTemplate(confirmTpl, "merge")} className="ml-1 px-2 py-0.5 rounded-full border" style={{ borderColor: palette.border }}>Merge</button>
            <button onClick={() => setConfirmTpl(null)} className="ml-1 px-2 py-0.5" style={{ color: palette.muted }}>×</button>
          </span>
        )}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 300px" }}>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glass }}>
          <div className="grid" style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))`, borderBottom: `1px solid ${palette.border}` }}>
            <div />
            {dayOrder.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace", borderLeft: `1px solid ${palette.border}` }}>{DAYS[d]}</div>
            ))}
          </div>
          <div className="grid" ref={gridRef} style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}>
            <div>
              {hours.map((h) => (
                <div key={h} className="text-right pr-2" style={{ height: HOUR_PX, borderTop: h === startHour ? "none" : `1px solid ${palette.border}` }}>
                  <span className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{String(h).padStart(2,"0")}</span>
                </div>
              ))}
            </div>
            {dayOrder.map((d) => (
              <div key={d} className="relative" style={{ height: hours.length * HOUR_PX, borderLeft: `1px solid ${palette.border}` }}
                onPointerDown={(e) => onCellDown(e, d)}
              >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <HatchDefs id={`av-hatch-${d}`} />
                  {hours.map((h, i) => <line key={h} x1="0" x2="100%" y1={i * HOUR_PX} y2={i * HOUR_PX} stroke={palette.border} strokeWidth="1" opacity={i === 0 ? 0 : 1} />)}
                  {windows.filter((w) => w.dayOfWeek === d).map((w) => {
                    const top = ((w.startMin - startHour*60) / 60) * HOUR_PX;
                    const h = ((w.endMin - w.startMin) / 60) * HOUR_PX;
                    return <rect key={w.id} x="0" y={Math.max(0, top)} width="100%" height={h} fill={`url(#av-hatch-${d})`} opacity="0.75" />;
                  })}
                  {painting && painting.day === d && (
                    <rect x="0" y={((painting.startMin - startHour*60)/60)*HOUR_PX} width="100%" height={((painting.endMin - painting.startMin)/60)*HOUR_PX} fill={palette.primary} opacity="0.15" />
                  )}
                </svg>
                {windows.filter((w) => w.dayOfWeek === d).map((w) => {
                  const top = ((w.startMin - startHour*60) / 60) * HOUR_PX;
                  const h = ((w.endMin - w.startMin) / 60) * HOUR_PX;
                  return (
                    <div key={w.id} className="absolute left-1 right-1 rounded-lg text-[10px] px-2 py-0.5 flex items-center justify-between pointer-events-auto"
                      style={{ top, height: h, background: palette.glass, border: `1px solid ${palette.border}` }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{fmt(w.startMin)}–{fmt(w.endMin)}</span>
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { deleteWindow(w.id); toast.success("Window removed"); }} className="opacity-60 hover:opacity-100" aria-label="Delete window">
                        <Trash2 className="h-3 w-3" style={{ color: palette.muted }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 text-[10.5px]" style={{ color: palette.muted, borderTop: `1px solid ${palette.border}`, fontFamily: "'DM Mono', monospace" }}>
            Click-drag to paint · click ✕ inside a window to remove
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass }}>
            <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Next 7 days</div>
            <div className="text-[26px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{openSlots}</div>
            <div className="text-[11px]" style={{ color: palette.muted }}>open 50-min slots</div>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Blackouts</div>
            </div>
            <div className="space-y-2 mb-3">
              {blackouts.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-[12px] border rounded-lg px-2.5 py-1.5" style={{ borderColor: palette.border }}>
                  <div>
                    <div style={{ color: palette.ink, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(b.startAt).toLocaleDateString(undefined,{month:"short",day:"numeric"})} → {new Date(b.endAt).toLocaleDateString(undefined,{month:"short",day:"numeric"})}
                    </div>
                    <div className="text-[10.5px]" style={{ color: palette.muted }}>{b.reason ?? "—"}</div>
                  </div>
                  <button onClick={() => deleteBlackout(b.id)} className="opacity-60 hover:opacity-100"><Trash2 className="h-3.5 w-3.5" style={{ color: palette.muted }} /></button>
                </div>
              ))}
              {!blackouts.length && <div className="text-[11px]" style={{ color: palette.muted }}>None.</div>}
            </div>
            <div className="space-y-2">
              <input type="datetime-local" value={blackoutForm.start} onChange={(e) => setBlackoutForm((f) => ({ ...f, start: e.target.value }))}
                className="w-full text-[12px] rounded-md border px-2 py-1.5" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }} />
              <input type="datetime-local" value={blackoutForm.end} onChange={(e) => setBlackoutForm((f) => ({ ...f, end: e.target.value }))}
                className="w-full text-[12px] rounded-md border px-2 py-1.5" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }} />
              <input placeholder="Reason (conference, personal…)" value={blackoutForm.reason} onChange={(e) => setBlackoutForm((f) => ({ ...f, reason: e.target.value }))}
                className="w-full text-[12px] rounded-md border px-2 py-1.5" style={{ borderColor: palette.border }} />
              <button
                onClick={() => {
                  if (!blackoutForm.start || !blackoutForm.end) return toast.error("Pick start and end.");
                  addBlackout({ startAt: new Date(blackoutForm.start).toISOString(), endAt: new Date(blackoutForm.end).toISOString(), reason: blackoutForm.reason || undefined });
                  setBlackoutForm({ start: "", end: "", reason: "" });
                  toast.success("Blackout added");
                }}
                className="w-full inline-flex items-center justify-center gap-1 text-[12px] rounded-md py-1.5" style={{ background: palette.ink, color: "#fff" }}>
                <Plus className="h-3.5 w-3.5" /> Add blackout
              </button>
            </div>
          </div>
        </aside>
      </div>
    </CalendarShell>
  );
}

function fmt(m: number) { return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`; }
