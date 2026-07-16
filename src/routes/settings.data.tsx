import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Toggle, Segmented, PrimaryButton, GhostButton } from "@/components/settings/primitives";
import { usePersisted, downloadFile } from "@/lib/practice-settings";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/data")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Data & export — Settings" }] }),
  component: DataPage,
});

interface DataPrefs {
  retentionYears: "5" | "7" | "10";
  backupsEnabled: boolean;
  backupCadence: "weekly" | "monthly";
  lastBackup: string | null;
}
const DEFAULT: DataPrefs = { retentionYears: "7", backupsEnabled: true, backupCadence: "weekly", lastBackup: null };

function DataPage() {
  const [d, setD] = usePersisted<DataPrefs>("data-export", DEFAULT);

  const exportSample = (kind: "csv" | "pdf" | "json") => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (kind === "csv") {
      downloadFile(`patient-records-${stamp}.csv`, "text/csv",
        "patient_id,name,dob,first_seen,sessions,last_note\nP-0001,Aditi Rao,1998-04-12,2024-02-11,18,SOAP-2025-11-04\n");
    } else if (kind === "json") {
      downloadFile(`practice-export-${stamp}.json`, "application/json",
        JSON.stringify({ exportedAt: new Date().toISOString(), patients: 101, sessions: 1874, notes: 1502, redacted: true }, null, 2));
    } else {
      downloadFile(`patient-record-${stamp}.pdf`, "application/pdf",
        "%PDF-1.4\n1 0 obj<< /Type /Catalog >>endobj\ntrailer<<>>\n%%EOF");
    }
    toast.success("Export ready", { description: `Downloaded as ${kind.toUpperCase()}` });
  };

  const runBackup = () => {
    setD((p) => ({ ...p, lastBackup: new Date().toISOString() }));
    toast.success("Snapshot queued", { description: "Encrypted backup will appear in your storage within 5 minutes." });
  };

  return (
    <>
      <PageHeader title="Data & export" description="Export patient records, full practice export, retention window, scheduled backups." />

      <Section title="Exports">
        <Row label="Export patient records" hint="Per-patient CSV or PDF — includes sessions, notes, assessments."
          action={<div className="flex gap-2"><GhostButton onClick={() => exportSample("csv")}>CSV</GhostButton><PrimaryButton onClick={() => exportSample("pdf")}>PDF</PrimaryButton></div>} />
        <Row label="Full practice export" hint="Everything — JSON. Encrypted at rest, redacted for portability."
          action={<PrimaryButton onClick={() => exportSample("json")}>Download JSON</PrimaryButton>} />
      </Section>

      <Section title="Retention">
        <Row label="Retention window" hint="How long records are kept after last activity. RCI recommends 7 years."
          action={<Segmented value={d.retentionYears} onChange={(v) => { setD((p) => ({ ...p, retentionYears: v })); toast.success(`Retention · ${v} years`); }}
            options={[{ value: "5", label: "5y" }, { value: "7", label: "7y" }, { value: "10", label: "10y" }]} />} />
      </Section>

      <Section title="Backups">
        <Row label="Scheduled backups" hint="Encrypted snapshot delivered to your linked storage."
          action={<Toggle checked={d.backupsEnabled} onChange={(v) => { setD((p) => ({ ...p, backupsEnabled: v })); toast.success(`Backups ${v ? "enabled" : "paused"}`); }} />} />
        {d.backupsEnabled && (
          <Row label="Cadence"
            action={<Segmented value={d.backupCadence} onChange={(v) => { setD((p) => ({ ...p, backupCadence: v })); toast.success(`Cadence · ${v}`); }}
              options={[{ value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }]} />} />
        )}
        <Row label="Last snapshot" hint={d.lastBackup ? new Date(d.lastBackup).toLocaleString() : "None yet — run one now."}
          action={<GhostButton onClick={runBackup}>Run backup</GhostButton>} />
        <div className="px-5 pb-4 text-[11px]" style={{ color: palette.muted }}>
          All exports and backups are logged in the audit trail on Compliance.
        </div>
      </Section>
    </>
  );
}
