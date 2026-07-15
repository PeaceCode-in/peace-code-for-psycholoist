import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLiveAudit, type AuditAction, type AuditEvent, getThread, THERAPIST_NAME } from "@/lib/messages-store";
import { getPatient, listPatients } from "@/lib/patients-store";
import { fmtAuditTime } from "@/components/practice/messages/primitives";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/messages/audit")({
  head: () => ({ meta: [{ title: "Audit Log — Messages · PeaceCode" }] }),
  component: AuditPage,
});

const ACTIONS: Array<AuditAction | "all"> = ["all", "send", "read", "edit", "delete", "download_attachment", "star", "archive", "label_add", "auto_reply_fired"];

function AuditPage() {
  const hydrated = useHydrated();
  const [patientId, setPatientId] = useState<string>("");
  const [action, setAction] = useState<AuditAction | "all">("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const events = useLiveAudit({ patientId: patientId || undefined, action, from: from || undefined, to: to || undefined });
  const patients = useMemo(() => hydrated ? listPatients() : [], [hydrated]);

  const exportCSV = () => {
    const header = "timestamp,actor,role,action,thread_subject,patient,message_id\n";
    const rows = events.map((e) => {
      const t = getThread(e.threadId);
      const p = t ? getPatient(t.patientId) : undefined;
      const actor = e.actorRole === "therapist" ? THERAPIST_NAME : e.actorRole === "system" ? "system" : (p?.fullName ?? "patient");
      return [fmtAuditTime(e.at), actor, e.actorRole, e.action, `"${(t?.subject ?? "").replace(/"/g, '""')}"`, p?.fullName ?? "", e.messageId ?? ""].join(",");
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `messages-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="min-h-[calc(100dvh-32px)] p-6" style={{ background: palette.surface2 }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link to="/messages" className="flex items-center gap-1.5 text-[12px]" style={{ color: palette.muted }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Inbox
              </Link>
              <h1 className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", color: palette.ink }}>Audit log</h1>
              <p className="mt-1" style={{ fontSize: "12px", color: palette.muted }}>Every message event — send, read, edit, delete, download.</p>
            </div>
            <button onClick={exportCSV} className="h-8 px-3 rounded-full text-[12px] flex items-center gap-1.5" style={{ background: palette.ink, color: "#fff" }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          <div className="rounded-2xl p-3 mb-4 flex flex-wrap gap-3 items-end" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
            <div>
              <label className="block text-[10px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>PATIENT</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="h-8 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontSize: "12px", minWidth: "180px" }}>
                <option value="">All patients</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>ACTION</label>
              <select value={action} onChange={(e) => setAction(e.target.value as AuditAction | "all")} className="h-8 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontSize: "12px" }}>
                {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>FROM</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontSize: "12px" }} />
            </div>
            <div>
              <label className="block text-[10px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>TO</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontSize: "12px" }} />
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
            <div className="grid grid-cols-[190px_140px_120px_1fr] gap-4 px-4 py-2 text-[10px]" style={{ background: palette.surface2, color: palette.muted, fontFamily: "'DM Mono', monospace" }}>
              <span>TIMESTAMP</span><span>ACTOR</span><span>ACTION</span><span>TARGET</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {events.length === 0 && (
                <div className="p-8 text-center" style={{ color: palette.muted, fontSize: "13px" }}>No matching events.</div>
              )}
              {events.map((e) => <AuditRow key={e.id} event={e} />)}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AuditRow({ event }: { event: AuditEvent }) {
  const t = getThread(event.threadId);
  const p = t ? getPatient(t.patientId) : undefined;
  const actor = event.actorRole === "therapist" ? THERAPIST_NAME : event.actorRole === "system" ? "system" : (p?.fullName ?? "patient");
  return (
    <div className="grid grid-cols-[190px_140px_120px_1fr] gap-4 px-4 py-2 border-t items-center" style={{ borderColor: palette.border }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.muted }}>{fmtAuditTime(event.at)}</span>
      <span className="flex items-center gap-1.5" style={{ fontSize: "12px", color: palette.ink }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: event.actorRole === "therapist" ? palette.primary : event.actorRole === "system" ? palette.muted : "#8B7DAA" }} />
        {actor}
      </span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.ink }}>{event.action}</span>
      <div className="min-w-0">
        {t ? (
          <Link to="/messages/$threadId" params={{ threadId: t.id }} className="hover:underline" style={{ fontSize: "12px", color: palette.ink }}>
            "{t.subject}" · <span style={{ color: palette.muted }}>{p?.fullName ?? "patient"}</span>
          </Link>
        ) : (
          <span style={{ fontSize: "12px", color: palette.muted }}>thread removed</span>
        )}
      </div>
    </div>
  );
}
