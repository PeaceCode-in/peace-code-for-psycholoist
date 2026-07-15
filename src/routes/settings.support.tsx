import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/support")({
  head: () => ({ meta: [{ title: "Support — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Support" description="Contact PeaceCode, submit bug, feature request." />
      <Section title="Support" hint="Coming next">
        <Row label="Contact us" hint="support@peacecode.in" />
        <Row label="Submit a bug" hint="We reply within 2 business days" />
        <Row label="Feature request" hint="Vote on the roadmap" />
      </Section>
    </>
  ),
});
