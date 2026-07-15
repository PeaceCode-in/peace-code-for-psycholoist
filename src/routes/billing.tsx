import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Billing" blurb="Invoices, GST, superbills, patient balances, and payouts to your bank — landing next." />,
});
