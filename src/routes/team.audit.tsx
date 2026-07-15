import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, InlineButton, EmptyState } from "@/components/practice/team/primitives";
import { useAudit, useMembers, useMe } from "@/lib/team-store";
import { ScrollText, Download, Search } from "lucide-react";

export const Route = createFileRoute("/team/audit")({
  head: () => ({ meta: [{ title: "Audit trail — Team" }] }),
  component: AuditPage,
});

function AuditPage() {
  const audit = useAudit();
  const members = useMembers();
  const me = useMe();
  const canView = me.role === "owner" || me.role === "supervisor";
  const [q, setQ] = useState("");
  const [actor, setActor] = useState<string>("");
  const [action, setAction] = useState<string>("");

  const actions = useMemo(() => Array.from(new Set(audit.map((a) => a.action))).sort(), [audit]);

  const filtered = useMemo(() => {
    return audit.filter((a) => {
      if (actor && a.actorId !== actor) return false;
      if (action && a.action !== action) return false;
      if (q) {
        const s = `${a.actorLabel} ${a.action} ${a.targetLabel ?? ""} ${a.target ?? ""}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [audit, q, actor, action]);

  const exportCsv = () => {
    const header = "at,actor,action,target,target_label";
    const rows = filtered.map((a) => [
      new Date(a.at).toISOString(),
      escape(a.actorLabel),
      escape(a.action),
      escape(a.target ?? ""),
      escape(a.targetLabel ?? ""),
    ].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `team-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!canView) {
    return (
      <Card className="p-6">
        <EmptyState icon={ScrollText} title="Audit access is restricted" hint="Owners and supervisors can read the audit trail." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        eyebrow="Compliance"
        title="Audit trail"
        hint="Every access, every permission change, every export. Boring on purpose."
        actions={
          <InlineButton tone="ghost" onClick={exportCsv}><Download className="w-3 h-3" /> Export CSV</InlineButton>
        }
      />

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full flex-1 min-w-[220px] max-w-md" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: palette.muted }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search actor, action, target…"
              className="flex-1 bg-transparent outline-none text-[12.5px] min-w-0"
              style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}
            />
          </div>
          <select value={actor} onChange={(e) => setActor(e.target.value)} className="h-9 px-3 rounded-full text-[12px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}>
            <option value="">All actors</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.preferredName ?? m.fullName}</option>)}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="h-9 px-3 rounded-full text-[12px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <option value="">All actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="ml-auto text-[11px] tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{filtered.length} events</div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <thead>
              <tr className="text-left" style={{ color: palette.muted }}>
                <th className="px-4 py-2 font-normal">TIMESTAMP</th>
                <th className="px-4 py-2 font-normal">ACTOR</th>
                <th className="px-4 py-2 font-normal">ACTION</th>
                <th className="px-4 py-2 font-normal">TARGET</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t" style={{ borderColor: palette.border }}>
                  <td className="px-4 py-2 whitespace-nowrap" style={{ color: palette.muted }}>
                    {new Date(a.at).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap" style={{ color: palette.ink }}>{a.actorLabel}</td>
                  <td className="px-4 py-2 whitespace-nowrap" style={{ color: palette.primary }}>{a.action}</td>
                  <td className="px-4 py-2" style={{ color: palette.ink }}>{a.targetLabel ?? a.target ?? "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center" style={{ color: palette.muted }}>
                    Nothing matches those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function escape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
