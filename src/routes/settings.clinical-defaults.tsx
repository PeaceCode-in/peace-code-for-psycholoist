import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/clinical-defaults")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Clinical defaults — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Clinical defaults" description="Note format, auto-assigned assessments, treatment plan and homework templates." />
      <Section title="Clinical defaults" hint="Coming next">
        <Row label="Default note format" hint="SOAP · DAP · BIRP · Free" />
        <Row label="Auto-assign after intake" hint="PHQ-9, GAD-7 by default" />
        <Row label="Treatment plan template" hint="Editable — goals, milestones, EBP" />
        <Row label="Homework templates" hint="Reusable packs per modality" />
      </Section>
    </>
  ),
});
