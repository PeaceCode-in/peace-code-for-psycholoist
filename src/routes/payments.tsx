import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & invoicing — PeaceCode · Practice" },
      { name: "description", content: "Invoices, receipts, and reconciled payments." },
    ],
  }),
  component: () => <StubPage title="Payments & invoicing" crumb="Payments" blurb="Invoices, receipts, and reconciled payments." />,
});
