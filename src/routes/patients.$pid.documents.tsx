import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, FileCheck2, FileSignature, Upload, Lock, Plus } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { Button, Card, EmptyState, SectionLabel, fmtDate } from "@/components/practice/patients/primitives";
import { addDocument, useLiveDocuments, type PatientDocument } from "@/lib/patients-store";
import { useInstancesForPatient, relTime } from "@/lib/documents-store";
import { StatusPill, CategoryChip } from "@/components/practice/documents/primitives";

export const Route = createFileRoute("/patients/$pid/documents")({
  head: () => ({ meta: [{ title: "Documents — Patient" }, { name: "robots", content: "noindex" }] }),
  component: DocsTab,
});

const KIND_ICON: Record<PatientDocument["kind"], React.ReactNode> = {
  intake: <FileText className="w-4 h-4" />,
  consent: <FileSignature className="w-4 h-4" />,
  letter: <FileCheck2 className="w-4 h-4" />,
  report: <FileText className="w-4 h-4" />,
  other: <FileText className="w-4 h-4" />,
};

function DocsTab() {
  const { pid } = Route.useParams();
  const legacyDocs = useLiveDocuments(pid);
  const instances = useInstancesForPatient(pid);
  const unread = instances.filter((i) => i.status === "sent" || i.status === "viewed").length;

  function fakeUpload() {
    const name = prompt("File name (mock upload)");
    if (!name) return;
    addDocument({ patientId: pid, name, kind: "other", sizeKB: Math.round(Math.random() * 400) + 40, sharedWith: [] });
  }

  return (
    <div className="flex flex-col gap-6 pc-fade-in">
      {/* Dispatched documents (new module) */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <SectionLabel>Sent from library</SectionLabel>
            <p className="text-[12px]" style={{ color: palette.muted }}>
              Templates dispatched to this patient. {unread > 0 && <span style={{ color: palette.primary }}>{unread} awaiting signature.</span>}
            </p>
          </div>
          <Link to="/documents/new" search={{ patient: pid } as never} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] text-white"
            style={{ background: palette.primary }}>
            <Plus className="w-3.5 h-3.5" /> Send a template
          </Link>
        </div>

        {instances.length === 0 ? (
          <Card className="p-6"><EmptyState title="Nothing sent yet" hint="Choose a template and send it from here." /></Card>
        ) : (
          <Card className="p-2">
            <ul className="divide-y" style={{ borderColor: palette.border }}>
              {instances.map((i) => (
                <li key={i.id} className="p-3.5 flex items-center gap-3 rounded-xl hover:bg-[color:var(--pc-surface2,#F6F1F2)] transition-colors">
                  <Link to="/documents/$id" params={{ id: i.id }} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0"
                      style={{ background: palette.surface2, color: palette.primary, border: `1px solid ${palette.border}` }}>
                      <FileSignature className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] truncate" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{i.templateName}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: palette.muted }}>
                        sent {relTime(i.sentAt ?? i.createdAt)}
                        {i.version > 1 && <> · v{i.version}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CategoryChip category={i.category} />
                      <StatusPill status={i.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Legacy uploads */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <SectionLabel>Uploaded files</SectionLabel>
            <p className="text-[12px]" style={{ color: palette.muted }}>Photo IDs, prior therapist letters, and other artefacts.</p>
          </div>
          <Button variant="outline" onClick={fakeUpload}><Upload className="w-4 h-4" /> Upload</Button>
        </div>

        {legacyDocs.length === 0 ? (
          <Card className="p-6"><EmptyState title="No uploads yet" hint="Any file the patient shares with you appears here." /></Card>
        ) : (
          <Card className="p-2">
            <ul className="divide-y" style={{ borderColor: palette.border }}>
              {legacyDocs.map((d) => (
                <li key={d.id} className="p-4 flex items-center gap-4 hover:bg-[color:var(--pc-surface2,#F6F1F2)] rounded-xl transition-colors duration-150">
                  <div className="w-10 h-10 rounded-xl inline-flex items-center justify-center shrink-0" style={{ background: palette.surface2, color: palette.primary, border: `1px solid ${palette.border}` }}>
                    {KIND_ICON[d.kind]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] truncate" style={{ color: palette.ink }}>{d.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: palette.muted }}>
                      {d.kind} · {d.sizeKB} KB · uploaded {fmtDate(d.uploadedAt)}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-[10.5px]" style={{ color: palette.muted }}>
                    {d.sharedWith.length > 0 ? <>Shared with {d.sharedWith.length}</> : <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
