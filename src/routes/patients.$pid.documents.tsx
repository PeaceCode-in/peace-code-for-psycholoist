import { createFileRoute } from "@tanstack/react-router";
import { FileText, FileCheck2, FileSignature, Upload, Lock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { Button, Card, EmptyState, SectionLabel, fmtDate } from "@/components/practice/patients/primitives";
import { addDocument, useLiveDocuments, type PatientDocument } from "@/lib/patients-store";

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
  const docs = useLiveDocuments(pid);

  function fakeUpload() {
    const name = prompt("File name (mock upload)");
    if (!name) return;
    addDocument({ patientId: pid, name, kind: "other", sizeKB: Math.round(Math.random() * 400) + 40, sharedWith: [] });
  }

  return (
    <div className="flex flex-col gap-5 pc-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <SectionLabel>Shared documents</SectionLabel>
          <p className="text-[12px]" style={{ color: palette.muted }}>End-to-end document upload arrives with the Sessions module — for now, filenames persist locally.</p>
        </div>
        <Button variant="outline" onClick={fakeUpload}><Upload className="w-4 h-4" /> Upload</Button>
      </div>

      {docs.length === 0 ? (
        <EmptyState title="No documents yet" hint="Intake forms, consent, and prior therapist letters live here." />
      ) : (
        <Card className="p-2">
          <ul className="divide-y" style={{ borderColor: palette.border }}>
            {docs.map((d) => (
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
                  {d.sharedWith.length > 0 ? (
                    <>Shared with {d.sharedWith.length}</>
                  ) : (
                    <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
