import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useWorksheets, useAssignments, assignWorksheet, relTime, type Worksheet } from "@/lib/documents-store";
import { useLivePatients } from "@/lib/patients-store";
import { PaperThumbnail, EmptyPaper } from "@/components/practice/documents/primitives";
import { ArrowLeft, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/documents/worksheets")({
  head: () => ({ meta: [{ title: "Clinical worksheets — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: WorksheetsPage,
});

function WorksheetsPage() {
  const worksheets = useWorksheets();
  const assignments = useAssignments();
  const patients = useLivePatients();
  const [assign, setAssign] = useState<Worksheet | null>(null);
  const [pid, setPid] = useState<string>(patients[0]?.id ?? "");

  return (
    <AppShell crumb="Worksheets">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/documents" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] mb-4"
          style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <ArrowLeft className="w-3 h-3" /> Library
        </Link>
        <div className="flex items-baseline justify-between">
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: palette.ink, lineHeight: 1.1 }}>Clinical worksheets</h1>
            <p className="mt-2 text-[13.5px] max-w-lg" style={{ color: palette.muted }}>
              Between-session work. Lighter than legal documents — no signature, just a completion track that flows back into the patient's timeline.
            </p>
          </div>
          <div className="uppercase text-[10.5px] tracking-[0.18em]"
            style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {worksheets.length} worksheets · {assignments.length} assigned
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {worksheets.map((w) => (
            <button key={w.slug} onClick={() => setAssign(w)} className="text-left group">
              <PaperThumbnail category="worksheet" title={w.name} subtitle={w.intent}>
                <div className="flex items-center justify-between pl-6 pr-2">
                  <span className="uppercase text-[9.5px] tracking-[0.18em]"
                    style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    {w.category} · {w.duration}
                  </span>
                  <span className="text-[11px] group-hover:underline" style={{ color: palette.primary, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                    Assign →
                  </span>
                </div>
              </PaperThumbnail>
            </button>
          ))}
        </div>

        {/* Recent assignments */}
        <div className="mt-12">
          <div className="uppercase text-[10.5px] tracking-[0.18em] mb-3"
            style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            Recent assignments
          </div>
          {assignments.length === 0 ? (
            <EmptyPaper title="No worksheets out yet." hint="Assign one from above." />
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr style={{ background: "#FCF9FA" }}>
                    <Th>Worksheet</Th><Th>Patient</Th><Th>Assigned</Th><Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => {
                    const w = worksheets.find((x) => x.slug === a.worksheetSlug);
                    return (
                      <tr key={a.id} className="border-t" style={{ borderColor: palette.border }}>
                        <Td><span style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{w?.name ?? a.worksheetSlug}</span></Td>
                        <Td>{a.patientName}</Td>
                        <Td><Mono>{relTime(a.assignedAt)}</Mono></Td>
                        <Td>
                          <span className="text-[10.5px] uppercase tracking-[0.14em] px-2 py-[3px] rounded-full"
                            style={{
                              background: a.completedAt ? "#DDEEE2" : "#F5E9D5",
                              color: a.completedAt ? "#3F7A56" : "#8C6C3C",
                              fontFamily: "'DM Mono', ui-monospace, monospace",
                            }}>
                            {a.completedAt ? "completed" : "pending"}
                          </span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {assign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setAssign(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative rounded-2xl w-full max-w-md p-6" style={{ background: palette.solid, border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="uppercase text-[10px] tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  Assign worksheet
                </div>
                <div className="mt-1" style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: palette.ink }}>{assign.name}</div>
                <div className="text-[12.5px] mt-1" style={{ color: palette.muted }}>{assign.intent}</div>
              </div>
              <button onClick={() => setAssign(null)} style={{ color: palette.muted }}><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-5">
              <div className="text-[10.5px] uppercase tracking-[0.16em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Patient</div>
              <select value={pid} onChange={(e) => setPid(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-[13px]"
                style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setAssign(null)} className="h-9 px-3 rounded-full text-[12px]"
                style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>Cancel</button>
              <button onClick={() => {
                const p = patients.find((x) => x.id === pid);
                if (!p) return;
                assignWorksheet(assign.slug, p.id, p.fullName);
                setAssign(null);
              }} className="h-9 px-3 rounded-full text-white text-[12px] flex items-center gap-1.5"
                style={{ background: palette.primary }}>
                <Sparkles className="w-3.5 h-3.5" /> Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-2.5 font-normal uppercase tracking-[0.14em]"
    style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, color: palette.muted }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) { return <td className="px-4 py-2.5" style={{ color: palette.ink }}>{children}</td>; }
function Mono({ children }: { children: React.ReactNode }) { return <span style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>{children}</span>; }
