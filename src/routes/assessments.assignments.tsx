import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreVertical, X, Send, RefreshCcw, Ban } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveAssignments, useLiveInstruments, updateAssignment, revokeAssignment,
  createAssignment, type AssessmentAssignment,
} from "@/lib/assessments-store";
import { getPatient, listPatients, avatarUrl } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/assessments/assignments")({
  head: () => ({ meta: [{ title: "Assignments — PeaceCode" }] }),
  component: AssignmentsPage,
});

function relDue(dueAt?: string): { label: string; overdue: boolean } {
  if (!dueAt) return { label: "No due date", overdue: false };
  const diffMs = new Date(dueAt).getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  if (days < 0) return { label: `overdue ${-days}d`, overdue: true };
  if (days === 0) return { label: "due today", overdue: false };
  if (days === 1) return { label: "in 1 day", overdue: false };
  return { label: `in ${days} days`, overdue: false };
}

function AssignmentsPage() {
  const hydrated = useHydrated();
  const assignments = useLiveAssignments();
  const instruments = useLiveInstruments();
  const [tab, setTab] = useState<"due" | "completed">("due");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState(false);

  const rows = useMemo(() => {
    if (tab === "due") return assignments.filter((a) => a.status === "pending" || a.status === "in_progress");
    return assignments.filter((a) => a.status === "completed");
  }, [assignments, tab]);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      <header className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Inbox</p>
          <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Assignments</h1>
        </div>
        <button onClick={() => setAssignOpen(true)} className="text-[12px] px-4 h-10 rounded-full" style={{ background: palette.ink, color: "#fff" }}>
          Assign new
        </button>
      </header>

      <div className="flex items-center gap-2 mb-4">
        {(["due", "completed"] as const).map((k) => {
          const active = tab === k;
          const count = assignments.filter((a) => k === "due" ? (a.status === "pending" || a.status === "in_progress") : a.status === "completed").length;
          return (
            <button key={k} onClick={() => setTab(k)} className="text-[12px] px-3.5 py-1.5 rounded-full transition-colors"
              style={{ background: active ? palette.ink : "rgba(255,255,255,0.6)", color: active ? "#fff" : palette.muted, border: `1px solid ${active ? palette.ink : palette.border}` }}>
              {k === "due" ? "Due" : "Completed"} <span className="tabular-nums opacity-70 ml-1">{count}</span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="rounded-2xl border p-3 mb-3 flex items-center gap-2 animate-in fade-in duration-150" style={{ background: palette.glassStrong, borderColor: "rgba(255,255,255,0.6)" }}>
          <span className="text-[12px]" style={{ color: palette.ink }}>{selected.size} selected</span>
          <span className="flex-1" />
          <button onClick={() => { toast("Reminder sent"); setSelected(new Set()); }} className="text-[11.5px] px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{ background: palette.primary, color: "#fff" }}>
            <Send className="w-3 h-3" /> Send reminder
          </button>
          <button onClick={() => { toast("Reassignment queued"); setSelected(new Set()); }} className="text-[11.5px] px-3 py-1.5 rounded-full border inline-flex items-center gap-1" style={{ borderColor: palette.border, color: palette.ink }}>
            <RefreshCcw className="w-3 h-3" /> Reassign
          </button>
        </div>
      )}

      <ol className="space-y-2">
        {rows.map((a) => (
          <Row key={a.id} assignment={a} selected={selected.has(a.id)}
            onToggle={() => setSelected((prev) => { const n = new Set(prev); n.has(a.id) ? n.delete(a.id) : n.add(a.id); return n; })} />
        ))}
        {rows.length === 0 && (
          <li className="rounded-3xl border p-10 text-center" style={{ background: palette.glass, borderColor: "rgba(255,255,255,0.55)" }}>
            <p className="text-[13px]" style={{ color: palette.muted }}>{tab === "due" ? "Nothing pending." : "No completed assignments yet."}</p>
          </li>
        )}
      </ol>

      {assignOpen && <AssignDrawer instruments={instruments} onClose={() => setAssignOpen(false)} />}
    </div>
  );
}

function Row({ assignment: a, selected, onToggle }: { assignment: AssessmentAssignment; selected: boolean; onToggle: () => void }) {
  const patient = getPatient(a.patientId);
  const due = relDue(a.dueAt);
  const [menu, setMenu] = useState(false);
  return (
    <li>
      <div className="rounded-2xl border h-[72px] px-4 flex items-center gap-4 transition-colors" style={{ background: palette.glass, borderColor: selected ? "rgba(176,86,122,0.5)" : "rgba(255,255,255,0.55)" }}>
        <input type="checkbox" checked={selected} onChange={onToggle} className="accent-[#B0567A]" />
        <img src={avatarUrl(patient?.id ?? a.patientId)} alt="" className="w-9 h-9 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium truncate" style={{ color: palette.ink }}>{patient?.fullName ?? "—"}</div>
          <div className="text-[11px]" style={{ color: palette.muted }}>{patient?.primaryConcern?.split(",")[0]}</div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: palette.soft, color: palette.ink }}>{a.instrumentId.toUpperCase()}</span>
          <span className="text-[11px]" style={{ color: due.overdue ? "#8A2C3E" : palette.muted }}>{due.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>{a.status.replace("_", " ")}</span>
          {a.status !== "completed" && (
            <Link to="/assessments/take/$assignmentId" params={{ assignmentId: a.id }} className="text-[10.5px] px-2.5 py-1 rounded-full" style={{ background: palette.ink, color: "#fff" }}>Take</Link>
          )}
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)} className="p-1 rounded-full" style={{ color: palette.muted }}><MoreVertical className="w-3.5 h-3.5" /></button>
            {menu && (
              <div className="absolute right-0 top-8 rounded-xl border py-1 z-10 min-w-[160px]" style={{ background: palette.solid, borderColor: palette.border, boxShadow: "0 8px 20px -8px rgba(30,20,24,0.15)" }}>
                <MenuItem onClick={() => { toast("Reminder sent"); setMenu(false); }}>Send reminder</MenuItem>
                <MenuItem onClick={() => { updateAssignment(a.id, { dueAt: new Date(Date.now() + 7 * 86_400_000).toISOString() }); toast("Rescheduled +7d"); setMenu(false); }}>Reschedule</MenuItem>
                <MenuItem onClick={() => { revokeAssignment(a.id); toast("Assignment revoked"); setMenu(false); }} danger><Ban className="w-3 h-3" /> Revoke</MenuItem>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function MenuItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-1.5 text-[11.5px] hover:bg-black/[0.03] transition-colors inline-flex items-center gap-1.5" style={{ color: danger ? "#8A2C3E" : palette.ink }}>
      {children}
    </button>
  );
}

