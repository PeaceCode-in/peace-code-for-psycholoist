import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Repeat } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveBlocks, createBlock, deleteBlock, BLOCK_META, type ScheduleBlock, type BlockKind, type BlockRecurrence } from "@/lib/schedule-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/schedule/recurring")({
  head: () => ({ meta: [{ title: "Recurring blocks — Schedule" }] }),
  component: RecurringPage,
});

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function RecurringPage() {
  const hydrated = useHydrated();
  const blocks = useLiveBlocks();
  const [creating, setCreating] = useState(false);
  if (!hydrated) return null;
  const recurring = blocks.filter((b) => b.recurrence.kind !== "once");
  const oneOffs = blocks.filter((b) => b.recurrence.kind === "once");

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Recurring blocks</h2>
          <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
            Supervision, admin, personal — anything that keeps repeating so your calendar reserves it automatically.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="w-3.5 h-3.5" /> Add block
        </button>
      </div>

      <Section title="Recurring">
        {recurring.length === 0 ? <Empty text="No recurring blocks yet. Add one to reserve regular slots." />
          : recurring.map((b) => <BlockRow key={b.id} b={b} />)}
      </Section>
      <Section title="One-off">
        {oneOffs.length === 0 ? <Empty text="No one-off blocks scheduled." />
          : oneOffs.map((b) => <BlockRow key={b.id} b={b} />)}
      </Section>

      {creating && <CreateModal onDone={() => setCreating(false)} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[10.5px] tracking-[0.14em] uppercase mb-2" style={{ color: palette.muted }}>{title}</div>
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glassStrong }}>
        {children}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="p-6 text-[12px] text-center" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{text}</div>;
}

function BlockRow({ b }: { b: ScheduleBlock }) {
  const m = BLOCK_META[b.kind];
  const start = new Date(b.startsAt);
  const rr = b.recurrence;
  const summary =
    rr.kind === "once" ? `Once · ${start.toLocaleDateString()}`
    : rr.kind === "weekly" ? `${rr.interval === 2 ? "Biweekly" : "Weekly"} · ${rr.days.map((d) => DAY_NAMES[d]).join(", ")}`
    : `Monthly · day ${rr.dayOfMonth}`;
  return (
    <div className="flex items-center gap-3 p-4 border-t first:border-t-0" style={{ borderColor: palette.border }}>
      <div className="w-1 h-8 rounded" style={{ background: m.hex }} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px]" style={{ color: palette.ink }}>{b.title}</div>
        <div className="text-[11px]" style={{ color: palette.muted }}>{m.label} · {b.durationMin}m · {start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {summary}</div>
      </div>
      <button onClick={() => deleteBlock(b.id)} className="h-8 w-8 grid place-items-center rounded-full" style={{ color: palette.muted }}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function CreateModal({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("Supervision");
  const [kind, setKind] = useState<BlockKind>("supervision");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState("17:00");
  const [duration, setDuration] = useState(60);
  const [rrKind, setRrKind] = useState<"once" | "weekly" | "biweekly" | "monthly">("weekly");
  const [days, setDays] = useState<number[]>([3]);

  const toggleDay = (d: number) => setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort());

  const submit = () => {
    const startsAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();
    let recurrence: BlockRecurrence;
    if (rrKind === "once") recurrence = { kind: "once" };
    else if (rrKind === "weekly") recurrence = { kind: "weekly", days, interval: 1 };
    else if (rrKind === "biweekly") recurrence = { kind: "weekly", days, interval: 2 };
    else recurrence = { kind: "monthly", dayOfMonth: new Date(dateStr).getDate() };
    createBlock({ title, kind, startsAt, durationMin: duration, recurrence });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm" onClick={onDone}>
      <div className="bg-white rounded-2xl p-6 w-[460px] max-w-[92vw] border" style={{ borderColor: palette.border }} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[18px] mb-4 flex items-center gap-2" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          <Repeat className="w-4 h-4" /> New block
        </h2>
        <div className="space-y-3">
          <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kind">
              <select value={kind} onChange={(e) => setKind(e.target.value as BlockKind)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }}>
                {Object.entries(BLOCK_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Duration">
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }}>
                {[15, 30, 45, 60, 90, 120].map((n) => <option key={n} value={n}>{n} min</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
            <Field label="Start time"><input type="time" step={900} value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white text-[13px]" style={{ borderColor: palette.border }} /></Field>
          </div>
          <Field label="Repeats">
            <div className="flex gap-1.5">
              {(["once","weekly","biweekly","monthly"] as const).map((k) => (
                <button key={k} onClick={() => setRrKind(k)} className="text-[11px] px-3 py-1.5 rounded-full border capitalize"
                  style={{ borderColor: rrKind === k ? palette.ink : palette.border, background: rrKind === k ? palette.ink : "transparent", color: rrKind === k ? "#fff" : palette.muted }}>{k}</button>
              ))}
            </div>
          </Field>
          {(rrKind === "weekly" || rrKind === "biweekly") && (
            <Field label="Days">
              <div className="flex gap-1">
                {DAY_NAMES.map((n, i) => (
                  <button key={i} onClick={() => toggleDay(i)} className="w-8 h-8 rounded-full text-[11px]"
                    style={{ background: days.includes(i) ? palette.primary : "transparent", color: days.includes(i) ? "#fff" : palette.muted, border: `1px solid ${palette.border}` }}>{n[0]}</button>
                ))}
              </div>
            </Field>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onDone} className="text-[12px] px-3 py-1.5 rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
          <button onClick={submit} className="text-[12px] px-3 py-1.5 rounded-full" style={{ background: palette.ink, color: "#fff" }}>Create</button>
        </div>
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
