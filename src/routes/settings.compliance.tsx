import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Toggle, TextArea, PrimaryButton, GhostButton } from "@/components/settings/primitives";
import { usePersisted, downloadFile } from "@/lib/practice-settings";
import { loadActivity } from "@/lib/settings-store";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/compliance")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Compliance — Settings" }] }),
  component: CompliancePage,
});

interface Compliance {
  dpdpAcknowledgedAt: string | null;
  consentTemplate: string;
  internationalSafeguards: boolean;
  breachContact: string;
}

const DEFAULT: Compliance = {
  dpdpAcknowledgedAt: null,
  consentTemplate:
    "I consent to receive psychological services from [Clinician]. I understand session notes are stored securely and shared only with my explicit permission or as required by law.",
  internationalSafeguards: false,
  breachContact: "dpo@peacecode.in",
};

function CompliancePage() {
  const [c, setC] = usePersisted<Compliance>("compliance", DEFAULT);
  const activity = typeof window !== "undefined" ? loadActivity() : [];

  return (
    <>
      <PageHeader title="Compliance" description="DPDP acknowledgement, consent template editor, HIPAA-adjacent toggles, audit log." />

      <Section title="DPDP acknowledgement" hint="India's Digital Personal Data Protection Act.">
        <Row label={c.dpdpAcknowledgedAt ? "Signed" : "Not yet signed"} hint={c.dpdpAcknowledgedAt ? `Acknowledged ${new Date(c.dpdpAcknowledgedAt).toLocaleString()}` : "Sign once to record acknowledgement."}
          action={c.dpdpAcknowledgedAt
            ? <GhostButton onClick={() => { setC((p) => ({ ...p, dpdpAcknowledgedAt: null })); toast.success("Acknowledgement cleared"); }}>Revoke</GhostButton>
            : <PrimaryButton onClick={() => { setC((p) => ({ ...p, dpdpAcknowledgedAt: new Date().toISOString() })); toast.success("DPDP acknowledgement recorded"); }}>Sign & acknowledge</PrimaryButton>} />
      </Section>

      <Section title="Consent template" hint="Adapt wording per patient cohort — used at intake.">
        <div className="p-4 space-y-3">
          <TextArea value={c.consentTemplate} onChange={(v) => setC((p) => ({ ...p, consentTemplate: v }))} rows={6} />
          <div className="flex items-center justify-end gap-2">
            <GhostButton onClick={() => { setC((p) => ({ ...p, consentTemplate: DEFAULT.consentTemplate })); toast.success("Reset to default"); }}>Reset</GhostButton>
            <PrimaryButton onClick={() => toast.success("Consent template saved")}>Save</PrimaryButton>
          </div>
        </div>
      </Section>

      <Section title="International patients">
        <Row label="HIPAA-adjacent safeguards" hint="Stricter encryption in transit and audit-only access on records marked international."
          action={<Toggle checked={c.internationalSafeguards} onChange={(v) => { setC((p) => ({ ...p, internationalSafeguards: v })); toast.success(`Safeguards ${v ? "enabled" : "disabled"}`); }} />} />
        <Row label="Breach notification contact" hint="Emailed within 72h of any suspected data event."
          action={
            <input value={c.breachContact} onChange={(e) => setC((p) => ({ ...p, breachContact: e.target.value }))}
              className="text-[13px] px-3 py-2 rounded-xl outline-none"
              style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink, minWidth: 200 }} />
          } />
      </Section>

      <Section title="Audit log" hint="Every setting change, access, and export.">
        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
          {activity.length === 0 && <div className="text-[12px]" style={{ color: palette.muted }}>No activity yet — changes will appear here.</div>}
          {activity.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-[12px]" style={{ color: palette.ink }}>
              <span>{a.label}</span>
              <span className="tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace", fontSize: 10 }}>
                {new Date(a.ts).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="pt-2 flex justify-end">
            <GhostButton onClick={() => { downloadFile(`peacecode-audit-${Date.now()}.csv`, "text/csv", "timestamp,label\n" + activity.map((a) => `${a.ts},"${a.label.replace(/"/g, "'")}"`).join("\n")); toast.success("Audit log exported"); }}>
              Export CSV
            </GhostButton>
          </div>
        </div>
      </Section>
    </>
  );
}
