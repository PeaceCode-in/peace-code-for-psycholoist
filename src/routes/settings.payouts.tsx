import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, Segmented } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";

export const Route = createFileRoute("/settings/payouts")({
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Payouts" description="Where and how you receive session payments." />
        <Section title="Payout method">
          <Row label="Method"><div className="mt-2"><Segmented value={s.payouts.method} onChange={(v) => set((p) => ({ ...p, payouts: { ...p.payouts, method: v } }))} options={[{ value: "bank", label: "Bank transfer" }, { value: "upi", label: "UPI" }]} /></div></Row>
          <Row label="Account holder name"><div className="mt-2 max-w-md"><TextField value={s.payouts.accountName} onChange={(v) => set((p) => ({ ...p, payouts: { ...p.payouts, accountName: v } }))} /></div></Row>
          {s.payouts.method === "bank" ? (
            <>
              <Row label="Account number"><div className="mt-2 max-w-xs"><TextField value={s.payouts.accountNumber} onChange={(v) => set((p) => ({ ...p, payouts: { ...p.payouts, accountNumber: v } }))} /></div></Row>
              <Row label="IFSC"><div className="mt-2 max-w-xs"><TextField value={s.payouts.ifscOrUpi} onChange={(v) => set((p) => ({ ...p, payouts: { ...p.payouts, ifscOrUpi: v } }))} /></div></Row>
            </>
          ) : (
            <Row label="UPI ID"><div className="mt-2 max-w-xs"><TextField value={s.payouts.ifscOrUpi} onChange={(v) => set((p) => ({ ...p, payouts: { ...p.payouts, ifscOrUpi: v } }))} /></div></Row>
          )}
        </Section>
        <Section title="Tax">
          <Row label="PAN"><div className="mt-2 max-w-xs"><TextField value={s.payouts.pan} onChange={(v) => set((p) => ({ ...p, payouts: { ...p.payouts, pan: v } }))} /></div></Row>
          <Row label="GSTIN" hint="Optional"><div className="mt-2 max-w-xs"><TextField value={s.payouts.gstin} onChange={(v) => set((p) => ({ ...p, payouts: { ...p.payouts, gstin: v } }))} /></div></Row>
        </Section>
      </>
    );
  },
});
