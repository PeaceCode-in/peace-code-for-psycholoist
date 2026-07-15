import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/emergency-protocol")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Emergency protocol — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Emergency protocol" description="On-call escalation contact, helplines, safety plan template, SI/HI response script (private)." />
      <Section title="Emergency protocol" hint="Coming next">
        <Row label="On-call supervisor" hint="Called first when Emergency is triggered" />
        <Row label="Local hospital" hint="Nearest inpatient with psychiatric admissions" />
        <Row label="Helplines" hint="iCall · Vandrevala · KIRAN" />
        <Row label="SI/HI response script" hint="Private notes to self" />
      </Section>
    </>
  ),
});
