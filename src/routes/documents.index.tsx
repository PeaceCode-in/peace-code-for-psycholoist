import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import {
  useTemplates, useInstances, duplicateTemplate, deleteTemplate,
  relTime, retentionRemaining,
  CATEGORY_META,
  type DocCategory, type InstanceStatus,
} from "@/lib/documents-store";
import { StatusPill, CategoryChip, PaperThumbnail, EmptyPaper } from "@/components/practice/documents/primitives";
import { LayoutGrid, List as ListIcon, Plus, Copy, Trash2, FileSignature, Sparkles } from "lucide-react";

export const Route = createFileRoute("/documents/")({
  head: () => ({
    meta: [
      { title: "Documents — PeaceCode · Practice" },
      { name: "description", content: "The practice's paper trail, digitized and dignified." },
    ],
  }),
  component: DocumentsLibrary,
});

const STATUSES: (InstanceStatus | "all")[] = ["all", "draft", "sent", "viewed", "signed", "expired", "voided", "archived"];

function DocumentsLibrary() {
  const templates = useTemplates();
  const instances = useInstances();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [status, setStatus] = useState<InstanceStatus | "all">("all");
  const [category, setCategory] = useState<DocCategory | "all">("all");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return instances.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (category !== "all" && i.category !== category) return false;
      if (q && !(`${i.templateName} ${i.patientName}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => (b.sentAt ?? b.createdAt) - (a.sentAt ?? a.createdAt));
  }, [instances, status, category, q]);

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    templates.forEach((t) => { m[t.category] = (m[t.category] ?? 0) + 1; });
    return m;
  }, [templates]);

  return (
    <AppShell crumb="Documents">
      <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] min-h-0">
        {/* Templates rail */}
        <aside
          className="md:w-[300px] shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto"
          style={{ borderColor: palette.border, background: "#FCF9FA" }}
        >
          <div className="px-5 pt-6 pb-4">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink, lineHeight: 1.1 }}>Documents</div>
            <div className="mt-1 uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
              the practice's paper trail
            </div>
          </div>

          <div className="px-4 pb-3 space-y-2">
            <Link to="/documents/new" className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-white text-[13px]"
              style={{ background: palette.primary }}>
              <Plus className="w-4 h-4" /> Send a document
            </Link>
            <Link to="/documents/worksheets" className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-[13px]"
              style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>
              <Sparkles className="w-4 h-4" /> Clinical worksheets
            </Link>
          </div>

          <div className="px-5 pt-3 pb-2 flex items-baseline justify-between">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, color: palette.ink }}>Templates</div>
            <span className="text-[10.5px] tabular-nums" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>{templates.length}</span>
          </div>
          <div className="px-2 pb-6 space-y-0.5">
            {(Object.keys(CATEGORY_META) as DocCategory[]).map((cat) => {
              const items = templates.filter((t) => t.category === cat);
              if (items.length === 0) return null;
              return (
                <details key={cat} open className="group">
                  <summary
                    className="cursor-pointer list-none px-3 py-1.5 flex items-center justify-between rounded-md hover:bg-white/60"
                    style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase" }}
                  >
                    <span>{CATEGORY_META[cat].label}</span>
                    <span className="tabular-nums opacity-70">{items.length}</span>
                  </summary>
                  <div className="mt-0.5">
                    {items.map((t) => (
                      <Link key={t.id} to="/documents/templates/$id/edit" params={{ id: t.id }}
                        className="group/row flex items-center justify-between pl-6 pr-2 py-1.5 rounded-md hover:bg-white/70"
                        style={{ color: palette.ink }}>
                        <span className="text-[12.5px] truncate" style={{ fontFamily: "'Fraunces', serif" }}>{t.name}</span>
                        <span className="opacity-0 group-hover/row:opacity-100 flex items-center gap-1">
                          <button
                            onClick={(e) => { e.preventDefault(); const c = duplicateTemplate(t.id); if (c) navigate({ to: "/documents/templates/$id/edit", params: { id: c.id } }); }}
                            className="p-1 rounded" style={{ color: palette.muted }} title="Duplicate">
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); if (confirm(`Delete template "${t.name}"?`)) deleteTemplate(t.id); }}
                            className="p-1 rounded" style={{ color: palette.muted }} title="Delete">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      </Link>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </aside>

        {/* Main pane: sent & signed */}
        <section className="flex-1 min-w-0 flex flex-col" style={{ background: "#fff" }}>
          <div className="px-6 pt-5 pb-3 border-b" style={{ borderColor: palette.border }}>
            <div className="flex items-baseline justify-between">
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: palette.ink }}>Sent &amp; signed</div>
                <div className="uppercase mt-0.5" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 9.5, letterSpacing: "0.16em", color: palette.muted }}>
                  {filtered.length} of {instances.length} — {catCounts.consent ?? 0} consents, {catCounts.intake ?? 0} intakes on file
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
                <button onClick={() => setView("grid")}
                  className="h-7 w-7 rounded-md flex items-center justify-center"
                  style={{ background: view === "grid" ? "#fff" : "transparent", color: view === "grid" ? palette.ink : palette.muted }}
                  aria-label="Grid view"><LayoutGrid className="w-3.5 h-3.5" /></button>
                <button onClick={() => setView("list")}
                  className="h-7 w-7 rounded-md flex items-center justify-center"
                  style={{ background: view === "list" ? "#fff" : "transparent", color: view === "list" ? palette.ink : palette.muted }}
                  aria-label="List view"><ListIcon className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search by patient or template…"
                className="h-8 px-3 rounded-full text-[12px] outline-none min-w-[220px]"
                style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}
              />
              <select value={category} onChange={(e) => setCategory(e.target.value as DocCategory | "all")}
                className="h-8 px-2 rounded-full text-[12px]"
                style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}>
                <option value="all">All categories</option>
                {(Object.keys(CATEGORY_META) as DocCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
              </select>
              <div className="flex items-center gap-1 ml-auto">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => setStatus(s)}
                    className="h-7 px-2.5 rounded-full text-[10.5px] uppercase tracking-[0.14em] transition-colors"
                    style={{
                      background: status === s ? palette.ink : "transparent",
                      color: status === s ? "#fff" : palette.muted,
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {filtered.length === 0 ? (
              <EmptyPaper title="No documents match." hint="Try clearing filters, or send your first document." />
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filtered.map((i) => (
                  <Link key={i.id} to="/documents/$id" params={{ id: i.id }} className="block group">
                    <PaperThumbnail category={i.category} title={i.templateName} subtitle={i.patientName}>
                      <div className="flex items-center justify-between pl-6 pr-2">
                        <StatusPill status={i.status} />
                        <span className="text-[10px] tabular-nums" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>
                          {relTime(i.sentAt ?? i.createdAt)}
                        </span>
                      </div>
                    </PaperThumbnail>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr style={{ background: "#FCF9FA" }}>
                      <Th>Document</Th>
                      <Th>Patient</Th>
                      <Th>Category</Th>
                      <Th>Status</Th>
                      <Th>Sent</Th>
                      <Th>Retention</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => {
                      const tpl = templates.find((t) => t.id === i.templateId);
                      const retention = tpl ? retentionRemaining(i.createdAt, tpl.retentionDays) : "—";
                      return (
                        <tr key={i.id} className="border-t hover:bg-black/[0.015]" style={{ borderColor: palette.border }}>
                          <Td>
                            <Link to="/documents/$id" params={{ id: i.id }} className="hover:underline" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
                              {i.templateName}
                              {i.version > 1 && <span className="ml-1 text-[10px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>v{i.version}</span>}
                            </Link>
                          </Td>
                          <Td><span style={{ color: palette.ink }}>{i.patientName}</span></Td>
                          <Td><CategoryChip category={i.category} /></Td>
                          <Td><StatusPill status={i.status} /></Td>
                          <Td><Mono>{relTime(i.sentAt ?? i.createdAt)}</Mono></Td>
                          <Td><Mono>{retention}</Mono></Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-2.5 font-normal uppercase tracking-[0.14em]"
    style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, color: palette.muted }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2.5" style={{ color: palette.ink }}>{children}</td>;
}
function Mono({ children }: { children: React.ReactNode }) {
  return <span className="tabular-nums" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted, fontSize: 11 }}>{children}</span>;
}
