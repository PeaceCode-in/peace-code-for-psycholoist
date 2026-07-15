import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/accessibility")({
  head: () => ({ meta: [{ title: "Accessibility — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Accessibility" description="Font size, contrast, reduced motion, screen reader tags." />
      <Section title="Accessibility" hint="Coming next">
        <Row label="Font size" hint="14 – 20 px" />
        <Row label="Contrast" hint="Standard · High" />
        <Row label="Reduced motion" hint="Fewer transitions and parallax" />
        <Row label="Screen reader tags" hint="Verbose labels on data cards" />
      </Section>
    </>
  ),
});
