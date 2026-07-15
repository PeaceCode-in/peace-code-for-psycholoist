import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/about")({
  component: () => (
    <>
      <PageHeader title="About" description="Version and legal." />
      <Section title="App">
        <Row label="Product" hint="PeaceCode · Practice — clinical dashboard for verified psychologists" />
        <Row label="Version" hint="0.1.0 · early access" />
      </Section>
      <Section title="Legal">
        <Row label="Terms of service" />
        <Row label="Privacy policy" />
        <Row label="Data processing addendum" hint="For institutions and hospitals" />
      </Section>
    </>
  ),
});
