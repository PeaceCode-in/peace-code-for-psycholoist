import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Segmented, TextField, TextArea, PrimaryButton, GhostButton } from "@/components/settings/primitives";
import { usePersisted } from "@/lib/practice-settings";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/payments")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Payments — Settings" }] }),
  component: PaymentsPage,
});

interface Payments {
  payoutType: "bank" | "upi";
  bankName: string;
  accountLast4: string;
  ifsc: string;
  upiId: string;
  gstin: string;
  pan: string;
  invoiceHeader: string;
  invoiceFooter: string;
  taxRate: string;
  refundPolicy: string;
}

const DEFAULT: Payments = {
  payoutType: "bank",
  bankName: "HDFC Bank",
  accountLast4: "4021",
  ifsc: "HDFC0001234",
  upiId: "clinician@upi",
  gstin: "",
  pan: "",
  invoiceHeader: "Peace & Practice Clinical Psychology",
  invoiceFooter: "Thank you for your continued trust.",
  taxRate: "18",
  refundPolicy: "Full refund for cancellations 24h prior. 50% within 24h. No-shows are billed in full.",
};

const mask = (s: string) => (s ? `•••• ${s.slice(-4)}` : "");

function PaymentsPage() {
  const [p, setP] = usePersisted<Payments>("payments", DEFAULT);

  return (
    <>
      <PageHeader title="Payments" description="Payout account (masked), GST/PAN, invoice template, refund policy." />

      <Section title="Payout account">
        <Row label="Method"
          action={<Segmented value={p.payoutType} onChange={(v) => setP((prev) => ({ ...prev, payoutType: v }))}
            options={[{ value: "bank", label: "Bank" }, { value: "upi", label: "UPI" }]} />} />
        {p.payoutType === "bank" ? (
          <Row label="Bank details" hint={`${p.bankName} · ${mask(p.accountLast4)} · ${p.ifsc || "IFSC pending"}`}>
            <div className="mt-2 grid grid-cols-3 gap-2 max-w-lg">
              <TextField value={p.bankName} onChange={(v) => setP((prev) => ({ ...prev, bankName: v }))} placeholder="Bank" />
              <TextField value={p.accountLast4} onChange={(v) => setP((prev) => ({ ...prev, accountLast4: v.replace(/\D/g, "").slice(0, 4) }))} placeholder="Last 4" />
              <TextField value={p.ifsc} onChange={(v) => setP((prev) => ({ ...prev, ifsc: v.toUpperCase() }))} placeholder="IFSC" />
            </div>
          </Row>
        ) : (
          <Row label="UPI ID" hint={p.upiId}>
            <div className="mt-2 max-w-md"><TextField value={p.upiId} onChange={(v) => setP((prev) => ({ ...prev, upiId: v }))} placeholder="name@upi" /></div>
          </Row>
        )}
        <div className="px-5 pb-4 flex justify-end">
          <PrimaryButton onClick={() => toast.success("Payout account saved", { description: "You'll receive a small verification credit within 24h." })}>Save payout</PrimaryButton>
        </div>
      </Section>

      <Section title="Tax & identity">
        <Row label="GSTIN" hint="Included on invoices ≥ ₹20,000."
          action={<div className="w-56"><TextField value={p.gstin} onChange={(v) => setP((prev) => ({ ...prev, gstin: v.toUpperCase() }))} placeholder="22ABCDE1234F1Z5" /></div>} />
        <Row label="PAN" hint="Used for TDS reconciliation."
          action={<div className="w-56"><TextField value={p.pan} onChange={(v) => setP((prev) => ({ ...prev, pan: v.toUpperCase() }))} placeholder="ABCDE1234F" /></div>} />
        <Row label="Default tax rate" hint="Applied to services unless overridden."
          action={<div className="w-24"><TextField value={p.taxRate} onChange={(v) => setP((prev) => ({ ...prev, taxRate: v.replace(/[^\d.]/g, "") }))} placeholder="18" /></div>} />
      </Section>

      <Section title="Invoice template">
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[11px] mb-1" style={{ color: palette.muted }}>Header</div>
            <TextField value={p.invoiceHeader} onChange={(v) => setP((prev) => ({ ...prev, invoiceHeader: v }))} />
          </div>
          <div>
            <div className="text-[11px] mb-1" style={{ color: palette.muted }}>Footer</div>
            <TextField value={p.invoiceFooter} onChange={(v) => setP((prev) => ({ ...prev, invoiceFooter: v }))} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <GhostButton onClick={() => toast.info("Preview generated", { description: "Open Billing → Invoices to see the applied template." })}>Preview</GhostButton>
            <PrimaryButton onClick={() => toast.success("Invoice template saved")}>Save template</PrimaryButton>
          </div>
        </div>
      </Section>

      <Section title="Refund policy" hint="Shown at checkout and on invoices.">
        <div className="p-4 space-y-3">
          <TextArea value={p.refundPolicy} onChange={(v) => setP((prev) => ({ ...prev, refundPolicy: v }))} rows={4} />
          <div className="flex justify-end"><PrimaryButton onClick={() => toast.success("Refund policy saved")}>Save policy</PrimaryButton></div>
        </div>
      </Section>
    </>
  );
}
