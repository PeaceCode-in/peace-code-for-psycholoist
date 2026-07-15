import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row } from "@/components/settings/primitives";

export const Route = createFileRoute("/settings/payments")({
  head: () => ({ meta: [{ title: "Payments — Settings" }] }),
  component: () => (
    <>
      <PageHeader title="Payments" description="Payout account (masked), GST/PAN, invoice template, refund policy." />
      <Section title="Payments" hint="Coming next">
        <Row label="Payout account" hint="Bank or UPI" />
        <Row label="GSTIN & PAN" hint="For invoicing and TDS" />
        <Row label="Invoice template" hint="Header, footer, tax lines" />
        <Row label="Refund policy" hint="Shown at checkout" />
      </Section>
    </>
  ),
});
