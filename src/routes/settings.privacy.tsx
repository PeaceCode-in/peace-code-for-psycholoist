import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, Toggle } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";

export const Route = createFileRoute("/settings/privacy")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Privacy" description="Data retention and how patient information leaves the platform." />
        <Section title="Data retention">
          <Row label="Retain patient records for (months)" hint="Regulator minimum in India: 7 years (84 months)"><div className="mt-2 max-w-[120px]"><TextField type="number" value={String(s.privacy.dataRetentionMonths)} onChange={(v) => set((p) => ({ ...p, privacy: { ...p.privacy, dataRetentionMonths: Number(v) || 0 } }))} /></div></Row>
          <Row label="Allow patient data export on request" hint="Required under DPDP Act 2023" action={<Toggle checked={s.privacy.patientDataExportOnRequest} onChange={(v) => set((p) => ({ ...p, privacy: { ...p.privacy, patientDataExportOnRequest: v } }))} />} />
        </Section>
        <Section title="Analytics">
          <Row label="Contribute anonymous usage data" hint="Never patient PHI. Helps us improve the app." action={<Toggle checked={s.privacy.anonymousAnalytics} onChange={(v) => set((p) => ({ ...p, privacy: { ...p.privacy, anonymousAnalytics: v } }))} />} />
        </Section>
      </>
    );
  },
});
