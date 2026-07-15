import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/compliance")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Compliance — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Compliance" description="DPDP acknowledgement, consent template editor, HIPAA-adjacent toggles, audit log." />
      <Section title="Compliance" hint="Coming next">
        <Row label="DPDP acknowledgement" hint="Signed and current" />
        <Row label="Consent template editor" hint="Adapt wording per patient cohort" />
        <Row label="International patients" hint="HIPAA-adjacent safeguards" />
        <Row label="Audit log" hint="Every access, edit, export" />
      </Section>
    </>
  ),
});