// ── Assign drawer ──
function AssignDrawer({ instruments, onClose }: { instruments: ReturnType<typeof useLiveInstruments>; onClose: () => void }) {
  const patients = listPatients({ status: "active" });
  const [patientId, setPatientId] = useState<string>(patients[0]?.id ?? "");
  const [instrumentId, setInstrumentId] = useState<string>(instruments[0]?.id ?? "");
  const [cadence, setCadence] = useState<"once" | "weekly" | "biweekly" | "monthly">("biweekly");
  const [dueAt, setDueAt] = useState<string>(() => new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10));

  function save() {
    if (!patientId || !instrumentId) return;
    createAssignment({ patientId, instrumentId, cadence, dueAt: new Date(dueAt).toISOString() });
    const inst = instruments.find((i) => i.id === instrumentId);
    const pat = getPatient(patientId);
    toast.success(`${inst?.name} assigned to ${pat?.preferredName ?? pat?.fullName}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(30,20,24,0.4)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-md p-4 animate-in slide-in-from-right duration-200">
        <div className="h-full rounded-3xl border p-6 flex flex-col" style={{ background: palette.glassStrong, borderColor: "rgba(255,255,255,0.6)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Assign an instrument</h2>
            <button onClick={onClose}><X className="w-4 h-4" style={{ color: palette.muted }} /></button>
          </div>

          <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Patient</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="mt-1 mb-4 h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none" style={{ borderColor: palette.border, color: palette.ink }}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
          </select>

          <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Instrument</label>
          <select value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)} className="mt-1 mb-4 h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none" style={{ borderColor: palette.border, color: palette.ink }}>
            {instruments.map((i) => <option key={i.id} value={i.id}>{i.name} · {i.fullName}</option>)}
          </select>

          <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Cadence</label>
          <div className="mt-1 mb-4 flex flex-wrap gap-1.5">
            {(["once", "weekly", "biweekly", "monthly"] as const).map((c) => {
              const active = cadence === c;
              return (
                <button key={c} onClick={() => setCadence(c)} className="text-[11px] px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: active ? palette.ink : "rgba(255,255,255,0.6)", color: active ? "#fff" : palette.muted, border: `1px solid ${active ? palette.ink : palette.border}` }}>
                  {c}
                </button>
              );
            })}
          </div>

          <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Due date</label>
          <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="mt-1 h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none" style={{ borderColor: palette.border, color: palette.ink }} />

          <div className="mt-auto pt-6 flex justify-end gap-2">
            <button onClick={onClose} className="text-[12px] px-4 h-10 rounded-full" style={{ color: palette.ink }}>Cancel</button>
            <button onClick={save} className="text-[12px] px-5 h-10 rounded-full" style={{ background: palette.primary, color: "#fff" }}>Assign</button>
          </div>
        </div>
      </div>
    </div>
  );
}
