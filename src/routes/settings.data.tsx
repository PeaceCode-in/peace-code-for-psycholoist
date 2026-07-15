import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/data")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Data & export — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Data & export" description="Export patient records, full practice export, retention window, scheduled backups." />
      <Section title="Data & export" hint="Coming next">
        <Row label="Export patient records" hint="PDF or CSV per patient" />
        <Row label="Full practice export" hint="JSON — all data" />
        <Row label="Retention window" hint="Default 7 years per RCI" />
        <Row label="Scheduled backups" hint="Weekly encrypted snapshot" />
      </Section>
    </>
  ),
});
