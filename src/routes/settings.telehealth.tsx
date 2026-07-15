import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/telehealth")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Telehealth — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Telehealth" description="Video provider, waiting room copy, recording defaults." />
      <Section title="Telehealth" hint="Coming next">
        <Row label="Video provider" hint="Built-in · Zoom · Google Meet" />
        <Row label="Waiting room message" hint="Shown to patients before you join" />
        <Row label="Recording default" hint="Off — per-session consent required" />
      </Section>
    </>
  ),
});
