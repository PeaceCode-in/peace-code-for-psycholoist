import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Users, ListChecks, AlertTriangle, Eye } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveAssignments, complianceForPatient, type AssignmentStatus } from "@/lib/homework-store";
import { getPatient, listPatients } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/homework/")({
  component: HomeworkIndex,
});

const STATUS_META: Record<AssignmentStatus, { label: string; bg: string; fg: string }> = {
  assigned:    { label: "Assigned",  bg: "#EFE4F0", fg: "#5F3F60" },
  in_progress: { label: "In progress", bg: "#F1E9DA", fg: "#7A5A18" },
  completed:   { label: "Completed", bg: "#E4EFE0", fg: "#3E6A2E" },
  missed:      { label: "Missed",    bg: "#F6DCE3", fg: "#8A2E4E" },
  reviewed:    { label: "Reviewed",  bg: "#E7ECEF", fg: "#324357" },
};

function HomeworkIndex() {
  const hydrated = useHydrated();
  const list = useLiveAssignments();
  const [view, setView] = useState<"patient" | "assignment">("patient");
  const [filter, setFilter] = useState<"all" | "active" | "overdue" | "review" | "completed">("all");

  const filtered = useMemo(() => {
    return list.filter((a) => {
      if (filter === "active") return a.status === "assigned" || a.status === "in_progress";
      if (filter === "overdue") return a.status === "missed";
      if (filter === "review") return a.status === "completed";
      if (filter === "completed") return a.status === "completed" || a.status === "reviewed";
      return true;
    });
  }, [list, filter]);

  const counts = useMemo(() => ({
    all: list.length,
    active: list.filter((a) => a.status === "assigned" || a.status === "in_progress").length,
    overdue: list.filter((a) => a.status === "missed").length,
    review: list.filter((a) => a.status === "completed").length,
    completed: list.filter((a) => a.status === "completed" || a.status === "reviewed").length,
  }), [list]);

  const byPatient = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const a of filtered) {
      if (!groups.has(a.patientId)) groups.set(a.patientId, []);
      groups.get(a.patientId)!.push(a);
    }
    return Array.from(groups.entries()).sort(([, aArr], [, bArr]) => {
      const aNext = Math.min(...aArr.map((x) => x.dueAt));
      const bNext = Math.min(...bArr.map((x) => x.dueAt));
      return aNext - bNext;
    });
  }, [filtered]);

  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>Loading homework…</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
          <ViewPill on={view === "patient"} onClick={() => setView("patient")} icon={<Users className="h-3.5 w-3.5" />} label="By patient" />
          <ViewPill on={view === "assignment"} onClick={() => setView("assignment")} icon={<ListChecks className="h-3.5 w-3.5" />} label="By assignment" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { k: "all", label: `All · ${counts.all}` },
            { k: "active", label: `Active · ${counts.active}` },
            { k: "overdue", label: `Overdue · ${counts.overdue}` },
            { k: "review", label: `Awaiting review · ${counts.review}` },
            { k: "completed", label: `Completed · ${counts.completed}` },
          ].map((c) => {
            const on = filter === c.k;
            return (
              <button key={c.k} onClick={() => setFilter(c.k as typeof filter)}
                className="h-8 px-3 rounded-full border text-[11.5px]"
                style={{ borderColor: palette.border, background: on ? palette.ink : "rgba(255,255,255,0.7)", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {c.label}
              </button>
            );
          })}
        </div>
        <Link to="/homework/assign" className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> Assign
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : view === "patient" ? (
        <div className="grid gap-3">
          {byPatient.map(([pid, items]) => <PatientRow key={pid} pid={pid} items={items} />)}
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((a) => <AssignmentRow key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
      <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Nothing assigned yet. Change usually starts between sessions.</p>
      <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>Assign something from the library.</p>
    </div>
  );
}

function ViewPill({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]"
      style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {icon} {label}
    </button>
  );
}

function PatientRow({ pid, items }: { pid: string; items: ReturnType<typeof useLiveAssignments> }) {
  const p = getPatient(pid);
  const comp = complianceForPatient(pid);
  const nextDue = Math.min(...items.map((x) => x.dueAt));
  const active = items.filter((x) => x.status === "assigned" || x.status === "in_progress").length;
  const dueLabel = new Date(nextDue).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return (
    <Link to="/patients/$patientId" params={{ patientId: pid }} className="block rounded-2xl border p-5 hover:shadow-sm transition-shadow" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
      <div className="flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[15.5px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p?.fullName ?? "Unknown"}</span>
            {comp.ghost && <span className="text-[10.5px] inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "#F6DCE3", color: "#8A2E4E" }}><Eye className="h-3 w-3" /> Ghost</span>}
          </div>
          <div className="flex items-center gap-4 text-[11.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <span>{active} active</span>
            <span>·</span>
            <span>{comp.rate}% completion</span>
            <span>·</span>
            <span>next due {dueLabel}</span>
            {comp.streak > 2 && <><span>·</span><span>streak {comp.streak}</span></>}
          </div>
        </div>
        <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[280px] justify-end">
          {items.slice(0, 3).map((a) => (
            <span key={a.id} className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: STATUS_META[a.status].bg, color: STATUS_META[a.status].fg, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              {a.templateSnapshot.name}
            </span>
          ))}
          {items.length > 3 && <span className="text-[10.5px] text-muted" style={{ color: palette.muted }}>+{items.length - 3}</span>}
        </div>
      </div>
    </Link>
  );
}

function AssignmentRow({ a }: { a: ReturnType<typeof useLiveAssignments>[number] }) {
  const p = getPatient(a.patientId);
  const meta = STATUS_META[a.status];
  const overdue = a.status === "missed";
  return (
    <Link to="/homework/$hid" params={{ hid: a.id }} className="block rounded-2xl border p-4 hover:shadow-sm transition-shadow" style={{ borderColor: overdue ? "#B0567A" : palette.border, background: "rgba(255,255,255,0.7)" }}>
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <span>{a.templateSnapshot.modality}</span>
            <span>·</span>
            <span>due {new Date(a.dueAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
            {overdue && <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "#B0567A" }}><AlertTriangle className="h-3 w-3" /> overdue</span>}
          </div>
          <div className="text-[14.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{a.templateSnapshot.name}</div>
          <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted }}>{p?.fullName ?? "Unknown"} · {a.submissions.length} submission{a.submissions.length === 1 ? "" : "s"}</div>
        </div>
        <span className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.fg, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
      </div>
    </Link>
  );
}
