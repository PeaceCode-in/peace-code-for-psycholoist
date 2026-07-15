import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/delete")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Deactivate or delete — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Deactivate or delete" description="Deactivate practice or delete account with 30-day grace and patient transfer flow." />
      <Section title="Deactivate or delete" hint="Coming next">
        <Row label="Deactivate practice" hint="Pause bookings without deleting data" />
        <Row label="Delete account" hint="30-day grace · patient transfer required" />
      </Section>
    </>
  ),
});
